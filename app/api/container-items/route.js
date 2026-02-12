/**
 * Container Items Proxy Route
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    const container_id = searchParams.get('container_id');
    const branch_id = searchParams.get('branch_id');
    const status = searchParams.get('status');
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (container_id) queryParams += `&container_id=${container_id}`;
    if (branch_id) queryParams += `&branch_id=${branch_id}`;
    if (status) queryParams += `&status=${status}`;
    
    const backendUrl = `${apiBaseUrl}/api/container-items/?${queryParams}`;
    console.log('📦 Container items proxy GET - Backend URL:', backendUrl);
    console.log('📦 Container items proxy GET - Params:', { skip, limit, container_id, branch_id, status });
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await response.text();
    console.log('📦 Container items proxy GET - Response status:', response.status);
    console.log('📦 Container items proxy GET - Response data length:', data.length);
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container items proxy GET error:', error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    const backendUrl = `${apiBaseUrl}/api/container-items/`;
    console.log('📦 Container items proxy POST - Backend URL:', backendUrl);
    console.log('📦 Container items proxy POST - Body:', body);
    
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
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await response.text();
    console.log('📦 Container items proxy POST - Response status:', response.status);
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container items proxy POST error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
