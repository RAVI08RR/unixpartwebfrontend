/**
 * Simple API Client - Direct Backend Calls
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

// Get API base URL from environment with build-time fallback
const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // For build time, allow missing env var but warn
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('NEXT_PUBLIC_API_URL not set in production. API calls will fail.');
      return 'https://api.placeholder.com'; // Placeholder for build
    }
    return 'https://a36498aba6e6.ngrok-free.app'; // Development fallback
  }
  
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Token management
const TOKEN_KEY = 'access_token';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('current_user');
  }
};

/**
 * Simple fetch wrapper for API calls
 */
export const fetchApi = async (endpoint, options = {}) => {
  // Runtime check for API URL
  if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL environment variable must be set in Vercel dashboard');
  }
  
  // Clean URL construction - remove trailing slash from base and leading slash from endpoint
  const baseUrl = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  const url = `${baseUrl}/${cleanEndpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  // Add auth token if available (except for login/register)
  const token = getAuthToken();
  const isAuthEndpoint = endpoint.includes('auth/login') || endpoint.includes('auth/register');
  if (token && !isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: 'GET',
    ...options,
    headers,
  };

  console.log(`🚀 API Request: ${config.method} ${url}`);

  try {
    const response = await fetch(url, config);
    
    // Handle 401 - clear token and throw error
    if (response.status === 401) {
      clearAuthToken();
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(d => `${d.loc?.join('.') || 'error'}: ${d.msg || 'unknown'}`).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Use default error message if JSON parsing fails
      }
      
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the API. Please check your connection.');
    }
    
    throw error;
  }
};

// Convenience methods
export const apiClient = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return fetchApi(url);
  },
  
  post: (endpoint, data) => {
    return fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: (endpoint, data) => {
    return fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: (endpoint) => {
    return fetchApi(endpoint, {
      method: 'DELETE',
    });
  },
};

// Legacy exports for backward compatibility
export const API_BASE_URL_EXPORT = API_BASE_URL;
export const tokenManager = {
  get: getAuthToken,
  set: setAuthToken,
  clear: clearAuthToken,
};
