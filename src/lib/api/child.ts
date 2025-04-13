import { api_middleware } from '../api_middleware';
import type { AddChild, Child, UpdateChild } from '../models/child';

export async function getChildren(parent_ids: number[] = []) {
  try {
    const queryParams = new URLSearchParams();
    parent_ids.forEach(id => queryParams.append('parent_ids', id.toString()));

    return await api_middleware.get(`/api/child?${queryParams.toString()}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addChild(request: AddChild): Promise<Child> {
  try {
    return await api_middleware.post(`/api/child/`, request);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateChild(id: number, request: UpdateChild) {
  try {
    await api_middleware.put(`/api/child/${id}/`, request);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUserChildren() {
  try {
    return await api_middleware.get(`/api/child/user/`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteChild(id: number) {
  try {
    return await api_middleware.delete(`/api/child/${id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}