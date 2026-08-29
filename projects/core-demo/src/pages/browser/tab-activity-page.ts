import { type BrowserSubscription, BrowserTabActivity } from '@trt-web/browser';
export const createTabActivityPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/tab-activity</p><h1>BrowserTabActivity</h1><p>Observe focus, blur and visibility changes.</p></section><section class="card"><div class="demo-actions"><button id="tab-state">Get state</button><button id="tab-subscribe">Subscribe</button><button id="tab-unsubscribe">Unsubscribe</button></div><p id="tab-result" class="demo-result">No action run yet.</p></section>`;
  const result = page.querySelector<HTMLElement>('#tab-result')!;
  let subscription: BrowserSubscription | undefined;
  page.querySelector('#tab-state')?.addEventListener('click', () => {
    result.textContent = BrowserTabActivity.getState();
  });
  page.querySelector('#tab-subscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = BrowserTabActivity.subscribe((state) => {
      result.textContent = state;
    });
    result.textContent = BrowserTabActivity.getState();
  });
  page.querySelector('#tab-unsubscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = undefined;
    result.textContent = 'Unsubscribed.';
  });
  return page;
};
