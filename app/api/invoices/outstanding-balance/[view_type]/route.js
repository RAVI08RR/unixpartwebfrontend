/**
 * Get Outstanding Balance Proxy Route
 * View types: customer, branch, supplier, invoice, stock_number
 */

export async function GET(request, { params }) {
  try {
    const { view_type } = await params;
    const { searchParams } = new URL(request.url);
    const filter_value = searchParams.get('filter_value') || '';
    
    if (!view_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid view type', 
          details: 'View type is required (customer, branch, supplier, invoice, stock_number)' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    const validViewTypes = ['customer', 'branch', 'supplier', 'invoice', 'stock_number'];
    if (!validViewTypes.includes(view_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid view type', 
          details: `View type must be one of: ${validViewTypes.join(', ')}` 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    console.log('Get outstanding balance proxy - View Type:', view_type, 'Filter:', filter_value);
    
    let backendUrl = `${apiBaseUrl}/api/invoices/outstanding-balance/${view_type}`;
    if (filter_value) {
      backendUrl += `?filter_value=${encodeURIComponent(filter_value)}`;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000),
    });
    
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Get outstanding balance proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get outstanding balance', 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
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
