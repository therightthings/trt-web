import { BrowserPresentation } from '@trt-web/core';

const zoomInIcon = `<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z" /></svg>`;
const zoomOutIcon = `<svg viewBox="0 0 640 640" aria-hidden="true"><path d="M256 128C256 110.3 241.7 96 224 96C206.3 96 192 110.3 192 128L192 192L128 192C110.3 192 96 206.3 96 224C96 241.7 110.3 256 128 256L224 256C241.7 256 256 241.7 256 224L256 128zM128 384C110.3 384 96 398.3 96 416C96 433.7 110.3 448 128 448L192 448L192 512C192 529.7 206.3 544 224 544C241.7 544 256 529.7 256 512L256 416C256 398.3 241.7 384 224 384L128 384zM448 128C448 110.3 433.7 96 416 96C398.3 96 384 110.3 384 128L384 224C384 241.7 398.3 256 416 256L512 256C529.7 256 544 241.7 544 224C544 206.3 529.7 192 512 192L448 192L448 128zM416 384C398.3 384 384 398.3 384 416L384 512C384 529.7 398.3 544 416 544C433.7 544 448 529.7 448 512L448 448L512 448C529.7 448 544 433.7 544 416C544 398.3 529.7 384 512 384L416 384z" /></svg>`;

export const createToggleFullscreen = (target: Element = document.documentElement): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'demo-actions';
  target.classList.add('fullscreen-target');

  const button = document.createElement('button');
  button.className = 'fullscreen-toggle';
  button.type = 'button';

  const update = (): void => {
    const isFullscreen = document.fullscreenElement === target;
    const label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
    button.innerHTML = isFullscreen ? zoomOutIcon : zoomInIcon;
    button.title = label;
    button.setAttribute('aria-label', label);
  };

  button.addEventListener('click', async () => {
    const isFullscreen = document.fullscreenElement === target;
    const success = isFullscreen
      ? await BrowserPresentation.exitFullscreen()
      : await BrowserPresentation.enterFullscreen(target);

    if (success) {
      update();
    }
  });

  document.addEventListener('fullscreenchange', update);
  update();
  container.append(button);
  return container;
};
