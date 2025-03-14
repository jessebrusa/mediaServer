const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

class MusicDownloader {
    constructor() {
        this.ffmpegPath = this.getFfmpegPath();
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
            // Windows path
            const windowsPath = path.resolve(__dirname, '..', 'ffmpeg', 'bin', 'ffmpeg.exe');
            if (!fs.existsSync(windowsPath)) {
                throw new Error(`ffmpeg not found at path: ${windowsPath}`);
            }
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