<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSessionData, Privilege } from '$lib/api/auth';
	import { onMount } from 'svelte';

	onMount(async () => {
		const session = getSessionData();
		if (session?.privilege !== Privilege.ADMIN_USER) {
			goto('/collections');
		}
	});
</script>

<div>ADMIN!</div>