const { google } = require('googleapis');

class SearchSong {
    constructor(songTitle, artist = false) {
        this.songTitle = songTitle;
        this.youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY 
        });
        this.musicCategory = '10';
    }

    cleanTitle(title) {
        // Convert to string in case we get undefined or null
        title = String(title);
        
        // Remove artist name at the beginning (assuming format "Artist - Title")
        title = title.replace(/^.*? - /, '');
        
        // Remove various patterns
        const patternsToRemove = [
            /\([^)]*\)/g,          // Remove anything in parentheses
            /\[[^\]]*\]/g,         // Remove anything in square brackets
            /official\s*video/i,    // Remove "official video"
            /official\s*audio/i,    // Remove "official audio"
            /official\s*lyrics/i,   // Remove "official lyrics"
            /lyrics\s*video/i,      // Remove "lyrics video"
            /with\s*lyrics/i,       // Remove "with lyrics"
            /lyrics/i,              // Remove "lyrics"
            /\s{2,}/g              // Replace multiple spaces with single space
        ];

        patternsToRemove.forEach(pattern => {
            title = title.replace(pattern, '');
        });

        // Trim whitespace and return
        return title.trim();
    }

    async searchSong() {
        try {
            const searchQuery = this.artist ? this.songTitle : `${this.songTitle} lyrics`;
            let allVideos = [];
            let pageToken = undefined;

            // If artist is true, we'll make multiple requests to get 20 results
            do {
                const response = await this.youtube.search.list({
                    part: 'snippet',
                    q: searchQuery,
                    type: 'video',
                    maxResults: 20,  // Request maximum allowed per request
                    pageToken: pageToken,
                    videoCategoryId: this.musicCategory,
                    videoDuration: 'medium',
                    order: 'viewCount'
                });

                if (!response.data.items || response.data.items.length === 0) {
                    break;
                }

                const videos = response.data.items.map(item => ({
                    title: this.cleanTitle(item.snippet.title),
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    thumbnail: item.snippet.thumbnails.default.url,
                    viewCount: item.statistics?.viewCount
                }));

                allVideos = allVideos.concat(videos);
                pageToken = response.data.nextPageToken;

                // If we're not searching with artist, break after first request
                if (!this.artist) break;

                // If we have enough results, break
                if (allVideos.length >= 20) break;

            } while (pageToken);

            // Trim to exact count if we got more than we needed
            if (this.artist && allVideos.length > 20) {
                allVideos = allVideos.slice(0, 20);
            }

            console.log(`Found ${allVideos.length} results`);
            console.log('Search Results:', JSON.stringify(allVideos, null, 2));
            return allVideos;

        } catch (error) {
            console.error('Error searching YouTube:', error);
            throw error;
        }
    }
}

if (require.main === module) {
    const songTitle = 'ed sheeran';
    const search = new SearchSong(songTitle, true);
    search.searchSong()
        .then(results => console.log(`Total results: ${results.length}`))
        .catch(console.error);
}

module.exports = SearchSong;