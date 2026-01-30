// Test CORS from Vercel to your backend
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Make the same request your frontend makes
    const response = await fetch('https://289b47e1e00a.ngrok-free.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Origin': 'https://unixpartwebfrontend.vercel.app'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.text();
    
    return Response.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      requestOrigin: 'https://unixpartwebfrontend.vercel.app'
    });
    
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}