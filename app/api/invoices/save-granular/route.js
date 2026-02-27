/**
 * Save Granular Invoice Proxy Route
 */

export async function POST(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    console.log('Save granular invoice proxy - Request body length:', body.length);
    
    const backendUrl = `${apiBaseUrl}/api/invoices/save-granular`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout for complex operations
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Save granular invoice proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save granular invoice', 
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
