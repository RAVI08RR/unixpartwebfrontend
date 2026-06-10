import { NextResponse } from 'next/server';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'http://srv1029267.hstgr.cloud:8000'
).replace(/\/+$/, '');

export async function POST(request, { params }) {
  try {
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log(`📥 POST /api/leaves/${leave_id}/documents/upload`);
    
    const formData = await request.formData();
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const backendUrl = `${API_BASE_URL}/api/leaves/${leave_id}/documents/upload`;
    console.log(`🌐 Proxying to backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.log(`📤 Backend response status: ${response.status}`);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn('Backend returned non-JSON response:', text);
      data = { message: text };
    }
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
