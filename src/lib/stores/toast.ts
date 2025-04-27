import { writable } from 'svelte/store';

export type ToastData = {
	open: boolean;
	type: 'success' | 'error' | 'info';
	message: string;
};

export const toast = writable<ToastData | null>(null);

export function showToast(type: 'success' | 'error' | 'info', message: string) {
	toast.set({
		open: true,
		type,
		message
	});
}
