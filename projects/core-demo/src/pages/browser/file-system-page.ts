import { BrowserFileSystem } from '@trt-web/core';

export const createFileSystemPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/file-system</p><h1>BrowserFileSystem</h1><p>Open, read, save files and inspect directories through explicit user actions.</p></section><section class="grid"><article class="card"><label>Text to save <textarea id="file-text">Hello from core-demo</textarea></label><label>Suggested name <input id="file-name" value="core-demo.txt" /></label><div class="demo-actions"><button id="file-open">Open file</button><button id="file-open-many">Open files</button><button id="file-save">Save file</button><button id="file-directory">Open directory</button><button id="file-opfs">Open OPFS root</button></div></article><article class="card"><pre id="file-result" class="demo-result">No action run yet.</pre></article></section>`;
  const result = page.querySelector<HTMLElement>('#file-result')!;
  page.querySelector('#file-open')?.addEventListener('click', async () => {
    const item = await BrowserFileSystem.openFile();
    result.textContent = item ? `${item.file.name}\n${item.text}` : 'No file selected.';
  });
  page.querySelector('#file-open-many')?.addEventListener('click', async () => {
    result.textContent = JSON.stringify(
      (await BrowserFileSystem.openFiles()).map((item) => item.file.name),
    );
  });
  page.querySelector('#file-save')?.addEventListener('click', async () => {
    const handle = await BrowserFileSystem.saveFile(
      page.querySelector<HTMLTextAreaElement>('#file-text')!.value,
      { suggestedName: page.querySelector<HTMLInputElement>('#file-name')!.value },
    );
    result.textContent = handle ? 'File saved.' : 'Save cancelled or unsupported.';
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
