import { api_middleware } from '$lib/api_middleware';
import type { AddParent, Parent, UpdateParent } from '../models/parent';

export async function getParents() {
	try {
		return await api_middleware.get(`/api/parent`);
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function updateParent(request: UpdateParent) {
  return await api_middleware.put(`/api/parent`, request);
}

export async function addParent(request: AddParent): Promise<Parent> {
  return await api_middleware.post(`/api/parent`, request);
}
