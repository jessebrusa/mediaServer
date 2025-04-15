const path = require('path');
const fs = require('fs');

class FileManager {
    constructor(workLocation = false, seriesTitle = null) {
        this.completedDirectory = null;
        this.parentDirectory = this.setParentDirectory(workLocation);
        this.seriesTitle = seriesTitle ? this.sanitizeFileName(seriesTitle) : null;
    }

    createFileStructure(episodes) {
        this.createSeriesDirectory();
        this.createSeasonDirectories(episodes);
    }

    createSeriesDirectory() {
        const seriesPath = path.join(this.parentDirectory, this.seriesTitle);
        if (!fs.existsSync(seriesPath)) {
            fs.mkdirSync(seriesPath);
        }
    }

    createSeasonDirectories(episodes) {
        const seriesPath = path.join(this.parentDirectory, this.seriesTitle);
        const seasonNumbers = this.getSeasonNumbers(episodes);

        seasonNumbers.forEach(seasonNumber => {
            const formattedSeasonNumber = String(seasonNumber).padStart(2, '0');
            const seasonPath = path.join(seriesPath, `Season ${formattedSeasonNumber}`);
            if (!fs.existsSync(seasonPath)) {
                fs.mkdirSync(seasonPath);
            }
        });
    }

    getSeriesDirectory() {
        return path.join(this.parentDirectory, this.seriesTitle);
    }

    getSeasonDirectory(seasonNum) {
        const formattedSeasonNumber = String(seasonNum).padStart(2, '0');
        return path.join(this.getSeriesDirectory(), `Season ${formattedSeasonNumber}`);
    }

    getSeasonNumbers(episodes) {
        const seasons = new Set();
        episodes.forEach(episode => {
            seasons.add(episode.seasonNumber);
        });
        return Array.from(seasons);
    }

    setParentDirectory(workLocation = false) {
        if (workLocation) {
            this.completedDirectory = path.join('E:', 'Anime', 'Completed');
            return path.join('E:', 'Anime', 'Downloads');
        } else {
            return path.join(__dirname, 'Anime');
        }
    }

    getCompletedDirectory() {
        return this.completedDirectory;
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[/\\?%*:|"<>]/g, '-');
    }
}

module.exports = FileManager;