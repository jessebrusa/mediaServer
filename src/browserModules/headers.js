const os = require('os');

class Headers {
  static getHeaders() {
    const platform = os.platform();
    if (platform === 'win32') {
      return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.8',
        'Origin': 'https://embed.watchanimesub.net',
        'Referer': 'https://embed.watchanimesub.net/',
        'Sec-CH-UA': '"Not(A:Brand";v="99", "Brave";v="133", "Chromium";v="133"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1'
      };
    } else if (platform === 'darwin') {
      return {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.8',
        'Origin': 'https://embed.watchanimesub.net',
        'Referer': 'https://embed.watchanimesub.net/',
        'Sec-CH-UA': '"Not(A:Brand";v="99", "Brave";v="133", "Chromium";v="133"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1'
      };
    } else {
      throw new Error('Unsupported platform');
    }
  }
}

module.exports = Headers;