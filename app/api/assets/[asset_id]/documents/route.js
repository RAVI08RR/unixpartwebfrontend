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
    
    console.log('Uploading document for asset:', asset_id);
    
    const formData = await request.formData();
    const file = formData.get('file');
    const documentName = formData.get('document_name');
    
    console.log('File:', file?.name, 'Document Name:', documentName);
    
    const backendUrl = `${apiBaseUrl}/api/assets/${asset_id}/documents`;
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { 
      method: 'POST', 
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000), // 30 second timeout for file uploads
    });
    
    const data = await response.text();
    console.log('Backend response status:', response.status);
    console.log('Backend response:', data);
    
    return new Response(data, {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return new Response(JSON.stringify({ error: error.message, details: error.toString() }), { 
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
