import { api_middleware } from '../api_middleware';
import type { BankAccount } from '../models/bank_account';

export async function getBankAccountById(bank_account_id: number): Promise<BankAccount> {
  try {
    return await api_middleware.get(`/api/bank_account/${bank_account_id}`);
  } catch(e) {
    console.error(e);
    throw e;
  }
}