import { fetchApi } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    return fetchApi(`/api/users/?skip=${skip}&limit=${limit}`);
  },

  // Get single user by ID
  getById: async (id) => {
    return fetchApi(`/api/users/${id}`);
  },

  // Create new user
  create: async (userData) => {
    return fetchApi('/api/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update existing user
  update: async (id, userData) => {
    const userId = parseInt(id);
    console.log(`userService.update: Calling PUT /api/users/${userId}`, userData);
    return fetchApi(`/api/users/${userId}`, {
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
