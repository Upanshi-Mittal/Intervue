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
        const user = await apiClient.getMe();
        setAuthenticated(true);
        // Populate React Query cache with user data
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