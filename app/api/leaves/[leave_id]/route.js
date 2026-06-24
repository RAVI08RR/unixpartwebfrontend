import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function GET(request, { params }) {
  try {
    // Next.js 15: params is now a Promise
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log('📥 GET /api/leaves/[leave_id] - ID:', leave_id);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    // Backend doesn't support GET for individual leave records
    // So we fetch all and filter client-side
    const backendUrl = `${API_BASE_URL}/api/leaves?page=1&page_size=1000`;
    console.log('🌐 Calling backend (fetching all):', backendUrl);
    
    const response = await fetch(backendUrl, { headers });
    
    console.log('📤 Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter to find the specific leave record
    let leaveList = Array.isArray(data) ? data : (data.data || []);
    const leave = leaveList.find(l => l.id === parseInt(leave_id));
    
    if (!leave) {
      console.error('❌ Leave not found with ID:', leave_id);
      return NextResponse.json(
        { error: `Leave with ID ${leave_id} not found` },
        { status: 404 }
      );
    }
    
    console.log('✅ Leave data retrieved successfully');
    return NextResponse.json(leave, { status: 200 });
  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Next.js 15: params is now a Promise
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(`${API_BASE_URL}/api/leaves/${leave_id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Backend returned non-JSON response for PUT:', text);
      return NextResponse.json(
        { error: 'Backend returned invalid response', details: text },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Next.js 15: params is now a Promise
    const { leave_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(`${API_BASE_URL}/api/leaves/${leave_id}`, {
      method: 'DELETE',
      headers,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Backend returned non-JSON response for DELETE:', text);
      return NextResponse.json(
        { error: 'Backend returned invalid response', details: text },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
