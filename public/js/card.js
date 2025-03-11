class Card {
    constructor(container, createAnimeOtherCards, createTitleInput) {
        this.container = container;
        this.createAnimeOtherCards = createAnimeOtherCards;
        this.createTitleInput = createTitleInput;
    }

    createCard() {
        const button = document.createElement('button');
        button.classList.add('movieTvCard', 'cardButton');
        return button;
    }

    createMovieCard() {
        const card = this.createCard();
        const movieCard = document.createElement('h2');
        movieCard.textContent = 'Movie';
        card.appendChild(movieCard);

        card.addEventListener('click', () => {
            console.log('Movie');
            this.removeCards();
            this.createAnimeOtherCards();
        });

        this.container.appendChild(card);
    }

    createTvCard() {
        const card = this.createCard();
        const tvCard = document.createElement('h2');
        tvCard.textContent = 'TV Show';
        card.appendChild(tvCard);

        card.addEventListener('click', () => {
            console.log('TV Show');
            this.removeCards();
            this.createAnimeOtherCards();
        });

        this.container.appendChild(card);
    }

    createAnimeCard() {
        const card = this.createCard();
        const animeCard = document.createElement('h2');
        animeCard.textContent = 'Anime';
        card.appendChild(animeCard);

        card.addEventListener('click', () => {
            console.log('Anime');
            this.removeCards();
            this.createTitleInput();
        });

        this.container.appendChild(card);
    }

    createOtherCard() {
        const card = this.createCard();
        const otherCard = document.createElement('h2');
        otherCard.textContent = 'Other';
        card.appendChild(otherCard);

        card.addEventListener('click', () => {
            console.log('Other');
            this.removeCards();
            this.createTitleInput();
        });

        this.container.appendChild(card);
    }

    removeCards() {
        const cards = document.getElementsByClassName('cardButton');
        while (cards.length > 0) {
            cards[0].remove();
        }
    }
}

export default Card;