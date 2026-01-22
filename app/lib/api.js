export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://3d3a2b4e7863.ngrok-free.app";

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const config = {
    ...options,
    mode: 'cors',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Debug logging for developers
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`, {
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : null
    });
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    let errorData = {};
    
    if (!response.ok) {
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
        errorMessage = errorData.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
      }
      
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`✅ API Success: ${url}`, data);
      return data;
    } else {
      console.warn("Expected JSON but received:", contentType);
      return null;
    }
  } catch (error) {
    console.error(`❌ API Failed: ${url}`, error);
    // Provide more helpful error messages
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the API. This could be a CORS issue or the server is down.');
    }
    throw error;
  }
}
