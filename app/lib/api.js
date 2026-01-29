/**
 * Modern API Client for React/Next.js Applications
 * 
 * Features:
 * - Environment-based base URL configuration
 * - Automatic Bearer token attachment from localStorage
 * - Global 401 response handling with token cleanup
 * - Query parameter handling
 * - Comprehensive error handling
 * - JSON parsing with fallbacks
 * - Development logging
 */

// Environment-based API configuration
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL environment variable is required. ' +
      'Please set it in your .env.local file or Vercel environment variables.'
    );
  }
  
  return baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
};

// Token management utilities
const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

export const tokenManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    // Clean up quoted tokens (legacy cleanup)
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
      localStorage.setItem(TOKEN_KEY, token); // Save cleaned version
    }

    return token;
  },

  set: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
};

/**
 * Build query string from parameters object
 */
const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Main API Client Class
 */
class ApiClient {
  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Build complete URL with endpoint and query parameters
   */
  buildUrl(endpoint, queryParams = {}) {
    const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slashes
    const queryString = buildQueryString(queryParams);
    return `${this.baseUrl}/${cleanEndpoint}${queryString}`;
  }

  /**
   * Build request headers with authentication
   */
  buildHeaders(customHeaders = {}, skipAuth = false) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // For ngrok compatibility
      ...customHeaders,
    };

    // Attach Bearer token if available and not skipped
    if (!skipAuth) {
      const token = tokenManager.get();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API responses with comprehensive error handling
   */
  async handleResponse(response, url) {
    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      const errorMsg = `Authentication failed (401) on ${url}. Token is invalid or expired.`;
      
      // Production-friendly logging
      if (process.env.NODE_ENV === 'production') {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Authentication failed',
          url,
          status: 401,
          timestamp: new Date().toISOString()
        }));
      } else {
        console.error(`🔒 ${errorMsg}`);
      }
      
      // Clear invalid token
      tokenManager.clear();
      
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData = {};
      
      // Parse error response
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Server error: ${response.status} ${response.statusText}` };
        }
      } else {
        const textError = await response.text();
        errorData = { message: `Server error: ${response.status} ${response.statusText}`, details: textError };
      }
      
      // Extract error message (FastAPI format)
      let errorMessage = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      
      if (typeof errorData.detail === 'object' && !Array.isArray(errorData.detail)) {
        errorMessage = JSON.stringify(errorData.detail);
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail
          .map(d => typeof d === 'object' ? `${d.loc?.join('.') || 'error'}: ${d.msg || 'unknown'}` : d)
          .join(', ');
      }
      
      // Production-friendly error logging
      if (process.env.NODE_ENV === 'production') {
        console.error(JSON.stringify({
          level: 'error',
          message: 'API request failed',
          url,
          status: response.status,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }));
      } else {
        console.error(`❌ API Error (${response.status}):`, errorData);
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (e) {
        console.warn('Failed to parse JSON response:', e);
        return null;
      }
    }
    
    return await response.text();
  }

  /**
   * Core request method
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers: customHeaders = {},
      queryParams = {},
      skipAuth = false,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, queryParams);
    const headers = this.buildHeaders(customHeaders, skipAuth);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${method} ${url}`);
      if (body) {
        console.log('📦 Request Body:', JSON.parse(body));
      }
    }

    const config = {
      method,
      headers,
      body,
      ...fetchOptions,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response, url);
    } catch (error) {
      // Enhanced error handling for network issues
      const isNetworkError = error.message === 'Failed to fetch' || error.name === 'TypeError';
      
      if (process.env.NODE_ENV === 'production') {
        console.error(JSON.stringify({
          level: 'error',
          message: 'API call failed',
          url,
          error: error.message,
          type: isNetworkError ? 'network' : 'application',
          timestamp: new Date().toISOString()
        }));
      } else {
        console.error(`❌ API Request Failed: ${url}`, error);
      }
      
      if (isNetworkError) {
        throw new Error(
          'Network error: Unable to connect to the API. ' +
          'Please check your internet connection or try again later.'
        );
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, queryParams = {}, options = {}) {
    return this.request(endpoint, { ...options, queryParams });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Legacy compatibility - keep existing fetchApi function
export const fetchApi = (endpoint, options = {}) => {
  const { method = 'GET', body, headers, optional, ...rest } = options;
  
  return apiClient.request(endpoint, {
    method,
    body,
    headers,
    ...rest,
  }).catch(error => {
    if (optional && error.message.includes('404')) {
      return null;
    }
    throw error;
  });
};

// Export utilities
export { getApiBaseUrl, tokenManager };

// Export for backward compatibility
export const API_BASE_URL = getApiBaseUrl();
export const getAuthToken = tokenManager.get;
export const setAuthToken = tokenManager.set;
export const clearAuthToken = tokenManager.clear;
