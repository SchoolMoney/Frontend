<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { addClass, deleteClass, getClasses, updateClass } from '$lib/api/class_group';
	import type { AddClassGroup, ClassGroup } from '$lib/models/class_group';
  import type { Parent } from '$lib/models/parent';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { CircleX, Plus, Pencil, Trash, Phone, Baby, Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { getSessionData } from '$lib/api/auth';
  import { Privilege, privilegeLabels, statusLabels } from '$lib/models/auth';
	import { Input } from '$lib/components/ui/input';
  import { getParents } from '$lib/api/parent';
	import type { Child } from '$lib/models/child';
	import { getChildren } from '$lib/api/child';
	import * as Select from '$lib/components/ui/select';
  import { getUserAccountByParentId, updateUserAccountPrivilege, updateUserAccountStatus } from '$lib/api/user_account';

  const ERROR_DISPLAY_TIME = 3_000;

	let errorMessage = '';
	let showErrorPopup = false;
	let errorTimeout: NodeJS.Timeout;

	let classes: ClassGroup[] = [];
	let isLoadingClasses = true;

	let parents: Parent[] = [];
  let childToUpdate: Child & {
    parent_id: number;
  } | undefined;
	let isLoadingParents = true;

  let selectedParentToChangeStatus: Parent = undefined;
  let selectedParentToChangePrivilege: Parent = undefined;

  let parentSearchQuery = '';
  let classGroupSearchQuery = '';

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
        const { status, privilege } = await getUserAccountByParentId(parents[i].id);
        parents[i].status = status;
        parents[i].privilege = privilege;
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

	function handleClassGroupDetailsClick(classId: number) {
		goto(`/main/classes/class-view?class_group_id=${classId}`);
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

  async function handleEditParentPrivilegeClick(parent: Parent) {

    selectedParentToChangePrivilege = {
      ...parent,
    };
  }

  async function handleEditParentPrivilegeSaveClick() {
    try {
      await updateUserAccountPrivilege(selectedParentToChangePrivilege.id, selectedParentToChangePrivilege.privilege);
      const index = parents.findIndex(p => p.id === selectedParentToChangePrivilege.id);
      parents[index].privilege = selectedParentToChangePrivilege.privilege;
      selectedParentToChangePrivilege = undefined;
    } catch(error) {
      errorMessage = error.message;
      showError();
    }
  }

  function handleEditParentPrivilegeCancelClick() {
    selectedParentToChangePrivilege = undefined;
  }

</script>

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
		<div class="flex flex-col">
			<h2 class="text-center text-4xl font-bold mb-8">Classes</h2>

			<div class="mb-2">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id="classGroupSearchInput"
						bind:value={classGroupSearchQuery}
						placeholder="Search groups by name..."
						class="pl-10"
					/>
				</div>
			</div>

			{#if isLoadingClasses}
				<div class="flex justify-center items-center h-64">
					<p>Loading class groups...</p>
				</div>
			{:else if classes.length === 0}
				<div class="text-muted-foreground text-opacity-50 text-xl text-center mt-20">
					No class groups found.
				</div>
			{/if}

				<div class="grid grid-cols-2 gap-4 mt-10">
					{#each classes.filter(classGroup => {
						if (!classGroupSearchQuery.trim()) return true;
						const query = classGroupSearchQuery.toLowerCase().trim();
						return `${classGroup.name}`.toLowerCase().includes(query);
					}) as classGroup (classGroup.id)}
            <Card class="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{classGroup.name}</CardTitle>
                <CardDescription>{classGroup.description}</CardDescription>
              </CardHeader>
              <CardContent class="flex justify-between">
                <Button
                  on:click={() => handleClassGroupDetailsClick(classGroup.id)}>
                  Details
                </Button>
              </CardContent>
            </Card>
					{/each}
				</div>
		</div>

		<div class="flex flex-col">
			<h2 class="text-center text-4xl font-bold mb-8">Parents</h2>

			<div class="mb-2">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id="parentSearchInput"
						bind:value={parentSearchQuery}
						placeholder="Search parents by name or surname..."
						class="pl-10"
					/>
				</div>
			</div>

			{#if isLoadingParents}
				<div class="flex justify-center items-center h-64">
					<p>Loading parents...</p>
				</div>
			{:else if !parents?.length}
				<div class="text-muted-foreground text-opacity-50 text-xl text-center mt-20">
					No parents found.
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4">
					{#each parents.filter(parent => {
						if (!parentSearchQuery.trim()) return true;
						const query = parentSearchQuery.toLowerCase().trim();
						return `${parent.name} ${parent.surname}`.toLowerCase().includes(query);
					}) as parent (parent.id)}
						<Card class="h-full transition-shadow hover:shadow-md">
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

									{#if selectedParentToChangePrivilege?.id === parent.id}
										<form on:submit={handleEditParentPrivilegeSaveClick} class="flex gap-2">
											<Select.Root
												selected={ { value: parent.privilege, label: privilegeLabels.get(parent.privilege) } }
												onSelectedChange={(v) => {
                          selectedParentToChangePrivilege.privilege = v?.value ?? 1;
                        }}>
												<Select.Trigger>
													<Select.Value placeholder="Select parent profile status" />
												</Select.Trigger>
												<Select.Content>
													{#each privilegeLabels as [value, label]}
														<Select.Item {value}>{label}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>
											<Button
												variant="secondary"
												on:click={handleEditParentPrivilegeCancelClick}>
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
											<span>{privilegeLabels.get(parent.privilege)}</span>
											<Button
												class="bg-transparent text-green-600 hover:bg-green-600/10 p-0 h-auto ms-1"
												on:click={() => handleEditParentPrivilegeClick(parent)}>
												<Pencil class="scale-50" />
											</Button>
										</div>
									{/if}

									<div>{parent.city} {parent.street} {parent.house_number}</div>
								</CardDescription>
							</CardHeader>
							<CardContent>
                <span class="flex items-center">Children</span>
                <ul class="grid gap-2 mt-2">
                  {#each parent.children as child (child.id)}
                    <li class="flex align-center">
                      <span>{child.name} {child.surname} {child.birth_date} (Class: {getClassName(child.group_id)})</span>
                    </li>
                  {/each}
                </ul>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>