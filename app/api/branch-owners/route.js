/**
 * Branch Owners Proxy Route
 * GET - Get all branch owners
 * POST - Create branch owner
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip');
    const limit = searchParams.get('limit');
    let page = searchParams.get('page');
    let page_size = searchParams.get('page_size');

    if (!page && skip !== null) {
      const skipNum = parseInt(skip) || 0;
      const limitNum = parseInt(limit) || 100;
      page_size = String(limitNum);
      page = String(Math.floor(skipNum / limitNum) + 1);
    } else {
      if (!page) page = '1';
      if (!page_size) page_size = '100';
    }

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');

    const backendUrl = `${apiBaseUrl}/api/branch-owners/?page=${page}&page_size=${page_size}`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

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
    console.error('Branch owners GET error:', error);
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

    console.log('Branch owners POST - Request body:', body);

    const backendUrl = `${apiBaseUrl}/api/branch-owners/`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    console.log('Branch owners POST - Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.text();

    console.log('Branch owners POST - Response status:', response.status);
    console.log('Branch owners POST - Response data:', data);

    if (!response.ok) {
      console.error('Branch owners POST - Backend error:', data);
    }

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Branch owners POST error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
