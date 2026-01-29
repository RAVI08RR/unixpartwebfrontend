import useSWR from 'swr';
import { userService } from '../services/userService';

const EMPTY_ARRAY = [];

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `users-${skip}-${limit}`,
    () => userService.getAll(skip, limit)
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
    () => userService.getById(id)
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
