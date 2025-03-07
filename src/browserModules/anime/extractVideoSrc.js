class ExtractVideoSrc {
    constructor(page) {
        this.page = page;
        this.iframe = null;
        this.videoElement = null;
        this.videoSrc = null;
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
            await this.page.waitForSelector('iframe#frameNewcizgifilmuploads0', { timeout: 10000 });
            this.iframe = await this.page.$('iframe#frameNewcizgifilmuploads0');
            
            if (!this.iframe) {
                this.iframe = await this.page.$('iframe');
            }
            
            if (!this.iframe) {
                console.log('No iframe element found.');
                return null;
            }
            
            const iframeContent = await this.iframe.contentFrame();
            const iframeHtml = await iframeContent.content();
            this.soup = new DOMParser().parseFromString(iframeHtml, 'text/html');
        } catch (e) {
            console.log(e);
        }
    }

    async extractVideoElement() {
        const videoSelector = 'video#video-js_html5_api, video#hls_html5_api';
        const iframeContent = await this.iframe.contentFrame();
        
        if (!iframeContent) {
            console.log('No iframe content found.');
            return null;
        }

        const videoElement = await iframeContent.$(videoSelector);
        
        if (videoElement) {
            this.videoHtml = await iframeContent.evaluate(el => el.outerHTML, videoElement);
            this.videoElement = videoElement;
        } else {
            console.log('No video element found.');
        }
    }

    async extractVideoSrc() {
        if (this.videoElement) {
            this.videoSrc = await this.videoElement.getProperty('src');
            this.videoSrc = this.videoSrc.jsonValue();
            if (this.videoSrc) {
                return;
            }
            const comments = await this.page.evaluate(() => {
                const comments = [];
                const treeWalker = document.createTreeWalker(
                    document,
                    NodeFilter.SHOW_COMMENT,
                    { acceptNode: () => NodeFilter.FILTER_ACCEPT },
                    false
                );
                while (treeWalker.nextNode()) {
                    comments.push(treeWalker.currentNode.nodeValue);
                }
                return comments;
            });

            for (const comment of comments) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(comment, 'text/html');
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
}

module.exports = ExtractVideoSrc;