import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function GET(request, { params }) {
  try {
    // Next.js 15: params is now a Promise
    const { attendance_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log('📥 GET /api/attendance/[attendance_id] - ID:', attendance_id);
    console.log('🔑 Auth header present:', !!authHeader);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    // Backend doesn't support GET for individual attendance records
    // So we fetch all and filter client-side
    const backendUrl = `${API_BASE_URL}/api/attendance?skip=0&limit=1000`;
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
    
    // Filter to find the specific attendance record
    let attendanceList = Array.isArray(data) ? data : (data.data || []);
    const attendance = attendanceList.find(a => a.id === parseInt(attendance_id));
    
    if (!attendance) {
      console.error('❌ Attendance not found with ID:', attendance_id);
      return NextResponse.json(
        { error: `Attendance with ID ${attendance_id} not found` },
        { status: 404 }
      );
    }
    
    console.log('✅ Attendance data retrieved successfully');
    return NextResponse.json(attendance, { status: 200 });
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
    const { attendance_id } = await params;
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(`${API_BASE_URL}/api/attendance/${attendance_id}`, {
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

export async function DELETE(request, { params }) {
  try {
    // Next.js 15: params is now a Promise
    const { attendance_id } = await params;
    const authHeader = request.headers.get('authorization');
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(`${API_BASE_URL}/api/attendance/${attendance_id}`, {
      method: 'DELETE',
      headers,
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
