export type Token = {
  access_token: string;
  token_type: string;
  expires: number;
  refresh_token: string;
}

export enum Privilege {
  STANDARD_USER = 1,
  ADMIN_USER = 10,
}

export const privilegeLabels: Map<Privilege, string> = new Map([
	[Privilege.STANDARD_USER, 'Standard user'],
	[Privilege.ADMIN_USER, 'Admin']
]);

export enum Status {
  DISABLED = 0,
  LOCKED = 1,
  ENABLED = 10,
}

export const statusLabels: Map<Status, string> = new Map([
  [Status.DISABLED, 'Disabled'],
  [Status.LOCKED, 'Locked'],
  [Status.ENABLED, 'Enabled'],
]);

export type Session = {
  user_id: number;
  username: string;
  email?: string;
  privilege: Privilege;
  status: Status;
};

export type UserDetails = {
  id: number;
  username: string;
  email?: string;
  privilege: Privilege;
  status: Status;
};

export type Identity = {
  username: string;
  name: string;
  surname: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
}

export type UpdateIdentity = {
  username: string;
}

export type UpdateParentProfile = {
  name: string;
  surname: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
}
