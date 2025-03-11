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
    const processedEpisodes = await this.processEpisodes(animeData.testHref);
    animeData.episodes = processedEpisodes;
    fs.writeFileSync(animeDataPath, JSON.stringify(animeData, null, 2));

    console.log('starting video extraction...');
    const updatedAnimeData = await this.extractVideoSources(animeData);
    console.log('finished video extraction...');

    fs.writeFileSync(animeDataPath, JSON.stringify(updatedAnimeData, null, 2));

    console.log('starting video download...');
    await this.downloadVideo(updatedAnimeData);
  }

  async processEpisodes(testHref) {
    const { context, page } = await this.browserManager.newPage();
    const episodes = await this.browserManager.selectAnime(page, testHref);
    await this.browserManager.closeContext(context);
    return episodes;
  }

  async extractVideoSources(animeData) {
    return await this.browserManager.extractVideoSrcs(animeData);
  }

  async downloadVideo(animeData) {
    const episodes = animeData.episodes;
    const batchSize = 10; 
    const videoDownloader = new VideoDownloader();

    for (let i = 0; i < episodes.length; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      const promises = batch.map(async (episode) => {
        const videoUrl = episode.videoSrc;
        if (videoUrl) {
          const outputFileName = path.join('E:', 'Anime', `${episode.outputFileName}`);
          await videoDownloader.download(videoUrl, outputFileName);
        } else {
          console.error(`Invalid video URL for episode: ${episode.episodeTitle}`);
        }
      });

      await Promise.all(promises);
    }
  }
}

module.exports = SeriesDownloader;