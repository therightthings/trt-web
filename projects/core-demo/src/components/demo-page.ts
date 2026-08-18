export type DemoPageConfig = {
  title: string;
  path: string;
  description: string;
  methods: string[];
  checkSupport?: () => boolean;
  actions?: Array<{ label: string; run: () => unknown | Promise<unknown> }>;
};

export const createDemoPage = (config: DemoPageConfig): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">${config.path}</p>
      <h1>${config.title}</h1>
      <p>${config.description}</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Public methods</h2>
        <ul class="method-list">
          ${config.methods.map((method) => `<li><code>${method}</code></li>`).join('')}
        </ul>
      </article>
      <article class="card demo-placeholder">
        <h2>Demo</h2>
        <p class="demo-result" id="demo-result">No action run yet.</p>
        ${config.checkSupport ? '<button id="support-button" type="button">Check browser support</button>' : ''}
        <div class="demo-actions">
          ${(config.actions ?? [])
            .map(
              (_, index) =>
                `<button class="demo-action" data-action-index="${index}" type="button">${config.actions![index].label}</button>`,
            )
            .join('')}
        </div>
      </article>
    </section>
  `;

  const supportButton = page.querySelector<HTMLButtonElement>('#support-button');
  const result = page.querySelector<HTMLParagraphElement>('#demo-result');
  supportButton?.addEventListener('click', () => {
    const supported = config.checkSupport?.() ?? false;
    if (result) {
      result.textContent = supported
        ? 'Supported by this browser.'
        : 'Not supported by this browser.';
    }
  });

  page.querySelectorAll<HTMLButtonElement>('.demo-action').forEach((button) => {
    button.addEventListener('click', async () => {
      const index = Number(button.dataset.actionIndex);
      const action = config.actions?.[index];
      if (!action || !result) {
        return;
      }

      button.disabled = true;
      try {
        const value = await action.run();
        result.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      } catch (error) {
        result.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        button.disabled = false;
      }
    });
  });

  return page;
};
