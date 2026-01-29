import { fetchApi, clearAuthToken } from '../api';

export const authService = {
  login: async (email, password) => {
    // Use Next.js proxy route for login to bypass CORS issues
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    // Register uses direct API call (add proxy if needed)
    return fetchApi('api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
      // Direct API call for logout
      await fetchApi('api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Logout API failed:", e.message);
    }
    clearAuthToken();
  },

  getCurrentUser: async () => {
    try {
      // Direct API call for current user
      return await fetchApi('api/auth/me');
    } catch (error) {
      throw new Error('User profile not available');
    }
  }
};
