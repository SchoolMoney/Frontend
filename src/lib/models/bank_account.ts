export type BankAccount = {
  id?: number;
  account_number: string;
  is_locked?: boolean;
  balance?: number;
}

export type BankAccountOperation = {
  operation_id: number;
  operation_date: string;
  amount: number;
  title: string;
  description: string;
  source_account_id?: number;
  destination_account_id?: number;
  source_iban?: string;
  destination_iban?: string;
}