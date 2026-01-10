import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const backendResponse = await fetch(`${backendUrl}/api/agent/payouts`, {
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
    console.error('Agent payouts GET API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the original request to forward to backend
    const cookieHeader = request.headers.get('cookie');
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const backendResponse = await fetch(`${backendUrl}/api/agent/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    // Check if the response has content before trying to parse JSON
    const responseText = await backendResponse.text();
    let data;
    
    if (responseText && responseText.trim() !== '') {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, return the raw text or an empty object
        data = responseText;
      }
    } else {
      data = {};
    }

    // Create response with the same status as backend
    return NextResponse.json(data, { 
      status: backendResponse.status 
    });
  } catch (error) {
    console.error('Agent payouts POST API route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}