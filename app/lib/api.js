// Fallback API URL (absolute)
// Base URL logic: Use proxy on client, environment variable or fallback on server
export const getApiBaseUrl = () => {
  // Direct access to backend as user requested, bypassing local proxy
  return process.env.NEXT_PUBLIC_API_URL || "https://ccb7878ed7f8.ngrok-free.app";
};

export const API_BASE_URL = getApiBaseUrl(); // Keep for legacy if needed, but use internal logic for fetch

// Token Storage Management
const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) return null;

  // Cleanup: Remove quotes if stored as JSON string
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  // Force-kill mock tokens to prevent them from being sent to real API
  if (token.startsWith('mock_') || token.includes('OFFLINE')) {
    console.warn("⚠️ Detected stale Mock Token. Clearing session to force real authentication.");
    clearAuthToken(); 
    return null;
  }

  return token;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export async function fetchApi(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, ""); // Remove trailing slash
  const safeEndpoint = endpoint.replace(/^\/+/, ""); // Remove leading slash
  
  // 1. Normalize URL to prevent double slashes
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${safeEndpoint}`;
  
  const token = getAuthToken();
  // Mock mode check removed as requested - all requests will attempt network call
  
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  // Always attach token if available, UNLESS it's an auth endpoint or a mock token
  const isAuthEndpoint = endpoint.includes('auth/login') || endpoint.includes('auth/register');
  const isMockToken = token && (token.startsWith('mock_') || token.includes('OFFLINE'));
  
  if (token && !isAuthEndpoint && !isMockToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Debug logging for developers
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`);
    if (config.headers['Authorization']) {
       console.log(`🔑 Header sent: ${config.headers['Authorization'].substring(0, 15)}...`);
    } else {
       console.warn(`⚠️ No Authorization header present for ${url}`);
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
       console.error(`🔒 AUTH FAILURE (401) on ${url}. Token is invalid or expired.`);
       if (typeof window !== 'undefined' && token) {
         console.warn("Clearing invalid session.");
         clearAuthToken();
       }
       throw new Error("Your session has expired. Please log in again.");
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    let errorData = {};
    
    if (!response.ok) {
      // 3. Improve error handling for JSON and text responses
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        const textError = await response.text();
        console.error("Non-JSON Error Response:", textError);
        errorData = { message: `Server error: ${response.status} ${response.statusText}` };
      }
      
      // Better error message extraction for FastAPI
      let errorMessage = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData.detail === 'object' && !Array.isArray(errorData.detail)) {
        errorMessage = JSON.stringify(errorData.detail);
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map(d => typeof d === 'object' ? `${d.loc?.join('.') || 'error'}: ${d.msg || 'unknown'}` : d).join(', ');
      }
      
      console.error(`❌ API Error Body (Status ${response.status}):`, errorData);
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      // console.log(`✅ API Success: ${url}`, data); // Reduced noise
      return data;
    } else {
      console.warn("Expected JSON but received:", contentType);
      return null;
    }
  } catch (error) {
    console.error(`❌ API Failed: ${url}`, error);
    // 3. Improve network error messages
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to the API. Please check your internet connection or server status.');
    }
    throw error;
  }
}
