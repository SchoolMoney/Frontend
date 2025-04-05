<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { get_user_classes_using_JWT } from '$lib/api/class_group';
	import type { ClassGroup } from '$lib/models/class_group';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX } from 'lucide-svelte';


	let error_message = '';
	let show_error_popup = false;
	let error_timeout: NodeJS.Timeout;

	let api_response: ClassGroup[] = [];
	let is_loading = true;
	const ERROR_DISPLAY_TIME = 3000;

	async function fetch_user_classes() {

		console.log(error_message);
		try {
			api_response = await get_user_classes_using_JWT();
			console.log(api_response);
			if (api_response.length == 0) {
				error_message = 'No classes found';
			}

		} catch (error) {
			if (error instanceof Error) {
				error_message = error.message;
				show_error();
				console.log(error);
			}
		}
	}

	function show_error(){
		if (error_timeout) clearTimeout(error_timeout);

		error_timeout = setTimeout(() => {
				show_error_popup = false;
		}, ERROR_DISPLAY_TIME);
	}

	onMount(async () => {
		await fetch_user_classes();
		is_loading = false;

	})

	function handleCardClick(classId: number) {
		console.log('Selected class group ID:', classId);

		goto(`classes/class-view?class_group_id=${classId}`);
	}

</script>


<div class="container mx-auto py-6">
	<h1 class="text-2xl font-bold mb-6">Classes</h1>

	{#if show_error_popup}
		<div class="fixed top-4 right-4 z-50 max-w-md" transition:fly={{ y: -30, duration: 300 }}>
			<Alert variant="destructive">
				<CircleX class="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error_message}</AlertDescription>
			</Alert>
		</div>
	{/if}

	{#if is_loading}
		<div class="flex justify-center items-center h-64">
			<p>Loading class groups...</p>
		</div>
	{:else if api_response.length === 0}
		<div class="bg-muted p-6 rounded-lg text-center">
			<p>No class groups found.</p>
		</div>
	{:else}
		<div class="w-full overflow-y-auto max-h-[calc(100vh-150px)]">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
				{#each api_response as classGroup (classGroup.id)}
					<button
						class="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
						on:click={() => handleCardClick(classGroup.id)}
						data-id={classGroup.id}
					>
						<Card class="h-full transition-shadow hover:shadow-md">
							<CardHeader>
								<CardTitle>{classGroup.name}</CardTitle>
								<CardDescription>{classGroup.description}</CardDescription>
							</CardHeader>
						</Card>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>