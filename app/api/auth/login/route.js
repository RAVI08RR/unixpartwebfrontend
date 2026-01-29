/**
 * Login Proxy Route - Bypasses CORS issues for login only
 * All other API calls remain direct to backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app';

export async function POST(request) {
  try {
    // Get the login data from the request
    const loginData = await request.json();
    
    // Make the request to your FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(loginData),
    });
    
    // Get response data
    const data = await response.text();
    
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
        error: 'Login failed', 
        details: error.message 
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