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

  const { testTitle, testHref, testImgSrc, episodes } = animeData;

  downloadSeries(testTitle, testHref, testImgSrc, episodes);

  res.send(`Downloading: ${testTitle}....`);
});

async function downloadSeries(testTitle, testHref, testImgSrc, episodes) {
  // const { context, page } = await browserManager.newPage();

  // console.log('starting episode processing...');
  // const processedEpisodes = await browserManager.selectAnime(page, testHref);
  // await browserManager.closeContext(context);

  // console.log('starting video extraction...');
  // const videoSrcList = await browserManager.extractVideoSrcs(processedEpisodes);
  // console.log('finished video extraction...');

  videoUrl = 'https://t01.cizgifilmlerizle.com/getvid?evid=Kks11MUx7ypWFe2_QTbI8yiCEy3gCusW-AJLoV5Pthp5MZO2U0gLqFdXYAXbIzSFEHZ6T1-za5-fpDCuWIpQ82SSx444BdRqVyQx6BdgVIvQZjkdsuuwub2DyYu_-Ojj7zWNuLoU-eh5i8ec7lVmPlGlxW1Dm0y6QJDXghmbn22jv5Jz0L6rUR8LWuj_CWvF0L0GVHsbm_igwjD9LsET3Ti35e1r6sf6UwVqinoKdOPHAvU548luaXrV43NiaNzsZJkN6iNaC1q_hW6LpPCP9-nUqqpsCyNQnm-mKN0BMyysTzTLUaW2ktw4CS4KThlngALUd8lLTdhXCdb-cgrZ54-7EbZIrKcS5-vmzy7-tTi74Rbmg7heU-jcaEY_FQQCXPJ3K6tTtE8XuNnIAzLAvh_zVlBukyo25FXm83KF6KiphBeraIBxyeqbx30tayqd_4bMOi9vWUBG7X5OxCu8PWY9KVLkH-I3GzIycTASC83F7KkLuimGnnPV-xY2js1tSPrZGl4tLs750QoXvcg4uw'
  console.log('starting video download...');
  const videoDownloader = new VideoDownloader();
  videoDownloader.download(videoUrl, `${testTitle}_episode_4.mp4`);
}

app.listen(7000, () => {
  console.log('Server is running on port 7000');
});