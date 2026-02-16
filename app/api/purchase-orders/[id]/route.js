import { NextResponse } from 'next/server';

const getBackendUrl = () => {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const apiBaseUrl = getBackendUrl();
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/purchase-orders/${id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    
    if (!response.ok) {
       // If backend returns 404, we should return 404 too
       return new Response(null, { status: response.status });
    }

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const apiBaseUrl = getBackendUrl();
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    const backendUrl = `${apiBaseUrl}/api/purchase-orders/${id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
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
    const { id } = await params;
    const apiBaseUrl = getBackendUrl();
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/purchase-orders/${id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'DELETE', headers });
    
    // For DELETE, backend might return 204 No Content or JSON
    const data = response.status === 204 ? null : await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
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
