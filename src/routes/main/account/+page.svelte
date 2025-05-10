<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import {
		getUserParentProfile,
		logout,
		updateIdentity,
		updatePassword,
		updateUserParentProfile
	} from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import { getUserDetails } from '$lib/api/auth';
	import { type Identity } from '$lib/models/auth';
	import { onMount } from 'svelte';
	import type { BankAccount, BankAccountOperation } from '$lib/models/bank_account';
	import { getBankAccountOperations, getUserBankAccount } from '$lib/api/bank_account';
	import ExternalMoneyOperation from '$lib/components/custom/ExternalMoneyOperation.svelte';

	let identity: Identity = {
		username: '',
		name: '',
		surname: '',
		phone: '',
		city: '',
		street: '',
		house_number: ''
	};

	let bankAccount: BankAccount = {
		id: 0,
		account_number: '',
		is_locked: false,
		balance: 0
	};

	let bankAccountOperations: BankAccountOperation[] = [];
	let currentPage = 1;
	const itemsPerPage = 5;

	onMount(async () => {
		identity = {
			...(await getUserDetails()),
			...(await getUserParentProfile())
		};
		bankAccount = await getUserBankAccount();
		bankAccountOperations = await getBankAccountOperations(bankAccount.id);
	});

	let selectedTab: 'identity' | 'password' = 'identity';

	let oldPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	let error = '';

	var moneyDialogOpen = false;
	var operation: 'Deposit' | 'Withdraw' = 'Deposit';

	async function handleIdentitySave() {
		try {
			await updateIdentity({
				username: identity.username
			});
			await updateUserParentProfile({
				name: identity.name,
				surname: identity.surname,
				phone: identity.phone,
				city: identity.city,
				street: identity.street,
				house_number: identity.house_number
			});
		} catch (e) {
			error = (e as Error).message;
			console.error(error);
		}
	}

	async function handlePasswordSave() {
		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		try {
			await updatePassword(oldPassword, newPassword);
			await logout();
			goto('/login');
		} catch (e) {
			error = (e as Error).message;
			console.error(error);
		}
	}
	var newBalance: number | null = null;
	$: if (newBalance !== null) {
		bankAccount = { ...bankAccount, balance: newBalance };
		newBalance = null; // reset so it doesn't run again
	}
</script>

