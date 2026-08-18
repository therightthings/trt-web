import { trt } from '@trt-web/core';

export const createConvertFileSizePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/convert-file-size</p><h1>convertFileSize</h1><p>Convert a file size between supported units with configurable precision.</p></section><section class="card"><label>Value <input id="file-size-value" type="number" value="1" /></label><label>From<select id="file-size-from"><option>byte</option><option>kb</option><option selected>Mb</option><option>Gb</option><option>Tb</option><option>Pb</option><option>Eb</option></select></label><label>To<select id="file-size-to"><option>byte</option><option selected>kb</option><option>Mb</option><option>Gb</option><option>Tb</option><option>Pb</option><option>Eb</option></select></label><label>Decimal places <input id="file-size-decimals" type="number" min="0" value="2" /></label><button id="file-size-run" type="button">Convert</button><pre id="file-size-result" class="demo-result">No conversion run yet.</pre></section>`;
  page.querySelector('#file-size-run')?.addEventListener('click', () => {
    const from = page.querySelector<HTMLSelectElement>('#file-size-from')!.value;
    const to = page.querySelector<HTMLSelectElement>('#file-size-to')!.value;
    const result = trt.file.convertFileSize(
      Number(page.querySelector<HTMLInputElement>('#file-size-value')!.value),
      `${from}:${to}` as Parameters<typeof trt.file.convertFileSize>[1],
      { decimalPlaces: Number(page.querySelector<HTMLInputElement>('#file-size-decimals')!.value) },
    );
    page.querySelector('#file-size-result')!.textContent = String(result);
  });
  return page;
};
