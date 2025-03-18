const axios = require('axios');

class CollectSongTitles {
    constructor() {
        this.songTitles = new Map();
        this.apiKey = process.env.LASTFM_API_KEY;
        this.baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    }

    isRemastered(trackName) {
        const remasterKeywords = [
            'remaster', 'remastered', 
            'anniversary', 'edition',
            'stereo', 'mono', 'extended',
            'Re-Recorded', 'Re-Record',
            'Single Version', 'Version',
            'Extended'
        ];
        return remasterKeywords.some(keyword => 
            trackName.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    shouldReplaceTrack(existingTrack, newTrack) {
        // If new track is remastered and existing isn't, prefer the remaster
        if (this.isRemastered(newTrack) && !this.isRemastered(existingTrack)) {
            return true;
        }
        // If both or neither are remastered, prefer the shorter name
        // (likely the original/clean version)
        return newTrack.length < existingTrack.length;
    }

    getBaseSongName(trackName) {
        // Remove common suffixes and prefixes
        return trackName
            .replace(/[\(\[].*(remaster|stereo|mono|edition|anniversary|19|20).*[\)\]]/gi, '')
            .replace(/-.*(remaster|stereo|mono|edition|anniversary|19|20).*/gi, '')
            .trim();
    }

    async fetchTopTracks(artist, limit = 65) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    method: 'artist.getTopTracks',
                    artist: artist,
                    api_key: this.apiKey,
                    format: 'json',
                    limit: limit
                }
            });

            if (response.data.toptracks) {
                response.data.toptracks.track.forEach(track => {
                    const baseName = this.getBaseSongName(track.name);
                    if (!this.songTitles.has(baseName) || 
                        this.shouldReplaceTrack(this.songTitles.get(baseName), track.name)) {
                        this.songTitles.set(baseName, track.name);
                    }
                });
                console.log(`Found ${this.songTitles.size} unique tracks for ${artist}`);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error.message);
            throw error;
        }
    }

    async getAllTracks(artist) {
        await this.fetchTopTracks(artist);
        return Array.from(this.songTitles.values());
    }

    getSongTitles() {
        return Array.from(this.songTitles.values());
    }
}

module.exports = CollectSongTitles;

// Example usage:
if (require.main === module) {
    const collector = new CollectSongTitles();
    collector.getAllTracks("The O'Jays")
        .then(tracks => {
            console.log('Tracks:');
            tracks.forEach(track => console.log(`- ${track}`));
        })
        .catch(console.error);
}