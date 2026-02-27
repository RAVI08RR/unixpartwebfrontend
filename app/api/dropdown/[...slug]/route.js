/**
 * Generic Dropdown Proxy Route
 * /api/dropdown/[...slug]
 */

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const path = slug.join('/');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    let backendUrl = `${apiBaseUrl}/api/dropdown/${path}`;
    if (queryString) backendUrl += `?${queryString}`;
    
    console.log(`🌐 Proxying dropdown request to: ${backendUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { 
      method: 'GET', 
      headers,
      cache: 'no-store'
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ Dropdown Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

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
