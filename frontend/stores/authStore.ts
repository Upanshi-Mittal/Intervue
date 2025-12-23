import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuthenticated: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isInitialized: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setInitialized: (value) => set({ isInitialized: value }),
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist isAuthenticated, not tokens (they're in httpOnly cookies)
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);