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

export const groupRoleLabels: Map<GroupRole, string> = new Map([
  [GroupRole.MEMBER, 'Member'],
  [GroupRole.CASHIER, 'Cashier'],
]);

export type Requester = {
  parent_id: number;
  name: string;
  surname: string;
  group_role: GroupRole;
}

export type ClassView = {
  class: ClassGroup;
  children: Child[];
  parents: (Parent & { role: GroupRole })[];
  collections: Collection[];
  requester: Requester;
}

export type UpdateClassGroup = ClassGroup;
export type AddClassGroup = {
  name: string;
  description: string;
}
