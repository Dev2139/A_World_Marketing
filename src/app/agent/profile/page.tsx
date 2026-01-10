'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    bankDetails: ''
  });
  const [editMode, setEditMode] = useState(false);
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
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            mobileNumber: userData.mobileNumber || '',
            bankDetails: userData.bankDetails || ''
          });
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/agent/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        console.error('Error updating profile');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700">
                  Bank Details
                </label>
                <input
                  type="text"
                  name="bankDetails"
                  id="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    mobileNumber: user?.mobileNumber || '',
                    bankDetails: user?.bankDetails || ''
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="mt-1 text-sm text-gray-900">{user?.firstName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="mt-1 text-sm text-gray-900">{user?.lastName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-sm text-gray-900">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="mt-1 text-sm text-gray-900">{user?.mobileNumber || 'Not provided'}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bank Details</label>
                <div className="mt-1 text-sm text-gray-900">{user?.bankDetails || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}