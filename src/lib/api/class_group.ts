import { api_middleware } from "$lib/api_middleware"
import type { AddClassGroup, ClassGroup, UpdateClassGroup } from "../models/class_group";
import type { CollectionStatus } from "../models/collection";


export async function getUserClassesUsingJwt() {
	try {
		return await api_middleware.get("/api/class_group/list-class-groups");
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function getClassView(class_id: number, collection_status: CollectionStatus) {
	try {
		return await api_middleware.get(`/api/class_group/class-view?class_group_id=${class_id}&collection_status=${collection_status}`);
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function getClasses() {
	try {
		return await api_middleware.get(`/api/class_group`);
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function updateClass(request: UpdateClassGroup) {
  return await api_middleware.put(`/api/class_group/${request.id}`, request);
}

export async function addClass(request: AddClassGroup): Promise<ClassGroup> {
  return await api_middleware.post(`/api/class_group`, request);
}

export async function deleteClass(class_id: number) {
	try {
		return await api_middleware.delete(`/api/class_group/${class_id}`);
	} catch (error){
		console.error(error);
		throw error;
	}
}
