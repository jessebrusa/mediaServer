class AnimeCard {
    constructor(container, movieTvInstance) {
        this.container = container;
        this.movieTvInstance = movieTvInstance;
    }

    createCard(data) {
        const card = document.createElement('div');
        card.classList.add('animeCard');
        card.dataset.href = data.href;

        const title = document.createElement('h2');
        title.textContent = data.title;
        card.appendChild(title);

        const img = document.createElement('img');
        img.src = data.imgSrc;
        img.alt = data.title;
        card.appendChild(img);

        card.addEventListener('click', async () => {
            console.log(`Navigating to: ${card.dataset.href}`);
            try {
                const response = await fetch(`/select-anime?href=${encodeURIComponent(card.dataset.href)}&title=${encodeURIComponent(data.title)}&imgSrc=${encodeURIComponent(data.imgSrc)}`);
                const result = await response.json();
                console.log(result);
                if (result.success) {
                    this.removeCards();
                    this.showDownloadingMessage(data.title);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        this.container.appendChild(card);
    }

    createCards(dataArray) {
        dataArray.forEach(data => {
            this.createCard(data);
        });
    }

    removeCards() {
        const cards = document.getElementsByClassName('animeCard');
        while (cards.length > 0) {
            cards[0].remove();
        }
    }

    showDownloadingMessage(title) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('downloadingMessage');

        const message = document.createElement('h2');
        message.textContent = `Downloading ${title}...`;
        messageContainer.appendChild(message);

        const button = document.createElement('button');
        button.textContent = 'Search More Media';
        button.addEventListener('click', () => {
            messageContainer.remove();
            this.movieTvInstance.createCards(); // Call createCards on the MovieTv instance
        });
        messageContainer.appendChild(button);

        this.container.appendChild(messageContainer);
    }
}

export default AnimeCard;