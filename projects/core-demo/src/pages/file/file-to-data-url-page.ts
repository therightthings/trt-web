import { trt } from '@trt-web/core';

export const createFileToDataUrlPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/file-to-data-url</p><h1>fileToDataUrl</h1><p>Read a selected file as a data URL using FileReader.</p></section><section class="card"><input id="data-url-file" type="file" /><button id="data-url-run" type="button">Read data URL</button><pre id="data-url-result" class="demo-result">Choose a file first.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#data-url-result')!;
  page.querySelector('#data-url-run')?.addEventListener('click', async () => {
    const file = page.querySelector<HTMLInputElement>('#data-url-file')!.files?.[0];
    if (!file) {
      result.textContent = 'Choose a file first.';
      return;
    }
    try {
      const dataUrl = await trt.file.fileToDataUrl(file);
      result.textContent = `${dataUrl.slice(0, 160)}${dataUrl.length > 160 ? '…' : ''}\nLength: ${dataUrl.length}`;
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
