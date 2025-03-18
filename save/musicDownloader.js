const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const os = require('os');

class MusicDownloader {
    constructor(albumData) {
        this.albumData = albumData;
        this.ffmpegPath = this.getFfmpegPath();
        this.trackRegistry = new Map();
    }

    sanitizeFileName(fileName) {
        return fileName
            .replace(/[/\\]/g, '_')  // Replace slashes with underscore
            .replace(/[<>:"|?*]/g, '') // Remove invalid Windows filename characters
            .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
            .trim();
    }

    async downloadAlbums() {
        console.log('Starting downloadAlbums...');
        await this.loadTrackRegistry();

        const entries = this.albumData instanceof Map ? 
            Array.from(this.albumData.entries()) : 
            Object.entries(this.albumData);

        console.log(`Found ${entries.length} albums to process`);
        const batchSize = 5; // Reduced batch size for better control

        // Process albums one at a time
        for (const [albumName, albumInfo] of entries) {
            console.log(`\nProcessing album: ${albumName}`);
            
            if (!albumInfo.tracks || !Array.isArray(albumInfo.tracks)) {
                console.error(`No tracks found for album: ${albumName}`);
                continue;
            }

            const { tracks } = albumInfo;
            console.log(`Found ${tracks.length} tracks in album`);

            // Create batches for current album
            const batches = [];
            for (let i = 0; i < tracks.length; i += batchSize) {
                batches.push(tracks.slice(i, i + batchSize));
            }

            // Process batches sequentially
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`\nProcessing batch ${i + 1} of ${batches.length} (${batch.length} tracks)`);
                await this.processBatch(batch, albumInfo);
                
                // Add delay between batches
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            console.log(`Completed album: ${albumName}`);
        }
    }

    async processBatch(tracks, albumInfo) {
        console.log(`Processing ${tracks.length} tracks concurrently`);
        
        // Process all tracks in the batch concurrently
        const downloadPromises = tracks.map(async track => {
            const sanitizedTrack = this.sanitizeFileName(track);
            const outputPath = path.join(albumInfo.filePath, `${sanitizedTrack}.mp3`);
            
            try {
                if (fs.existsSync(outputPath)) {
                    console.log(`Skipping "${track}" - File exists`);
                    return;
                }

                if (await this.tryCreateHardLink(sanitizedTrack, outputPath)) {
                    return;
                }

                await this.downloadTrack(track, outputPath);
            } catch (error) {
                console.error(`Error processing "${track}":`, error.message);
            }
        });

        // Wait for all concurrent downloads in this batch to complete
        await Promise.all(downloadPromises);
    }

    async tryCreateHardLink(sanitizedTrack, outputPath) {
        if (this.trackRegistry.has(sanitizedTrack)) {
            const existingPath = this.trackRegistry.get(sanitizedTrack);
            
            try {
                if (fs.existsSync(existingPath)) {
                    const stats = await fs.promises.stat(existingPath);
                    if (stats.isFile()) {
                        await fs.promises.link(existingPath, outputPath);
                        console.log(`Created hard link for "${sanitizedTrack}"`);
                        return true;
                    }
                }
                
                this.trackRegistry.delete(sanitizedTrack);
                await this.saveTrackRegistry();
            } catch (error) {
                console.log(`Hard link failed for "${sanitizedTrack}":`, error.message);
            }
        }
        return false;
    }

    async downloadTrack(track, outputPath) {
        const searchQuery = `The Temptations ${track}`;
        console.log(`Downloading: ${track}`);
        
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
            await this.downloadSong(videoUrl, outputPath);
            
            // Register successful download
            const sanitizedTrack = this.sanitizeFileName(track);
            this.trackRegistry.set(sanitizedTrack, outputPath);
            await this.saveTrackRegistry();
        } else {
            throw new Error(`No results found for: ${track}`);
        }
    }

    async downloadSong(url, output) {
        const outputDir = path.dirname(output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        await youtubedl(url, {
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
    }

    async saveTrackRegistry() {
        const registryPath = path.join(__dirname, 'trackRegistry.json');
        try {
            await fs.promises.writeFile(
                registryPath,
                JSON.stringify(Object.fromEntries(this.trackRegistry), null, 2)
            );
        } catch (error) {
            console.error('Error saving track registry:', error);
        }
    }

    async loadTrackRegistry() {
        const registryPath = path.join(__dirname, 'trackRegistry.json');
        try {
            if (fs.existsSync(registryPath)) {
                const data = JSON.parse(await fs.promises.readFile(registryPath, 'utf8'));
                this.trackRegistry = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Error loading track registry:', error);
        }
    }

    getFfmpegPath() {
        const platform = os.platform();
        
        if (platform === 'win32') {
            const windowsPath = path.resolve(__dirname, '..', '..', 'ffmpeg', 'bin', 'ffmpeg.exe');
            if (!fs.existsSync(windowsPath)) {
                throw new Error(`ffmpeg not found at path: ${windowsPath}`);
            }
            console.log('Found ffmpeg at:', windowsPath);
            return windowsPath;
        } else if (platform === 'darwin') {
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

module.exports = MusicDownloader;