'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn, Loader2, TestTube } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Set the session in Supabase
        await supabase.auth.setSession(data.session);
        
        toast({
          title: 'Success!',
          description: 'You have been logged in successfully.',
        });

        router.push('/studio');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('test@test.com');
    setPassword('test@123');
    
    toast({
      title: 'Demo Credentials Loaded',
      description: 'You can now click "Sign In" to access the demo account.',
    });
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="flex min-h-screen items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="page-header">Welcome Back</h1>
            <p className="page-subheader">Sign in to continue your virtual try-on journey</p>
          </div>
          
          <div className="glass-card p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-yellow-400 focus:ring-yellow-400/50" />
                  <span className="ml-2 text-gray-300">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-yellow-400 hover:text-yellow-300">
                  Forgot password?
                </Link>
              </div>
              
              <motion.button
                type="submit"
                className="auth-button mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo Credentials Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">
                  For recruiters and demo purposes
                </p>
                <motion.button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="auth-button-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TestTube className="w-4 h-4" />
                  Use Demo Credentials
                </motion.button>
                <p className="text-xs text-gray-500 mt-3">
                  test@test.com • test@123
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center gap-1"
            >
              Sign up now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
} 