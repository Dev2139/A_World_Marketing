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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-600">Total Referrals</h3>
            <p className="mt-2 text-3xl font-semibold text-[#F05454]">{metrics.totalReferrals}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-600">Total Commission</h3>
            <p className="mt-2 text-3xl font-semibold text-[#F05454]">${metrics.totalCommission.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-600">Pending Payouts</h3>
            <p className="mt-2 text-3xl font-semibold text-[#F05454]">{metrics.pendingPayouts}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-600">Total Earnings</h3>
            <p className="mt-2 text-3xl font-semibold text-[#F05454]">${metrics.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Referral Link</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={metrics.activeReferralLink}
              readOnly
              className="flex-grow border border-gray-300 text-gray-700 bg-white rounded-l-md px-4 py-2"
            />
            <button
              onClick={handleCopyReferralLink}
              className="bg-[#F05454] text-white px-4 py-2 rounded-r-md hover:bg-[#D64545] transition-all duration-200"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Share this link with customers to earn commissions on their purchases
          </p>
        </div>

        {/* Payout Request Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout Amount ($)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter amount"
                className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
              />
              <p className="mt-1 text-sm text-gray-600">
                Available for payout: ${metrics.totalCommission.toFixed(2)}
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRequestPayout}
                disabled={isPayoutRequesting}
                className={`w-full sm:w-auto px-6 py-3 rounded-md transition-all duration-200 ${
                  isPayoutRequesting
                    ? 'bg-gray-400 text-gray-700'
                    : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                }`}
              >
                {isPayoutRequesting ? 'Processing...' : 'Request Payout'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-600">Your recent referrals and commissions will appear here</p>
        </div>
      </div>
    </div>
  );
}