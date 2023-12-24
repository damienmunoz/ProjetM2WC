const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="css/playlist.css">

    <div class="music-list on">
        <h1>Playlist</h1>
        <ul>
            <li>
                <a href="#" class="ripple"><span>Titre</span><span>Durée</span><span>Taille</span></a>
            </li>
        </ul>
    </div>
    `;

class Playlist extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.init();
        this.currentlyPlayingIndex = null;
        this.music_array = [];
        this.musicList = this.shadowRoot.querySelector(".music-list");
    }

    connectedCallback() {

        // Bouton suivant
        document.addEventListener('playNextMusic', () => {
            this.playNextMusic();
        });
        
        // Bouton précédent
        document.addEventListener('playPreviousMusic', () => {
            this.playPreviousMusic();
        });

        // Ouvrir/Fermer menu
        document.addEventListener('closeButtonClicked', () => {
            if (this.musicList.classList.contains("active")) {
                this.musicList.classList.remove("active");
            } else {
                this.musicList.classList.add("active");
            }
        });

        // Menu Playlist selectionne
        document.addEventListener('menuPlaylist', () => {
            this.musicList.classList.add("on");
        });

        // Menu Player selectionne
        document.addEventListener('menuPlayer', () => {
            this.musicList.classList.remove("on");
        });

        // Menu Player selectionne
        document.addEventListener('menuEqua', () => {
            this.musicList.classList.remove("on");
        });
    }


    init() {
        // SELECTING ELEMENTS.
        let music_list = this.shadowRoot.querySelector(".music-list"),
            music_ul_tag = music_list.querySelector("ul"),
            backup_music_array = [];
        

        const path = "/assets/music/";
        const extension = ".mp3";
        const musicFiles = [`${path}A Long Way - Serge Pavkin${extension}`, 
            `${path}Awaken - Onoychenko${extension}`,
            `${path}Baby Mandala - Prazkhanal${extension}`,
            `${path}Drive Breakbeat - Rockot${extension}`,
            `${path}For Future Bass - The Mountain${extension}`,
            `${path}Good Night - FASSounds${extension}`,
            `${path}My Universe - Nesterouk${extension}`,
            `${path}Science Documentary - Lexin${extension}`,
            `${path}Smoke - SoulProd${extension}`,
            `${path}The Best Jazz Club In New Orleans - Paolo Argento${extension}`,
            `${path}Titanium - Alisha${extension}`,
            `${path}Tokyo Cafe - TVARI${extension}`
        ];

        function getDuration(src,cb) {
            var audio = new Audio();
            audio.addEventListener("loadedmetadata",()=>{
                cb(audio.duration);
            });
            audio.src = src;
        }
    
        function fancyTimeFormat(duration) {
            const hrs = ~~(duration / 3600);
            const mins = ~~((duration % 3600) / 60);
            const secs = ~~duration % 60;
          
            let ret = "";
          
            if (hrs > 0) {
              ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            }
          
            ret += "" + mins + ":" + (secs < 10 ? "0" : "");
            ret += "" + secs;
          
            return ret;   
        }
           
        for (let i = 0; i < musicFiles.length; i++) {
            let duree = '';

            getDuration(musicFiles[i], function(length) {
                duree = fancyTimeFormat(length);
            });

            let reader = new FileReader();


            reader.addEventListener("load", () => {
                let size = (reader.result.length / Math.pow(1024, 2) / 1.33411764706).toFixed(2);
                let music = [
                    musicFiles[i].split('/').pop(), // Récupère le nom du fichier
                    duree,
                    size, 
                ];
                this.music_array.push(music);
                backup_music_array.push(music);
        
                let li = document.createElement("li");
                li.classList.add("ripple", "music-item");
                li.innerHTML += `
                        <a href="#" title="${music[0]}">
                        <span>${music[0]}</span>
                        <span>${music[1]}</span>
                        <span>${music[2]} Mo</span>
                        </a>
                `;
                music_ul_tag.appendChild(li);
        
                li.addEventListener("mousemove", (e) => {
                    li.style.left = e.clientX / 50 + "px";
                    li.style.top = e.clientY / 50 + "px";
                });
        
                li.addEventListener("mouseleave", () => {
                    li.style.left = "0px";
                    li.style.top = "0px";
                });

                li.addEventListener("click", () => {

                    let liSpan = li.querySelector("span").textContent;
                    let name_array = this.music_array.map((e) => {
                        return e[0];
                    });
        
                    let music_index = name_array.indexOf(liSpan);
                    this.currentlyPlayingIndex = music_index;
                    
                    // Emit un événement indiquant que la musique est sélectionnée
                    let musicSelectedEvent = new CustomEvent('musicSelected', { 
                        detail: { 
                            musicTitle: this.music_array[music_index][0],
                            musicIndex: music_index
                        }
                    });
                    document.dispatchEvent(musicSelectedEvent);

                    // Update styles after playing the next music
                    this.updateStyles();

                });
            });

            // Utilisez l'API fetch pour charger le fichier
            fetch(musicFiles[i])
                .then(response => response.blob())
                .then(blob => reader.readAsDataURL(blob))
                .catch(error => console.error('Erreur de chargement du fichier:', error));
        }
    }

    playNextMusic() {
        // Increment the currentlyPlayingIndex to play the next music
        if (this.currentlyPlayingIndex !== null) {
            this.currentlyPlayingIndex++;
            if (this.currentlyPlayingIndex >= this.music_array.length) {
                // If it exceeds the array length, reset to the first music
                this.currentlyPlayingIndex = 0;
            }
        } else {
            // If no music is playing, start from the first music
            this.currentlyPlayingIndex = 0;
        }

        // Get the information of the next music
        const nextMusic = this.music_array[this.currentlyPlayingIndex];

        // Emit an event to play the next music
        const playNextEvent = new CustomEvent('playNext', {
            detail: {
                musicTitle: nextMusic[0],
                musicIndex: this.currentlyPlayingIndex,
            },
        });
        document.dispatchEvent(playNextEvent);

        // Update styles after playing the next music
        this.updateStyles();
    }

    playPreviousMusic() {
        // Decrement the currentlyPlayingIndex to play the previous music
        if (this.currentlyPlayingIndex !== null) {
            this.currentlyPlayingIndex--;
            if (this.currentlyPlayingIndex < 0) {
                // If it goes below 0, wrap around to the last music
                this.currentlyPlayingIndex = this.music_array.length - 1;
            }
        } else {
            // If no music is playing, start from the last music
            this.currentlyPlayingIndex = this.music_array.length - 1;
        }

        // Get the information of the previous music
        const previousMusic = this.music_array[this.currentlyPlayingIndex];

        // Emit an event to play the previous music
        const playPreviousEvent = new CustomEvent('playPrevious', {
            detail: {
                musicTitle: previousMusic[0],
                musicIndex: this.currentlyPlayingIndex,
            },
        });
        document.dispatchEvent(playPreviousEvent);

        // Update styles after playing the next music
        this.updateStyles();
    }

    updateStyles() {
        // Supprimez la classe 'playing' de tous les éléments
        this.musicList.querySelectorAll('.music-item').forEach((item) => {
            item.classList.remove('playing');
        });

        // Ajoutez la classe 'playing' à l'élément en cours de lecture
        if (this.currentlyPlayingIndex !== null) {
            const currentlyPlayingItem = this.musicList.querySelector(`.music-item:nth-of-type(${this.currentlyPlayingIndex + 2})`);
            if (currentlyPlayingItem) {
                currentlyPlayingItem.classList.add('playing');
            }
        }
    }

}

customElements.define('playlist-component', Playlist)
