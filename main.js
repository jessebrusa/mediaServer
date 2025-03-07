const express = require('express');
const BrowserManager = require('./src/browserManager');

const app = express();
const browserManager = new BrowserManager();

(async () => {
  await browserManager.startBrowser();
})();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.get('/search-anime', async (req, res) => {
  const test_title = 'pokemon'
  const { context, page } = await browserManager.newPage();
  const titles = await browserManager.searchAnime(page, test_title);
  await browserManager.closeContext(context);
  res.send(titles);
});

app.get('/select-anime', async (req, res) => {
  const test_href = '/anime/pokemon-season-1-indigo-league';
  const { title, href, imgSrc } = req.query;
  await browserManager.selectAnime(href);
  const { context, page } = await browserManager.newPage();
  
  res.send('Anime selected');
});

app.listen(7000, () => {
  console.log('Server is running on port 7000');
});