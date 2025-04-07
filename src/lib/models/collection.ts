import type { DateValue } from '@internationalized/date';

export type Collection = {
  id: number;
  logo_path?: string;
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  status: Status;
  price: number;
}

export enum Status {
  OPEN = 0,
  FINISHED = 1,
  NOT_PAID_BEFORE_DEADLINE = 2,
  CANCELLED = 3,
}

export const statusLabels: Map<Status, string> = new Map([
  [Status.OPEN, 'Open'],
  [Status.FINISHED, 'Finished'],
  [Status.NOT_PAID_BEFORE_DEADLINE, 'Not paid before deadline'],
  [Status.CANCELLED, 'Cancelled'],
]);

export const statusColors: Map<Status, string> = new Map([
  [Status.OPEN, ''],
  [Status.FINISHED, 'green'],
  [Status.NOT_PAID_BEFORE_DEADLINE, 'yellow'],
  [Status.CANCELLED, 'red'],
]);

export const statusTextColors: Map<Status, string> = new Map([
  [Status.OPEN, ''],
  [Status.FINISHED, `text-green-600`],
  [Status.NOT_PAID_BEFORE_DEADLINE, `text-yellow-600`],
  [Status.CANCELLED, `text-red-600`],
]);

export const statusBorderColors: Map<Status, string> = new Map([
  [Status.OPEN, ''],
  [Status.FINISHED, `border-green-600`],
  [Status.NOT_PAID_BEFORE_DEADLINE, `border-yellow-600`],
  [Status.CANCELLED, `border-red-600`],
]);

const baseVariant = 'rounded-md shadow-md p-4 transition-colors';
export const cardVariants: Map<Status, string> = new Map([
  [Status.OPEN, `${baseVariant}`],
  [Status.FINISHED, `${baseVariant} ${statusBorderColors.get(Status.FINISHED)}`],
  [Status.NOT_PAID_BEFORE_DEADLINE, `${baseVariant} ${statusBorderColors.get(Status.NOT_PAID_BEFORE_DEADLINE)}`],
  [Status.CANCELLED, `${baseVariant} ${statusBorderColors.get(Status.CANCELLED)}`],
]);

export type GetCollectionsParams = {
  name?: string;
  start_date_from?: DateValue;
  start_date_to?: DateValue;
  end_date_from?: DateValue;
  end_date_to?: DateValue;
  status?: Status;
}

export type FormattedGetCollectionsParams = {
  name?: string;
  start_date_from?: Date;
  start_date_to?: Date;
  end_date_from?: Date;
  end_date_to?: Date;
  status?: Status;
}
