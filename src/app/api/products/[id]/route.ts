import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    
    // Fetch product from the backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product from backend');
    }

    const data = await response.json();
    
    // Convert Decimal fields to numbers for JSON serialization (if needed)
    const product = {
      ...data,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      commissionPercentage: Number(data.commissionPercentage)
    };
    
    // Initialize allImages as empty array
    product.allImages = [product.image || '/placeholder-product.jpg'];

    return Response.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    // Return error response if backend is not available
    return Response.json({ message: 'Error fetching product' }, { status: 500 });
  }
}