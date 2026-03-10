/**
 * JamPad Dataset Collector
 *
 * For each jam in jam_themes.json:
 *   1. Fetches jam metadata via Itchy (TasfiqulTapu/Itchy)
 *   2. Fetches results.json (ranked) AND entries.json (full game data) by jamID
 *      - results.json: { results: [ { id, title, rank, criteria, ... } ] }
 *      - entries.json: { jam_games: [ { game: { id, url, title, user, ... }, rating_count, ... } ] }
 *      - Join on game id to get both rank ordering and the actual game page URL
 *   3. Falls back to entries.json only (sorted by rating_count) for non-ranked jams
 *   4. Fetches detailed game data for the top N games via itch-scraper
 *      - N scales with entry count: 10 for small jams, up to 20 for large ones
 *   5. Writes each jam to output/jam_data/<n>.json as it completes (resume-safe)
 *
 * Install dependencies first:
 *   npm install TasfiqulTapu/itchy itch-scraper p-limit@4
 *
 * Usage:
 *   node collect_jam_data.js [--dry-run] [--jam <n>]
 *
 *   --dry-run   Print what would be fetched, don't write output
 *   --jam <n>   Only process the jam with that n value (useful for testing)
 *
 * Resume behaviour:
 *   Each completed jam is written to output/jam_data/<n>.json immediately.
 *   On re-run, any jam whose file already exists is skipped automatically.
 *   Delete a file (or the whole output/jam_data/ folder) to re-process it.
 */

"use strict";

const { getJamData } = require("itchy");
const { getGame }    = require("itch-scraper");
const fs             = require("fs/promises");
const path           = require("path");
const https          = require("https");

// p-limit v4 (CJS-compatible)
const pLimit = require("p-limit").default;

const httpAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });
const fetchOpts = { agent: httpAgent };

// ─── Global rate limiter ──────────────────────────────────────────────────────
// All outbound requests (itch.io fetches + itch-scraper) go through this queue.
// Adjust REQUEST_CONCURRENCY and DELAY_BETWEEN_REQUESTS to tune throughput.

const REQUEST_CONCURRENCY    = 3;   // max simultaneous outbound requests
const DELAY_BETWEEN_REQUESTS = 300; // ms to wait after each request completes
const MAX_RETRIES             = 5;   // number of times to retry on 429
const RETRY_BASE_DELAY        = 10000; // ms — doubles on each retry (exponential backoff)

const requestQueue = pLimit(REQUEST_CONCURRENCY);

/** Wraps fetch() with rate limiting, delay, and exponential backoff on 429. */
async function rateFetch(url, opts = fetchOpts, retries = 0) {
  return requestQueue(async () => {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429) {
        if (retries >= MAX_RETRIES) throw new Error(`429 after ${MAX_RETRIES} retries: ${url}`);
        const delay = RETRY_BASE_DELAY * Math.pow(2, retries);
        console.warn(`  ⏳ 429 on ${url} — waiting ${delay / 1000}s before retry ${retries + 1}/${MAX_RETRIES}`);
        await new Promise((r) => setTimeout(r, delay));
        return rateFetch(url, opts, retries + 1);
      }
      return res;
    } finally {
      // Always pause after a request slot completes, successful or not
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  });
}

/** Wraps getGame() with rate limiting, delay, and exponential backoff on errors. */
async function rateGetGame(url, retries = 0) {
  return requestQueue(async () => {
    try {
      return await getGame(url);
    } catch (err) {
      const is429 = err.message?.includes("429") || err.response?.status === 429;
      if (is429 && retries < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, retries);
        console.warn(`  ⏳ 429 scraping ${url} — waiting ${delay / 1000}s before retry ${retries + 1}/${MAX_RETRIES}`);
        await new Promise((r) => setTimeout(r, delay));
        return rateGetGame(url, retries + 1);
      }
      throw err;
    } finally {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  });
}

// ─── Config ───────────────────────────────────────────────────────────────────

const INPUT_FILE  = "./jam_themes.json";
const OUTPUT_DIR  = "./output/jam_data";   // one file per jam: <n>.json
const MERGED_FILE = "./output/jam_data.json"; // optional merged output at the end

/** How many top games to scrape, based on total entry count. */
function topNForEntryCount(entryCount) {
  if (entryCount >= 1000) return 20;
  if (entryCount >= 500) return 15;
  return 10;
}

// Jam and game concurrency are now governed by REQUEST_CONCURRENCY above.
// These control how many jams are processed concurrently at the processJam level
// (each jam still serialises its own requests through the global queue).
const JAM_CONCURRENCY  = 2;
const GAME_CONCURRENCY = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugFromUrl(url) {
  return url.replace(/\/$/, "").split("/").pop();
}

