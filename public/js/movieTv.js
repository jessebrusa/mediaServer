import Card from './card.js';
import TitleInput from './titleInput.js';
import AnimeCard from './animeCard.js';

class MovieTv {
    constructor() {
        this.container = document.getElementsByTagName('main')[0];
        this.card = new Card(this.container, this.createAnimeOtherCards.bind(this), this.createTitleInput.bind(this));
        this.titleInput = new TitleInput(this.container, this.onTitleSubmit.bind(this));
        this.animeCard = new AnimeCard(this.container, this); 
    }

    createCards() {
        this.card.createMovieCard();
        this.card.createTvCard();
    }

    createAnimeOtherCards() {
        this.card.createAnimeCard();
        this.card.createOtherCard();
    }

    createTitleInput() {
        this.titleInput.create();
    }

    onTitleSubmit(title) {
        console.log(title);
        return new Promise((resolve, reject) => {
            fetch(`/search-anime?title=${encodeURIComponent(title)}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.card.removeCards();
                    this.titleInput.removeTitleInput();
                    this.animeCard.createCards(data);
                    resolve();
                })
                .catch(error => {
                    console.error('Error:', error);
                    reject(error);
                });
        });
    }
}

export default MovieTv;