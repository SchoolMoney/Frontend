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

	let selectedTab: 'login' | 'register' = 'login';

	let username = '';
	let password = '';
	let confirmPassword = '';

	let error = '';

	async function handleLogin() {
		console.log(error);
		if (!username || !password) {
			error = 'Please provide email and password';
			return;
		}

		try {
			await login(username, password);
			goto('/');
		} catch (e) {
			error = (e as Error).message;
			console.log(error);
		}
	}

	async function handleRegister() {
		if (!username || !password || !confirmPassword) {
			error = 'Please provide all fields';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		try {
			await register(username, password);
			handleLogin();
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
					<Tabs.Trigger value="login">Login</Tabs.Trigger>
					<Tabs.Trigger value="register">Register</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="login" id="tabs-content">
					<Card.Root>
						<Card.Header>
							<Card.Title>Login</Card.Title>
							<Card.Description>Provide your credentials below and click Login.</Card.Description>
						</Card.Header>
						<form on:submit={handleLogin}>
							<Card.Content class="space-y-2">
								<div class="space-y-1">
									<Label for="username">Username</Label>
									<Input id="username" bind:value={username} placeholder="username" />
								</div>
								<div class="space-y-1">
									<Label for="password">Password</Label>
									<Input
										id="password"
										type="password"
										bind:value={password}
										placeholder="password"
									/>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit">Login</Button>
							</Card.Footer>
						</form>
					</Card.Root>
				</Tabs.Content>
				<Tabs.Content value="register">
					<Card.Root>
						<Card.Header>
							<Card.Title>Create new account</Card.Title>
							<Card.Description>
								If you do not have an account yet, please provide your username, password below and
								click Register.
							</Card.Description>
						</Card.Header>
						<form on:submit={handleRegister}>
							<Card.Content class="space-y-2">
								<div class="space-y-1">
									<Label for="register-username">username</Label>
									<Input id="register-username" bind:value={username} placeholder="username" />
								</div>
								<div class="space-y-1">
									<Label for="register-password">Password</Label>
									<Input
										id="register-password"
										bind:value={password}
										type="password"
										placeholder="password"
									/>
								</div>
								<div class="space-y-1">
									<Label for="confirm-password">confirm password</Label>
									<Input
										id="confirm-password"
										bind:value={confirmPassword}
										type="password"
										placeholder="confirm password"
									/>
								</div>
							</Card.Content>
							<Card.Footer>
								<Button type="submit">Register</Button>
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
