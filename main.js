const express = require('express');
const fs = require('fs');
const path = require('path');
const BrowserManager = require('./src/browserManager');
const SeriesDownloader = require('./src/seriesDownloader');

const app = express();
const browserManager = new BrowserManager();
const seriesDownloader = new SeriesDownloader();

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

  seriesDownloader.downloadSeries(animeData);

  res.send(`Downloading: ${animeData.title}....`);
});

app.listen(7500, () => {
  console.log('Server is running on port 7500');
});