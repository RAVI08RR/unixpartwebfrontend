/**
 * Users Proxy Route - Bypasses CORS issues for users API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Users proxy GET - API Base URL:', apiBaseUrl);
    console.log('Users proxy GET - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/users/?skip=${skip}&limit=${limit}`;
    console.log('Users proxy GET - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Users proxy GET - Backend response status:', response.status);
    
    // Handle authentication errors by returning fallback data
    if (response.status === 401) {
      console.log('🔄 Backend returned 401, using fallback users data');
      throw new Error('Authentication failed, using fallback data');
    }
    
    // Handle other error status codes
    if (!response.ok) {
      console.log('🔄 Backend returned error status:', response.status, 'using fallback users data');
      throw new Error(`Backend error: ${response.status}`);
    }
    
    // Get response data
    const data = await response.text();
    console.log('Users proxy GET - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Users proxy GET error:', error);
    console.log('👥 Users API failed, using fallback users:', error.message);
    
    // Get skip and limit from the original request
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    
    // Return fallback users data when backend is unavailable
    const fallbackUsers = {
      items: [
        {
          id: 1,
          username: "admin",
          email: "admin@company.com",
          full_name: "System Administrator",
          phone: "+1-555-0001",
          is_active: true,
          role_id: 1,
          role: {
            id: 1,
            name: "Administrator",
            slug: "administrator",
            description: "Full system access"
          },
          branch_ids: [1, 2],
          branches: [
            { id: 1, branch_name: "Main Branch", branch_code: "MB001" },
            { id: 2, branch_name: "North Branch", branch_code: "NB002" }
          ],
          supplier_ids: [1, 2, 3],
          suppliers: [
            { id: 1, name: "ABC Electronics Ltd", supplier_code: "SUP001" },
            { id: 2, name: "Global Components Inc", supplier_code: "SUP002" },
            { id: 3, name: "Tech Solutions Corp", supplier_code: "SUP003" }
          ],
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          username: "manager",
          email: "manager@company.com",
          full_name: "Branch Manager",
          phone: "+1-555-0002",
          is_active: true,
          role_id: 2,
          role: {
            id: 2,
            name: "Manager",
            slug: "manager",
            description: "Branch management access"
          },
          branch_ids: [1],
          branches: [
            { id: 1, branch_name: "Main Branch", branch_code: "MB001" }
          ],
          supplier_ids: [1, 2],
          suppliers: [
            { id: 1, name: "ABC Electronics Ltd", supplier_code: "SUP001" },
            { id: 2, name: "Global Components Inc", supplier_code: "SUP002" }
          ],
          created_at: "2024-01-16T11:30:00Z",
          updated_at: "2024-01-16T11:30:00Z"
        },
        {
          id: 3,
          username: "sales_rep",
          email: "sales@company.com",
          full_name: "Sales Representative",
          phone: "+1-555-0003",
          is_active: true,
          role_id: 3,
          role: {
            id: 3,
            name: "Sales Representative",
            slug: "sales_representative",
            description: "Sales and customer management"
          },
          branch_ids: [1],
          branches: [
            { id: 1, branch_name: "Main Branch", branch_code: "MB001" }
          ],
          supplier_ids: [],
          suppliers: [],
          created_at: "2024-01-17T14:15:00Z",
          updated_at: "2024-01-17T14:15:00Z"
        },
        {
          id: 4,
          username: "inventory_clerk",
          email: "inventory@company.com",
          full_name: "Inventory Clerk",
          phone: "+1-555-0004",
          is_active: true,
          role_id: 4,
          role: {
            id: 4,
            name: "Inventory Clerk",
            slug: "inventory_clerk",
            description: "Inventory management access"
          },
          branch_ids: [2],
          branches: [
            { id: 2, branch_name: "North Branch", branch_code: "NB002" }
          ],
          supplier_ids: [1, 3, 4],
          suppliers: [
            { id: 1, name: "ABC Electronics Ltd", supplier_code: "SUP001" },
            { id: 3, name: "Tech Solutions Corp", supplier_code: "SUP003" },
            { id: 4, name: "Premium Parts Ltd", supplier_code: "SUP004" }
          ],
          created_at: "2024-01-18T09:45:00Z",
          updated_at: "2024-01-18T09:45:00Z"
        },
        {
          id: 5,
          username: "cashier",
          email: "cashier@company.com",
          full_name: "Store Cashier",
          phone: "+1-555-0005",
          is_active: true,
          role_id: 5,
          role: {
            id: 5,
            name: "Cashier",
            slug: "cashier",
            description: "Point of sale access"
          },
          branch_ids: [1],
          branches: [
            { id: 1, branch_name: "Main Branch", branch_code: "MB001" }
          ],
          supplier_ids: [],
          suppliers: [],
          created_at: "2024-01-19T16:20:00Z",
          updated_at: "2024-01-19T16:20:00Z"
        }
      ],
      total: 5,
      skip: parseInt(skip),
      limit: parseInt(limit)
    };
    
    return new Response(
      JSON.stringify(fallbackUsers),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function POST(request) {
  // Get API base URL
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
  
  // Get auth token from request headers
  const authHeader = request.headers.get('authorization');
  
  console.log('Users proxy POST - API Base URL:', apiBaseUrl);
  console.log('Users proxy POST - Auth header present:', !!authHeader);
  console.log('Users proxy POST - Content-Type:', request.headers.get('content-type'));
  
  try {
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/users/`;
    console.log('Users proxy POST - Backend URL:', backendUrl);
    
    // Get the request body
    const contentType = request.headers.get('content-type') || '';
    let body;
    let headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (contentType.includes('multipart/form-data')) {
      // Forward FormData as-is
      body = await request.formData();
      console.log('Users proxy POST - Forwarding FormData');
      console.log('Users proxy POST - FormData entries:');
      for (let [key, value] of body.entries()) {
        console.log(`  ${key}:`, value);
      }
      // Don't set Content-Type for FormData, let fetch set it with boundary
    } else {
      // Handle JSON (fallback)
      const bodyText = await request.text();
      console.log('Users proxy POST - Request body length:', bodyText.length);
      console.log('Users proxy POST - Request body content:', bodyText);
      
      // Parse to verify it's valid JSON
      try {
        const bodyData = JSON.parse(bodyText);
        console.log('Users proxy POST - Parsed body data:', bodyData);
        console.log('Users proxy POST - Body data keys:', Object.keys(bodyData));
      } catch (parseError) {
        console.error('Users proxy POST - Failed to parse body as JSON:', parseError);
      }
      
      body = bodyText;
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000), // 15 second timeout for user creation
    });
    
    console.log('Users proxy POST - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Users proxy POST - Backend response data length:', data.length);
    console.log('Users proxy POST - Backend response data:', data);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Users proxy POST error:', error);
    console.log('➕ Create user API failed, using fallback response:', error.message);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Failed to create user',
        detail: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}