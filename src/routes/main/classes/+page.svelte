<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addClass, deleteClass, getUserClassesUsingJwt, updateClass } from '$lib/api/class_group';
	import type { AddClassGroup, ClassGroup } from '$lib/models/class_group';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX, Pencil, Plus, Trash } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Confirm } from '$lib/components/custom/confirm';

	const ERROR_DISPLAY_TIME = 10_000;

	let errorMessage = '';
	let showErrorPopup = false;
	let errorTimeout: NodeJS.Timeout;

	let classes: ClassGroup[] = [];
	let isLoading = true;
  let showAddingClass = false;
  let addClassRequest: AddClassGroup = {
    name: '',
    description: ''
  };
  let selectedClassGroupId: number = 0;
  let selectedClassGroupIdToDelete: number = 0;
  let isConfirmClassDialogOpen = false;

	async function fetchUserClasses() {
		try {
			classes = await getUserClassesUsingJwt();
			if (!classes?.length) {
				errorMessage = 'No classes found';
			}

		} catch (error) {
			if (error instanceof Error) {
				errorMessage = error.message;
				showError();
			}
		}
	}

	function showError(){
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    
    showErrorPopup = true;
		errorTimeout = setTimeout(() => {
			showErrorPopup = false;
		}, ERROR_DISPLAY_TIME);
	}

	onMount(async () => {
		await fetchUserClasses();
		isLoading = false;
	})

	function handleClassGroupDetailsClick(classId: number) {
		goto(`classes/class-view?class_group_id=${classId}`);
	}

  function handleAddClassClick() {
    showAddingClass = true;
  }

  function handleCancelAddClassClick() {
    showAddingClass = false;
  }

  async function handleAddClassGroupSaveClick() {
    try {
      await addClass(addClassRequest);
      addClassRequest = {
        name: '',
        description: '',
      };
      showAddingClass = false;
      await fetchUserClasses();
    } catch (error) {
      console.log('error', error);
      errorMessage = error.message;
      showError();
    }
  }

  function handleClassGroupEditClick(classId: number) {
    selectedClassGroupId = classId;
  }

  function handleClassGroupDeleteClick(classId: number) {
    selectedClassGroupIdToDelete = classId;
    isConfirmClassDialogOpen = true;
  }

  async function confirmDeleteClassGroup() {
    try {
      await deleteClass(selectedClassGroupIdToDelete);
      isConfirmClassDialogOpen = false;
      classes = classes.filter(c => c.id !== selectedClassGroupIdToDelete);
      selectedClassGroupIdToDelete = 0;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  async function handleClassGroupSaveClick() {
    try {
      await updateClass({
        ...classes.find(c => c.id === selectedClassGroupId)!
      });

      selectedClassGroupId = 0;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  function handleClassGroupCancelClick() {
    selectedClassGroupId = 0;
    fetchUserClasses();
  }

</script>

<Confirm isOpen={isConfirmClassDialogOpen} onCancel={() => isConfirmClassDialogOpen = false} onConfirm={confirmDeleteClassGroup} />
  
<div class="min-h-dvh">
  <h2 class="text-center text-4xl w-full font-bold">
    Classes
    <Button
      class="bg-transparent hover:bg-green-600/10 text-green-600 mt-auto"
      on:click={handleAddClassClick}>
      <Plus class="h-4 w-4" />
    </Button>
  </h2>

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
			<p>Loading class groups...</p>
		</div>
	{:else if !classes?.length}
    <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20">No class groups found.</div>
	{:else}
		<div class="w-full overflow-y-auto max-h-[calc(100vh-150px)]">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {#if showAddingClass}
          <form on:submit={handleAddClassGroupSaveClick}>
            <Card class="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>
                  <Input required bind:value={addClassRequest.name} placeholder="Set name" />
                </CardTitle>
                <CardDescription>
                  <Input bind:value={addClassRequest.description} placeholder="Set description" />
                </CardDescription>
              </CardHeader>
              <CardContent class="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  on:click={handleCancelAddClassClick}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
                  Save
                </Button>
              </CardContent>
            </Card>
          </form>
        {/if}

				{#each classes as classGroup (classGroup.id)}
						<form on:submit={handleClassGroupSaveClick}>
							<Card class="h-full transition-shadow hover:shadow-md">
								<CardHeader>
									<CardTitle>
										{#if classGroup.id === selectedClassGroupId}
											<Input required bind:value={classGroup.name} placeholder="Edit name" />
										{:else}
											{classGroup.name}
										{/if}
									</CardTitle>
									<CardDescription>
										{#if classGroup.id === selectedClassGroupId}
											<Input bind:value={classGroup.description} placeholder="Edit description" />
										{:else}
											{classGroup.description}
										{/if}
									</CardDescription>
								</CardHeader>
								<CardContent class="flex justify-between">
									{#if classGroup.id === selectedClassGroupId}
										<div class="flex justify-end gap-2 w-full">
											<Button
												variant="secondary"
												on:click={handleClassGroupCancelClick}>
												Cancel
											</Button>
											<Button
												type="submit"
												class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
												Save
											</Button>
										</div>
									{:else}
										<div>
											<Button
												class="bg-transparent text-green-600 hover:bg-green-600/10 p-2"
												on:click={() => handleClassGroupEditClick(classGroup.id)}>
												<Pencil class="scale-75" />
											</Button>
											<Button
												class="bg-transparent text-red-600 hover:bg-red-600/10 p-2"
												on:click={() => handleClassGroupDeleteClick(classGroup.id)}>
												<Trash class="scale-75" />
											</Button>
										</div>
										<Button
											on:click={() => handleClassGroupDetailsClick(classGroup.id)}>
											Details
										</Button>
									{/if}
								</CardContent>
							</Card>
						</form>
				{/each}
			</div>
		</div>
	{/if}
</div>