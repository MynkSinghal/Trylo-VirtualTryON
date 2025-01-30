'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Logo } from '@/app/components/Logo';

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
      console.log('Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        console.log('Session received:', data.session);
        
        // Set the session in Supabase
        await supabase.auth.setSession(data.session);
        
        // Add a delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get session to verify it's set
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Verified session:', session);

        if (session) {
          toast({
            title: 'Success!',
            description: 'You have been logged in successfully.',
          });

          // Use router.replace with await
          console.log('Redirecting to dashboard...');
          await router.replace('/dashboard');
        } else {
          throw new Error('Session not set after login');
        }
      } else {
        console.error('No session received after login');
        throw new Error('No session received after login');
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="container flex justify-between items-center h-16 px-6">
        <Link href="/">
          <Logo />
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-gray-900/50 border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-gray-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-400">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="text-yellow-400 hover:text-yellow-300"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
} 