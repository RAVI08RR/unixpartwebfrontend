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
  console.log(`🔄 [${new Date().toISOString()}] Updating user:`, { 
    id, 
    data: userData 
  });

  try {
    // First, let's verify the user exists by trying to fetch it
    console.log('🔍 Verifying user exists...');
    try {
      const existingUser = await userService.getById(id);
      console.log('✅ User exists:', existingUser);
    } catch (fetchError) {
      console.error('❌ User fetch failed:', fetchError.message);
      throw new Error(`User with ID ${id} not found or not accessible`);
    }

    // Clean the data - remove undefined/null values
    const cleanData = Object.fromEntries(
      Object.entries(userData).filter(([_, v]) => v !== undefined && v !== null)
    );
    console.log('🧹 Cleaned data:', cleanData);

    // Use fetchApi helper like other services, with PUT method
    // Try without trailing slash first
    console.log('🔄 Attempting PUT request...');
    return await fetchApi(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData),
    });
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
