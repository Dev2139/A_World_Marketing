'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalAgents: 0,
    totalCustomers: 0,
    pendingPayouts: 0,
  });
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'ADMIN') {
            router.push('/login'); // Redirect if not admin
            return;
          }
          setUser(userData);
        } else {
          router.push('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/metrics', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    const fetchChartsData = async () => {
      try {
        // Fetch daily sales data
        const dailyResponse = await fetch('/api/admin/dashboard/daily-sales', {
          method: 'GET',
          credentials: 'include',
        });
        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          setDailySales(dailyData);
        }

        // Fetch monthly revenue data
        const monthlyResponse = await fetch('/api/admin/dashboard/monthly-revenue', {
          method: 'GET',
          credentials: 'include',
        });
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          setMonthlyRevenue(monthlyData);
        }

        // Fetch top agents data
        const agentsResponse = await fetch('/api/admin/dashboard/top-agents', {
          method: 'GET',
          credentials: 'include',
        });
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          setTopAgents(agentsData);
        }
      } catch (error) {
        console.error('Error fetching charts data:', error);
      }
    };

    fetchUser();
    fetchMetrics();
    fetchChartsData();
    
    // Set up auto-refresh interval for charts data
    const interval = setInterval(() => {
      fetchChartsData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [router]);
  
  // Colors for charts
  const COLORS = ['#F05454', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      
      <main className="py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-4">Admin Dashboard</h1>
            <p className="text-2xl text-purple-200 mt-2">Welcome back, {user?.email}</p>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mt-4"></div>
          </div>
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-12">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl p-4 shadow-lg shadow-pink-500/30">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-300 truncate">Total Revenue</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">${metrics.totalRevenue.toLocaleString()}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 shadow-lg shadow-cyan-500/30">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-300 truncate">Total Orders</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{metrics.totalOrders}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-4 shadow-lg shadow-teal-500/30">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-300 truncate">Total Agents</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">{metrics.totalAgents}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 shadow-lg shadow-orange-500/30">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-300 truncate">Total Customers</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">{metrics.totalCustomers}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-4 shadow-lg shadow-pink-500/30">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-300 truncate">Pending Payouts</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">{metrics.pendingPayouts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Daily Sales Chart */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 floating transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-200">Daily Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                      <XAxis dataKey="date" stroke="#c084fc" />
                      <YAxis stroke="#c084fc" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#8b5cf6', color: '#f3e8ff', borderRadius: '0.5rem' }} 
                        itemStyle={{ color: '#f3e8ff' }}
                        formatter={(value) => [`$${value}`, 'Sales']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="url(#gradientColor)" name="Sales ($)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" />
                          <stop offset="95%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 floating transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-200">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                      <XAxis dataKey="month" stroke="#c084fc" />
                      <YAxis stroke="#c084fc" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#8b5cf6', color: '#f3e8ff', borderRadius: '0.5rem' }} 
                        itemStyle={{ color: '#f3e8ff' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="url(#gradientColor2)" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="gradientColor2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" />
                          <stop offset="95%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Agents Chart */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-purple-500/30 floating transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 mb-12">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-200">Top Performing Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topAgents}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      dataKey="sales"
                      nameKey="name"
                      label={({ name, percent = 0 }) => name ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {topAgents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#8b5cf6', color: '#f3e8ff', borderRadius: '0.5rem' }} 
                      itemStyle={{ color: '#f3e8ff' }}
                      formatter={(value) => [`$${value}`, 'Sales']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
