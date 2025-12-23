import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials } from '../types/user';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiClient.login(credentials),
    onSuccess: (data) => {
      setAuthenticated(true);
      // Set user data in cache immediately
      queryClient.setQueryData(['user', 'me'], data.user);
    },
    onError: () => {
      setAuthenticated(false);
      queryClient.removeQueries({ queryKey: ['user', 'me'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      setAuthenticated(false);
      // Clear user data from cache
      queryClient.removeQueries({ queryKey: ['user', 'me'] });
    },
  });

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};