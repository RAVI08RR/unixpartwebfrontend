import { fetchApi, clearAuthToken } from '../api';

export const authService = {
  login: async (email, password) => {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return fetchApi('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
        // Try to call the logout API endpoint
        await fetchApi('/api/auth/logout/', { method: 'POST' });
        console.log('✅ Logout API call successful');
    } catch (e) {
        // If the API call fails (404, network error, etc.), log it but continue
        console.warn("⚠️ Logout API failed (this is not critical):", e.message);
        // Don't throw the error - we still want to clear local data
    }
    
    // Always clear local authentication data regardless of API response
    clearAuthToken();
    console.log('🔄 Local authentication data cleared');
  },

  getCurrentUser: async () => {
      return fetchApi('/api/auth/me/');
  }
};
