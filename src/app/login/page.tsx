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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-700 to-yellow-600 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse-glow animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-red-500/30 relative z-10">
        <div className="text-center mb-8">
          <img 
            src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
            alt="Logo" 
            className="h-20 w-20 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500 mb-2">
            Login
          </h1>
          <p className="mt-2 text-red-300">
            Sign in to your account
          </p>
        </div>
        
        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
                    
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-red-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-red-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Enter your email"
              />
            </div>
                      
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-red-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 border border-red-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Enter your password"
              />
            </div>
                      
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-red-400 mt-6">
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