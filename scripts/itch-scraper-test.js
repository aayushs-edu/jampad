import { getGame } from 'itch-scraper'

const gameData = async (link) => {
  const game = await getGame(link);
  return { game };
}

console.log(await gameData('https://titan-and-lyra.itch.io/its-alive'));