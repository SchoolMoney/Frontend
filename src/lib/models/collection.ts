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

const baseVariant = 'rounded-md shadow-md p-4 transition-colors';
export const cardVariants: Map<Status, string> = new Map([
  [Status.OPEN, `${baseVariant} bg-green-100 text-green-800 border-green-300`],
  [Status.FINISHED, `${baseVariant} bg-blue-100 text-blue-800 border-blue-300`],
  [Status.NOT_PAID_BEFORE_DEADLINE, `${baseVariant} bg-yellow-100 text-yellow-800 border-yellow-300`],
  [Status.CANCELLED, `${baseVariant} bg-red-100 text-red-800 border-red-300`],
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
