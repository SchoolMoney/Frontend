<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import type { Child } from '$lib/models/child';
	import { getUserChildren } from '$lib/api/child';
	import type { ClassGroup } from '../../../lib/models/class_group';
	import { getClasses } from '../../../lib/api/class_group';

	const ERROR_DISPLAY_TIME = 3000;

	let errorMsg = '';
	let showErrorPopup = false;
	let errorTimeout: NodeJS.Timeout;

	let children: Child[] = [];
  let classes: ClassGroup[] = [];
	let isLoading = true;

	async function fetchUserChildren() {
		try {
			children = await getUserChildren();
			if (!children?.length) {
				errorMsg = 'No children found';
			}

		} catch (error) {
			if (error instanceof Error) {
				errorMsg = error.message;
				showError();
			}
		}
	}

  async function fetchClasses() {
		try {
			classes = await getClasses();
		} catch (error) {
			if (error instanceof Error) {
				errorMsg = error.message;
				showError();
			}
		}
  }

	function showError() {
		if (errorTimeout) clearTimeout(errorTimeout);

		errorTimeout = setTimeout(() => {
      showErrorPopup = false;
		}, ERROR_DISPLAY_TIME);
	}

	onMount(async () => {
		await fetchUserChildren();
    await fetchClasses();
		isLoading = false;
	})

	function handleCardClick(class_id: number) {
		goto(`classes/class-view?class_group_id=${class_id}`);
	}

  function getClassName(class_id: number): string {
    return classes.find(c => c.id === class_id)?.name ?? '' ;
  }

</script>


<div class="min-h-dvh">
  <h2 class="text-center text-4xl w-full font-bold">Children</h2>

	{#if showErrorPopup}
		<div class="fixed top-4 right-4 z-50 max-w-md" transition:fly={{ y: -30, duration: 300 }}>
			<Alert variant="destructive">
				<CircleX class="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{errorMsg}</AlertDescription>
			</Alert>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<p>Loading children...</p>
		</div>
	{:else if !children?.length}
    <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20">No children found.</div>
	{:else}
		<div class="w-full overflow-y-auto max-h-[calc(100vh-150px)]">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
				{#each children as child (child.id)}
          <Card class="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>{child.name} {child.surname}</CardTitle>
              <CardDescription>Birth date: {child.birth_date}<br/>Class: {getClassName(child.group_id)}</CardDescription>
            </CardHeader>
            <CardContent class="flex justify-end">
              <Button
                class="ms-auto"
                on:click={() => handleCardClick(child.group_id)}>
                Class details
              </Button>
            </CardContent>
          </Card>
				{/each}
			</div>
		</div>
	{/if}
</div>