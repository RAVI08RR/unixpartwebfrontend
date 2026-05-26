/**
 * Individual Expense Proxy Route
 */

export async function GET(request, { params }) {
  try {
    const { expense_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/expenses/${expense_id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { expense_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    let body;
    if (contentType && contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.text();
    }
    
    const backendUrl = `${apiBaseUrl}/api/expenses/${expense_id}`;
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    if (contentType && !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType;
    }
    
    const response = await fetch(backendUrl, { method: 'PUT', headers, body });
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { expense_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/expenses/${expense_id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'DELETE', headers });
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
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
