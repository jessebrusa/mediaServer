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
  const testTitle = 'Pokemon Season 1 Indigo League';
  const testHref = '/anime/pokemon-season-1-indigo-league';
  const testImgSrc =  'https://cdn.animationexplore.com/catimg/136.jpg'
  // const { title, href, imgSrc } = req.query;

  const { context, page } = await browserManager.newPage();
  const episodes = await browserManager.selectAnime(page, testHref);
  const data = {
    testTitle,
    testHref,
    testImgSrc,
    episodes
  };
  await browserManager.closeContext(context);
  res.send(data);
});

app.listen(7000, () => {
  console.log('Server is running on port 7000');
});