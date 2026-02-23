/**
 * Invoice Items Proxy Route - Get items for a specific invoice
 */

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID', 
          details: 'Invoice ID is required' 
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
    
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID format', 
          details: 'Invoice ID must be a positive integer' 
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
    
    console.log('Get invoice items proxy - Invoice ID:', invoiceId);
    
    const backendUrl = `${apiBaseUrl}/api/invoices/${invoiceId}/items`;
    
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
      signal: AbortSignal.timeout(10000),
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
    console.error('Get invoice items proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get invoice items', 
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
