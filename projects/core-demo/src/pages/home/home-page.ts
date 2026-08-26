import { BrowserClipboard } from '@trt-web/browser';

export const createHomePage = (): HTMLElement => {
  const content = document.createElement('main');
  content.className = 'content home-content';
  content.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">@trt-web/core</p>
      <p>Small, framework-free examples for browser utilities.</p>
      <div>
      Github:
      <a class="github-link" href="https://github.com/therightthings/trt-web" target="_blank" rel="noopener noreferrer">therightthings/trt-web</a>
      </div>
      <div>
      Npm:
      <a class="github-link" href="https://www.npmjs.com/package/@trt-web/core" target="_blank" rel="noopener noreferrer">@trt-web/core</a>
      </div>
    </section>
    <section class="card">
      <h2>Utility groups</h2>
      <div class="utility-grid home-groups">
        ${[
          ['browser', 'Browser'],
          ['date-handler', 'Date'],
          ['dom-handler', 'Dom'],
          ['file-handler', 'File'],
          ['number-handler', 'Number'],
          ['obj-handler', 'Object'],
          ['string-handler', 'String'],
          ['rate-limit', 'Timing'],
        ]
          .map(
            ([path, label]) =>
              `<button class="utility-card" data-group-path="${path}" type="button"><strong>${label}</strong><span>Open group →</span></button>`,
          )
          .join('')}
      </div>
    </section>
    <section class="card install-card">
      <h2>Install</h2>
      <p>Choose your package manager and copy the command.</p>
      <div class="install-list">
        ${[
          ['npm', 'npm install @trt-web/core'],
          ['yarn', 'yarn add @trt-web/core'],
          ['pnpm', 'pnpm add @trt-web/core'],
          ['bun', 'bun add @trt-web/core'],
        ]
          .map(
            ([name, command]) =>
              `<div class="install-command"><code>${command}</code><button class="copy-install" data-command="${command}" type="button">Copy</button><span class="copy-status" aria-live="polite"></span></div>`,
          )
          .join('')}
      </div>
    </section>
  `;

  content.querySelectorAll<HTMLButtonElement>('[data-group-path]').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.hash = `/${button.dataset.groupPath}`;
    });
  });

  content.querySelectorAll<HTMLButtonElement>('.copy-install').forEach((button) => {
    button.addEventListener('click', async () => {
      const command = button.dataset.command ?? '';
      const status = button.nextElementSibling;
      try {
        const result = await BrowserClipboard.copy(command);
        if (!result.success) {
          throw new Error(`Clipboard permission: ${result.permission}`);
        }
        button.textContent = 'Copied';
        button.classList.add('is-copied');
      } catch {
        if (status) status.textContent = 'Copy failed. Select the command manually.';
      }
      window.setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 2000);
    });
  });

  return content;
};
