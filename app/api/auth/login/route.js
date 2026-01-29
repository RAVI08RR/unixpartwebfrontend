/**
 * Login Proxy Route - Bypasses CORS issues for login only
 * All other API calls remain direct to backend
 */

export async function POST(request) {
  try {
    // Get the login data from the request
    const loginData = await request.json();
    
    // Get API base URL and clean it
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app').replace(/\/+$/, '');
    
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
    });
    
    console.log('Login proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Login proxy - Backend response data:', data);
    
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
    return new Response(
      JSON.stringify({ 
        error: 'Login proxy failed', 
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
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