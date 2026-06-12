import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');

  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';

    const response = await fetch(`${apiBaseUrl}/api/employee/me/leaves?skip=${skip}&limit=${limit}`, {
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
      { error: 'Failed to fetch leaves history', detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.text();
    const response = await fetch(`${apiBaseUrl}/api/employee/me/leaves`, {
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
      { error: 'Failed to submit leave request', detail: error.message },
      { status: 500 }
    );
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
