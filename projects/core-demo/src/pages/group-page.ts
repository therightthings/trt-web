export type GroupPageEntry = {
  id: string;
  label: string;
  path: string;
};

export type GroupPageConfig = {
  title: string;
  path: string;
  description: string;
  entries: GroupPageEntry[];
};

export const createGroupPage = (config: GroupPageConfig): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = `<section class="hero"><p class="eyebrow">${config.path}</p><h1>${config.title}</h1><p>${config.description}</p></section><section class="utility-grid">${config.entries.map((entry) => `<button class="utility-card" data-path="${entry.path}" type="button"><strong>${entry.label}</strong><span>Open demo →</span></button>`).join('')}</section>`;
  page.querySelectorAll<HTMLButtonElement>('.utility-card').forEach((button) => {
    button.addEventListener('click', () => {
      const path = button.dataset.path;
      if (path) window.location.hash = `/${path}`;
    });
  });
  return page;
};
