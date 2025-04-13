import { api_middleware } from "../api_middleware";
import type { Status, UserDetails } from "../models/auth";

/// Only for ADMIN!
export async function getUserAccountByParentId(parent_id: number): Promise<UserDetails> {
  try {
    return await api_middleware.get(`/api/user/parent/${parent_id}`);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function updateUserAccountStatus(parent_id: number, status: Status) {
  try {
    return await api_middleware.put(`/api/user/parent/${parent_id}`, { status });
  } catch (e) {
    console.error(e);
    throw e;
  }
}