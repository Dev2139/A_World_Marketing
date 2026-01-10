import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/admin/products`, {
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
    console.error('Products GET API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // Create response with the same status as backend
    return NextResponse.json(data, { 
      status: backendResponse.status 
    });
  } catch (error) {
    console.error('Products POST API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}