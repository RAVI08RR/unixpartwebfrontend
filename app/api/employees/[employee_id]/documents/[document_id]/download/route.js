import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');
  const { employee_id, document_id } = await params;
  
  try {
    const backendUrl = `${apiBaseUrl}/api/employees/${employee_id}/documents/${document_id}/download`;
    
    console.log(`📥 Employee Document Download: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`📥 Download failed (${response.status}):`, errorText);
      return NextResponse.json(
        { error: 'Failed to download document', detail: errorText },
        { status: response.status }
      );
    }
    
    const contentType = response.headers.get('Content-Type') || '';
    console.log(`📥 Response Content-Type: ${contentType}`);
    
    // If backend returns JSON (could be a URL string or file data)
    if (contentType.includes('application/json')) {
      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // For binary file downloads, return the blob
    const blob = await response.blob();
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType || 'application/octet-stream');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    // Forward Content-Disposition if present
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      responseHeaders.set('Content-Disposition', contentDisposition);
    } else {
      responseHeaders.set('Content-Disposition', 'attachment');
    }
    
    // Forward Content-Length if present
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    
    return new Response(blob, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('📥 Download proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to download document', detail: error.message },
      { status: 500 }
    );
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
