<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { getClassView } from '$lib/api/class_group';
	import { decodeToken } from '$lib/api/auth';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { CircleX, Plus, Calendar, Eye } from 'lucide-svelte';

	interface Collection {
		id: number;
		logo_path: string | null;
		name: string;
		description: string;
		start_date: string;
		end_date: string | null;
		status: number;
		price: number;
		class_group_id: number;
		bank_account_id: number;
		owner_id: number;
	}

	interface Child {
		name: string;
		birth_date: string;
		id: number;
		surname: string;
		group_id: number;
	}

	interface Parent {
		id: number;
		name: string;
		surname: string;
		role: number;
		account_id: number;
	}

	interface Requester {
		parent_id: number;
		name: string;
		surname: string;
		group_role: number;
	}

	interface ClassView {
		class: {
			description: string;
			name: string;
			id: number;
		};
		children: Child[];
		parents: Parent[];
		collections: Collection[];
		requester: Requester;
	}


	const collectionStatuses = [
		{ value: '0', label: 'Open' },
		{ value: '1', label: 'Finished' },
		{ value: '2', label: 'Not Paid Before Deadline' },
		{ value: '3', label: 'Cancelled' }
	];

	let classViewData: ClassView | null = null;
	let isLoading = true;
	let isLoadingCollections = false;
	let showErrorPopup = false;
	let errorMessage = '';
	let selectedStatus: string = '0';
	let user_type: number;



	async function handleStatusClick(statusValue: string) {
		//Implement filtering by collection status
	}

	onMount(async () => {
		let decoded_token = decodeToken();
		user_type = decoded_token.privilege;
		try {
			const classGroupId = page.url.searchParams.get('class_group_id');

			if (!classGroupId) {
				throw new Error('No class_group_id provided');
			}

			const classId = parseInt(classGroupId);
			classViewData = await getClassView(classId);

		} catch (error) {
			showErrorPopup = true;
			errorMessage = error.message || 'An error occurred while fetching data';
			setTimeout(() => {
				showErrorPopup = false;
			}, 5000);
		} finally {
			isLoading = false;
		}
	});

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Not specified';
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	function getStatusText(status: number): string {
		switch (status) {
			case 0:
				return 'Open';
			case 1:
				return 'Finished';
			case 2:
				return 'Not Paid Before Deadline';
			case 3:
				return 'Cancelled';
			default:
				return 'Unknown';
		}
	}

	function handleAddCollection() {
	}

	function handleShowReport() {
	}
</script>

<div class="container mx-auto py-6">
	{#if showErrorPopup}
		<div class="fixed top-4 right-4 z-50 max-w-md" transition:fly={{ y: -30, duration: 300 }}>
			<Alert variant="destructive">
				<CircleX class="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<p>Loading class data...</p>
		</div>
	{:else if classViewData}
		<div class="mb-6 flex justify-between items-center">
			<h1 class="text-2xl font-bold">{classViewData.class.name}</h1>
			<p class="text-muted-foreground">{classViewData.class.description}</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Collections Section - 2/3 width on large screens -->
			<div class="lg:col-span-2">
				<div class="mb-4 flex justify-between items-center">
					<div class="flex items-center gap-4">
						<h2 class="text-xl font-semibold">Collections</h2>

						<!-- Filtr statusu - przyciski zamiast dropdown -->
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Filter:</span>
							<div class="flex flex-wrap gap-2">
								{#each collectionStatuses as status}
									<button
										class="px-2 py-1 text-xs rounded-md transition-colors {selectedStatus === status.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
										on:click={() => handleStatusClick(status.value)}
									>
										{status.label}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<Button on:click={handleShowReport} class="flex items-center gap-2">
						<Eye class="h-4 w-4" />
							Show collections report
					</Button>

					{#if (classViewData.requester && classViewData.requester.group_role === 2) || user_type === 10}
						<Button on:click={handleAddCollection} class="flex items-center gap-2">
							<Plus class="h-4 w-4" />
							Add Collection
						</Button>
					{/if}
				</div>

				<div class="w-full overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
					{#if isLoadingCollections}
						<div class="flex justify-center items-center h-32">
							<p>Loading collections...</p>
						</div>
					{:else if classViewData.collections.length === 0}
						<div class="bg-muted p-6 rounded-lg text-center">
							<p>No collections found.</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each classViewData.collections as collection (collection.id)}
								<Card class="h-full transition-shadow hover:shadow-md">
									<CardHeader>
										{#if collection.logo_path}
											<div class="w-full flex justify-center mb-3">
												<img
													src={collection.logo_path}
													alt={collection.name}
													class="h-16 w-auto object-contain"
												/>
											</div>
										{/if}
										<CardTitle>{collection.name}</CardTitle>
										<CardDescription>{collection.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div class="flex items-center gap-2 mb-1 text-sm">
											<Calendar class="h-4 w-4" />
											<span>From: {formatDate(collection.start_date)}</span>
										</div>
										{#if collection.end_date}
											<div class="flex items-center gap-2 mb-1 text-sm">
												<Calendar class="h-4 w-4" />
												<span>To: {formatDate(collection.end_date)}</span>
											</div>
										{/if}
									</CardContent>
									<CardFooter class="flex justify-between">
										<span class="text-sm font-semibold">{collection.price.toFixed(2)} PLN</span>
										<span class="text-sm">{getStatusText(collection.status)}</span>
									</CardFooter>
								</Card>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Parents and Children Section - 1/3 width on large screens -->
			<div class="lg:col-span-1">
				<div class="space-y-6">
					<!-- Parents List -->
					<div>
						<h2 class="text-xl font-semibold mb-4">Parents</h2>
						<div class="bg-card rounded-lg shadow-sm border">
							<div class="overflow-y-auto max-h-[calc(40vh-150px)]">
								{#if classViewData.parents.length === 0}
									<div class="p-4 text-center text-muted-foreground">
										<p>No parents found.</p>
									</div>
								{:else}
									<ul class="divide-y">
										{#each classViewData.parents as parent (parent.id)}
											<li class="p-3 hover:bg-muted/50">
												<p class="font-medium">{parent.name} {parent.surname}</p>
												<p class="text-sm text-muted-foreground">
													Role: {parent.role === 1 ? 'Parent' : parent.role === 2 ? 'Cashier' : 'Unknown'}
												</p>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>

					<!-- Children List -->
					<div>
						<h2 class="text-xl font-semibold mb-4">Children</h2>
						<div class="bg-card rounded-lg shadow-sm border">
							<div class="overflow-y-auto max-h-[calc(40vh-150px)]">
								{#if classViewData.children.length === 0}
									<div class="p-4 text-center text-muted-foreground">
										<p>No children found.</p>
									</div>
								{:else}
									<ul class="divide-y">
										{#each classViewData.children as child (child.id)}
											<li class="p-3 hover:bg-muted/50">
												<p class="font-medium">{child.name} {child.surname}</p>
												<p class="text-sm text-muted-foreground">
													Birth date: {formatDate(child.birth_date)}
												</p>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>