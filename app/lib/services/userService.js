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
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Use Next.js API proxy route to avoid mixed content errors
    const uploadUrl = `/api/users/${userId}/upload-profile-image`;
    
    console.log('📸 Uploading profile image:', {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadUrl,
      hasToken: !!token
    });
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout for image upload
      });

      console.log('📸 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Profile image upload failed with status:', response.status);
        console.error('❌ Response body:', errorText);
        
        let errorMessage = `Failed to upload profile image (${response.status})`;
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use the text as error message
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Profile image uploaded successfully:', result);
      return result;
    } catch (error) {
      // Handle network errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Upload timeout: The image upload took too long. Please try with a smaller image.');
      }
      
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      // Re-throw other errors
      throw error;
    }
  },
  
  // Get profile image URL
  getProfileImageUrl: (profileImagePath) => {
    if (!profileImagePath) return null;
    
    // If it's already a full URL, return it
    if (profileImagePath.startsWith('http://') || profileImagePath.startsWith('https://')) {
      return profileImagePath;
    }
    
    // Get API base URL - check multiple sources
    let apiBaseUrl = '';
    
    // First try to get from environment variable (works in both build and runtime)
    if (typeof window !== 'undefined') {
      // Client-side: use the environment variable that was baked in at build time
      apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    } else {
      // Server-side: use the environment variable
      apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    }
    
    // Fallback to hardcoded URL if environment variable is not set
    if (!apiBaseUrl) {
      apiBaseUrl = 'http://srv1029267.hstgr.cloud:8000';
      console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using fallback:', apiBaseUrl);
    }
    
    // Remove trailing slashes
    apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
    
    // Remove leading slash from profile image path if present
    const cleanPath = profileImagePath.startsWith('/') ? profileImagePath.substring(1) : profileImagePath;
    
    const fullUrl = `${apiBaseUrl}/${cleanPath}`;
    console.log('🖼️ Profile image URL:', { profileImagePath, apiBaseUrl, fullUrl });
    
    return fullUrl;
  },
};

