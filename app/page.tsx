'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AuroraText } from "@/components/magicui/aurora-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import VariableProximity from "@/components/ui/variable-proximity";
import { useRef } from 'react';

export default function Home() {
  const descriptionRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <span className="text-xl font-bold">Mayank</span>
      </div>
      
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
  );
}