function jamOutputPath(n) {
  return path.join(OUTPUT_DIR, `${n}.json`);
}

async function jamAlreadyDone(n) {
  try {
    const raw = await fs.readFile(jamOutputPath(n), "utf-8");
    const data = JSON.parse(raw);
    // Consider done only if:
    //  - it was flagged for manual selection (no games expected), OR
    //  - it has at least one game with details present
    if (data.needsManualSelection) return true;
    const games = data.topGames ?? [];
    return games.length > 0 && games.every((g) => g.details !== null && g.details !== undefined);
  } catch {
    return false;
  }
}

async function writeJamResult(result) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(jamOutputPath(result.n), JSON.stringify(result, null, 2), "utf-8");
}

// ─── itch.io fetchers ─────────────────────────────────────────────────────────

async function fetchEntriesMap(jamID) {
  const res = await rateFetch(`https://itch.io/jam/${jamID}/entries.json`);
  if (!res.ok) throw new Error(`entries.json fetch failed (${res.status})`);
  const data = await res.json();
  const map = new Map();
  for (const entry of (data.jam_games ?? [])) {
    if (entry.game?.id != null) map.set(entry.game.id, entry);
  }
  return { map, totalEntries: data.jam_games?.length ?? 0 };
}

async function fetchResults(jamID) {
  const res = await rateFetch(`https://itch.io/jam/${jamID}/results.json`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`results.json fetch failed (${res.status})`);
  const data = await res.json();
  return (data.results ?? []).sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
}

async function fetchTopEntries(jamID) {
  const [resultsRaw, { map: entriesMap, totalEntries }] = await Promise.all([
    fetchResults(jamID),
    fetchEntriesMap(jamID),
  ]);

  const ranked = resultsRaw !== null;

  if (!ranked) {
    return { ranked: false, hasCategories: false, needsManualSelection: true,
             totalEntries, categories: [], topEntries: [] };
  }

  const resultById = new Map();
  for (const result of resultsRaw) {
    const entry = entriesMap.get(result.id) ?? null;
    if (entry?.game?.url) resultById.set(result.id, { resultData: result, entryData: entry });
  }

  const SKIP_CRITERIA = /favourites?|special|host.?pick/i;
  const allCriteria = new Set();
  for (const result of resultsRaw) {
    for (const c of (result.criteria ?? [])) {
      if (!SKIP_CRITERIA.test(c.name) && c.score > 0) allCriteria.add(c.name);
    }
  }

  const categories    = [...allCriteria];
  const hasCategories = categories.length > 1;
  const gameTopCategories = new Map();

  if (hasCategories) {
    for (const categoryName of categories) {
      const sorted = resultsRaw
        .filter((r) => {
          const c = (r.criteria ?? []).find((c) => c.name === categoryName);
          return c && c.score > 0;
        })
        .sort((a, b) => {
          const rA = (a.criteria.find((c) => c.name === categoryName)?.rank) ?? Infinity;
          const rB = (b.criteria.find((c) => c.name === categoryName)?.rank) ?? Infinity;
          return rA - rB;
        });

      for (const result of sorted.slice(0, topNForEntryCount(totalEntries))) {
        if (!resultById.has(result.id)) continue;
        if (!gameTopCategories.has(result.id)) gameTopCategories.set(result.id, new Set());
        gameTopCategories.get(result.id).add(categoryName);
      }
    }
  } else {
    const topN = topNForEntryCount(totalEntries);
    for (const result of resultsRaw.slice(0, topN)) {
      if (!resultById.has(result.id)) continue;
      gameTopCategories.set(result.id, new Set(["overall"]));
    }
  }

  const topEntries = [...gameTopCategories.entries()].map(([gameId, cats]) => {
    const { resultData, entryData } = resultById.get(gameId);
    return {
      gameId,
      gameUrl: entryData.game.url,
      overallRank: resultData.rank ?? null,
      topCategories: [...cats],
      resultData,
      entryData,
    };
  });

  return { ranked, hasCategories, needsManualSelection: false, totalEntries, categories, topEntries };
}

async function fetchGameDetails(gameUrl) {
  try {
    return await rateGetGame(gameUrl);
  } catch (err) {
    console.warn(`  ⚠️  Could not scrape ${gameUrl}: ${err.message}`);
    return null;
  }
}

// ─── Core logic per jam ───────────────────────────────────────────────────────

