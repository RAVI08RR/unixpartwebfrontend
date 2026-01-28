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
  // CRITICAL: NEXT_PUBLIC_* vars are the ONLY way to expose env vars to browser in Next.js
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Production: MUST have API URL configured in Vercel
  if (!apiUrl) {
    // Only allow missing URL in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ NEXT_PUBLIC_API_URL not set. Using localhost fallback for development.');
      return 'http://localhost:8000';
    }
    
    // Production: Fail fast with clear error message for Vercel logs
    throw new Error(
      'CRITICAL: NEXT_PUBLIC_API_URL environment variable is not configured. ' +
      'Please set it in Vercel dashboard under Project Settings > Environment Variables'
    );
  }
  
  return apiUrl;
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
    "ngrok-skip-browser-warning": "true", // Required for ngrok
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
    console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`);
    if (config.headers['Authorization']) {
       console.log(`🔑 Header sent: ${config.headers['Authorization'].substring(0, 15)}...`);
    } else {
       const isAuth = url.includes('login') || url.includes('register');
       if (!isAuth) {
         console.warn(`⚠️ No Authorization header present for ${url}`);
       }
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
