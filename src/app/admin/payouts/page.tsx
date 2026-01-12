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
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Payout Management</h2>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-6 mb-8 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="REJECTED">Rejected</option>
                </select>
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
              {filteredPayouts.map((payout) => (
                <li key={payout.id} className="transition-all duration-300 hover:bg-gray-700/30">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-white truncate">
                          ${payout.amount} payout
                        </p>
                        <div className="ml-4 inline-flex items-center">
                          {payout.status === 'PENDING' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/20">
                              Pending
                            </span>
                          )}
                          {payout.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                              Approved
                            </span>
                          )}
                          {payout.status === 'PAID' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                              Paid
                            </span>
                          )}
                          {payout.status === 'REJECTED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        <p>Agent: {payout.user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-purple-300">
                          Created: {new Date(payout.createdAt).toLocaleDateString()}
                          {payout.paidAt && ` • Paid: ${new Date(payout.paidAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm sm:mt-0">
                        {payout.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updatePayoutStatus(payout.id, 'APPROVED')}
                              className="ml-4 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updatePayoutStatus(payout.id, 'REJECTED')}
                              className="ml-3 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-pink-700 transition-all duration-300"
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
                            className="ml-4 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
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