import { trt } from '@trt-web/core';

export const createVarCssPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">dom-handler/var-css</p>
      <h1>varCSS</h1>
      <p>Read or update a CSS custom property on the document root.</p>
    </section>
    <section class="card">
      <label>Variable name <input id="css-variable-name" value="core-demo-accent" /></label>
      <label>Value <input id="css-variable-value" value="#7dd3fc" /></label>
      <div class="demo-actions">
        <button id="css-variable-set" type="button">Set and read</button>
        <button id="css-variable-read" type="button">Read only</button>
      </div>
      <p id="css-variable-preview" class="css-variable-preview"></p>
      <pre id="css-variable-result" class="demo-result">No CSS variable read yet.</pre>
    </section>
  `;

  const name = () => page.querySelector<HTMLInputElement>('#css-variable-name')!.value;
  const value = () => page.querySelector<HTMLInputElement>('#css-variable-value')!.value;
  const result = page.querySelector<HTMLElement>('#css-variable-result')!;
  const preview = page.querySelector<HTMLElement>('#css-variable-preview')!;
  const renderValue = (cssValue: string) => {
    preview.style.color = cssValue;
    preview.textContent = `Current value: ${cssValue || '(empty)'}`;
    result.textContent = cssValue || '(empty)';
  };

  page.querySelector('#css-variable-set')?.addEventListener('click', () => {
    renderValue(trt.dom.varCSS(name(), value()));
  });
  page.querySelector('#css-variable-read')?.addEventListener('click', () => {
    renderValue(trt.dom.varCSS(name()));
  });

  return page;
};
