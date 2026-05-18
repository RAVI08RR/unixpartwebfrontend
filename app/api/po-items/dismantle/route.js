import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await request.json();
    
    console.log('Dismantle PO Item - Parent ID:', body.parent_item_id);
    console.log('Child items count:', body.child_items?.length || 0);

    const response = await fetch(`${API_BASE_URL}/api/po-items/${body.parent_item_id}/dismantle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        parent_item_id: body.parent_item_id,
        child_items: body.child_items
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Dismantle API error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to dismantle item' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Dismantle successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dismantle proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
