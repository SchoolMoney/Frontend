import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date";

export const appName: string = 'SchoolMoney';
export const baseApiUrl: string = 'http://localhost:8000';

export const longDateFormatter: DateFormatter = new DateFormatter('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: "2-digit",
  second: "2-digit",
  hour12: false, // Use 24-hour format
});
export const shortDateFormatter: DateFormatter = new DateFormatter('en-US', { 
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour12: false, // Use 24-hour format
});

export function parseToDate(dateValue?: DateValue): Date | undefined {
  return dateValue?.toDate(getLocalTimeZone());
}

export function parseToShortDate(dateValue: DateValue): string {
  return shortDateFormatter.format(parseToDate(dateValue)!);
}

export function parseToLongDate(dateValue: DateValue): string {
  return longDateFormatter.format(parseToDate(dateValue)!);
}
