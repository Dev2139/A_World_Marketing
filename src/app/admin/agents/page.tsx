'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    bankDetails: ''
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

    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/admin/agents', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAgents(data);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchAgents();
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

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setAgents(agents.map(agent => 
          agent.id === agentId 
            ? { ...agent, isActive: !currentStatus } 
            : agent
        ));
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAgent = await response.json();
        setAgents([...agents, newAgent]);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          mobileNumber: '',
          bankDetails: ''
        });
        setShowCreateForm(false);
      } else {
        console.error('Error creating agent');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
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
            <h2 className="text-2xl font-bold text-gray-900">Agents Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F05454] rounded-md hover:bg-[#D64545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454]"
            >
              {showCreateForm ? 'Cancel' : 'Create Agent'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Agent</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700">
                      Bank Details
                    </label>
                    <input
                      type="text"
                      name="bankDetails"
                      id="bankDetails"
                      value={formData.bankDetails}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#F05454] rounded-md hover:bg-[#D64545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454]"
                  >
                    Create Agent
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow-lg overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {agents.map((agent) => (
                <li key={agent.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {agent.email}
                        </p>
                        <div className="ml-2 inline-flex items-center">
                          {agent.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Referrals: {agent.totalReferrals || 0} • Sales: ${agent.totalSales?.toLocaleString() || 0} • Commission: ${agent.totalCommission?.toLocaleString() || 0}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-700 truncate">{agent.referralLink}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(agent.referralLink);
                              alert('Referral link copied to clipboard!');
                            }}
                            className="ml-2 px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Agent ID: {agent.id}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.isActive)}
                          className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                            agent.isActive 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {agent.isActive ? 'Suspend' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            // Implement commission override functionality
                          }}
                          className="ml-2 px-3 py-1 text-xs font-medium text-white bg-[#F05454] rounded-full hover:bg-[#D64545]"
                        >
                          Override Commission
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