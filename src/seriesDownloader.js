const BrowserManager = require('./browserManager');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const FileManager = require('./fileManager');
const EpisodeFilter = require('./episodeFilter');
const VideoDownloader = require('./videoDownloader');
const ScanLibrary = require('./scanLibrary');

class SeriesDownloader {
    constructor() {
        this.browserManager = new BrowserManager();
        this.browserManager.startBrowsers();
    }

    async downloadSeries(animeData) {
        const fileManager = new FileManager(true, animeData.title);
        const episodeFilter = new EpisodeFilter(fileManager);

        console.log('starting episode processing...');
        const processedEpisodes = await this.processEpisodes(animeData.href, animeData.title);
        console.log('finished episode processing...');

        console.log('filtering episodes...');
        const filteredEpisodes = episodeFilter.filterEpisodes(animeData.title, processedEpisodes);
        animeData.episodes = filteredEpisodes; // Update animeData with filtered episodes
        console.log(`Filtered episodes: ${filteredEpisodes.length} remaining.`);

        if (filteredEpisodes.length === 0) {
            console.log('All episodes are already downloaded. Skipping further steps.');
            return;
        }

        console.log('creating file structure...');
        await this.createFileStructure(animeData.title, animeData.episodes);
        console.log('finished creating file structure...');

        console.log('starting video extraction...');
        const updatedAnimeData = await this.extractVideoSources(animeData);
        console.log('finished video extraction...');

        console.log('starting video download...');
        await this.downloadVideo(updatedAnimeData, fileManager);
        console.log('finished video download...');

        console.log('moving completed episodes...');
        await this.moveEpisodesToCompleted(animeData.episodes, fileManager);
        console.log('finished moving completed episodes.');
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

    async scanLibrary() {
        const scanLibrary = new ScanLibrary();
        await scanLibrary.scanLibrary('5');
    }

    async moveEpisodesToCompleted(episodes, fileManager) {
      const completedFolder = fileManager.getCompletedDirectory();
      const downloadsFolder = fileManager.getSeriesDirectory(); // This points to the series folder in Downloads
  
      for (const episode of episodes) {
          const sourceFile = path.join(downloadsFolder, `Season ${episode.seasonNumber}`, episode.outputFileName);
          const destinationFolder = path.join(completedFolder, fileManager.sanitizeFileName(episode.seriesTitle), `Season ${episode.seasonNumber}`);
          const destinationFile = path.join(destinationFolder, episode.outputFileName);
  
          console.log(`Attempting to move file: ${sourceFile} to ${destinationFile}`);
  
          if (!fs.existsSync(destinationFolder)) {
              fs.mkdirSync(destinationFolder, { recursive: true });
          }
  
          if (!fs.existsSync(sourceFile)) {
              console.error(`Source file does not exist: ${sourceFile}`);
              continue;
          }
  
          try {
              await fsExtra.move(sourceFile, destinationFile, { overwrite: true });
              console.log(`Moved ${sourceFile} to ${destinationFile}`);
          } catch (error) {
              console.error(`Failed to move ${sourceFile} to ${destinationFile}: ${error.message}`);
          }
      }
  
      // Clean up empty season folders
      const seasonFolders = fs.readdirSync(downloadsFolder, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => path.join(downloadsFolder, dirent.name));
  
      for (const seasonFolder of seasonFolders) {
          try {
              if (fs.existsSync(seasonFolder) && fs.readdirSync(seasonFolder).length === 0) {
                  fs.rmdirSync(seasonFolder);
                  console.log(`Deleted empty season folder: ${seasonFolder}`);
              }
          } catch (error) {
              console.error(`Failed to delete season folder ${seasonFolder}: ${error.message}`);
          }
      }
  
      // Clean up the series folder if empty
      try {
          if (fs.existsSync(downloadsFolder) && fs.readdirSync(downloadsFolder).length === 0) {
              fs.rmdirSync(downloadsFolder);
              console.log(`Deleted empty series folder: ${downloadsFolder}`);
          }
      } catch (error) {
          console.error(`Failed to delete series folder ${downloadsFolder}: ${error.message}`);
      }
    }
}

module.exports = SeriesDownloader;