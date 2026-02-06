import useSWR from 'swr';
import { userService } from '../services/userService';

const EMPTY_ARRAY = [];

// Function to map API response fields to frontend expected fields
const mapUserData = (user) => {
  if (!user) return user;
  
  return {
    ...user,
    // Map API fields to frontend expected fields
    name: user.full_name || user.name, // API uses 'full_name', frontend expects 'name'
    status: user.is_active !== undefined ? user.is_active : user.status, // API uses 'is_active', frontend expects 'status'
    user_code: user.username || user.user_code, // API uses 'username', frontend expects 'user_code'
    // Keep original fields as well for backward compatibility
    full_name: user.full_name,
    is_active: user.is_active,
    username: user.username,
  };
};

// Function to map array of users or users response object
const mapUsersResponse = (data) => {
  if (!data) return EMPTY_ARRAY;
  
  // If data has 'items' property (paginated response)
  if (data.items && Array.isArray(data.items)) {
    return data.items.map(mapUserData);
  }
  
  // If data is directly an array
  if (Array.isArray(data)) {
    return data.map(mapUserData);
  }
  
  // If data is a single user object
  return mapUserData(data);
};

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `users-${skip}-${limit}`,
    () => userService.getAll(skip, limit)
  );

  return {
    users: mapUsersResponse(data),
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
