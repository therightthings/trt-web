import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createSearchKeyPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/search-key</p><h1>generateSearchKeys</h1><p>Build normalized word, phrase, prefix and acronym keys for search.</p></section><section class="card"><label>Search text <input id="search-key-input" value="Café Sữa Đá" /></label><label>Minimum prefix length <input id="search-min" type="number" min="1" value="2" /></label><label>Maximum prefix length <input id="search-max" type="number" min="1" value="20" /></label><label><input id="search-phrases" type="checkbox" checked /> Include phrase prefixes</label><label><input id="search-acronym" type="checkbox" checked /> Include acronym</label><button id="search-key-run" type="button">Generate keys</button><pre id="search-key-result" class="demo-result">No keys generated yet.</pre></section>`;
  page.querySelector('#search-key-run')?.addEventListener('click', () => {
    const keys = trt.string.generateSearchKeys(
      page.querySelector<HTMLInputElement>('#search-key-input')!.value,
      {
        minPrefixLength: Number(page.querySelector<HTMLInputElement>('#search-min')!.value),
        maxPrefixLength: Number(page.querySelector<HTMLInputElement>('#search-max')!.value),
        includePhrasePrefixes: page.querySelector<HTMLInputElement>('#search-phrases')!.checked,
        includeAcronym: page.querySelector<HTMLInputElement>('#search-acronym')!.checked,
      },
    );
    page.querySelector('#search-key-result')!.textContent = JSON.stringify(keys, null, 2);
  });
  page.append(
    createTestCases([
      {
        input: `generateSearchKeys('Café', { minPrefixLength: 1, includePhrasePrefixes: false, includeAcronym: false })`,
        run: () =>
          trt.string.generateSearchKeys('Café', {
            minPrefixLength: 1,
            includePhrasePrefixes: false,
            includeAcronym: false,
          }),
      },
      {
        input: `generateSearchKeys('中文 😀')`,
        run: () => trt.string.generateSearchKeys('中文 😀'),
      },
      {
        input: `generateSearchKeys('Đắk Lắk', { includeAcronym: false })`,
        run: () => trt.string.generateSearchKeys('Đắk Lắk', { includeAcronym: false }),
      },
      {
        input: `generateSearchKeys('Café', { minPrefixLength: 1, maxPrefixLength: 2, includePhrasePrefixes: false, includeAcronym: false })`,
        run: () =>
          trt.string.generateSearchKeys('Café', {
            minPrefixLength: 1,
            maxPrefixLength: 2,
            includePhrasePrefixes: false,
            includeAcronym: false,
          }),
      },
      {
        input: `generateSearchKeys('Đắk Lắk', { includePhrasePrefixes: false })`,
        run: () => trt.string.generateSearchKeys('Đắk Lắk', { includePhrasePrefixes: false }),
      },
    ]),
  );
  return page;
};
