const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="css/menubar.css">

    <nav class="navigation">
        <a href="#" class="logo ripple">
            <span class="full-logo">MIAGE<span class="small-text">Audio Player</span></span>
            <span class="short-logo">M<span class="small-text">Audio Player</span></span>
        </a>
        <ul>
            <li class="ripple">
                <i class="icon fas fa-music"></i> <span>Visualizer</span>
            </li>
            <li class="ripple">
                <i class="icon fas fa-sliders"></i> <span>Equalizer</span>
            </li>
            <li class="ripple active">
                <i class="icon fas fa-stream"></i> <span>Playlist</span>
            </li>
        </ul>
        <i class="closeButton fas fa-arrow-alt-circle-left"></i>
    </nav>
    `;

class MenuBar extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.nav_links = this.shadowRoot.querySelectorAll("nav ul li"),
        this.navigation = this.shadowRoot.querySelector(".navigation"),
        this.closeButton = this.shadowRoot.querySelector(".closeButton");

        
    }

    connectedCallback() {

        // NAVIGATION LINK'S ACTIVE CLASS
        this.nav_links.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.nav_links.forEach((link) => {
                    link.classList.remove("active");
                });
                btn.classList.add("active");
            });
        });

        // CLOSE BUTTON (COLLAPSE)
        this.closeButton.addEventListener("click", () => {
            const closeButtonEvent = new CustomEvent('closeButtonClicked');
            document.dispatchEvent(closeButtonEvent);
            if (this.closeButton.classList.contains("active")) {
                this.closeButton.classList.remove("active");
                this.navigation.classList.remove("active");
            } else {
                this.closeButton.classList.add("active");
                this.navigation.classList.add("active");
            }
        });

        // ADDITIONAL NAVIGATION LINKS.
        this.nav_links[0].addEventListener("click", () => {
            const menuPlayer = new CustomEvent('menuPlayer');
            document.dispatchEvent(menuPlayer);
        });

        this.nav_links[1].addEventListener("click", () => {
            const menuEqua = new CustomEvent('menuEqua');
            document.dispatchEvent(menuEqua);
        });

        this.nav_links[2].addEventListener("click", () => {
            const menuPlaylist = new CustomEvent('menuPlaylist');
            document.dispatchEvent(menuPlaylist);
        });
    }
}

customElements.define('menu-bar-component', MenuBar)
