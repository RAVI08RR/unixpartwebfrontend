import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
  const authHeader = request.headers.get('authorization');
  const { document_id } = await params;

  try {
    const response = await fetch(`${apiBaseUrl}/api/employee/me/documents/${document_id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      return new Response(await response.text(), { status: response.status });
    }

    const blob = await response.blob();
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': response.headers.get('content-disposition') || '',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
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
