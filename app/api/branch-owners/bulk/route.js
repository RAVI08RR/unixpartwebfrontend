/**
 * Branch Owners Bulk Create Route
 * POST - Create multiple branch owners at once
 */

export async function POST(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    console.log('Branch owners BULK POST - Request body:', body);
    
    // Parse to validate it's an array
    const owners = JSON.parse(body);
    if (!Array.isArray(owners)) {
      return new Response(JSON.stringify({ error: 'Request body must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Wrap array in object with branch_owners key as backend expects
    const payload = { branch_owners: owners };
    
    const backendUrl = `${apiBaseUrl}/api/branch-owners/bulk`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    console.log('Branch owners BULK POST - Backend URL:', backendUrl);
    console.log('Branch owners BULK POST - Sending', owners.length, 'owners');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    
    const data = await response.text();
    
    console.log('Branch owners BULK POST - Response status:', response.status);
    
    if (!response.ok) {
      console.error('Branch owners BULK POST - Backend error:', data);
    }
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Branch owners BULK POST error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
