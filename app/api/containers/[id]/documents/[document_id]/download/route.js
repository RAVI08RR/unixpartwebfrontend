/**
 * Container Document Download Proxy Route
 * GET - Download a specific document
 */

export async function GET(request, { params }) {
  try {
    const { id, document_id } = await params;
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/containers/${id}/documents/${document_id}/download`;
    
    console.log('📥 Downloading container document:', {
      containerId: id,
      documentId: document_id,
      backendUrl,
      hasAuth: !!authHeader
    });
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    
    console.log('📥 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('Content-Type')
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('📥 Download failed:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Download failed', 
        details: errorText,
        status: response.status 
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the content type and disposition from backend
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('Content-Disposition');
    
    // Stream the file data
    const fileData = await response.arrayBuffer();
    
    console.log('📥 File downloaded successfully:', {
      size: fileData.byteLength,
      contentType,
      contentDisposition
    });
    
    const responseHeaders = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    };
    
    if (contentDisposition) {
      responseHeaders['Content-Disposition'] = contentDisposition;
    }
    
    return new Response(fileData, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('📥 Container document download error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
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
