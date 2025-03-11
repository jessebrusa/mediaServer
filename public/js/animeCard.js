class AnimeCard {
    constructor(container) {
        this.container = container;
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
                const response = await fetch(`/scrape?href=${encodeURIComponent(card.dataset.href)}`);
                const result = await response.json();
                console.log(result);
                // Handle the result as needed
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
}

export default AnimeCard;