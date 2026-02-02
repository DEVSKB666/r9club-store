import { create } from 'zustand';

interface CreditStore {
  creditBalance: number;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  setBalance: (balance: number) => void;
  addBalance: (amount: number) => void;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
  creditBalance: 0,
  isLoading: false,
  error: null,
  
  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/user/balance');
      if (!res.ok) throw new Error('Failed to fetch balance');
      const data = await res.json();
      set({ creditBalance: data.creditBalance, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load balance', isLoading: false });
    }
  },
  
  setBalance: (balance: number) => {
    set({ creditBalance: balance });
  },
  
  addBalance: (amount: number) => {
    set((state) => ({ creditBalance: state.creditBalance + amount }));
  },
}));