async function processJam(jam, dryRun) {
  const { n, name, url, theme } = jam;
  const slug = slugFromUrl(url);

  // Resume: skip if already written
  if (!dryRun && await jamAlreadyDone(n)) {
    console.log(`  [${n}] ${name} — already done, skipping`);
    return null;
  }

  console.log(`\n[${n}] ${name} (${slug}) — theme: "${theme}"`);

  // 1. Jam metadata via Itchy
  let jamMeta = null;
  try {
    jamMeta = await requestQueue(async () => {
      try { return await getJamData(url); }
      finally { await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS)); }
    });
    console.log(`  ✓ Jam meta fetched (type: ${jamMeta.jamType})`);
  } catch (err) {
    console.warn(`  ⚠️  Itchy failed for ${url}: ${err.message}`);
  }

  // 2. Ranked entries
  let ranked = false, hasCategories = false, needsManualSelection = false;
  let totalEntries = 0, categories = [], topEntries = [];

  try {
    if (!jamMeta?.jamID) throw new Error("No jamID from Itchy output");
    const result = await fetchTopEntries(jamMeta.jamID);
    ({ ranked, hasCategories, needsManualSelection, totalEntries, categories, topEntries } = result);

    if (needsManualSelection) {
      console.log(`  ⚠️  Non-ranked jam — top games must be selected manually`);
    } else if (hasCategories) {
      console.log(`  ✓ ${totalEntries} entries, categories: [${categories.join(", ")}], ${topEntries.length} unique games to scrape`);
    } else {
      console.log(`  ✓ ${totalEntries} entries, single ranking, scraping top ${topEntries.length}`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Could not fetch entries for ${slug}: ${err.message}`);
  }

  if (dryRun) {
    console.log(`  [dry-run] Would scrape ${topEntries.length} games.`);
    return { n, name, url, theme, slug, jamMeta, totalEntries, ranked,
             hasCategories, needsManualSelection, categories,
             topGames: topEntries.map((e) => ({ ...e, details: "__dry_run__" })) };
  }

  if (needsManualSelection) {
    const result = { n, name, url, theme, slug, jamMeta, totalEntries, ranked,
                     hasCategories, needsManualSelection, categories, topGames: [] };
    await writeJamResult(result);
    return result;
  }

  // 3. Scrape game details
  const gameLimit = pLimit(GAME_CONCURRENCY);
  const topGames = await Promise.all(
    topEntries.map((entry, idx) =>
      gameLimit(async () => {
        console.log(`  → [${idx + 1}/${topEntries.length}] ${entry.gameUrl}`);
        const details = await fetchGameDetails(entry.gameUrl);
        return { ...entry, details };
      })
    )
  );

  const result = { n, name, url, theme, slug, jamMeta, totalEntries, ranked,
                   hasCategories, needsManualSelection, categories, topGames };
  await writeJamResult(result);
  return result;
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const dryRun    = args.includes("--dry-run");
const jamFilter = (() => {
  const idx = args.indexOf("--jam");
  return idx !== -1 ? Number(args[idx + 1]) : null;
})();

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("JamPad Dataset Collector");
  console.log("========================");
  if (dryRun) console.log("DRY RUN — no files will be written.\n");

  const raw  = await fs.readFile(INPUT_FILE, "utf-8");
  let jams   = JSON.parse(raw);

  if (jamFilter !== null) {
    jams = jams.filter((j) => j.n === jamFilter);
    if (jams.length === 0) { console.error(`No jam found with n=${jamFilter}`); process.exit(1); }
  }

  // Count already-done jams before starting
  const alreadyDone = dryRun ? 0 :
    (await Promise.all(jams.map((j) => jamAlreadyDone(j.n)))).filter(Boolean).length;

  console.log(`${jams.length} jams total — ${alreadyDone} already done, ${jams.length - alreadyDone} to process\n`);

  const jamLimit = pLimit(JAM_CONCURRENCY);
  const results  = (await Promise.all(
    jams.map((jam) => jamLimit(() => processJam(jam, dryRun)))
  )).filter(Boolean); // nulls = skipped

  if (!dryRun) {
    // Merge all per-jam files into one combined output for convenience
    await fs.mkdir(path.dirname(MERGED_FILE), { recursive: true });
    const allFiles = await fs.readdir(OUTPUT_DIR);
    const allResults = await Promise.all(
      allFiles
        .filter((f) => f.endsWith(".json"))
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(async (f) => JSON.parse(await fs.readFile(path.join(OUTPUT_DIR, f), "utf-8")))
    );
    await fs.writeFile(MERGED_FILE, JSON.stringify(allResults, null, 2), "utf-8");

    console.log(`\n✅ Done.`);
    console.log(`   Per-jam files: ${OUTPUT_DIR}/<n>.json`);
    console.log(`   Merged output: ${MERGED_FILE}`);
    console.log(`   ${allResults.length} jams total, ${allResults.reduce((s, j) => s + (j.topGames?.length ?? 0), 0)} games scraped.`);
  } else {
    console.log("\n[dry-run] Results preview:");
    console.log(JSON.stringify(results.slice(0, 2), null, 2));
  }
}

main().catch((err) => { console.error("Fatal error:", err); process.exit(1); });