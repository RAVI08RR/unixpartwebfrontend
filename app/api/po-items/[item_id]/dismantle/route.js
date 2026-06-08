import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');

export async function POST(request, context) {
  try {
    const params = await context?.params;
    const item_id = params?.item_id;
    
    // Clean and validate the item_id
    const cleanId = String(item_id || '').trim();
    const numericId = parseInt(cleanId, 10);
    
    if (isNaN(numericId)) {
      console.error('❌ Invalid item_id:', item_id);
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await request.json().catch(() => ({}));
    
    const childItems = body.child_items || [];
    
    const backendUrl = `${API_BASE_URL}/api/po-items/${numericId}/dismantle`;
    console.log('🚀 Dismantling PO Item via backend:', backendUrl);
    console.log('Child items count:', childItems.length);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        parent_item_id: numericId,
        child_items: childItems
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
