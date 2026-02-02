/**
 * Simple API Client - Direct Backend Calls
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

// Get API base URL from environment with build-time fallback
const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Debug logging
  console.log('🔍 API URL Debug:', {
    NEXT_PUBLIC_API_URL: apiUrl,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
  
  // For build time, allow missing env var but warn
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ NEXT_PUBLIC_API_URL not set in production. Using fallback.');
      return 'https://228385806398.ngrok-free.app/'; // Use direct URL as fallback
    }
    return 'https://228385806398.ngrok-free.app/'; // Development fallback
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
 * Simple fetch wrapper for API calls with retry logic
 */
export const fetchApi = async (endpoint, options = {}, retryCount = 0) => {
  const maxRetries = 2;
  
  // Runtime check for API URL
  if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL environment variable must be set in Vercel dashboard');
  }
  
  // Check if this is a Next.js API route (starts with /)
  const isNextApiRoute = endpoint.startsWith('/');
  
  let url;
  if (isNextApiRoute) {
    // Next.js API route - use relative path
    url = endpoint;
  } else {
    // External API - use full URL
    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    url = `${baseUrl}/${cleanEndpoint}`;
  }
  
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
    // Add timeout for all requests - longer for login and updates
    signal: AbortSignal.timeout(
      endpoint.includes('auth/login') ? 30000 : 
      (options.method === 'PUT' || options.method === 'POST') ? 45000 : 
      15000
    ),
  };

  console.log(`🚀 API Request: ${config.method} ${url}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);

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

    // Handle 500 errors with better messaging
    if (response.status === 500) {
      console.error('🚨 Server Error (500):', url);
      throw new Error('Backend server error. The application will use fallback data.');
    }

    // Handle 502/503/504 errors (backend connectivity issues) - retry these
    if (response.status >= 502 && response.status <= 504) {
      console.error('🚨 Backend Connectivity Error:', response.status, url);
      
      // Retry on gateway errors
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying request in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return fetchApi(endpoint, options, retryCount + 1);
      }
      
      throw new Error('Backend server is not accessible. The application will use fallback data.');
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
    
    // Handle network errors with retry
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      if (retryCount < maxRetries) {
        console.log(`🔄 Network error, retrying in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return fetchApi(endpoint, options, retryCount + 1);
      }
      throw new Error('Network error: Backend server is not accessible. The application will use fallback data.');
    }
    
    // Handle timeout errors with retry
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      if (retryCount < maxRetries) {
        console.log(`🔄 Timeout error, retrying in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return fetchApi(endpoint, options, retryCount + 1);
      }
      throw new Error('Request timeout: Backend server is taking too long to respond. The application will use fallback data.');
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
