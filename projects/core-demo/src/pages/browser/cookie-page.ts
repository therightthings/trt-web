import { Cookie } from '@trt-web/core';

export const createCookiePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/cookie</p>
      <h1>Cookie</h1>
      <p>Store and retrieve typed values with expiration and path configuration.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Cookie configuration</h2>
        <label>Key <input id="cookie-key" value="core-demo-cookie" /></label>
        <label>Value <input id="cookie-value" value="{&quot;id&quot;:1,&quot;name&quot;:&quot;Alice&quot;}" /></label>
        <label>Expires in days <input id="cookie-days" type="number" min="0" value="7" /></label>
        <label>Path <input id="cookie-path" value="/" /></label>
        <div class="demo-actions">
          <button id="cookie-set" type="button">Set</button>
          <button id="cookie-get" type="button">Get</button>
          <button id="cookie-exists" type="button">Exists</button>
          <button id="cookie-remove" type="button">Remove</button>
          <button id="cookie-clear" type="button">Clear all</button>
        </div>
      </article>
      <article class="card">
        <h2>Result</h2>
        <p id="cookie-result" class="demo-result">No action run yet.</p>
      </article>
    </section>
  `;

  const result = page.querySelector<HTMLElement>('#cookie-result')!;
  const key = () => page.querySelector<HTMLInputElement>('#cookie-key')!.value;
  const value = () => page.querySelector<HTMLInputElement>('#cookie-value')!.value;
  const config = () => ({
    expiresIn: Number(page.querySelector<HTMLInputElement>('#cookie-days')!.value),
    path: page.querySelector<HTMLInputElement>('#cookie-path')!.value || '/',
  });

  page.querySelector('#cookie-set')?.addEventListener('click', () => {
    let data: unknown = value();
    try {
      data = JSON.parse(value());
    } catch {
      // Keep plain text values as strings.
    }
    Cookie.set(key(), data, config());
    result.textContent = `Saved ${key()}.`;
  });
  page.querySelector('#cookie-get')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(Cookie.get(key()));
  });
  page.querySelector('#cookie-exists')?.addEventListener('click', () => {
    result.textContent = `Exists: ${Cookie.exists(key())}.`;
  });
  page.querySelector('#cookie-remove')?.addEventListener('click', () => {
    Cookie.remove(key(), config());
    result.textContent = `Removed ${key()}.`;
  });
  page.querySelector('#cookie-clear')?.addEventListener('click', () => {
    Cookie.clear();
    result.textContent = 'All accessible cookies cleared.';
  });

  return page;
};
