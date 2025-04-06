import { getToken, decodeTokenAsToken, refresh } from '$lib/api/auth';
import { baseApiUrl } from '../config';

export function useApi(baseUrl = baseApiUrl) {

	async function fetchWithAuth(
		endpoint: string,
		options = {},
		useAuth = true
	) {
		const url = `${baseUrl}${endpoint}`;

			const fetchOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + getToken()
				},
				...options
			};

			// Dodaj token, jeśli zapytanie wymaga autoryzacji
			if (useAuth) {
				const decodedToken = decodeTokenAsToken();
				if (decodedToken && decodedToken.expires > new Date().getTime()) {
					const refresh_result = await refresh();
					if (!refresh_result) {
						throw new Error('Unable to get valid token');
					}
				}

				fetchOptions.headers['Authorization'] = `Bearer ${getToken()}`;
			}

			const response = await fetch(url, fetchOptions);

			if (response.status === 401 && useAuth) {

				const refresh_result = await refresh();
				if (!refresh_result) {
					throw new Error('Unable to get valid token');
				}

				fetchOptions.headers['Authorization'] = `Bearer ${getToken()}`;
				return fetch(url, fetchOptions);
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData['detail'] || errorData['detail']['msg'] || `Error: ${response.status}`);
			}

			return await response.json();

	}

	// Funkcje pomocnicze do typowych operacji HTTP
	function get(endpoint: string, options = {}, useAuth = true) {
		return fetchWithAuth(endpoint, { ...options, method: 'GET' }, useAuth);
	}

	function post(endpoint: string, body: unknown, options = {}, useAuth = true) {
		return fetchWithAuth(
			endpoint,
			{
				...options,
				method: 'POST',
				body: typeof body === 'string' ? body : JSON.stringify(body)
			},
			useAuth,
		);
	}

	function put(endpoint: string, body: unknown, options = {}, useAuth = true) {
		return fetchWithAuth(
			endpoint,
			{
				...options,
				method: 'PUT',
				body: typeof body === 'string' ? body : JSON.stringify(body)
			},
			useAuth
		);
	}

	function del(endpoint: string, options = {}, useAuth = true) {
		return fetchWithAuth(endpoint, { ...options, method: 'DELETE' }, useAuth);
	}

	return {
		fetch: fetchWithAuth,
		get,
		post,
		put,
		delete: del,
	};
}

export const api_middleware = useApi();
