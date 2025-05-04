export interface FinancialCollectionInfo {
	id: number;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	price_per_child: number;
	status: number;
}

export interface FinancialSummary {
	total_children: number;
	paid_children_count: number;
	unpaid_children_count: number;
	total_expected: number;
	total_collected: number;
	outstanding_amount: number;
	withdrawn_money: number;
	available_balance: number;
}

export interface FinancialChild {
	child_id: number;
	child_name: string;
	child_surname: string;
}

export interface FinancialReport {
	collection_info: FinancialCollectionInfo;
	financial_summary: FinancialSummary;
	paid_children: FinancialChild[];
	unpaid_children: FinancialChild[];
	generated_date: string;
}
