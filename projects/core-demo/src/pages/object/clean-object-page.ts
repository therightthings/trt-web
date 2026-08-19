import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

const defaultObject = JSON.stringify(
  {
    name: 'Alice',
    nickname: null,
    count: 0,
    active: false,
    tags: ['', null, 'keep'],
    profile: { bio: '', city: 'Hanoi' },
  },
  null,
  2,
);

export const createCleanObjectPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">obj-handler/clean-obj</p><h1>cleanObj</h1><p>Remove null, undefined, empty strings and empty nested collections while keeping 0 and false.</p></section><section class="card"><label>Object JSON<textarea id="clean-object-input" rows="12">${defaultObject}</textarea></label><button id="clean-object-run" type="button">Clean object</button><pre id="clean-object-result" class="demo-result">No object cleaned yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#clean-object-result')!;
  page.querySelector('#clean-object-run')?.addEventListener('click', () => {
    try {
      const input = JSON.parse(
        page.querySelector<HTMLTextAreaElement>('#clean-object-input')!.value,
      );
      result.textContent = JSON.stringify(trt.object.cleanObj(input), null, 2);
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      {
        input: `cleanObj({ a: null, b: '', count: 0, active: false })`,
        run: () => trt.object.cleanObj({ a: null, b: '', count: 0, active: false }),
      },
      {
        input: `cleanObj({ profile: { city: 'Hanoi', bio: '' }, tags: ['', null, 'keep'] })`,
        run: () =>
          trt.object.cleanObj({ profile: { city: 'Hanoi', bio: '' }, tags: ['', null, 'keep'] }),
      },
      {
        input: `cleanObj({ a: null, b: undefined, c: '' })`,
        run: () => trt.object.cleanObj({ a: null, b: undefined, c: '' }),
      },
    ]),
  );
  return page;
};
