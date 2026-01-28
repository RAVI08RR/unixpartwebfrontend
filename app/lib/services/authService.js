import { fetchApi, clearAuthToken } from '../api';

export const authService = {
  login: async (email, password) => {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
        await fetchApi('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error("Logout API failed", e);
    }
    clearAuthToken();
  },

  getCurrentUser: async () => {
      return fetchApi('/api/auth/me');
  }
};
