import './styles.css';

import { trt } from '@trt-web/core';

import { createCoreSidebar } from './components/core-sidebar';
import { createTestCases, type DemoTestCase } from './components/test-cases';
import { createThemeSwitcher } from './components/theme-switcher';
import { createBrowserPage, getBrowserPageId, getBrowserPagePath } from './pages/browser-pages';
import { createHomePage } from './pages/home/home-page';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Could not find the demo root element.');
}

let content = createHomePage();
const groupPageIds = new Set([
  'browser',
  'date',
  'dom',
  'file',
  'number',
  'object',
  'timing',
  'string',
  'date-handler',
  'dom-handler',
  'file-handler',
  'number-handler',
  'obj-handler',
  'rate-limit',
  'string-handler',
]);

const groupExportNames: Record<string, string> = {
  'date-handler': 'date',
  'dom-handler': 'dom',
  'file-handler': 'file',
  'number-handler': 'number',
  'obj-handler': 'object',
  'rate-limit': 'timing',
  'string-handler': 'string',
};

const groupRouteNames: Record<string, string> = Object.fromEntries(
  Object.entries(groupExportNames).map(([route, exportName]) => [exportName, route]),
);

const formatBreadcrumbLabel = (value: string): string =>
  (groupExportNames[value] ?? value)
    .split('-')
    .filter((word) => word !== 'handler')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getUtilityTestCases = (pageId: string): DemoTestCase[] | undefined => {
  const cases: Record<string, DemoTestCase[]> = {
    'generate-timestamp': [
      { input: 'generateTimestamp()', run: () => trt.date.generateTimestamp() },
    ],
    'range-date': [
      {
        input: "getDateRange('last_7_days', new Date('2025-01-15T12:00:00.000Z'))",
        run: () => trt.date.getDateRange('last_7_days', new Date('2025-01-15T12:00:00.000Z')),
      },
      {
        input: "getDateRange({ value: 2, unit: 'week' }, new Date('2025-01-15T12:00:00.000Z'))",
        run: () =>
          trt.date.getDateRange({ value: 2, unit: 'week' }, new Date('2025-01-15T12:00:00.000Z')),
      },
    ],
    'generate-random-color': [
      {
        input: "generateRandomColor({ format: 'hex' })",
        run: () => trt.dom.generateRandomColor({ format: 'hex' }),
      },
      {
        input: "generateRandomColor({ format: 'rgb' })",
        run: () => trt.dom.generateRandomColor({ format: 'rgb' }),
      },
    ],
    'get-element-info': [
      {
        input: 'getElementInfo(document.body)',
        run: () => trt.dom.getElementInfo(document.body),
      },
    ],
    'var-css': [
      { input: "varCSS('--app-bg-page')", run: () => trt.dom.varCSS('--app-bg-page') },
      {
        input: "varCSS('--missing-variable', 'fallback')",
        run: () => trt.dom.varCSS('--missing-variable', 'fallback'),
      },
    ],
    'convert-file-size': [
      { input: "convertFileSize(1, 'Mb:byte')", run: () => trt.file.convertFileSize(1, 'Mb:byte') },
      {
        input: "convertFileSize(1048576, 'byte:Mb')",
        run: () => trt.file.convertFileSize(1048576, 'byte:Mb'),
      },
    ],
    'file-to-data-url': [
      {
        input: "fileToDataUrl(new File(['Hello'], 'hello.txt', { type: 'text/plain' }))",
        run: () => trt.file.fileToDataUrl(new File(['Hello'], 'hello.txt', { type: 'text/plain' })),
      },
    ],
    'file-to-object-url': [
      {
        input: "fileToObjectUrl(new Blob(['Hello'], { type: 'text/plain' }))",
        run: () => trt.file.fileToObjectUrl(new Blob(['Hello'], { type: 'text/plain' })),
      },
    ],
    'compress-image': [
      {
        input:
          "compressImageFile(new File(['not an image'], 'sample.txt', { type: 'text/plain' }))",
        run: () =>
          trt.file.compressImageFile(
            new File(['not an image'], 'sample.txt', { type: 'text/plain' }),
          ),
      },
    ],
    'get-image-size': [
      {
        input: "getImageSize(new File(['not an image'], 'sample.txt', { type: 'text/plain' }))",
        run: () =>
          trt.file.getImageSize(new File(['not an image'], 'sample.txt', { type: 'text/plain' })),
      },
    ],
    'load-image': [
      {
        input: 'loadImage(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>\')',
        run: () =>
          trt.file.loadImage('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'),
      },
    ],
    'random-number': [
      { input: 'generateRandomNumber(1, 10)', run: () => trt.number.generateRandomNumber(1, 10) },
      {
        input: 'generateRandomNumber(10, 20, { decimal: true, decimalPlaces: 2 })',
        run: () => trt.number.generateRandomNumber(10, 20, { decimal: true, decimalPlaces: 2 }),
      },
    ],
    'format-view-count': [
      { input: 'formatViewCount(1234)', run: () => trt.number.formatViewCount(1234) },
      { input: 'formatViewCount(1500000)', run: () => trt.number.formatViewCount(1500000) },
    ],
    'haversine-distance': [
      {
        input:
          'calcHaversineDistance({ latitude: 21.0285, longitude: 105.8542 }, { latitude: 10.8231, longitude: 106.6297 })',
        run: () =>
          trt.number.calcHaversineDistance(
            { latitude: 21.0285, longitude: 105.8542 },
            { latitude: 10.8231, longitude: 106.6297 },
          ),
      },
    ],
    'bayesian-rating': [
      {
        input:
          'calcSimpleBayesianRating({ ratingAvg: 4.5, ratingCount: 100, minimumVotesThreshold: 50 })',
        run: () =>
          trt.number.calcSimpleBayesianRating({
            ratingAvg: 4.5,
            ratingCount: 100,
            minimumVotesThreshold: 50,
          }),
      },
      {
        input:
          'calcBayesianRating({ ratingAvg: 4.5, ratingCount: 100, globalAvg: 3.5, minimumVotesThreshold: 50 })',
        run: () =>
          trt.number.calcBayesianRating({
            ratingAvg: 4.5,
            ratingCount: 100,
            globalAvg: 3.5,
            minimumVotesThreshold: 50,
          }),
      },
    ],
  };

  return cases[pageId];
};

