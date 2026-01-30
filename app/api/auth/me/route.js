/**
 * Auth Me Proxy Route - Bypasses CORS issues for current user API
 */

export async function GET(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Auth Me proxy - API Base URL:', apiBaseUrl);
    console.log('Auth Me proxy - Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/auth/me`;
    console.log('Auth Me proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': authHeader,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Auth Me proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Auth Me proxy - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Auth Me proxy error:', error);
    
    let errorMessage = 'Auth Me proxy failed';
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}