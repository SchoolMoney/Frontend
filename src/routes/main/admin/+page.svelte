<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addClass, deleteClass, getClasses, updateClass } from '$lib/api/class_group';
	import type { AddClassGroup, ClassGroup } from '$lib/models/class_group';
	import type { AddParent, Parent } from '$lib/models/parent';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX, Plus, Pencil, Trash, Phone } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { getSessionData } from '$lib/api/auth';
	import { Privilege } from '$lib/models/auth';
	import { Input } from '$lib/components/ui/input';
	import { Confirm } from '$lib/components/custom/confirm';
	import { addParent, getParents } from '../../../lib/api/parent';
  
  const ERROR_DISPLAY_TIME = 3_000;

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
  let showAddingClass = false;

	let parents: Parent[] = [];
  let addParentRequest: AddParent = {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
  };
	let isLoadingParents = true;

	async function fetchClasses() {
		try {
			classes = await getClasses();
		} catch (error) {
      errorMessage = error.message;
      showError();
		}
	}

async function fetchParents() {
  try {
    parents = await getParents();
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

    await fetchParents();
    isLoadingParents = false;
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

  function handleClassGroupCancelClick() {
    selectedClassGroupId = 0;
  }

	function handleClassGroupDetailsClick(classId: number) {
		goto(`/main/classes/class-view?class_group_id=${classId}`);
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
          class="bg-transparent hover:bg-green-600/10 text-green-600 mt-auto"
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
    <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <h2 class="text-center text-4xl w-full font-bold col-span-2">Parents</h2>
  
      {#if isLoadingParents}
        <div class="flex justify-center items-center h-64 col-span-2">
          <p>Loading parents...</p>
        </div>
      {:else if classes.length === 0}
        <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20 col-span-2">
          No parents found.
        </div>
      {/if}

      {#each parents as parent (parent.id)}
        <Card class="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>{parent.name} {parent.surname} ({parent.phone})</CardTitle>
            <CardDescription>{parent.city} {parent.street} {parent.house_number}</CardDescription>
          </CardHeader>
          <CardContent class="flex justify-between">
            TODO: Listing children
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</div>