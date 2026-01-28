import { fetchApi, API_BASE_URL } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    return fetchApi(`${API_BASE_URL}/api/users/?skip=${skip}&limit=${limit}`);
  },

  // Get single user by ID
  getById: async (id) => {
    return fetchApi(`${API_BASE_URL}/api/users/${id}/`);
  },

  // Create new user
  create: async (userData) => {
    console.log("userService.create: POST /api/users/", userData);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update existing user
  update: async (id, userData) => {
    const userId = parseInt(id);
    console.log(`userService.update: Calling PUT /api/users/${userId}/`, userData);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete user');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};
