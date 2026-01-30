/**
 * Backend Test Route - Test different backend endpoints
 */

export async function GET(request) {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
  
  const tests = [];
  
  // Test 1: Root endpoint
  try {
    const response = await fetch(`${apiBaseUrl}/`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.text();
    tests.push({
      name: 'Root Endpoint',
      url: `${apiBaseUrl}/`,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200) // Limit response size
    });
  } catch (error) {
    tests.push({
      name: 'Root Endpoint',
      url: `${apiBaseUrl}/`,
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
  
  // Test 2: Health endpoint
  try {
    const response = await fetch(`${apiBaseUrl}/health`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.text();
    tests.push({
      name: 'Health Endpoint',
      url: `${apiBaseUrl}/health`,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200)
    });
  } catch (error) {
    tests.push({
      name: 'Health Endpoint',
      url: `${apiBaseUrl}/health`,
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
  
  // Test 3: OpenAPI docs
  try {
    const response = await fetch(`${apiBaseUrl}/openapi.json`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.text();
    tests.push({
      name: 'OpenAPI Docs',
      url: `${apiBaseUrl}/openapi.json`,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200)
    });
  } catch (error) {
    tests.push({
      name: 'OpenAPI Docs',
      url: `${apiBaseUrl}/openapi.json`,
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
  
  // Test 4: Login endpoint with test credentials
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.text();
    tests.push({
      name: 'Login Endpoint (Test Credentials)',
      url: `${apiBaseUrl}/api/auth/login`,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200),
      requestBody: { email: 'test@example.com', password: 'testpass123' }
    });
  } catch (error) {
    tests.push({
      name: 'Login Endpoint (Test Credentials)',
      url: `${apiBaseUrl}/api/auth/login`,
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
  
  // Test 5: Login endpoint with admin credentials
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        email: 'admin@unixparts.com',
        password: 'admin123'
      }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.text();
    tests.push({
      name: 'Login Endpoint (Admin Credentials)',
      url: `${apiBaseUrl}/api/auth/login`,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200),
      requestBody: { email: 'admin@unixparts.com', password: 'admin123' }
    });
  } catch (error) {
    tests.push({
      name: 'Login Endpoint (Admin Credentials)',
      url: `${apiBaseUrl}/api/auth/login`,
      status: 'ERROR',
      success: false,
      error: error.message
    });
  }
  
  return Response.json({
    message: 'Backend connectivity tests',
    apiBaseUrl,
    timestamp: new Date().toISOString(),
    tests,
    summary: {
      total: tests.length,
      successful: tests.filter(t => t.success).length,
      failed: tests.filter(t => !t.success).length
    }
  });
}