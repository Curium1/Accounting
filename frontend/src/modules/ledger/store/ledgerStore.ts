import { defineStore } from 'pinia';
import apiClient from '../../services/api'; // Adjusted path

// Interfaces (copied from GeneralLedger.vue)
export interface Account {
  id: number;
  number: string;
  name: string;
  type: string;
}

export interface LedgerEntry {
  id: number;
  date: string; 
  description: string;
  account_id: number;
  amount: number;
}

export interface NewLedgerEntry {
  date: string;
  description: string;
  account_id: number | null;
  amount: number | null;
}

interface LedgerState {
  accounts: Account[];
  ledgerEntries: LedgerEntry[];
  loadingAccounts: boolean;
  loadingEntries: boolean;
  fetchErrorAccounts: string | null;
  fetchErrorEntries: string | null;
  newEntry: NewLedgerEntry;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}

export const useLedgerStore = defineStore('ledger', {
  state: (): LedgerState => ({
    accounts: [],
    ledgerEntries: [],
    loadingAccounts: false,
    loadingEntries: false,
    fetchErrorAccounts: null,
    fetchErrorEntries: null,
    newEntry: {
      date: new Date().toISOString().split('T')[0], // Default to today
      description: '',
      account_id: null,
      amount: null,
    },
    submitting: false,
    submitError: null,
    submitSuccess: false,
  }),
  getters: {
    getAccountById: (state) => (accountId: number): Account | undefined => {
      return state.accounts.find(acc => acc.id === accountId);
    },
    // Getter for account name
    getAccountName: (state) => (accountId: number): string => {
      const account = state.accounts.find(acc => acc.id === accountId);
      return account ? account.name : 'Unknown Account';
    },
    // Getter for account number
    getAccountNumber: (state) => (accountId: number): string => {
      const account = state.accounts.find(acc => acc.id === accountId);
      return account ? account.number : 'N/A';
    },
  },
  actions: {
    async fetchAccounts() {
      this.loadingAccounts = true;
      this.fetchErrorAccounts = null;
      try {
        const response = await apiClient.get<Account[]>('/ledger/accounts/');
        this.accounts = response.data;
      } catch (error: any) {
        console.error('Failed to fetch accounts:', error);
        this.fetchErrorAccounts = error.response?.data?.detail || error.message || 'Failed to load accounts.';
      } finally {
        this.loadingAccounts = false;
      }
    },
    async fetchLedgerEntries() {
      this.loadingEntries = true;
      this.fetchErrorEntries = null;
      try {
        const response = await apiClient.get<LedgerEntry[]>('/ledger/ledger-entries/');
        this.ledgerEntries = response.data;
      } catch (error: any) {
        console.error('Failed to fetch ledger entries:', error);
        this.fetchErrorEntries = error.response?.data?.detail || error.message || 'Failed to load ledger entries.';
      } finally {
        this.loadingEntries = false;
      }
    },
    async handleAddLedgerEntry() {
      if (this.newEntry.account_id === null || this.newEntry.amount === null || !this.newEntry.date || !this.newEntry.description) {
        this.submitError = 'Please fill in all fields.';
        return;
      }
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = false;
      try {
        const payload = {
          date: this.newEntry.date,
          description: this.newEntry.description,
          account_id: this.newEntry.account_id,
          amount: this.newEntry.amount,
        };
        const response = await apiClient.post<LedgerEntry>('/ledger/ledger-entries/', payload);
        this.ledgerEntries.push(response.data); // Optimistic add

        // Reset form
        this.newEntry = {
          date: new Date().toISOString().split('T')[0],
          description: '',
          account_id: null,
          amount: null,
        };
        this.submitSuccess = true;
        setTimeout(() => this.submitSuccess = false, 3000); // Hide success message after 3s

      } catch (error: any) {
        console.error('Failed to add ledger entry:', error);
        this.submitError = error.response?.data?.detail || error.message || 'Failed to add entry.';
      } finally {
        this.submitting = false;
      }
    },
  },
});
