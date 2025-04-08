<script lang="ts">
	import { cn } from '$lib/utils';
  import type { DateValue } from '@internationalized/date';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import * as Calendar from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
  import * as Select from '$lib/components/ui/select';
  import { onMount } from 'svelte';
  import { getCollectionById, createCollection } from '$lib/api/collection';
	import type { Collection } from '$lib/models/collection';
	import { Status, statusLabels } from '$lib/models/collection';
	import { page } from '$app/state';
	import type { ClassGroup } from '$lib/models/class_group';
	import { getClasses } from '$lib/api/class_group';
	import type { BankAccount } from '$lib/models/bank_account';
	import { getBankAccountById } from '$lib/api/bank_account';

  let collection: Collection = {
    id: 0,
    logo_path: '',
    name: '',
    description: '',
    start_date: new Date(),
    end_date: undefined,
    status: Status.OPEN,
    price: 0,
    class_group_id: 0,
    bank_account_id: 0,
    owner_id: 0 // Unused. Set on backend!
  };

  let classGroups: ClassGroup[] = [];
  let bankAccount: BankAccount;

  onMount(async () => {
    classGroups = await getClasses();
    
    collection.id = parseInt(page.params.id, 10);
    if (collection.id > 0) {
      collection = await getCollectionById(collection.id);
      bankAccount = await getBankAccountById(collection.bank_account_id);
    }
  });

  async function save(): Promise<void> {
    collection = await createCollection(collection);
    bankAccount = await getBankAccountById(collection.bank_account_id);
  }
</script>

<div class="min-h-dvh">
  <h2 class="text-center text-4xl w-full font-bold">Collection {#if collection.id > 0} {collection.name} - {statusLabels.get(collection.status)} {/if}</h2>
  <form class={cn(
      "grid grid-cols-1 md:grid-cols-1 gap-6 p-6 bg-white shadow-md rounded-lg mt-20",
      !collection.id && "max-w-2xl mx-auto"
    )} on:submit={save}>
    <div>
      <Label>Logo link*</Label>
      <Input required type="text" bind:value={collection.logo_path} placeholder="Enter logo URL" />
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
        <Input type="date" bind:value={collection.end_date} placeholder="Enter end date" />
      </div>
    </div>
    <div>
      <Label>Price*</Label>
      <Input required type="number" min="1" bind:value={collection.price} placeholder="Enter price"></Input>
    </div>
    {#if collection.id > 0}
      <div>
        <Label>Bank account</Label>
        <Input disabled bind:value={bankAccount.account_number}></Input>
      </div>
    {/if}
    <div>
      <Label>Class group*</Label>
      <Select.Root
        disabled={collection.id > 0}
        onSelectedChange={(v) => {
          collection.class_group_id = v?.value as number ?? undefined;
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
</div>
