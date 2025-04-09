import { api_middleware } from "$lib/api_middleware"
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

