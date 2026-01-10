'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentCommissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
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

    const fetchCommissions = async () => {
      try {
        const response = await fetch('/api/agent/commissions', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCommissions(data);
        }
      } catch (error) {
        console.error('Error fetching commissions:', error);
      }
    };

    fetchUser();
    fetchCommissions();
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Commissions</h2>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {commissions.length > 0 ? (
            commissions.map((commission) => (
              <li key={commission.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Order #{commission.order?.id}
                      </p>
                      <div className="ml-2 inline-flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          commission.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          commission.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          commission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {commission.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>${commission.amount} • {commission.order?.product?.name}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Commission Rate: {commission.order?.product?.commissionPercentage}%
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p className="text-xs text-gray-500">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">No commissions yet. Make referrals to start earning!</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}