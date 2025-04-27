<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX, Pencil, Plus, Trash } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import type { AddChild, Child, UpdateChild } from '$lib/models/child';
	import { addChild, deleteChild, getUserChildren, updateChild } from '$lib/api/child';
	import type { ClassGroup } from '$lib/models/class_group';
	import { Confirm } from '$lib/components/custom/confirm';
	import { Input } from '$lib/components/ui/input';
	import  * as Select from '$lib/components/ui/select';
	import { getClasses } from '$lib/api/class_group';

	const ERROR_DISPLAY_TIME = 10_000;

	let errorMsg = '';
	let showErrorPopup = false;
	let errorTimeout: NodeJS.Timeout;

	let children: Child[] = [];
  let classes: ClassGroup[] = [];
	let isLoading = true;
  let showAddingChild = false;
  let addChildRequest: AddChild = {
    name: '',
    surname: '',
    birth_date: '',
    group_id: 0,
  };

  let selectedChildId = 0;
  let selectedChildIdToDelete = 0;

  let isConfirmChildDialogOpen = false;

	async function fetchUserChildren() {
		try {
			children = await getUserChildren();
			if (!children?.length) {
				errorMsg = 'No children found';
			}
		} catch (error) {
      errorMsg = error.message;
      showError();
		}
	}

async function fetchClasses() {
  try {
    classes = await getClasses();
  } catch (error) {
    errorMsg = error.message;
    showError();
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

	function handleClassDetailsClick(class_id: number) {
		goto(`classes/class-view?class_group_id=${class_id}`);
	}

  function getClassName(class_id: number): string {
    return classes.find(c => c.id === class_id)?.name ?? '' ;
  }

  function handleAddChildClick() {
    showAddingChild = true;
  }

  function handleCancelAddChildClick() {
    showAddingChild = false;
  }

  async function handleAddChildSaveClick() {
    try {
      await addChild(addChildRequest);
      addChildRequest = {
        name: '',
        surname: '',
        birth_date: '',
        group_id: 0,
      };
      showAddingChild = false;
      await fetchUserChildren();
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }


  async function confirmDeleteChild() {
    try {
      await deleteChild(selectedChildIdToDelete);
      isConfirmChildDialogOpen = false;
      children = children.filter(c => c.id !== selectedChildIdToDelete);
      selectedChildIdToDelete = 0;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  async function handleChildSaveClick() {
    try {
      const { name, surname, birth_date, group_id } = children.find(c => c.id === selectedChildId)!;
      const childUpdateRequest: UpdateChild = {
        name, surname, birth_date, group_id
      }
      await updateChild(selectedChildId, childUpdateRequest);

      selectedChildId = 0;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  function handleChildDeleteClick(child_id: number) {
    selectedChildIdToDelete = child_id;
    isConfirmChildDialogOpen = true;
  }

  function handleChildEditClick(child_id: number) {
    selectedChildId = child_id;
  }

  function handleChildEditCancelClick() {
    selectedChildId = 0;
    fetchUserChildren();
  }

</script>

<Confirm isOpen={isConfirmChildDialogOpen} onCancel={() => isConfirmChildDialogOpen = false} onConfirm={confirmDeleteChild} />

<div class="min-h-dvh">
  <h2 class="text-center text-4xl w-full font-bold">
    Children
    <Button
      class="bg-transparent hover:bg-green-600/10 text-green-600 mt-auto"
      on:click={handleAddChildClick}>
      <Plus class="h-4 w-4" />
    </Button>
  </h2>

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
        {#if showAddingChild}
          <form on:submit={handleAddChildSaveClick} class="grid gap-2">
            <Card class="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input required bind:value={addChildRequest.name} placeholder="Enter name" />
                  <Input required bind:value={addChildRequest.surname} placeholder="Enter surname" />
                </CardTitle>
                <CardDescription class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input required type="date" bind:value={addChildRequest.birth_date} placeholder="Enter birth date" />
                  <Select.Root
                    onSelectedChange={(v) => {
                      addChildRequest.group_id = v?.value ?? 0;
                    }}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select class group" />
                    </Select.Trigger>
                    <Select.Content>
                      {#each classes as classGroup}
                        <Select.Item value={classGroup.id}>{classGroup.name}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                </CardDescription>
              </CardHeader>
              <CardContent class="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  on:click={handleCancelAddChildClick}>
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
				{#each children as child (child.id)}
          <form on:submit={handleChildSaveClick}>
            <Card class="h-full transition-shadow hover:shadow-md">
              {#if child.id === selectedChildId}
                <CardHeader>
                  <CardTitle class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input required bind:value={child.name} placeholder="Enter name" />
                    <Input required bind:value={child.surname} placeholder="Enter surname" />
                  </CardTitle>
                  <CardDescription class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input required type="date" bind:value={child.birth_date} placeholder="Enter birth date" />
                    <Select.Root
                      selected={ { value: child.group_id, label: getClassName(child.group_id) }}
                      onSelectedChange={(v) => {
                        child.group_id = v?.value ?? 0;
                      }}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select class group" />
                      </Select.Trigger>
                      <Select.Content>
                        {#each classes as classGroup}
                          <Select.Item value={classGroup.id}>{classGroup.name}</Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  </CardDescription>
                </CardHeader>
              {:else}
                <CardHeader>
                  <CardTitle>{child.name} {child.surname}</CardTitle>
                  <CardDescription>Birth date: {child.birth_date}<br/>Child: {getClassName(child.group_id)}</CardDescription>
                </CardHeader>
              {/if}
              <CardContent class="flex justify-between">
                {#if child.id === selectedChildId}
                  <div class="flex justify-end gap-2 w-full">
                    <Button
                      variant="secondary"
                      on:click={handleChildEditCancelClick}>
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
                      on:click={() => handleChildEditClick(child.id)}>
                      <Pencil class="scale-75" />
                    </Button>
                    <Button
                      class="bg-transparent text-red-600 hover:bg-red-600/10 p-2"
                      on:click={() => handleChildDeleteClick(child.id)}>
                      <Trash class="scale-75" />
                    </Button>
                  </div>
                  <Button
                    on:click={() => handleClassDetailsClick(child.group_id)}>
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