<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { jsPDF } from 'jspdf';
	import autoTable from 'jspdf-autotable';

	export let open = false;

	// Define a proper type for the report data
	export let reportData: {
		collection_info: {
			name: string;
			description: string;
			start_date: string;
			end_date?: string;
			price_per_child: number;
		};
		financial_summary: {
			total_children: number;
			paid_children_count: number;
			unpaid_children_count: number;
			total_expected: number;
			total_collected: number;
			outstanding_amount: number;
			withdrawn_money: number;
			available_balance: number;
		};
		paid_children: Array<{child_id: number, child_name: string, child_surname: string}>;
		unpaid_children: Array<{child_id: number, child_name: string, child_surname: string}>;
		generated_date: string;
	};

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

		doc.setFont('Sans', 'normal');

		const info = reportData.collection_info;
		const summary = reportData.financial_summary;

		// Add title
		doc.setFontSize(20);
		doc.setTextColor(44, 62, 80);
		doc.text(`Financial Report: ${info.name}`, 14, 22);

		// Add date
		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text(`Generated on: ${new Date(reportData.generated_date).toLocaleDateString()}`, 14, 30);

		// Collection details
		doc.setFontSize(16);
		doc.setTextColor(44, 62, 80);
		doc.text("Collection Details", 14, 42);

		// Collection info table
		const collectionDetails = [
			["Name", info.name],
			["Description", info.description],
			["Period", `${new Date(info.start_date).toLocaleDateString()} to ${info.end_date ? new Date(info.end_date).toLocaleDateString() : 'Not specified'}`],
			["Price per child", `${info.price_per_child.toFixed(2)} PLN`]
		];

		autoTable(doc, {
			startY: 46,
			head: [["Property", "Value"]],
			body: collectionDetails,
			theme: 'grid',
			headStyles: { fillColor: [52, 152, 219] },
			willDrawCell: function(data) {
				// Add custom handling for cells with Polish characters
				if (data.section === 'body') {
					doc.setFont('helvetica', 'normal');
				}
			}
		});

		// Get the final Y position after the table
		const finalY1 = (doc as any).lastAutoTable.finalY;

		doc.setFontSize(16);
		doc.setTextColor(44, 62, 80);
		doc.text("Financial Summary", 14, finalY1 + 15);

		const financialSummary = [
			["Total children", summary.total_children],
			["Paid children", summary.paid_children_count],
			["Unpaid children", summary.unpaid_children_count],
			["Total expected", `${summary.total_expected.toFixed(2)} PLN`],
			["Total collected", `${summary.total_collected.toFixed(2)} PLN`],
			["Outstanding amount", `${summary.outstanding_amount.toFixed(2)} PLN`],
			["Withdrawn money", `${summary.withdrawn_money.toFixed(2)} PLN`],
			["Available balance", `${summary.available_balance.toFixed(2)} PLN`]
		];

		autoTable(doc, {
			startY: finalY1 + 20,
			head: [["Metric", "Value"]],
			body: financialSummary,
			theme: 'grid',
			headStyles: { fillColor: [46, 204, 113] }
		});

		// Paid children list
		if (reportData.paid_children.length > 0) {
			const finalY2 = (doc as any).lastAutoTable.finalY;
			doc.setFontSize(16);
			doc.setTextColor(44, 62, 80);
			doc.text("Paid Children", 14, finalY2 + 15);

			const paidChildren = reportData.paid_children.map(child =>
				[child.child_id, `${child.child_name} ${child.child_surname}`]
			);

			autoTable(doc, {
				startY: finalY2 + 20,
				head: [["ID", "Name"]],
				body: paidChildren,
				theme: 'grid',
				headStyles: { fillColor: [26, 188, 156] }
			});
		}

		// Unpaid children list
		if (reportData.unpaid_children.length > 0) {
			const finalY3 = (doc as any).lastAutoTable.finalY;
			doc.setFontSize(16);
			doc.setTextColor(44, 62, 80);
			doc.text("Unpaid Children", 14, finalY3 + 15);

			const unpaidChildren = reportData.unpaid_children.map(child =>
				[child.child_id, `${child.child_name} ${child.child_surname}`]
			);

			autoTable(doc, {
				startY: finalY3 + 20,
				head: [["ID", "Name"]],
				body: unpaidChildren,
				theme: 'grid',
				headStyles: { fillColor: [231, 76, 60] }
			});
		}

		// Generate the safe filename for download
		const safeFilename = info.name.replace(/[^\w\s-]/g, '');
		doc.save(`financial-report-${safeFilename}-${new Date().toISOString().slice(0, 10)}.pdf`);
	}
</script>

<div class={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${open ? 'block' : 'hidden'}`}>
	<div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
		<!-- Header with close button -->
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-2xl font-bold">Financial Report</h2>
			<div class="flex gap-2">
				<Button variant="outline" on:click={downloadPdf}>Download PDF</Button>
				<Button variant="outline" on:click={closeModal}>Close</Button>
			</div>
		</div>

		{#if reportData}
			<!-- Collection Info -->
			<div class="mb-8 p-6 rounded-lg border bg-gray-50">
				<h3 class="text-xl font-semibold mb-4 text-blue-600">Collection Information</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="font-medium">Name:</p>
						<p>{reportData.collection_info.name}</p>
					</div>
					<div>
						<p class="font-medium">Description:</p>
						<p>{reportData.collection_info.description}</p>
					</div>
					<div>
						<p class="font-medium">Date Range:</p>
						<p>
							{new Date(reportData.collection_info.start_date).toLocaleDateString()} to
							{reportData.collection_info.end_date ? new Date(reportData.collection_info.end_date).toLocaleDateString() : 'Not specified'}
						</p>
					</div>
					<div>
						<p class="font-medium">Price per Child:</p>
						<p>{reportData.collection_info.price_per_child.toFixed(2)} PLN</p>
					</div>
				</div>
			</div>

			<!-- Financial Summary -->
			<div class="mb-8 p-6 rounded-lg border bg-green-50">
				<h3 class="text-xl font-semibold mb-4 text-green-600">Financial Summary</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Fill in your financial summary UI here -->
				</div>
			</div>

			<!-- Children Lists -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Paid Children -->
				<div class="p-6 rounded-lg border bg-teal-50">
					<h3 class="text-xl font-semibold mb-4 text-teal-600">Paid Children ({reportData.paid_children.length})</h3>
					{#if reportData.paid_children.length > 0}
						<ul class="space-y-2">
							{#each reportData.paid_children as child (child.child_id)}
								<li>
									<span class="font-medium">{child.child_name} {child.child_surname}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p>No paid children.</p>
					{/if}
				</div>

				<!-- Unpaid Children -->
				<div class="p-6 rounded-lg border bg-red-50">
					<h3 class="text-xl font-semibold mb-4 text-red-600">Unpaid Children ({reportData.unpaid_children.length})</h3>
					{#if reportData.unpaid_children.length > 0}
						<ul class="space-y-2">
							{#each reportData.unpaid_children as child (child.child_id)}
								<li>
									<span class="font-medium">{child.child_name} {child.child_surname}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p>No unpaid children.</p>
					{/if}
				</div>
			</div>

			<!-- Generated Date -->
			<div class="mt-6 text-sm text-gray-500 text-right">
				Report generated on: {new Date(reportData.generated_date).toLocaleDateString()}
			</div>
		{/if}
	</div>
</div>