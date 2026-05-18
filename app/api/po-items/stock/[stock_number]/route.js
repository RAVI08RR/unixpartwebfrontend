import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { stock_number } = await params;
    
    console.log('Get PO item by stock number proxy - Stock Number:', stock_number);

    const response = await fetch(`${API_BASE_URL}/api/po-items/stock/${stock_number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PO item by stock number API error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'PO item not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('PO item by stock number proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
