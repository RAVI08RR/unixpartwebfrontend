import { NextResponse } from 'next/server';

// GET /api/employees - Get all employees
export async function GET(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');
  
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    
    const backendUrl = `${apiBaseUrl}/api/employees/?skip=${skip}&limit=${limit}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'ngrok-skip-browser-warning': 'true',
      },
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
    return NextResponse.json(
      { error: 'Failed to fetch employees', detail: error.message },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create employee
export async function POST(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');
  
  try {
    const body = await request.text();
    const backendUrl = `${apiBaseUrl}/api/employees/`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body,
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
    return NextResponse.json(
      { error: 'Failed to create employee', detail: error.message },
      { status: 500 }
    );
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
