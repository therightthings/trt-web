import { trt } from '@trt-web/core';

import { createTestCases } from '../../components/test-cases';

export const createThrottlePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">rate-limit/throttle</p><h1>throttle</h1><p>Limit execution to at most once per wait window.</p></section><section class="card"><label>Wait (ms) <input id="throttle-wait" type="number" min="0" value="500" /></label><label><input id="throttle-leading" type="checkbox" checked /> Leading</label><label><input id="throttle-trailing" type="checkbox" checked /> Trailing</label><div class="demo-actions"><button id="throttle-call" type="button">Call once</button><button id="throttle-burst" type="button">Call burst (5)</button><button id="throttle-flush" type="button">Flush</button><button id="throttle-cancel" type="button">Cancel</button></div><pre id="throttle-result" class="demo-result">Calls: 0 | Pending: false</pre></section>`;
  const result = page.querySelector<HTMLElement>('#throttle-result')!;
  let calls = 0;
  let throttled: ReturnType<typeof trt.timing.throttle> | undefined;
  const render = () => {
    result.textContent = `Calls: ${calls} | Pending: ${throttled?.pending() ?? false}`;
  };
  const create = () => {
    calls = 0;
    throttled = trt.timing.throttle(
      () => {
        calls += 1;
        render();
      },
      Number(page.querySelector<HTMLInputElement>('#throttle-wait')!.value),
      {
        leading: page.querySelector<HTMLInputElement>('#throttle-leading')!.checked,
        trailing: page.querySelector<HTMLInputElement>('#throttle-trailing')!.checked,
      },
    );
    return throttled;
  };
  page.querySelector('#throttle-call')?.addEventListener('click', () => {
    (throttled ??= create())();
    render();
  });
  page.querySelector('#throttle-burst')?.addEventListener('click', () => {
    const fn = throttled ?? create();
    for (let index = 0; index < 5; index += 1) fn();
    render();
  });
  page.querySelector('#throttle-flush')?.addEventListener('click', () => {
    throttled?.flush();
    render();
  });
  page.querySelector('#throttle-cancel')?.addEventListener('click', () => {
    throttled?.cancel();
    render();
  });
  page.append(
    createTestCases([
      {
        input: `throttle(fn, 20) -> call twice -> wait 30ms`,
        run: async () => {
          let calls = 0;
          const fn = trt.timing.throttle(() => {
            calls += 1;
          }, 20);
          fn();
          fn();
          await new Promise((resolve) => setTimeout(resolve, 30));
          return { calls, pending: fn.pending() };
        },
      },
      {
        input: `throttle(fn, 20, { leading: false, trailing: true })`,
        run: async () => {
          let calls = 0;
          const fn = trt.timing.throttle(
            () => {
              calls += 1;
            },
            20,
            { leading: false, trailing: true },
          );
          fn();
          const beforeWait = calls;
          await new Promise((resolve) => setTimeout(resolve, 30));
          return { beforeWait, calls, pending: fn.pending() };
        },
      },
      {
        input: `throttle(fn, 50) -> call twice -> flush()`,
        run: () => {
          let calls = 0;
          const fn = trt.timing.throttle(() => {
            calls += 1;
          }, 50);
          fn();
          fn();
          fn.flush();
          return { calls, pending: fn.pending() };
        },
      },
    ]),
  );
  return page;
};
