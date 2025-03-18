const CorrectArtist = require('./musicModules/correctArtist');
const CollectSongTitles = require('./musicModules/collectSongTitles');
const MusicFileManager = require('./musicModules/musicFileManager');
const MusicDownloader = require('./musicModules/musicDownloader');
const fs = require('fs');
const path = require('path');

class MusicManager {
    constructor(query, artist = true) {
        this.query = query;
        this.artist = artist;
        this.songTitles = [];
        this.artistDirectory = null;
    }

    async obtainMusic() {
        if (!this.artist) {
            return;
        }

        await this.correctArtist();
        if (!this.artist) {
            console.error(`No artist found for "${this.query}"`);
            return;
        }

        await this.collectSongTitles();
        if (this.songTitles.length === 0) {
            console.error(`No songs found for ${this.artist}`);
            return;
        }

        this.artistDirectory = await this.createFileStructure();
        if (!this.artistDirectory) {
            console.error('Error creating file structure');
            return;
        }


    }

    async correctArtist() {
        const corrector = new CorrectArtist();
        this.artist =  await corrector.findCorrectArtist(this.query);
    }

    async collectSongTitles() {
        const collector = new CollectSongTitles();
        this.songTitles = await collector.getAllTracks(this.artist);
    }

    async createFileStructure() {
        const manager = new MusicFileManager(this.artist);
        return await manager.createFileStructure();
    }

}

if (require.main === module) {
    const query = "The O'Jays";
    new MusicManager(query, artist = true).obtainMusic();
}

module.exports = MusicManager;