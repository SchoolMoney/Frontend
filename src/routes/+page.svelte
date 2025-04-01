<script lang="ts">
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Copy from 'lucide-svelte/icons/copy';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import File from 'lucide-svelte/icons/file';
	import House from 'lucide-svelte/icons/house';
	import ListFilter from 'lucide-svelte/icons/list-filter';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Package from 'lucide-svelte/icons/package';
	import Package2 from 'lucide-svelte/icons/package-2';
	import PanelLeft from 'lucide-svelte/icons/panel-left';
	import Truck from 'lucide-svelte/icons/truck';
	import UsersRound from 'lucide-svelte/icons/users-round';
	import ShieldUser from 'lucide-svelte/icons/shield-user';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import Baby from 'lucide-svelte/icons/baby';
	import Files from 'lucide-svelte/icons/files';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { logout } from '$lib/api/auth';
	import { goto } from '$app/navigation';
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="##"
            class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
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
						href="##"
						class="flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
						use:builder.action
						{...builder}
					>
						<Baby class="h-5 w-5" />
						<span class="sr-only">My kids</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">My kids</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="##"
						class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
						use:builder.action
						{...builder}
					>
						<Files class="h-5 w-5" />
						<span class="sr-only">Reports</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Reports</Tooltip.Content>
			</Tooltip.Root>
		</nav>
		<nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="##"
						class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
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
							href="##"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<HandCoins class="h-5 w-5" />
							Collections
						</a>
						<a
							href="##"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Baby class="h-5 w-5" />
							My childs
						</a>
						<a
							href="##"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
              <Files class="h-5 w-5" />
							Reports
						</a>
						<a
							href="##"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<ShieldUser class="h-5 w-5" />
							Admin panel
						</a>
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
		</main>
	</div>
</div>
