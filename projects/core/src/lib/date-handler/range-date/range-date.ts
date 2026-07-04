import { DynamicRangeDate, RangeDate } from './range-date.type';

function shiftDate(baseDate: Date, { value, unit }: DynamicRangeDate) {
  const date = new Date(baseDate);

  switch (unit) {
    case 'day':
      date.setDate(date.getDate() - value);
      break;
    case 'week':
      date.setDate(date.getDate() - value * 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - value);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - value);
      break;
  }

  return date;
}

function getStartOfWeek(baseDate: Date) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const offset = (day + 6) % 7;

  date.setDate(date.getDate() - offset);

  return date;
}

export function getDateRange(range: RangeDate | DynamicRangeDate, rootDate?: Date) {
  const now = rootDate ?? new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let start = new Date(today);
  let end = new Date(now);

  if (typeof range === 'string') {
    switch (range) {
      case 'today':
        start = new Date(today);
        end = new Date(now);
        break;

      case 'yesterday':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(today);
        end.setMilliseconds(-1);
        break;

      case 'last_30_days':
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        end = new Date(now);
        break;

      case 'this_week':
        start = getStartOfWeek(today);
        end = new Date(now);
        break;

      case 'this_month':
        start = new Date(today);
        start.setDate(1);
        end = new Date(now);
        break;

      case 'this_year':
        start = new Date(today);
        start.setMonth(0, 1);
        end = new Date(now);
        break;

      case 'last_7_days':
      default:
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        end = new Date(now);
        break;
    }
  } else {
    start = shiftDate(today, range);
    end = new Date(now);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
