import { LocalStorage } from '@trt-web/core';

import { createThemeSwitcher } from './theme-switcher';

export type DemoMenuItem = {
  label: string;
  pageId?: string;
  children?: DemoMenuItem[];
};

const menuItems: DemoMenuItem[] = [
  {
    label: 'browser',
    children: [
      { label: 'ai', pageId: 'ai' },
      { label: 'audio-context' },
      { label: 'battery' },
      { label: 'bluetooth' },
      { label: 'clipboard' },
      { label: 'cookie' },
      { label: 'environment' },
      { label: 'file-system' },
      { label: 'indexed-db' },
      { label: 'local-storage' },
      { label: 'location' },
      {
        label: 'media',
        children: [
          { label: 'camera', pageId: 'camera' },
          { label: 'microphone', pageId: 'microphone' },
          { label: 'screen', pageId: 'screen' },
        ],
      },
      { label: 'nfc' },
      { label: 'network' },
      { label: 'permission' },
      { label: 'presentation' },
      { label: 'resource' },
      { label: 'session-storage' },
      { label: 'share' },
      {
        label: 'speech',
        pageId: '',
        children: [
          { label: 'text-to-speech', pageId: 'text-to-speech' },
          { label: 'speech-to-text', pageId: 'speech-to-text' },
        ],
      },
      { label: 'tab-activity' },
      { label: 'vibration' },
      { label: 'wake-lock' },
      { label: 'viewport' },
      { label: 'peer-connection' },
      { label: 'window' },
      { label: 'window-manager' },
      { label: 'worker' },
    ],
  },
  {
    label: 'date',
    children: [{ label: 'generate-timestamp' }, { label: 'range-date' }],
  },
  {
    label: 'dom',
    children: [
      { label: 'canvas' },
      { label: 'generate-random-color' },
      { label: 'get-element-info' },
      { label: 'var-css' },
    ],
  },
  {
    label: 'file',
    children: [
      { label: 'compress-image' },
      { label: 'convert-file-size' },
      { label: 'file-to-data-url' },
      { label: 'file-to-object-url' },
      { label: 'get-image-size' },
      { label: 'load-image' },
    ],
  },
  {
    label: 'number',
    children: [
      { label: 'bayesian-rating' },
      { label: 'format-view-count' },
      { label: 'haversine-distance' },
      { label: 'random-number' },
    ],
  },
  {
    label: 'object',
    children: [{ label: 'clean-obj' }, { label: 'remove-duplicate-objects' }],
  },
  {
    label: 'timing',
    children: [{ label: 'debounce' }, { label: 'throttle' }, { label: 'wait' }],
  },
  {
    label: 'string',
    children: [
      { label: 'capitalize' },
      { label: 'generate-hash' },
      { label: 'generate-id' },
      { label: 'generate-random-string' },
      { label: 'generate-sort-order-key' },
      { label: 'remove-tones' },
      { label: 'search-key' },
    ],
  },
];

const expandedStorageKey = 'core-demo-expanded-menus';
const sidebarWidthStorageKey = 'core-demo-sidebar-width';
const defaultSidebarWidth = 260;
const minSidebarWidth = 200;
const maxSidebarWidth = 700;

const readExpandedMenus = (): Set<string> => {
  const value = LocalStorage.get<unknown[]>(expandedStorageKey);
  return new Set(
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
  );
};

const readSidebarWidth = (): number => {
  const value = Number(LocalStorage.get<number | string>(sidebarWidthStorageKey));
  return Number.isFinite(value)
    ? Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value))
    : defaultSidebarWidth;
};

const formatMenuLabel = (label: string): string =>
  label
    .split('-')
    .filter((word) => word !== 'handler')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const countUtilities = (item: DemoMenuItem): number => {
  if (!item.children?.length) {
    return 1;
  }

  return item.children.reduce((total, child) => total + countUtilities(child), 0);
};

