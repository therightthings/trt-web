import { BrowserPresentation } from '@trt-web/browser';

export const createPresentationPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/presentation</p><h1>BrowserPresentation</h1><p>Try fullscreen and picture-in-picture actions.</p></section><section class="card"><div class="demo-actions"><button id="presentation-fullscreen">Enter fullscreen</button><button id="presentation-exit-fullscreen">Exit fullscreen</button><button id="presentation-pip">Enter picture-in-picture</button><button id="presentation-exit-pip">Exit picture-in-picture</button></div><video id="presentation-video" class="media-preview" controls></video><input id="presentation-file" type="file" accept="video/*" /><p id="presentation-result" class="demo-result">No action run yet.</p></section>`;
  const video = page.querySelector<HTMLVideoElement>('#presentation-video')!;
  const result = page.querySelector<HTMLElement>('#presentation-result')!;
  let url: string | null = null;
  page.querySelector('#presentation-file')?.addEventListener('change', () => {
    const file = page.querySelector<HTMLInputElement>('#presentation-file')!.files?.[0];
    if (file) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(file);
      video.src = url;
      result.textContent = 'Video loaded.';
    }
  });
  page.querySelector('#presentation-fullscreen')?.addEventListener('click', async () => {
    result.textContent = `Fullscreen: ${await BrowserPresentation.enterFullscreen(page)}`;
  });
  page.querySelector('#presentation-exit-fullscreen')?.addEventListener('click', async () => {
    result.textContent = `Exit fullscreen: ${await BrowserPresentation.exitFullscreen()}`;
  });
  page.querySelector('#presentation-pip')?.addEventListener('click', async () => {
    result.textContent = `Picture-in-picture: ${await BrowserPresentation.enterPictureInPicture(video)}`;
  });
  page.querySelector('#presentation-exit-pip')?.addEventListener('click', async () => {
    result.textContent = `Exit picture-in-picture: ${await BrowserPresentation.exitPictureInPicture()}`;
  });
  return page;
};
