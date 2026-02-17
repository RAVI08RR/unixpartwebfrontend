/**
 * PO Item Detail Proxy Route
 * /api/po-items/{item_id}
 */

export async function GET(request, { params }) {
  const { item_id } = await params;
  
  try {
    // Clean and validate the item_id
    const cleanId = String(item_id).trim();
    const numericId = parseInt(cleanId, 10);
    
    if (isNaN(numericId)) {
      console.error('❌ Invalid item_id:', item_id);
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    // Use the numeric ID in the URL
    const backendUrl = `${apiBaseUrl}/api/po-items/${numericId}`;
    
    console.log('🔍 Fetching PO Item:', backendUrl, '(original:', item_id, ')');
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    const data = await response.text();
    
    console.log('📦 Backend response status:', response.status);
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('❌ PO Item API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { item_id } = await params;
  
  try {
    // Clean and validate the item_id
    const cleanId = String(item_id).trim();
    const numericId = parseInt(cleanId, 10);
    
    if (isNaN(numericId)) {
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    const backendUrl = `${apiBaseUrl}/api/po-items/${numericId}`;
    
    console.log('✏️ Updating PO Item:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'PUT', headers, body });
    const data = await response.text();
    
    console.log('📦 Update response status:', response.status);
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { item_id } = params;
  
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/po-items/${item_id}`;
    
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
