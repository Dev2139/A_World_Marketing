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
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">My Profile</h2>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl overflow-hidden sm:rounded-2xl p-8 border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative z-10">
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-purple-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-purple-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-purple-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-bold text-purple-300 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bankDetails" className="block text-sm font-bold text-purple-300 mb-2">
                  Bank Details
                </label>
                <input
                  type="text"
                  name="bankDetails"
                  id="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
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
                className="px-6 py-3 text-sm font-bold text-purple-300 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="border-b border-purple-500/30 pb-4">
              <h3 className="text-xl font-bold text-purple-200">Personal Information</h3>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-purple-300">First Name</label>
                <div className="mt-2 text-sm font-bold text-white">{user?.firstName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-300">Last Name</label>
                <div className="mt-2 text-sm font-bold text-white">{user?.lastName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-300">Email</label>
                <div className="mt-2 text-sm font-bold text-white">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-300">Mobile Number</label>
                <div className="mt-2 text-sm font-bold text-white">{user?.mobileNumber || 'Not provided'}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-purple-300">Bank Details</label>
                <div className="mt-2 text-sm font-bold text-white">{user?.bankDetails || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 shadow-lg shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
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