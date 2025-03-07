const { chromium } = require('playwright');
const SearchAnime = require('./browserModules/anime/searchAnime');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.base_anime_url = 'https://www.wcostream.tv';
  }

  async startBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({headless: false});
    }
  }

  async newPage() {
    if (!this.browser) {
      throw new Error('Browser is not started. Call startBrowser() first.');
    }
    const context = await this.browser.newContext();
    const page = await context.newPage();
    return { context, page };
  }

  async searchAnime(page, title) {
    await page.goto(this.base_anime_url);
    const searchAnime = new SearchAnime(page);
    await searchAnime.searchTitle(title);
    return await searchAnime.collectTitles();
  }

  async selectAnime(href) {
    const url = `${this.base_anime_url}${href}`;
    await page.goto(url);

  }

  async closeContext(context) {
    await context.close();
  }
}

module.exports = BrowserManager;