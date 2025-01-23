'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AuroraText } from "@/components/magicui/aurora-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import VariableProximity from "@/components/ui/variable-proximity";
import { useRef } from 'react';
import { Logo } from './components/Logo';
import { Footer } from './components/Footer';

export default function HomePage() {
  const descriptionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        <nav className="container flex justify-between items-center h-16 px-6">
          <Logo />
        </nav>

        <main className="flex flex-col items-center justify-center flex-1 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-12 px-4">
            <h1 className="text-7xl font-bold tracking-tight">
              Virtual Try-On
              <div className="text-yellow-400 flex items-center justify-center gap-2 mt-2 mb-4">
                <AuroraText>Reimagined</AuroraText>
                <Sparkles className="w-8 h-8" />
              </div>
            </h1>
            
            <div ref={descriptionRef} className="relative">
              <VariableProximity
                label="Experience the future of fashion with our AI-powered virtual try-on technology. Upload your photo and try on any garment instantly."
                className="text-lg text-gray-400 block"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={descriptionRef}
                radius={100}
                falloff="linear"
              />
            </div>

            <Link href="/studio" className="inline-block">
              <InteractiveHoverButton>
                Enter Studio
              </InteractiveHoverButton>
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}