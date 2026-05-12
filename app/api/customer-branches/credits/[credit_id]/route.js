/**
 * Customer Branch Credit by ID Proxy Route
 * GET /api/customer-branches/credits/{credit_id} - Get credit
 * PUT /api/customer-branches/credits/{credit_id} - Update credit
 * DELETE /api/customer-branches/credits/{credit_id} - Delete credit
 */

export async function GET(request, { params }) {
  try {
    const { credit_id } = await params;
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/customer-branches/credits/${credit_id}`;
    console.log(`🌐 Proxying credit GET request to: ${backendUrl}`);
    
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
    console.error('❌ Credit GET Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function PUT(request, { params }) {
  try {
    const { credit_id } = await params;
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - No token found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const body = await request.json();
    
    const backendUrl = `${apiBaseUrl}/api/customer-branches/credits/${credit_id}`;
    console.log(`🌐 Proxying credit PUT request to: ${backendUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'ngrok-skip-browser-warning': 'true',
    };
    
    const response = await fetch(backendUrl, { 
      method: 'PUT', 
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
    console.error('❌ Credit PUT Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { credit_id } = await params;
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - No token found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const backendUrl = `${apiBaseUrl}/api/customer-branches/credits/${credit_id}`;
    console.log(`🌐 Proxying credit DELETE request to: ${backendUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'ngrok-skip-browser-warning': 'true',
    };
    
    const response = await fetch(backendUrl, { 
      method: 'DELETE', 
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
    console.error('❌ Credit DELETE Proxy Error:', error);
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
