import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date';

export const appName: string = 'SchoolMoney';
export const baseApiUrl: string = 'http://localhost:8000';

export const longDateFormatter: DateFormatter = new DateFormatter('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
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

export function formatToCustomShortDate(dateValue?: DateValue): string | undefined {
  if (!dateValue) return undefined;
  const dateObject = dateValue.toDate(getLocalTimeZone());
  if (!dateObject) return undefined;

  // Format to 'yyyy-MM-dd HH:mm:ss'
  const year = dateObject.getFullYear().toString().padStart(4, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatToCustomLongDate(dateValue?: DateValue): string | undefined {
  if (!dateValue) return undefined;
  const dateObject = dateValue.toDate(getLocalTimeZone());
  if (!dateObject) return undefined;

  // Format to 'yyyy-MM-dd HH:mm:ss'
  const year = dateObject.getFullYear().toString().padStart(4, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');
  const hours = dateObject.getHours().toString().padStart(2, '0');
  const minutes = dateObject.getMinutes().toString().padStart(2, '0');
  const seconds = dateObject.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseToShortDate(dateValue: DateValue): string {
  return formatToCustomShortDate(dateValue)!;
}

export function parseToLongDate(dateValue: DateValue): string {
  return formatToCustomLongDate(dateValue)!;
}
