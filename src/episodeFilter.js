const fs = require('fs');
const path = require('path');

class EpisodeFilter {
  constructor(fileManager) {
    this.fileManager = fileManager;
  }

  filterEpisodes(seriesTitle, episodes) {
    const completedDirectory = this.fileManager.getCompletedDirectory();
    const sanitizedTitle = this.fileManager.sanitizeFileName(seriesTitle);
    const seriesPath = path.join(completedDirectory, sanitizedTitle);

    if (!fs.existsSync(seriesPath)) {
      console.log(`No completed directory found for series: ${seriesTitle}`);
      return episodes; // No completed directory, return all episodes
    }

    const downloadedEpisodes = new Set();

    // Read all season folders and collect downloaded episodes
    const seasonFolders = fs.readdirSync(seriesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(seriesPath, dirent.name));

    for (const seasonFolder of seasonFolders) {
      const episodeFiles = fs.readdirSync(seasonFolder);
      episodeFiles.forEach(file => {
        const match = file.match(/s(\d+)e(\d+)/i); // Match filenames like "s01e01.mp4"
        if (match) {
          downloadedEpisodes.add(`s${match[1]}e${match[2]}`); // Add "s01e01" to the set
        }
      });
    }

    // Filter out episodes that already exist in the completed directory
    const filteredEpisodes = episodes.filter(episode => {
      const episodeKey = `s${episode.seasonNumber}e${episode.episodeNumber}`;
      if (downloadedEpisodes.has(episodeKey)) {
        console.log(`Skipping already downloaded episode: ${episodeKey}`);
        return false;
      }
      return true;
    });

    return filteredEpisodes;
  }
}

module.exports = EpisodeFilter;