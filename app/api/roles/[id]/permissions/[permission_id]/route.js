/**
 * Role Permission Assignment/Removal Proxy Route
 * POST - Assign permission to role
 * DELETE - Remove permission from role
 */

export async function POST(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id, permission_id } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Assign permission proxy - Role ID:', id, 'Permission ID:', permission_id);
    console.log('Assign permission proxy - API Base URL:', apiBaseUrl);
    console.log('Assign permission proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${id}/permissions/${permission_id}`;
    console.log('Assign permission proxy - Backend URL:', backendUrl);
    
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
    });
    
    console.log('Assign permission proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Assign permission proxy - Backend response data length:', data.length);
    
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
    console.error('Assign permission proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Assign permission proxy failed', 
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
    const { id, permission_id } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Remove permission proxy - Role ID:', id, 'Permission ID:', permission_id);
    console.log('Remove permission proxy - API Base URL:', apiBaseUrl);
    console.log('Remove permission proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${id}/permissions/${permission_id}`;
    console.log('Remove permission proxy - Backend URL:', backendUrl);
    
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
    
    console.log('Remove permission proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Remove permission proxy - Backend response data length:', data.length);
    
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
    console.error('Remove permission proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Remove permission proxy failed', 
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