<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { register, login } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import { appName } from '../../config';
	import type { AddParent } from '$lib/models/parent';
	import { addParent } from '../../lib/api/parent';

	let selectedTab: 'login' | 'register' = 'login';

	let username = '';
	let password = '';
	let confirmPassword = '';
	const addParentRequest: AddParent = {
		name: '',
		surname: '',
		phone: '',
		city: '',
		street: '',
		house_number: ''
	};

	let error = '';

	async function handleLogin() {
		if (!username || !password) {
			error = 'Please provide email and password';
			return;
		}

		try {
			await login(username, password);
			goto('/');
		} catch (e) {
			error = (e as Error).message;
		}
	}

	async function handleRegister() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 12) {
			error = 'Weak Password. Minimum 12 chars required!';
			return;
		}

		if (isFinite(addParentRequest.phone) === false) {
			error = 'Invalid phone number';
			return;
		}

		try {
			await register(username, password);
			await handleLogin();
			await addParent(addParentRequest);
		} catch (e) {
			error = (e as Error).message;
		}
	}
</script>

<div class="center-container">
	<div class="relative w-[400px]">
		<!-- Tabs Container -->
		<div class="mb-8">
			<!-- Add margin-bottom to create space for the Alert -->
			<Tabs.Root bind:value={selectedTab}>
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger class="data-[state=active]:bg-primary" value="login">Login</Tabs.Trigger>
					<Tabs.Trigger class="data-[state=active]:bg-primary" value="register"
						>Register</Tabs.Trigger
					>
				</Tabs.List>
				<Tabs.Content value="login" id="tabs-content">
					<Card.Root>
						<Card.Header class="text-center">
							<Card.Title>{appName}</Card.Title>
							<Card.Description>Welcome back!</Card.Description>
						</Card.Header>
						<form on:submit={handleLogin}>
							<Card.Content class="space-y-2">
								<div class="space-y-1">
									<Label for="username">Username</Label>
									<Input
										required
										id="username"
										bind:value={username}
										placeholder="Enter username"
									/>
								</div>
								<div class="space-y-1">
									<Label for="password">Password</Label>
									<Input
										id="password"
										required
										type="password"
										bind:value={password}
										placeholder="Enter password"
									/>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button class="ms-auto" type="submit">Login</Button>
							</Card.Footer>
						</form>
					</Card.Root>
				</Tabs.Content>
				<Tabs.Content value="register">
					<Card.Root>
						<Card.Header class="text-center">
							<Card.Title>{appName}</Card.Title>
							<Card.Description>Create new account</Card.Description>
						</Card.Header>
						<form on:submit={handleRegister}>
							<Card.Content class="grid gap-2">
								<div>
									<Label for="register-username">Username</Label>
									<Input
										id="register-username"
										required
										bind:value={username}
										placeholder="Enter username"
									/>
								</div>
								<div>
									<Label for="register-password">Password</Label>
									<Input
										id="register-password"
										required
										bind:value={password}
										type="password"
										placeholder="Enter password"
									/>
								</div>
								<div>
									<Label for="confirm-password">Confirm password</Label>
									<Input
										id="confirm-password"
										required
										bind:value={confirmPassword}
										type="password"
										placeholder="Confirm password"
									/>
								</div>
								<div>
									<Label for="name">Name</Label>
									<Input
										id="name"
										required
										bind:value={addParentRequest.name}
										placeholder="Enter name"
									/>
								</div>
								<div>
									<Label for="surname">Surname</Label>
									<Input
										id="surname"
										required
										bind:value={addParentRequest.surname}
										placeholder="Enter surname"
									/>
								</div>
								<div>
									<Label for="phone">Phone</Label>
									<Input
										id="phone"
										required
										type="tel"
										bind:value={addParentRequest.phone}
										placeholder="Enter phone"
									/>
								</div>
								<div>
									<Label for="city">City</Label>
									<Input
										id="city"
										required
										bind:value={addParentRequest.city}
										placeholder="Enter city"
									/>
								</div>
								<div>
									<Label for="street">Street</Label>
									<Input
										id="street"
										required
										bind:value={addParentRequest.street}
										placeholder="Enter street"
									/>
								</div>
								<div>
									<Label for="house_number">House number</Label>
									<Input
										id="house_number"
										required
										bind:value={addParentRequest.house_number}
										placeholder="Enter house number"
									/>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button class="ms-auto" type="submit">Register</Button>
							</Card.Footer>
						</form>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		</div>
		{#if error}
			<div class="absolute top-full mt-1 w-full">
				<Alert.Root variant="destructive">
					<CircleAlert class="h-4 w-4" />
					<Alert.Title>{error}</Alert.Title>
				</Alert.Root>
			</div>
		{/if}
	</div>
</div>

<style>
	.center-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh; /* Full viewport height */
		width: 100vw; /* Full viewport width */
	}
</style>
