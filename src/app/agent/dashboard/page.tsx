'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalReferrals: 0,
    totalCommission: 0,
    pendingPayouts: 0,
    totalEarnings: 0,
    activeReferralLink: ''
  });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isPayoutRequesting, setIsPayoutRequesting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'AGENT') {
            router.push('/login');
            return;
          }
          setUser(userData);

          // Generate referral link
          const referralLink = `${window.location.origin}/referral/${userData.id}`;
          setMetrics(prev => ({ ...prev, activeReferralLink: referralLink }));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    const fetchAgentMetrics = async () => {
      try {
        const response = await fetch('/api/agent/dashboard', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(prev => ({
            ...prev,
            totalReferrals: data.totalReferrals || 0,
            totalCommission: data.totalCommission || 0,
            pendingPayouts: data.pendingPayouts || 0,
            totalEarnings: data.totalEarnings || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching agent metrics:', error);
      }
    };

    fetchUser();
    fetchAgentMetrics();
    setLoading(false);
  }, [router]);

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(metrics.activeReferralLink);
    alert('Referral link copied to clipboard!');
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid payout amount');
      return;
    }

    setIsPayoutRequesting(true);
    try {
      const response = await fetch('/api/agent/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(payoutAmount) }),
      });

      if (response.ok) {
        alert('Payout request submitted successfully!');
        setPayoutAmount('');
        // Refresh metrics to update pending payouts count
        const dashboardResponse = await fetch('/api/agent/dashboard', {
          method: 'GET',
          credentials: 'include',
        });

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setMetrics(prev => ({
            ...prev,
            totalReferrals: data.totalReferrals || 0,
            totalCommission: data.totalCommission || 0,
            pendingPayouts: data.pendingPayouts || 0
          }));
        }
      } else {
        // Handle response that might not have JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text or default message
          errorData = { message: response.statusText || 'Failed to submit payout request' };
        }
        alert(errorData.message || 'Failed to submit payout request');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('An error occurred while submitting the payout request');
    } finally {
      setIsPayoutRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] flex items-center justify-center">
        <div className="text-lg text-[#E5E7EB]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-4">Agent Dashboard</h1>
          <p className="text-2xl text-purple-200 mt-2">Welcome back, {user?.email}</p>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mt-4"></div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-lg font-bold text-purple-300">Total Referrals</h3>
            <p className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">{metrics.totalReferrals}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-lg font-bold text-purple-300">Total Commission</h3>
            <p className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">${metrics.totalCommission.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-lg font-bold text-purple-300">Pending Payouts</h3>
            <p className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">{metrics.pendingPayouts}</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-lg font-bold text-purple-300">Total Earnings</h3>
            <p className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">${metrics.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-purple-500/30 mb-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h3 className="text-xl font-bold text-purple-200 mb-4">Your Referral Link</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={metrics.activeReferralLink}
              readOnly
              className="flex-grow border-2 border-purple-500/50 bg-gray-700 text-white rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
            />
            <button
              onClick={handleCopyReferralLink}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-r-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-500/30 font-medium"
            >
              Copy
            </button>
          </div>
          <p className="mt-3 text-sm text-purple-300">
            Share this link with customers to earn commissions on their purchases
          </p>
        </div>

        {/* Payout Request Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-purple-500/30 mb-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h3 className="text-xl font-bold text-purple-200 mb-4">Request Payout</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-purple-300 mb-1">Payout Amount ($)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter amount"
                className="w-full p-3 bg-gray-700 border-2 border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
              />
              <p className="mt-2 text-sm text-purple-400">
                Available for payout: ${metrics.totalCommission.toFixed(2)}
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRequestPayout}
                disabled={isPayoutRequesting}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium ${
                  isPayoutRequesting
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-pink-500/30'
                }`}
              >
                {isPayoutRequesting ? 'Processing...' : 'Request Payout'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h3 className="text-xl font-bold text-purple-200 mb-4">Recent Activity</h3>
          <p className="text-purple-300 text-lg">Your recent referrals and commissions will appear here</p>
        </div>
      </div>
    </div>
  );
}