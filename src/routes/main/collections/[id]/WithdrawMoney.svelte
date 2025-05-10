<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button';
	import { api_middleware } from '$lib/api_middleware';
	import * as Alert from '$lib/components/ui/alert';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';

	export let open = false;
	export let operation: 'Deposit' | 'Withdraw' = 'Deposit';
	export let bankAccountId: number;
	export let availableMoney: number;
	export let onComplete: (withdrawnMoney: number) => void = () => {};


	var error = '';
	var amount: number = 0;
	var iban: string = '';


	async function handleSubmit() {
		if (operation === 'Withdraw' && !iban) {
			error = 'Please provide IBAN number';
			return;
		}
		if (amount <= 0) {
			error = 'Please provide a valid amount';
			return;
		}
		if (amount > availableMoney) {
			error = 'You cannot withdraw more than available funds';
			return;
		}
		try {
			if (operation === 'Withdraw') {
				const url = `/api/bank_account/${bankAccountId}/collection/withdraw`;
				const body = {
					amount: amount,
					account_number: iban
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
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{operation} Money</Dialog.Title>
				<Dialog.Description>Collection's available funds: {availableMoney} PLN</Dialog.Description>
			</Dialog.Header>
			<form class="grid items-start gap-4" on:submit={handleSubmit}>
				<div class="grid gap-2">
					<Label for="amount">Money amount to {operation.toLowerCase()}</Label>
					<Input type="text" id="amount" bind:value={amount} placeholder="Specify money amount" />
				</div>
				{#if operation === 'Withdraw'}
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
