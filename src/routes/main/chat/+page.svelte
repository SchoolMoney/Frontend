<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getSessionData } from '$lib/api/auth';
	import { api_middleware } from '$lib/api_middleware';

	// Types
	interface Message {
		id: string;
		conversation_id: string;
		sender_id: number;
		content: string;
		message_type: string;
		file_url?: string;
		created_at: string;
		read: boolean;
	}

	interface Conversation {
		id: string;
		participants: number[];
		title: string;
		created_at: string;
		last_message_at: string | null;
	}

	// State
	let conversations: Conversation[] = [];
	let selectedConversation: Conversation | null = null;
	let messages: Message[] = [];
	let newMessageContent = '';
	let session = getSessionData();
	let userId = session.user_id;
	let isCreatingConversation = false;
	let newConversationTitle = '';
	let newParticipantIds = '';
	let wsConnection: any = null;

	async function loadConversations() {
		try {
			const response = await api_middleware.get('/api/chat/conversations');
			if (Array.isArray(response)) {
				conversations = response;
			} else if (response && Array.isArray(response.data)) {
				conversations = response.data;
			}
		} catch (error) {
			console.error('Error loading conversations:', error);
		}
	}

	async function loadMessages(conversationId: string, limit = 50, skip = 0) {
		try {
			const response = await api_middleware.get(`/api/chat/conversations/${conversationId}/messages?limit=${limit}&skip=${skip}`);
			if (Array.isArray(response)) {
				messages = response;
			} else if (response && Array.isArray(response.data)) {
				messages = response.data;
			}
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	function selectConversation(conversation: Conversation) {
		selectedConversation = conversation;
		loadMessages(conversation.id);
	}

	function sendMessage() {
		if (!newMessageContent.trim() || !selectedConversation || !wsConnection) {
			console.log("Cannot send message", {
				hasContent: !!newMessageContent.trim(),
				hasConversation: !!selectedConversation,
				hasConnection: !!wsConnection,
				isConnected: wsConnection?.isConnected()
			});
			return;
		}

		const messageData = {
			conversation_id: selectedConversation.id,
			content: newMessageContent,
			message_type: "text"
		};

		// Send message through the wsConnection
		const success = wsConnection.send(messageData);

		if (success) {
			// Optimistically add message to UI
			const tempMessage = {
				id: 'temp-' + Date.now(),
				conversation_id: selectedConversation.id,
				sender_id: userId,
				content: newMessageContent,
				message_type: "text",
				created_at: new Date().toISOString(),
				read: true
			};
			messages = [...messages, tempMessage];
			newMessageContent = '';
		} else {
			console.error('Failed to send message - connection not open');
			// Try to reconnect
			wsConnection.reconnect();
		}
	}

	async function createConversation() {
		if (!newConversationTitle.trim() || !newParticipantIds.trim()) return;

		try {
			const participantIds = newParticipantIds.split(',')
				.map(id => parseInt(id.trim()))
				.filter(id => !isNaN(id));

			// Add current user if not already in the list
			if (!participantIds.includes(userId)) {
				participantIds.push(userId);
			}

			console.log('Creating conversation with data:', {
				participants: participantIds,
				title: newConversationTitle
			});

			const response = await api_middleware.post('/api/chat/conversations', {
				participants: participantIds,
				title: newConversationTitle
			});

			if (response) {
				newConversationTitle = '';
				newParticipantIds = '';
				isCreatingConversation = false;
				await loadConversations();
			}
		} catch (error) { // Fixed syntax error here
			console.error('Error creating conversation:', error);
			if (error.response) {
				console.error('Server response:', error.response.status, error.response.data);
			}
		}
	}

	function connectWebSocket() {
		if (!userId) return;

		wsConnection = api_middleware.createWebSocket(`/api/chat/ws/${userId}`, {
			onOpen: () => {
				console.log('WebSocket connected successfully');
			},
			onMessage: (data) => {
				console.log('Message received:', data);

				if (selectedConversation && data.conversation_id === selectedConversation.id) {
					// Filter out temporary messages
					messages = messages
						.filter(m => !m.id.toString().startsWith('temp-'))
						.concat([data]);
				}

				// Refresh conversations to get updated last_message
				loadConversations();
			},
			onClose: (event) => {
				console.log('WebSocket disconnected:', event.code, event.reason);
			},
			onError: (event) => {
				console.error('WebSocket error:', event);
			},
			autoReconnect: true
		});

		return wsConnection;
	}

	onMount(() => {
		loadConversations();
		wsConnection = connectWebSocket();
	});

	onDestroy(() => {
		if (wsConnection) wsConnection.close();
	});
</script>

<div class="flex h-[calc(100vh-64px)] bg-white">
	<!-- Conversations sidebar -->
	<div class="w-1/3 border-r h-full flex flex-col">
		<div class="p-4 border-b flex justify-between items-center">
			<h2 class="text-xl font-semibold">Conversations</h2>
			<button
				on:click={() => isCreatingConversation = true}
				class="p-2 bg-primary text-white rounded-md"
			>
				New
			</button>
		</div>

		<div class="overflow-y-auto flex-1">
			{#each conversations as conversation (conversation.id)}
				<div
					class="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors {selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''}"
					on:click={() => selectConversation(conversation)}
				>
					<div class="font-medium">{conversation.title}</div>
					<div class="text-xs text-gray-500">
						{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : 'No messages yet'}
					</div>
				</div>
			{/each}

			{#if conversations.length === 0}
				<div class="p-4 text-center text-gray-500">No conversations yet</div>
			{/if}
		</div>
	</div>

	<!-- Chat area -->
	<div class="w-2/3 flex flex-col h-full">
		{#if selectedConversation}
			<!-- Chat header -->
			<div class="p-4 border-b">
				<h3 class="text-lg font-semibold">{selectedConversation.title}</h3>
			</div>

			<!-- Messages -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4" id="messages-container">
				{#each messages as message (message.id)}
					<div class={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
						<div class={`max-w-[70%] p-3 rounded-lg ${message.sender_id === userId ? 'bg-primary text-white' : 'bg-gray-100'}`}>
							<div>{message.content}</div>
							<div class="text-xs mt-1 text-right">
								{new Date(message.created_at).toLocaleTimeString()}
							</div>
						</div>
					</div>
				{/each}

				{#if messages.length === 0}
					<div class="text-center text-gray-500 py-8">No messages yet</div>
				{/if}
			</div>

			<!-- Message input -->
			<div class="p-4 border-t">
				<form on:submit|preventDefault={sendMessage} class="flex gap-2">
					<input
						type="text"
						bind:value={newMessageContent}
						placeholder="Type a message..."
						class="flex-1 p-2 border rounded-md"
					/>
					<button
						type="submit"
						class="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
						disabled={!newMessageContent.trim()}
					>
						Send
					</button>
				</form>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full text-gray-500">
				Select a conversation to start chatting
			</div>
		{/if}
	</div>
</div>

<!-- New conversation modal -->
{#if isCreatingConversation}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white p-6 rounded-lg w-full max-w-md">
			<h3 class="text-xl font-semibold mb-4">New Conversation</h3>

			<form on:submit|preventDefault={createConversation} class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Title</label>
					<input type="text" bind:value={newConversationTitle} class="w-full p-2 border rounded-md" />
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Participant IDs (comma-separated)</label>
					<input type="text" bind:value={newParticipantIds} class="w-full p-2 border rounded-md" />
					<p class="text-xs text-gray-500 mt-1">Enter user IDs separated by commas (e.g., "1,2,3")</p>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						on:click={() => isCreatingConversation = false}
						class="px-4 py-2 border rounded-md"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-primary text-white rounded-md"
						disabled={!newConversationTitle.trim() || !newParticipantIds.trim()}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}