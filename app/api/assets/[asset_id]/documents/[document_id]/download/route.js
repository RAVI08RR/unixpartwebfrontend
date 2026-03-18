/**
 * Asset Document Download Proxy Route
 * GET - Download a specific document
 */

export async function GET(request, { params }) {
  try {
    const { asset_id, document_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    console.log('=== Document Download ===');
    console.log('Asset ID:', asset_id);
    console.log('Document ID:', document_id);
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    
    const backendUrl = `${apiBaseUrl}/api/assets/${asset_id}/documents/${document_id}/download`;
    console.log('Backend URL:', backendUrl);
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { 
      method: 'GET', 
      headers,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Download failed', 
        status: response.status,
        details: errorText 
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('Content-Disposition');
    
    const fileData = await response.arrayBuffer();
    console.log('File data size:', fileData.byteLength, 'bytes');
    
    const responseHeaders = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    };
    
    if (contentDisposition) {
      responseHeaders['Content-Disposition'] = contentDisposition;
    } else {
      // Provide a default filename if backend doesn't send one
      responseHeaders['Content-Disposition'] = `attachment; filename="document_${document_id}"`;
    }
    
    console.log('Sending file with headers:', responseHeaders);
    
    return new Response(fileData, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('=== Document download error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
