import { BrowserNetwork, type BrowserSubscription } from '@trt-web/core';

export const createNetworkPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/network</p><h1>BrowserNetwork</h1><p>Read network state and subscribe to online/offline changes.</p></section><section class="card"><div class="demo-actions"><button id="network-state">Get state</button><button id="network-subscribe">Subscribe</button><button id="network-unsubscribe">Unsubscribe</button></div><pre id="network-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#network-result')!;
  let subscription: BrowserSubscription | undefined;
  page.querySelector('#network-state')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(BrowserNetwork.getState(), null, 2);
  });
  page.querySelector('#network-subscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = BrowserNetwork.subscribe((state) => {
      result.textContent = JSON.stringify(state, null, 2);
    });
    result.textContent = JSON.stringify(BrowserNetwork.getState(), null, 2);
  });
  page.querySelector('#network-unsubscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = undefined;
    result.textContent = 'Unsubscribed.';
  });
  return page;
};
