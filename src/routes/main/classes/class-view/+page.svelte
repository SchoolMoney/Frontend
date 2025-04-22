<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { changeCashier, getClassView } from '$lib/api/class_group';
	import { decodeToken } from '$lib/api/auth';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { CircleX, Files, HandCoins, Calendar, Replace } from 'lucide-svelte';
	import { cardVariants, CollectionStatus, statusLabels } from '$lib/models/collection';
	import { goto } from '$app/navigation';
	import { GroupRole, groupRoleLabels, type ClassView } from '$lib/models/class_group';
  import { Label } from "$lib/components/ui/label";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import * as Select from "$lib/components/ui/select";
	import { Privilege } from '$lib/models/auth';
	import { Confirm } from '$lib/components/custom/confirm';
	import { cancelCollection } from '$lib/api/collection';
	import type { Parent } from '$lib/models/parent';


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
      classGroupCashier = classViewData?.parents.find(p => p.role === GroupRole.CASHIER) ?? {
        name: '',
        surname: '',
      };
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
    goToCollection(0);
	}

  function handleDetailsCollection(collection_id: number) {
    goToCollection(collection_id);
  }

  function goToCollection(collection_id: number): void {
    goto(`/main/collections/${collection_id}`);
  }

  function handleCancelCollection(collection_id: number) {
    selectedCollectionIdToCancel = collection_id;
    isConfirmDialogOpen = true;
  }

  async function confirmCancelCollection() {
    try {
      await cancelCollection(selectedCollectionIdToCancel);
      isConfirmDialogOpen = false;
      classViewData!.collections = classViewData?.collections.filter(c => c.id !== selectedCollectionIdToCancel);
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

	function handleShowReport() {
    alert('TODO');
	}

  function handleChangeCashierClick(parent_id: number) {
    showChangeClassGroupCashier = true;
  }

  function handleChangeCashierCancelClick() {
    showChangeClassGroupCashier = false;
  }

  async function handleChangeCashierSaveClick() {
    try {
      await changeCashier(classId, selectedParentIdToSwitchToCashier);

      const oldCashierIndex = classViewData?.parents.findIndex(p => p.role === GroupRole.CASHIER);
      const newCashierIndex = classViewData?.parents.findIndex(p => p.id === selectedParentIdToSwitchToCashier);

      if (oldCashierIndex !== -1) {
        classViewData!.parents[oldCashierIndex].role = GroupRole.MEMBER;
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
</script>

<Confirm isOpen={isConfirmDialogOpen} onCancel={() => isConfirmDialogOpen = false} onConfirm={confirmCancelCollection} />

<div class="min-h-dvh">
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
			<div class="lg:col-span-2">
				<div class="mb-4 flex justify-between items-center">
					<div class="flex items-center gap-4">
						<h2 class="text-xl font-semibold">Collections</h2>

						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Filter:</span>
              <RadioGroup.Root
                value={CollectionStatus.OPEN.toString()}
                onValueChange={(value) => handleStatusChange(parseInt(value ?? CollectionStatus.OPEN, 10))}
                class="flex flex-wrap gap-2">
                {#each statusLabels as [statusValue, statusLabel]}
                  <div class="flex items-center space-x-2 ms-4">
                    <RadioGroup.Item value={statusValue.toString()} id={statusValue.toString()} />
                    <Label for={statusValue.toString()}>{statusLabel}</Label>
                  </div>
                {/each}
              </RadioGroup.Root>
						</div>
					</div>

					<Button on:click={handleShowReport} class="flex items-center gap-2 ms-auto">
						<Files class="h-4 w-4" />
            Show report
					</Button>

					{#if classViewData.requester?.group_role === GroupRole.CASHIER || loggedUserPrivilige === Privilege.ADMIN_USER}
            <Button
              class="bg-green-500 text-white mt-auto hover:bg-opacity-85 ms-2 gap-2"
              on:click={handleAddCollection}>
							<HandCoins class="h-4 w-4" />
							Add collection
						</Button>
					{/if}
				</div>

				<div class="w-full overflow-y-auto max-h-[calc(100vh-250px)]">
					{#if isLoadingCollections}
						<div class="flex justify-center items-center h-32">
							<p>Loading collections...</p>
						</div>
					{:else if classViewData.collections.length === 0}
            <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20">No collections found.</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each classViewData.collections as collection (collection.id)}
								<Card class={cardVariants.get(collection.status) + "h-full transition-shadow hover:shadow-md"}>
                  <CardHeader class="flex-row">
                    {#if collection.logo_path}
                      <img
                        class="w-16 h-16 rounded"
                        src={collection.logo_path}
                        alt="Avatar" />
                    {/if}
                    <div class="flex space-y-1.5 px-6 flex-col">
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
                      <Button variant="destructive" on:click={() => handleCancelCollection(collection.id)}>Cancel</Button>
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
						<div class="mb-4 flex gap-2 items-center">
              <h2 class="text-xl font-semibold ">Parents</h2>
              {#if loggedUserPrivilige === Privilege.ADMIN_USER && showChangeClassGroupCashier === false}
                <Button
                  variant="default"
                  class="bg-transparent text-blue-600 hover:bg-blue-600/10 p-2 h-auto"
                  on:click={handleChangeCashierClick}>
                  <Replace class="h-4 w-4" />
                </Button>
              {/if}
              
              {#if showChangeClassGroupCashier}
                <form on:submit={handleChangeCashierSaveClick} class="flex gap-2 w-full">
                  <Select.Root
                    selected={ { value: classGroupCashier?.id, label: `${classGroupCashier?.name ?? ''} ${classGroupCashier?.surname}` }}
                    onSelectedChange={(v) => {
                      selectedParentIdToSwitchToCashier = v?.value ?? 0;
                    }}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select cashier" />
                    </Select.Trigger>
                    <Select.Content>
                      {#each classViewData.parents as parent}
                        <Select.Item value={parent.id}>{parent.name} {parent.surname}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                  <Button
                    variant="secondary"
                    on:click={handleChangeCashierCancelClick}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
                    Save
                  </Button>
                </form>
              {/if}
            </div>
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