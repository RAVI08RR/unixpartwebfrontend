import { NextResponse } from 'next/server';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'http://srv1029267.hstgr.cloud:8000'
).replace(/\/+$/, '');

export async function GET(request, { params }) {
  try {
    const { leave_id, document_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log(`📥 GET /api/leaves/${leave_id}/documents/${document_id}/download`);
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const backendUrl = `${API_BASE_URL}/api/leaves/${leave_id}/documents/${document_id}/download`;
    console.log(`🌐 Proxying to backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });
    
    console.log(`📤 Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error: ${errorText}`);
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
    
    const responseHeaders = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    };
    
    if (contentDisposition) {
      responseHeaders['Content-Disposition'] = contentDisposition;
    } else {
      responseHeaders['Content-Disposition'] = `attachment; filename="leave_document_${document_id}"`;
    }
    
    return new Response(fileData, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('❌ API route error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
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
