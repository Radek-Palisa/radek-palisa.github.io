import dotPattern from '../static/dot-pattern.svg';

const template = document.createElement('template');
const styles = `
  :host {
    display: block;
    contain: content; /* Boom. CSS containment FTW. */
    margin: 0 5px;
  }
  #card { 
    box-sizing: border-box;
    position: relative;
    background-image: url(${dotPattern}), linear-gradient(83deg, #CCEAFF, #FFEAA0);
    background-repeat: repeat, no-repeat;
    background-size: auto, cover;
    margin: -1px 6px 28px;
  }
  label {
    font-size: 11px;
    color: rgb(0, 0, 0, .4);
    margin-left: 6px;
    font-weight: 500;
    font-family: 'Open Sans', sans-serif;
  }
  label:hover, label[my-active] {
    color: #46A0F4;
  }
  label:hover + #card {
    outline: 2px solid #46A0F4;
  }
  label[my-active] + #card {
    outline: 1px solid #46A0F4;
  }
  .size-label {
    position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    padding: 2px 4px;
    background-color: #46A0F4;
    border-radius: 4px;
    color: white;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.6px;
  }
  .handles-left::before,
  .handles-left::after,
  .handles-right::before,
  .handles-right::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: white;
    border: 1px solid #46A0F4;
  }
  .handles-left::before,
  .handles-left::after {
    left: -4px;
  }
  .handles-right::before,
  .handles-right::after {
    right: -4px;
  }
  .handles-left::before,
  .handles-right::before {
    top: -4px;
  }
  .handles-left::after,
  .handles-right::after {
    bottom: -4px;
  }
`;

template.innerHTML = `
  <style>${styles}</style>
  <section>
    <label>
      <slot name="label"></slot>
    </label>
    <div id="card">
      <slot></slot>
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
    this.handlesLeftEl = null;
    this.handlesRightEl = null;

    this._handleLabelClick = this._handleLabelClick.bind(this);
    this._handleOutsideLabelClick = this._handleOutsideLabelClick.bind(this);
    this._activateCardHandles = this._activateCardHandles.bind(this);
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
    if (this.labelEl.hasAttribute('my-active')) {
      // if already active, stop the event here so that outside-click handler
      // doesn't get triggered
      event.stopPropagation();
      return;
    }

    this.labelEl.setAttribute('my-active', '');

    this._activateCardHandles();

    // async to let the current event bubble up first.
    setTimeout(() => {
      document.addEventListener('click', this._handleOutsideLabelClick);
    }, 0);
  }

  _handleOutsideLabelClick() {
    this.labelEl.removeAttribute('my-active');
    this.sizeLabelEl.remove();
    this.handlesLeftEl.remove();
    this.handlesRightEl.remove();
    document.removeEventListener('click', this._handleOutsideLabelClick);
  }

  _activateCardHandles() {
    const cardEl = this.shadowRoot.getElementById('card');
    const cardElSize = cardEl.getBoundingClientRect();

    this.sizeLabelEl = document.createElement('span');
    this.sizeLabelEl.classList.add('size-label');
    this.sizeLabelEl.innerText = `${Math.round(
      cardElSize.width
    )} x ${Math.round(cardElSize.height)}`;

    this.handlesLeftEl = document.createElement('span');
    this.handlesRightEl = document.createElement('span');
    this.handlesLeftEl.classList.add('handles-left');
    this.handlesRightEl.classList.add('handles-right');

    this.shadowRoot.appendChild(this.sizeLabelEl);
    cardEl.appendChild(this.handlesLeftEl);
    cardEl.appendChild(this.handlesRightEl);
  }
}
