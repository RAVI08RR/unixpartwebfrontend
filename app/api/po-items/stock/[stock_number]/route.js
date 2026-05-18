import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { stock_number } = await params;
    
    console.log('🔍 Get PO item by stock number proxy - Stock Number:', stock_number);
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/po-items/stock/${stock_number}`;
    console.log('📡 Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, data);
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    console.log('✅ PO item found:', data.stock_number);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
