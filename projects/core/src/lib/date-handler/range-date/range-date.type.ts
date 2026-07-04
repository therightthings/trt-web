export type RangeDate =
  'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_week' | 'this_month' | 'this_year';

export type DynamicRangeDate = {
  value: number;
  unit: 'day' | 'week' | 'month' | 'year';
};
