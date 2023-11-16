/* create a web component with the name my-component,
that proposes to enter a keycode with button in a 3x3 matrix
*/
export class MyComponent extends HTMLElement {
  codeCorrect = '';
  code = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <style>
      .keypad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-gap: 1rem;
        width: 10rem;
        height: 10rem;
        background-color: #ccc;
        border-radius: 1rem;
        padding: 1rem;
      }
      .key {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #666;
        border-radius: 1rem;
        font-size: 2rem;
        font-weight: bold;
        cursor: pointer;
      }
    </style>
    <div class="keypad">
      <div id="div1" class="key" data-key="49">1</div>
      <div class="key" data-key="50">2</div>
      <div class="key" data-key="51">3</div>
      <div class="key" data-key="52">4</div>
      <div class="key" data-key="53">5</div>
      <div class="key" data-key="54">6</div>
      <div class="key" data-key="55">7</div>
      <div class="key" data-key="56">8</div>
      <div class="key" data-key="57">9</div>
    </div>
    <p>Code correct = <span id="code"></span></p>
    `;

    // IMPORTANT : les noms d'attributs doivent être composés 
    // uniquement de minuscules et peuvent contenir des '-' en cas
    // de noms composés
    // En classe j'avais utilisé correctCode et du coup le
    // MVC ne marchait pas !
    this.codeCorrect = this.getAttribute('correctcode');
  }

  connectedCallback() {
    // On affiche le code qu'on a recupéré en attribut
    this.shadowRoot.querySelector('#code').innerHTML = this.codeCorrect;
    this.defineListeners();
    console.log("connected callback")
  }

  changeCode(code) {
    console.log("code changé dans changeCode, on fait setAttribute qui va déclencher un appel à attributeChangedCallback")
    // IMPORTANT : rappel, l'attribut doit être en minuscules !
    this.setAttribute('correctcode', code);
  }

  // declare l'attribut "correctcode" comme étant "observé"
  static get observedAttributes() {
    return ["correctcode"];
  }

  // Quand un attribut observé est modifié on entre dabs ce callback
  attributeChangedCallback(name, oldValue, newValue) {
    //console.log("Dans attributeChangedCallback")

    if (name === 'correctcode') {
      this.codeCorrect = newValue;
      this.shadowRoot.querySelector('#code').innerHTML = newValue;
    }
  }

  defineListeners() {
    const divs = this.shadowRoot.querySelectorAll('.key');
    divs.forEach(div => {
      div.onclick = () => {
        console.log('click sur 1 code = ' + div.innerHTML);
        this.code += div.innerHTML;
        if (this.code.length === 4) {
          if (this.code === this.codeCorrect) {
            console.log('code correct');
            this.dispatchEvent(
              new CustomEvent('codeCorrect', {
                detail: {
                  code: this.code,
                },
                bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
                composed: true, // Allows the event to propagate across the shadow DOM boundary
              }));
          } else {
            console.log('code incorrect');
            this.dispatchEvent(
              new CustomEvent('codeIncorrect', {
              detail: {
                code: this.code,
              },
              bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
              composed: true, // Allows the event to propagate across the shadow DOM boundary
            }));
          }
          this.code = '';
        }
      }
    });
  }
}

customElements.define('my-component', MyComponent);
