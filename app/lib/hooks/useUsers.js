import useSWR from 'swr';
import { fetchApi } from '../api';

const EMPTY_ARRAY = [];

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/users/?skip=${skip}&limit=${limit}`,
    (url) => fetchApi(url)
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
    id ? `/api/users/${id}` : null,
    (url) => fetchApi(url)
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
