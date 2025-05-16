<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { getSessionData } from '$lib/api/auth';
	import { api_middleware } from '$lib/api_middleware';
	import {
		wsConnection,
		unreadCounts as globalUnreadCounts,
		enterChatView,
		leaveChatView,
		setSelectedConversation,
		latestMessage,
		initWebSocket
	} from '$lib/stores/websocket';
	import type {
		Message,
		Conversation,
		Parent,
		CurrentUser
	} from '$lib/models/chat';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';

	// State
	let conversations: Conversation[] = [];
	let selectedConversation: Conversation | null = null;
	let messages: Message[] = [];
	let newMessageContent = '';

	interface SessionData {
		user_id: number;
		[key: string]: unknown;
	}

	let session: SessionData = { user_id: 0 };

	let userId: number | null = null;
	let isCreatingConversation = false;
	let newConversationTitle = '';
	let allParents: Parent[] = [];
	let currentUser: CurrentUser | null = null;
	let selectedParticipant: string | number = ''; // Fix for type error
	let messagesContainer: HTMLElement;
	let refreshInterval: ReturnType<typeof setInterval>;

	let unreadCounts: Record<string, number> = {};
	const unsubscribe = globalUnreadCounts.subscribe(value => {
		unreadCounts = value;
		conversations = [...conversations];
	});

	const unsubscribeMessages = latestMessage.subscribe(newMessage => {
		if (!newMessage) return;

		if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
			const messageExists = messages.some(m => m.id === newMessage.id);
			if (!messageExists) {
				messages = [...messages, newMessage];
				scrollToBottom();

				if (newMessage.sender_id !== userId) {
					api_middleware.post('/api/chat/messages/read', {
						message_ids: [newMessage.id]
					}).catch(err => console.error('Error marking message as read:', err));
				}
			}
		} else if (newMessage.conversation_id) {
			conversations = conversations.map(conv => {
				if (conv.id === newMessage.conversation_id) {
					return {
						...conv,
						last_message_at: newMessage.created_at
					};
				}
				return conv;
			});

			conversations = sortConversations(conversations);

			fetchUnreadCountForConversation(newMessage.conversation_id);
		}
	});

	async function scrollToBottom() {
		await tick();
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function getParentById(id: number) {
		return allParents.find(parent => parent.id === id);
	}

	function getUnreadCount(conversationId: string): number {
		return unreadCounts[conversationId] || 0;
	}

	// Sort conversations by last_message_at (newest first)
	function sortConversations(convos: Conversation[]): Conversation[] {
		return [...convos].sort((a, b) => {
			const timeA = a.last_message_at || 0;
			const timeB = b.last_message_at || 0;
			return new Date(timeB).getTime() - new Date(timeA).getTime();
		});
	}

	async function fetchUnreadCountForConversation(conversationId: string) {
		try {
			const response = await api_middleware.get(`/api/chat/conversations/${conversationId}/unread_count`);
			// Handle the response format from the backend: {"unread_count": number}
			const unreadCount = response && typeof response === 'object' && 'unread_count' in response
				? response.unread_count
				: (typeof response === 'number' ? response : 0);

			globalUnreadCounts.update(counts => {
				const updatedCounts = { ...counts };
				updatedCounts[conversationId] = unreadCount;
				return updatedCounts;
			});
		} catch (error) {
			console.error(`Error fetching unread count for conversation ${conversationId}:`, error);
		}
	}

	async function fetchAllUnreadCounts() {
		try {
			for (const conv of conversations) {
				if (selectedConversation && conv.id === selectedConversation.id) {
					continue;
				}
				await fetchUnreadCountForConversation(conv.id);
			}
		} catch (error) {
			console.error('Error fetching unread counts:', error);
		}
	}

	async function loadConversations() {
		try {
			const response = await api_middleware.get('/api/chat/conversations');
			let conversationData: Conversation[] = [];

			if (Array.isArray(response)) {
				conversationData = response;
			} else if (response && Array.isArray(response.data)) {
				conversationData = response.data;
			}

			conversations = sortConversations(conversationData);

			await fetchAllUnreadCounts();
		} catch (error) {
			console.error('Error loading conversations:', error);
		}
	}

	async function loadParents() {
		try {
			const response = await api_middleware.get('/api/parent/all_basic_info');
			if (Array.isArray(response)) {
				allParents = response;
			} else if (response && Array.isArray(response.data)) {
				allParents = response.data;
			}
			console.log('Loaded parents:', allParents);
		} catch (error) {
			console.error('Error loading parents:', error);
		}
	}

	async function loadCurrentUser() {
		try {
			const response = await api_middleware.get('/api/user/me');
			currentUser = response;
			if (currentUser) {
				userId = currentUser.id;
				// Force re-render of messages with the correct userId
				if (messages.length > 0) {
					messages = [...messages];
				}
			}
		} catch (error) {
			console.error('Error loading current user:', error);
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
			await scrollToBottom();
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	async function selectConversation(conversation: Conversation) {
		// Fix for the bug: Only enter chat view when actually selecting a conversation
		enterChatView();

		globalUnreadCounts.update(counts => {
			const updatedCounts = { ...counts };
			updatedCounts[conversation.id] = 0;
			return updatedCounts;
		});

		setSelectedConversation(conversation.id);

		selectedConversation = conversation;
		await loadMessages(conversation.id);

		try {
			const unreadMessageIds = messages
				.filter(m => m.sender_id !== userId && !m.read)
				.map(m => m.id);

			if (unreadMessageIds.length > 0) {
				await api_middleware.post('/api/chat/messages/read', {
					message_ids: unreadMessageIds
				});

				messages = messages.map(m =>
					unreadMessageIds.includes(m.id) ? { ...m, read: true } : m
				);
			}
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	}

	function sendMessage() {
		if (!newMessageContent.trim() || !selectedConversation) {
			return;
		}

		const wsConn = $wsConnection;
		if (!wsConn || !wsConn.isConnected()) {
			console.error('WebSocket not connected');
			return;
		}

		// Ensure userId is a number and log it for debugging
		const currentUserId = Number(userId);
		console.log('Sending message with sender_id:', currentUserId);

		const messageData = {
			conversation_id: selectedConversation.id,
			content: newMessageContent,
			message_type: 'text',
			sender_id: currentUserId // Make sure this is a number
		};

		// Log the actual message payload
		console.log('Message payload:', JSON.stringify(messageData));

		const tempId = 'temp-' + Date.now();
		const success = wsConn.send(messageData);

		if (success) {
			const tempMessage: Message = {
				id: tempId,
				conversation_id: selectedConversation.id,
				sender_id: currentUserId, // Use the same value here
				content: newMessageContent,
				message_type: 'text',
				created_at: new Date().toISOString(),
				read: true
			};
			messages = [...messages, tempMessage];
			newMessageContent = '';
			scrollToBottom();
		} else {
			console.error('Failed to send message - connection not open');
			wsConn.reconnect();
		}
	}

	async function createConversation() {
		if (!selectedParticipant) return;

		try {
			const participantIds = [Number(selectedParticipant)];

			// Add current user
			if (currentUser) {
				participantIds.push(currentUser.id);
			}

			let title = newConversationTitle.trim();
			if (!title) {
				const selectedParent = getParentById(Number(selectedParticipant));

				if (selectedParent) {
					const currentUserAsParent = currentUser ? getParentById(currentUser.id) : null;

					if (currentUserAsParent) {
						title = `${selectedParent.first_name} ${selectedParent.last_name} - ${currentUserAsParent.first_name} ${currentUserAsParent.last_name}`;
					} else if (currentUser) {
						title = `${selectedParent.first_name} ${selectedParent.last_name} - ${currentUser.username}`;
					} else {
						title = `${selectedParent.first_name} ${selectedParent.last_name}`;
					}
				} else {
					title = 'New Conversation';
				}
			}

			console.log('Creating conversation with data:', {
				participants: participantIds,
				title: title
			});

			const response = await api_middleware.post('/api/chat/conversations', {
				participants: participantIds,
				title: title
			});

			if (response) {
				newConversationTitle = '';
				selectedParticipant = '';
				isCreatingConversation = false;
				await loadConversations();
			}
		} catch (error) {
			console.error('Error creating conversation:', error);
			if (error instanceof Error) {
				const errorWithResponse = error as unknown as { response?: { status: number, data: unknown } };
				if (errorWithResponse.response) {
					console.error('Server response:', errorWithResponse.response.status, errorWithResponse.response.data);
				}
			}
		}
	}

	onMount(async () => {
		session = getSessionData();
		// Set initial user ID from session
		userId = session.user_id;

		// Make sure to await these to fully establish identity before loading messages
		await Promise.all([
			loadParents(),
			loadCurrentUser() // This will update userId more reliably
		]);

		await loadConversations();

		const wsConn = $wsConnection;
		if (!wsConn || !wsConn.isConnected()) {
			initWebSocket();
		}

		refreshInterval = setInterval(() => {
			fetchAllUnreadCounts();
		}, 30000);
	});

	onDestroy(() => {
		clearInterval(refreshInterval);
		unsubscribe();
		unsubscribeMessages();
		leaveChatView();
		setSelectedConversation(null);
	});
</script>

<div class="flex h-[calc(100vh-64px)] bg-muted/50">
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
					class="p-4 border-b cursor-pointer hover:bg-gray-800 transition-colors {selectedConversation?.id === conversation.id ? 'border border-primary bg-gray-800' : ''}"
					on:click={() => selectConversation(conversation)}
				>
					<div class="flex justify-between items-center">
						<div class="{getUnreadCount(conversation.id) > 0 ? 'font-bold' : 'font-medium'}">{conversation.title}</div>
						{#if getUnreadCount(conversation.id) > 0}
							<div class="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
								{getUnreadCount(conversation.id)}
							</div>
						{/if}
					</div>
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

			<!-- Messages section -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4" id="messages-container" bind:this={messagesContainer}>
				{#each messages as message (message.id)}
					<div class={`flex ${Number(message.sender_id) === Number(userId) ? 'justify-end' : 'justify-start'}`}>
						<div class="max-w-[70%]">
							<div class="text-xs mb-1 ml-1">
								{#if Number(message.sender_id) === Number(userId)}
									You
								{:else}
									{@const sender = getParentById(Number(message.sender_id))}
									{#if sender}
										{sender.first_name} {sender.last_name}
									{:else}
										Unknown
									{/if}
								{/if}
							</div>
							<div class={`p-3 rounded-lg ${Number(message.sender_id) === Number(userId) ? 'bg-primary text-white' : 'bg-gray-100 text-black'}`}>
								<div class="break-words break-all whitespace-pre-wrap">{message.content}</div>
								<div class="text-xs mt-1 text-right">
									{new Date(message.created_at).toLocaleTimeString()}
								</div>
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
					<Input
						required
						bind:value={newMessageContent}
						placeholder="Type a message..."
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
		<div class="bg-muted/50 p-6 rounded-lg w-full max-w-md">
			<h3 class="text-xl font-semibold mb-4">New Conversation</h3>

			<form on:submit|preventDefault={createConversation} class="space-y-4">
				<div>
					<Label for="title">Title</Label>
					<Input
						required
						id="title"
						bind:value={newConversationTitle}
						placeholder="Enter conservation title"
					/>
					<p class="text-xs text-gray-500 mt-1">
						If no title is provided, participant name will be used
					</p>
				</div>

				<div>
					<Select.Root
						onSelectedChange={(v) => {
							// Convert the value to a number or fallback to empty string
							selectedParticipant = v?.value ? Number(v.value) : '';
						}}>
						<Select.Trigger>
							<Select.Value placeholder="Select class" />
						</Select.Trigger>
						<Select.Content>
							{#each allParents.filter(parent =>
								parent.id !== currentUser?.id
							) as parent (parent.id)}
								<Select.Item value={parent.id}>{parent.first_name} {parent.last_name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<p class="text-xs text-gray-500 mt-1">
						{#if currentUser}Your user will be added automatically.{/if}
					</p>
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
						disabled={!selectedParticipant}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}