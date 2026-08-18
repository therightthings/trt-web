import { trt } from '@trt-web/core';

export const createGetImageSizePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/get-image-size</p><h1>getImageSize</h1><p>Read an image's natural dimensions and optionally retain a generated object URL.</p></section><section class="card"><input id="image-size-file" type="file" accept="image/*" /><label><input id="image-size-revoke" type="checkbox" checked /> Revoke generated object URL</label><button id="image-size-run" type="button">Read dimensions</button><pre id="image-size-result" class="demo-result">Choose an image first.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#image-size-result')!;
  page.querySelector('#image-size-run')?.addEventListener('click', async () => {
    const file = page.querySelector<HTMLInputElement>('#image-size-file')!.files?.[0];
    if (!file) {
      result.textContent = 'Choose an image first.';
      return;
    }
    try {
      result.textContent = JSON.stringify(
        await trt.file.getImageSize(file, {
          revokeObjectUrl: page.querySelector<HTMLInputElement>('#image-size-revoke')!.checked,
        }),
        null,
        2,
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