const renderMenu = (items: DemoMenuItem[], expandedMenus: Set<string>, parentKey = ''): string => {
  return items
    .map((item, index) => {
      const hasChildren = Boolean(item.children?.length);
      const menuKey = parentKey ? `${parentKey}.${item.label}` : `${index}.${item.label}`;
      const isExpanded = expandedMenus.has(menuKey);
      const children = hasChildren
        ? `<div class="submenu" data-level="${menuKey}">${renderMenu(item.children!, expandedMenus, menuKey)}</div>`
        : '';

      return `<div class="menu-group ${isExpanded ? 'is-expanded' : ''}" data-menu-key="${menuKey}">
        ${
          hasChildren
            ? `<div class="menu-item menu-group-header">
              <button class="menu-group-title" data-page-id="${item.pageId ?? item.label}" type="button">
                <span>${formatMenuLabel(item.label)}<span class="menu-count">${countUtilities(item)}</span></span>
              </button>
              <button class="menu-toggle-button breadcrumb-back" type="button" aria-label="Toggle ${formatMenuLabel(item.label)}" aria-expanded="${isExpanded}">
                <span class="menu-toggle" aria-hidden="true">${isExpanded ? '−' : '+'}</span>
              </button>
            </div>`
            : `<button class="menu-item leaf" data-page-id="${item.pageId ?? item.label}" type="button">
              <span>${formatMenuLabel(item.label)}</span>
              <span class="menu-spacer"></span>
            </button>`
        }
        ${children}
      </div>`;
    })
    .join('');
};

