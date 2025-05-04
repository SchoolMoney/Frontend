import { api_middleware } from "$lib/api_middleware";
import type { FinancialReport } from "$lib/models/financial_report";
import type { ClassFinancialReport } from "$lib/models/class_financial_report";
import { CollectionStatus } from "$lib/models/collection";

export async function getFinancialReport(collectionId: number): Promise<FinancialReport> {
	try {
		return await api_middleware.get(`/api/report/financial/collection?collection_id=${collectionId}`);
	} catch (error) {
		console.error("Error fetching financial report:", error);
		throw error;
	}
}

export async function getClassFinancialReport(classId: number): Promise<ClassFinancialReport> {
	try {
		return await api_middleware.get(`/api/report/financial/class?class_id=${classId}`);
	} catch (error) {
		console.error("Error fetching class financial report:", error);
		throw error;
	}
}

export function getStatusText(status: number): string {
	return CollectionStatus[status] || `Unknown (${status})`;
}
