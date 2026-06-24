/**
 * Sales Data Proxy Route - Bypasses CORS issues for sales data API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const page_size = searchParams.get('page_size') || '10';

    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');

    console.log('Sales Data proxy GET - API Base URL:', apiBaseUrl);

    // Build query parameters
    let queryParams = `page=${page}&page_size=${page_size}`;

    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/sales-data?${queryParams}`;
    console.log('Sales Data proxy GET - Backend URL:', backendUrl);

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
      signal: AbortSignal.timeout(15000), // 15 second timeout
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Sales Data proxy GET error:', error);

    return new Response(
      JSON.stringify({
        error: 'Sales Data proxy GET failed',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
