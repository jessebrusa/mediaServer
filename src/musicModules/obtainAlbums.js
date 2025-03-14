const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ObtainAlbums {
    constructor(artist) {
        this.artist = artist;
        this.apiKey = process.env.LASTFM_API_KEY;
        this.baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    }

    async getArtistAlbums() {
        try {
            const albums = await this.fetchAlbumList();
            const albumDetails = await this.fetchAlbumDetails(albums);
            return albumDetails;
        } catch (error) {
            console.error('Error fetching albums:', error);
            throw error;
        }
    }

    async fetchAlbumList() {
        const response = await axios.get(this.baseUrl, {
            params: {
                method: 'artist.getTopAlbums',
                artist: this.artist,
                api_key: this.apiKey,
                format: 'json'
            }
        });
        return response.data.topalbums.album;
    }

    async fetchAlbumDetails(albums) {
        const albumDetails = [];
        for (const album of albums) {
            const tracks = await this.fetchAlbumTracks(album.name);
            if (tracks) {
                albumDetails.push({
                    name: album.name,
                    tracks: tracks
                });
            }
        }
        return albumDetails;
    }

    async fetchAlbumTracks(albumName) {
        const response = await axios.get(this.baseUrl, {
            params: {
                method: 'album.getInfo',
                artist: this.artist,
                album: albumName,
                api_key: this.apiKey,
                format: 'json'
            }
        });

        if (response.data.album?.tracks) {
            const tracks = response.data.album.tracks.track;
            const trackList = Array.isArray(tracks) ? tracks : [tracks];
            return trackList.map(track => track.name);
        }
        return null;
    }
}

if (require.main === module) {
    const obtainAlbums = new ObtainAlbums();
    obtainAlbums.getArtistAlbums('Carpenters')
        .then(albums => {
            const filePath = path.join(__dirname, 'albums.json');
            fs.writeFileSync(filePath, JSON.stringify(albums, null, 2));
            console.log(`Albums data written to ${filePath}`);
        })
        .catch(console.error);
}

module.exports = ObtainAlbums;