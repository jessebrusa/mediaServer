class TitleInput {
    constructor(container, onSubmit) {
        this.container = container;
        this.onSubmit = onSubmit;
    }

    create() {
        const container = document.createElement('div');
        container.classList.add('titleInputContainer');

        const header = document.createElement('h2');
        header.textContent = 'Please put in your title';
        container.appendChild(header);

        const inputContainer = document.createElement('div');
        inputContainer.classList.add('inputContainer');

        const titleInput = document.createElement('input');
        titleInput.placeholder = 'Title';
        titleInput.type = 'text';
        titleInput.id = 'titleInput';
        inputContainer.appendChild(titleInput);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.id = 'submitButton';
        inputContainer.appendChild(submitButton);

        const loadingSpinner = document.createElement('div');
        loadingSpinner.classList.add('loadingSpinner');
        loadingSpinner.style.display = 'none';
        inputContainer.appendChild(loadingSpinner);

        container.appendChild(inputContainer);
        this.container.appendChild(container);

        this.onTitleSubmit();
    }

    onTitleSubmit() {
        const submitButton = document.getElementById('submitButton');
        const titleInput = document.getElementById('titleInput');
        const loadingSpinner = document.querySelector('.loadingSpinner');

        const submit = () => {
            loadingSpinner.style.display = 'block'; 
            this.onSubmit(titleInput.value).finally(() => {
                loadingSpinner.style.display = 'none'; 
            });
        };

        submitButton.addEventListener('click', submit);

        titleInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                submitButton.click();
            }
        });
    }

    removeTitleInput() {
        const titleInput = document.getElementsByClassName('titleInputContainer');
        while (titleInput.length > 0) {
            titleInput[0].remove();
        }
    }
}

export default TitleInput;