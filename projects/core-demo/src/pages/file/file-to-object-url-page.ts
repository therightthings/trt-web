import { trt } from '@trt-web/core';

export const createFileToObjectUrlPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">file-handler/file-to-object-url</p><h1>fileToObjectUrl</h1><p>Create a temporary object URL from a File, Blob or data URL.</p></section><section class="card"><input id="object-url-file" type="file" accept="image/*" /><div class="demo-actions"><button id="object-url-file-run" type="button">Create from file</button><button id="object-url-data-run" type="button">Create from data URL</button></div><img id="object-url-preview" class="file-preview" alt="Object URL preview" /><pre id="object-url-result" class="demo-result">Choose an action.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#object-url-result')!;
  const preview = page.querySelector<HTMLImageElement>('#object-url-preview')!;
  const render = (url: string) => {
    preview.src = url;
    result.textContent = url;
  };
  page.querySelector('#object-url-file-run')?.addEventListener('click', () => {
    const file = page.querySelector<HTMLInputElement>('#object-url-file')!.files?.[0];
    if (file) render(trt.file.fileToObjectUrl(file));
  });
  page.querySelector('#object-url-data-run')?.addEventListener('click', () => {
    render(
      trt.file.fileToObjectUrl('data:text/plain;base64,SGVsbG8gZnJvbSBjb3JlLWRlbW8=', {
        type: 'text/plain',
      }),
    );
  });
  return page;
};
