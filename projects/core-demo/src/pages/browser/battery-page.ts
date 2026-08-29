import { BrowserBattery } from '@trt-web/browser';

export const createBatteryPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">browser/battery</p>
      <h1>BrowserBattery</h1>
      <p>Read battery status and observe charging or battery level changes.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Support</h2>
        <button id="battery-support" type="button">Check support</button>
        <pre id="battery-support-result" class="demo-result">Not checked yet.</pre>
      </article>
      <article class="card">
        <h2>Current state</h2>
        <button id="battery-read" type="button">Read battery state</button>
        <pre id="battery-state" class="demo-result">No battery state read yet.</pre>
      </article>
      <article class="card">
        <h2>Battery changes</h2>
        <div class="demo-actions">
          <button id="battery-subscribe" type="button">Subscribe</button>
          <button id="battery-unsubscribe" type="button">Unsubscribe</button>
        </div>
        <pre id="battery-events" class="demo-result">Not subscribed.</pre>
      </article>
    </section>
  `;

  const supportResult = page.querySelector<HTMLElement>('#battery-support-result')!;
  const stateResult = page.querySelector<HTMLElement>('#battery-state')!;
  const eventsResult = page.querySelector<HTMLElement>('#battery-events')!;
  let subscription: Awaited<ReturnType<typeof BrowserBattery.subscribe>> | undefined;

  const renderState = async (): Promise<void> => {
    try {
      const state = await BrowserBattery.getState();
      stateResult.textContent = state
        ? JSON.stringify(state, null, 2)
        : 'Battery Status API is not supported or unavailable.';
    } catch (error) {
      stateResult.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  page.querySelector('#battery-support')?.addEventListener('click', () => {
    supportResult.textContent = String(BrowserBattery.isSupported());
  });

  page.querySelector('#battery-read')?.addEventListener('click', () => {
    void renderState();
  });

  page.querySelector('#battery-subscribe')?.addEventListener('click', async () => {
    subscription?.unsubscribe();
    subscription = await BrowserBattery.subscribe((state) => {
      eventsResult.textContent = JSON.stringify(state, null, 2);
    });
    eventsResult.textContent = 'Subscribed. Change charging or battery level to receive updates.';
  });

  page.querySelector('#battery-unsubscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = undefined;
    eventsResult.textContent = 'Unsubscribed.';
  });

  void renderState();
  return page;
};
