import { IndexedDB } from '@trt-web/browser';

type DemoRecord = { id: string; name: string; updatedAt: string };

export const createIndexedDbPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/indexed-db</p><h1>IndexedDB</h1><p>Register a database and collection, then use typed records.</p></section><section class="grid"><article class="card"><label>Database <input id="db-name" value="CoreDemo" /></label><label>Collection <input id="db-collection" value="records" /></label><label>Record id <input id="db-id" value="demo-1" /></label><label>Name <input id="db-record-name" value="Alice" /></label><div class="demo-actions"><button id="db-register">Register</button><button id="db-add">Add</button><button id="db-put">Put</button><button id="db-get">Get</button><button id="db-all">Get all</button><button id="db-remove">Remove</button><button id="db-clear">Clear</button><button id="db-databases">List databases</button></div></article><article class="card"><pre id="db-result" class="demo-result">No action run yet.</pre></article></section>`;
  const result = page.querySelector<HTMLElement>('#db-result')!;
  let collection: IndexedDB<DemoRecord> | undefined;
  const register = () => {
    const database = IndexedDB.register({
      database: page.querySelector<HTMLInputElement>('#db-name')!.value,
      version: 1,
      collections: [page.querySelector<HTMLInputElement>('#db-collection')!.value],
    });
    collection = database.collection<DemoRecord>(
      page.querySelector<HTMLInputElement>('#db-collection')!.value,
    );
    return collection;
  };
  const record = (): DemoRecord => ({
    id: page.querySelector<HTMLInputElement>('#db-id')!.value,
    name: page.querySelector<HTMLInputElement>('#db-record-name')!.value,
    updatedAt: new Date().toISOString(),
  });
  page.querySelector('#db-register')?.addEventListener('click', () => {
    register();
    result.textContent = 'Database registered.';
  });
  page.querySelector('#db-add')?.addEventListener('click', async () => {
    await (collection ?? register()).add(record());
    result.textContent = 'Record added.';
  });
  page.querySelector('#db-put')?.addEventListener('click', async () => {
    await (collection ?? register()).put(record());
    result.textContent = 'Record saved.';
  });
  page.querySelector('#db-get')?.addEventListener('click', async () => {
    result.textContent = JSON.stringify(
      await (collection ?? register()).get(page.querySelector<HTMLInputElement>('#db-id')!.value),
      null,
      2,
    );
  });
  page.querySelector('#db-all')?.addEventListener('click', async () => {
    result.textContent = JSON.stringify(await (collection ?? register()).getAll(), null, 2);
  });
  page.querySelector('#db-remove')?.addEventListener('click', async () => {
    await (collection ?? register()).remove(page.querySelector<HTMLInputElement>('#db-id')!.value);
    result.textContent = 'Record removed.';
  });
  page.querySelector('#db-clear')?.addEventListener('click', async () => {
    await (collection ?? register()).clear();
    result.textContent = 'Collection cleared.';
  });
  page.querySelector('#db-databases')?.addEventListener('click', async () => {
    result.textContent = JSON.stringify(await IndexedDB.databases(), null, 2);
  });
  return page;
};
