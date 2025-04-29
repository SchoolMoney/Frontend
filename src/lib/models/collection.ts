import type { DateValue } from '@internationalized/date';

export type Collection = {
  id: number;
  logo_path?: string;
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  status: CollectionStatus;
  price: number;
  class_group_id: number;
  bank_account_id: number;
  withdrawn_money: number;
  owner_id: number;
}

export enum CollectionStatus {
  OPEN = 0,
  FINISHED = 1,
  NOT_PAID_BEFORE_DEADLINE = 2,
  CANCELLED = 3,
}

export const statusLabels: Map<CollectionStatus, string> = new Map([
  [CollectionStatus.OPEN, 'Open'],
  [CollectionStatus.FINISHED, 'Finished'],
  [CollectionStatus.NOT_PAID_BEFORE_DEADLINE, 'Not paid before deadline'],
  [CollectionStatus.CANCELLED, 'Cancelled'],
]);

export const statusColors: Map<CollectionStatus, string> = new Map([
  [CollectionStatus.OPEN, ''],
  [CollectionStatus.FINISHED, 'green'],
  [CollectionStatus.NOT_PAID_BEFORE_DEADLINE, 'yellow'],
  [CollectionStatus.CANCELLED, 'red'],
]);

export const statusTextColors: Map<CollectionStatus, string> = new Map([
  [CollectionStatus.OPEN, ''],
  [CollectionStatus.FINISHED, `text-green-600`],
  [CollectionStatus.NOT_PAID_BEFORE_DEADLINE, `text-yellow-600`],
  [CollectionStatus.CANCELLED, `text-red-600`],
]);

export const statusBorderColors: Map<CollectionStatus, string> = new Map([
  [CollectionStatus.OPEN, ''],
  [CollectionStatus.FINISHED, `border-green-600`],
  [CollectionStatus.NOT_PAID_BEFORE_DEADLINE, `border-yellow-600`],
  [CollectionStatus.CANCELLED, `border-red-600`],
]);

const baseVariant = 'rounded-md shadow-md p-4 transition-colors';
export const cardVariants: Map<CollectionStatus, string> = new Map([
  [CollectionStatus.OPEN, `${baseVariant}`],
  [CollectionStatus.FINISHED, `${baseVariant} ${statusBorderColors.get(CollectionStatus.FINISHED)}`],
  [CollectionStatus.NOT_PAID_BEFORE_DEADLINE, `${baseVariant} ${statusBorderColors.get(CollectionStatus.NOT_PAID_BEFORE_DEADLINE)}`],
  [CollectionStatus.CANCELLED, `${baseVariant} ${statusBorderColors.get(CollectionStatus.CANCELLED)}`],
]);

export type GetCollectionsParams = {
  name?: string;
  start_date_from?: DateValue;
  start_date_to?: DateValue;
  end_date_from?: DateValue;
  end_date_to?: DateValue;
  status?: CollectionStatus;
}

export type FormattedGetCollectionsParams = {
  name?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  status?: CollectionStatus;
}
