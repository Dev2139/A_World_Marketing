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
            <h2 className="text-2xl font-bold text-gray-900">Commission Management</h2>
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
                  <option value="BLOCKED">Blocked</option>
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
              {filteredCommissions.map((commission) => (
                <li key={commission.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          ${commission.amount} commission
                        </p>
                        <div className="ml-2 inline-flex items-center">
                          {commission.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {commission.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Approved
                            </span>
                          )}
                          {commission.status === 'PAID' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          )}
                          {commission.status === 'BLOCKED' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Blocked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Order #{commission.order?.id?.substring(0, 8)} • Agent: {commission.user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Created: {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'APPROVED')}
                          disabled={commission.status !== 'PENDING'}
                          className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                            commission.status === 'PENDING'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'BLOCKED')}
                          disabled={commission.status !== 'PENDING'}
                          className={`ml-2 px-3 py-1 text-xs font-medium rounded-full ${
                            commission.status === 'PENDING'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Block
                        </button>
                        <button
                          onClick={() => updateCommissionStatus(commission.id, 'PAID')}
                          disabled={commission.status !== 'APPROVED'}
                          className={`ml-2 px-3 py-1 text-xs font-medium rounded-full ${
                            commission.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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