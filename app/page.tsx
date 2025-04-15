'use client';

import Link from 'next/link';
import { AuroraText } from "@/components/magicui/aurora-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useRef } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <Navbar rightLink={user ? { href: "/my-generations", text: "My Generations" } : undefined} />

      <main className="flex-1 flex flex-col items-center justify-center pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-12 px-4">
          <div className="space-y-12">
            <h1 className="text-7xl font-bold tracking-tight">
              Virtual Try-On
              <div className="text-yellow-400 flex items-center justify-center gap-2 mt-4">
                <AuroraText className="text-6xl">Reimagined</AuroraText>
              </div>
            </h1>
            
            <div ref={descriptionRef} className="relative">
              <p className="text-lg text-gray-400 font-variable">
                Experience the future of fashion with our AI-powered virtual try-on technology. Upload your photo and try on any garment instantly.
              </p>
            </div>
          </div>

          <Link href="/studio" className="inline-block">
            <InteractiveHoverButton className="px-8 py-2 text-sm flex items-center gap-2 min-w-[200px] whitespace-nowrap">
              Enter Studio
            </InteractiveHoverButton>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}