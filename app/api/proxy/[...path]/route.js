/**
 * Next.js API Proxy to handle CORS issues
 * This proxies requests to your backend API to avoid CORS problems
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://a36498aba6e6.ngrok-free.app';

export async function GET(request, { params }) {
  return handleRequest('GET', request, { params });
}

export async function POST(request, { params }) {
  return handleRequest('POST', request, { params });
}

export async function PUT(request, { params }) {
  return handleRequest('PUT', request, { params });
}

export async function DELETE(request, { params }) {
  return handleRequest('DELETE', request, { params });
}

export async function PATCH(request, { params }) {
  return handleRequest('PATCH', request, { params });
}

async function handleRequest(method, request, { params }) {
  try {
    // Await params since it's a Promise in Next.js 15+
    const resolvedParams = await params;
    
    // Reconstruct the API path
    const apiPath = Array.isArray(resolvedParams.path) ? resolvedParams.path.join('/') : resolvedParams.path;
    const url = new URL(request.url);
    const queryString = url.search;
    
    // Build the target URL
    const targetUrl = `${API_BASE_URL.replace(/\/+$/, '')}/${apiPath}${queryString}`;
    
    // Debug logging
    console.log('Proxy request:', {
      method,
      apiPath,
      targetUrl,
      params: resolvedParams.path
    });
    
    // Get request body for POST/PUT/PATCH
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await request.text();
    }
    
    // Forward headers (excluding host and origin)
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    
    // Add ngrok header to skip browser warning
    headers['ngrok-skip-browser-warning'] = 'true';
    
    // Make the request to your backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });
    
    // Get response data
    const responseData = await response.text();
    
    // Forward the response with CORS headers
    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error.message }),
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}