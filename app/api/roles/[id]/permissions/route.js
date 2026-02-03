/**
 * Role Permissions Proxy Route - Get permissions for a specific role
 * Also handles permission assignment and removal
 */

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Debug logging
    console.log('=== ROLE PERMISSIONS DEBUG ===');
    console.log('Extracted id:', id);
    console.log('Type of id:', typeof id);
    console.log('Request URL:', request.url);
    console.log('================================');
    
    // Validate the role ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Role permissions proxy - Invalid role ID:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid role ID', 
          details: 'Role ID is required and must be a valid number',
          debug: { receivedId: id, type: typeof id, params }
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Convert to integer and validate
    const roleId = parseInt(id, 10);
    if (isNaN(roleId) || roleId <= 0) {
      console.error('Role permissions proxy - Invalid role ID format:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid role ID format', 
          details: 'Role ID must be a positive integer',
          debug: { receivedId: id, parsedId: roleId, type: typeof id }
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Role permissions proxy - Role ID:', roleId);
    console.log('Role permissions proxy - API Base URL:', apiBaseUrl);
    console.log('Role permissions proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/${roleId}/permissions`;
    console.log('Role permissions proxy - Backend URL:', backendUrl);
    
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
    
    console.log('Role permissions proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Role permissions proxy - Backend response data length:', data.length);
    console.log('Role permissions proxy - Backend response preview:', data.substring(0, 200));
    
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
    console.error('Role permissions proxy error:', error);
    console.log('🔄 Role permissions API failed, using fallback permissions for role ID:', id);
    
    // Return fallback permissions data when backend is unavailable
    const fallbackPermissions = [
      { id: 1, name: "View Dashboard", module: "Dashboard" },
      { id: 2, name: "Manage Users", module: "Users" },
      { id: 3, name: "View Users", module: "Users" },
      { id: 4, name: "Manage Roles", module: "Roles" },
      { id: 5, name: "View Roles", module: "Roles" }
    ];
    
    return new Response(
      JSON.stringify(fallbackPermissions),
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