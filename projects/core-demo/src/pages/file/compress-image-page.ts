import { trt } from '@trt-web/core';

export const createCompressImagePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/compress-image</p><h1>compressImageFile</h1><p>Resize and compress an image into a new File.</p></section><section class="card"><input id="compress-file" type="file" accept="image/*" /><label>Max width <input id="compress-width" type="number" min="1" value="1024" /></label><label>Output format<select id="compress-format"><option value="image/jpeg">image/jpeg</option><option value="image/webp">image/webp</option></select></label><label>Quality <input id="compress-quality" type="number" min="0" max="1" step="0.1" value="0.8" /></label><button id="compress-run" type="button">Compress image</button><pre id="compress-result" class="demo-result">Choose an image first.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#compress-result')!;
  page.querySelector('#compress-run')?.addEventListener('click', async () => {
    const file = page.querySelector<HTMLInputElement>('#compress-file')!.files?.[0];
    if (!file) {
      result.textContent = 'Choose an image first.';
      return;
    }
    try {
      const compressed = await trt.file.compressImageFile(file, {
        maxWidth: Number(page.querySelector<HTMLInputElement>('#compress-width')!.value),
        outputFormat: page.querySelector<HTMLSelectElement>('#compress-format')!.value as
          | 'image/jpeg'
          | 'image/webp',
        quality: Number(page.querySelector<HTMLInputElement>('#compress-quality')!.value),
      });
      result.textContent = JSON.stringify(
        { name: compressed.name, type: compressed.type, size: compressed.size },
        null,
        2,
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  return page;
};
