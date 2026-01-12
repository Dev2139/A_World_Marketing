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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="text-lg text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      
      <main className="py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Orders Management</h2>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-6 mb-8 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-purple-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
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
                <label htmlFor="date" className="block text-sm font-bold text-purple-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>
              
              <div>
                <label htmlFor="agent" className="block text-sm font-bold text-purple-300 mb-2">
                  Agent
                </label>
                <select
                  id="agent"
                  name="agent"
                  value={filters.agent}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                >
                  <option value="">All Agents</option>
                  {/* Agents will be populated dynamically */}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl overflow-hidden sm:rounded-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <ul className="divide-y divide-purple-500/30">
              {filteredOrders.map((order) => (
                <li key={order.id} className="transition-all duration-300 hover:bg-gray-700/30">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-white truncate">
                          Order #{order.id.substring(0, 8)}
                        </p>
                        <div className="ml-4 inline-flex items-center">
                          {order.status === 'PENDING' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/20">
                              Pending
                            </span>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                              Confirmed
                            </span>
                          )}
                          {order.status === 'SHIPPED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20">
                              Shipped
                            </span>
                          )}
                          {order.status === 'DELIVERED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                              Delivered
                            </span>
                          )}
                          {order.status === 'CANCELLED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        <p>Total: ${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : order.totalPrice?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Customer Information */}
                      <div className="bg-gray-700/50 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="font-bold text-purple-200 mb-3">Customer Info</h4>
                        <p className="text-sm text-purple-300">Name: {order.customer?.firstName} {order.customer?.lastName}</p>
                        <p className="text-sm text-purple-300">Email: {order.customer?.email}</p>
                        <p className="text-sm text-purple-300">Phone: {order.customer?.phone}</p>
                        <p className="text-sm text-purple-300">Address: {order.customer?.shippingAddress || 'N/A'}</p>
                      </div>
                      
                      {/* Payment Information */}
                      <div className="bg-gray-700/50 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="font-bold text-purple-200 mb-3">Payment Info</h4>
                        <p className="text-sm text-purple-300">Method: {order.paymentMethod || 'N/A'}</p>
                        {order.paymentMethod === 'card' && (
                          <>
                            <p className="text-sm text-purple-300">Card: ****{order.paymentDetails?.cardNumber?.slice(-4) || '****'}</p>
                            <p className="text-sm text-purple-300">Expiry: {order.paymentDetails?.expiryDate || 'N/A'}</p>
                          </>
                        )}
                        {order.paymentMethod === 'bank' && (
                          <>
                            <p className="text-sm text-purple-300">Account: {order.paymentDetails?.accountNumber || '****'}</p>
                            <p className="text-sm text-purple-300">Routing: {order.paymentDetails?.routingNumber || '****'}</p>
                          </>
                        )}
                      </div>
                      
                      {/* Order Totals */}
                      <div className="bg-gray-700/50 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="font-bold text-purple-200 mb-3">Order Summary</h4>
                        <p className="text-sm text-purple-300">Subtotal: ${order.subtotal?.toFixed(2) || 'N/A'}</p>
                        <p className="text-sm text-purple-300">Tax: ${order.tax?.toFixed(2) || 'N/A'}</p>
                        <p className="text-sm text-purple-300">Shipping: ${order.shipping?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-purple-300 font-bold">Total: ${order.subtotal && order.tax ? (order.subtotal + order.tax + (order.shipping || 0)).toFixed(2) : order.totalPrice?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Products List */}
                    <div className="mt-6">
                      <h4 className="font-bold text-purple-200 mb-3">Products</h4>
                      <div className="space-y-3">
                        {(order.items || []).map((item: any, index: number) => (
                          <div key={index} className="flex items-center text-sm text-purple-300 border-b border-purple-500/30 pb-3">
                            <div className="flex items-center">
                              <img 
                                src={item.image || item.product?.image || item.product?.imageUrl || 'https://via.placeholder.com/40x40'} 
                                alt={item.name || item.product?.name || 'Product'}
                                className="w-12 h-12 object-cover rounded-lg mr-4"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40x40';
                                }}
                              />
                              <span>{item.name || item.product?.name} (x{item.quantity})</span>
                            </div>
                            <span className="font-bold">${Number(item.price || item.product?.price)?.toFixed(2) || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:flex sm:justify-between pt-4 border-t border-purple-500/30">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-purple-300">
                          Agent: {order.agent?.email || 'None'}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm text-purple-300 sm:mt-0 space-x-4">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => downloadInvoice(order)}
                            className="text-sm text-pink-400 hover:text-pink-300 font-bold"
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
                              className="ml-2 text-sm border-2 border-purple-500/50 bg-gray-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="ml-2 text-xs text-purple-400">Updating...</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-purple-400">
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