const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="css/audioplayer.css">

    <menu-bar-component></menu-bar-component>
    <visualizer-component></visualizer-component>
    <playlist-component></playlist-component>
    <div class="pagination">
        <div class="music-title">
            <div class="image">
                <img src="assets/image/pochette_album.png" alt="" />
            </div>
            <div class="title">
                <h2>
                    <span></span>
                </h2>
            </div>
        </div>
        <div class="controls">
            <div class="progress-container">
                <input type="range" class="progress" min="0" max="100" value="0" />
                <div class="value-of-range">
                    <div class="value">0</div>
                </div>
            </div>
            <div class="main-controls">
                <i class="ripple control-button prev fas fa-step-backward"></i>
                <i class="ripple control-button play fas fa-play"></i>
                <i class="ripple control-button next fas fa-step-forward"></i>
            </div>
        </div>
    </div>
    <audio src=""></audio>
    `;

class AudioPlayer extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.audioElement = this.shadowRoot.querySelector('audio');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;

        // SELECTING ELEMENTS.
        this.ripple_buttons = this.shadowRoot.querySelectorAll(".ripple"),
        this.value_of_range = this.shadowRoot.querySelector(".value-of-range"),
        this.progress = this.shadowRoot.querySelector(".progress"),
        this.prev_btn = this.shadowRoot.querySelector(".prev"),
        this.play_btn = this.shadowRoot.querySelector(".play"),
        this.next_btn = this.shadowRoot.querySelector(".next"),
        this.shuffle_btn = this.shadowRoot.querySelector(".shuffle");
    }

    connectedCallback() {

        document.addEventListener('musicSelected', (event) => {
            const titleH2 = this.shadowRoot.querySelector('.title h2');
            const titleSpan = titleH2.querySelector('span');

            titleSpan.textContent = event.detail.musicTitle;

            // Ajouter la classe scroll à titleH2 si la longueur du titre est supérieure à 13
            if (event.detail.musicTitle.length > 13) {
                titleH2.classList.add("scroll");
            } else {
                // Assurez-vous de retirer la classe si la longueur du titre n'est pas supérieure à 13
                titleH2.classList.remove("scroll");
            }
            
            this.audioElement.src = `/assets/music/${event.detail.musicTitle}`;
            this.audioContext.resume().then(() => {
                this.audioElement.play();
                // Vous pouvez ajouter d'autres fonctionnalités ici, comme l'égalisation, etc.
            });
            // this.audioElement.play();
            this.progress.max = this.audioElement.duration;
            
            this.checkPaused();
        });

        // Bouton play
        this.play_btn.addEventListener("click", () => {
            if (this.audioElement.paused) {
                this.audioElement.play();
            } else {
                this.audioElement.pause();
            }
            this.checkPaused();
        });

        // Barre de progression
        this.audioElement.addEventListener('timeupdate', () => {
            this.changeCurrentTime();
            this.checkPaused();
        });

        this.progress.addEventListener('input', () => {
            this.audioElement.currentTime = (this.progress.value / 100) * this.audioElement.duration;
            this.changeCurrentTime(); // Call your custom function
        });

        // Bouton next
        this.next_btn.addEventListener("click", () => {
            document.dispatchEvent(new Event('playNextMusic'));
        });

        document.addEventListener('playNext', (event) => {
            this.shadowRoot.querySelector('.title h2 span').textContent = event.detail.musicTitle;
            this.audioElement.src = `/assets/music/${event.detail.musicTitle}`;
            this.audioElement.play();
            this.progress.max = this.audioElement.duration;
            this.checkPaused();
        });

        // Bouton previous
        this.prev_btn.addEventListener("click", () => {
            document.dispatchEvent(new Event('playPreviousMusic'));
        });

        document.addEventListener('playPrevious', (event) => {
            this.shadowRoot.querySelector('.title h2 span').textContent = event.detail.musicTitle;
            this.audioElement.src = `/assets/music/${event.detail.musicTitle}`;
            this.audioElement.play();
            this.progress.max = this.audioElement.duration;
            this.checkPaused();
        });


    }

    // Affichage du bouton Play/Pause.
    checkPaused() {
        if (this.audioElement.paused) {
            this.play_btn.classList.add("fa-play");
            this.play_btn.classList.remove("fa-pause");
        } else {
            this.play_btn.classList.remove("fa-play");
            this.play_btn.classList.add("fa-pause");
        }
    }

    changeCurrentTime() {
        let progressValue = 0;

        if (this.audioElement.duration > 0) {
            progressValue = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        }
    
        this.progress.value = progressValue;

        let minute = Math.floor(this.audioElement.currentTime / 60);
        let second = Math.floor(this.audioElement.currentTime % 60);
        this.value_of_range.querySelector(".value").textContent = `${minute}:${second}`;
        this.value_of_range.setAttribute(
            "style",
            `left: ${(this.audioElement.currentTime / this.audioElement.duration) * 100}%`
        );
    }

}

customElements.define('audio-player-component', AudioPlayer)