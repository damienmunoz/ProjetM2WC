const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="css/visualizer.css">

    <div class="AV-player">
        <canvas></canvas>
    </div>
    `;

class Visualizer extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // SELECTING ELEMENTS.
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

        // Menu Player selectionne
        document.addEventListener('menuEqua', () => {
            this.AV_player.classList.remove("on");
        });

        // Menu Playlist selectionne
        document.addEventListener('menuPlaylist', () => {
            this.AV_player.classList.remove("on");
        });

        this.init();
        requestAnimationFrame(() => this.audioVisualizer());
    }

    init() {
        const interval = setInterval(() => {
            if (this.audioContext) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 128;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);
                this.addAudioNode(this.analyser);
                clearInterval(interval);
            }
        }, 100);
       
    }

    audioVisualizer() {
        if (!this.analyser) {
            setTimeout(() => {
                requestAnimationFrame(() => this.audioVisualizer());
            }, 100);
            return;
        }
        const canvas = this.shadowRoot.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1500;
        canvas.height = 550;
        let barWidth = canvas.width / 2 / this.bufferLength;
        let x, barHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.analyser.getByteFrequencyData(this.dataArray);
        x = 0;
        let opacity = 1;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];
            let color = {
                red: this.dataArray[i] * 2,
                green: i * 4,
                blue: this.dataArray[i] / 4
            };
            let dy = Math.abs(barHeight - this.dataArray[i + 1]);
            opacity = 1 - dy / this.bufferLength;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.moveTo(
                canvas.width / 2 - x + barWidth / 2,
                canvas.height - barHeight - 100
            );
            ctx.lineTo(
                canvas.width / 2 - x - barWidth / 2,
                canvas.height - this.dataArray[i + 1] - 100
            );
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(
                canvas.width / 2 - x + barWidth / 2,
                canvas.height - barHeight - 100,
                barWidth / 2,
                0,
                Math.PI * 2,
                false
            );
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            ctx.fillRect(
                canvas.width / 2 - x,
                canvas.height - barHeight - 75,
                barWidth,
                barHeight
            );
            x += barWidth;
        }

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];
            let color = {
                red: this.dataArray[i] * 2,
                green: i * 4,
                blue: this.dataArray[i] / 4
            };
            let dy = Math.abs(barHeight - this.dataArray[i - 1]);
            opacity = 1 - dy / this.bufferLength;

            // LINE
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.moveTo(x + barWidth / 2, canvas.height - barHeight - 100);
            ctx.lineTo(
                x - barWidth / 2,
                canvas.height - this.dataArray[i - 1] - 100
            );
            ctx.stroke();
            ctx.closePath();

            // BALL
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(
                x + barWidth / 2,
                canvas.height - barHeight - 100,
                barWidth / 2,
                0,
                Math.PI * 2,
                false
            );
            ctx.fill();
            ctx.closePath();

            // BAR
            ctx.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
            ctx.fillRect(
                x,
                canvas.height - barHeight - 75,
                barWidth,
                barHeight
            );
            x += barWidth;
        }
        requestAnimationFrame(() => this.audioVisualizer());
    }
    }
customElements.define('visualizer-component', Visualizer)


