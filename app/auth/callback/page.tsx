'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const token_hash = searchParams.get('token_hash');
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/studio';
      
      try {
        if (token_hash) {
          // Email verification flow
          const { error } = await supabase.auth.verifyOtp({
            type: 'signup',
            token_hash,
          });
          if (error) throw error;
        } else if (code) {
          // OAuth or magic link flow
          await supabase.auth.exchangeCodeForSession(code);
        }

        // Redirect to the next page (default to /studio)
        router.push(next);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login?error=Could not authenticate user');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
} 