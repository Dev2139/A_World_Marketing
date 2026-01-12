'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    defaultCommissionRate: 0,
    minimumPayoutThreshold: 0,
    enableAgentRegistrations: true,
    systemMaintenanceMode: false
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

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchSettings();
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

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings updated successfully!');
      } else {
        console.error('Error updating settings');
      }
    } catch (error) {
      console.error('Error submitting settings:', error);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">System Settings</h2>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="defaultCommissionRate" className="block text-sm font-bold text-purple-300 mb-2">
                    Default Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    name="defaultCommissionRate"
                    id="defaultCommissionRate"
                    value={settings.defaultCommissionRate}
                    onChange={handleSettingChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                  />
                </div>

                <div>
                  <label htmlFor="minimumPayoutThreshold" className="block text-sm font-bold text-purple-300 mb-2">
                    Minimum Payout Threshold ($)
                  </label>
                  <input
                    type="number"
                    name="minimumPayoutThreshold"
                    id="minimumPayoutThreshold"
                    value={settings.minimumPayoutThreshold}
                    onChange={handleSettingChange}
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="enableAgentRegistrations"
                      name="enableAgentRegistrations"
                      type="checkbox"
                      checked={settings.enableAgentRegistrations}
                      onChange={handleSettingChange}
                      className="h-5 w-5 text-pink-500 focus:ring-pink-500 border-purple-500 rounded bg-gray-700"
                    />
                    <label htmlFor="enableAgentRegistrations" className="ml-3 block text-sm font-bold text-purple-200">
                      Enable Agent Registrations
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="systemMaintenanceMode"
                      name="systemMaintenanceMode"
                      type="checkbox"
                      checked={settings.systemMaintenanceMode}
                      onChange={handleSettingChange}
                      className="h-5 w-5 text-pink-500 focus:ring-pink-500 border-purple-500 rounded bg-gray-700"
                    />
                    <label htmlFor="systemMaintenanceMode" className="ml-3 block text-sm font-bold text-purple-200">
                      System Maintenance Mode
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-purple-400">
                    When enabled, non-admin users will see a maintenance message.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 shadow-lg shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-xl font-bold text-purple-200 mb-6">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 p-4 rounded-xl border border-purple-500/30">
                <p className="text-sm text-purple-300">Database Status</p>
                <p className="text-sm font-bold text-green-400">Connected</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-purple-500/30">
                <p className="text-sm text-purple-300">Server Uptime</p>
                <p className="text-sm font-bold text-purple-200">24 hours</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-purple-500/30">
                <p className="text-sm text-purple-300">Total Users</p>
                <p className="text-sm font-bold text-purple-200">150</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-purple-500/30">
                <p className="text-sm text-purple-300">Total Products</p>
                <p className="text-sm font-bold text-purple-200">42</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
