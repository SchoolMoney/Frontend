<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addClass, deleteClass, getClasses, updateClass } from '$lib/api/class_group';
	import type { AddClassGroup, ClassGroup } from '$lib/models/class_group';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { getSessionData } from '$lib/api/auth';
	import { Privilege } from '$lib/models/auth';
	import { Input } from '$lib/components/ui/input';
	import { Confirm } from '$lib/components/custom/confirm';


	let errorMessage = '';
	let showErrorPopup = false;
	let errorTimeout: NodeJS.Timeout;

	let classes: ClassGroup[] = [];
  let selectedClassGroupId: number = 0;
  let selectedClassGroupIdToDelete: number = 0;
  let addClassRequest: AddClassGroup = {
    name: '',
    description: ''
  };
	let isLoadingClasses = true;
  let isConfirmDialogOpen = false;
	let isLoadingParents = true;
  let showAddingClass = false;
	const ERROR_DISPLAY_TIME = 3_000;

	async function fetchClasses() {
		try {
			classes = await getClasses();
			if (classes.length == 0) {
				errorMessage = 'No classes found';
			}
		} catch (error) {
      errorMessage = error.message;
      showError();
		}
	}

	function showError() {
    showErrorPopup = true;
		if (errorTimeout) {
      clearTimeout(errorTimeout)
    };

		errorTimeout = setTimeout(() => {
      showErrorPopup = false;
		}, ERROR_DISPLAY_TIME);
	}

	onMount(async () => {
		const session = getSessionData();
		if (session?.privilege !== Privilege.ADMIN_USER) {
			goto('/collections');
      return;
		}

		await fetchClasses();
		isLoadingClasses = false;
	});

  function handleClassGroupEditClick(classId: number) {
    selectedClassGroupId = classId;
  }

  function handleClassGroupDeleteClick(classId: number) {
    selectedClassGroupIdToDelete = classId;
    isConfirmDialogOpen = true;
  }

  async function confirmDeleteClassGroup() {
    try {
      await deleteClass(selectedClassGroupIdToDelete);
      isConfirmDialogOpen = false;
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

	function handleClassGroupDetailsClick(classId: number) {
		goto(`/main/classes/class-view?class_group_id=${classId}`);
	}

  function handleAddClassClick() {
    showAddingClass = true;
  }

  async function handleClassGroupAddClick() {
    try {
      await addClass(addClassRequest);
      addClassRequest = {
        name: '',
        description: '',
      };
      showAddingClass = false;
      await fetchClasses();
    } catch (error) {
      errorMessage = error.message;
      showErrorPopup = true;
      showError();
    }
  }

</script>

<Confirm isOpen={isConfirmDialogOpen} onCancel={() => isConfirmDialogOpen = false} onConfirm={confirmDeleteClassGroup} />

<div class="min-h-dvh">

	{#if showErrorPopup}
		<div class="fixed top-4 mx-auto z-50 max-w-md" transition:fly={{ y: -30, duration: 300 }}>
			<Alert variant="destructive">
				<CircleX class="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		</div>
	{/if}

  <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-8 p-4">
    <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <h2 class="text-center text-4xl w-full font-bold col-span-2">
        Classes
        <Button
          class="bg-green-500 text-white mt-auto hover:bg-opacity-85"
          on:click={() => handleAddClassClick()}>
          <Plus class="h-4 w-4" />
        </Button>
      </h2>
  
      {#if isLoadingClasses}
        <div class="flex justify-center items-center h-64 col-span-2">
          <p>Loading class groups...</p>
        </div>
      {:else if classes.length === 0}
        <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20 col-span-2">
          No class groups found.
        </div>
      {/if}

      {#if showAddingClass}
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>
              <Input bind:value={addClassRequest.name} placeholder="Set name" />
            </CardTitle>
            <CardDescription>
              <Input bind:value={addClassRequest.description} placeholder="Set description" />
            </CardDescription>
          </CardHeader>
          <CardContent class="flex justify-end">
            <Button
              class="bg-green-500 text-white mt-auto hover:bg-opacity-85"
              on:click={() => handleClassGroupAddClick()}>
              Save
            </Button>
          </CardContent>
        </Card>
      {/if}

      {#each classes as classGroup (classGroup.id)}
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>
              {#if classGroup.id === selectedClassGroupId}
                <Input bind:value={classGroup.name} placeholder="Edit name" />
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
              <Button
                class="bg-green-500 text-white mt-auto hover:bg-opacity-85"
                on:click={() => handleClassGroupSaveClick()}>
                Save
              </Button>
            {:else}
              <div>
                <Button
                  class="bg-green-500 text-white mt-auto hover:bg-opacity-85"
                  on:click={() => handleClassGroupEditClick(classGroup.id)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  on:click={() => handleClassGroupDeleteClick(classGroup.id)}>
                  Delete
                </Button>
              </div>
            {/if}
            <Button
              on:click={() => handleClassGroupDetailsClick(classGroup.id)}>
              Details
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>
    <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <h2 class="text-center text-4xl w-full font-bold col-span-2">Parents</h2>
  
      {#if isLoadingClasses}
        <div class="flex justify-center items-center h-64 col-span-2">
          <p>Loading parents...</p>
        </div>
      {:else if classes.length === 0}
        <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20 col-span-2">
          No parents found.
        </div>
      {/if}

      {#each classes as classGroup (classGroup.id)}
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>{classGroup.name}</CardTitle>
            <CardDescription>{classGroup.description}</CardDescription>
          </CardHeader>
          <CardContent class="flex justify-between">
            <Button
              class="bg-green-500 text-white mt-auto hover:bg-opacity-85"
              on:click={() => handleClassGroupEditClick(classGroup.id)}>
              Edit
            </Button>
            <Button
              on:click={() => handleClassGroupDetailsClick(classGroup.id)}>
              Details
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</div>