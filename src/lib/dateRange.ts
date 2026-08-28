import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';

export function currentCalendarDate(): CalendarDate {
  return today(getLocalTimeZone());
}

/** `'yyyy-MM'` key for a `CalendarDate` -- matches `monthKeyFromIsoDate`'s format exactly. */
export function monthKeyFromCalendarDate(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}`;
}

/** `'yyyy-MM'` key sliced straight out of a transaction's `'yyyy-MM-dd'` date field. */
export function monthKeyFromIsoDate(iso: string): string {
  return iso.slice(0, 7);
}

export function formatMonthLabel(date: CalendarDate): string {
  return new Date(date.year, date.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
