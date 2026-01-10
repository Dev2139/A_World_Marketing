import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch products from the backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products from backend');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array if backend is not available
    return Response.json([], { status: 200 });
  }
}