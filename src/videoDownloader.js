const fs = require('fs');
const axios = require('axios');
const readline = require('readline');
const path = require('path');
const Headers = require('./headers');

class VideoDownloader {
  async downloadMultiple(episodes, fileManager, batchSize = 10) {
    for (let i = 0; i < episodes.length; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      const promises = batch.map(async (episode) => {
        const videoUrl = episode.videoSrc;
        if (videoUrl) {
          const seasonDir = fileManager.getSeasonDirectory(episode.seasonNumber);
          if (!fs.existsSync(seasonDir)) {
            fs.mkdirSync(seasonDir, { recursive: true });
          }
          const outputFileName = path.join(seasonDir, `${episode.outputFileName}`);
          await this.download(videoUrl, outputFileName);
        } else {
          console.error(`Invalid video URL for episode: ${episode.episodeTitle}`);
        }
      });

      await Promise.all(promises);
    }
  }

  async download(url, outputPath, numParts = 10) {
    if (!url) {
      throw new Error('Invalid URL');
    }

    const headers = Headers.getHeaders();
    const response = await axios({
      url,
      method: 'HEAD',
      headers: headers
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get video headers. Status code: ${response.status}`);
    }

    const contentLength = parseInt(response.headers['content-length'], 10);
    const partSize = Math.ceil(contentLength / numParts);
    console.log(`Content-Length: ${contentLength}, Part Size: ${partSize}`);

    let downloadedLength = 0;

    const downloadPromises = [];
    for (let i = 0; i < numParts; i++) {
      const start = i * partSize;
      const end = (i + 1) * partSize - 1;
      downloadPromises.push(this.downloadPart(url, headers, start, end, i, outputPath, contentLength, downloadedLength));
    }

    await Promise.all(downloadPromises);

    this.combineParts(outputPath, numParts);
    console.log(`\nSuccessfully downloaded video to ${outputPath}`);
  }

  async downloadPart(url, headers, start, end, partIndex, outputPath, contentLength, downloadedLength) {
    const partHeaders = {
      ...headers,
      Range: `bytes=${start}-${end}`
    };

    const partResponse = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: partHeaders
    });

    if (partResponse.status !== 206) {
      throw new Error(`Failed to download part ${partIndex}. Status code: ${partResponse.status}`);
    }

    const partPath = `${outputPath}.part${partIndex}`;
    const writer = fs.createWriteStream(partPath);

    partResponse.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      this.updateProgress(downloadedLength, contentLength);
    });

    partResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`\nPart ${partIndex} downloaded successfully`);
        resolve();
      });
      writer.on('error', (err) => {
        console.error(`Error writing part ${partIndex} to file: ${err}`);
        reject(err);
      });
    });
  }

  updateProgress(downloadedLength, contentLength) {
    const progress = ((downloadedLength / contentLength) * 100).toFixed(2);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Downloaded ${progress}% (${downloadedLength}/${contentLength} bytes)`);
  }

  combineParts(outputPath, numParts) {
    const writer = fs.createWriteStream(outputPath);
    for (let i = 0; i < numParts; i++) {
      const partPath = `${outputPath}.part${i}`;
      const data = fs.readFileSync(partPath);
      writer.write(data);
      fs.unlinkSync(partPath);
    }
    writer.end();
  }
}

module.exports = VideoDownloader;