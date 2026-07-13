// Run: npx vitest run projects/core/src/lib/date-handler/range-date/range-date.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDateRange } from './range-date';
import type { DynamicRangeDate, RangeDate } from './range-date.type';

const ROOT_DATE = new Date('2026-07-03T17:00:00.000Z');

describe('getDateRange', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses rootDate for preset ranges', () => {
    expect(getDateRange('today', ROOT_DATE)).toEqual({
      startDate: '2026-07-03',
      endDate: '2026-07-03',
    });
    expect(getDateRange('yesterday', ROOT_DATE)).toEqual({
      startDate: '2026-07-02',
      endDate: '2026-07-03',
    });
    expect(getDateRange('last_7_days', ROOT_DATE)).toEqual({
      startDate: '2026-06-27',
      endDate: '2026-07-03',
    });
    expect(getDateRange('last_30_days', ROOT_DATE)).toEqual({
      startDate: '2026-06-04',
      endDate: '2026-07-03',
    });
    expect(getDateRange('this_week', ROOT_DATE)).toEqual({
      startDate: '2026-06-29',
      endDate: '2026-07-03',
    });
    expect(getDateRange('this_month', ROOT_DATE)).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-07-03',
    });
    expect(getDateRange('this_year', ROOT_DATE)).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-07-03',
    });
  });

  it('uses rootDate for dynamic day and week ranges', () => {
    const last3Days: DynamicRangeDate = { value: 3, unit: 'day' };
    const last2Weeks: DynamicRangeDate = { value: 2, unit: 'week' };

    expect(getDateRange(last3Days, ROOT_DATE)).toEqual({
      startDate: '2026-06-30',
      endDate: '2026-07-03',
    });
    expect(getDateRange(last2Weeks, ROOT_DATE)).toEqual({
      startDate: '2026-06-19',
      endDate: '2026-07-03',
    });
  });

  it('uses rootDate for dynamic month and year ranges', () => {
    const now = ROOT_DATE;

    expect(getDateRange({ value: 1, unit: 'month' }, now)).toEqual({
      startDate: '2026-06-03',
      endDate: '2026-07-03',
    });
    expect(getDateRange({ value: 1, unit: 'year' }, now)).toEqual({
      startDate: '2025-07-03',
      endDate: '2026-07-03',
    });
  });

  it('defaults to the current time when rootDate is omitted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(ROOT_DATE);

    expect(getDateRange('today')).toEqual({
      startDate: '2026-07-03',
      endDate: '2026-07-03',
    });
  });

  it('accepts the new calendar-based presets in RangeDate', () => {
    const thisWeek: RangeDate = 'this_week';
    const thisMonth: RangeDate = 'this_month';
    const thisYear: RangeDate = 'this_year';

    expect(thisWeek).toBe('this_week');
    expect(thisMonth).toBe('this_month');
    expect(thisYear).toBe('this_year');
  });
});
