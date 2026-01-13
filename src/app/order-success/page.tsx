'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
}

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
}

interface Agent {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  createdAt: string;
  products: Product[];
  customer: Customer;
  agent?: Agent;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      // If no order ID, fetch from localStorage or session storage
      const savedOrder = typeof window !== 'undefined' ? localStorage.getItem('lastOrder') : null;
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          setOrder(parsedOrder);
          setLoading(false);
        } catch (err) {
          setError('Failed to load order details');
          setLoading(false);
        }
      } else {
        setError('No order information found');
        setLoading(false);
      }
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      // Fetch order details from the backend server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // Store in localStorage for potential access later
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastOrder', JSON.stringify(data));
        }
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] py-8 flex items-center justify-center">
        <div className="text-2xl text-[#E5E7EB]">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1A2238] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[rgba(255,255,255,0.1)] backdrop-blur-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-[#F05454] mb-4">Order Not Found</h1>
            <p className="text-[#E5E7EB] text-lg mb-6">{error || 'Unable to load order details.'}</p>
            
            <div className="mt-8">
              <button
                onClick={() => router.push('/shop')}
                className="px-6 py-3 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-yellow-600 text-white py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse-glow animation-delay-4000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Print Button */}
        <div className="mb-6 text-right">
          <button
            onClick={printInvoice}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-600 text-white rounded-lg hover:from-red-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
          >
            Print Invoice
          </button>
        </div>
        
        {/* Invoice Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-red-500/30 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500 mb-2">A World Marketing</h1>
              <p className="text-red-200">Premium Products & Services</p>
              <p className="text-red-400 text-sm">123 Business Street, City, Country</p>
              <p className="text-red-400 text-sm">Phone: +1 (555) 123-4567 | Email: info@aworldmarketing.com</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <h2 className="text-2xl font-bold text-red-400">INVOICE</h2>
              <p className="text-red-200 mt-2">Order # {order.orderNumber}</p>
              <p className="text-red-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <hr className="border-red-500/50 my-6" />
          
          {/* Bill To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-red-200 mb-2">Bill To:</h3>
              <p className="text-red-200">{order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-red-400">{order.customer.email}</p>
              {order.customer.address && <p className="text-red-400">{order.customer.address}</p>}
              {order.customer.phone && <p className="text-red-400">{order.customer.phone}</p>}
            </div>
            
            {/* Agent Details (if applicable) */}
            {order.agent && (
              <div>
                <h3 className="text-lg font-semibold text-red-200 mb-2">Referred By:</h3>
                <p className="text-red-200">{order.agent.firstName} {order.agent.lastName}</p>
                <p className="text-red-400">{order.agent.email}</p>
              </div>
            )}
          </div>
          
          {/* Order Status */}
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'CONFIRMED' ? 'bg-green-900/50 text-green-400' :
              order.status === 'SHIPPED' ? 'bg-blue-900/50 text-blue-400' :
              order.status === 'DELIVERED' ? 'bg-purple-900/50 text-red-400' :
              'bg-yellow-900/50 text-yellow-400'
            }`}>
              Status: {order.status}
            </span>
          </div>
          
          {/* Products Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-500/50">
                  <th className="text-left py-3 text-red-200">Product</th>
                  <th className="text-right py-3 text-red-200">Price</th>
                  <th className="text-center py-3 text-red-200">Qty</th>
                  <th className="text-right py-3 text-red-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, index) => (
                  <tr key={index} className="border-b border-red-500/50">
                    <td className="py-3 text-red-200">{product.name}</td>
                    <td className="py-3 text-right text-red-200">${Number(product.price).toFixed(2)}</td>
                    <td className="py-3 text-center text-red-200">{product.quantity}</td>
                    <td className="py-3 text-right text-red-200">
                      ${(Number(product.price) * product.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2">
                <span className="text-purple-300">Subtotal:</span>
                <span className="text-red-200">
                  ${order.subtotal ? order.subtotal.toFixed(2) : order.products.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-purple-300">Tax:</span>
                <span className="text-red-200">
                  ${order.tax ? order.tax.toFixed(2) : (order.products.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) * 0.08).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-red-500/50 pt-2">
                <span className="text-lg font-bold text-red-200">Total:</span>
                <span className="text-lg font-bold text-red-400">${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : (order.products.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) + (order.products.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) * 0.08)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <hr className="border-red-500/50 my-6" />
          
          {/* Thank You Message */}
          <div className="text-center">
            <p className="text-red-200 mb-4">Thank you for your purchase! We appreciate your business.</p>
            <p className="text-red-400 text-sm">This invoice is proof of your purchase. Please keep it for your records.</p>
          </div>
        </div>
                
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={printInvoice}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-yellow-600 text-white rounded-lg hover:from-red-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30"
          >
            Print Invoice
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-lg hover:from-red-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-lg hover:from-red-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}