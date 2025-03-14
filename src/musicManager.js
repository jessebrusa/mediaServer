const ObtainAlbums = require('./musicModules/obtainAlbums');
const MusicFileManager = require('./musicModules/musicFileManager');
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
        // console.log('Obtaining albums...');
        // const albums = await new ObtainAlbums(this.query).getArtistAlbums();
        const albumsPath = path.join(__dirname, 'musicModules', 'albums.json');
        const albums = JSON.parse(fs.readFileSync(albumsPath, 'utf8'));
        new MusicFileManager(albums).createFileStructure();
    }
}

if (require.main === module) {
    const query = 'Carpenters';
    const musicManager = new MusicManager(query, artist = true).obtainMusic();
}

module.exports = MusicManager;