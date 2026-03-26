import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function PUT(request, { params }) {
  try {
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    // Get request body if provided, otherwise send empty object
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // No body provided, use empty object
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(`${API_BASE_URL}/api/leaves/${leave_id}/reject`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
