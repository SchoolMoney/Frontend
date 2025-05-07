import { writable, get } from 'svelte/store';
import { api_middleware } from '$lib/api_middleware';
import type { WebSocketConnection } from '$lib/models/chat';
import { getSessionData } from '$lib/api/auth';

// Store for WebSocket connection
export const wsConnection = writable<WebSocketConnection | null>(null);

// Store for unread counts
export const unreadCounts = writable<Record<string, number>>({});

// Store for tracking if we're currently in chat view
export const isInChatView = writable<boolean>(false);

export const latestMessage = writable<any>(null);

// Initialize connection
export function initWebSocket() {
	const session = getSessionData();
	const userId = session?.user_id;

	if (!userId) return;

	const connection = api_middleware.createWebSocket(`/api/chat/ws/${userId}`, {
		onOpen: () => {
			console.log('Global WebSocket connected successfully');
		},
		onMessage: (data) => {
			console.log('Global WebSocket message received:', data);

			// Store the latest message
			latestMessage.set(data);

			// Update unread counts (existing code)
			unreadCounts.update(counts => {
				const inChatView = get(isInChatView);
				const currentCounts = { ...counts };

				if (data && data.sender_id !== undefined && data.conversation_id !== undefined &&
					data.sender_id !== userId && (!inChatView || data.conversation_id !== globalSelectedConversationId)) {
					currentCounts[data.conversation_id] = (currentCounts[data.conversation_id] || 0) + 1;
				}

				return currentCounts;
			});
		},
		onClose: (event) => {
			console.log('Global WebSocket disconnected:', event.code, event.reason);
		},
		onError: (event) => {
			console.error('Global WebSocket error:', event);
		},
		autoReconnect: true
	});

	wsConnection.set(connection);
	return connection;
}

// Track selected conversation globally
let globalSelectedConversationId: string | null = null;
export function setSelectedConversation(id: string | null) {
	globalSelectedConversationId = id;
}

// Call this when entering chat view
export function enterChatView() {
	isInChatView.set(true);
}

// Call this when leaving chat view
export function leaveChatView() {
	isInChatView.set(false);
}

// Initialize on app startup
if (typeof window !== 'undefined') {
	initWebSocket();
}