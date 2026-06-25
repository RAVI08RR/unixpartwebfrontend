import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://srv1029267.hstgr.cloud:8000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip');
    const limit = searchParams.get('limit');
    let page = searchParams.get('page');
    let page_size = searchParams.get('page_size');

    if (!page && skip !== null) {
      const skipNum = parseInt(skip) || 0;
      const limitNum = parseInt(limit) || 100;
      page_size = String(limitNum);
      page = String(Math.floor(skipNum / limitNum) + 1);
    } else {
      if (!page) page = '1';
      if (!page_size) page_size = '100';
    }

    const authHeader = request.headers.get('authorization');

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(
      `${API_BASE_URL}/api/leaves/?page=${page}&page_size=${page_size}`,
      { headers }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let body;
    if (isFormData) {
      body = await request.formData();
    } else {
      body = await request.json();
    }

    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/api/leaves/`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });

    // Get response as text first
    const text = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If not JSON, return the text as error
      console.error('Backend returned non-JSON response:', text);
      return NextResponse.json(
        { error: 'Backend returned invalid response', details: text },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
