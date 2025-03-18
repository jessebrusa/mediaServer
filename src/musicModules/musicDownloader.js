const DownloadTrack = require('./downloadTrack');
const path = require('path');

class MusicDownloader {
    constructor(directory, trackList) {
        this.directory = directory;
        this.trackList = trackList;
        this.batchSize = 10;
    }

    async downloadTracks() {
        console.log(`Starting downloads for ${this.trackList.length} tracks`);
        
        const batches = [];
        for (let i = 0; i < this.trackList.length; i += this.batchSize) {
            batches.push(this.trackList.slice(i, i + this.batchSize));
        }

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];

            console.log(`\nStarting batch ${i + 1}/${batches.length} (${batch.length} tracks)`);
            
            const downloadPromises = batch.map((track, trackIndex) => {
                const downloader = new DownloadTrack(track, this.directory);
                
                return downloader.download()
                    .then(() => {
                        console.log(`✓ Batch ${i + 1}/${batches.length}: ${trackIndex + 1}/${batch.length} - "${track}" completed`);
                    })
                    .catch(error => {
                        console.error(`✗ Batch ${i + 1}/${batches.length}: ${trackIndex + 1}/${batch.length} - Failed to download "${track}": ${error.message}`);
                    });
            });

            await Promise.all(downloadPromises);
            console.log(`\nCompleted batch ${i + 1}/${batches.length}`);

            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\nAll downloads completed');
    }
}

if (require.main === module) {
    const outputDirectory = path.join('E:', 'Artists', "The O'Jays");
    const trackList = [
        'Love Train (Re-Recorded / Remastered)',
        'Back Stabbers',
        'For the Love of Money',
        'I Love Music',
        'Now That We Found Love',
        'Use ta Be My Girl',
        'Give the People What They Want',
        'Time to Get Down',
        'Forever Mine',
        'Stairway to Heaven',
        'Sunshine',
        "Darlin' Darlin' Baby (Sweet, Tender, Love)",
        'Cry Together',
        'Put Your Hands Together',
        '992 Arguments',
        "When the World's at Peace",
        'Who Am I',
        'Let Me Make Love To You',
        "Lovin' You"
    ];
    const downloader = new MusicDownloader(outputDirectory, trackList);
    downloader.downloadTracks()
        .then(() => console.log('All downloads completed'))
        .catch(error => console.error('Error:', error));
}

module.exports = MusicDownloader;