const { chromium } = require('playwright');
const SearchAnime = require('./browserModules/anime/searchAnime');
const CompileEpisodes = require('./browserModules/anime/compileEpisodes');
const ExtractVideoSrc = require('./browserModules/anime/extractVideoSrc');
const Headers = require('./browserModules/headers');

class BrowserManager {
  constructor() {
    this.headlessBrowser = null;
    this.nonHeadlessBrowser = null;
    this.base_anime_url = 'https://www.wcostream.tv';
  }

  async startBrowsers() {
    if (!this.headlessBrowser) {
      this.headlessBrowser = await chromium.launch({ headless: true });
    }
    if (!this.nonHeadlessBrowser) {
      this.nonHeadlessBrowser = await chromium.launch({ headless: false });
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

  async extractVideoSrcs(episodes) {
    const videoSrcs = [];
    const batchSize = 10; 
    let processedCount = 0;
    const totalEpisodes = episodes.length;
    const headers = Headers.getHeaders();

    for (let i = 0; i < totalEpisodes; i += batchSize) {
      const batch = episodes.slice(i, i + batchSize);
      const promises = batch.map(async (episode) => {
        const { context, page } = await this.newPage(false);

        // Set headers and cookies
        await page.setExtraHTTPHeaders(headers);

        await page.goto(episode.url);
        const extractVideoSrc = new ExtractVideoSrc(page);
        const videoSrc = await extractVideoSrc.getVideoSrc();
        await this.closeContext(context);
        return videoSrc;
      });

      const batchResults = await Promise.all(promises);
      videoSrcs.push(...batchResults);
      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${totalEpisodes} episodes`);
    }

    console.log(videoSrcs);
    return videoSrcs;
  }

  async closeContext(context) {
    await context.close();
  }
}

module.exports = BrowserManager;