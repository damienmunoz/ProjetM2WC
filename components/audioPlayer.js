import '../assets/lib/webaudio-controls.js';
import '../components/equalizer.js';
import '../components/MenuBar.js';
import '../components/playlist.js';
import '../components/Visualizer.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="css/audioplayer.css">


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
    <equalizer-component id="equalizer"></equalizer-component>
    <menu-bar-component id="menuBar"></menu-bar-component>
    <playlist-component id="playlist"></playlist-component>
    <visualizer-component id="visualizer"></visualizer-component>

    `;
class AudioPlayer extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.isPlaying = false;
        this.menuBar = this.shadowRoot.getElementById("menuBar");
        this.visualizer = this.shadowRoot.getElementById("visualizer");
        this.playlist = this.shadowRoot.getElementById("playlist");
        this.equalizer = this.shadowRoot.getElementById("equalizer");
        // SELECTING ELEMENTS.
        this.ripple_buttons = this.shadowRoot.querySelectorAll(".ripple"),
        this.value_of_range = this.shadowRoot.querySelector(".value-of-range"),
        this.progress = this.shadowRoot.querySelector(".progress"),
        this.prev_btn = this.shadowRoot.querySelector(".prev"),
        this.play_btn = this.shadowRoot.querySelector(".play"),
        this.next_btn = this.shadowRoot.querySelector(".next"),
        this.pagination = this.shadowRoot.querySelector(".pagination");
    }

    connectedCallback() {

        this.initAudio();

        document.addEventListener('musicSelected', (event) => {
            console.log('musicSelected event received:', event.detail);

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
            this.setImageMusic(event);

            this.audioElement.src = `/assets/music/${event.detail.musicTitle}`;
            this.audioContext.resume().then(() => {
                this.audioElement.play();
                // Vous pouvez ajouter d'autres fonctionnalités ici, comme l'égalisation, etc.
            });

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
            this.setImageMusic(event);
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
            this.setImageMusic(event);
            this.audioElement.src = `/assets/music/${event.detail.musicTitle}`;
            this.audioElement.play();
            this.progress.max = this.audioElement.duration;
            this.checkPaused();
        });

        // Ouvrir/Fermer menu
        document.addEventListener('closeButtonClicked', () => {
            if (this.pagination.classList.contains("active")) {
                this.pagination.classList.remove("active");
            } else {
                this.pagination.classList.add("active");
            }
        });

        this.audioElement.onplay = (e) => { this.audioContext.resume(); };

    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
            this.audioElement = this.shadowRoot.querySelector('audio');
            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.sourceNode.connect(this.audioContext.destination);
            this.audioNodes = [this.sourceNode];
        }
        this.initDependencies();

    }

    async connectAudioNode(audioNode, name) {
        return new Promise((resolve) => {
            const checkContext = () => {
                if (this.audioContext) {
                    audioNode.name = name;
                    const length = this.audioNodes.length;
                    const previousNode = this.audioNodes[length - 1];
                    previousNode.connect(audioNode);
                    audioNode.connect(this.audioContext.destination);
                    resolve();
                } else {
                    setTimeout(checkContext, 100);
                }
            };
        checkContext();
        });
    }

    addAudioNode(audioNode, name) {
        audioNode.name = name;
        const length = this.audioNodes.length;
        const previousNode = this.audioNodes[length - 1];
        previousNode.disconnect();
        previousNode.connect(audioNode);
        audioNode.connect(this.audioContext.destination);
        this.audioNodes.push(audioNode);
        console.log(`Linked ${previousNode.name || 'input'} to ${audioNode.name}`);
    }

    initDependencies() {
        setTimeout(() => {
            this.equalizer.audioContext = this.audioContext;
            this.equalizer.addAudioNode = (audioNode, name) => this.connectAudioNode(audioNode, name);
            this.visualizer.audioContext = this.audioContext;
            this.visualizer.addAudioNode = (audioNode) => this.connectAudioNode(audioNode, name);
        }, 100);
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

    setImageMusic(event) {
        const img = this.shadowRoot.querySelector('.image').querySelector('img');
        img.src = `../assets/image/${event.detail.musicTitle.split('.mp3')[0]}.jpg`;
    }

}

customElements.define('audio-player-component', AudioPlayer)
