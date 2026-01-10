'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    agent: ''
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'ADMIN') {
            router.push('/login');
            return;
          }
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchOrders();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.agent && order.agentId !== filters.agent) return false;
    return true;
  });

  const downloadInvoice = (order: any) => {
    // Create a simple invoice/bill document
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - Order #${order.id.substring(0, 8)}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: white; }
    .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
    .order-info { margin: 20px 0; }
    .customer-info, .items-table { margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
    .action-buttons { margin-top: 20px; text-align: center; }
    button { margin: 0 10px; padding: 8px 16px; background-color: #F05454; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background-color: #D64545; }
    @media print {
      body { margin: 0; padding: 20px; }
      .action-buttons { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <h2>Order #${order.id.substring(0, 8)}</h2>
  </div>
  
  <div class="order-info">
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    ${order.agent ? `<p><strong>Agent:</strong> ${order.agent.email}</p>` : ''}
  </div>
  
  <div class="customer-info">
    <h3>Customer Information</h3>
    <p><strong>Name:</strong> ${order.customer?.firstName} ${order.customer?.lastName}</p>
    <p><strong>Email:</strong> ${order.customer?.email}</p>
    <p><strong>Phone:</strong> ${order.customer?.phone}</p>
    <p><strong>Address:</strong> ${order.customer?.shippingAddress || 'N/A'}</p>
  </div>
  
  <div class="items-table">
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map((item: any) => `
          <tr>
            <td>${item.name || item.product?.name}</td>
            <td>${item.quantity}</td>
            <td>$${Number(item.price || item.product?.price)?.toFixed(2) || '0.00'}</td>
            <td>$${(Number(item.price || item.product?.price) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="total">
    <p><strong>Subtotal:</strong> $${order.subtotal?.toFixed(2) || (order.totalPrice && order.tax ? (Number(order.totalPrice) - Number(order.tax)).toFixed(2) : '0.00')}</p>
    <p><strong>Tax:</strong> $${order.tax?.toFixed(2) || '0.00'}</p>
    <p><strong>Shipping:</strong> $${order.shipping?.toFixed(2) || '0.00'}</p>
    <p><strong>Total:</strong> $${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : order.totalPrice?.toFixed(2) || '0.00'}</p>
  </div>
  
  <div class="action-buttons">
    <button onclick="window.print()">Print Invoice</button>
    <button onclick="downloadPDF()">Download as PDF</button>
  </div>
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p>${process.env.NEXT_PUBLIC_SITE_NAME || 'A World Marketing'}</p>
  </div>
  
  <script>
    function downloadPDF() {
      // Hide action buttons temporarily
      document.querySelector('.action-buttons').style.display = 'none';
      
      // Trigger print dialog with save as PDF option
      window.print();
      
      // Restore action buttons after a delay
      setTimeout(() => {
        document.querySelector('.action-buttons').style.display = 'block';
      }, 1000);
    }
  </script>
</body>
</html>`;
    
    // Create a Blob with the invoice HTML
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    
    // Create a temporary window to open the invoice
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Cleanup URL object after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setUpdatingOrderStatus(newStatus);
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        // Optionally, show a success message
        alert('Order status updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update order status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status');
    } finally {
      setUpdatingOrderId(null);
      setUpdatingOrderStatus('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-lg text-dark-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
                  Agent
                </label>
                <select
                  id="agent"
                  name="agent"
                  value={filters.agent}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                >
                  <option value="">All Agents</option>
                  {/* Agents will be populated dynamically */}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.id.substring(0, 8)}
                        </p>
                        <div className="ml-2 inline-flex items-center">
                          {order.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Confirmed
                            </span>
                          )}
                          {order.status === 'SHIPPED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Shipped
                            </span>
                          )}
                          {order.status === 'DELIVERED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Delivered
                            </span>
                          )}
                          {order.status === 'CANCELLED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Total: ${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : order.totalPrice?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Information */}
                      <div className="border border-gray-200 rounded-md p-3">
                        <h4 className="font-medium text-gray-900 mb-2">Customer Info</h4>
                        <p className="text-sm text-gray-500">Name: {order.customer?.firstName} {order.customer?.lastName}</p>
                        <p className="text-sm text-gray-500">Email: {order.customer?.email}</p>
                        <p className="text-sm text-gray-500">Phone: {order.customer?.phone}</p>
                        <p className="text-sm text-gray-500">Address: {order.customer?.shippingAddress || 'N/A'}</p>
                      </div>
                      
                      {/* Payment Information */}
                      <div className="border border-gray-200 rounded-md p-3">
                        <h4 className="font-medium text-gray-900 mb-2">Payment Info</h4>
                        <p className="text-sm text-gray-500">Method: {order.paymentMethod || 'N/A'}</p>
                        {order.paymentMethod === 'card' && (
                          <>
                            <p className="text-sm text-gray-500">Card: ****{order.paymentDetails?.cardNumber?.slice(-4) || '****'}</p>
                            <p className="text-sm text-gray-500">Expiry: {order.paymentDetails?.expiryDate || 'N/A'}</p>
                          </>
                        )}
                        {order.paymentMethod === 'bank' && (
                          <>
                            <p className="text-sm text-gray-500">Account: {order.paymentDetails?.accountNumber || '****'}</p>
                            <p className="text-sm text-gray-500">Routing: {order.paymentDetails?.routingNumber || '****'}</p>
                          </>
                        )}
                      </div>
                      
                      {/* Order Totals */}
                      <div className="border border-gray-200 rounded-md p-3">
                        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                        <p className="text-sm text-gray-500">Subtotal: ${order.subtotal?.toFixed(2) || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Tax: ${order.tax?.toFixed(2) || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Shipping: ${order.shipping?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-500 font-medium">Total: ${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : order.totalPrice?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Products List */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Products</h4>
                      <div className="space-y-2">
                        {(order.items || []).map((item: any, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-500 border-b border-gray-200 pb-1">
                            <div className="flex items-center">
                              <img 
                                src={item.image || item.product?.image || item.product?.imageUrl || 'https://via.placeholder.com/40x40'} 
                                alt={item.name || item.product?.name || 'Product'}
                                className="w-10 h-10 object-cover rounded mr-3"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40x40';
                                }}
                              />
                              <span>{item.name || item.product?.name} (x{item.quantity})</span>
                            </div>
                            <span>${Number(item.price || item.product?.price)?.toFixed(2) || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between pt-2 border-t border-gray-200">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Agent: {order.agent?.email || 'None'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-4">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => downloadInvoice(order)}
                            className="text-sm text-[#F05454] hover:text-[#D64545] font-medium"
                            title="View and Print Invoice"
                          >
                            View Invoice
                          </button>
                          
                          {/* Order Status Dropdown */}
                          <div className="flex items-center">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                              className="ml-2 text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454]"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="ml-2 text-xs text-gray-500">Updating...</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}