import { trt } from '@trt-web/core';

import { createDemoPage } from '../components/demo-page';

const dateInputValue = (page: HTMLElement): Date | undefined => {
  const value = page.querySelector<HTMLInputElement>('#date-root')?.value;
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const createGenerateTimestampPage = (): HTMLElement => {
  return createDemoPage({
    title: 'generateTimestamp',
    path: 'date-handler/generate-timestamp',
    description: 'Generate the current date and time as an ISO 8601 timestamp.',
    methods: ['generateTimestamp()'],
    actions: [
      {
        label: 'Generate timestamp',
        run: () => trt.date.generateTimestamp(),
      },
    ],
  });
};

export const createRangeDatePage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">date-handler/range-date</p>
      <h1>getDateRange</h1>
      <p>Resolve preset or dynamic UTC date ranges for filters and reports.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Configuration</h2>
        <label>Preset
          <select id="date-range-preset">
            <option value="today">today</option>
            <option value="yesterday">yesterday</option>
            <option value="last_7_days">last_7_days</option>
            <option value="last_30_days">last_30_days</option>
            <option value="this_week">this_week</option>
            <option value="this_month">this_month</option>
            <option value="this_year">this_year</option>
            <option value="dynamic">dynamic</option>
          </select>
        </label>
        <div class="demo-actions">
          <label>Value <input id="date-range-value" type="number" min="1" value="3" /></label>
          <label>Unit
            <select id="date-range-unit">
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
              <option value="year">year</option>
            </select>
          </label>
        </div>
        <label>Root date <input id="date-root" type="date" /></label>
      </article>
      <article class="card">
        <h2>Public method</h2>
        <p><code>getDateRange(range, rootDate?)</code></p>
        <button id="date-range-run" type="button">Get date range</button>
        <pre id="date-range-result" class="demo-result">No action run yet.</pre>
      </article>
    </section>
  `;

  const rootInput = page.querySelector<HTMLInputElement>('#date-root');
  if (rootInput) {
    rootInput.value = new Date().toISOString().slice(0, 10);
  }

  page.querySelector('#date-range-run')?.addEventListener('click', () => {
    const preset = page.querySelector<HTMLSelectElement>('#date-range-preset')!.value;
    const value = Number(page.querySelector<HTMLInputElement>('#date-range-value')!.value);
    const unit = page.querySelector<HTMLSelectElement>('#date-range-unit')!.value as
      | 'day'
      | 'week'
      | 'month'
      | 'year';
    const range =
      preset === 'dynamic'
        ? { value, unit }
        : (preset as Parameters<typeof trt.date.getDateRange>[0]);
    const result = trt.date.getDateRange(range, dateInputValue(page));
    page.querySelector('#date-range-result')!.textContent = JSON.stringify(result, null, 2);
  });

  return page;
};
