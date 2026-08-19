import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createRemoveTonesPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/remove-tones</p><h1>removeTones</h1><p>Normalize accents, punctuation and separators for search-friendly text.</p></section><section class="card"><label>Text <textarea id="tones-input" rows="5">Đặng Văn Lâm - Café &amp; Crème</textarea></label><label>Separator <input id="tones-separator" value="-" /></label><label><input id="tones-ascii" type="checkbox" checked /> Remove non-Latin ASCII</label><button id="tones-run" type="button">Remove tones</button><pre id="tones-result" class="demo-result">No text normalized yet.</pre></section>`;
  page.querySelector('#tones-run')?.addEventListener('click', () => {
    page.querySelector('#tones-result')!.textContent = trt.string.removeTones(
      page.querySelector<HTMLTextAreaElement>('#tones-input')!.value,
      {
        separator: page.querySelector<HTMLInputElement>('#tones-separator')!.value,
        removeNonLatinAscii: page.querySelector<HTMLInputElement>('#tones-ascii')!.checked,
      },
    );
  });
  page.append(
    createTestCases([
      {
        input: `removeTones('Đắk Lắk', { separator: '_' })`,
        run: () => trt.string.removeTones('Đắk Lắk', { separator: '_' }),
      },
      { input: `removeTones('Crème brûlée')`, run: () => trt.string.removeTones('Crème brûlée') },
      { input: `removeTones('中文 Café 😀')`, run: () => trt.string.removeTones('中文 Café 😀') },
      {
        input: `removeTones('中文 Café 😀', { removeNonLatinAscii: false })`,
        run: () => trt.string.removeTones('中文 Café 😀', { removeNonLatinAscii: false }),
      },
      {
        input: `removeTones('São Tomé e Príncipe')`,
        run: () => trt.string.removeTones('São Tomé e Príncipe'),
      },
      { input: `removeTones('İstanbul')`, run: () => trt.string.removeTones('İstanbul') },
      { input: `removeTones('Straße')`, run: () => trt.string.removeTones('Straße') },
      { input: `removeTones('Ærøskøbing')`, run: () => trt.string.removeTones('Ærøskøbing') },
      { input: `removeTones('Łódź')`, run: () => trt.string.removeTones('Łódź') },
      {
        input: `removeTones('Crème brûlée', { separator: '|' })`,
        run: () => trt.string.removeTones('Crème brûlée', { separator: '|' }),
      },
    ]),
  );
  return page;
};
