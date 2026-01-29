import { apiClient } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    return apiClient.get('api/users/', { skip, limit });
  },

  // Get single user by ID
  getById: async (id) => {
    return apiClient.get(`api/users/${id}`);
  },

  // Create new user
  create: async (userData) => {
    return apiClient.post('api/users/', userData);
  },

  // Update existing user
  update: async (id, userData) => {
    return apiClient.put(`api/users/${id}`, userData);
  },

  // Delete user
  delete: async (id) => {
    return apiClient.delete(`api/users/${id}`);
  },
};
