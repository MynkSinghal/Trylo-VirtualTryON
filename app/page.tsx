'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { AuroraText } from "@/components/magicui/aurora-text";
import ShinyText from "@/components/ui/shiny-text";
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
      
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
        <h1 className="text-7xl font-bold tracking-tight">
          Virtual Try-On
          <div className="text-yellow-400 flex items-center justify-center gap-2">
            <AuroraText>Reimagined</AuroraText>
            <Sparkles className="w-8 h-8" />
          </div>
        </h1>
        
        <div ref={descriptionRef} className="relative">
          <VariableProximity
            label="Experience the future of fashion with our AI-powered virtual try-on technology. Upload your photo and try on any garment instantly."
            className="text-lg text-gray-400 max-w-2xl mx-auto mt-12"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={descriptionRef}
            radius={100}
            falloff="linear"
          />
        </div>

        <Button 
          asChild
          size="lg" 
          className="bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-8 py-6 mt-8"
        >
          <Link href="/studio">
            <ShinyText text="Enter Studio →" speed={3} />
          </Link>
        </Button>
      </div>
    </main>
  );
}