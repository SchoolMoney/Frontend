<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { logout, updateIdentity, updatePassword } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import { getUserDetails } from '$lib/api/auth';
	import { type UpdateIdentity } from '$lib/models/auth';
	import { onMount } from 'svelte';


  let identity: UpdateIdentity = {
    username: '',
  };
  
	onMount(async () => {
    const userDetails = await getUserDetails();
    identity = {
      username: userDetails!.username,
    };
	});

	let selectedTab: 'identity' | 'password' = 'identity';

  let oldPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	let error = '';

	async function handleIdentitySave() {
		if (!identity!.username) {
			error = 'Please provide username';
			return;
		}

		try {
			await updateIdentity(identity);
      await logout();
      goto('/login');
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
</script>

<div class="min-h-dvh flex justify-center items-center flex-col">
  <Tabs.Root bind:value={selectedTab}>
    <Tabs.List class="grid grid-cols-2">
      <Tabs.Trigger class="data-[state=active]:bg-primary data-[state=active]:!bg-opacity-50 data-[state=active]:text-background" value="identity">Identity</Tabs.Trigger>
      <Tabs.Trigger class="data-[state=active]:bg-primary data-[state=active]:!bg-opacity-50 data-[state=active]:text-background" value="password">Password</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="identity" id="tabs-content">
      <Card.Root>
        <Card.Header class="text-center">
          <Card.Title>Your identity</Card.Title>
        </Card.Header>
        <form on:submit={handleIdentitySave}>
          <Card.Content class="space-y-2">
            <div class="space-y-1">
              <Label for="username">Username</Label>
              <Input id="username" required bind:value={identity!.username} placeholder="Enter username" />
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
              <Input type="password" required id="old-password" bind:value={oldPassword} placeholder="Enter old passowrd" />
            </div>
            <div class="space-y-1">
              <Label for="new-password">New password</Label>
              <Input type="password" required id="new-password" bind:value={newPassword} placeholder="Enter new passowrd" />
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
