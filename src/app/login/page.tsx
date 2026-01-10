'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect based on role
        if (data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (data.role === 'AGENT') {
          router.push('/agent/dashboard');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <img 
            src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
            alt="Logo" 
            className="h-20 w-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F05454] to-[#D4AF37] bg-clip-text text-transparent">
            Login
          </h1>
          <p className="mt-2 text-[#9CA3AF]">
            Sign in to your account
          </p>
        </div>
        
        <div className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
                    
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
              />
            </div>
                      
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>
                      
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F05454] to-[#D4AF37] text-white py-2 px-4 rounded-md hover:from-[#D64545] hover:to-[#B8941F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-[#9CA3AF] mt-6">
            <p>
              Default admin credentials: admin@me.com / 123456<br />
              <span className="text-xs text-red-400">Please change password after first login</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}