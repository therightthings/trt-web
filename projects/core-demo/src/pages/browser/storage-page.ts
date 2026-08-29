import { LocalStorage, SessionStorage } from '@trt-web/browser';

export const createStoragePage = (kind: 'local' | 'session'): HTMLElement => {
  const storage = kind === 'local' ? LocalStorage : SessionStorage;
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero"><p class="eyebrow">browser/${kind}-storage</p><h1>${kind === 'local' ? 'LocalStorage' : 'SessionStorage'}</h1><p>Typed CRUD operations for browser ${kind} storage.</p></section>
    <section class="grid"><article class="card">
      <label>Key <input id="storage-key" value="core-demo-${kind}" /></label>
      <label>Value <input id="storage-value-input" value="{&quot;id&quot;:1,&quot;name&quot;:&quot;Alice&quot;}" /></label>
      <div class="demo-actions"><button id="storage-set" type="button">Set</button><button id="storage-get" type="button">Get</button><button id="storage-exists" type="button">Exists</button><button id="storage-remove" type="button">Remove</button><button id="storage-clear" type="button">Clear</button></div>
    </article><article class="card"><h2>Result</h2><p id="storage-result" class="demo-result">No action run yet.</p></article></section>`;
  const result = page.querySelector<HTMLElement>('#storage-result')!;
  const key = () => page.querySelector<HTMLInputElement>('#storage-key')!.value;
  const value = () => page.querySelector<HTMLInputElement>('#storage-value-input')!.value;
  page.querySelector('#storage-set')?.addEventListener('click', () => {
    storage.set(key(), value());
    result.textContent = `Saved ${key()}.`;
  });
  page.querySelector('#storage-get')?.addEventListener('click', () => {
    result.textContent = JSON.stringify(storage.get<string>(key()));
  });
  page.querySelector('#storage-exists')?.addEventListener('click', () => {
    result.textContent = `Exists: ${storage.exists(key())}.`;
  });
  page.querySelector('#storage-remove')?.addEventListener('click', () => {
    storage.remove(key());
    result.textContent = `Removed ${key()}.`;
  });
  page.querySelector('#storage-clear')?.addEventListener('click', () => {
    storage.clear();
    result.textContent = 'Storage cleared.';
  });
  return page;
};
