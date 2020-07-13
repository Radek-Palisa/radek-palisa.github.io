export default class MyCanvas extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        div {
          display: flex;
        }
      </style>
      <div>
        <slot></slot>
      </div>
    `;
  }
}
