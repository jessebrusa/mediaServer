const DownloadTrack = require('./downloadTrack');

class MusicDownloader {
    constructor(directory, trackList) {
        this.directory = directory;
        this.trackList = trackList;
    }

    async downloadTrack() {

    }
}

if (require.main === module) {
    const parentDirectory = "E:\Artists\The O'Jays";
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
    new MusicDownloader(parentDirectory, trackList);
}

module.exports = MusicDownloader;