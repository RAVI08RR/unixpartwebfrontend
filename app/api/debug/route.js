export async function GET() {
  return Response.json({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    message: 'Debug endpoint to check environment variables',
    timestamp: new Date().toISOString(),
    // Add more debug info
    vercel: {
      VERCEL: process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    }
  });
}

export async function POST(request) {
  const headers = Object.fromEntries(request.headers.entries());
  const origin = request.headers.get('origin');
  
  return Response.json({
    message: 'Debug POST endpoint',
    origin: origin,
    headers: headers,
    url: request.url,
    timestamp: new Date().toISOString()
  });
}