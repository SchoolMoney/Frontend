import { type Token, type Session } from '$lib/models/auth';
import { jwtDecode } from 'jwt-decode';
import { baseApiUrl } from '../../config';

const TOKEN_KEY = 'access-token';

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function decodeToken(): Session {
  const token = getToken();
  return jwtDecode(token!) as Session;
}

export function getSessionData(): Session {
  return decodeToken();
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function setToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
}

export async function login(username: string, password: string) {
	const resp = await fetch(`${baseApiUrl}/api/auth/login`, {
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
	const { access_token }: Token = await resp.json() as Token;
	setToken(access_token);
}

export async function getUserDetails() {
	const token = getToken();
	if (!token) {
		throw new Error('User is not authenticated');
	}
	const resp = await fetch(`${baseApiUrl}/api/user/me`, {
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
	const resp = await fetch(`${baseApiUrl}/api/auth/logout`, {
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
	const resp = await fetch(`${baseApiUrl}/api/user/register`, {
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
