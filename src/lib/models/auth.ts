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

export enum Status {
  DISABLED = 0,
  LOCKED = 1,
  ENABLED = 10,
}

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

export type UpdateIdentity = {
  username: string;
  email?: string;
}
