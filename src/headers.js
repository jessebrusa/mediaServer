const os = require('os');

class Headers {
  static getHeaders() {
    const platform = os.platform();
    const cookies = 'your_cookie_string_here'; // Replace with actual cookies if needed
    const commonHeaders = {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'cookie': cookies,
      'referer': 'https://embed.watchanimesub.net/inc/embed/video-js.php?file=Watch%20Dragon%20Ball%20Heroes%20Episode%201.flv&hd=1&pid=423566&h=fbdeffbb573d679d7258e6ab47fbb710&t=1740872269&embed=www',
      'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-storage-access': 'active',
      'x-requested-with': 'XMLHttpRequest'
    };

    if (platform === 'win32') {
      return {
        ...commonHeaders,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"'
      };
    } else if (platform === 'darwin') {
      return {
        ...commonHeaders,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"macOS"'
      };
    } else {
      throw new Error('Unsupported platform');
    }
  }
}

module.exports = Headers;