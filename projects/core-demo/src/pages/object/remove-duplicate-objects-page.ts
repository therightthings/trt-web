import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

const defaultArray = JSON.stringify(
  [
    { id: 1, name: 'A' },
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
  ],
  null,
  2,
);

export const createRemoveDuplicateObjectsPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">obj-handler/remove-duplicate-objects</p><h1>removeDuplicateObjects</h1><p>Deduplicate deeply equal values or provide a property key to define identity.</p></section><section class="card"><label>Array JSON<textarea id="duplicate-array-input" rows="12">${defaultArray}</textarea></label><label>Optional key <input id="duplicate-key" placeholder="id" /></label><button id="duplicate-run" type="button">Remove duplicates</button><pre id="duplicate-result" class="demo-result">No duplicates removed yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#duplicate-result')!;
  page.querySelector('#duplicate-run')?.addEventListener('click', () => {
    try {
      const input: unknown = JSON.parse(
        page.querySelector<HTMLTextAreaElement>('#duplicate-array-input')!.value,
      );
      if (!Array.isArray(input)) {
        throw new Error('Input must be a JSON array.');
      }
      const key = page.querySelector<HTMLInputElement>('#duplicate-key')!.value.trim();
      const output = key
        ? trt.object.removeDuplicateObjects(input, (item) =>
            String((item as Record<string, unknown>)[key]),
          )
        : trt.object.removeDuplicateObjects(input);
      result.textContent = JSON.stringify(output, null, 2);
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  page.append(
    createTestCases([
      {
        input: `removeDuplicateObjects([{ id: 1 }, { id: 1 }, { id: 2 }])`,
        run: () => trt.object.removeDuplicateObjects([{ id: 1 }, { id: 1 }, { id: 2 }]),
      },
      {
        input: `removeDuplicateObjects([{ id: 1, name: 'A' }, { id: 1, name: 'B' }], item => String(item.id))`,
        run: () =>
          trt.object.removeDuplicateObjects(
            [
              { id: 1, name: 'A' },
              { id: 1, name: 'B' },
            ],
            (item) => String((item as { id: number }).id),
          ),
      },
      {
        input: `removeDuplicateObjects([new Date('2024-01-01'), new Date('2024-01-01')])`,
        run: () =>
          trt.object
            .removeDuplicateObjects([new Date('2024-01-01'), new Date('2024-01-01')])
            .map((date) => date.toISOString()),
      },
    ]),
  );
  return page;
};
