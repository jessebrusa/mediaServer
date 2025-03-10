const express = require('express');
const fs = require('fs');
const path = require('path');
const BrowserManager = require('./src/browserManager');
const VideoDownloader = require('./src/videoDownloader');

const app = express();
const browserManager = new BrowserManager();

(async () => {
  await browserManager.startBrowsers();
})();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.get('/search-anime', async (req, res) => {
  const test_title = 'pokemon';
  const { context, page } = await browserManager.newPage();
  const titles = await browserManager.searchAnime(page, test_title);
  await browserManager.closeContext(context);
  res.send(titles);
});

app.get('/select-anime', async (req, res) => {
  const animeDataPath = path.join(__dirname, 'anime_data.json');
  const animeData = JSON.parse(fs.readFileSync(animeDataPath, 'utf8'));

  downloadSeries(animeData);

  res.send(`Downloading: ${animeData.testTitle}....`);
});

async function downloadSeries(animeData) {
  const animeDataPath = path.join(__dirname, 'anime_data.json');
  const { context, page } = await browserManager.newPage();

  console.log('starting episode processing...');
  const processedEpisodes = await browserManager.selectAnime(page, animeData.testHref);
  animeData.episodes = processedEpisodes;
  fs.writeFileSync(animeDataPath, JSON.stringify(animeData, null, 2));
  await browserManager.closeContext(context);

  console.log('starting video extraction...');
  const updatedAnimeData = await browserManager.extractVideoSrcs(animeData);
  console.log('finished video extraction...');

  fs.writeFileSync(animeDataPath, JSON.stringify(updatedAnimeData, null, 2));

//   const videoUrl = updatedAnimeData.episodes[0].videoSrc;
//   console.log('starting video download...');
//   const videoDownloader = new VideoDownloader();
//   videoDownloader.download(videoUrl, `${updatedAnimeData.testTitle}_episode_1.mp4`);
}

app.listen(7500, () => {
  console.log('Server is running on port 7500');
});