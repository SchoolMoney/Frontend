import { getToken } from '$lib/api/auth';
import { baseApiUrl } from '../../config';

export async function get_user_classes_using_JWT() {
	const response = await fetch(`${baseApiUrl}/api/class_group/list-class-groups`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${getToken()}`
		}
	});

	if (response.ok) {
		return await response.json();
	} else {
		const ErrorData = await response.json();
		console.error(ErrorData['detail'] || `Error: ${response.status}`);
		throw new Error(ErrorData['detail'] || `Error: ${response.status}`);
	}
}

export async function get_class_view(class_id: number){
	const response = await fetch(`${baseApiUrl}/api/class_group/class-view?class_group_id=${class_id}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${getToken()}`
		}
	});

	if (response.ok) {
		return await response.json();
	}
	else{
		const ErrorData = await response.json();
		console.error(ErrorData['detail'] || ErrorData['detail']['msg'] || `Error: ${response.status}`);
		throw new Error(ErrorData['detail'] || ErrorData['detail']['msg'] || `Error: ${response.status}`);
	}
}
