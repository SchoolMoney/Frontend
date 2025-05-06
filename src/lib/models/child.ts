export type Child = {
  id: number;
  name: string;
  birth_date: string;
  surname: string;
  group_id: number;
  group_access_code: string | null;
}

export type AddChild = {
  name: string;
  surname: string;
  birth_date: string;
  group_id?: number;
  group_access_code?: string;
}

export type UpdateChild = {
  name: string;
  surname: string;
  birth_date: string;
  group_id: number;
  group_access_code: string | null;
}