export const createCoreSidebar = (onPageSelect?: (pageId: string) => void): HTMLElement => {
  const expandedMenus = readExpandedMenus();
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.style.width = `${readSidebarWidth()}px`;
  sidebar.innerHTML = /*html*/ `
    <div class="sidebar-heading">
      <div class="sidebar-brand-row">
        <button class="home-link" id="home-link" type="button"><img class="brand-icon" src="/favicon.svg" alt="" /><span class="eyebrow">@trt-web/core</span></button>
        <div id="sidebar-theme"></div>
      </div>
    </div>
    <div class="sidebar-search">
      <label class="sr-only" for="sidebar-search-input">Search utilities</label>
      <div class="sidebar-search-box">
        <span class="sidebar-search-icon" aria-hidden="true"><svg viewBox="0 0 640 640"><path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" /></svg></span>
        <input id="sidebar-search-input" type="search" placeholder="Search utilities..." autocomplete="off" />
        <button id="sidebar-search-clear" class="sidebar-search-clear" type="button" aria-label="Clear search" hidden><svg viewBox="0 0 640 640"><path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z" /></svg></button>
      </div>
    </div>
    <div class="sidebar-menu-controls">
      <button id="toggle-all-menus" type="button">Expand all</button>
    </div>
    <nav aria-label="Core utilities">${renderMenu(menuItems, expandedMenus)}</nav>
    <div class="sidebar-resizer" role="separator" aria-label="Resize sidebar" tabindex="0"></div>
  `;

  sidebar.querySelector('#sidebar-theme')?.append(createThemeSwitcher());

  sidebar.querySelector('#home-link')?.addEventListener('click', () => {
    window.location.hash = '';
  });

  const menuButtons = [...sidebar.querySelectorAll<HTMLButtonElement>('.menu-toggle-button')];
  const menuGroups = menuButtons
    .map((button) => button.closest<HTMLElement>('.menu-group'))
    .filter((group): group is HTMLElement => Boolean(group));
  const toggleAllButton = sidebar.querySelector<HTMLButtonElement>('#toggle-all-menus');
  const searchInput = sidebar.querySelector<HTMLInputElement>('#sidebar-search-input');
  const searchClearButton = sidebar.querySelector<HTMLButtonElement>('#sidebar-search-clear');
  const persistExpandedMenus = () => {
    LocalStorage.set(expandedStorageKey, [...expandedMenus]);
  };
  const updateToggleAllLabel = () => {
    const allExpanded =
      menuGroups.length > 0 && menuGroups.every((group) => group.classList.contains('is-expanded'));
    if (toggleAllButton) toggleAllButton.textContent = allExpanded ? 'Collapse all' : 'Expand all';
  };

  const filterMenu = (query: string): void => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filterGroup = (group: HTMLElement): boolean => {
      const button = group.querySelector<HTMLButtonElement>(':scope > .menu-item');
      const childGroups = [
        ...group.querySelectorAll<HTMLElement>(':scope > .submenu > .menu-group'),
      ];
      const hasMatchingChild = childGroups.some(filterGroup);
      const label = button?.textContent?.trim().toLocaleLowerCase() ?? '';
      const matches = !normalizedQuery || label.includes(normalizedQuery) || hasMatchingChild;

      group.hidden = !matches;
      if (normalizedQuery && hasMatchingChild) {
        group.classList.add('is-expanded');
      }
      if (!normalizedQuery) {
        group.classList.toggle('is-expanded', expandedMenus.has(group.dataset.menuKey ?? ''));
      }
      return matches;
    };

    sidebar.querySelectorAll<HTMLElement>(':scope > nav > .menu-group').forEach(filterGroup);
  };

  searchInput?.addEventListener('input', () => {
    filterMenu(searchInput.value);
    if (searchClearButton) searchClearButton.hidden = !searchInput.value;
  });
  searchClearButton?.addEventListener('click', () => {
    if (!searchInput) return;
    searchInput.value = '';
    searchInput.focus();
    searchClearButton.hidden = true;
    filterMenu('');
  });
  toggleAllButton?.addEventListener('click', () => {
    const shouldExpand = menuGroups.some((group) => !group.classList.contains('is-expanded'));
    menuGroups.forEach((group, index) => {
      group.classList.toggle('is-expanded', shouldExpand);
      const menuKey = group.dataset.menuKey;
      if (menuKey) {
        if (shouldExpand) expandedMenus.add(menuKey);
        else expandedMenus.delete(menuKey);
      }
      const toggle = menuButtons[index];
      if (toggle) {
        toggle.querySelector<HTMLElement>('.menu-toggle')!.textContent = shouldExpand ? '−' : '+';
        toggle.setAttribute('aria-expanded', String(shouldExpand));
      }
    });
    persistExpandedMenus();
    updateToggleAllLabel();
  });

  const resizer = sidebar.querySelector<HTMLElement>('.sidebar-resizer');
  resizer?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebar.getBoundingClientRect().width;
    resizer.setPointerCapture(event.pointerId);
    const updateWidth = (moveEvent: PointerEvent) => {
      const width = Math.min(
        maxSidebarWidth,
        Math.max(minSidebarWidth, startWidth + moveEvent.clientX - startX),
      );
      sidebar.style.width = `${width}px`;
      LocalStorage.set(sidebarWidthStorageKey, width);
    };
    const stopResize = () => {
      if (resizer.hasPointerCapture(event.pointerId)) {
        resizer.releasePointerCapture(event.pointerId);
      }
      resizer.removeEventListener('pointermove', updateWidth);
      resizer.removeEventListener('pointerup', stopResize);
      resizer.removeEventListener('pointercancel', stopResize);
    };
    resizer.addEventListener('pointermove', updateWidth);
    resizer.addEventListener('pointerup', stopResize);
    resizer.addEventListener('pointercancel', stopResize);
  });

  const updateSelectedItem = () => {
    const path = window.location.hash.slice(2).replace(/\/$/, '');
    const selectedPageId = path.split('/').pop() ?? '';
    sidebar.querySelectorAll<HTMLButtonElement>('.menu-item.leaf').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.pageId === selectedPageId);
    });
  };

  window.addEventListener('hashchange', updateSelectedItem);
  updateSelectedItem();

  sidebar.querySelectorAll<HTMLButtonElement>('.menu-toggle-button').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest<HTMLElement>('.menu-group');
      const toggle = button.querySelector<HTMLElement>('.menu-toggle');
      if (!group || !toggle) {
        return;
      }

      const expanded = group.classList.toggle('is-expanded');
      toggle.textContent = expanded ? '−' : '+';
      button.setAttribute('aria-expanded', String(expanded));
      const menuKey = group.dataset.menuKey;
      if (menuKey) {
        if (expanded) {
          expandedMenus.add(menuKey);
        } else {
          expandedMenus.delete(menuKey);
        }
        persistExpandedMenus();
        updateToggleAllLabel();
      }
    });
  });

  sidebar.querySelectorAll<HTMLButtonElement>('.menu-group-title').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest<HTMLElement>('.menu-group')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      const pageId = button.dataset.pageId;
      if (pageId) {
        onPageSelect?.(pageId);
      }
    });
  });

  sidebar.querySelectorAll<HTMLButtonElement>('.menu-item.leaf').forEach((button) => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.pageId;
      if (pageId) {
        onPageSelect?.(pageId);
        sidebar.querySelectorAll<HTMLButtonElement>('.menu-item.leaf').forEach((item) => {
          item.classList.toggle('is-selected', item === button);
        });
      }
    });
  });

  updateToggleAllLabel();

  return sidebar;
};
