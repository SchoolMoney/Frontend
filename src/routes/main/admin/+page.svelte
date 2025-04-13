<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addClass, deleteClass, getClasses, updateClass } from '$lib/api/class_group';
	import type { AddClassGroup, ClassGroup } from '$lib/models/class_group';
	import type { Parent } from '$lib/models/parent';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { CircleX, Plus, Pencil, Trash, Phone, Baby } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { getSessionData } from '$lib/api/auth';
	import { Privilege, statusLabels } from '$lib/models/auth';
	import { Input } from '$lib/components/ui/input';
	import { Confirm } from '$lib/components/custom/confirm';
	import { getParents } from '$lib/api/parent';
	import type { AddChild, Child } from '$lib/models/child';
	import { addChild, getChildren, updateChild, deleteChild } from '$lib/api/child';
	import * as Select from '$lib/components/ui/select';
	import { getUserAccountByParentId, updateUserAccountStatus } from '$lib/api/user_account';
  
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
  let isConfirmClassDialogOpen = false;
  let showAddingClass = false;

	let parents: Parent[] = [];
  let addChildRequest: AddChild = {
    name: '',
    surname: '',
    birth_date: undefined,
    parent_id: 0,
    group_id: 0,
  };
  let childToUpdate: Child & {
    parent_id: number;
  } | undefined;
  let isConfirmChildDialogOpen = false;
  let selectedChildToDelete: Child & { parent_id: number } | undefined;
	let isLoadingParents = true;

  let selectedParentToChangeStatus: Parent = undefined;

  function getClassName(class_id: number): string {
    return classes.find(c => c.id === class_id)?.name ?? '';
  }

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
      for (let i = 0; i < parents.length; i += 1) {
        const { status } = await getUserAccountByParentId(parents[i].id);
        parents[i].status = status;
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

    await fetchParents();
    for (let i = 0; i < parents.length; i += 1) {
      parents[i].children = await getChildren([parents[i].id]);
    }

    isLoadingParents = false;
	});

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
      showError();
    }
  }

  function handleAddParentChildClick({ id, surname }: Parent) {
    addChildRequest.parent_id = id;
    addChildRequest.surname = surname;
  }

  function handleCancelAddParentChildClick() {
    addChildRequest = {
      name: '',
      surname: '',
      birth_date: undefined,
      parent_id: 0,
      group_id: 0,
    };
  }

  async function handleAddParentChildSaveClick() {
    try {
      const newParentChild = await addChild(addChildRequest);
      const index = parents.findIndex(p => p.id === addChildRequest.parent_id);
      const children = [
        newParentChild,
        ...parents[index].children,
      ];
      children.push();
      parents[index].children = children;
      addChildRequest = {
        name: '',
        surname: '',
        birth_date: undefined,
        parent_id: 0,
        group_id: 0,
      };
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  function handleEditParentChildClick(child: Child, parent_id: number) {
    childToUpdate = {
      ...child,
      parent_id,
    };
  }

  function handleDeleteParentChildClick(child: Child, parent_id: number) {
    selectedChildToDelete = { ...child, parent_id };
    isConfirmChildDialogOpen = true;
  }

  function handleCancelEditParentChildClick() {
    childToUpdate = undefined;
  }

  async function handleEditParentChildSaveClick() {
    try {
      await updateChild(childToUpdate.id, {
        name: childToUpdate.name,
        surname: childToUpdate.surname,
        birth_date: childToUpdate.birth_date,
        group_id: childToUpdate.group_id,
      });

      const parentIndex = parents.findIndex(p => p.id === childToUpdate.parent_id);
      const childIndex = parents[parentIndex].children.findIndex(c => c.id === childToUpdate.id);
      parents[parentIndex].children[childIndex] = {
        ...childToUpdate
      };
      childToUpdate = undefined;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  async function confirmDeleteChild() {
    try {
      await deleteChild(selectedChildToDelete!.id);
      
      const parentIndex = parents.findIndex(p => p.id === selectedChildToDelete!.parent_id);
      parents[parentIndex].children = parents[parentIndex].children.filter(c => c.id !== selectedChildToDelete!.id);

      selectedChildToDelete = undefined;
      isConfirmChildDialogOpen = false;
    } catch (error) {
      errorMessage = error.message;
      showError();
    }
  }

  function handleEditParentStatusClick(parent: Parent) {
    selectedParentToChangeStatus = {
      ...parent
    };
  }

  function handleEditParentStatusCancelClick() {
    selectedParentToChangeStatus = undefined;
  }

  async function handleEditParentStatusSaveClick() {
    try {
      await updateUserAccountStatus(selectedParentToChangeStatus.id, selectedParentToChangeStatus.status);
      const index = parents.findIndex(p => p.id === selectedParentToChangeStatus.id);
      parents[index].status = selectedParentToChangeStatus.status;
      selectedParentToChangeStatus = undefined;
    } catch(error) {
      errorMessage = error.message;
      showError();
    }
  }

</script>

<Confirm isOpen={isConfirmClassDialogOpen} onCancel={() => isConfirmClassDialogOpen = false} onConfirm={confirmDeleteClassGroup} />
<Confirm isOpen={isConfirmChildDialogOpen} onCancel={() => isConfirmChildDialogOpen = false} onConfirm={confirmDeleteChild} />

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
          on:click={handleAddClassClick}>
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
      {:else if !classes?.length}
        <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20 col-span-2">
          No parents found.
        </div>
      {/if}

      {#each parents as parent (parent.id)}
        <Card class="transition-shadow hover:shadow-md relative">
          <CardHeader>
            <CardTitle class="flex items-center">
              <span>{parent.name} {parent.surname}</span>
              <a class="flex items-center rounded text-blue-700 bg-transparent hover:bg-primary-600" href="callto:{parent.phone}">&nbsp;{parent.phone}<Phone class="scale-50"/></a>
            </CardTitle>
            <CardDescription>
              {#if selectedParentToChangeStatus?.id === parent.id}
                <form on:submit={handleEditParentStatusSaveClick} class="flex gap-2">
                  <Select.Root
                    selected={ { value: parent.status, label: statusLabels.get(parent.status) } }
                    onSelectedChange={(v) => {
                      selectedParentToChangeStatus.status = v?.value ?? 0;
                    }}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select parent profile status" />
                    </Select.Trigger>
                    <Select.Content>
                      {#each statusLabels as [value, label]}
                        <Select.Item {value}>{label}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                  <Button
                    variant="secondary"
                    on:click={handleEditParentStatusCancelClick}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
                    Save
                  </Button>
                </form>
              {:else}
                <div class="flex">
                  <span>{statusLabels.get(parent.status)}</span>
                  <Button
                    class="bg-transparent text-green-600 hover:bg-green-600/10 p-0 h-auto ms-1"
                    on:click={() => handleEditParentStatusClick(parent)}>
                    <Pencil class="scale-50" />
                  </Button>
                </div>
              {/if}
              <div>{parent.city} {parent.street} {parent.house_number}</div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {#if addChildRequest.parent_id !== parent.id && childToUpdate?.parent_id !== parent.id}
              <span class="flex items-center">
                Children
                <Button class="ms-2 bg-transparent hover:bg-green-600/10 text-green-600 mt-auto p-0 h-auto" on:click={() => handleAddParentChildClick(parent)}>
                  <Plus class="scale-50" />
                </Button>
              </span>
              <ul class="grid gap-2 mt-2">
                {#each parent.children as child (child.id)}
                  <li class="flex align-center">
                    <Button
                      class="bg-transparent text-green-600 hover:bg-green-600/10 p-0 h-auto"
                      on:click={() => handleEditParentChildClick(child, parent.id)}>
                      <Pencil class="scale-50" />
                    </Button>
                    <Button
                      class="bg-transparent text-red-600 hover:bg-red-600/10 p-0 h-auto"
                      on:click={() => handleDeleteParentChildClick(child, parent.id)}>
                      <Trash class="scale-50" />
                    </Button>
                    <span>{child.name} {child.surname} {child.birth_date} (Class: {getClassName(child.group_id)})</span>
                  </li>
                {/each}
              </ul>
            {/if}

            {#if parent.id === addChildRequest.parent_id}
              <form on:submit={handleAddParentChildSaveClick} class="grid gap-2">
                <div class="grid gap-2 grid-cols-2 grid-rows-2">
                  <Input required bind:value={addChildRequest.name} placeholder="Enter name" />
                  <Input required bind:value={addChildRequest.surname} placeholder="Enter surname" />
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
                </div>
                <div class="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    on:click={handleCancelAddParentChildClick}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
                    Save
                  </Button>
                </div>
              </form>
            {/if}

            {#if parent.id === childToUpdate?.parent_id}
              <form on:submit={handleEditParentChildSaveClick} class="grid gap-2 mt-2">
                <div class="grid gap-2 grid-cols-2 grid-rows-2">
                  <Input required bind:value={childToUpdate.name} placeholder="Enter name" />
                  <Input required bind:value={childToUpdate.surname} placeholder="Enter surname" />
                  <Input required type="date" bind:value={childToUpdate.birth_date} placeholder="Enter birth date" />
                  <Select.Root
                    selected={ {value: childToUpdate.group_id, label: getClassName(childToUpdate.group_id) } }
                    onSelectedChange={(v) => {
                      childToUpdate.group_id = v?.value ?? 0;
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
                </div>
                <div class="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    on:click={handleCancelEditParentChildClick}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    class="bg-green-600 text-white mt-auto hover:bg-opacity-85">
                    Save
                  </Button>
                </div>
              </form>
            {/if}
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</div>