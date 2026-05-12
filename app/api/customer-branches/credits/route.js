/**
 * Customer Branch Credits Proxy Route
 * GET /api/customer-branches/credits - Get all credits
 * POST /api/customer-branches/credits - Create credit
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    let backendUrl = `${apiBaseUrl}/api/customer-branches/credits`;
    if (queryString) backendUrl += `?${queryString}`;
    
    console.log(`🌐 Proxying credits GET request to: ${backendUrl}`);
    
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
    console.error('❌ Credits GET Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function POST(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - No token found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const body = await request.json();
    
    const backendUrl = `${apiBaseUrl}/api/customer-branches/credits`;
    console.log(`🌐 Proxying credits POST request to: ${backendUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'ngrok-skip-browser-warning': 'true',
    };
    
    const response = await fetch(backendUrl, { 
      method: 'POST', 
      headers,
      body: JSON.stringify(body),
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
    console.error('❌ Credits POST Proxy Error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
