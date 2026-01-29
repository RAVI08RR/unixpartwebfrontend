import useSWR from 'swr';
import { apiClient } from '../api';

const EMPTY_ARRAY = [];

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `users-${skip}-${limit}`,
    () => apiClient.get('api/users', { skip, limit })
  );

  return {
    users: data || EMPTY_ARRAY,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUser(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `user-${id}` : null,
    () => apiClient.get(`api/users/${id}`)
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
