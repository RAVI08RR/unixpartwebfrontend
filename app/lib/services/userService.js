import { fetchApi } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    return fetchApi(`api/users?skip=${skip}&limit=${limit}`);
  },

  // Get single user by ID
  getById: async (id) => {
    return fetchApi(`api/users/${id}`);
  },

  // Debug method to check available users
  debugListUsers: async () => {
    try {
      console.log('🔍 Fetching users list for debugging...');
      const users = await userService.getAll(0, 10);
      console.log('📋 Available users:', users);
      if (Array.isArray(users) && users.length > 0) {
        console.log('🆔 Available user IDs:', users.map(u => u.id));
      } else {
        console.log('⚠️ No users found or unexpected response format');
      }
      return users;
    } catch (error) {
      console.error('❌ Failed to fetch users for debugging:', error);
      return [];
    }
  },

  // Create new user
  create: async (userData) => {
    console.log("userService.create: POST api/users", userData);
    
    // Try different endpoint formats to handle potential API variations
    const endpointsToTry = [
      'api/users',      // Standard format
      'api/users/',     // With trailing slash
    ];

    let lastError;
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔄 Trying create endpoint: ${endpoint}`);
        return await fetchApi(endpoint, {
          method: 'POST',
          body: JSON.stringify(userData),
        });
      } catch (error) {
        console.warn(`❌ Create endpoint ${endpoint} failed:`, error.message);
        lastError = error;
        
        // If this is a 422 error, log the detailed error for debugging
        if (error.message.includes('422') || error.message.includes('Unprocessable Entity')) {
          console.error('🚨 422 Validation Error Details:', {
            endpoint,
            userData,
            error: error.message
          });
        }
        continue;
      }
    }

    // If all endpoints failed, throw the last error
    throw lastError;
  },

// Update existing user
update: async (id, userData) => {
  console.log(`🔄 [${new Date().toISOString()}] Updating user:`, { 
    id, 
    data: userData 
  });

  try {
    // First, let's see what users are available
    await userService.debugListUsers();

    // Clean the data - remove undefined/null values
    const cleanData = Object.fromEntries(
      Object.entries(userData).filter(([_, v]) => v !== undefined && v !== null)
    );
    console.log('🧹 Cleaned data:', cleanData);

    // Try different endpoint formats to see which one works
    const endpointsToTry = [
      `api/users/${id}`,      // Standard format
      `api/users/${id}/`,     // With trailing slash
    ];

    let lastError;
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        return await fetchApi(endpoint, {
          method: 'PUT',
          body: JSON.stringify(cleanData),
        });
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all endpoints failed, throw the last error
    throw lastError;
  } catch (error) {
    console.error('❌ Error in update:', {
      error: error.message,
      userId: id,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
},

  // Delete user
  delete: async (id) => {
    console.log('🗑️ Deleting user:', id);
    return fetchApi(`api/users/${id}`, {
      method: 'DELETE',
    });
  },
};
