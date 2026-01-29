import { apiClient, tokenManager } from '../api';

export const authService = {
  login: async (email, password) => {
    // Login endpoint should not include auth token
    return apiClient.post('api/auth/login', { email, password }, { skipAuth: true });
  },

  register: async (userData) => {
    // Register endpoint should not include auth token
    return apiClient.post('api/auth/register', userData, { skipAuth: true });
  },

  logout: async () => {
    try {
      // Try to call the logout API endpoint
      await apiClient.post('api/auth/logout');
      console.log('✅ Logout API call successful');
    } catch (e) {
      // If the API call fails (404, network error, etc.), log it but continue
      console.warn("⚠️ Logout API failed (this is not critical):", e.message);
      // Don't throw the error - we still want to clear local data
    }
    
    // Always clear local authentication data regardless of API response
    tokenManager.clear();
    console.log('🔄 Local authentication data cleared');
  },

  getCurrentUser: async () => {
    // Try different possible endpoint formats
    const endpointsToTry = [
      'api/auth/me',        // Standard format
      'api/auth/me/',       // With trailing slash
      'api/user/me',        // Alternative path
      'api/users/me'        // Users endpoint
    ];

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔍 Trying getCurrentUser endpoint: ${endpoint}`);
        const result = await apiClient.get(endpoint).catch(error => {
          if (error.message.includes('404')) {
            return null;
          }
          throw error;
        });
        
        if (result !== null) {
          return result;
        }
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }

    // If all endpoints failed or returned null, throw a user-friendly error
    console.error('❌ All getCurrentUser endpoints failed - API may not support user profile endpoints');
    throw new Error('User profile API endpoints not available');
  }
};
