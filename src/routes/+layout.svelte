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
	import { logout,getSessionData, Privilege } from '$lib/api/auth';
	import { goto } from '$app/navigation';

  let isAdmin: boolean = false;
  
  onMount(() => {
    isAdmin = getSessionData().privilege === Privilege.ADMIN_USER;
  });

  const activeTabClasses: string = 'group bg-primary text-lg font-semibold text-primary-foreground md:text-base gap-2 hover:text-background hover:text-opacity-75';
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="collections"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/collections') ? activeTabClasses : ''}"
						use:builder.action
						{...builder}
					>
						<HandCoins class="h-5 w-5" />
						<span class="sr-only">Collections</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Collections</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="classes"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/classes') ? activeTabClasses : ''}"
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
						href="children"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/children') ? activeTabClasses : ''}"
						use:builder.action
						{...builder}
					>
						<Baby class="h-5 w-5" />
						<span class="sr-only">Children</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Children</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="reports"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/reports') ? activeTabClasses : ''}"
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
						href="chat"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/chat') ? activeTabClasses : ''}"
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
						href="admin"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 {(page.url.pathname === '/admin') ? activeTabClasses : ''}"
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
							href="collections"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/collections') ? activeTabClasses : ''}"
						>
							<HandCoins class="h-5 w-5" />
							Collections
						</a>
						<a
							href="classes"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/classes') ? activeTabClasses : ''}"
						>
							<School class="h-5 w-5" />
							Classes
						</a>
						<a
							href="children"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/children') ? activeTabClasses : ''}"
						>
							<Baby class="h-5 w-5" />
							Children
						</a>
						<a
							href="reports"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/reports') ? activeTabClasses : ''}"
						>
              <Files class="h-5 w-5" />
							Reports
						</a>
						<a
							href="chat"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/chat') ? activeTabClasses : ''}"
						>
              <MessageCircle class="h-5 w-5" />
							Chat
						</a>
            {#if isAdmin}
              <a
                href="admin"
                class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground {(page.url.pathname === '/admin') ? activeTabClasses : ''}"
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
						class="overflow-hidden rounded-full"
						builders={[builder]}
					>
						<img
							src="/src/images/logo.png"
							width={36}
							height={36}
							alt="Avatar"
							class="overflow-hidden rounded-full"
						/>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Support</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item on:click={()=>{logout(); goto('/login')}}>Logout</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main
			class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
		>
      <slot></slot>
		</main>
	</div>
</div>
