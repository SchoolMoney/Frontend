<script lang="ts">
	import { goto } from '$app/navigation';
	import { cardVariants, statusTextColors, CollectionStatus, type Collection, type GetCollectionsParams } from '$lib/models/collection';
	import { statusLabels } from '$lib/models/collection';
	import { getCollections } from '$lib/api/collection';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import * as Calendar from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
  import * as Select from "$lib/components/ui/select"
	import { cn } from '$lib/utils';
  import { parseToShortDate, shortDateFormatter } from '../../../config';

  let collections: Collection[] = [];

  const emptyParams: GetCollectionsParams = {
    name: '',
    start_date_from: undefined,
    start_date_to: undefined,
    end_date_from: undefined,
    end_date_to: undefined,
    status: undefined,
  };

  
  let params = { ...emptyParams };

  $: fetchCollections();

  async function fetchCollections() {
    try {
      collections = await getCollections({
        ...params,

        start_date_from: parseToShortDate(params.start_date_from),
        start_date_to: parseToShortDate(params.start_date_to),
        
        end_date_from: parseToShortDate(params.end_date_from),
        end_date_to: parseToShortDate(params.end_date_to),
      });
    } catch(e) {
      console.error(e);
    }
  }

  function handleSubmit(event: Event): void {
    event.preventDefault();
    fetchCollections();
  }

  function clearFilters(event: Event): void {
    params = { ...emptyParams };
    handleSubmit(event);
  }

  function handleDetailsClick(collection_id: number): void {
    goto(`collections/${collection_id}`);
  }
</script>

<div class="min-h-dvh">
  <h2 class="text-center text-4xl w-full font-bold">Collections</h2>
  
  <div class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 mx-auto">
    <form class="lg:col-start-2 lg:col-end-2 md:col mt-10" on:submit={handleSubmit}>
      <Card.Content class="grid gap-4 md:gap-8 lg:[repeat(3,1fr)_auto_auto] xl:grid-cols-[repeat(3,1fr)_auto_auto] lg:grid-rows-2 xl:grid-rows-2">
        <div class="lg:col-start-1 xl:col-end-2">
          <Label for="name">Name</Label>
          <Input id="name" bind:value={params.name} placeholder="Name" />
        </div>
        <div class="lg:col-start-2 xl:col-end-3">
          <Label for="start_date_from">Start date from</Label>
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                variant="outline"
                class={cn(
                  "w-full justify-start text-left font-normal",
                  !params.start_date_from && "text-muted-foreground"
                )}
                builders={[builder]}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {params.start_date_from ? parseToShortDate(params.start_date_from) : "Pick a date"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
              <Calendar.Calendar bind:value={params.start_date_from}
                                 maxValue={params.start_date_to}
              />

            </Popover.Content>
          </Popover.Root>
        </div>
        <div class="lg:col-start-3 xl:col-end-4">
          <Label for="start_date_to">Start date to</Label>
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                variant="outline"
                class={cn(
                  "w-full justify-start text-left font-normal",
                  !params.start_date_to && "text-muted-foreground"
                )}
                builders={[builder]}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {params.start_date_to ? parseToShortDate(params.start_date_to) : "Pick a date"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
              <Calendar.Calendar bind:value={params.start_date_to}
                                 minValue={params.start_date_from}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
        <Button
          variant="outline"
          class="mt-auto"
          on:click={clearFilters}>
          <CircleX></CircleX>
        </Button>
        <Button class="mt-auto" type="submit">Filter</Button>
  
        <div class="lg:col-start-1 xl:col-end-2 lg:row-start-2 xl:row-end-2">
          <Label for="status">Status</Label>
          <Select.Root
            onSelectedChange={(v) => {
              params.status = v?.value ?? 0;
            }}>
            <Select.Trigger>
              <Select.Value placeholder="Status" />
            </Select.Trigger>
            <Select.Content>
              {#each statusLabels as [value, label]}
                <Select.Item value={value}>{label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="lg:col-start-2 xl:col-end-3 lg:row-start-2 xl:row-end-2">
          <Label for="end_date_from">End date from</Label>
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                variant="outline"
                class={cn(
                  "w-full justify-start text-left font-normal",
                  !params.end_date_from && "text-muted-foreground"
                )}
                builders={[builder]}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {params.end_date_from ? parseToShortDate(params.end_date_from) : "Pick a date"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
              <Calendar.Calendar bind:value={params.end_date_from}
                                 maxValue={params.end_date_to}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
        <div class="lg:col-start-3 xl:col-end-4 lg:row-start-2 xl:row-end-2">
          <Label for="end_date_to">End date to</Label>
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                variant="outline"
                class={cn(
                  "w-full justify-start text-left font-normal",
                  !params.end_date_to && "text-muted-foreground"
                )}
                builders={[builder]}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {params.end_date_to ? parseToShortDate(params.end_date_to) : "Pick a date"}
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" align="start">
              <Calendar.Calendar bind:value={params.end_date_to}
                                 minValue={params.end_date_from}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
      </Card.Content>
    </form>
  </div>
  
  <div class="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-8 xl:grid-cols-4">
    {#if collections.length > 0}
      {#each collections as collection}
        <Card.Root class={cardVariants.get(collection.status)}>
          <Card.Header class="flex-row">
            {#if collection.logo_path}
              <img
                class="w-16 h-16 rounded"
                src={collection.logo_path}
                alt="Avatar" />
            {/if}
            <div class="flex space-y-1.5 px-6 flex-col">
              <Card.Title>{collection.name}</Card.Title>
              <Card.Description>{collection.description}</Card.Description>
            </div>
          </Card.Header>
          <Card.Content>
            <div>Starts - {collection.start_date}<div>
            {#if collection.end_date}
              <div>Ends - {collection.end_date}</div>
            {/if}
            <div>Status - <span class={statusTextColors.get(collection.status) + " font-semibold"}>{statusLabels.get(collection.status)}</span></div>
          </Card.Content>
          <Card.Footer class="flex justify-between">
            <Button class="ms-auto" on:click={() => handleDetailsClick(collection.id)}>Details</Button>
          </Card.Footer>
        </Card.Root>
      {/each}
    {:else}
      <div class="text-muted-foreground text-opacity-50 text-xl text-center col-start-4 col-end-6 mt-20">No collections found.</div>
    {/if}
  </div>
</div>
