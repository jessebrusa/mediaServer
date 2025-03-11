const { JSDOM } = require('jsdom');

class ExtractVideoSrc {
    constructor(page) {
        this.page = page;
        this.iframe = null;
        this.videoElement = null;
        this.videoHtml = null;
        this.videoSrc = null;
        this.soup = null;
    }

    async getVideoSrc() {
        await this.setIframe();
        if (!this.soup) {
            console.log('Failed to set iframe or parse iframe content.');
            return null;
        }
        await this.extractVideoElement();
        if (!this.videoElement) {
            console.log('No video element found.');
            return null;
        }
        await this.extractVideoSrc();
        if (this.videoSrc) {
            return this.videoSrc;
        }
        return null;
    }

    async setIframe() {
        try {
            await this.page.waitForTimeout(1250);
            
            this.iframe = await this.page.$('iframe#frameNewcizgifilmuploads0');
            if (!this.iframe) {
                await this.page.waitForSelector('iframe', { timeout: 30000 });
                this.iframe = await this.page.$('iframe');
            }
            
            if (!this.iframe) {
                console.log('No iframe element found.');
                return null;
            }
            
            const iframeContent = await this.iframe.contentFrame();
            const iframeHtml = await iframeContent.content();
            this.soup = new JSDOM(iframeHtml).window.document;
        } catch (e) {
            console.log(e);
        }
    }

    async extractVideoElement() {
        if (!this.soup) {
            console.log('Soup not initialized.');
            return;
        }
        const videoSelector = 'video#video-js_html5_api, video#hls_html5_api';
        const videoElement = this.soup.querySelector(videoSelector);
        if (videoElement) {
            this.videoHtml = videoElement.outerHTML;
            this.videoElement = videoElement;
        } else {
            console.log('No video element found.');
        }
    }

    async extractVideoSrc() {
        if (this.videoElement) {
            this.videoSrc = this.videoElement.getAttribute('src');
            if (this.videoSrc) {
                return;
            }
            const comments = Array.from(this.soup.childNodes).filter(node => node.nodeType === 8); // Node.COMMENT_NODE
            for (const comment of comments) {
                const doc = new JSDOM(comment.nodeValue).window.document;
                const sourceElement = doc.querySelector('source');
                if (sourceElement) {
                    this.videoSrc = sourceElement.getAttribute('src');
                    if (this.videoSrc) {
                        return;
                    }
                }
            }
        }
    }

    async reloadPage() {
        await this.page.reload({ waitUntil: 'load' });
    }

    async getCookies() {
        return await this.page.context().cookies();
    }
}

module.exports = ExtractVideoSrc;