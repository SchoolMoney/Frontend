export interface Message {
	id: string;
	conversation_id: string;
	sender_id: number;
	content: string;
	message_type: string;
	file_url?: string;
	created_at: string;
	read: boolean;
}

export interface Conversation {
	id: string;
	participants: number[];
	title: string;
	created_at: string;
	last_message_at: string | null;
}

export interface Parent {
	id: number;
	first_name: string;
	last_name: string;
}

export interface CurrentUser {
	username: string;
	privilege: number;
	status: number;
	email: string | null;
	id: number;
}

export interface WebSocketConnection {
	socket: () => WebSocket;
	send: (data: unknown) => boolean;
	close: (code?: number, reason?: string) => void;
	reconnect: () => void;
	isConnected: () => boolean;
}