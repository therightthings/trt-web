import { BrowserPerformance } from '@trt-web/browser';
import { trt } from '@trt-web/core';

import { createToggleFullscreen } from '../../components/toggle-fullscreen';

export const createPerformancePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">browser/performance</p>
      <h1>BrowserPerformance</h1>
      <p>Measure tasks and inspect browser performance timing data.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Support and current time</h2>
        <div class="demo-actions">
          <button id="performance-support" type="button">Check support</button>
          <button id="performance-now" type="button">Read now</button>
        </div>
        <pre id="performance-support-result" class="demo-result">Not checked yet.</pre>
      </article>
      <article class="card">
        <h2>Mark and measure</h2>
        <button id="performance-measure" type="button">Measure task</button>
        <pre id="performance-measure-result" class="demo-result">No measure created yet.</pre>
      </article>
      <article class="card">
        <h2>Async task</h2>
        <button id="performance-async" type="button">Measure async task</button>
        <pre id="performance-async-result" class="demo-result">No async task measured yet.</pre>
      </article>
      <article id="performance-entries-card" class="card">
        <h2>Entries</h2>
        <div id="performance-entries-fullscreen-toggle"></div>
        <div class="demo-actions">
          <button id="performance-all-entries" type="button">All entries</button>
          <button id="performance-measure-entries" type="button">Demo measures</button>
          <button id="performance-resource-entries" type="button">Resource entries</button>
        </div>
        <pre id="performance-entries-result" class="demo-result">No entries read yet.</pre>
      </article>
      <article id="performance-timing-card" class="card">
        <h2>Navigation and resources</h2>
        <div id="performance-timing-fullscreen-toggle"></div>
        <div class="demo-actions">
          <button id="performance-navigation" type="button">Navigation timing</button>
          <button id="performance-resources" type="button">Resource timing</button>
          <button id="performance-analyze" type="button">Analyze page</button>
        </div>
        <pre id="performance-timing-result" class="demo-result">No timing read yet.</pre>
      </article>
      <article class="card">
        <h2>Performance properties</h2>
        <button id="performance-properties" type="button">Read properties</button>
        <pre id="performance-properties-result" class="demo-result">No properties read yet.</pre>
      </article>
      <article class="card">
        <h2>Memory estimate</h2>
        <button id="performance-memory" type="button">Measure memory</button>
        <pre id="performance-memory-result" class="demo-result">No memory measurement yet.</pre>
      </article>
      <article class="card">
        <h2>Cleanup</h2>
        <div class="demo-actions">
          <button id="performance-clear-marks" type="button">Clear marks</button>
          <button id="performance-clear-measures" type="button">Clear measures</button>
          <button id="performance-clear-resources" type="button">Clear resources</button>
        </div>
        <pre id="performance-cleanup-result" class="demo-result">No cleanup run yet.</pre>
      </article>
    </section>
  `;

  const session = BrowserPerformance.createSession();
  page
    .querySelector('#performance-entries-fullscreen-toggle')
    ?.append(createToggleFullscreen(page.querySelector<HTMLElement>('#performance-entries-card')!));
  page
    .querySelector('#performance-timing-fullscreen-toggle')
    ?.append(createToggleFullscreen(page.querySelector<HTMLElement>('#performance-timing-card')!));
  const getResult = (id: string): HTMLElement => page.querySelector<HTMLElement>(id)!;
  const show = (id: string, value: unknown): void => {
    getResult(id).textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };

  const toMegabytes = (bytes: number): number => {
    return trt.file.convertFileSize(bytes, 'byte:Mb', { decimalPlaces: 2 });
  };

  page.querySelector('#performance-support')?.addEventListener('click', () => {
    show('#performance-support-result', BrowserPerformance.isSupported());
  });

  page.querySelector('#performance-now')?.addEventListener('click', () => {
    show('#performance-support-result', { now: session?.now() });
  });

  page.querySelector('#performance-measure')?.addEventListener('click', () => {
    if (!session) {
      show('#performance-measure-result', 'Performance API is unavailable.');
      return;
    }

    session.mark('demo-task-start');
    for (let index = 0; index < 500_000; index += 1) {
      Math.sqrt(index);
    }
    session.mark('demo-task-end');
    const measure = session.measure('demo-task', 'demo-task-start', 'demo-task-end');
    show('#performance-measure-result', measure ?? 'Could not create measure.');
  });

  page.querySelector('#performance-async')?.addEventListener('click', async () => {
    const result = await BrowserPerformance.measureAsync('demo-async-task', async () => {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
      return { completed: true };
    });
    show('#performance-async-result', result ?? 'Could not measure async task.');
  });

  page.querySelector('#performance-all-entries')?.addEventListener('click', () => {
    show('#performance-entries-result', session?.getEntries() ?? []);
  });

  page.querySelector('#performance-measure-entries')?.addEventListener('click', () => {
    show('#performance-entries-result', session?.getEntries({ name: 'demo-task' }) ?? []);
  });

  page.querySelector('#performance-resource-entries')?.addEventListener('click', () => {
    show('#performance-entries-result', session?.getEntries({ type: 'resource' }) ?? []);
  });

  page.querySelector('#performance-navigation')?.addEventListener('click', () => {
    show('#performance-timing-result', session?.getNavigationTiming() ?? 'No navigation timing.');
  });

  page.querySelector('#performance-resources')?.addEventListener('click', () => {
    show('#performance-timing-result', session?.getResourceTiming() ?? []);
  });

  page.querySelector('#performance-analyze')?.addEventListener('click', () => {
    show('#performance-timing-result', session?.analyzePage() ?? 'Performance API unavailable.');
  });

  page.querySelector('#performance-properties')?.addEventListener('click', () => {
    const memory = session?.memory;
    show('#performance-properties-result', {
      eventCounts: session?.eventCounts,
      interactionCount: session?.interactionCount,
      memory: memory
        ? {
            jsHeapSizeLimitMb: toMegabytes(memory.jsHeapSizeLimit),
            totalJSHeapSizeMb: toMegabytes(memory.totalJSHeapSize),
            usedJSHeapSizeMb: toMegabytes(memory.usedJSHeapSize),
          }
        : undefined,
      timeOrigin: session?.timeOrigin,
    });
  });

  page.querySelector('#performance-memory')?.addEventListener('click', async () => {
    try {
      const measurement = await session?.measureUserAgentSpecificMemory();
      if (!measurement) {
        show('#performance-memory-result', 'Memory measurement is not supported in this browser.');
        return;
      }

      show('#performance-memory-result', {
        bytes: measurement.bytes,
        megabytes: toMegabytes(measurement.bytes),
        breakdown: measurement.breakdown,
      });
    } catch (error) {
      show('#performance-memory-result', error instanceof Error ? error.message : String(error));
    }
  });

  page.querySelector('#performance-clear-marks')?.addEventListener('click', () => {
    session?.clearMarks();
    show('#performance-cleanup-result', 'Performance marks cleared.');
  });

  page.querySelector('#performance-clear-measures')?.addEventListener('click', () => {
    session?.clearMeasures();
    show('#performance-cleanup-result', 'Performance measures cleared.');
  });

  page.querySelector('#performance-clear-resources')?.addEventListener('click', () => {
    session?.clearResourceTimings();
    show('#performance-cleanup-result', 'Resource timing entries cleared.');
  });

  return page;
};
