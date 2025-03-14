class MusicFileManager {
    constructor(albumData) {
        this.albumData = albumData;
    }

    async createFileStructure() {
        console.log('Creating file structure...');
        console.log(this.albumData);
        const albumNames = await this.extractAlbumNames();
        console.log(albumNames);
    }

    async extractAlbumNames() {
        return this.albumData.map(album => album.name);
    }
} 

module.exports = MusicFileManager;