import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('Bulk save branch owners request:', body);

    const response = await fetch(`${API_BASE_URL}/api/branch-owners/saveall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bulk save branch owners failed:', data);
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    console.log('Bulk save branch owners successful:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Bulk save branch owners error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
