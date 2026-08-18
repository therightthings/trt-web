import { createWorker, runWorker } from '@trt-web/core';
export const createWorkerPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/worker</p><h1>Worker utilities</h1><p>Run serializable functions away from the main thread.</p></section><section class="card"><label>Number <input id="worker-number" type="number" value="5" /></label><div class="demo-actions"><button id="worker-run">Run worker</button><button id="worker-create">Create worker</button></div><p id="worker-result" class="demo-result">No action run yet.</p></section>`;
  const result = page.querySelector<HTMLElement>('#worker-result')!;
  page.querySelector('#worker-run')?.addEventListener('click', async () => {
    const number = Number(page.querySelector<HTMLInputElement>('#worker-number')!.value);
    result.textContent = String(await runWorker((value: number) => value * value, number));
  });
  page.querySelector('#worker-create')?.addEventListener('click', () => {
    const worker = createWorker((value: string) => value.toUpperCase());
    worker.onmessage = (event: MessageEvent) => {
      result.textContent = JSON.stringify(event.data);
      worker.terminate();
    };
    worker.postMessage('hello worker');
    result.textContent = 'Worker created.';
  });
  return page;
};
