const EpisodeProcessor = require('./episodeProcessor');

class CompileEpisodes {
  constructor(page) {
    this.page = page;
    this.episodes = [];
    this.episodeElements = [];
    this.assigned_episode_numbers = {};
  }

  async compileEpisodes() {
    await this.collectEpisodeElements();
    await this.processEpisodeElements();
    this.episodes.reverse();
    return this.episodes;
  }

  async collectEpisodeElements() {
    this.episodeElements = await this.page.$$('#catlist-listview li a');
  }

  async processEpisodeElements() {
    for (let episodeElement of this.episodeElements) {
      const episodeData = new EpisodeProcessor(episodeElement, this.assigned_episode_numbers);
      const processedEpisode = await episodeData.process_episode();
      if (processedEpisode['episodeTitle'] !== null && processedEpisode['episodeTitle'] !== undefined) {
        this.episodes.push(processedEpisode);
      }
    }
  }
}

module.exports = CompileEpisodes;