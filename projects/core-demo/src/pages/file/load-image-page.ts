import { trt } from '@trt-web/core';

export const createLoadImagePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/load-image</p><h1>loadImage</h1><p>Load an image URL and expose its natural dimensions.</p></section><section class="card"><label>Image URL <input id="load-image-url" value="/favicon.ico" /></label><button id="load-image-run" type="button">Load image</button><img id="load-image-preview" class="file-preview" alt="Loaded image" /><pre id="load-image-result" class="demo-result">No image loaded yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#load-image-result')!;
  const preview = page.querySelector<HTMLImageElement>('#load-image-preview')!;
  page.querySelector('#load-image-run')?.addEventListener('click', async () => {
    try {
      const image = await trt.file.loadImage(
        page.querySelector<HTMLInputElement>('#load-image-url')!.value,
      );
      preview.src = image.src;
      result.textContent = JSON.stringify(
        { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height },
        null,
        2,
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
