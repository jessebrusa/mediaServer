class EpisodeProcessor {
    constructor(element, assigned_episode_numbers) {
        this.element = element;
        this.assigned_episode_numbers = assigned_episode_numbers;
        this.episodeTitle = null;
        this.href = null;
        this.seasonNumber = null;
        this.episodeNumber = null;
        this.outputFileName = null;
    }

    async process_episode() {
        await this.process_episode_title();
        await this.process_episode_href();
        await this.process_season_number();
        await this.process_episode_number();
        this.outputFileName = `s${this.seasonNumber}e${this.episodeNumber}.mp4`;
        return {
            'episodeTitle': this.episodeTitle,
            'href': this.href,
            'seasonNumber': this.seasonNumber,
            'episodeNumber': this.episodeNumber,
            'outputFileName': this.outputFileName
        }
    }

    async process_episode_title() {
        this.episodeTitle = await this.element.textContent();
    }

    async process_episode_href() {
        this.href = await this.element.getAttribute('href');
    }

    async process_season_number() {
        const title = await this.element.textContent();
        const match = title.match(/Season (\d+)/i);
        if (match) {
            this.seasonNumber = `${parseInt(match[1], 10).toString().padStart(2, '0')}`;
        } else {
            this.seasonNumber = '01';
        }
    }

    async process_episode_number() {
        const title = await this.element.textContent();
        const match = title.match(/Episode (\d+)/i);
        let episodeNumber;
        if (match) {
            episodeNumber = parseInt(match[1], 10);
        } else {
            episodeNumber = 1;
        }

        const seasonKey = `Season ${this.seasonNumber}`;
        if (!this.assigned_episode_numbers[seasonKey]) {
            this.assigned_episode_numbers[seasonKey] = new Set();
        }

        while (this.assigned_episode_numbers[seasonKey].has(episodeNumber)) {
            episodeNumber += 1;
        }

        this.assigned_episode_numbers[seasonKey].add(episodeNumber);
        this.episodeNumber = episodeNumber.toString().padStart(2, '0');
    }
}

module.exports = EpisodeProcessor;