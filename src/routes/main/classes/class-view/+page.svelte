<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { changeCashier, getClassView } from '$lib/api/class_group';
	import { decodeToken } from '$lib/api/auth';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { CircleX, Files, HandCoins, Calendar, Replace, CircleAlert } from 'lucide-svelte';
	import { cardVariants, CollectionStatus, statusLabels } from '$lib/models/collection';
	import { goto } from '$app/navigation';
	import { GroupRole, groupRoleLabels, type ClassView } from '$lib/models/class_group';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Privilege } from '$lib/models/auth';
	import { Confirm } from '$lib/components/custom/confirm';
	import { cancelCollection } from '$lib/api/collection';
	import type { Parent } from '$lib/models/parent';
	import {api_middleware} from '$lib/api_middleware';
	import ClassReport from '../../collections/[id]/ClassReport.svelte';
	import { showToast } from '$lib/stores/toast';
	import { getClassFinancialReport } from '$lib/api/report_service';
	import type { ClassFinancialReport } from '$lib/models/class_financial_report';

	let classViewData: ClassView | null = null;
	let classGroupCashier: Parent;
	let isLoading = true;
	let isLoadingCollections = false;
	let showErrorPopup = false;
	let errorMessage = '';
	let loggedUserPrivilige: Privilege;
  let classId: number;
  let isConfirmDialogOpen = false;
  let selectedCollectionIdToCancel = 0;
  let showChangeClassGroupCashier = false;
  let selectedParentIdToSwitchToCashier = 0;
	let isClassReportModalOpen = false;
	let classReportData: ClassFinancialReport;
  let error: string;


	async function handleStatusChange(status: CollectionStatus) {
		classViewData = await getClassView(classId, status);
	}

	onMount(async () => {
		let decoded_token = decodeToken();
		loggedUserPrivilige = decoded_token.privilege;
		try {
			const classGroupId = page.url.searchParams.get('class_group_id');

			if (!classGroupId) {
				throw new Error('No class_group_id provided');
			}

			classId = parseInt(classGroupId, 10);
			classViewData = await getClassView(classId, CollectionStatus.OPEN);
			classGroupCashier = classViewData?.parents.find((p) => p.role === GroupRole.CASHIER) ?? {
				name: '',
				surname: ''
			};
			selectedParentIdToSwitchToCashier = classGroupCashier.id;
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
		if (!dateString) {
			return 'Not specified';
		}

		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	function handleAddCollection() {
    console.log(classViewData);
    if (classViewData?.children.length) {
      goToCollection(0);
    } else {
      error = 'No children found in this class group. Please add children to the class group before creating a collection.';
      setTimeout(() => {
        error = '';
      }, 5000);
    }
	}

	function handleDetailsCollection(collection_id: number) {
		goToCollection(collection_id);
	}

	function goToCollection(collection_id: number): void {
		goto(`/main/collections/${collection_id}?class_group_id=${classId}`);
	}

	function handleCancelCollection(collection_id: number) {
		selectedCollectionIdToCancel = collection_id;
		isConfirmDialogOpen = true;
	}

	async function confirmCancelCollection() {
		try {
			await cancelCollection(selectedCollectionIdToCancel);
			isConfirmDialogOpen = false;
			classViewData!.collections = classViewData?.collections.filter(
				(c) => c.id !== selectedCollectionIdToCancel
			);
			selectedCollectionIdToCancel = 0;
		} catch (error) {
			showErrorPopup = true;
			errorMessage = error.message || 'An error occurred while cancelling collection';
			setTimeout(() => {
				showErrorPopup = false;
			}, 5000);
		} finally {
			isLoading = false;
		}
	}

	async function handleShowReport() {
		try {
			const reportData = await getClassFinancialReport(classId);
			classReportData = reportData;
			isClassReportModalOpen = true;
		} catch (error) {
			console.error('Error generating class report:', error);
			showToast('error', 'Failed to generate class report')
		}
	}

	function handleChangeCashierClick() {
		showChangeClassGroupCashier = true;
	}

	function handleChangeCashierCancelClick() {
		showChangeClassGroupCashier = false;
	}

	async function handleChangeCashierSaveClick() {
		try {
			await changeCashier(classId, selectedParentIdToSwitchToCashier);

			const oldCashierIndex = classViewData?.parents.findIndex((p) => p.role === GroupRole.CASHIER);
			const newCashierIndex = classViewData?.parents.findIndex(
				(p) => p.id === selectedParentIdToSwitchToCashier
			);

			if (selectedParentIdToSwitchToCashier !== classViewData?.requester.parent_id) {
				classViewData!.parents[oldCashierIndex].role = GroupRole.MEMBER;
				classViewData!.requester.group_role = GroupRole.MEMBER;
			}
			classViewData!.parents[newCashierIndex].role = GroupRole.CASHIER;

			selectedParentIdToSwitchToCashier = 0;
			showChangeClassGroupCashier = false;
		} catch (error) {
			showErrorPopup = true;
			errorMessage = error.message || 'An error occurred while changing cashier';
			setTimeout(() => {
				showErrorPopup = false;
			}, 5000);
		}
	}

	async function rotateGroupAccessCode(classId) {
		try {
			await api_middleware.put(
				`/api/class_group/${classId}/rotate_access_code`,
				{}
			);
			window.location.reload();
		} catch (error) {
			showErrorPopup = true;
			errorMessage = error.message || 'An error occurred while rotating access code';
			setTimeout(() => {
				showErrorPopup = false;
			}, 5000);
		}
	}
</script>

<Confirm
	isOpen={isConfirmDialogOpen}
	onCancel={() => (isConfirmDialogOpen = false)}
	onConfirm={confirmCancelCollection}
/>

<div class="min-h-dvh">
	{#if showErrorPopup}
		<div class="fixed right-4 top-4 z-50 max-w-md" transition:fly={{ y: -30, duration: 300 }}>
			<Alert.Root variant="destructive">
				<CircleX class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>{errorMessage}</Alert.Description>
			</Alert.Root>
		</div>
	{/if}

	{#if isClassReportModalOpen && classReportData}
		<ClassReport
			open={isClassReportModalOpen}
			reportData={classReportData}
			on:close={() => isClassReportModalOpen = false}
		/>
	{/if}

	{#if isLoading}
		<div class="flex h-64 items-center justify-center">
			<p>Loading class data...</p>
		</div>
	{:else if classViewData}
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">
				{classViewData.class.name}
				{#if classViewData.requester?.group_role === GroupRole.CASHIER}
					{#if classViewData.class.access_code != null}
						- access code: {classViewData.class.access_code}
						<button
							class="ml-2 p-1 text-sm rounded bg-secondary"
							on:click={() => {
          if (classViewData.class.access_code) {
            navigator.clipboard.writeText(classViewData.class.access_code);
          }
        }}
							title="Copy access code"
							aria-label="Copy access code to clipboard"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</button>

						<button
							class="ml-2 p-1 text-sm bg-secondary rounded"
							on:click={async () => {
          rotateGroupAccessCode(classViewData.class.id)
        }}
							title="Refresh access code"
							aria-label="Refresh access code"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					{/if}
				{/if}
			</h1>
			<p class="text-muted-foreground">{classViewData.class.description}</p>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<h2 class="text-xl font-semibold">Collections</h2>

						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Filter:</span>
							<RadioGroup.Root
								value={CollectionStatus.OPEN.toString()}
								onValueChange={(value) =>
									handleStatusChange(parseInt(value ?? CollectionStatus.OPEN, 10))}
								class="flex flex-wrap gap-2"
							>
								{#each statusLabels as [statusValue, statusLabel]}
									<div class="ms-4 flex items-center space-x-2">
										<RadioGroup.Item value={statusValue.toString()} id={statusValue.toString()} />
										<Label for={statusValue.toString()}>{statusLabel}</Label>
									</div>
								{/each}
							</RadioGroup.Root>
						</div>
					</div>

					<Button on:click={handleShowReport} class="ms-auto flex items-center gap-2">
						<Files class="h-4 w-4" />
						Show report
					</Button>

					{#if classViewData.requester?.group_role === GroupRole.CASHIER}
						<Button
							class="ms-2 mt-auto gap-2 bg-green-500 text-white hover:bg-opacity-85"
							on:click={handleAddCollection}
						>
							<HandCoins class="h-4 w-4" />
							Add collection
						</Button>
					{/if}
				</div>

				<div class="max-h-[calc(100vh-250px)] w-full overflow-y-auto">
					{#if isLoadingCollections}
						<div class="flex h-32 items-center justify-center">
							<p>Loading collections...</p>
						</div>
					{:else if classViewData.collections.length === 0}
						<div
							class="col-start-4 col-end-6 mt-20 text-center text-xl text-muted-foreground text-opacity-50"
						>
							No collections found.
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							{#each classViewData.collections as collection (collection.id)}
								<Card
									class={cardVariants.get(collection.status) +
										'h-full transition-shadow hover:shadow-md'}
								>
									<CardHeader class="flex-row">
										{#if collection.logo_path}
											<img class="h-16 w-16 rounded" src={collection.logo_path} alt="Avatar" />
										{/if}
										<div class="flex flex-col space-y-1.5 px-6">
											<CardTitle>{collection.name}</CardTitle>
											<CardDescription>{collection.description}</CardDescription>
										</div>
									</CardHeader>
									<CardContent class="space-y-2">
										<div class="flex gap-2 text-sm">
											<div class="flex gap-2">
												<Calendar class="h-4 w-4" />
												<span>From: {formatDate(collection.start_date)}</span>
											</div>
											{#if collection.end_date}
												<div class="flex gap-2">
													<span>to: {formatDate(collection.end_date)}</span>
												</div>
											{/if}
										</div>
										<div class="text-sm font-semibold">{collection.price.toFixed(2)} PLN</div>
										<div class="text-sm">{statusLabels.get(collection.status)}</div>
									</CardContent>
									<CardFooter class="flex justify-between">
										{#if collection.status === CollectionStatus.OPEN && (loggedUserPrivilige === Privilege.ADMIN_USER || classViewData.requester?.group_role === GroupRole.CASHIER)}
											<Button
												variant="destructive"
												on:click={() => handleCancelCollection(collection.id)}>Cancel
											</Button
											>
										{/if}
										<Button on:click={() => handleDetailsCollection(collection.id)}>Details</Button>
									</CardFooter>
								</Card>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="lg:col-span-1">
				<div class="space-y-6">
					<div>
						<div class="mb-4 flex items-center gap-2">
							<h2 class="text-xl font-semibold">Parents</h2>
							{#if showChangeClassGroupCashier === false && classViewData.requester?.group_role === GroupRole.CASHIER}
								<Button
									variant="default"
									class="h-auto bg-transparent p-2 text-blue-600 hover:bg-blue-600/10"
									on:click={handleChangeCashierClick}
								>
									<Replace class="h-4 w-4" />
								</Button>
							{/if}

							{#if showChangeClassGroupCashier}
								<form
									on:submit|preventDefault={handleChangeCashierSaveClick}
									class="flex w-full gap-2"
								>
									<Select.Root
										selected={{
											value: classGroupCashier?.id,
											label: `${classGroupCashier?.name ?? ''} ${classGroupCashier?.surname}`
										}}
										onSelectedChange={(v) => {
											selectedParentIdToSwitchToCashier = v?.value ?? 0;
										}}
									>
										<Select.Trigger>
											<Select.Value placeholder="Select cashier" />
										</Select.Trigger>
										<Select.Content>
											{#each classViewData.parents as parent}
												<Select.Item value={parent.id}>{parent.name} {parent.surname}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
									<Button variant="secondary" on:click={handleChangeCashierCancelClick}>
										Cancel
									</Button>
									<Button type="submit" class="mt-auto bg-green-600 text-white hover:bg-opacity-85">
										Save
									</Button>
								</form>
							{/if}
						</div>
						<div class="rounded-lg border bg-card shadow-sm">
							<div class="max-h-[calc(40vh-150px)] overflow-y-auto">
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
													Role: {groupRoleLabels.get(parent.role)}
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
						<h2 class="mb-4 text-xl font-semibold">Children</h2>
						<div class="rounded-lg border bg-card shadow-sm">
							<div class="max-h-[calc(40vh-150px)] overflow-y-auto">
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

  {#if error}
    <div class="absolute top-full mt-1">
      <Alert.Root variant="destructive">
        <CircleAlert class="h-4 w-4" />
        <Alert.Title>{error}</Alert.Title>
      </Alert.Root>
    </div>
  {/if}
</div>
