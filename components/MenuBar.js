const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="css/menubar.css">

    <nav class="navigation">
        <a href="#" class="logo ripple">MIAGE<span class="small-text">Audio Player</span></a>
        <ul>
            <li class="ripple">
                <i class="icon fas fa-music"></i> <span>Player</span>
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
    }

    connectedCallback() {
        
        
    }
}

customElements.define('menu-bar-component', MenuBar)