const express = require('express');
const fs = require('fs');
const path = require('path');
const BrowserManager = require('./src/browserManager');

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
  // const { title, href, imgSrc } = req.query;
  const animeDataPath = path.join(__dirname, 'anime_data.json');
  const animeData = JSON.parse(fs.readFileSync(animeDataPath, 'utf8'));

  const { testTitle, testHref, testImgSrc, episodes } = animeData;
  
  (async () => {
    const { context, page } = await browserManager.newPage();

    console.log('starting episode processing...');
    const episodes = await browserManager.selectAnime(page, testHref);
    await browserManager.closeContext(context);

    console.log('starting video extraction...');
    videoSrcList = await browserManager.extractVideoSrcs(episodes);
    console.log(videoSrcList);
    
  })();
  res.send(`Downloading: ${testTitle}....`);
});

app.listen(7000, () => {
  console.log('Server is running on port 7000');
});