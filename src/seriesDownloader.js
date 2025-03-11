const BrowserManager = require('./browserManager');
const path = require('path');
const fs = require('fs');
const VideoDownloader = require('./videoDownloader');

class SeriesDownloader {
  constructor() {
    this.browserManager = new BrowserManager();
    this.browserManager.startBrowsers(); // Start the browsers here
  }

  async downloadSeries(animeData) {
    const animeDataPath = path.join(__dirname, '..', 'anime_data.json');

    console.log('starting episode processing...');
    const processedEpisodes = await this.processEpisodes(animeData.href);
    animeData.episodes = processedEpisodes;
    fs.writeFileSync(animeDataPath, JSON.stringify(animeData, null, 2));

    console.log('starting video extraction...');
    const updatedAnimeData = await this.extractVideoSources(animeData);
    console.log('finished video extraction...');

    fs.writeFileSync(animeDataPath, JSON.stringify(updatedAnimeData, null, 2));

    console.log('starting video download...');
    await this.downloadVideo(updatedAnimeData);
  }

  async processEpisodes(href) {
    const { context, page } = await this.browserManager.newPage();
    const episodes = await this.browserManager.selectAnime(page, href);
    await this.browserManager.closeContext(context);
    return episodes;
  }

  async extractVideoSources(animeData) {
    return await this.browserManager.extractVideoSrcs(animeData);
  }

  async downloadVideo(animeData) {
    const videoDownloader = new VideoDownloader();
    await videoDownloader.downloadVideos(animeData.episodes);
  }
}

module.exports = SeriesDownloader;