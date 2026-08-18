import { trt } from '@trt-web/core';

export const createGetElementInfoPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">dom-handler/get-element-info</p>
      <h1>getElementInfo</h1>
      <p>Inspect an element's dimensions, offsets and horizontal/vertical scroll state.</p>
    </section>
    <section class="card">
      <div id="element-info-target" class="element-info-target">
        <div class="element-info-content">Scroll this area to inspect its state.</div>
      </div>
      <div class="demo-actions"><button id="element-info-read" type="button">Read element info</button></div>
      <pre id="element-info-result" class="demo-result">No element info read yet.</pre>
    </section>
  `;

  const target = page.querySelector<HTMLElement>('#element-info-target')!;
  const result = page.querySelector<HTMLElement>('#element-info-result')!;
  page.querySelector('#element-info-read')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(trt.dom.getElementInfo(target), null, 2);
  });

  return page;
};
