import { BrowserViewport } from '@trt-web/browser';

export const createViewportPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">browser/viewport</p>
      <h1>BrowserViewport</h1>
      <p>Read the current viewport and listen to global resize changes.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Current state</h2>
        <button id="viewport-read" type="button">Read viewport</button>
        <pre id="viewport-state" class="demo-result">No viewport state read yet.</pre>
      </article>
      <article class="card">
        <h2>Breakpoint configuration</h2>
        <button id="viewport-register" type="button">Register custom ranges</button>
        <pre id="viewport-ranges" class="demo-result">No custom ranges registered.</pre>
      </article>
      <article class="card">
        <h2>Resize subscription</h2>
        <div class="demo-actions">
          <button id="viewport-subscribe" type="button">Subscribe</button>
          <button id="viewport-unsubscribe" type="button">Unsubscribe</button>
        </div>
        <pre id="viewport-events" class="demo-result">Not subscribed.</pre>
      </article>
    </section>
  `;

  const state = page.querySelector<HTMLElement>('#viewport-state')!;
  const ranges = page.querySelector<HTMLElement>('#viewport-ranges')!;
  const events = page.querySelector<HTMLElement>('#viewport-events')!;
  let subscription: ReturnType<typeof BrowserViewport.subscribe> | undefined;

  const renderState = (): void => {
    state.textContent = JSON.stringify(BrowserViewport.getCurrentState(), null, 2);
  };

  page.querySelector('#viewport-read')?.addEventListener('click', renderState);

  page.querySelector('#viewport-register')?.addEventListener('click', () => {
    BrowserViewport.register({
      phone: { max: 599 },
      tablet: { min: 600, max: 1023 },
      'custom-tablet': { min: 600, max: 1023 },
      desktop: { min: 1024 },
      wide: { min: 1440 },
    });
    ranges.textContent = JSON.stringify(BrowserViewport.getCurrentState(), null, 2);
    renderState();
  });

  page.querySelector('#viewport-subscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = BrowserViewport.subscribe((state) => {
      events.textContent = JSON.stringify(state, null, 2);
      console.log(
        'is in tablet range',
        BrowserViewport.isInRange('tablet'),
        state.ranges,
        state.orientation,
      );
    });
    events.textContent = 'Subscribed. Resize the browser window to receive updates.';
  });

  page.querySelector('#viewport-unsubscribe')?.addEventListener('click', () => {
    subscription?.unsubscribe();
    subscription = undefined;
    events.textContent = 'Unsubscribed.';
  });

  renderState();
  return page;
};
