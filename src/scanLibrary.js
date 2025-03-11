const axios = require('axios');

class ScanLibrary {
  constructor() {
    this.plexServerUrl = 'http://127.0.0.1:32400';
    this.plexToken = 'H-TkG8ZfEBMZWzMkNyJo';
  }

  async scanLibrary(librarySectionId) {
    const headers = {
      'X-Plex-Token': this.plexToken
    };
    const url = `${this.plexServerUrl}/library/sections/${librarySectionId}/refresh`;
    try {
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        console.log(`Successfully started scan for library section ${librarySectionId}.`);
      } else {
        console.log(`Failed to start scan for library section ${librarySectionId}. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error starting scan for library section ${librarySectionId}:`, error);
    }
  }

  async getLibrarySections() {
    const headers = {
      'X-Plex-Token': this.plexToken
    };
    const url = `${this.plexServerUrl}/library/sections`;
    try {
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        const sections = response.data.MediaContainer.Directory;
        sections.forEach(section => {
          console.log(`Library Name: ${section.title}, Library ID: ${section.key}`);
        });
      } else {
        console.log(`Failed to get library sections. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting library sections:', error);
    }
  }
}

module.exports = ScanLibrary;