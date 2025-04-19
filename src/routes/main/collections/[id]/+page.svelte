<script lang="ts">
  import { cn } from '$lib/utils';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';
  import { onMount } from 'svelte';
  import { getCollectionById, createCollection, updateCollection } from '$lib/api/collection';
  import type { Collection } from '$lib/models/collection';
  import { cardVariants, CollectionStatus, statusLabels, statusTextColors } from '$lib/models/collection';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { ClassGroup } from '$lib/models/class_group';
  import { getClasses } from '$lib/api/class_group';
  import type { BankAccount } from '$lib/models/bank_account';
  import { getBankAccountById } from '$lib/api/bank_account';
  import { getSessionData } from '../../../../lib/api/auth';
  import { Privilege } from '../../../../lib/models/auth';
  import { api_middleware } from '$lib/api_middleware';

  let collection: Collection = {
    id: 0,
    logo_path: '',
    name: '',
    description: '',
    start_date: new Date(),
    end_date: undefined,
    status: CollectionStatus.OPEN,
    price: 0,
    class_group_id: 0,
    bank_account_id: 0,
    owner_id: 0 // Unused. Set on backend!
  };

  let classGroups: ClassGroup[] = [];
  let collectionClassGroup : ClassGroup = {
    id: 0,
    name: '',
    description: '',
  };
  let bankAccount: BankAccount = {
    account_number: '',
    is_locked: false,
  };
  let isAdmin = false;
  let isCreateMode = false;

  // Variables for collection view mode
  let children = [];
  let documents = [];
  let requester = null;

  onMount(async () => {
    isAdmin = getSessionData().privilege === Privilege.ADMIN_USER;
    classGroups = await getClasses();

    const collectionId = parseInt(page.params.id, 10);
    isCreateMode = collectionId === 0;

    if (isCreateMode) {
      // Create mode - use existing logic
      collection.class_group_id = parseInt(page.params.id, 10);
    } else {
      // View/edit mode
      try {
        const data = await api_middleware.get(`/api/collection/collection-view/${collectionId}`);
        collection = data.collection;
        // Convert dates to Date objects
        collection.start_date = new Date(collection.start_date);
        if (collection.end_date) {
          collection.end_date = new Date(collection.end_date);
        }

        children = data.children;
        documents = data.documents;
        requester = data.requester;

        // Get additional data
        bankAccount = await getBankAccountById(collection.bank_account_id);
        collectionClassGroup = classGroups.find(c => c.id === collection.class_group_id) || collectionClassGroup;
      } catch (error) {
        console.error('Error fetching collection view:', error);
      }
    }
  });

  async function save(): Promise<void> {
    try {
      if (collection.id > 0) {
        // Update existing collection using api_middleware
        const updatedCollection = await api_middleware.put(`/collection/${collection.id}`, collection);
        collection = updatedCollection;
      } else {
        // Create new collection using api_middleware
        const newCollection = await api_middleware.post('/collection', collection);
        collection = newCollection;
        // Redirect to the newly created collection
        goto(`/main/collections/${collection.id}`);
      }

      if (isCreateMode) {
        // After save, redirect to the new collection view
        isCreateMode = false;
      } else {
        // Refresh data
        bankAccount = await getBankAccountById(collection.bank_account_id);
        collectionClassGroup = classGroups.find(c => c.id === collection.class_group_id) || collectionClassGroup;
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      // Handle error (could add an alert or error message in the UI)
    }
  }

  async function payForChild(childId: number) {
    try {
      await api_middleware.post(`/collection/pay/${collection.id}/${childId}`, {});
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error paying for child:', error);
    }
  }

  async function unsubscribeChild(childId: number) {
    try {
      await api_middleware.post(`/collection/unsubscribe/${collection.id}/${childId}`, {});
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error unsubscribing child:', error);
    }
  }

  async function restoreChild(childId: number) {
    try {
      await api_middleware.post(`/collection/restore/${collection.id}/${childId}`, {});
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error restoring child:', error);
    }
  }

  async function uploadDocument(event) {
    const fileInput = event.target;
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      // For file uploads, we need to use the fetch API directly with proper options
      // as the api_middleware is designed for JSON requests
      await api_middleware.fetch(
        `/collection/upload-document/${collection.id}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type - browser will set it with proper boundary for FormData
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );
      // Refresh the page to show updated documents
      window.location.reload();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  }

  function formatDateToYYYYMMDD(date) {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function getChildRowClass(child) {
    if (child.operation === 1) {
      return 'bg-green-100';
    } else if (child.operation === 2) {
      return 'bg-red-100';
    }
    return '';
  }

  function generateReport() {
    // Implement report generation functionality
    // We use window.open to open the report in a new tab
    // For endpoints that return files, direct access is better than using api_middleware
    window.open(`${baseApiUrl}/collection/report/${collection.id}`, '_blank');
  }
</script>

<div class="min-h-dvh">
  {#if isCreateMode}
    <!-- Create Collection View -->
    <h2 class="text-center text-4xl w-full font-bold">Create New Collection</h2>
    <form class={cardVariants.get(collection.status) + " grid grid-cols-1 md:grid-cols-1 gap-6 p-6 bg-white shadow-md rounded-lg mt-20 max-w-2xl mx-auto"} on:submit|preventDefault={save}>
      <div>
        <Label>Logo link*</Label>
        <Input required type="url" bind:value={collection.logo_path} placeholder="Enter logo URL" />
      </div>
      <div>
        <Label>Name*</Label>
        <Input required type="text" bind:value={collection.name} placeholder="Enter collection name" />
      </div>
      <div>
        <Label>Description*</Label>
        <Textarea required bind:value={collection.description} placeholder="Enter description"></Textarea>
      </div>
      <div class="flex flex-row gap-6">
        <div class="flex-1">
          <Label>Start date*</Label>
          <Input required type="date" bind:value={collection.start_date} placeholder="Enter start date" />
        </div>
        <div class="flex-1">
          <Label>End date (optional)</Label>
          <Input type="date" bind:value={collection.end_date} min={formatDateToYYYYMMDD(collection.start_date)} placeholder="Enter end date" />
        </div>
      </div>
      <div>
        <Label>Price*</Label>
        <Input required type="number" min="1" bind:value={collection.price} placeholder="Enter price"></Input>
      </div>
      <div>
        <Label>Class group*</Label>
        <Select.Root
          onSelectedChange={(v) => {
            collection.class_group_id = v?.value ?? undefined;
          }}>
          <Select.Trigger>
            <Select.Value placeholder="Select class group" />
          </Select.Trigger>
          <Select.Content>
            {#each classGroups as classGroup}
              <Select.Item value={classGroup.id}>{classGroup.name}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <Button class="ms-auto" variant="default" type="submit">Save</Button>
    </form>
  {:else}
    <!-- Collection View/Edit Mode -->
    <div class="max-w-6xl mx-auto p-6">
      <!-- Collection Details Section -->
      <div class={cardVariants.get(collection.status) + " p-6 rounded-lg shadow-md mb-8"}>
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center">
            {#if collection.logo_path}
              <img src={collection.logo_path} alt="Collection Logo" class="w-20 h-20 object-contain mr-4 rounded-md" />
            {/if}
            <div>
              <h2 class="text-3xl font-bold">{collection.name}</h2>
              <p class="text-gray-600">{collection.description}</p>
            </div>
          </div>
          <div class="flex gap-2">
            {#if isAdmin}
              <Button variant="outline" on:click={() => goto(`/main/collections/edit/${collection.id}`)}>Edit</Button>
            {/if}
            <Button variant="outline" on:click={generateReport}>Report</Button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <div class={`text-${statusTextColors.get(collection.status)} font-medium`}>
              {statusLabels.get(collection.status)}
            </div>
          </div>
          <div>
            <Label>Price</Label>
            <div>{collection.price} PLN</div>
          </div>
          <div>
            <Label>Start Date</Label>
            <div>{formatDateToYYYYMMDD(collection.start_date)}</div>
          </div>
          <div>
            <Label>End Date</Label>
            <div>{collection.end_date ? formatDateToYYYYMMDD(collection.end_date) : 'Not specified'}</div>
          </div>
          <div>
            <Label>Class Group</Label>
            <div>{collectionClassGroup.name}</div>
          </div>
          <div>
            <Label>Bank Account</Label>
            <div>{bankAccount.account_number}</div>
          </div>
        </div>
      </div>

      <!-- Children List Section -->
      <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 class="text-xl font-bold mb-4">Children</h3>

        {#if children && children.length > 0}
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
              <tr class="bg-gray-100">
                <th class="text-left p-3 border-b">Name</th>
                <th class="text-left p-3 border-b">Surname</th>
                <th class="text-left p-3 border-b">Requester</th>
                <th class="text-left p-3 border-b">Operation</th>
                <th class="text-left p-3 border-b">Operation Date</th>
                <th class="text-left p-3 border-b">Actions</th>
              </tr>
              </thead>
              <tbody>
              {#each children as child}
                <tr class={getChildRowClass(child)}>
                  <td class="p-3 border-b">{child.child_name}</td>
                  <td class="p-3 border-b">{child.child_surname}</td>
                  <td class="p-3 border-b">
                    {child.requester_name && child.requester_surname
                      ? `${child.requester_name} ${child.requester_surname}`
                      : '-'}
                  </td>
                  <td class="p-3 border-b">
                    {#if child.operation === 1}
                      Paid
                    {:else if child.operation === 2}
                      Unsubscribed
                    {:else}
                      -
                    {/if}
                  </td>
                  <td class="p-3 border-b">{child.operation_date || '-'}</td>
                  <td class="p-3 border-b">
                    {#if child.operation === null}
                      <div class="flex gap-2">
                        <Button size="sm" variant="default" on:click={() => payForChild(child.child_id)}>Pay</Button>
                        <Button size="sm" variant="outline" on:click={() => unsubscribeChild(child.child_id)}>Unsubscribe</Button>
                      </div>
                    {:else if child.operation === 2}
                      <Button size="sm" variant="default" on:click={() => restoreChild(child.child_id)}>Restore</Button>
                    {/if}
                  </td>
                </tr>
              {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p>No children found.</p>
        {/if}
      </div>

      <!-- Documents Section -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Documents</h3>
          <div class="relative">
            <input
              type="file"
              id="document-upload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              on:change={uploadDocument}
            />
            <Button variant="outline">Add Document</Button>
          </div>
        </div>

        {#if documents && documents.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {#each documents as doc}
              <div class="border rounded-lg overflow-hidden">
                <img src={doc.path} alt="Document" class="w-full h-40 object-cover" />
                <div class="p-2">
                  <p class="truncate">{doc.filename || 'Document'}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p>No documents</p>
        {/if}
      </div>
    </div>
  {/if}
</div>