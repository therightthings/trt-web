import { BrowserShare } from '@trt-web/core';

export const createSharePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/share</p><h1>BrowserShare</h1><p>Share title, text and URL after an explicit user action.</p></section><section class="card"><label>Title <input id="share-title" value="Core demo" /></label><label>Text <textarea id="share-text">Explore @trt-web/core utilities.</textarea></label><label>URL <input id="share-url" /></label><button id="share-button">Share</button><p id="share-result" class="demo-result">No action run yet.</p></section>`;
  page.querySelector<HTMLInputElement>('#share-url')!.value = location.href;
  const result = page.querySelector<HTMLElement>('#share-result')!;
  page.querySelector('#share-button')?.addEventListener('click', async () => {
    const response = await BrowserShare.share({
      title: page.querySelector<HTMLInputElement>('#share-title')!.value,
      text: page.querySelector<HTMLTextAreaElement>('#share-text')!.value,
      url: page.querySelector<HTMLInputElement>('#share-url')!.value,
    });
    result.textContent = JSON.stringify(response);
  });
  return page;
};
