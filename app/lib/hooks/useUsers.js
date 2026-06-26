import useSWR from 'swr';
import { userService } from '../services/userService';

const mapUserData = (user) => {
  if (!user) return user;
  return {
    ...user,
    name: user.full_name || user.name,
    status: user.is_active !== undefined ? user.is_active : user.status,
    user_code: user.username || user.user_code,
    full_name: user.full_name,
    is_active: user.is_active,
    username: user.username,
  };
};

export function useUsers(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `users-${page}-${page_size}`,
    () => userService.getAll(page, page_size),
    { revalidateOnFocus: false }
  );

  // data is now { data: [...], total, page, page_size, total_pages }
  const users = Array.isArray(data?.data)
    ? data.data.map(mapUserData)
    : [];

  return {
    users,
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    currentPage: data?.page || page,
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
    user: mapUserData(data),
    isLoading,
    isError: error,
    mutate,
  };
}
