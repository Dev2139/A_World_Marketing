import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const backendResponse = await fetch(`${backendUrl}/api/agent/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
    });

    const data = await backendResponse.json();

    // Create response with the same status as backend
    return NextResponse.json(data, { 
      status: backendResponse.status 
    });
  } catch (error) {
    console.error('Agent profile GET API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Get request body
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const backendResponse = await fetch(`${backendUrl}/api/agent/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body)
    });

    const data = await backendResponse.json();

    // Create response with the same status as backend
    return NextResponse.json(data, { 
      status: backendResponse.status 
    });
  } catch (error) {
    console.error('Agent profile PUT API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}