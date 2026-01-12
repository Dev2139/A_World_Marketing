'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentReferralsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
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
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    const fetchReferrals = async () => {
      try {
        const response = await fetch('/api/agent/referrals', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setReferrals(data);
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };

    fetchUser();
    fetchReferrals();
    setLoading(false);
  }, [router]);

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
      
      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">My Referrals</h2>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl overflow-hidden sm:rounded-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative z-10">
        <ul className="divide-y divide-purple-500/30">
          {referrals.length > 0 ? (
            referrals.map((referral) => (
              <li key={referral.id} className="transition-all duration-300 hover:bg-gray-700/30">
                <div className="px-6 py-6 sm:px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-bold text-pink-400 truncate">
                        {referral.customer?.email || 'Unknown Customer'}
                      </p>
                      <div className="ml-4 inline-flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          referral.status === 'DELIVERED' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20' :
                          referral.status === 'SHIPPED' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/20' :
                          referral.status === 'CONFIRMED' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' :
                          referral.status === 'PENDING' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/20' :
                          'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-purple-300">
                      <p>${referral.totalPrice} • {referral.product?.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-purple-300">
                        Order ID: {referral.id}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-purple-400 sm:mt-0">
                      <p className="text-xs text-purple-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>
              <div className="px-6 py-12 text-center">
                <p className="text-purple-300 text-lg font-bold">No referrals yet. Share your referral link to start earning commissions!</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}