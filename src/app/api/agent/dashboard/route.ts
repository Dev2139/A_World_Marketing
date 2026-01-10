import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const backendResponse = await fetch(`${backendUrl}/api/agent/dashboard`, {
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
    console.error('Agent dashboard GET API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}