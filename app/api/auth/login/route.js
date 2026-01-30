/**
 * Login Proxy Route - Bypasses CORS issues for login only
 * All other API calls remain direct to backend
 */

export async function POST(request) {
  try {
    // Get the login data from the request
    const loginData = await request.json();
    
    // Get API base URL and clean it
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    console.log('Login proxy - API Base URL:', apiBaseUrl);
    console.log('Login proxy - Request data:', loginData);
    
    // Make the request to your FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/auth/login`;
    console.log('Login proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(loginData),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Login proxy - Backend response status:', response.status);
    console.log('Login proxy - Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response data
    const data = await response.text();
    console.log('Login proxy - Backend response data length:', data.length);
    console.log('Login proxy - Backend response data:', data);
    
    // If it's a 500 error, let's provide more debugging info
    if (response.status === 500) {
      console.error('🚨 Backend 500 Error Details:');
      console.error('- URL:', backendUrl);
      console.error('- Request Body:', JSON.stringify(loginData));
      console.error('- Response:', data);
      
      // Try to test if the backend is accessible at all
      try {
        const healthCheck = await fetch(`${apiBaseUrl}/`, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          signal: AbortSignal.timeout(5000),
        });
        console.log('🔍 Backend health check status:', healthCheck.status);
        const healthData = await healthCheck.text();
        console.log('🔍 Backend health check response:', healthData);
      } catch (healthError) {
        console.error('🔍 Backend health check failed:', healthError.message);
      }
    }
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Login proxy error:', error);
    
    let errorMessage = 'Login proxy failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Backend request timeout - server took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend server';
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: error.message,
        backend_url: process.env.NEXT_PUBLIC_API_URL,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}