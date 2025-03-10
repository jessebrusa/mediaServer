const { chromium } = require('playwright');
const SearchAnime = require('./browserModules/anime/searchAnime');
const CompileEpisodes = require('./browserModules/anime/compileEpisodes');
const ExtractVideoSrc = require('./browserModules/anime/extractVideoSrc');
const Headers = require('./headers');

class BrowserManager {
  constructor() {
    this.headlessBrowser = null;
    this.nonHeadlessBrowser = null;
    this.base_anime_url = 'https://www.wcostream.tv';
  }

  async startBrowsers() {
    const executablePath = '/Users/jessebrusa/Library/Caches/ms-playwright/chromium-1155/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
    
    if (!this.headlessBrowser) {
      this.headlessBrowser = await chromium.launch({ headless: true, executablePath });
    }
    if (!this.nonHeadlessBrowser) {
      this.nonHeadlessBrowser = await chromium.launch({ headless: false, executablePath });
    }
  }

  async newPage(headless = true) {
    const browser = headless ? this.headlessBrowser : this.nonHeadlessBrowser;
    if (!browser) {
      throw new Error('Browser is not started. Call startBrowsers() first.');
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    return { context, page };
  }

  async searchAnime(page, title) {
    await page.goto(this.base_anime_url);
    const searchAnime = new SearchAnime(page);
    await searchAnime.searchTitle(title);
    return await searchAnime.collectTitles();
  }

  async selectAnime(page, href) {
    const url = `${this.base_anime_url}${href}`;
    await page.goto(url);
    const compileEpisodes = new CompileEpisodes(page);
    const episodes = await compileEpisodes.compileEpisodes();
    return episodes;
  }

    async extractVideoSrcs(data) {
      const episodes = data.episodes;
      const batchSize = 10; 
      let processedCount = 0;
      const totalEpisodes = episodes.length;
      const headers = Headers.getHeaders();
      const maxRetries = 3; 
    
      for (let i = 0; i < totalEpisodes; i += batchSize) {
        const batch = episodes.slice(i, i + batchSize);
        const promises = batch.map(async (episode) => {
          let retries = 0;
          let success = false;
          let videoSrc = null;
    
          while (retries < maxRetries && !success) {
            try {
              const { context, page } = await this.newPage(false);
              await page.setExtraHTTPHeaders(headers);
              await page.goto(episode.url);
              const extractVideoSrc = new ExtractVideoSrc(page);
              videoSrc = await extractVideoSrc.getVideoSrc();
              if (!videoSrc) {
                await extractVideoSrc.reloadPage();
                videoSrc = await extractVideoSrc.getVideoSrc();
              }
              await this.closeContext(context);
              success = true;
            } catch (error) {
              retries++;
              console.error(`Error processing ${episode.episodeTitle}. Attempt ${retries} of ${maxRetries}. Error: ${error.message}`);
              if (retries >= maxRetries) {
                console.error(`Failed to process ${episode.episodeTitle} after ${maxRetries} attempts.`);
              }
            }
          }
    
          episode.videoSrc = videoSrc;
          return episode;
        });
    
        const batchResults = await Promise.all(promises);
        processedCount += batch.length;
        console.log(`Processed ${processedCount}/${totalEpisodes} episodes`);
      }
    
      return data;
    }

  async closeContext(context) {
    await context.close();
  }
}

module.exports = BrowserManager;