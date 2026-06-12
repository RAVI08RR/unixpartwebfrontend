import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');

  try {
    const { searchParams } = new URL(request.url);

    // Build query params — API uses start_date / end_date (not skip/limit)
    const params = new URLSearchParams();
    if (searchParams.get('start_date')) params.set('start_date', searchParams.get('start_date'));
    if (searchParams.get('end_date'))   params.set('end_date',   searchParams.get('end_date'));
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${apiBaseUrl}/api/employee/me/attendance${query}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // Backend has a known bug: returns 400 with
    // { message: "type object 'Attendance' has no attribute 'attendance_date'" }
    // Intercept it here and return an empty array so the client never sees an error.
    if (response.status === 400) {
      return new Response('[]', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Attendance-Notice': 'Backend returned 400 — returned empty array as fallback',
        },
      });
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
    // Network / server error — return empty array gracefully
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function POST(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.text();
    const response = await fetch(`${apiBaseUrl}/api/employee/me/attendance`, {
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
      { error: 'Failed to submit attendance', detail: error.message },
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
