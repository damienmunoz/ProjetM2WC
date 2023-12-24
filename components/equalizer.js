//import '../assets/lib/webaudio-controls.js';
import '../assets/lib/webaudio-controls.js';

const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="css/equalizer.css">

    <div class="freq">
        <div class="display">
            <div class="slider_h">
                <div class="volume">
                    <webaudio-slider colors="#08f;#800;#fff" id="volume" min="0" max="100" value="50" width="250" height="40"><p>Volume</p></webaudio-slider>
                    <input type="text" id="ivolume" value="50" readonly/>
                </div>
                <div class="vitesse">
                    <webaudio-slider colors="#f88;#400;#a00" id="vitesse" min="0" max="5" value="1" width="250" height="40" step="0.1"><p>Vitesse</p></webaudio-slider>
                    <input type="text" id="ivitesse" value="1" readonly/>
                </div>
            </div>
            <div class="knob">
                <div class="balance">
                    <webaudio-knob colors="#fc0;#8ab;#fff" id="balance" min="-50" max="50" value="0" diameter="150" step="1"><p>Balance</p></webaudio-knob>
                    <input type="text" id="ibalance" value="0" readonly/>
                </div>
                <div class="db">
                    <webaudio-knob colors="#fc0;#a0b;#fcc" id="db" min="0" max="1" value="0" diameter="150" step="0.1"><p>dB</p></webaudio-knob>
                    <input type="text" id="idb" value="0" readonly/>
                </div>
            </div>
            <div class="slider_v">
                <div class="f60">
                    <webaudio-slider colors="#fc0;#000;#444" id="f60" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 60Hz</p></webaudio-slider>
                    <input type="text" id="if60" value="0" readonly/>
                </div>
                <div class="f170">
                    <webaudio-slider colors="#888;#000;#0f0" id="f170" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 170Hz</p></webaudio-slider>
                    <input type="text" id="if170" value="0" readonly/>
                </div>
                <div class="f350">
                    <webaudio-slider colors="#fc0;#000;#444" id="f350" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 350Hz</p></webaudio-slider>
                    <input type="text" id="if350" value="0" readonly/>
                </div>
                <div class="f1000">
                    <webaudio-slider colors="#888;#000;#0f0" id="f1000" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 1000Hz</p></webaudio-slider>
                    <input type="text" id="if1000" value="0" readonly/>
                </div>
                <div class="f3500">
                    <webaudio-slider colors="#fc0;#000;#444" id="f3500" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 3500Hz</p></webaudio-slider>
                    <input type="text" id="if3500" value="0" readonly/>
                </div>
                <div class="f10000">
                    <webaudio-slider colors="#888;#000;#0f0" id="f10000" direction= "vert" min="-30" max="30" value="0" width="40" height="250" step="0.5"><p>Freq 10000Hz</p></webaudio-slider>
                    <input type="text" id="if10000" value="0" readonly/>
                </div>
            </div>
        </div>
    </div>
    `;

class Equalizer extends HTMLElement {

    constructor () {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // SELECTING ELEMENTS.
        this.freq = this.shadowRoot.querySelector(".freq");
        this.filters = [];
    }

    connectedCallback() {
        // Ouvrir/Fermer menu
        document.addEventListener('closeButtonClicked', () => {
            if (this.freq.classList.contains("active")) {
                this.freq.classList.remove("active");
            } else {
                this.freq.classList.add("active");
            }
        });

        // Menu Player selectionne
        document.addEventListener('menuPlayer', () => {
            this.freq.classList.remove("on");
        });

        // Menu Player selectionne
        document.addEventListener('menuEqua', () => {
            this.freq.classList.add("on");
        });

        // Menu Playlist selectionne
        document.addEventListener('menuPlaylist', () => {
            this.freq.classList.remove("on");
        });

        this.volume = this.shadowRoot.getElementById("volume");
        this.ivolume = this.shadowRoot.getElementById("ivolume");
        this.ivitesse = this.shadowRoot.getElementById("ivitesse");
        this.ibalance = this.shadowRoot.getElementById("ibalance");
        this.db = this.shadowRoot.getElementById("db");
        this.idb = this.shadowRoot.getElementById("idb");
        this.if60 = this.shadowRoot.getElementById("if60");
        this.if170 = this.shadowRoot.getElementById("if170");
        this.if350 = this.shadowRoot.getElementById("if350");
        this.if1000 = this.shadowRoot.getElementById("if1000");
        this.if3500 = this.shadowRoot.getElementById("if3500");
        this.if10000 = this.shadowRoot.getElementById("if10000");
        
        this.init();
        this.volumeValue();
        this.speedValue();
        this.freqValue();
        this.balanceValue();
        this.dbValue();
    }

    init() {
        const interval = setInterval(() => {
            if (this.audioContext) {

                this.volumeNode = this.audioContext.createGain();
                this.addAudioNode(this.volumeNode);

                /*this.speedNode = this.audioContext.createBufferSource();
                this.speedNode.buffer = await this.audioContext.decodeAudioData(await this.arrayBuffer());
                this.addAudioNode(this.speedNode);*/

                [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
                    const eq = this.audioContext.createBiquadFilter();
                    eq.frequency.value = freq;
                    eq.type = "peaking";
                    eq.gain.value = 0;
                    this.filters.push(eq);

                });
                this.filters.forEach((filter) => {
                    this.addAudioNode(filter);
                });
                this.pannerNode = this.audioContext.createStereoPanner();
                this.addAudioNode(this.pannerNode);

                this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
                this.processor.onaudioprocess = (e) => {
                    var input = e.inputBuffer.getChannelData(0);
                    let len = input.length   
                    let total = 0;
                    let i = 0
                    let rms;
                    while ( i < len ) total += Math.abs( input[i++] );
                    rms = Math.sqrt( total / len );
                    this.db.value = (rms <= 1 ? rms : 1);
                    this.idb.value=(rms <= 1 ? rms : 1)

                };
                this.addAudioNode(this.processor);
                clearInterval(interval);
            }
        }, 500);
    }

    volumeValue() {
        this.volume.addEventListener("input", (event) => {
            this.volumeNode.gain.value = parseFloat(event.target.value, 10);
            console.log(this.volumeNode.gain.value);
            this.ivolume.value = event.target.value;
        });
    }

    speedValue() {
        this.shadowRoot.getElementById("vitesse").addEventListener("input", (event) => {
            this.speedNode.playbackRate = parseFloat(event.target.value, 10);
            this.ivolume.value = event.target.value;
        });
    }

    freqValue() {
        this.shadowRoot.getElementById("f60").addEventListener("input", (event)=>{
            this.if60.value = event.target.value;
            this.filters[0].gain.value = parseFloat(event.target.value, 10);
        });

        this.shadowRoot.getElementById("f170").addEventListener("input", (event)=>{
            this.if170.value = event.target.value;
            this.filters[1].gain.value = parseFloat(event.target.value);
        });

        this.shadowRoot.getElementById("f350").addEventListener("input", (event)=>{
            this.if350.value = event.target.value;
            this.filters[2].gain.value = parseFloat(event.target.value);
        });

        this.shadowRoot.getElementById("f1000").addEventListener("input", (event)=>{
            this.if1000.value = event.target.value;
            this.filters[3].gain.value = parseFloat(event.target.value);
        });

        this.shadowRoot.getElementById("f3500").addEventListener("input", (event)=>{
            this.if3500.value = event.target.value;
            this.filters[4].gain.value = parseFloat(event.target.value);
        });

        this.shadowRoot.getElementById("f10000").addEventListener("input", (event)=>{
            this.if10000.value = event.target.value;
            this.filters[5].gain.value = parseFloat(event.target.value);
        });
    }

    balanceValue() {
        this.shadowRoot.getElementById("balance").addEventListener("input", (event)=> {
            if (this.pannerNode) {
                this.ibalance.value = event.target.value;
                this.pannerNode.pan.value = parseFloat(event.target.value, 10)/50;
            }
        });
    }

    dbValue() {
        setTimeout(async () => {
            const max = this.db.max;
            const step = this.db.step;
      
            for(let i = 0; i < max; i += step) {
              await this.sleep(10);
              this.db.value = i;
            }
      
            for(let i = max; i > 0; i -= step) {
              await this.sleep(10);
              this.db.value = i;
            }
      
          }, 1000);
          
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
customElements.define('equalizer-component', Equalizer);


