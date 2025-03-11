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
    this.atWork = true;
  }

  async startBrowsers() {
    const executablePath = this.atWork ? undefined : '/Users/jessebrusa/Library/Caches/ms-playwright/chromium-1155/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
    
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
    const headers = Headers.getHeaders();
    const maxRetries = 3;
    const batchSize = 10; 
    const totalEpisodes = episodes.length;
  
    for (let i = 0; i < episodes.length; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      const promises = batch.map(async (episode) => {
        let retries = 0;
        let success = false;
        let videoSrc = null;
  
        while (retries < maxRetries && !success) {
          try {
            console.log(`Processing episode ${i + 1} of ${totalEpisodes}: ${episode.episodeTitle}`);
            const { context, page } = await this.newPage(true);
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
            if (retries >= maxRetries) {
              console.error(`Failed to process ${episode.episodeTitle} after ${maxRetries} attempts. Error: ${error.message}`);
            }
          }
        }
  
        episode.videoSrc = videoSrc;
        return episode;
      });
  
      await Promise.all(promises);
    }
  
    return data;
  }

  async closeContext(context) {
    await context.close();
  }
}

module.exports = BrowserManager;