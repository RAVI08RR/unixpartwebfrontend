import { NextResponse } from 'next/server';

// GET - Download document
export async function GET(request, { params }) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');
  const { employee_id, document_id } = await params;
  
  // Check if this is a download request
  const url = new URL(request.url);
  const isDownload = url.pathname.includes('/download');
  
  try {
    const backendUrl = isDownload 
      ? `${apiBaseUrl}/api/employees/${employee_id}/documents/${document_id}/download`
      : `${apiBaseUrl}/api/employees/${employee_id}/documents/${document_id}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (isDownload) {
      // For file downloads, return the blob
      const blob = await response.blob();
      return new Response(blob, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // For document info, return JSON
      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch document', detail: error.message },
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
