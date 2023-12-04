const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="css/visualizer.css">

    <div class="AV-player">
        <canvas></canvas>
        <div class="more-controls">
            <i class="ripple shuffle fas fa-random"></i>
            <i class="ripple repeat fas fa-retweet"></i>
            <i class="ripple volume fas fa-volume-up">
                <div class="value-of-range"></div>
                <input type="range" min="0" max="100" value="100" class="volume-range" />
            </i>
            <i class="ripple list-music fas fa-list-ul"></i>
        </div>
    </div>
    `;

class Visualizer extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.AV_player = this.shadowRoot.querySelector(".AV-player");
    }

    connectedCallback() {
        // Ouvrir/Fermer menu
        document.addEventListener('closeButtonClicked', () => {
            if (this.AV_player.classList.contains("active")) {
                this.AV_player.classList.remove("active");
            } else {
                this.AV_player.classList.add("active");
            }
        });

        // Menu Player selectionne
        document.addEventListener('menuPlayer', () => {
            this.AV_player.classList.add("on");
        });

        // Menu Playlist selectionne
        document.addEventListener('menuPlaylist', () => {
            this.AV_player.classList.remove("on");
        });
        
    }
}

customElements.define('visualizer-component', Visualizer)