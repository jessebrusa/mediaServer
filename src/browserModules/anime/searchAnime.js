class SearchAnime {
    constructor(page) {
        this.page = page;
    }

    async searchTitle(title) {
        await this.page.fill('input#searchbox', title);
        await this.page.press('input#searchbox', 'Enter');
    }

    async collectTitles() {
        await this.page.waitForSelector('.cerceve'); // Wait for the elements to be loaded
        const titles = await this.page.$$eval('.cerceve', elements => {
            return elements.map(element => {
                const titleElement = element.querySelector('.aramadabaslik a');
                const imgElement = element.querySelector('img');
                return {
                    title: titleElement ? titleElement.getAttribute('title') : null,
                    href: titleElement ? titleElement.getAttribute('href') : null,
                    imgSrc: imgElement ? imgElement.getAttribute('src') : null
                };
            });
        });
        return titles;
    }
}

module.exports = SearchAnime;