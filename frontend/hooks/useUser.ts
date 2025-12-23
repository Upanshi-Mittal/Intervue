import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { User } from '../types/user';
import { apiClient } from '../lib/api';

export const useUser = (): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await apiClient.getMe();
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if unauthorized
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};