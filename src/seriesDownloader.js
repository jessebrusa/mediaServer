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
    const fileManager = new FileManager(true, animeData.title);

    console.log('starting episode processing...');
    const processedEpisodes = await this.processEpisodes(animeData.href, animeData.title);
    animeData.episodes = processedEpisodes;
    fs.writeFileSync(animeDataPath, JSON.stringify(animeData, null, 2));
    console.log('finished episode processing...');

    console.log('creating file structure...');
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

  async processEpisodes(href, title) {
    const { context, page } = await this.browserManager.newPage();
    const episodes = await this.browserManager.selectAnime(page, href);
    await this.browserManager.closeContext(context);
    episodes.forEach(episode => {
      episode.seriesTitle = title;
    });
    return episodes;
  }

  async createFileStructure(seriesTitle, episodes) {
    const fileManager = new FileManager(true, seriesTitle);
    fileManager.createFileStructure(episodes);
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