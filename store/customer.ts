'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerUser {
  id: string;
  email: string;
  name: string;
}

interface CustomerState {
  token: string | null;
  customer: CustomerUser | null;
  setCustomerAuth: (token: string, customer: CustomerUser) => void;
  logoutCustomer: () => void;
  isCustomerAuthenticated: () => boolean;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,

      setCustomerAuth: (token, customer) => set({ token, customer }),

      logoutCustomer: () => set({ token: null, customer: null }),

      isCustomerAuthenticated: () => !!get().token,
    }),
    {
      name: 'viralgoods-customer',
    }
  )
);
