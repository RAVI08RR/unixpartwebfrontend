/**
 * Suppliers Proxy Route - Bypasses CORS issues for suppliers API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    const status = searchParams.get('status') || '';
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Suppliers proxy GET - API Base URL:', apiBaseUrl);
    console.log('Suppliers proxy GET - Auth header present:', !!authHeader);
    
    // Build query parameters
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (status) queryParams += `&status=${status}`;
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/suppliers/?${queryParams}`;
    console.log('Suppliers proxy GET - Backend URL:', backendUrl);
    
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
    
    console.log('Suppliers proxy GET - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Suppliers proxy GET - Backend response data length:', data.length);
    
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
    console.error('Suppliers proxy GET error:', error);
    
    let errorMessage = 'Suppliers proxy GET failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - backend took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend API';
      statusCode = 502;
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

export async function POST(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Suppliers proxy POST - API Base URL:', apiBaseUrl);
    console.log('Suppliers proxy POST - Auth header present:', !!authHeader);
    console.log('Suppliers proxy POST - Request body length:', body.length);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/suppliers/`;
    console.log('Suppliers proxy POST - Backend URL:', backendUrl);
    
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
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });
    
    console.log('Suppliers proxy POST - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Suppliers proxy POST - Backend response data length:', data.length);
    
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
    console.error('Suppliers proxy POST error:', error);
    
    let errorMessage = 'Suppliers proxy POST failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - backend took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend API';
      statusCode = 502;
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