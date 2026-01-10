'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentPayoutsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
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

    const fetchPayouts = async () => {
      try {
        const response = await fetch('/api/agent/payouts', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setPayouts(data);
        }
      } catch (error) {
        console.error('Error fetching payouts:', error);
      }
    };

    fetchUser();
    fetchPayouts();
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
        <h2 className="text-2xl font-bold text-gray-800">My Payouts</h2>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payouts.length > 0 ? (
            payouts.map((payout) => (
              <li key={payout.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Payout #{payout.id.substring(0, 8)}
                      </p>
                      <div className="ml-2 inline-flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          payout.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>${payout.amount} • {payout.transactionId || 'Processing'}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Requested: {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p className="text-xs text-gray-500">
                        {payout.status === 'PAID' && payout.paidAt ? 
                          `Paid: ${new Date(payout.paidAt).toLocaleDateString()}` : 
                          payout.status === 'APPROVED' && payout.approvedAt ?
                          `Approved: ${new Date(payout.approvedAt).toLocaleDateString()}` :
                          ''
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">No payouts yet. Request a payout when you have sufficient commission balance.</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}