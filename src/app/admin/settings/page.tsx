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
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-lg text-dark-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="defaultCommissionRate" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="minimumPayoutThreshold" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
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
                      className="h-4 w-4 text-[#F05454] focus:ring-[#F05454] border-gray-300 rounded bg-white"
                    />
                    <label htmlFor="enableAgentRegistrations" className="ml-2 block text-sm text-gray-900">
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
                      className="h-4 w-4 text-[#F05454] focus:ring-[#F05454] border-gray-300 rounded bg-white"
                    />
                    <label htmlFor="systemMaintenanceMode" className="ml-2 block text-sm text-gray-900">
                      System Maintenance Mode
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    When enabled, non-admin users will see a maintenance message.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#F05454] rounded-md hover:bg-[#D64545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454]"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Database Status</p>
                <p className="text-sm font-medium text-green-600">Connected</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Server Uptime</p>
                <p className="text-sm font-medium text-gray-900">24 hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-sm font-medium text-gray-900">150</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-sm font-medium text-gray-900">42</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
