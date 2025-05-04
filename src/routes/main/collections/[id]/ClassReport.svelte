<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { jsPDF } from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import type { ClassFinancialReport } from '$lib/models/class_financial_report';

	export let open = false;
	export let reportData: ClassFinancialReport;

	function closeModal() {
		open = false;
	}

	function downloadPdf() {
		// Create PDF with proper font configuration
		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		doc.setFont('helvetica');

		const info = reportData.class_info;
		const summary = reportData.financial_summary;

		// Add title
		doc.setFontSize(20);
		doc.setTextColor(44, 62, 80);
		doc.text(`Class Financial Report: ${info.name}`, 14, 22);

		// Add date
		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text(`Generated on: ${new Date(reportData.generated_date).toLocaleDateString()}`, 14, 30);

		// Class details
		doc.setFontSize(16);
		doc.setTextColor(44, 62, 80);
		doc.text("Class Information", 14, 42);

		// Class info table
		const classDetails = [
			["ID", info.id.toString()],
			["Name", info.name]
		];

		autoTable(doc, {
			startY: 46,
			head: [["Property", "Value"]],
			body: classDetails,
			theme: 'grid',
			headStyles: { fillColor: [52, 152, 219] },
			styles: { font: "helvetica" }
		});

		// Get the final Y position after the table
		const finalY1 = doc.lastAutoTable?.finalY || 60;

		doc.setFontSize(16);
		doc.setTextColor(44, 62, 80);
		doc.text("Financial Summary", 14, finalY1 + 15);

		const financialSummary = [
			["Total Collections", summary.total_collections],
			["Total Children", summary.total_children],
			["Total Expected", `${summary.total_expected.toFixed(2)} PLN`],
			["Total Collected", `${summary.total_collected.toFixed(2)} PLN`],
			["Total Outstanding", `${summary.total_outstanding.toFixed(2)} PLN`],
			["Total Withdrawn", `${summary.total_withdrawn.toFixed(2)} PLN`],
		];

		autoTable(doc, {
			startY: finalY1 + 20,
			head: [["Metric", "Value"]],
			body: financialSummary,
			theme: 'grid',
			headStyles: { fillColor: [46, 204, 113] },
			styles: { font: "helvetica" }
		});

		// Collections list
		if (reportData.collections.length > 0) {
			const finalY2 = doc.lastAutoTable?.finalY || finalY1 + 50;
			doc.setFontSize(16);
			doc.setTextColor(44, 62, 80);
			doc.text("Collections", 14, finalY2 + 15);

			const collectionsHeaders = [
				"ID", "Name", "Start Date", "End Date", "Price", "Expected", "Collected"
			];

			const collectionsData = reportData.collections.map(col => [
				col.id.toString(),
				col.name,
				new Date(col.start_date).toLocaleDateString(),
				new Date(col.end_date).toLocaleDateString(),
				`${col.price_per_child.toFixed(2)} PLN`,
				`${col.expected_amount.toFixed(2)} PLN`,
				`${col.collected_amount.toFixed(2)} PLN`,
			]);

			autoTable(doc, {
				startY: finalY2 + 20,
				head: [collectionsHeaders],
				body: collectionsData,
				theme: 'grid',
				headStyles: { fillColor: [26, 188, 156] },
				styles: { font: "helvetica" },
				columnStyles: {
					0: { cellWidth: 15 },
					1: { cellWidth: 30 }
				}
			});
		}

		// Generate the safe filename for download
		const safeFilename = info.name.replace(/[^\w\s-]/g, '');
		doc.save(`class-financial-report-${safeFilename}-${new Date().toISOString().slice(0, 10)}.pdf`);
	}
</script>

<div class={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${open ? 'block' : 'hidden'}`}>
	<div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
		<!-- Header with close button -->
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-2xl font-bold">Class Financial Report</h2>
			<div class="flex gap-2">
				<Button variant="outline" on:click={downloadPdf}>Download PDF</Button>
				<Button variant="outline" on:click={closeModal}>Close</Button>
			</div>
		</div>

		{#if reportData}
			<!-- Class Info -->
			<div class="mb-8 p-6 rounded-lg border bg-gray-50">
				<h3 class="text-xl font-semibold mb-4 text-blue-600">Class Information</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="font-medium">Class ID:</p>
						<p>{reportData.class_info.id}</p>
					</div>
					<div>
						<p class="font-medium">Class Name:</p>
						<p>{reportData.class_info.name}</p>
					</div>
				</div>
			</div>

			<!-- Financial Summary -->
			<div class="mb-8 p-6 rounded-lg border bg-green-50">
				<h3 class="text-xl font-semibold mb-4 text-green-600">Financial Summary</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="font-medium">Total Collections:</p>
						<p>{reportData.financial_summary.total_collections}</p>
					</div>
					<div>
						<p class="font-medium">Total Children:</p>
						<p>{reportData.financial_summary.total_children}</p>
					</div>
					<div>
						<p class="font-medium">Total Expected:</p>
						<p>{reportData.financial_summary.total_expected.toFixed(2)} PLN</p>
					</div>
					<div>
						<p class="font-medium">Total Collected:</p>
						<p>{reportData.financial_summary.total_collected.toFixed(2)} PLN</p>
					</div>
					<div>
						<p class="font-medium">Total Outstanding:</p>
						<p>{reportData.financial_summary.total_outstanding.toFixed(2)} PLN</p>
					</div>
					<div>
						<p class="font-medium">Total Withdrawn:</p>
						<p>{reportData.financial_summary.total_withdrawn.toFixed(2)} PLN</p>
					</div>
				</div>
			</div>

			<!-- Collections List -->
			<div class="mb-8 p-6 rounded-lg border bg-teal-50">
				<h3 class="text-xl font-semibold mb-4 text-teal-600">Collections ({reportData.collections.length})</h3>
				{#if reportData.collections.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full text-sm text-left">
							<thead class="text-xs uppercase bg-teal-100">
							<tr>
								<th class="px-4 py-2">ID</th>
								<th class="px-4 py-2">Name</th>
								<th class="px-4 py-2">Date Range</th>
								<th class="px-4 py-2">Price</th>
								<th class="px-4 py-2">Status</th>
								<th class="px-4 py-2">Children</th>
								<th class="px-4 py-2">Collected</th>
							</tr>
							</thead>
							<tbody>
							{#each reportData.collections as collection (collection.id)}
								<tr class="border-b hover:bg-teal-50">
									<td class="px-4 py-2">{collection.id}</td>
									<td class="px-4 py-2">{collection.name}</td>
									<td class="px-4 py-2">
										{new Date(collection.start_date).toLocaleDateString()} -
										{new Date(collection.end_date).toLocaleDateString()}
									</td>
									<td class="px-4 py-2">{collection.price_per_child.toFixed(2)} PLN</td>
									<td class="px-4 py-2">
										{collection.status === 0 ? 'Active' :
											collection.status === 1 ? 'Completed' :
												collection.status === 2 ? 'Archived' : 'Unknown'}
									</td>
									<td class="px-4 py-2">
										{collection.paid_children}/{collection.total_children}
									</td>
									<td class="px-4 py-2">{collection.collected_amount.toFixed(2)} PLN</td>
								</tr>
							{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p>No collections found</p>
				{/if}
			</div>

			<!-- Generated Date -->
			<div class="mt-6 text-sm text-gray-500 text-right">
				Report generated on: {new Date(reportData.generated_date).toLocaleDateString()}
			</div>
		{/if}
	</div>
</div>