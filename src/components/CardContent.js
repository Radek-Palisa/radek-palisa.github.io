const template = document.createElement('template');

const styles = `
  :host {
    width: 440px;
    max-width: 100%;
    min-height: 644px;
    display: flex;
    flex-direction: column;
    background-position: center;
    background-repeat: no-repeat !important;
    background: var(--mask);
  }
`;

template.innerHTML = `
  <style>${styles}</style>
  <div>
    <slot></slot>
  </div>
`;

export default class CardContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}
