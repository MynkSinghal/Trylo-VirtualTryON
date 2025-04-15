'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';

interface NavbarProps {
  rightLink?: {
    href: string;
    text: string;
  };
}

export function Navbar({ rightLink }: NavbarProps) {
  const { user, signOut } = useAuth();
  
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="absolute inset-0 bg-black/100"></div>
      <div className="container flex justify-between items-center h-20 px-6 mx-auto relative z-10">
        <Logo />
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {rightLink && (
                <Link href={rightLink.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full text-sm transition-colors"
                  >
                    {rightLink.text}
                  </motion.button>
                </Link>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={signOut}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full text-sm transition-colors"
              >
                Sign Out
              </motion.button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full text-sm transition-colors"
                >
                  Log In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full text-sm transition-colors"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
} 