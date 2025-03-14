const ObtainAlbums = require('./musicModules/obtainAlbums');
const MusicFileManager = require('./musicModules/musicFileManager');
const MusicDownloader = require('./musicModules/musicDownloader');
const fs = require('fs');
const path = require('path');

class MusicManager {
    constructor(query, artist = true) {
        this.query = query;
        this.artist = artist;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async retryOperation(operation, retries = this.maxRetries) {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === retries - 1) throw error; // Last attempt, throw the error
                
                console.log(`Attempt ${i + 1} failed, retrying in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                
                // Increase delay for next retry
                this.retryDelay *= 2;
            }
        }
    }

    async obtainAlbums() {
        try {
            console.log('Obtaining albums...');
            
            // Wrap the album fetching in retry logic
            const albums = await this.retryOperation(async () => {
                const result = await new ObtainAlbums(this.query).getArtistAlbums();
                if (!result || !result.artist) {
                    throw new Error(`No albums found for artist: ${this.query}`);
                }
                return result;
            });

            console.log(`Found ${albums.albums.length} albums for ${albums.artist.name}`);

            console.log('Creating file structure...');  
            const albumPaths = await new MusicFileManager(albums).createFileStructure();

            console.log('Downloading music...');
            await new MusicDownloader(albumPaths).downloadAlbums();
            
            console.log('Music download completed successfully');
            return true;
        } catch (error) {
            if (error.response?.status === 404) {
                console.error(`Artist "${this.query}" not found. Please check the spelling.`);
            } else if (error.code === 'ENOTFOUND') {
                console.error('Network error. Please check your internet connection.');
            } else {
                console.error('Error obtaining albums:', error.message);
                if (error.response?.data) {
                    console.error('API response:', error.response.data);
                }
            }
            throw error;
        }
    }

    async obtainMusic() {
        try {
            if (this.artist) {
                await this.obtainAlbums();
            }
        } catch (error) {
            console.error('Failed to obtain music:', error.message);
            process.exit(1);
        }
    }
}

if (require.main === module) {
    const query = "The O'Jays";
    new MusicManager(query, artist = true).obtainMusic();
}

module.exports = MusicManager;