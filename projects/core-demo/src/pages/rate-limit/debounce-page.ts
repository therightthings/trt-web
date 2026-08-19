import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createDebouncePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">rate-limit/debounce</p><h1>debounce</h1><p>Delay execution until calls stop, with leading, trailing and maxWait options.</p></section><section class="card"><label>Wait (ms) <input id="debounce-wait" type="number" min="0" value="500" /></label><label>Max wait (ms, optional) <input id="debounce-max-wait" type="number" min="0" placeholder="none" /></label><label><input id="debounce-leading" type="checkbox" /> Leading</label><label><input id="debounce-trailing" type="checkbox" checked /> Trailing</label><div class="demo-actions"><button id="debounce-call" type="button">Call once</button><button id="debounce-burst" type="button">Call burst (5)</button><button id="debounce-flush" type="button">Flush</button><button id="debounce-cancel" type="button">Cancel</button></div><pre id="debounce-result" class="demo-result">Calls: 0 | Pending: false</pre></section>`;
  const result = page.querySelector<HTMLElement>('#debounce-result')!;
  let calls = 0;
  let debounced: ReturnType<typeof trt.timing.debounce> | undefined;
  const render = () => {
    result.textContent = `Calls: ${calls} | Pending: ${debounced?.pending() ?? false}`;
  };
  const create = () => {
    calls = 0;
    const maxWaitValue = page.querySelector<HTMLInputElement>('#debounce-max-wait')!.value;
    debounced = trt.timing.debounce(
      () => {
        calls += 1;
        render();
      },
      Number(page.querySelector<HTMLInputElement>('#debounce-wait')!.value),
      {
        leading: page.querySelector<HTMLInputElement>('#debounce-leading')!.checked,
        trailing: page.querySelector<HTMLInputElement>('#debounce-trailing')!.checked,
        ...(maxWaitValue ? { maxWait: Number(maxWaitValue) } : {}),
      },
    );
    return debounced;
  };
  page.querySelector('#debounce-call')?.addEventListener('click', () => {
    (debounced ??= create())();
    render();
  });
  page.querySelector('#debounce-burst')?.addEventListener('click', () => {
    const fn = debounced ?? create();
    for (let index = 0; index < 5; index += 1) fn();
    render();
  });
  page.querySelector('#debounce-flush')?.addEventListener('click', () => {
    debounced?.flush();
    render();
  });
  page.querySelector('#debounce-cancel')?.addEventListener('click', () => {
    debounced?.cancel();
    render();
  });
  page.append(
    createTestCases([
      {
        input: `debounce(fn, 20) -> call once -> wait 30ms`,
        run: async () => {
          let calls = 0;
          const fn = trt.timing.debounce(() => {
            calls += 1;
          }, 20);
          fn();
          await new Promise((resolve) => setTimeout(resolve, 30));
          return { calls, pending: fn.pending() };
        },
      },
      {
        input: `debounce(fn, 20, { leading: true, trailing: false })`,
        run: () => {
          let calls = 0;
          const fn = trt.timing.debounce(
            () => {
              calls += 1;
            },
            20,
            { leading: true, trailing: false },
          );
          fn();
          return { calls, pending: fn.pending() };
        },
      },
      {
        input: `debounce(fn, 50) -> call -> flush()`,
        run: () => {
          let calls = 0;
          const fn = trt.timing.debounce(() => {
            calls += 1;
          }, 50);
          fn();
          fn.flush();
          return { calls, pending: fn.pending() };
        },
      },
    ]),
  );
  return page;
};
