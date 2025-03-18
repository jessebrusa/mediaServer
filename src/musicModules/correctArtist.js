const axios = require('axios');

class CorrectArtist {
    constructor() {
        this.apiKey = process.env.LASTFM_API_KEY;
        this.baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    }

    async findCorrectArtist(searchQuery) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    method: 'artist.search',
                    artist: searchQuery,
                    api_key: this.apiKey,
                    format: 'json',
                    limit: 1 
                }
            });

            if (response.data?.results?.artistmatches?.artist?.[0]) {
                const match = response.data.results.artistmatches.artist[0];
                console.log(`Found artist: ${match.name}`);
                return match.name;
            }
            
            throw new Error(`No matches found for "${searchQuery}"`);
        } catch (error) {
            console.error('Error finding artist:', error.message);
            throw error;
        }
    }
}

module.exports = CorrectArtist;

if (require.main === module) {
    const corrector = new CorrectArtist();
    const tests = [
        'beetles',
        'beattles',
        'the betles',
        'temptashions',
        'ojays'
    ];

    Promise.all(tests.map(test => 
        corrector.findCorrectArtist(test)
            .then(result => console.log(`"${test}" => "${result.name}"`))
            .catch(err => console.log(`"${test}" => Error: ${err.message}`))
    ));
}