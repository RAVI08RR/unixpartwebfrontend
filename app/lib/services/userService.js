import { fetchApi } from '../api';

// Function to map frontend fields to API expected fields
const mapToApiFields = (userData) => {
  const apiData = { ...userData };
  
  // Map frontend fields to API fields
  if (userData.name && !userData.full_name) {
    apiData.full_name = userData.name;
  }
  
  if (userData.status !== undefined && userData.is_active === undefined) {
    apiData.is_active = userData.status;
  }
  
  if (userData.user_code && !userData.username) {
    apiData.username = userData.user_code;
  }
  
  return apiData;
};

// Function to map API response fields to frontend expected fields
const mapFromApiFields = (userData) => {
  if (!userData) return userData;
  
  return {
    ...userData,
    // Map API fields to frontend expected fields
    name: userData.full_name || userData.name,
    status: userData.is_active !== undefined ? userData.is_active : userData.status,
    user_code: userData.username || userData.user_code,
    // Keep original fields as well for backward compatibility
    full_name: userData.full_name,
    is_active: userData.is_active,
    username: userData.username,
    // Profile image
    profile_image: userData.profile_image || null,
  };
};

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    // Use Next.js proxy route to bypass CORS issues
    const response = await fetchApi(`/api/users?skip=${skip}&limit=${limit}`);
    
    // Handle both array and object responses
    if (response && response.items && Array.isArray(response.items)) {
      return {
        ...response,
        items: response.items.map(mapFromApiFields)
      };
    } else if (Array.isArray(response)) {
      return response.map(mapFromApiFields);
    }
    
    return response;
  },

  // Get single user by ID
  getById: async (id) => {
    const response = await fetchApi(`/api/users/${id}`);
    return mapFromApiFields(response);
  },

  // Create new user
  create: async (userData) => {
    const apiData = mapToApiFields(userData);
    const response = await fetchApi('/api/users', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    return mapFromApiFields(response);
  },

  // Update existing user
  update: async (id, userData) => {
    const apiData = mapToApiFields(userData);
    const response = await fetchApi(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
    return mapFromApiFields(response);
  },

  // Delete user
  delete: async (id) => {
    return fetchApi(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload profile image
  uploadProfileImage: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000/').replace(/\/+$/, '');
    
    const response = await fetch(`${apiBaseUrl}/api/users/${userId}/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload profile image');
    }

    return response.json();
  },
};

