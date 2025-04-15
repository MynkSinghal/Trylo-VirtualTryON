'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="container flex justify-between items-center h-16 px-4 md:px-6 py-4 mx-auto">
        <Logo />
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {rightLink && (
                <Link href={rightLink.href}>
                  <InteractiveHoverButton className="px-4 md:px-8 py-2 text-sm flex items-center gap-2 whitespace-nowrap">
                    {rightLink.text}
                  </InteractiveHoverButton>
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <InteractiveHoverButton className="px-4 md:px-6 py-2 text-sm">
                  Log In
                </InteractiveHoverButton>
              </Link>
              <Link href="/signup">
                <InteractiveHoverButton className="px-4 md:px-6 py-2 text-sm bg-yellow-400 text-black hover:bg-yellow-500">
                  Sign Up
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 