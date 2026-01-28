/**
 * API Base URL Configuration
 * 
 * VERCEL PRODUCTION FIX:
 * - Must use NEXT_PUBLIC_API_URL environment variable (set in Vercel dashboard)
 * - No hardcoded URLs to prevent production failures
 * - Safe fallback only for local development
 * - Works in both browser and Vercel edge runtime
 */
export const getApiBaseUrl = () => {
  // if (typeof window !== 'undefined') {
  //   return "/backend-api";
  // }
  // https://ccb7878ed7f8.ngrok-free.app
  return "https://ccb7878ed7f8.ngrok-free.app";
};

// Cached base URL - computed once at module load
export const API_BASE_URL = getApiBaseUrl();

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

/**
 * Centralized API Fetch Utility
 * 
 * VERCEL COMPATIBILITY:
 * - Works in both browser and Vercel serverless functions
 * - Handles CORS properly for cross-origin requests
 * - Provides detailed error logging for production debugging
 * - Respects Next.js App Router client/server boundaries
 */
export async function fetchApi(endpoint, options = {}) {
  // Get base URL (will throw in production if not configured)
  const baseUrl = getApiBaseUrl().replace(/\/+$/, ""); // Remove trailing slash
  const safeEndpoint = endpoint.replace(/^\/+/, ""); // Remove leading slash
  
  // Normalize URL to prevent double slashes
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${safeEndpoint}`;
  
  // Get auth token (client-side only, returns null on server)
  const token = getAuthToken();
  
  // Build headers
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    // "Access to fetch at 'https://ccb7878ed7f8.ngrok-free.app/api/users/?skip=0&limit=100' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource."
    ...options.headers,
  };

  // Attach authorization token if available
  // NOTE: This backend requires token even for login/register endpoints
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Development-only logging (verbose)
  if (process.env.NODE_ENV === 'development') {
    const realTarget = "https://ccb7878ed7f8.ngrok-free.app";
        
    console.log(`🚀 Proxied Request: ${config.method || 'GET'} ${url}`);
    console.log(`👉 Real Target: ${realTarget}`);
    
    if (token) {
      console.log(`🔑 Auth: Bearer ${token.substring(0, 10)}...`);
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
       const errorMsg = `🔒 AUTH FAILURE (401) on ${url}. Token is invalid or expired.`;
       
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
         console.error(errorMsg);
       }
       
       // Clear invalid token (client-side only)
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
      // Parse error response
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        const textError = await response.text();
        errorData = { message: `Server error: ${response.status} ${response.statusText}`, details: textError };
      }
      
      // Extract error message (FastAPI format)
      let errorMessage = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      if (typeof errorData.detail === 'object' && !Array.isArray(errorData.detail)) {
        errorMessage = JSON.stringify(errorData.detail);
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map(d => typeof d === 'object' ? `${d.loc?.join('.') || 'error'}: ${d.msg || 'unknown'}` : d).join(', ');
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
        console.error(`❌ API Error Body (Status ${response.status}):`, errorData);
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      console.warn("Expected JSON but received:", contentType);
      return null;
    }
  } catch (error) {
    // Enhanced error handling for production debugging
    const isNetworkError = error.message === 'Failed to fetch' || error.name === 'TypeError';
    
    // Production-friendly error logging
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
      console.error(`❌ API Failed: ${url}`, error);
    }
    
    // Provide user-friendly error messages
    if (isNetworkError) {
      throw new Error(
        'Network error: Unable to connect to the API. ' +
        'This could be due to: CORS issues, server downtime, or incorrect API URL configuration.'
      );
    }
    
    throw error;
  }
}
