/**
 * Container Item by ID Routes
 */

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    // Ensure ID is an integer
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const backendUrl = `${apiBaseUrl}/api/container-items/${itemId}`;
    console.log('📦 Container item GET by ID - Backend URL:', backendUrl);
    console.log('📦 Container item GET by ID - Item ID:', itemId);
    
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
    console.log('📦 Container item GET by ID - Response status:', response.status);
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Container item GET by ID error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    // Ensure ID is an integer
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      console.error('📦 Container item PUT - Invalid ID:', id);
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const backendUrl = `${apiBaseUrl}/api/container-items/${itemId}`;
    console.log('📦 Container item PUT - Backend URL:', backendUrl);
    console.log('📦 Container item PUT - Item ID:', itemId);
    console.log('📦 Container item PUT - Request Body:', body);
    
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
      signal: AbortSignal.timeout(10000),
    });
    
    const data = await response.text();
    console.log('📦 Container item PUT - Response status:', response.status);
    console.log('📦 Container item PUT - Response body:', data);
    
    if (!response.ok) {
      console.error('📦 Container item PUT - BACKEND ERROR:', {
        status: response.status,
        statusText: response.statusText,
        body: data,
        url: backendUrl,
        requestBody: body
      });
    }
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('📦 Container item PUT - EXCEPTION:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    // Ensure ID is an integer
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const backendUrl = `${apiBaseUrl}/api/container-items/${itemId}`;
    console.log('📦 Container item DELETE - Backend URL:', backendUrl);
    console.log('📦 Container item DELETE - Item ID:', itemId);
    
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
    console.log('📦 Container item DELETE - Response status:', response.status);
    console.log('📦 Container item DELETE - Response body:', data);
    
    if (!response.ok) {
      console.error('📦 Container item DELETE - Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: data
      });
    }
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('📦 Container item DELETE error:', error);
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
