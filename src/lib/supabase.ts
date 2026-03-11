import { JamSubmission } from "@/types/jamSubmission";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export async function saveJamSubmission(submission: JamSubmission): Promise<{ data: any; error: any }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/jam_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const error = await response.json();
      return { data: null, error };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
