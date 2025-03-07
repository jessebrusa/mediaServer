const fs = require('fs');
const axios = require('axios');
const readline = require('readline');
const Headers = require('./headers');

class VideoDownloader {
  async download(url, outputPath) {
    const maxRetries = 3;
    let attempt = 0;
    const startTime = Date.now(); // Start the timer

    while (attempt < maxRetries) {
      try {
        const headers = Headers.getHeaders();
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
          headers: headers
        });

        if (response.status !== 200) {
          throw new Error(`Failed to download video. Status code: ${response.status}`);
        }

        const contentLength = response.headers['content-length'];
        console.log(`Content-Length: ${contentLength}`);

        const writer = fs.createWriteStream(outputPath);
        let downloadedLength = 0;

        response.data.on('data', (chunk) => {
          downloadedLength += chunk.length;
          const progress = ((downloadedLength / contentLength) * 100).toFixed(2);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`Downloaded ${progress}%`);
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            const endTime = Date.now(); // End the timer
            const timeTaken = (endTime - startTime) / 1000; // Calculate time taken in seconds
            console.log(`\nSuccessfully downloaded video to ${outputPath} in ${timeTaken} seconds`);
            resolve();
          });
          writer.on('error', (err) => {
            console.error(`Error writing video to file: ${err}`);
            reject(err);
          });
        });
      } catch (err) {
        console.error(`Error downloading video on attempt ${attempt + 1}:`, err);
        attempt += 1;
        if (attempt >= maxRetries) {
          console.error('Max retries reached. Failed to download video.');
          throw err;
        }
      }
    }
  }
}

module.exports = VideoDownloader;