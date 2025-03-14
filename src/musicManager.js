const ObtainAlbums = require('./musicModules/obtainAlbums');

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
        const obtainAlbums = new ObtainAlbums();
        const albums = await obtainAlbums.getArtistAlbums(this.query);
    }
}

if (require.main === module) {
    const query = 'Carpenters';
    const musicManager = new MusicManager(query, artist = true).obtainMusic();
}

module.exports = MusicManager;