/**
 * Role by Slug Proxy Route - Get role by slug
 */

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { slug } = await params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://d7fc9ee6fefb.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Get role by slug proxy - Slug:', slug);
    console.log('Get role by slug proxy - API Base URL:', apiBaseUrl);
    console.log('Get role by slug proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/roles/slug/${slug}`;
    console.log('Get role by slug proxy - Backend URL:', backendUrl);
    
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
    
    console.log('Get role by slug proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Get role by slug proxy - Backend response data length:', data.length);
    
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
    console.error('Get role by slug proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Get role by slug proxy failed', 
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