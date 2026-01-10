'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayoutsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    agent: ''
  });
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

    const fetchPayouts = async () => {
      try {
        const response = await fetch('/api/admin/payouts', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setPayouts(data);
        }
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPayouts();
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updatePayoutStatus = async (payoutId: string, newStatus: string, transactionId?: string) => {
    try {
      const requestBody: any = { status: newStatus };
      if (transactionId) requestBody.transactionId = transactionId;
      
      const response = await fetch(`/api/admin/payouts/${payoutId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setPayouts(payouts.map(payout => 
          payout.id === payoutId 
            ? { ...payout, status: newStatus, transactionId, paidAt: newStatus === 'PAID' ? new Date().toISOString() : payout.paidAt } 
            : payout
        ));
      }
    } catch (error) {
      console.error('Error updating payout status:', error);
    }
  };

  // Filter payouts based on selected filters
  const filteredPayouts = payouts.filter(payout => {
    if (filters.status && payout.status !== filters.status) return false;
    if (filters.agent && payout.user?.id !== filters.agent) return false;
    return true;
  });

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
            <h2 className="text-2xl font-bold text-gray-900">Payout Management</h2>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="REJECTED">Rejected</option>
                </select>
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
              {filteredPayouts.map((payout) => (
                <li key={payout.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          ${payout.amount} payout
                        </p>
                        <div className="ml-2 inline-flex items-center">
                          {payout.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {payout.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Approved
                            </span>
                          )}
                          {payout.status === 'PAID' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          )}
                          {payout.status === 'REJECTED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Agent: {payout.user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Created: {new Date(payout.createdAt).toLocaleDateString()}
                          {payout.paidAt && ` • Paid: ${new Date(payout.paidAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        {payout.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updatePayoutStatus(payout.id, 'APPROVED')}
                              className="ml-4 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updatePayoutStatus(payout.id, 'REJECTED')}
                              className="ml-2 px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {payout.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              const transactionId = prompt('Enter transaction ID:');
                              if (transactionId) {
                                updatePayoutStatus(payout.id, 'PAID', transactionId);
                              }
                            }}
                            className="ml-4 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Mark Paid
                          </button>
                        )}
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