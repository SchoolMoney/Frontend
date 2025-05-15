<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import type { Collection } from '$lib/models/collection';
	import {
		cardVariants,
		collectionOperationTypeLabels,
		CollectionStatus,
		statusLabels,
		statusTextColors
	} from '$lib/models/collection';
	import FinancialReport from './FinancialReport.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { ClassGroup } from '$lib/models/class_group';
	import { getClasses } from '$lib/api/class_group';
	import { getSessionData } from '../../../../lib/api/auth';
	import { Privilege } from '../../../../lib/models/auth';
	import { api_middleware } from '$lib/api_middleware';
	import { showToast } from '$lib/stores/toast';
	import WithdrawMoney from './WithdrawMoney.svelte';
	import { getFinancialReport } from '$lib/api/report_service';
	import type { BankAccount } from '$lib/models/bank_account';

	let collection: Collection = {
		id: 0,
		logo_path: '',
		name: '',
		description: '',
		start_date: new Date(),
		end_date: undefined,
		status: CollectionStatus.OPEN,
		price: 0,
		class_group_id: 0,
		bank_account_id: 0,
		withdrawn_money: 0,
		owner_id: 0 // Unused. Set on backend!
	};

	let classGroups: ClassGroup[] = [];
	let collectionClassGroup: ClassGroup = {
		id: 0,
		name: '',
		description: ''
	};
	let isAdmin = false;
	let isCreateMode = false;

	var openWithdrawDialog = false;
	var collectionBankAccount: BankAccount = {
		id: 0,
		balance: 0,
		is_locked: false,
		account_number: ''
	};

	let isEditMode = false;
	let originalCollection = null;

	// Variables for collection view mode
	let children = [];
	let documents = [];
	let operations = [];
	let requester = null;

	let showDocumentDialog = false;
	let fileToUpload = null;
	let documentName = '';
	let isUploading = false;

	let showFinancialReport = false;
	let financialReportData = null;

	$: numberOfChildrenPaid = children?.filter((child) => child.operation === 1).length;
	$: withdrawnMoney = collection.withdrawn_money;
	$: collectedMoney = (collectionBankAccount.balance ?? 0);

	onMount(async () => {
		isAdmin = getSessionData().privilege === Privilege.ADMIN_USER;
		classGroups = await getClasses();

		const collectionId = parseInt(page.params.id, 10);
		collection.id = collectionId;
		isCreateMode = collectionId === 0;

		const urlParams = new URLSearchParams(window.location.search);
		const classGroupId = urlParams.get('class_group_id');

		if (isCreateMode) {
			collection.class_group_id = parseInt(classGroupId, 10);

			if (classGroupId) {
				collection.class_group_id = parseInt(classGroupId, 10);
				collectionClassGroup = classGroups.find((c) => c.id === collection.class_group_id) || null;
			}
		} else {
			try {
				await fetchData();

				numberOfChildrenPaid = children.filter((child) => child.operation === 1).length;

				collectionClassGroup =
					classGroups.find((c) => c.id === collection.class_group_id) || collectionClassGroup;
			} catch (error) {
				console.error('Error fetching collection view:', error);
			}
		}
	});

	async function fetchData() {
		const data = await api_middleware.get(`/api/collection/collection-view/${collection.id}`);
		collection = data.collection;
		collection.start_date = new Date(collection.start_date);
		if (collection.end_date) {
			collection.end_date = new Date(collection.end_date);
		}

		children = data.children;
		documents = data.documents;
		requester = data.requester;
		operations = data.operations;
		collectionBankAccount = data.bank_account_details;
	}

	function startEditing() {
		originalCollection = JSON.parse(JSON.stringify(collection));
		isEditMode = true;
	}

	function cancelEditing() {
		collection = originalCollection;
		isEditMode = false;
	}

	async function save(): Promise<void> {
		try {
			if (collection.id > 0) {
				const updatedCollection = await api_middleware.put(
					`/api/collection/${collection.id}`,
					collection
				);
				collection = updatedCollection;

				if (isEditMode) {
					isEditMode = false;
				}
			} else {
				const newCollection = await api_middleware.post('/api/collection', collection);
				collection = newCollection;
				goto(`/main/collections/${collection.id}`);
				await fetchData();
			}

			if (isCreateMode) {
				isCreateMode = false;
			} else {
				collectionClassGroup =
					classGroups.find((c) => c.id === collection.class_group_id) || collectionClassGroup;
			}
		} catch (error) {
			console.error('Error saving collection:', error);
		}
	}

	async function payForChild(childId: number) {
		try {
			await api_middleware.put(`/api/collection/${collection.id}/pay/${childId}`, {});
			await fetchData();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}

	async function unsubscribeChild(childId: number) {
		try {
			await api_middleware.put(`/api/collection/${collection.id}/unsubscribe/${childId}`, {});
			await fetchData();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}

	async function restoreChild(childId: number) {
		try {
			await api_middleware.put(`/api/collection/${collection.id}/restore/${childId}`, {});
			await fetchData();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}
	async function refundChild(childId: number) {
		try {
			await api_middleware.put(`/api/collection/${collection.id}/refund/${childId}`, {});
			await fetchData();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}

	async function showAddDocumentDialog() {
		fileToUpload = null;
		documentName = '';
		showDocumentDialog = true;
	}

	async function uploadDocument() {
		if (!fileToUpload) return;

		isUploading = true;
		try {
			const name = documentName.trim() || fileToUpload.name;

			const fileReader = new FileReader();
			fileReader.readAsArrayBuffer(fileToUpload);

			await new Promise((resolve, reject) => {
				fileReader.onload = async () => {
					try {
						// Konwersja tablicy bajtów do base64
						const arrayBuffer = fileReader.result;
						const bytes = new Uint8Array(arrayBuffer);
						let binary = '';
						for (let i = 0; i < bytes.byteLength; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						const base64Data = btoa(binary);

						const fileType = fileToUpload.name.split('.').pop().toLowerCase();

						const documentData = {
							collection_id: collection.id,
							document_name: name,
							file_type: fileType,
							file_data: base64Data
						};

						await api_middleware.post('/api/collection_documents', documentData);

						showDocumentDialog = false;
						window.location.reload();
					} catch (error) {
						reject(error);
					}
				};

				fileReader.onerror = reject;
			});
		} catch (error) {
			console.error('Error uploading document:', error);
		} finally {
			isUploading = false;
		}
	}

	async function cancelCollection() {
		try {
			await api_middleware.post(`/api/collection/${collection.id}/cancel`, {});
			window.location.reload();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}

	async function toggleCollectionBlock() {
		try {
			if (collection.status === CollectionStatus.BLOCKED) {
				await api_middleware.put(`/api/collection/${collection.id}/unblock`, {});
			} else {
				await api_middleware.put(`/api/collection/${collection.id}/block`, {});
			}
			window.location.reload();
		} catch (e) {
			showToast('error', `${(e as Error).message}`);
		}
	}

	function handleFileSelect(event) {
		const file = event.target.files[0];
		if (file) {
			fileToUpload = file;
			// Jeśli pole nazwy jest puste, ustawmy nazwę pliku
			if (!documentName.trim()) {
				// Użyj nazwy pliku bez rozszerzenia jako domyślną nazwę dokumentu
				documentName = file.name.split('.').slice(0, -1).join('.');
			}
		}
	}

	async function deleteDocument(documentId) {
		if (!confirm('Are you sure you want to delete this document?')) return;

		try {
			await api_middleware.delete(`/api/collection_documents/${documentId}`);
			window.location.reload();
		} catch (error) {
			console.error('Error deleting document:', error);
		}
	}

	async function viewDocument(documentId, documentName, fileType) {
		try {
			// Pobierz plik za pomocą api_middleware
			const response = await api_middleware.fetch(
				`/api/collection_documents/${documentId}/content`,
				{
					method: 'GET',
					headers: {
						'Content-Type': null
					}
				},
				true
			);

			if (!response || !response.ok) {
				console.error('Error fetching document');
				return;
			}

			const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			if (imageTypes.includes(fileType.toLowerCase()) || fileType.toLowerCase() === 'pdf') {
				window.open(url, '_blank');
			} else {
				const link = document.createElement('a');
				link.href = url;
				link.download = `${documentName}.${fileType}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				setTimeout(() => {
					window.URL.revokeObjectURL(url);
				}, 100);
			}
		} catch (error) {
			console.error('Error viewing document:', error);
		}
	}

	function getDocumentTypeLabel(fileType) {
		const type = fileType.toLowerCase();

		if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
			return 'Image';
		} else if (type === 'pdf') {
			return 'PDF';
		} else if (['doc', 'docx'].includes(type)) {
			return 'Word';
		} else if (['xls', 'xlsx'].includes(type)) {
			return 'Excel';
		} else {
			return fileType.toUpperCase();
		}
	}

	function canDeleteDocuments() {
		return isAdmin || (requester && requester.role === 2);
	}

	function formatDateToYYYYMMDD(date) {
		if (!date) return '';

		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	function getChildRowClass(child) {
		if (child.operation === 1) {
			return 'bg-green-500 bg-opacity-50';
		} else if (child.operation === 2) {
			return 'bg-red-500 bg-opacity-50';
		} else if (child.operation === 3) {
			return 'bg-yellow-500 bg-opacity-50';
		}
		return '';
	}

	async function generateReport() {
		try {
			const reportData = await getFinancialReport(collection.id);
			financialReportData = reportData;
			showFinancialReport = true;
		} catch (error) {
			console.error('Error generating report:', error);
			showToast('error', 'Failed to generate financial report');
		}
	}
</script>

<div class="min-h-dvh">
	{#if isCreateMode}
		<!-- Create Collection View -->
		<h2 class="w-full text-center text-4xl font-bold">Create New Collection</h2>
		<form
			class={cardVariants.get(collection.status) +
				' mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-6 rounded-lg bg-gray-900 p-6 shadow-md md:grid-cols-1'}
			on:submit|preventDefault={save}
		>
			<div>
				<Label>Logo link*</Label>
				<Input required type="url" bind:value={collection.logo_path} placeholder="Enter logo URL" />
			</div>
			<div>
				<Label>Name*</Label>
				<Input
					required
					type="text"
					bind:value={collection.name}
					placeholder="Enter collection name"
				/>
			</div>
			<div>
				<Label>Description*</Label>
				<Textarea required bind:value={collection.description} placeholder="Enter description"
				></Textarea>
			</div>
			<div class="flex flex-row gap-6">
				<div class="flex-1">
					<Label>Start date*</Label>
					<Input
						required
						type="date"
						bind:value={collection.start_date}
						placeholder="Enter start date"
					/>
				</div>
				<div class="flex-1">
					<Label>End date (optional)</Label>
					<Input
						type="date"
						bind:value={collection.end_date}
						min={formatDateToYYYYMMDD(collection.start_date)}
						placeholder="Enter end date"
					/>
				</div>
			</div>
			<div>
				<Label>Price per Child*</Label>
				<Input
					required
					type="number"
					min="1"
					bind:value={collection.price}
					placeholder="Enter price per child"
				></Input>
			</div>
			<div>
				<Label>Class group</Label>
				<div
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					{#if collectionClassGroup}
						{collectionClassGroup.name}
					{:else}
						No class group selected
					{/if}
				</div>
				<input type="hidden" name="class_group_id" value={collection.class_group_id} />
			</div>
			<Button class="ms-auto" variant="default" type="submit">Save</Button>
		</form>
	{:else}
		<!-- Collection View/Edit Mode -->
		<div class="mx-auto max-w-6xl p-6">
			<!-- Collection Details Section -->
			<div
				class={cardVariants.get(collection.status) + ' mb-8 rounded-lg bg-muted/50 p-6 shadow-md'}
			>
				{#if isEditMode}
					<!-- Edit Mode Header -->
					<form on:submit|preventDefault={save} class="space-y-4">
						<div class="mb-6 flex items-center">
							<div class="mr-4 flex-grow">
								<Label>Logo link</Label>
								<Input
									type="url"
									bind:value={collection.logo_path}
									placeholder="Enter logo URL"
									class="w-full"
								/>
							</div>
							<div class="mb-1 flex flex-shrink-0 gap-2 self-end">
								<Button variant="outline" on:click={cancelEditing}>Cancel</Button>
								<Button variant="default" type="submit">Save</Button>
							</div>
						</div>

						<div>
							<Label>Name</Label>
							<Input
								required
								type="text"
								bind:value={collection.name}
								placeholder="Enter collection name"
							/>
						</div>

						<div>
							<Label>Description</Label>
							<Textarea bind:value={collection.description} placeholder="Enter description"
							></Textarea>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Status</Label>
								<Input disabled value={statusLabels.get(collection.status)}></Input>
							</div>
							<div>
								<Label>Price</Label>
								<Input disabled value={collection.price}></Input>
							</div>
							<div>
								<Label>Start Date</Label>
								<Input
									type="date"
									value={formatDateToYYYYMMDD(collection.start_date)}
									on:input={(event) =>
										(collection.start_date = new Date(event.currentTarget.value))}
								/>
							</div>
							<div>
								<Label>End Date (optional)</Label>
								<Input
									type="date"
									value={formatDateToYYYYMMDD(collection.end_date)}
									min={formatDateToYYYYMMDD(collection.start_date)}
									on:input={(event) => (collection.end_date = new Date(event.currentTarget.value))}
								/>
							</div>
							<div>
								<Label>Class Group</Label>
								<Input disabled value={collectionClassGroup.name}></Input>
							</div>
						</div>
					</form>
				{:else}
					<!-- View Mode Header -->
					<div class="mb-6 flex items-start justify-between">
						<div class="flex items-center">
							{#if collection.logo_path}
								<img
									src={collection.logo_path}
									alt="Collection Logo"
									class="mr-4 h-20 w-20 rounded-md object-contain"
								/>
							{/if}
							<div>
								<h2 class="text-3xl font-bold">{collection.name}</h2>
								<p class="text-gray-600">{collection.description}</p>
							</div>
						</div>
						<div class="flex gap-2">
							{#if requester && requester.role === 2 && collection.status != CollectionStatus.BLOCKED}
								<Button
									on:click={() => {
										openWithdrawDialog = true;
									}}>Collection's bank account</Button
								>
								<Button variant="destructive" on:click={cancelCollection}>Cancel collection</Button>
							{/if}
							{#if (isAdmin || (requester && requester.role === 2)) && collection.status != CollectionStatus.BLOCKED}
								<Button variant="outline" on:click={startEditing}>Edit</Button>
							{/if}
							{#if collection.status != CollectionStatus.BLOCKED}
								<Button variant="outline" on:click={generateReport}>Report</Button>
							{/if}
							{#if isAdmin}
								<Button
									variant={`${collection.status != CollectionStatus.BLOCKED ? 'destructive' : 'default'}`}
									on:click={toggleCollectionBlock}
									>{`${collection.status != CollectionStatus.BLOCKED ? 'Block' : 'Unblock'}`}</Button
								>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label>Status</Label>
							<div class={`text-${statusTextColors.get(collection.status)} font-medium`}>
								{statusLabels.get(collection.status)}
							</div>
						</div>
						<div>
							<Label>Price per Child</Label>
							<div>{collection.price} PLN</div>
						</div>
						<div>
							<Label>Start Date</Label>
							<div>{formatDateToYYYYMMDD(collection.start_date)}</div>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Label>Money in collection</Label>
							<div>
								{collectedMoney} PLN
							</div>
							<Label>Withdrawn from collection</Label>
							<div>
								{withdrawnMoney === 0
								? '0 PLN'
								: `${withdrawnMoney} PLN`}
							</div>
						</div>
						<div>
							<Label>End Date</Label>
							<div>
								{collection.end_date ? formatDateToYYYYMMDD(collection.end_date) : 'Not specified'}
							</div>
						</div>
						<div>
							<Label>Class Group</Label>
							<div>{collectionClassGroup.name}</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="mb-8 rounded-lg bg-muted/50 p-6 shadow-md">
				<h3 class="mb-4 text-xl font-bold">Children</h3>

				{#if children && children.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="bg-gray-800">
									<th class="border-b p-3 text-left">Name</th>
									<th class="border-b p-3 text-left">Surname</th>
									<th class="border-b p-3 text-left">Requester</th>
									<th class="border-b p-3 text-left">Operation</th>
									<th class="border-b p-3 text-left">Operation Date</th>
									<th class="border-b p-3 text-left">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each children as child}
									<tr class={getChildRowClass(child)}>
										<td class="border-b p-3">{child.child_name}</td>
										<td class="border-b p-3">{child.child_surname}</td>
										<td class="border-b p-3">
											{child.requester_name && child.requester_surname
												? `${child.requester_name} ${child.requester_surname}`
												: '-'}
										</td>
										<td class="border-b p-3">
											{#if child.operation === 1}
												Paid
											{:else if child.operation === 2}
												Unsubscribed
											{:else if child.operation === 3}
												Refunded
											{:else}
												-
											{/if}
										</td>
										<td class="border-b p-3">{child.operation_date || '-'}</td>
										<td class="border-b p-3">
											{#if child.operation === null && collection.status === CollectionStatus.OPEN && !isAdmin}
												<div class="flex gap-2">
													<Button
														size="sm"
														variant="default"
														on:click={() => payForChild(child.child_id)}>Pay</Button
													>
													<Button
														size="sm"
														variant="outline"
														on:click={() => unsubscribeChild(child.child_id)}
													>
														Unsubscribe
													</Button>
												</div>
											{:else if child.operation === 1}
												<Button
													size="sm"
													variant="outline"
													on:click={() => refundChild(child.child_id)}>Refund</Button
												>
											{:else if child.operation === 2}
												<Button
													size="sm"
													variant="default"
													on:click={() => restoreChild(child.child_id)}>Restore</Button
												>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p>No children found.</p>
				{/if}
			</div>

			<div class="mb-8 rounded-lg bg-muted/50 p-6 shadow-md">
				<h3 class="mb-4 text-xl font-bold">Operations</h3>

				{#if operations?.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="bg-gray-800">
									<th class="pb-2 pr-2">Date</th>
									<th class="pb-2 pr-2">Title</th>
									<th class="pb-2 pr-2">Description</th>
									<th class="pb-2 pr-2">Amount</th>
								</tr>
							</thead>
							<tbody>
								{#each operations as operation}
									<tr>
										<td class="border-b p-3">{operation.operation_date || '-'}</td>
										<td class="border-b p-3">{operation.title}</td>
										<td class="border-b p-3">{operation.description}</td>
										<td
											class="border-b p-3 font-mono {operation.destination_account_id ===
											collection.bank_account_id
												? 'text-green-600'
												: 'text-red-600'}"
										>
											{operation.destination_account_id === collection.bank_account_id ? '+' : '-'}
											{operation.amount.toLocaleString(undefined, {
												style: 'currency',
												currency: 'PLN'
											})}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p>No operations found.</p>
				{/if}
			</div>

			<!-- Documents Section -->
			<div class="rounded-lg bg-muted/50 p-6 shadow-md">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-xl font-bold">Documents</h3>
					{#if collection.status != CollectionStatus.BLOCKED}
						<Button variant="outline" on:click={showAddDocumentDialog}>Add Document</Button>
					{/if}
				</div>

				{#if documents && documents.length > 0}
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#each documents as doc}
							<div
								class="relative overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
							>
								<!-- Ikona typu dokumentu -->
								<div class="flex h-40 items-center justify-center bg-gray-100">
									<div class="text-center">
										<div class="mb-2 flex justify-center">
											<!-- Różne ikony w zależności od typu pliku -->
											{#if ['jpg', 'jpeg', 'png', 'gif'].includes(doc.file_type?.toLowerCase())}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-12 w-12 text-blue-500"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
														clip-rule="evenodd"
													/>
												</svg>
											{:else if doc.file_type?.toLowerCase() === 'pdf'}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-12 w-12 text-red-500"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
														clip-rule="evenodd"
													/>
												</svg>
											{:else if ['doc', 'docx'].includes(doc.file_type?.toLowerCase())}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-12 w-12 text-indigo-500"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H7v-2h8zM7 11V9h2v2H7zm0-4h2v2H7V7zm8 4h2v2h-2v-2zm0-4h2v2h-2V7z"
														clip-rule="evenodd"
													/>
												</svg>
											{:else if ['xls', 'xlsx'].includes(doc.file_type?.toLowerCase())}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-12 w-12 text-green-500"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
														clip-rule="evenodd"
													/>
												</svg>
											{:else}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-12 w-12 text-gray-500"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
														clip-rule="evenodd"
													/>
												</svg>
											{/if}
										</div>
										<span class="text-sm font-medium">{getDocumentTypeLabel(doc.file_type)}</span>
									</div>
								</div>

								<div class="p-3">
									<div class="flex items-center justify-between">
										<h4 class="truncate text-sm font-medium" title={doc.document_name}>
											{doc.document_name || 'Document'}
										</h4>
										<div class="flex items-center space-x-1">
											<!-- Przycisk podglądu -->
											<button
												class="p-1 text-blue-500 hover:text-blue-700"
												on:click={() =>
													viewDocument(doc.document_id, doc.document_name, doc.file_type)}
												title="View document"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
													<path
														fill-rule="evenodd"
														d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
														clip-rule="evenodd"
													/>
												</svg>
											</button>

											{#if canDeleteDocuments()}
												<button
													class="p-1 text-red-500 hover:text-red-700"
													on:click={() => deleteDocument(doc.document_id)}
													title="Delete document"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-5 w-5"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path
															fill-rule="evenodd"
															d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
															clip-rule="evenodd"
														/>
													</svg>
												</button>
											{/if}
										</div>
									</div>
									<div class="mt-2 flex items-center justify-between">
										<span class="text-xs text-gray-500">{doc.file_type.toUpperCase()}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p>No documents</p>
				{/if}
			</div>

			{#if showDocumentDialog}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div class="w-full max-w-md rounded-lg bg-muted/50 p-6 shadow-lg">
						<h3 class="mb-4 text-xl font-bold">Add Document</h3>

						<form on:submit|preventDefault={uploadDocument} class="space-y-4">
							<div>
								<Label for="file-upload">Select File*</Label>
								<div
									class="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:bg-gray-50"
									on:click={() => document.getElementById('file-input').click()}
									on:dragover|preventDefault
									on:drop|preventDefault={(e) => {
										const file = e.dataTransfer.files[0];
										if (file) {
											fileToUpload = file;
											if (!documentName) {
												documentName = file.name.split('.').slice(0, -1).join('.');
											}
										}
									}}
								>
									{#if fileToUpload}
										<p class="text-sm font-medium">{fileToUpload.name}</p>
										<p class="text-xs text-gray-500">
											({(fileToUpload.size / 1024).toFixed(2)} KB)
										</p>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mx-auto mb-2 h-10 w-10 text-gray-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
										<p>Click to select file or drag and drop</p>
									{/if}
								</div>
								<input id="file-input" type="file" class="hidden" on:change={handleFileSelect} />
							</div>

							<div>
								<Label for="document-name">Document Name (optional)</Label>
								<Input
									id="document-name"
									bind:value={documentName}
									placeholder="Leave empty to use filename"
								/>
							</div>

							<div class="mt-6 flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									on:click={() => (showDocumentDialog = false)}
								>
									Cancel
								</Button>
								<Button type="submit" variant="default" disabled={!fileToUpload || isUploading}>
									{isUploading ? 'Uploading...' : 'Upload'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if openWithdrawDialog}
	<WithdrawMoney
		bind:open={openWithdrawDialog}
		operation="Withdraw"
		bankAccountId={collection.bank_account_id}
		availableMoney={collectedMoney }
		onComplete={async (val: number) => {
			// withdrawnMoney = Number(withdrawnMoney) + Number(val);
			await fetchData();
		}}
	/>
{/if}

{#if showFinancialReport && financialReportData}
	<FinancialReport bind:open={showFinancialReport} reportData={financialReportData} />
{/if}
