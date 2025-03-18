const fs = require('fs').promises;
const path = require('path');

class MusicFileManager {
    constructor(artist) {
        this.artist = artist;
        this.parentDirectory = null;
        this.artistDirectory = null;
    }

    async createFileStructure() {
        await this.setParentDirectory();
        await this.createArtistDirectory();
        return await this.getArtistDirectory();
    }

    async setParentDirectory() {
        const isWindows = process.platform === 'win32';
        this.parentDirectory = isWindows ? 'E:\\Artists' : '/Artists';
    }

    async createArtistDirectory() {
        const artistName = this.sanitizeName(this.artist);
        this.artistDirectory = path.join(this.parentDirectory, artistName);
        try {
            await fs.mkdir(this.artistDirectory, { recursive: true });
            console.log(`Created directory: ${this.artistDirectory}`);
        } catch (error) {
            console.error(`Error creating directory: ${error}`);
        }
    }

    async getArtistDirectory() {
        return this.artistDirectory;
    }

    sanitizeName(name) {
        return name
            // Replace invalid characters with underscores
            .replace(/[<>:"/\\|?*]/g, '_')
            // Remove trailing periods (Windows restriction)
            .replace(/\.+$/, '')
            // Remove leading/trailing whitespace
            .trim();
    }
}

if (require.main === module) {
    const artist = 'Ed Sheeran';
    const manager = new MusicFileManager(artist);
    manager.createFileStructure()
        .then(() => console.log('File structure created successfully'))
        .catch(error => console.error('Error:', error));
}

module.exports = MusicFileManager;