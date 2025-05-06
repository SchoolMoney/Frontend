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
					const refreshResult = await refresh();
					if (!refreshResult) {
						throw new Error('Unable to get valid token');
					}
				}

				fetchOptions.headers['Authorization'] = `Bearer ${getToken()}`;
			}

			let response = await fetch(url, fetchOptions);

			if (response.status === 401 && useAuth) {

				const refreshResult = await refresh();
				if (!refreshResult) {
					throw new Error('Unable to get valid token');
				}

				fetchOptions.headers['Authorization'] = `Bearer ${getToken()}`;
				response = await fetch(url, fetchOptions);
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData['detail'] ?? errorData['detail']['msg'] ?? `Error: ${response.status}`);
			}

      if (response.status === 204) {
        return null;
      }

			const contentType = response.headers.get("Content-Type");

			if (contentType && contentType.includes("application/json")) {
				return response.json()
			} else{
				return response
			}
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
				body: JSON.stringify(body)
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
				body: JSON.stringify(body)
			},
			useAuth
		);
	}

	function del(endpoint: string, options = {}, useAuth = true) {
		return fetchWithAuth(endpoint, { ...options, method: 'DELETE' }, useAuth);
	}

	function createWebSocket(endpoint: string, options: {
		onMessage?: (data: any) => void,
		onOpen?: () => void,
		onClose?: (event: CloseEvent) => void,
		onError?: (event: Event) => void,
		includeToken?: boolean,
		autoReconnect?: boolean,
		reconnectInterval?: number
	} = {}) {
		const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
		let url = endpoint.startsWith('ws') ? endpoint : `${wsBaseUrl}${endpoint}`;

		// Add token as query param if requested
		if (options.includeToken) {
			const token = getToken();
			const separator = url.includes('?') ? '&' : '?';
			url = `${url}${separator}token=${token}`;
		}

		let socket: WebSocket;
		let isReconnecting = false;
		let reconnectAttempts = 0;
		const maxReconnectAttempts = 5;
		const reconnectInterval = options.reconnectInterval || 3000;

		function connect() {
			socket = new WebSocket(url);

			socket.onopen = (event) => {
				console.log(`WebSocket connected to ${url}`);
				reconnectAttempts = 0;
				if (options.onOpen) options.onOpen();
			};

			socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (options.onMessage) options.onMessage(data);
				} catch (error) {
					console.error('Error parsing WebSocket message:', error);
					if (options.onMessage) options.onMessage(event.data);
				}
			};

			socket.onclose = (event) => {
				console.log(`WebSocket closed: ${url}, code: ${event.code}, reason: ${event.reason}`);

				if (options.onClose) options.onClose(event);

				// Attempt to reconnect if not a normal closure and auto-reconnect is enabled
				if (options.autoReconnect && !isReconnecting && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
					isReconnecting = true;
					reconnectAttempts++;
					console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
					setTimeout(() => {
						connect();
						isReconnecting = false;
					}, reconnectInterval);
				}
			};

			socket.onerror = (event) => {
				console.error('WebSocket error:', event);
				if (options.onError) options.onError(event);
			};
		}

		// Establish initial connection
		connect();

		// Return an enhanced WebSocket with additional utilities
		return {
			socket: () => socket,

			send: (data: any) => {
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(typeof data === 'string' ? data : JSON.stringify(data));
					return true;
				}
				return false;
			},

			close: (code?: number, reason?: string) => {
				if (socket) {
					socket.close(code, reason);
				}
			},

			reconnect: () => {
				if (socket) {
					socket.close();
				}
				connect();
			},

			isConnected: () => socket && socket.readyState === WebSocket.OPEN
		};
	}

	return {
		fetch: fetchWithAuth,
		get,
		post,
		put,
		delete: del,
		createWebSocket
	};


}

export const api_middleware = useApi();
