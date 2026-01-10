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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      
      <aside className={`bg-white w-64 min-h-screen border-r border-gray-200 shadow-md fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
              alt="Logo" 
              className="h-10 w-10 mb-2"
            />
            <h2 className="text-lg font-bold text-gray-900">A World Marketing</h2>
          </div>
          <nav className="mt-4">
            <Link 
              href="/agent/dashboard" 
              className={`block py-3 px-4 rounded-lg transition-colors mb-2 ${pathname === '/agent/dashboard' ? 'bg-[#F05454] text-white' : 'hover:bg-gray-100 hover:text-[#F05454]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/agent/referrals" 
              className={`block py-3 px-4 rounded-lg transition-colors mb-2 ${pathname === '/agent/referrals' ? 'bg-[#F05454] text-white' : 'hover:bg-gray-100 hover:text-[#F05454]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              My Referrals
            </Link>
            <Link 
              href="/agent/commissions" 
              className={`block py-3 px-4 rounded-lg transition-colors mb-2 ${pathname === '/agent/commissions' ? 'bg-[#F05454] text-white' : 'hover:bg-gray-100 hover:text-[#F05454]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              Commissions
            </Link>
            <Link 
              href="/agent/payouts" 
              className={`block py-3 px-4 rounded-lg transition-colors mb-2 ${pathname === '/agent/payouts' ? 'bg-[#F05454] text-white' : 'hover:bg-gray-100 hover:text-[#F05454]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              Payouts
            </Link>
            <Link 
              href="/agent/profile" 
              className={`block py-3 px-4 rounded-lg transition-colors mb-2 ${pathname === '/agent/profile' ? 'bg-[#F05454] text-white' : 'hover:bg-gray-100 hover:text-[#F05454]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              Profile
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
  
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{getHeaderTitle(pathname)}</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4 hidden sm:block">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-[#F05454] hover:bg-[#D64545] rounded-lg"
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