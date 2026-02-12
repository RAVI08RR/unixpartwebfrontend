/**
 * Individual Container Proxy Route
 */

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return new Response(
        JSON.stringify({ error: 'Invalid container ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/containers/${id}`;
    
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
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container proxy GET error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch container' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return new Response(
        JSON.stringify({ error: 'Invalid container ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    const backendUrl = `${apiBaseUrl}/api/containers/${id}/`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container proxy PUT error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update container' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return new Response(
        JSON.stringify({ error: 'Invalid container ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/containers/${id}/`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container proxy DELETE error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete container' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
