import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/api';

/**
 * Initialize auth state on app mount
 * Checks if user is still authenticated by verifying their session
 */
export const useInitAuth = () => {
  const { isInitialized, setInitialized, setAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
  try {
    // Check token first (e.g., from cookies or store)
    const token = useAuthStore.getState().token; // or document.cookie
    if (!token) {
      setAuthenticated(false);
      setInitialized(true);
      return;
    }
    const user = await apiClient.getMe();
    setAuthenticated(true);
    queryClient.setQueryData(['user', 'me'], user);
  } catch (error) {
    setAuthenticated(false);
    queryClient.removeQueries({ queryKey: ['user', 'me'] });
  } finally {
    setInitialized(true);
  }
};


    initAuth();
  }, [isInitialized, setInitialized, setAuthenticated, queryClient]);

  return { isInitialized };
};