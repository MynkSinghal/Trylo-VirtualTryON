'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const fashionFacts = [
  "The world's oldest known garment is a 5,000-year-old linen Tarkhan dress from Egypt.",
  "Producing one cotton T-shirt requires 2,700 liters of water.",
  "The fashion industry contributes ~10% of global carbon emissions.",
  "Silk production began in China ~2700 BCE and was kept secret for millennia.",
  "The average garment is worn only 7–10 times before disposal.",
  "Digital-only clothing is sold for avatars in the metaverse.",
  "Mushroom leather is a sustainable alternative gaining popularity.",
];

export function ProcessingStatus({ status }: { status: string }) {
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % fashionFacts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      <div className="text-center space-y-4">
        <h3 className="font-semibold text-lg">{status}</h3>
        <div className="max-w-sm mx-auto">
          <p className="text-sm text-gray-400 animate-fade-in">
            Did you know? {fashionFacts[currentFact]}
          </p>
        </div>
      </div>
    </div>
  );
} 