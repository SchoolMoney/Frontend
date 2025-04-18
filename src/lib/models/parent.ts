import { Privilege, Status } from './auth';
import type { Child } from './child';

export type Parent = {
  id: number;
  name: string;
  surname: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
  status: Status;
  privilege: Privilege
  children: Child[];
}

export type AddParent = {
  name: string;
  surname: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
}

export type UpdateParent = {
  name: string;
  surname: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
}
