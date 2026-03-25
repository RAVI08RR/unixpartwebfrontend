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

  // Get dropdown users
  getDropdown: async () => {
    try {
      return await fetchApi('/api/dropdown/users');
    } catch (error) {
      console.error("👤 Users Dropdown API failed:", error.message);
      return userService.getAll(0, 500); // Fallback to getAll if dropdown endpoint fails
    }
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
    
    // Get token
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    
    // Add all user data fields to FormData
    Object.keys(userData).forEach(key => {
      const value = userData[key];
      
      // Handle arrays (branch_ids, supplier_ids, permission_ids)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Send each array item separately with the same key
          value.forEach(item => {
            formData.append(key, item);
          });
        } else {
          // Send empty string for empty arrays
          formData.append(key, '');
        }
      } else if (value !== null && value !== undefined && value !== '') {
        // Send other values as strings
        formData.append(key, String(value));
      } else {
        // Send empty string for null/undefined values
        formData.append(key, '');
      }
    });
    
    console.log("📤 FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    // Send as FormData (don't set Content-Type, browser will set it with boundary)
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will add boundary automatically
      },
      body: formData,
    });
    
    console.log('📤 Create user response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create user failed:', errorText);
      console.error('❌ Response status:', response.status);
      
      let errorMessage = `Failed to create user (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed error data:', errorData);
        
        // Handle different error response formats
        if (errorData.detail) {
          // FastAPI validation error format
          if (Array.isArray(errorData.detail)) {
            // Validation errors array
            const errors = errorData.detail.map(err => {
              const field = Array.isArray(err.loc) ? err.loc.join('.') : 'unknown';
              return `${field}: ${err.msg}`;
            }).join(', ');
            errorMessage = `Validation Error: ${errors}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        if (errorText && errorText.length < 500) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ User created successfully:', result);
    return mapFromApiFields(result);
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
    
    // Extract the relative path from full URL if present
    let cleanPath = profileImagePath;
    
    // If it's a full URL, extract just the path part
    if (profileImagePath.startsWith('http://') || profileImagePath.startsWith('https://')) {
      try {
        const url = new URL(profileImagePath);
        // Get the pathname without leading slash
        cleanPath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      } catch (e) {
        console.error('Failed to parse profile image URL:', profileImagePath);
        return null;
      }
    } else {
      // Remove leading slash if present
      cleanPath = profileImagePath.startsWith('/') ? profileImagePath.substring(1) : profileImagePath;
    }
    
    // Always use Next.js API proxy route to avoid mixed content errors
    // This works in both local (HTTP) and production (HTTPS) environments
    const proxyUrl = `/api/images/${cleanPath}`;
    
    console.log('🖼️ Profile image URL:', { 
      originalPath: profileImagePath, 
      cleanPath,
      proxyUrl 
    });
    
    return proxyUrl;
  },
};

