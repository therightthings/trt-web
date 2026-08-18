import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createCapitalizePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">string-handler/capitalize</p><h1>capitalize</h1><p>Capitalize a string or selected string fields in an object.</p></section><section class="card"><label>Text <input id="capitalize-text" value="hello world from core" /></label><label>Mode<select id="capitalize-mode"><option value="first">first</option><option value="words">words</option></select></label><button id="capitalize-string" type="button">Capitalize string</button><hr /><label>Object JSON<textarea id="capitalize-object" rows="7">{"firstName":"alice","lastName":"nguyen","city":"ho chi minh"}</textarea></label><label>First fields <input id="capitalize-first-fields" value="firstName" /></label><label>Words fields <input id="capitalize-words-fields" value="lastName,city" /></label><button id="capitalize-object-run" type="button">Capitalize object</button><pre id="capitalize-result" class="demo-result">No result yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#capitalize-result')!;
  page.querySelector('#capitalize-string')?.addEventListener('click', () => {
    result.textContent = trt.string.capitalize(
      page.querySelector<HTMLInputElement>('#capitalize-text')!.value,
      {
        mode: page.querySelector<HTMLSelectElement>('#capitalize-mode')!.value as 'first' | 'words',
      },
    );
  });
  page.querySelector('#capitalize-object-run')?.addEventListener('click', () => {
    try {
      const data = JSON.parse(page.querySelector<HTMLTextAreaElement>('#capitalize-object')!.value);
      const fields = (id: string) =>
        page
          .querySelector<HTMLInputElement>(id)!
          .value.split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      result.textContent = JSON.stringify(
        trt.string.capitalize(data, {
          first: fields('#capitalize-first-fields'),
          words: fields('#capitalize-words-fields'),
        }),
        null,
        2,
      );
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      { input: `capitalize('hello world')`, run: () => trt.string.capitalize('hello world') },
      {
        input: `capitalize('hello world', { mode: 'words' })`,
        run: () => trt.string.capitalize('hello world', { mode: 'words' }),
      },
      {
        input: `capitalize({ firstName: 'alice' }, { first: ['firstName'] })`,
        run: () => trt.string.capitalize({ firstName: 'alice' }, { first: ['firstName'] }),
      },
      { input: `capitalize('')`, run: () => trt.string.capitalize('') },
      {
        input: `capitalize('   ', { mode: 'words' })`,
        run: () => trt.string.capitalize('   ', { mode: 'words' }),
      },
      {
        input: `capitalize({ title: 'hello', count: 1 })`,
        run: () => trt.string.capitalize({ title: 'hello', count: 1 }),
      },
      {
        input: `capitalize({ title: 'hello world', author: 'alice nguyen' }, { first: ['title'], words: ['author'] })`,
        run: () =>
          trt.string.capitalize(
            { title: 'hello world', author: 'alice nguyen' },
            { first: ['title'], words: ['author'] },
          ),
      },
      {
        input: `capitalize({ title: null }, { first: ['title'] })`,
        run: () => trt.string.capitalize({ title: null }, { first: ['title'] }),
      },
    ]),
  );
  return page;
};
