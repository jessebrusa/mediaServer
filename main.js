const express = require('express');
const fs = require('fs');
const path = require('path');
const BrowserManager = require('./src/browserManager');
const SeriesDownloader = require('./src/seriesDownloader');

const app = express();
const browserManager = new BrowserManager();
const seriesDownloader = new SeriesDownloader();

app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  await browserManager.startBrowsers();
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search-anime', async (req, res) => {
  const title = req.query.title;
  const { context, page } = await browserManager.newPage();
  const titles = await browserManager.searchAnime(page, title);
  await browserManager.closeContext(context);
  res.send(titles);
});

app.get('/select-anime', async (req, res) => {
  const { href, title, imgSrc } = req.query;
  const animeData = {
    href,
    title,
    imgSrc
  };

  await seriesDownloader.downloadSeries(animeData);

  res.json({ success: true });
});

app.listen(7500, () => {
  console.log('Server is running on port 7500');
});