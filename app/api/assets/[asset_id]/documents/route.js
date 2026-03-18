/**
 * Asset Documents Proxy Route
 * GET - Get all documents for an asset
 * POST - Upload a document for an asset
 */

export async function GET(request, { params }) {
  try {
    const { asset_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/assets/${asset_id}/documents`;
    
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
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request, { params }) {
  try {
    const { asset_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    console.log('=== Asset Document Upload ===');
    console.log('Asset ID:', asset_id);
    console.log('Backend URL:', apiBaseUrl);
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const documentName = formData.get('document_name');
    const documentType = formData.get('document_type');
    
    console.log('File:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
    console.log('Document Name:', documentName);
    console.log('Document Type:', documentType);
    
    if (!file) {
      console.error('No file provided in form data');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const backendUrl = `${apiBaseUrl}/api/assets/${asset_id}/documents`;
    console.log('Sending to:', backendUrl);
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { 
      method: 'POST', 
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000),
    });
    
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Backend response body:', data);
    
    if (!response.ok) {
      console.error('Backend returned error:', response.status, data);
    }
    
    return new Response(data, {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  } catch (error) {
    console.error('=== Document upload error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message, 
      details: error.toString(),
      stack: error.stack 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
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
