import { BrowserFileSystem } from '@trt-web/browser';

export const createFileSystemPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/file-system</p>
      <h1>BrowserFileSystem</h1>
      <p>Open, read, save files and inspect directories through explicit user actions.</p>
    </section>
    <section class="grid">
      <article class="card">
        <label>Text to save <textarea id="file-text">Hello from core-demo</textarea></label>
        <label>Suggested name <input id="file-name" value="core-demo.txt" /></label>
        <div class="demo-actions">
          <button id="file-open-handle" type="button">Open handle</button>
          <button id="file-read" type="button">Read file</button>
          <button id="file-open-many" type="button">Read files</button>
          <button id="file-save" type="button">Save file</button>
          <button id="file-directory" type="button">Open directory</button>
          <button id="file-opfs" type="button">Open OPFS root</button>
        </div>
      </article>
      <article class="card">
        <pre id="file-result" class="demo-result">No action run yet.</pre>
      </article>
    </section>
  `;
  const result = page.querySelector<HTMLElement>('#file-result')!;
  const show = (value: unknown): void => {
    result.textContent = JSON.stringify(value, null, 2);
  };

  page.querySelector('#file-open-handle')?.addEventListener('click', async () => {
    const handle = await BrowserFileSystem.openFile();
    if (!handle || Array.isArray(handle)) {
      result.textContent = 'No file selected.';
      return;
    }

    const permission = await BrowserFileSystem.requestPermission(handle, 'readwrite');
    show({ name: handle.name, kind: handle.kind, permission });
  });
  page.querySelector('#file-read')?.addEventListener('click', async () => {
    const item = await BrowserFileSystem.readFile();
    if (!item) {
      result.textContent = 'No file selected.';
      return;
    }

    show({
      name: item.file.name,
      type: item.file.type,
      size: item.file.size,
      lastModified: new Date(item.file.lastModified).toISOString(),
      text: item.text,
    });
  });
  page.querySelector('#file-open-many')?.addEventListener('click', async () => {
    show(
      (await BrowserFileSystem.readFiles({ multiple: true })).map((item) => ({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
        lastModified: new Date(item.file.lastModified).toISOString(),
        text: item.text,
      })),
    );
  });
  page.querySelector('#file-save')?.addEventListener('click', async () => {
    const handle = await BrowserFileSystem.saveFile(
      page.querySelector<HTMLTextAreaElement>('#file-text')!.value,
      {
        suggestedName: page.querySelector<HTMLInputElement>('#file-name')!.value,
        types: [{ description: 'Text files', accept: { 'text/plain': ['.txt'] } }],
      },
    );
    show(
      handle
        ? { name: handle.name, kind: handle.kind, saved: true }
        : { saved: false, message: 'Save cancelled or unsupported.' },
    );
  });
  page.querySelector('#file-directory')?.addEventListener('click', async () => {
    const entries = await BrowserFileSystem.listDirectory();
    result.textContent =
      entries.map((entry) => `${entry.kind}: ${entry.name}`).join('\n') || 'No entries.';
  });
  page.querySelector('#file-opfs')?.addEventListener('click', async () => {
    result.textContent = (await BrowserFileSystem.getOpfsRoot())
      ? 'OPFS root available.'
      : 'OPFS unavailable.';
  });
  return page;
};
