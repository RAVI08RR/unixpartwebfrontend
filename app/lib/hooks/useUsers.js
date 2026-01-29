import useSWR from 'swr';
import { apiClient } from '../api';

const EMPTY_ARRAY = [];

// SWR fetcher function using the new API client
const fetcher = (url) => {
  // Extract endpoint and query params from the SWR key
  const [endpoint, queryParams] = url.split('?');
  const params = new URLSearchParams(queryParams || '');
  
  return apiClient.get(endpoint, Object.fromEntries(params));
};

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `api/users?skip=${skip}&limit=${limit}`,
    fetcher
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
    id ? `api/users/${id}` : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
