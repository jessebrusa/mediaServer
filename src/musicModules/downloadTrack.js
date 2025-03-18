const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const os = require('os');

class DownloadTrack {
    constructor(title, outputDirectory) {
        this.title = title;
        this.outputDirectory = outputDirectory;
        this.output = null;
        this.url = null;
        this.ffmpegPath = this.getFfmpegPath();
    }

    async download() {
        const cleanTitle = this.sanitizeName(this.title);
        this.output = path.join(this.outputDirectory, `${cleanTitle}.mp3`);
        await this.searchTrack();
        await this.downloadTrack(this.output);
    }

    async searchTrack() {
        try {
            console.log(`Searching for: ${this.title}`);
            const searchResult = await youtubedl(
                `ytsearch1:${this.title}`,
                {
                    dumpSingleJson: true,
                    noCheckCertificates: true,
                    noWarnings: true
                }
            );
    
            if (searchResult?.entries?.[0]?.webpage_url) {
                this.url = searchResult.entries[0].webpage_url;
                console.log(`Found video URL: ${this.url}`);
                return;
            }
            
            throw new Error(`No results found for: ${this.title}`);
        } catch (error) {
            console.error(`Error searching for "${this.title}":`, error.message);
            throw error;
        }
    }

    getFfmpegPath() {
        const ffmpegPath = path.resolve(__dirname, '..', '..', 'ffmpeg', 'bin', 'ffmpeg.exe');
        if (!fs.existsSync(ffmpegPath)) {
            throw new Error(`ffmpeg not found at: ${ffmpegPath}`);
        }
        console.log('Using ffmpeg from:', ffmpegPath);
        return ffmpegPath;
    }

    async downloadTrack() {
        if (!this.url) {
            throw new Error('No URL set for download');
        }

        console.log(`Downloading to: ${this.output}`);
        await youtubedl(this.url, {
            output: this.output,
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0,
            ffmpegLocation: this.ffmpegPath,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });
    }

    sanitizeName(name) {
        return name
            // Replace invalid characters with underscores
            .replace(/[<>:"/\\|?*]/g, '_')
            // Remove trailing periods (Windows restriction)
            .replace(/\.+$/, '')
            // Remove leading/trailing whitespace
            .trim();
    }

}

if (require.main === module) {
    const title = 'Love Train (Re-Recorded / Remastered)';
    const outputDirectory = 'E:\\Artists\\The O\'Jays';
    const track = new DownloadTrack(title, outputDirectory);
    track.download()
        .then(() => console.log('Downloaded successfully'))
        .catch(error => console.error('Error:', error));
}

module.exports = DownloadTrack;