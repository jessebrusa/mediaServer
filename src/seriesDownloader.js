const BrowserManager = require('./browserManager');
const path = require('path');
const fs = require('fs');
const FileManager = require('./fileManager');
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
    console.log('finished episode processing...');

    console.log('creating file structure...');
    const fileManager = new FileManager(true);
    await this.createFileStructure(animeData.title, animeData.episodes);
    console.log('finished creating file structure...');

    console.log('starting video extraction...');
    const updatedAnimeData = await this.extractVideoSources(animeData);
    fs.writeFileSync(animeDataPath, JSON.stringify(updatedAnimeData, null, 2));
    console.log('finished video extraction...');

    console.log('starting video download...');
    await this.downloadVideo(updatedAnimeData, fileManager);
    console.log('finished video download...');
  }

  async processEpisodes(href) {
    const { context, page } = await this.browserManager.newPage();
    const episodes = await this.browserManager.selectAnime(page, href);
    await this.browserManager.closeContext(context);
    episodes.forEach(episode => {
      episode.seriesTitle = 'Pokemon Season 2 Orange Islands League'; // Set the series title
    });
    return episodes;
  }

  async createFileStructure(seriesTitle, episodes) {
    const fileManager = new FileManager(true);
    fileManager.createFileStructure(seriesTitle, episodes);
  }

  async extractVideoSources(animeData) {
    return await this.browserManager.extractVideoSrcs(animeData);
  }

  async downloadVideo(animeData, fileManager) {
    const videoDownloader = new VideoDownloader();
    await videoDownloader.downloadMultiple(animeData.episodes, fileManager);
  }
}

module.exports = SeriesDownloader;