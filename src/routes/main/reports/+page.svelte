<script lang="ts">
	import { onMount } from 'svelte';
	import { getFinancialReport, getClassFinancialReport } from '$lib/api/report_service';
	import { getSessionData } from '$lib/api/auth';
	import { Privilege } from '$lib/models/auth';
	import { api_middleware } from '$lib/api_middleware';
	import ClassReport from '../collections/[id]/ClassReport.svelte';
	import FinancialReport from '../collections/[id]/FinancialReport.svelte';
	import type { ClassFinancialReport } from '$lib/models/class_financial_report';
	import * as Select from '$lib/components/ui/select';

	// Define proper types for our variables
	interface Collection {
		id: number;
		name: string;
	}

	interface ClassGroup {
		id: number;
		name: string;
	}

	let isAdmin = false;
	let classes: ClassGroup[] = [];
	let selectedClassId: number | null = null;
	let classReport: ClassFinancialReport | null = null;
	let showReport = false;

	let collections: Collection[] = [];
	let selectedCollectionId: number | null = null;
	let collectionReport: Record<string, any> | null = null;
	let showCollectionReport = false;

	async function loadClasses() {
		try {
			if (isAdmin) {
				const response = await api_middleware.get('/api/class_group');

				if (Array.isArray(response)) {
					classes = response;
				} else if (response && Array.isArray(response.data)) {
					classes = response.data;
				} else {
					console.error('Unexpected response format:', response);
					classes = [];
				}
			} else {
				const response = await api_middleware.get('/api/class_group/list-class-groups');

				if (Array.isArray(response)) {
					classes = response;
				} else if (response && Array.isArray(response.data)) {
					classes = response.data;
				} else {
					console.error('Unexpected response format:', response);
					classes = [];
				}
			}
		} catch (error) {
			console.error('Error loading classes:', error);
		}
	}

	async function loadCollections() {
		try {
			const response = await api_middleware.get('/api/collection');

			if (Array.isArray(response)) {
				collections = response;
			} else if (response && Array.isArray(response.data)) {
				collections = response.data;
			} else {
				console.error('Unexpected collection response format:', response);
				collections = [];
			}
		} catch (error) {
			console.error('Error loading collections:', error);
		}
	}

	function handleReportClose() {
		showReport = false;
	}

	function handleCollectionReportClose() {
		showCollectionReport = false;
	}

	async function generateClassReport() {
		if (selectedClassId) {
			try {
				classReport = await getClassFinancialReport(parseInt(selectedClassId.toString()));
				showReport = true;
			} catch (error) {
				console.error('Error generating class report:', error);
			}
		}
	}

	async function generateCollectionReport() {
		if (selectedCollectionId) {
			try {
				collectionReport = await getFinancialReport(parseInt(selectedCollectionId.toString()));
				showCollectionReport = true;
			} catch (error) {
				console.error('Error generating collection report:', error);
			}
		}
	}

	onMount(() => {
		isAdmin = getSessionData().privilege === Privilege.ADMIN_USER;
		loadClasses();
		loadCollections();
	});
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Reports</h1>

	<!-- Collection reports section -->
	<div class="p-4 border rounded-md">
		<h2 class="text-xl font-semibold mb-4">Collection Financial Reports</h2>
		<div class="mb-4">
			<label for="collection-select" class="block text-sm font-medium mb-1">Select Collection</label>
      <Select.Root
        onSelectedChange={(v) => {
          selectedCollectionId = v?.value ?? 0;
        }}>
        <Select.Trigger>
          <Select.Value placeholder="Select collection" />
        </Select.Trigger>
        <Select.Content>
          {#each collections as collection}
            <Select.Item value={collection.id}>{collection.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
		</div>
		<button
			on:click={generateCollectionReport}
			disabled={!selectedCollectionId}
			class="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
		>
			Generate Report
		</button>
	</div>

	<div class="p-4 border rounded-md">
		<h2 class="text-xl font-semibold mb-4">Class Financial Reports</h2>
		<div class="mb-4">
			<label for="collection-select" class="block text-sm font-medium mb-1">Select Class</label>
      <Select.Root
        onSelectedChange={(v) => {
          selectedClassId = v?.value ?? 0;
        }}>
        <Select.Trigger>
          <Select.Value placeholder="Select class" />
        </Select.Trigger>
        <Select.Content>
          {#each classes as classItem}
            <Select.Item value={classItem.id}>{classItem.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
		</div>
		<button
			on:click={generateClassReport}
			disabled={!selectedClassId}
			class="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
		>
			Generate Report
		</button>
	</div>

	{#if classReport}
		<ClassReport bind:open={showReport} reportData={classReport} on:close={handleReportClose} />
	{/if}

	{#if collectionReport}
		<FinancialReport bind:open={showCollectionReport} reportData={collectionReport}
										 on:close={handleCollectionReportClose} />
	{/if}
</div>