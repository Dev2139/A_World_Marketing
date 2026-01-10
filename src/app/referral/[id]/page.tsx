'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '../../../lib/api';

export default function ReferralPage() {
  const router = useRouter();
  const { id: agentId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate the agent ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(agentId as string)) {
      setError('Invalid referral link');
      setIsLoading(false);
      return;
    }

    // Record the referral click
    const recordClick = async () => {
      try {
        await api.referral.recordClick(agentId as string);
      } catch (err) {
        console.error('Error recording referral click:', err);
      }
    };
    
    recordClick();

    // Store the referral agent in localStorage with a timestamp
    const referralData = {
      agentId: agentId as string,
      timestamp: Date.now(),
    };
    localStorage.setItem('referralAgentId', JSON.stringify(referralData));
    
    // Redirect to the shop page
    router.push('/shop');
  }, [agentId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-dark-text-light">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-dark-gold text-dark-main rounded-md hover:bg-amber-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-main flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gold mx-auto mb-4"></div>
        <p className="text-dark-text-light">Redirecting to shop...</p>
      </div>
    </div>
  );
}