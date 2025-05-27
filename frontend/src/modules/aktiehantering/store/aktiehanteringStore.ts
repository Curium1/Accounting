import { defineStore } from 'pinia';

export interface Shareholder {
  id: string;
  name: string;
  numberOfShares: number;
  shareType: string;
}

export interface ShareTransaction {
  id: string;
  date: string;
  shareholderId: string;
  type: 'purchase' | 'sale';
  quantity: number;
  pricePerShare: number;
}

interface AktiehanteringState {
  shareholders: Shareholder[];
  transactions: ShareTransaction[];
  isLoading: boolean;
  error: string | null;
}

export const useAktiehanteringStore = defineStore('aktiehantering', {
  state: (): AktiehanteringState => ({
    shareholders: [],
    transactions: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    totalShares(state): number {
      return state.shareholders.reduce((sum, s) => sum + s.numberOfShares, 0);
    },
  },
  actions: {
    async fetchShareholders() {
      this.isLoading = true;
      this.error = null;
      try {
        // Placeholder: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.shareholders = [
          { id: '1', name: 'Investor A', numberOfShares: 1000, shareType: 'A' },
          { id: '2', name: 'Investor B', numberOfShares: 500, shareType: 'B' },
        ];
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to fetch shareholders';
      } finally {
        this.isLoading = false;
      }
    },
    async addTransaction(transaction: Omit<ShareTransaction, 'id'>) {
      this.isLoading = true;
      this.error = null;
      try {
        // Placeholder: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const newTransaction: ShareTransaction = { ...transaction, id: Date.now().toString() };
        this.transactions.push(newTransaction);
        // Potentially update shareholder list or recalculate based on transaction
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to add transaction';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
