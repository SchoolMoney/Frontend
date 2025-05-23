<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import PanelLeft from 'lucide-svelte/icons/panel-left';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import School from 'lucide-svelte/icons/school';
	import Baby from 'lucide-svelte/icons/baby';
	import Files from 'lucide-svelte/icons/files';
	import MessageCircle from 'lucide-svelte/icons/message-circle';
	import ShieldUser from 'lucide-svelte/icons/shield-user';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { logout, getSessionData } from '$lib/api/auth';
	import { Privilege } from '$lib/models/auth';
	import { goto } from '$app/navigation';

	let isAdmin: boolean = false;

	onMount(() => {
		isAdmin = getSessionData().privilege === Privilege.ADMIN_USER;
	});

	const activeTabClasses: string =
		'group bg-primary text-lg font-semibold text-primary-foreground md:text-base gap-2 hover:!text-background hover:bg-opacity-75 hover:text-opacity-75';
</script>

<div class="flex w-full flex-col bg-muted/50">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<a
				href="/main"
				class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
			>
				<img src="/logo.jpg" width={36} height={36} alt="Logo" />
			</a>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/main/collections"
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
							'collections'
						)
							? activeTabClasses
							: ''}"
						use:builder.action
						{...builder}
					>
						<HandCoins class="h-5 w-5" />
						<span class="sr-only">Collections</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Collections</Tooltip.Content>
			</Tooltip.Root>
			{#if isAdmin === false}
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<a
							href="/main/classes"
							class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
								'classes'
							)
								? activeTabClasses
								: ''}"
							use:builder.action
							{...builder}
						>
							<School class="h-5 w-5" />
							<span class="sr-only">Classes</span>
						</a>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Classes</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<a
							href="/main/children"
							class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
								'children'
							)
								? activeTabClasses
								: ''}"
							use:builder.action
							{...builder}
						>
							<Baby class="h-5 w-5" />
							<span class="sr-only">Children</span>
						</a>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Children</Tooltip.Content>
				</Tooltip.Root>
			{/if}
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/main/reports"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
							'reports'
						)
							? activeTabClasses
							: ''}"
						use:builder.action
						{...builder}
					>
						<Files class="h-5 w-5" />
						<span class="sr-only">Reports</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Reports</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/main/chat"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
							'chat'
						)
							? activeTabClasses
							: ''}"
						use:builder.action
						{...builder}
					>
						<MessageCircle class="h-5 w-5" />
						<span class="sr-only">Chat</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Chat</Tooltip.Content>
			</Tooltip.Root>
		</nav>
		{#if isAdmin}
			<nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<a
							href="/main/admin"
							class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {page.url.pathname.includes(
								'admin'
							)
								? activeTabClasses
								: ''}"
							use:builder.action
							{...builder}
						>
							<ShieldUser class="h-5 w-5" />
							<span class="sr-only">Admin panel</span>
						</a>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Admin panel</Tooltip.Content>
				</Tooltip.Root>
			</nav>
		{/if}
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<header
			class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="/main/collections"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
								'collections'
							)
								? activeTabClasses
								: ''}"
						>
							<HandCoins class="h-5 w-5" />
							Collections
						</a>
						{#if isAdmin === false}
							<a
								href="/main/classes"
								class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
									'classes'
								)
									? activeTabClasses
									: ''}"
							>
								<School class="h-5 w-5" />
								Classes
							</a>
							<a
								href="/main/children"
								class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
									'children'
								)
									? activeTabClasses
									: ''}"
							>
								<Baby class="h-5 w-5" />
								Children
							</a>
						{/if}
						<a
							href="/main/reports"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
								'reports'
							)
								? activeTabClasses
								: ''}"
						>
							<Files class="h-5 w-5" />
							Reports
						</a>
						<a
							href="/main/chat"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
								'chat'
							)
								? activeTabClasses
								: ''}"
						>
							<MessageCircle class="h-5 w-5" />
							Chat
						</a>
						{#if isAdmin}
							<a
								href="/main/admin"
								class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {page.url.pathname.includes(
									'admin'
								)
									? activeTabClasses
									: ''}"
							>
								<ShieldUser class="h-5 w-5" />
								Admin panel
							</a>
						{/if}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<div class="relative ml-auto flex-1 md:grow-0"></div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						variant="outline"
						size="icon"
						class="overflow-hidden rounded-full {page.url.pathname.includes('account')
							? 'border-2 border-primary'
							: ''}"
						builders={[builder]}
					>
						<img src="/logo.jpg" width={36} height={36} alt="Avatar" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item
						on:click={() => {
							goto('/main/account');
						}}>Account</DropdownMenu.Item
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						on:click={() => {
							logout();
							goto('/login');
						}}>Logout</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main class="p-4 sm:px-6 sm:py-0">
			<slot></slot>
		</main>
	</div>
</div>
