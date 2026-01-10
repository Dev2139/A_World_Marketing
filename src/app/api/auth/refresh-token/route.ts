import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
    });

    const data = await backendResponse.json();

    // Create response with the same status as backend
    const response = NextResponse.json(data, { 
      status: backendResponse.status 
    });

    // Copy cookies from backend response to frontend response
    const setCookieHeaders = backendResponse.headers.get('set-cookie');
    if (setCookieHeaders) {
      response.headers.set('Set-Cookie', setCookieHeaders);
    }

    return response;
  } catch (error) {
    console.error('Refresh token API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}