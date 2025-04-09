import type { Child } from './child';
import type { Collection } from './collection';
import type { Parent } from './parent';

export type ClassGroup = {
	id: number;
	name: string;
	description: string;
}

export enum GroupRole {
  MEMBER = 1,
  CASHIER = 2,
}

export type Requester = {
  parent_id: number;
  name: string;
  surname: string;
  group_role: GroupRole;
}

export type ClassView = {
  class: ClassGroup;
  children: Child[];
  parents: Parent[];
  collections: Collection[];
  requester: Requester;
}
