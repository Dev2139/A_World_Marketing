'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
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

    const fetchCommissions = async () => {
      try {
        const response = await fetch('/api/admin/commissions', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCommissions(data);
        }
      } catch (error) {
        console.error('Error fetching commissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCommissions();
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

  const updateCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCommissions(commissions.map(commission => 
          commission.id === commissionId 
            ? { ...commission, status: newStatus } 
            : commission
        ));
      }
    } catch (error) {
      console.error('Error updating commission status:', error);
    }
  };

  // Filter commissions based on selected filters
  const filteredCommissions = commissions.filter(commission => {
    if (filters.status && commission.status !== filters.status) return false;
    if (filters.agent && commission.user?.id !== filters.agent) return false;
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
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Commission Management</h2>
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
                  <option value="BLOCKED">Blocked</option>
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
              {filteredCommissions.map((commission) => (
                <li key={commission.id} className="transition-all duration-300 hover:bg-gray-700/30">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-white truncate">
                          ${commission.amount} commission
                        </p>
                        <div className="ml-4 inline-flex items-center">
                          {commission.status === 'PENDING' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/20">
                              Pending
                            </span>
                          )}
                          {commission.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                              Approved
                            </span>
                          )}
                          {commission.status === 'PAID' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                              Paid
                            </span>
                          )}
                          {commission.status === 'BLOCKED' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20">
                              Blocked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        <p>Order #{commission.order?.id?.substring(0, 8)} • Agent: {commission.user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-purple-300">
                          Created: {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm sm:mt-0">
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'APPROVED')}
                          disabled={commission.status !== 'PENDING'}
                          className={`ml-4 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                            commission.status === 'PENDING'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'BLOCKED')}
                          disabled={commission.status !== 'PENDING'}
                          className={`ml-3 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                            commission.status === 'PENDING'
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-pink-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Block
                        </button>
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'PAID')}
                          disabled={commission.status !== 'APPROVED'}
                          className={`ml-3 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                            commission.status === 'APPROVED'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-700 hover:to-emerald-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Mark Paid
                        </button>
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