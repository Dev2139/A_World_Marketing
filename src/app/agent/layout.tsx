'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
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
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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

  const getHeaderTitle = (path: string) => {
    switch(path) {
      case '/agent/dashboard':
        return 'Agent Dashboard';
      case '/agent/referrals':
        return 'My Referrals';
      case '/agent/commissions':
        return 'Commissions';
      case '/agent/payouts':
        return 'Payouts';
      case '/agent/profile':
        return 'Profile';
      default:
        return 'Agent Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Loading state already handled above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse-glow animation-delay-4000"></div>
      </div>
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      
      <aside className={`bg-gradient-to-b from-gray-800 to-gray-900 w-64 min-h-screen border-r border-purple-500/30 shadow-2xl fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} glowing`}>
        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
              alt="Logo" 
              className="h-12 w-12 mb-2 rounded-full border-2 border-pink-500/50"
            />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-400">AWM Store</h2>
          </div>
          <nav className="mt-6">
            <Link 
              href="/agent/dashboard" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center ${pathname === '/agent/dashboard' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/30' : 'hover:bg-gray-700/50 hover:text-red-400 text-red-200'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link 
              href="/agent/referrals" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center ${pathname === '/agent/referrals' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/30' : 'hover:bg-gray-700/50 hover:text-red-400 text-red-200'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              My Referrals
            </Link>
            <Link 
              href="/agent/commissions" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center ${pathname === '/agent/commissions' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/30' : 'hover:bg-gray-700/50 hover:text-red-400 text-red-200'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Commissions
            </Link>
            <Link 
              href="/agent/payouts" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center ${pathname === '/agent/payouts' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/30' : 'hover:bg-gray-700/50 hover:text-red-400 text-red-200'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payouts
            </Link>
            <Link 
              href="/agent/profile" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 mb-3 flex items-center ${pathname === '/agent/profile' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/30' : 'hover:bg-gray-700/50 hover:text-red-400 text-red-200'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-red-600 to-yellow-600 shadow-lg shadow-red-500/30 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
      </button>
            
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 relative z-10">
        {/* Top Navigation */}
        <header className="bg-gradient-to-r from-red-800 to-red-900 shadow-lg border-b border-red-500/30 sticky top-0 z-10 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-400">{getHeaderTitle(pathname)}</h1>
            </div>
            <div className="flex items-center">
              <span className="text-purple-200 mr-4 hidden sm:block">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
  
        {/* Page Content */}
        <main className="flex-1 py-6 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}