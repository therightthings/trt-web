import { DynamicRangeDate, RangeDate } from './range-date.type';

function startOfUtcDay(date: Date): Date {
  const utcDate = new Date(date);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}

function shiftDate(baseDate: Date, { value, unit }: DynamicRangeDate) {
  const date = startOfUtcDay(baseDate);

  switch (unit) {
    case 'day':
      date.setUTCDate(date.getUTCDate() - value);
      break;
    case 'week':
      date.setUTCDate(date.getUTCDate() - value * 7);
      break;
    case 'month':
      date.setUTCMonth(date.getUTCMonth() - value);
      break;
    case 'year':
      date.setUTCFullYear(date.getUTCFullYear() - value);
      break;
  }

  return date;
}

function getStartOfWeek(baseDate: Date) {
  const date = startOfUtcDay(baseDate);
  const day = date.getUTCDay();
  const offset = (day + 6) % 7;

  date.setUTCDate(date.getUTCDate() - offset);

  return date;
}

export function getDateRange(range: RangeDate | DynamicRangeDate, rootDate?: Date) {
  const now = rootDate ?? new Date();
  const today = startOfUtcDay(now);

  let start = new Date(today);
  const end = new Date(now);

  if (typeof range === 'string') {
    switch (range) {
      case 'today':
        start = startOfUtcDay(now);
        break;

      case 'yesterday':
        start = startOfUtcDay(now);
        start.setUTCDate(start.getUTCDate() - 1);
        break;

      case 'last_30_days':
        start = startOfUtcDay(now);
        start.setUTCDate(start.getUTCDate() - 29);
        break;

      case 'this_week':
        start = getStartOfWeek(today);
        break;

      case 'this_month':
        start = startOfUtcDay(now);
        start.setUTCDate(1);
        break;

      case 'this_year':
        start = startOfUtcDay(now);
        start.setUTCMonth(0, 1);
        break;

      case 'last_7_days':
      default:
        start = startOfUtcDay(now);
        start.setUTCDate(start.getUTCDate() - 6);
        break;
    }
  } else {
    start = shiftDate(today, range);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
