/**
 * Roles Proxy Route - Bypasses CORS issues for roles API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://d7fc9ee6fefb.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Roles proxy - API Base URL:', apiBaseUrl);
    console.log('Roles proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/?skip=${skip}&limit=${limit}`;
    console.log('Roles proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Roles proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Roles proxy - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Roles proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Roles proxy failed', 
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

export async function POST(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://d7fc9ee6fefb.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Create role proxy - API Base URL:', apiBaseUrl);
    console.log('Create role proxy - Auth header present:', !!authHeader);
    console.log('Create role proxy - Request body:', body);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/`;
    console.log('Create role proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Create role proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Create role proxy - Backend response data length:', data.length);
    console.log('Create role proxy - Backend response data:', data);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Create role proxy error:', error);
    
    let errorMessage = 'Create role proxy failed';
    let statusCode = 500;
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      errorMessage = 'Backend API timeout - please try again';
      statusCode = 504;
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Backend API unavailable - please check connection';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: error.message 
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}