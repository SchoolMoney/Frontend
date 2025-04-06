import { api_middleware } from "$lib/api_middleware"


export async function get_user_classes_using_JWT() {
	try {
		return await api_middleware.get("/api/class_group/list-class-groups");
	} catch (error){
		console.error(error);
		throw error;
	}
}

export async function get_class_view(class_id: number){
	try {
		return await api_middleware.get(`/api/class_group/class-view?class_group_id=${class_id}`);
	} catch (error){
		console.error(error);
		throw error;
	}
}
