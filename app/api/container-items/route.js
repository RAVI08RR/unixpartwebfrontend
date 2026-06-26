/**
 * Container Items Proxy Route
 * /api/container-items
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
    const container_id = searchParams.get('container_id');

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');

    let backendUrl = `${apiBaseUrl}/api/container-items/?page=${page}&page_size=${page_size}`;
    if (container_id) backendUrl += `&container_id=${container_id}`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(backendUrl, { method: 'GET', headers });
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();

    const backendUrl = `${apiBaseUrl}/api/container-items/`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(backendUrl, { method: 'POST', headers, body });
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
