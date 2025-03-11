const path = require('path');
const fs = require('fs');
const { create } = require('domain');

class FileManager {
    constructor(workLocation=false) {
        this.parentDirectory = this.setParentDirectory(workLocation);
    }

    createFileStructure(seriesTitle, episodes) {
        this.createSeriesDirectory(seriesTitle);
        this.createSeasonDirectories(seriesTitle, episodes);
    }

    createSeriesDirectory(seriesTitle) {
        const seriesPath = path.join(this.parentDirectory, this.sanitizeFileName(seriesTitle));
        if (!fs.existsSync(seriesPath)) {
            fs.mkdirSync(seriesPath);
        }
    }

    createSeasonDirectories(seriesTitle, episodes) {
        const seriesPath = path.join(this.parentDirectory, this.sanitizeFileName(seriesTitle));
        const seasonNumbers = this.getSeasonNumbers(episodes);

        seasonNumbers.forEach(seasonNumber => {
            const formattedSeasonNumber = String(seasonNumber).padStart(2, '0');
            const seasonPath = path.join(seriesPath, `Season ${formattedSeasonNumber}`);
            if (!fs.existsSync(seasonPath)) {
                fs.mkdirSync(seasonPath);
            }
        });
    }

    getSeasonDirectory(seasonNum) {
        return path.join(this.parentDirectory, `Season ${String(seasonNum).padStart(2, '0')}`);
    }

    getSeasonNumbers(episodes) {
        const seasons = new Set();
        episodes.forEach(episode => {
            seasons.add(episode.seasonNumber);
        });
        return Array.from(seasons);
    }

    setParentDirectory(workLocation=false) {
        if (workLocation) {
            return path.join('E:', 'Anime');
        }
        else {
            return
        }
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[/\\?%*:|"<>]/g, '-');
    }
}

module.exports = FileManager;