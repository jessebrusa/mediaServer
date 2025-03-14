const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const os = require('os');

class MusicDownloader {
    constructor(albumData) {
        this.albumData = albumData;
        this.ffmpegPath = this.getFfmpegPath();
    }

    sanitizeFileName(fileName) {
        return fileName
            .replace(/[/\\]/g, '_')  // Replace slashes with underscore
            .replace(/[<>:"|?*]/g, '') // Remove invalid Windows filename characters
            .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
            .trim();
    }

    async processBatch(tracks, albumInfo) {
        // Process tracks sequentially within each batch to avoid file conflicts
        for (const track of tracks) {
            const sanitizedTrack = this.sanitizeFileName(track);
            const outputPath = path.join(albumInfo.filePath, `${sanitizedTrack}.mp3`);
            
            // Check if file already exists
            if (fs.existsSync(outputPath)) {
                console.log(`Skipping "${track}" - File already exists`);
                continue;
            }
    
            const searchQuery = `The Carpenters ${track}`;
            console.log(`Processing: ${searchQuery}`);
            
            try {
                const searchResult = await youtubedl(
                    `ytsearch1:${searchQuery}`,
                    {
                        dumpSingleJson: true,
                        noCheckCertificates: true,
                        noWarnings: true
                    }
                );
    
                if (searchResult?.entries?.[0]) {
                    const videoUrl = searchResult.entries[0].webpage_url;
                    console.log(`Downloading "${track}" to ${outputPath}`);
                    await this.downloadSong(videoUrl, outputPath);
                    
                    // Add a small delay between downloads
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.error(`No results found for: ${track}`);
                }
            } catch (error) {
                console.error(`Error processing track "${track}":`, error);
                // Continue with next track on error
            }
        }
    }

    async downloadAlbums() {
        const entries = Object.entries(this.albumData);
        const batchSize = 10;

        // Process albums sequentially to maintain organization
        for (const [albumName, albumInfo] of entries) {
            console.log(`\nProcessing album: ${albumName}`);
            const { tracks } = albumInfo;
            
            // Create batches
            const batches = [];
            for (let i = 0; i < tracks.length; i += batchSize) {
                batches.push(tracks.slice(i, i + batchSize));
            }

            // Process all batches for this album concurrently
            const batchResults = await Promise.all(
                batches.map(async (batch, index) => {
                    console.log(`\nStarting batch ${index + 1} (${batch.length} tracks)`);
                    await this.processBatch(batch, albumInfo);
                    console.log(`Completed batch ${index + 1}`);
                })
            );

            console.log(`Completed album: ${albumName}\n`);
        }
    }

    async downloadSong(url, output = 'song.mp3') {
        console.log(`Downloading song from ${url}`);
        try {
            const outputDir = path.dirname(output);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const result = await youtubedl(url, {
                output: output,
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                ffmpegLocation: this.ffmpegPath,
                addHeader: [
                    'referer:youtube.com',
                    'user-agent:googlebot'
                ]
            });

            console.log('Download completed', result);
        } catch (error) {
            console.error('Error downloading song', error);
            throw error; // Re-throw the error for better error handling
        }
    }

    getFfmpegPath() {
        const platform = os.platform();
        
        if (platform === 'win32') {
            // Windows path - go up two directories from __dirname (src/musicModules) to reach project root
            const windowsPath = path.resolve(__dirname, '..', '..', 'ffmpeg', 'bin', 'ffmpeg.exe');
            if (!fs.existsSync(windowsPath)) {
                throw new Error(`ffmpeg not found at path: ${windowsPath}`);
            }
            console.log('Found ffmpeg at:', windowsPath);
            return windowsPath;
        } else if (platform === 'darwin') {
            // Mac path (assuming ffmpeg is installed via homebrew)
            const macPath = '/usr/local/bin/ffmpeg';
            if (!fs.existsSync(macPath)) {
                throw new Error('ffmpeg not found. Please install it using: brew install ffmpeg');
            }
            return macPath;
        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}

if (require.main === module) {
    const url = 'https://www.youtube.com/watch?v=ef42hn1iSvQ';
    const output = path.join(__dirname, '..', 'outputMedia', 'Inferno.mp3');
    const musicDownloader = new MusicDownloader();
    musicDownloader.downloadSong(url, output)
        .catch(error => {
            console.error('Failed to download:', error);
            process.exit(1);
        });
}

module.exports = MusicDownloader;