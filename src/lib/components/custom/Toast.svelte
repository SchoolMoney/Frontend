<script lang="ts">
	import { toast, type ToastData } from '$lib/stores/toast';
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	let t: ToastData | null = null;

	const unsubscribe = toast.subscribe((value: ToastData | null) => {
		t = value;
		if (t?.open) {
			setTimeout(() => {
				toast.set(null);
			}, 3000);
		}
	});

	onDestroy(unsubscribe);
</script>

{#if t?.open}
	<div class="fixed bottom-6 right-6 z-50" transition:fly={{ y: 20, duration: 200 }}>
		<div
			class={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg
        ${t.type === 'success' ? 'bg-green-500 text-white' : ''}
        ${t.type === 'error' ? 'bg-red-500 text-white' : ''}
        ${t.type === 'info' ? 'bg-blue-500 text-white' : ''}
        `}
		>
			{t.message}
		</div>
	</div>
{/if}