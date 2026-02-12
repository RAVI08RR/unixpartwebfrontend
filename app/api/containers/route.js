/**
 * Containers Proxy Route - Bypasses CORS issues for containers API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    const supplier_id = searchParams.get('supplier_id');
    const branch_id = searchParams.get('branch_id');
    const status = searchParams.get('status');
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Containers proxy GET - API Base URL:', apiBaseUrl);
    console.log('Containers proxy GET - Auth header present:', !!authHeader);
    
    // Build query parameters
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (supplier_id) queryParams += `&supplier_id=${supplier_id}`;
    if (branch_id) queryParams += `&branch_id=${branch_id}`;
    if (status) queryParams += `&status=${status}`;
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/containers/?${queryParams}`;
    console.log('Containers proxy GET - Backend URL:', backendUrl);
    
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
    
    console.log('Containers proxy GET - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Containers proxy GET - Backend response data length:', data.length);
    
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
    console.error('Containers proxy GET error:', error);
    
    return new Response(
      JSON.stringify([]),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Containers proxy POST - API Base URL:', apiBaseUrl);
    console.log('Containers proxy POST - Auth header present:', !!authHeader);
    console.log('Containers proxy POST - Request body length:', body.length);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/containers/`;
    console.log('Containers proxy POST - Backend URL:', backendUrl);
    
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
    
    console.log('Containers proxy POST - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Containers proxy POST - Backend response data length:', data.length);
    
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
    console.error('Containers proxy POST error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create container', details: error.message }),
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
