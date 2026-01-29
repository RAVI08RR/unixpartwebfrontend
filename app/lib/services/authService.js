import { fetchApi, clearAuthToken } from '../api';

export const authService = {
  login: async (email, password) => {
    return fetchApi('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return fetchApi('api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
      await fetchApi('api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Logout API failed:", e.message);
    }
    clearAuthToken();
  },

  getCurrentUser: async () => {
    try {
      return await fetchApi('api/auth/me');
    } catch (error) {
      throw new Error('User profile not available');
    }
  }
};
