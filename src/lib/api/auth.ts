import { type Token, type Session, type UserDetails, type UpdateIdentity } from '$lib/models/auth';
import { jwtDecode } from 'jwt-decode';
import { baseApiUrl } from '../../config';
import { goto } from '$app/navigation';
import { api_middleware } from '../api_middleware';

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

export function decodeTokenAsToken(): Token {
	const token = getToken();
	return jwtDecode(token!) as Token;
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

export async function getUserDetails(): Promise<UserDetails | null> {
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
		return await resp.json() as UserDetails;
	}

  return null;
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

export async function refresh(){
	const accessToken = decodeTokenAsToken();
	const resp = await fetch(`${baseApiUrl}/api/auth/refresh?refresh_token=${accessToken.refresh_token}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	if (resp.status === 401){
		removeToken();
		await goto("/login");
		return null;
	}
	if (resp.ok) {
		const { access_token }: Token = await resp.json() as Token;
		setToken(access_token);
	}

	return accessToken.access_token;
}

export async function updatePassword(old_password: string, new_password: string) {
  await api_middleware.put('/api/auth/password', {
    old_password,
    new_password,
  })
}

export async function updateIdentity(request: UpdateIdentity) {
  await api_middleware.put('/api/auth/identity', request)
}
