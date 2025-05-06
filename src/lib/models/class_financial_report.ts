export interface ClassFinancialReport {
	class_info: {
		id: number;
		name: string;
	};
	financial_summary: {
		total_collections: number;
		total_children: number;
		total_expected: number;
		total_collected: number;
		total_outstanding: number;
		total_withdrawn: number;
		total_available_balance: number;
	};
	collections: Array<{
		id: number;
		name: string;
		start_date: string;
		end_date: string;
		price_per_child: number;
		status: number;
		total_children: number;
		paid_children: number;
		unpaid_children: number;
		expected_amount: number;
		collected_amount: number;
		outstanding_amount: number;
		withdrawn_money: number;
		available_balance: number;
	}>;
	generated_date: string;
}