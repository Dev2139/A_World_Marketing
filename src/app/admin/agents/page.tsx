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
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Agents Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 shadow-lg shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
            >
              {showCreateForm ? 'Cancel' : 'Create Agent'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 mb-12 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-xl font-bold text-purple-200 mb-6">Create New Agent</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-purple-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-purple-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-purple-300 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="bankDetails" className="block text-sm font-medium text-purple-300 mb-2">
                      Bank Details
                    </label>
                    <input
                      type="text"
                      name="bankDetails"
                      id="bankDetails"
                      value={formData.bankDetails}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 shadow-lg shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
                  >
                    Create Agent
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl overflow-hidden sm:rounded-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <ul className="divide-y divide-purple-500/30">
              {agents.map((agent) => (
                <li key={agent.id} className="transition-all duration-300 hover:bg-gray-700/30">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-white truncate">
                          {agent.email}
                        </p>
                        <div className="ml-4 inline-flex items-center">
                          {agent.isActive ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20">
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        <p>Referrals: {agent.totalReferrals || 0} • Sales: ${agent.totalSales?.toLocaleString() || 0} • Commission: ${agent.totalCommission?.toLocaleString() || 0}</p>
                        <div className="flex items-center mt-2">
                          <p className="text-xs text-purple-400 truncate max-w-xs">{agent.referralLink}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(agent.referralLink);
                              alert('Referral link copied to clipboard!');
                            }}
                            className="ml-3 px-3 py-1 text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-purple-300">
                          Agent ID: {agent.id}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm sm:mt-0">
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.isActive)}
                          className={`ml-4 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                            agent.isActive 
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-pink-700' 
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-700 hover:to-emerald-700'
                          }`}
                        >
                          {agent.isActive ? 'Suspend' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            // Implement commission override functionality
                          }}
                          className="ml-3 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-pink-500/20"
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