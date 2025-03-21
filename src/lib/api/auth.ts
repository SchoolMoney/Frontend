import { Token } from '$lib/models/auth';

const TOKEN_KEY = 'access-token';
const API_URL = 'http://localhost:8000';

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}
function setToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
}

export async function login(username: string, password: string) {
	const resp = await fetch(`${API_URL}/api/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});
	if (!resp.ok) {
		const { detail } = await resp.json();
		throw new Error(detail);
	}
	const { access_token, token_type, expires, refresh_token } = await resp.json();
	let token = new Token(access_token, token_type, expires, refresh_token);
	setToken(token.access_token);
}

export async function getUserDetails() {
	const token = getToken();
	if (!token) {
		throw new Error('User is not authenticated');
	}
	const resp = await fetch(`${API_URL}/api/user/me`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
	if (resp.ok) {
		return await resp.json();
	}
}

export async function logout() {
	const token = getToken();
	if (!token) {
		throw new Error('User is not authenticated');
	}
	const resp = await fetch(`${API_URL}/api/auth/logout`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
	if (resp.ok) {
		removeToken();
	} else {
		const { detail } = await resp.json();
		throw new Error(detail);
	}
}

export async function register(username: string, password: string) {
	const resp = await fetch(`${API_URL}/api/user/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});
	if (resp.ok) {
		return await resp.json();
	} else {
		const { detail } = await resp.json();
		throw new Error(detail);
	}
}
