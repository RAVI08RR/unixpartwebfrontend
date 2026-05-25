export async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    // Remove the Next.js API route prefix to get the relative path
    // url.pathname could be /api/refund-items/invoice-item/123
    // We want /invoice-item/123
    let path = url.pathname.replace(/^\/api\/refund-items/, '');
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Construct backend URL
    const backendUrl = `${apiBaseUrl}/api/refund-items${path}${url.search}`;
    
    const authHeader = request.headers.get('authorization');
    
    const options = {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    };
    
    if (authHeader) {
      options.headers['Authorization'] = authHeader;
    }
    
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
      const text = await request.text();
      if (text) {
        options.body = text;
      }
    }
    
    console.log(`Proxying ${request.method} to ${backendUrl}`);
    
    const response = await fetch(backendUrl, options);
    const data = await response.text();
    
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
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy failed', details: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;

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
