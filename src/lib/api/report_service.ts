import { api_middleware } from "$lib/api_middleware";
import type { FinancialReport } from "$lib/models/financial_report";
import { CollectionStatus } from "$lib/models/collection";

export async function getFinancialReport(collectionId: number): Promise<FinancialReport> {
	try {
		return await api_middleware.get(`/api/report/financial/${collectionId}`);
	} catch (error) {
		console.error("Error fetching financial report:", error);
		throw error;
	}
}

export function getStatusText(status: number): string {
	return CollectionStatus[status] || `Unknown (${status})`;
}

export function formatReportForPdf(report: FinancialReport) {
	const startDate = new Date(report.collection_info.start_date).toLocaleDateString();
	const endDate = new Date(report.collection_info.end_date).toLocaleDateString();

	return {
		title: `Financial Report: ${report.collection_info.name}`,
		generatedDate: new Date(report.generated_date).toLocaleDateString(),
		collectionDetails: {
			name: report.collection_info.name,
			description: report.collection_info.description,
			period: `${startDate} to ${endDate}`,
			pricePerChild: report.collection_info.price_per_child.toFixed(2),
			status: getStatusText(report.collection_info.status)
		},
		financialSummary: {
			totalChildren: report.financial_summary.total_children,
			paidCount: report.financial_summary.paid_children_count,
			unpaidCount: report.financial_summary.unpaid_children_count,
			totalExpected: report.financial_summary.total_expected.toFixed(2),
			collected: report.financial_summary.total_collected.toFixed(2),
			outstanding: report.financial_summary.outstanding_amount.toFixed(2),
			withdrawn: report.financial_summary.withdrawn_money.toFixed(2),
			balance: report.financial_summary.available_balance.toFixed(2)
		},
		paidChildren: report.paid_children.map(child => ({
			id: child.child_id,
			fullName: `${child.child_name} ${child.child_surname}`
		})),
		unpaidChildren: report.unpaid_children.map(child => ({
			id: child.child_id,
			fullName: `${child.child_name} ${child.child_surname}`
		}))
	};
}