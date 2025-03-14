const ObtainAlbums = require('./musicModules/obtainAlbums');
const MusicFileManager = require('./musicModules/musicFileManager');
const MusicDownloader = require('./musicModules/musicDownloader');
const fs = require('fs');
const path = require('path');

class MusicManager {
    constructor(query, artist = true) {
        this.query = query;
        this.artist = artist;
    }

    async obtainMusic() {
        if (this.artist) {
            this.obtainAlbums();
        }
    } 

    async obtainAlbums() {
        console.log('Obtaining albums...');
        // const albums = await new ObtainAlbums(this.query).getArtistAlbums();
        const albumsPath = path.join(__dirname, 'musicModules', 'albums.json');
        const albums = JSON.parse(fs.readFileSync(albumsPath, 'utf8'));

        console.log('Creating file structure...');  
        // const albumPaths = await new MusicFileManager(albums).createFileStructure();
        const albumPathsPath = path.join(__dirname, 'musicModules', 'albumPaths.json');
        const albumPaths = JSON.parse(fs.readFileSync(albumPathsPath, 'utf8'));

        console.log('Downloading music...');
        new MusicDownloader(albumPaths).downloadAlbums();
    }
}

if (require.main === module) {
    const query = 'Carpenters';
    new MusicManager(query, artist = true).obtainMusic();
}

module.exports = MusicManager;