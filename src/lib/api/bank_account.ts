import { api_middleware } from '../api_middleware';
import type { BankAccount, BankAccountOperation } from '../models/bank_account';

export async function getBankAccountById(bank_account_id: number): Promise<BankAccount> {
	try {
		return await api_middleware.get(`/api/bank_account/${bank_account_id}`);
	} catch (e) {
		console.error(e);
		throw e;
	}
}

export async function getUserBankAccount(): Promise<BankAccount> {
	try {
		return await api_middleware.get(`/api/bank_account/user`);
	} catch (e) {
		console.error(e);
		throw e;
	}
}

export async function getBankAccountOperations(bank_account_id: number): Promise<BankAccountOperation[]> {
	try{
		return await api_middleware.get(`/api/bank_account/operations/${bank_account_id}`);
	} catch (e) {
		console.error(e);
		throw e;
	}
}
