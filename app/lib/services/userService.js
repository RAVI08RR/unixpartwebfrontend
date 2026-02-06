import { fetchApi } from '../api';

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
    // Log what we're sending
    console.log("📤 userService.create called with:", userData);
    console.log("📤 userData keys:", Object.keys(userData));
    console.log("📤 userData stringified:", JSON.stringify(userData, null, 2));
    
    // Send data as-is, API expects these field names
    const response = await fetchApi('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return mapFromApiFields(response);
  },

  // Update existing user
  update: async (id, userData) => {
    // Send data as-is, API expects these field names
    const response = await fetchApi(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
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
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    
    console.log('📸 Uploading profile image:', {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      apiUrl: `${apiBaseUrl}/api/users/${userId}/upload-profile-image`
    });
    
    const response = await fetch(`${apiBaseUrl}/api/users/${userId}/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Profile image upload failed:', errorText);
      let errorMessage = 'Failed to upload profile image';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Profile image uploaded successfully:', result);
    return result;
  },
  
  // Get profile image URL
  getProfileImageUrl: (profileImagePath) => {
    if (!profileImagePath) return null;
    
    // If it's already a full URL, return it
    if (profileImagePath.startsWith('http://') || profileImagePath.startsWith('https://')) {
      return profileImagePath;
    }
    
    // Otherwise, construct the full URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    return `${apiBaseUrl}/${profileImagePath}`;
  },
};

