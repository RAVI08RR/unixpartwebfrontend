import { NextResponse } from 'next/server';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'http://srv1029267.hstgr.cloud:8000'
).replace(/\/+$/, '');

export async function GET(request, { params }) {
  try {
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log(`📥 GET /api/leaves/${leave_id}/documents`);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const backendUrl = `${API_BASE_URL}/api/leaves/${leave_id}/documents`;
    console.log(`🌐 Proxying to backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, { headers });
    console.log(`📤 Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error: ${errorText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: error.message },
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
