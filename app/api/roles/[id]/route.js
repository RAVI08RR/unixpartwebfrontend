/**
 * Individual Role Proxy Route - Handle GET, PUT, DELETE for specific role
 */

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Get role proxy - Role ID:', id);
    console.log('Get role proxy - API Base URL:', apiBaseUrl);
    console.log('Get role proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${id}`;
    console.log('Get role proxy - Backend URL:', backendUrl);
    
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
    });
    
    console.log('Get role proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Get role proxy - Backend response data length:', data.length);
    
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
    console.error('Get role proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Get role proxy failed', 
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

export async function PUT(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Update role proxy - Role ID:', id);
    console.log('Update role proxy - API Base URL:', apiBaseUrl);
    console.log('Update role proxy - Auth header present:', !!authHeader);
    console.log('Update role proxy - Request body:', body);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${id}`;
    console.log('Update role proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body,
    });
    
    console.log('Update role proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Update role proxy - Backend response data length:', data.length);
    
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
    console.error('Update role proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Update role proxy failed', 
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

export async function DELETE(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Delete role proxy - Role ID:', id);
    console.log('Delete role proxy - API Base URL:', apiBaseUrl);
    console.log('Delete role proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${id}`;
    console.log('Delete role proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });
    
    console.log('Delete role proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Delete role proxy - Backend response data length:', data.length);
    
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
    console.error('Delete role proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Delete role proxy failed', 
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}