const renderPage = (pageId: string) => {
  const page = createBrowserPage(pageId);
  if (page) {
    if (!groupPageIds.has(pageId)) {
      page.querySelector('.hero h1')?.remove();
    }
    if (!page.querySelector('.test-cases')) {
      const testCases = getUtilityTestCases(pageId);
      if (testCases) page.append(createTestCases(testCases));
    }
    const breadcrumb = page.querySelector<HTMLElement>('.hero .eyebrow');
    if (breadcrumb) {
      const pagePath = getBrowserPagePath(pageId);
      if (groupPageIds.has(pageId)) {
        breadcrumb.classList.add('breadcrumb');
        breadcrumb.innerHTML = '<button class="breadcrumb-back" type="button">← Home</button>';
        const navigateHome = () => {
          window.location.hash = '';
        };
        breadcrumb.querySelector('.breadcrumb-back')?.addEventListener('click', navigateHome);
      } else if (pagePath) {
        const pathParts = pagePath.split('/');
        const parentPath = pathParts[0];
        const currentPath = pathParts[pathParts.length - 1];
        breadcrumb.classList.add('breadcrumb');
        breadcrumb.innerHTML = `<button class="breadcrumb-back" type="button">← ${formatBreadcrumbLabel(parentPath)}</button><span>${formatBreadcrumbLabel(currentPath)}</span>`;
        breadcrumb.querySelector('.breadcrumb-back')?.addEventListener('click', () => {
          window.location.hash = `/${parentPath}`;
        });
      }
    }
    content.replaceWith(page);
    content = page;
  }
};

const renderHashPage = () => {
  const path = window.location.hash.slice(2);
  const pageId = getBrowserPageId(path);

  if (pageId) {
    renderPage(pageId);
  } else if (!path && content.className !== 'home-content') {
    const home = createHomePage();
    content.replaceWith(home);
    content = home;
  }
};

const selectPage = (pageId: string) => {
  const path = getBrowserPagePath(groupRouteNames[pageId] ?? pageId);
  if (path) {
    window.location.hash = `/${path}`;
  }
};

const sidebar = createCoreSidebar(selectPage);
const mobileHeader = document.createElement('header');
mobileHeader.className = 'mobile-header';
mobileHeader.innerHTML =
  '<button id="mobile-menu-button" type="button" aria-label="Open menu">☰</button><img class="brand-icon" src="/favicon.svg" alt="" /><strong>@trt-web/core</strong><div id="mobile-theme"></div>';
mobileHeader.querySelector('#mobile-theme')?.append(createThemeSwitcher());
const drawerOverlay = document.createElement('div');
drawerOverlay.className = 'drawer-overlay';

const closeDrawer = () => {
  sidebar.classList.remove('is-open');
  drawerOverlay.classList.remove('is-visible');
};

mobileHeader.querySelector('#mobile-menu-button')?.addEventListener('click', () => {
  sidebar.classList.add('is-open');
  drawerOverlay.classList.add('is-visible');
});
drawerOverlay.addEventListener('click', closeDrawer);

app.append(mobileHeader, sidebar, drawerOverlay, content);
window.addEventListener('hashchange', () => {
  closeDrawer();
  renderHashPage();
});
renderHashPage();
