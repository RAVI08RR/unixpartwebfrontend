/**
 * Purchase Orders ID Suggestion API Route
 * GET /api/purchase-orders/suggest-po-id
 */

export async function GET(request) {
  try {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    // Fetch a page of POs to calculate the next sequence number
    const backendUrl = `${apiBaseUrl}/api/purchase-orders/?page=1&page_size=100`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    if (!response.ok) {
      // Fallback if backend fetch fails
      return new Response(JSON.stringify({ suggested_po_id: 'Q-POID-0001' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const purchaseOrders = Array.isArray(data) ? data : (data?.data || data?.purchase_orders || data?.items || []);
    
    let maxNum = 0;
    const poIdRegex = /^Q-POID-(\d+)$/i;

    purchaseOrders.forEach(po => {
      if (po.po_id) {
        const match = po.po_id.match(poIdRegex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(4, '0');
    const suggestedPoId = `Q-POID-${paddedNum}`;

    return new Response(JSON.stringify({ suggested_po_id: suggestedPoId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("Failed to suggest PO ID:", error);
    return new Response(JSON.stringify({ suggested_po_id: 'Q-POID-0001' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
