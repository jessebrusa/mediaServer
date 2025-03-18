const CorrectArtist = require('./musicModules/correctArtist');
const CollectSongTitles = require('./musicModules/collectSongTitles');
const MusicFileManager = require('./musicModules/musicFileManager');
const MusicDownloader = require('./musicModules/musicDownloader');

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

        await this.downloadMusic();
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

    async downloadMusic() {
        const downloader = new MusicDownloader(this.artistDirectory, this.songTitles);
        await downloader.downloadTracks();
    }

}

if (require.main === module) {
    const query = "midnight star";
    new MusicManager(query).obtainMusic();
}

module.exports = MusicManager;