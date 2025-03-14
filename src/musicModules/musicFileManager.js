const fs = require('fs').promises;
const path = require('path');

class MusicFileManager {
    constructor(albumData) {
        this.albumData = albumData;
        this.parentDirectory = null;
        this.albumPaths = new Map();
    }

    async createFileStructure() {
        await this.setParentDirectory();
        await this.extractArtistName();
        this.removeDuplicateAlbums();
        await this.extractAlbumNames();
        await this.createArtistDirectory();
        await this.createAlbumDirectories();
        return this.getAlbumPaths();
    }

    async setParentDirectory() {
        const isWindows = process.platform === 'win32';
        this.parentDirectory = isWindows ? 'E:\\Albums' : '/Albums';
    }

    async extractArtistName() {
        return this.albumData.artist.name;
    }

    async extractAlbumNames() {
        return this.albumData.albums.map(album => album.name);
    }

    normalizeName(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    removeDuplicateAlbums() {
        const seen = new Map();
        const duplicates = new Set();

        // First pass: identify duplicates
        this.albumData.albums.forEach(album => {
            const normalized = this.normalizeName(album.name);
            if (seen.has(normalized)) {
                duplicates.add(normalized);
                console.log(`Found duplicate: "${album.name}" matches "${seen.get(normalized)}"`);
            } else {
                seen.set(normalized, album.name);
            }
        });

        // Second pass: keep only the first occurrence of each album
        this.albumData.albums = this.albumData.albums.filter(album => {
            const normalized = this.normalizeName(album.name);
            if (duplicates.has(normalized)) {
                const isFirst = seen.get(normalized) === album.name;
                if (!isFirst) {
                    console.log(`Removing duplicate: "${album.name}"`);
                }
                return isFirst;
            }
            return true;
        });
    }

    async createArtistDirectory() {
        const artistName = this.sanitizeName(this.albumData.artist.name);
        const artistDirectory = path.join(this.parentDirectory, artistName);
        try {
            await fs.mkdir(artistDirectory, { recursive: true });
            console.log(`Created directory: ${artistDirectory}`);
        } catch (error) {
            console.error(`Error creating directory: ${error}`);
        }
    }

    async createAlbumDirectories() {
        const artistName = this.sanitizeName(this.albumData.artist.name);
        const artistDirectory = path.join(this.parentDirectory, artistName);
        
        for (const album of this.albumData.albums) {
            const albumName = this.sanitizeName(album.name);
            const albumDirectory = path.join(artistDirectory, albumName);
            try {
                await fs.mkdir(albumDirectory, { recursive: true });
                console.log(`Created directory: ${albumDirectory}`);
                
                // Store album path and tracks with original name as key
                this.albumPaths.set(album.name, {
                    filePath: albumDirectory,
                    tracks: album.tracks || []
                });
    
                // Write track list to a file in the album directory
                const trackListPath = path.join(albumDirectory, 'tracks.json');
                await fs.writeFile(
                    trackListPath,
                    JSON.stringify({ 
                        albumName: album.name,
                        tracks: album.tracks || []
                    }, null, 2)
                );
            } catch (error) {
                console.error(`Error creating directory: ${error}`);
            }
        }
    }

    getAlbumPaths() {
        return this.albumPaths;
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
    // Test the class with sample data
    const testData = {
        artist: {
            name: "The Carpenters"
        },
        albums: [
            { name: "Carpenters Gold - 35th Anniversary Edition" },
            { name: "Carpenters Gold (35th Anniversary Edition)" },
            { name: "Voice Of The Heart" },
            { name: "Gold: Greatest Hits" },
            { name: "Gold - Greatest Hits" }
        ]
    };

    const manager = new MusicFileManager(testData);
    manager.createFileStructure()
        .then(() => console.log('File structure created successfully'))
        .catch(error => console.error('Error:', error));
}

module.exports = MusicFileManager;