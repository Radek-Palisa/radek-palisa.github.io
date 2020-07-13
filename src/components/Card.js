const template = document.createElement('template');

const styles = `
  :host {
    display: block;
    contain: content; /* Boom. CSS containment FTW. */
  }
  #card {
    background-color: white;
    padding: 16px;
    border: 2px solid white;
    margin-bottom: 32px;
  }
  label {
    font-size: 13px;
    color: grey;
  }
  label:hover, label[my-active] {
    color: #46A0F4;
  }
  label:hover + #card,
  label[my-active] + #card {
    border: 2px solid #46A0F4;
  }
  .size-label {
    position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    padding: 4px;
    background-color: #46A0F4;
    border-radius: 4px;
    color: white;
    font-size: 12px;
  }
`;

template.innerHTML = `
  <style>${styles}</style>
  <section>
    <label>
      <slot name="label"></slot>
    </label>
    <div id="card">
      <slot name="heading"></slot>
      <p>
        <slot></slot>
      </p>
    </div>
  </section>
`;

export default class Card extends HTMLElement {
  static get observedAttributes() {
    return ['my-active'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.labelEl = null;
    this.sizeLabelEl = null;
    this._handleLabelClick = this._handleLabelClick.bind(this);
    this._handleOutsideLabelClick = this._handleOutsideLabelClick.bind(this);
    this._addSizeLabel = this._addSizeLabel.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.labelEl = this.shadowRoot.querySelector('label');
    this.labelEl.addEventListener('click', this._handleLabelClick);
  }

  disconnectedCallback() {
    this.labelEl.removeEventListener('click', this._handleLabelClick);
  }

  _handleLabelClick(event) {
    // console.log(event.target);
    if (this.labelEl.hasAttribute('my-active')) {
      return;
    }
    this.labelEl.setAttribute('my-active', '');
    event.stopPropagation();
    document.addEventListener('click', this._handleOutsideLabelClick);

    this._addSizeLabel();
  }

  _handleOutsideLabelClick(event) {
    console.log(event);

    this.labelEl.removeAttribute('my-active');
    this.sizeLabelEl.remove();
    document.removeEventListener('click', this._handleOutsideLabelClick);
  }

  _addSizeLabel() {
    const cardElSize = this.shadowRoot
      .getElementById('card')
      .getBoundingClientRect();

    this.sizeLabelEl = document.createElement('span');
    this.sizeLabelEl.classList.add('size-label');
    this.sizeLabelEl.innerText = `${Math.round(cardElSize.width)}x${Math.round(
      cardElSize.height
    )}`;
    this.shadowRoot.appendChild(this.sizeLabelEl);
  }
}
