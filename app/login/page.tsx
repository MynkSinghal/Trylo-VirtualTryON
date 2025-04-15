'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export default function LoginPage() {
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
          
          <div className="glass-card p-8 space-y-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
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
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </motion.button>
            </form>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="auth-button-secondary">
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
              <button className="auth-button-secondary">
                <img src="/github.svg" alt="GitHub" className="w-5 h-5" />
                Continue with GitHub
              </button>
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