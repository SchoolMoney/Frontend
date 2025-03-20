<script lang="ts">
	import { goto } from '$app/navigation';
	import '../app.css';
	import { get_user_details, getToken } from '$lib/api/auth';
	import { onMount } from 'svelte';
	
	let is_user_authenticated = false;

	onMount(async () => {
		is_user_authenticated = false;
		const token = getToken();
		if (!token) {
			goto("/login");
		} else {
			try {
				await get_user_details();
				is_user_authenticated = true;

			} catch (e) {
				console.error(e);
				goto("/login");
			}
		}
	});
</script>

<slot></slot>
