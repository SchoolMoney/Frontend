<script lang="ts">
	import { goto } from '$app/navigation';
	import { getUserDetails, getToken, removeToken } from '$lib/api/auth';
	import { onMount } from 'svelte';

	onMount(async () => {
		const token = getToken();
		if (!token) {
			goto('/login');
		} else {
			try {
        await getUserDetails();
				goto('/main');
			} catch (e) {
				console.error(e);
				removeToken();
				goto('/login');
			}
		}
	});
</script>