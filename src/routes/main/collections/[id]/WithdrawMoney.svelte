<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button';
	import { api_middleware } from '$lib/api_middleware';
	import * as Alert from '$lib/components/ui/alert';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	export let open = false;
	export let operation: 'Deposit' | 'Withdraw' = 'Withdraw';
	export let bankAccountId: number;
	export let availableMoney: number;
	export let onComplete: (processedAmount: number) => void = () => {};

	var error = '';
	var amount: number = 0;
	var iban: string = '';

	$: internalAccountChecked = false;

	async function handleSubmit() {
		if (operation === 'Withdraw' && !iban && !internalAccountChecked) {
			error = 'Please provide IBAN number';
			return;
		}
		if (amount <= 0) {
			error = 'Please provide a valid amount';
			return;
		}
		if (amount > availableMoney && operation === 'Withdraw') {
			error = 'You cannot withdraw more than available funds';
			return;
		}
		try {
			if (operation === 'Withdraw' && !internalAccountChecked) {
				const url = `/api/bank_account/${bankAccountId}/collection/withdraw`;
				const body = {
					amount: amount,
					account_number: iban
				};
				await api_middleware.post(url, body);
				onComplete(amount * -1);
			} else if (operation === 'Withdraw' && internalAccountChecked) {
				const url = `/api/bank_account/${bankAccountId}/collection/withdraw?use_personal_account=true`;
				const body = {
					amount: amount
				};
				await api_middleware.post(url, body);
				onComplete(amount * -1);
			} else if (operation === 'Deposit') {
				const url = `/api/bank_account/${bankAccountId}/collection/deposit`;
				const body = {
					amount: amount
				};
				await api_middleware.post(url, body);
				onComplete(amount);
			}

			open = false;
		} catch (e) {
			error = (e as Error).message;
			console.error('Error during operation:', e);
		}
	}
</script>

<div class="center-container">
	<Dialog.Root bind:open>
		<Dialog.Content class="sm:max-w-[600px]">
			<Tabs.Root bind:value={operation} class="mt-6 w-full max-w-screen-xl">
				<Tabs.List class="grid grid-cols-2">
					<Tabs.Trigger class="data-[state=active]:bg-primary" value="Withdraw"
						>Withdraw</Tabs.Trigger
					>
					<Tabs.Trigger class="data-[state=active]:bg-primary" value="Deposit">Deposit</Tabs.Trigger
					>
				</Tabs.List>
			</Tabs.Root>
			<div class="flex items-center gap-2">
				<p class="text-sm text-xl font-medium">Collection's account balance:</p>
				<p class="font-mono text-sm text-xl font-medium">
					{availableMoney.toLocaleString(undefined, {
						style: 'currency',
						currency: 'PLN'
					})}
				</p>
			</div>
			{#if operation === 'Withdraw'}
				<div class="flex items-center space-x-2">
					<Checkbox id="use_internal_account" bind:checked={internalAccountChecked} />
					<Label for="use_internal_account">Use internal bank account</Label>
				</div>
			{/if}
			<form class="grid items-start gap-4" on:submit={handleSubmit}>
				<div class="grid gap-2">
					<Label for="amount">Money amount to {operation.toLowerCase()}</Label>
					<Input type="text" id="amount" bind:value={amount} placeholder="Specify money amount" />
				</div>
				{#if operation === 'Withdraw' && !internalAccountChecked}
					<div class="grid gap-2">
						<Label for="account">Destination account IBAN number</Label>
						<Input id="account" bind:value={iban} />
					</div>
				{/if}
				<Button type="submit">{operation} Money</Button>
			</form>

			{#if error}
				<div class="absolute top-full mt-1 w-full">
					<Alert.Root variant="destructive">
						<CircleAlert class="h-4 w-4" />
						<Alert.Title>{error}</Alert.Title>
					</Alert.Root>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
