/**
 * PO Item Detail Proxy Route
 * /api/po-items/{item_id}
 */

export async function GET(request, context) {
  try {
    const params = await context?.params;
    const item_id = params?.item_id;
    
    // Clean and validate the item_id
    const cleanId = String(item_id || '').trim();
    const numericId = parseInt(cleanId, 10);
    
    if (isNaN(numericId)) {
      console.error('❌ Invalid item_id:', item_id);
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    // Use the numeric ID in the URL
    const backendUrl = `${apiBaseUrl}/api/po-items/${numericId}`;
    
    console.log('🔍 Fetching PO Item:', backendUrl, '(original:', item_id, ')');
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'GET', headers });
    const data = await response.text();
    
    console.log('📦 Backend response status:', response.status);
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('❌ PO Item API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request, context) {
  const fs = require('fs');
  
  try {
    const params = await context?.params;
    const item_id = params?.item_id;
    
    // Clean and validate the item_id
    const cleanId = String(item_id || '').trim();
    const numericId = parseInt(cleanId, 10);
    
    if (isNaN(numericId)) {
      return new Response(JSON.stringify({ error: 'Invalid item ID' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    const body = await request.text();
    
    const backendUrl = `${apiBaseUrl}/api/po-items/${numericId}`;
    
    console.log('✏️ Updating PO Item:', backendUrl);
    console.log('📦 Request body:', body);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    let response = await fetch(backendUrl, { method: 'PUT', headers, body });
    let data = await response.text();
    let healed = false;
    let healingDetails = null;
    
    console.log('📦 Update response status:', response.status);
    console.log('📦 Update response body:', data);
    
    // Self-healing: if the backend fails with 500, try omitting po_id and item_id
    if (response.status === 500) {
      console.log('⚠️ Backend returned 500. Attempting self-healing (omitting po_id and item_id)...');
      try {
        const parsedBody = JSON.parse(body);
        delete parsedBody.po_id;
        delete parsedBody.item_id;
        
        const healedBody = JSON.stringify(parsedBody);
        let healedResponse = await fetch(backendUrl, { method: 'PUT', headers, body: healedBody });
        let healedData = await healedResponse.text();
        
        healingDetails = {
          attempt1: {
            payload: JSON.parse(healedBody),
            status: healedResponse.status,
            response: healedData
          }
        };
        
        // If it still fails, try also omitting current_branch_id
        if (healedResponse.status === 500) {
          console.log('⚠️ Still 500. Trying to also omit current_branch_id...');
          delete parsedBody.current_branch_id;
          const healedBody2 = JSON.stringify(parsedBody);
          healedResponse = await fetch(backendUrl, { method: 'PUT', headers, body: healedBody2 });
          healedData = await healedResponse.text();
          
          healingDetails.attempt2 = {
            payload: JSON.parse(healedBody2),
            status: healedResponse.status,
            response: healedData
          };
        }
        
        if (healedResponse.status < 500) {
          console.log('✅ Self-healing succeeded! Status:', healedResponse.status);
          response = healedResponse;
          data = healedData;
          healed = true;
        }
      } catch (err) {
        console.error('❌ Self-healing failed with exception:', err);
      }
    }
    
    // Log details to local file for AI debugging
    fs.writeFileSync(
      'c:\\Users\\Public\\Ravi Devlopment\\unixpartwebfrontend\\error-debug.log',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        url: backendUrl,
        originalBody: JSON.parse(body),
        finalStatus: response.status,
        finalResponse: data,
        healed: healed,
        healingDetails: healingDetails
      }, null, 2)
    );
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    fs.writeFileSync(
      'c:\\Users\\Public\\Ravi Devlopment\\unixpartwebfrontend\\error-debug.log',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      }, null, 2)
    );
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context?.params;
    const item_id = params?.item_id;
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `${apiBaseUrl}/api/po-items/${item_id}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    
    const response = await fetch(backendUrl, { method: 'DELETE', headers });
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