<div class="flex min-h-dvh flex-col items-center justify-center">
	<Tabs.Root bind:value={selectedTab} class="w-full max-w-screen-xl">
		<Tabs.List class="grid grid-cols-3">
			<Tabs.Trigger class="data-[state=active]:bg-primary" value="identity">Identity</Tabs.Trigger>
			<Tabs.Trigger class="data-[state=active]:bg-primary" value="password">Password</Tabs.Trigger>
			<Tabs.Trigger class="data-[state=active]:bg-primary" value="bank_account"
				>Internal Bank Account</Tabs.Trigger
			>
		</Tabs.List>
		<Tabs.Content value="identity" id="tabs-content">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title>Your identity</Card.Title>
				</Card.Header>
				<form on:submit={handleIdentitySave}>
					<Card.Content class="grid gap-2">
						<div>
							<Label for="username">Username</Label>
							<Input
								id="username"
								required
								bind:value={identity!.username}
								placeholder="Enter username"
							/>
						</div>
						<div>
							<Label for="name">Name</Label>
							<Input id="name" required bind:value={identity.name} placeholder="Enter name" />
						</div>
						<div>
							<Label for="surname">Surname</Label>
							<Input
								id="surname"
								required
								bind:value={identity.surname}
								placeholder="Enter surname"
							/>
						</div>
						<div>
							<Label for="phone">Phone</Label>
							<Input
								id="phone"
								required
								type="tel"
								bind:value={identity.phone}
								placeholder="Enter phone"
							/>
						</div>
						<div>
							<Label for="city">City</Label>
							<Input id="city" required bind:value={identity.city} placeholder="Enter city" />
						</div>
						<div>
							<Label for="street">Street</Label>
							<Input id="street" required bind:value={identity.street} placeholder="Enter street" />
						</div>
						<div>
							<Label for="house_number">House number</Label>
							<Input
								id="house_number"
								required
								bind:value={identity.house_number}
								placeholder="Enter house number"
							/>
						</div>
					</Card.Content>
					<Card.Footer>
						<Button class="ms-auto" type="submit">Save</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="password">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title>Change password</Card.Title>
				</Card.Header>
				<form on:submit={handlePasswordSave}>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="old-password">Old password</Label>
							<Input
								type="password"
								required
								id="old-password"
								bind:value={oldPassword}
								placeholder="Enter old passowrd"
							/>
						</div>
						<div class="space-y-1">
							<Label for="new-password">New password</Label>
							<Input
								type="password"
								required
								id="new-password"
								bind:value={newPassword}
								placeholder="Enter new passowrd"
							/>
						</div>
						<div class="space-y-1">
							<Label for="confirm-password">Confirm password</Label>
							<Input
								id="confirm-password"
								required
								bind:value={confirmPassword}
								type="password"
								placeholder="confirm password"
							/>
						</div>
					</Card.Content>
					<Card.Footer>
						<Button class="ms-auto" type="submit">Save</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="bank_account">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title>Internal Bank Account</Card.Title>
				</Card.Header>
				<Card.Content>
					<Card.Content>
						<div class="space-y-4">
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-gray-300">IBAN Number</span>
								<span class="font-mono text-lg text-gray-400">{bankAccount.account_number}</span>
							</div>

							<div class="flex flex-col">
								<span class="text-sm font-semibold text-gray-300">Available Money</span>
								<span class="font-mono text-lg text-gray-400">
									{bankAccount.balance?.toLocaleString(undefined, {
										style: 'currency',
										currency: 'PLN'
									})}
								</span>
							</div>
						</div>
						<div class="flex flex-wrap justify-end space-x-2 pt-4">
							<Button
								variant="outline"
								on:click={() => {
									operation = 'Withdraw';
									moneyDialogOpen = true;
								}}
								>Withdraw Money
							</Button>
							<Button
								on:click={() => {
									operation = 'Deposit';
									moneyDialogOpen = true;
								}}
								>Deposit Money
							</Button>
						</div>
					</Card.Content>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mt-4">
				<Card.Header class="text-center">
					<Card.Title>Account Operations</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="border-b text-left text-sm font-medium text-gray-500">
									<th class="pb-2 pr-2">Date</th>
									<th class="pb-2 pr-2">Title</th>
									<th class="pb-2 pr-2">Amount</th>
									<th class="pb-2 pr-2">From</th>
									<th class="pb-2">To</th>
								</tr>
							</thead>
							<tbody>
								{#each bankAccountOperations?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as operation}
									<tr class="border-b text-sm">
										<td class="py-2 pr-2"
											>{new Date(operation.operation_date).toLocaleDateString()}</td
										>
										<td class="py-2 pr-2">{operation.description}</td>
										<td
											class="py-2 pr-2 font-mono {operation.destination_account_id ===
											bankAccount.id
												? 'text-green-600'
												: 'text-red-600'}"
										>
											{operation.destination_account_id === bankAccount.id ? '+' : '-'}
											{operation.amount.toLocaleString(undefined, {
												style: 'currency',
												currency: 'PLN'
											})}
										</td>
										<td class="py-2 pr-2"
											>{operation.source_account_id === null
												? 'EXTERNAL'
												: operation.source_iban}</td
										>
										<td class="py-2"
											>{operation.destination_account_id === null
												? 'EXTERNAL'
												: operation.destination_iban}</td
										>
									</tr>
								{:else}
									<tr>
										<td colspan="5" class="py-4 text-center text-gray-500">No operations found</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="mt-4 flex items-center justify-between">
						<div class="text-sm text-gray-500">
							Showing {bankAccountOperations?.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to
							{Math.min(currentPage * itemsPerPage, bankAccountOperations?.length)} of {bankAccountOperations.length}
							entries
						</div>
						<div class="flex space-x-1">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === 1}
								on:click={() => (currentPage = Math.max(1, currentPage - 1))}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage >= Math.ceil(bankAccountOperations.length / itemsPerPage)}
								on:click={() =>
									(currentPage = Math.min(
										Math.ceil(bankAccountOperations.length / itemsPerPage),
										currentPage + 1
									))}
							>
								Next
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
	{#if error}
		<div class="mt-2">
			<Alert.Root variant="destructive">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>{error}</Alert.Title>
			</Alert.Root>
		</div>
	{/if}
</div>

{#if moneyDialogOpen}
	<ExternalMoneyOperation
		bind:open={moneyDialogOpen}
		{operation}
		onComplete={(val) => {
			newBalance = val;
			getBankAccountOperations(bankAccount.id).then((operations) => {
				bankAccountOperations = operations;
			});
		}}
	/>
{/if}
