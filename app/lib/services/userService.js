import { fetchApi } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    // Use Next.js proxy route to bypass CORS issues
    return fetchApi(`/api/users?skip=${skip}&limit=${limit}`);
  },

  // Get single user by ID
  getById: async (id) => {
    return fetchApi(`/api/users/${id}`);
  },

  // Create new user
  create: async (userData) => {
    return fetchApi('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update existing user
  update: async (id, userData) => {
    return fetchApi(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  delete: async (id) => {
    return fetchApi(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};
