'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { getUserGenerations } from '@/lib/supabase/database';
import { getImageUrl } from '@/lib/supabase/storage';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/app/components/Navbar';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import type { Generation } from '@/lib/supabase/types';

interface GenerationWithUrls extends Generation {
  modelImageUrl: string;
  garmentImageUrl: string;
  resultImageUrl: string;
}

export default function MyGenerationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [generations, setGenerations] = useState<GenerationWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await getUserGenerations(user.id);
        
        // Additional security check
        const filteredData = data.filter(gen => gen.user_id === user.id);
        
        if (filteredData.length !== data.length) {
          console.error('Security warning: Found generations not belonging to current user');
        }

        // Get public URLs for all images
        const generationsWithUrls = await Promise.all(
          filteredData.map(async (generation) => {
            try {
              const [modelImageUrl, garmentImageUrl, resultImageUrl] = await Promise.all([
                getImageUrl('generations-model-images', generation.model_image_path),
                getImageUrl('generations-garment-images', generation.garment_image_path),
                getImageUrl('generations-result-images', generation.result_image_path),
              ]);

              return {
                ...generation,
                modelImageUrl,
                garmentImageUrl,
                resultImageUrl,
              };
            } catch (error) {
              console.error('Error loading images for generation:', error);
              return null;
            }
          })
        );

        if (mounted) {
          setGenerations(generationsWithUrls.filter((g): g is GenerationWithUrls => 
            g !== null && g.user_id === user.id
          ));
        }
      } catch (error) {
        console.error('Error fetching generations:', error);
        if (error instanceof Error && error.message === 'Unauthorized access') {
          router.replace('/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        fetchData();
      }
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  // If no user, the useEffect will handle redirect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar rightLink={{ href: "/studio", text: "Create New" }} />

      <main className="container mx-auto px-6 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">My Generations</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        ) : generations.length === 0 ? (
          <Card className="p-6 bg-gray-900/50 border-gray-800 text-center">
            <p className="text-gray-400">You haven't created any generations yet.</p>
            <Link href="/studio" className="mt-4 inline-block">
              <InteractiveHoverButton className="px-8 py-2 text-sm flex items-center gap-2 min-w-[200px] whitespace-nowrap">
                Create your first generation
              </InteractiveHoverButton>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((generation) => (
              <Card 
                key={generation.id} 
                className="p-4 bg-gray-900/50 border-gray-800 flex flex-col overflow-hidden"
              >
                {/* Input Images Row */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 border-2 border-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={generation.modelImageUrl}
                        alt="Model"
                        fill
                        className="object-contain p-1"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                      Model
                    </div>
                  </div>
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 border-2 border-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={generation.garmentImageUrl}
                        alt="Garment"
                        fill
                        className="object-contain p-1"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                      Garment
                    </div>
                  </div>
                </div>

                {/* Result Image */}
                <div className="relative aspect-[3/4] mb-4">
                  <div className="absolute inset-0 border-2 border-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={generation.resultImageUrl}
                      alt="Result"
                      fill
                      className="object-contain p-1"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                    Result
                  </div>
                </div>

                {/* Generation Info */}
                <div className="text-sm text-gray-400 space-y-1 mt-auto">
                  <p>Category: {generation.category}</p>
                  <p>Quality: {generation.mode}</p>
                  <p>Created: {new Date(generation.created_at).toLocaleDateString()}</p>
                  {generation.processing_time && (
                    <p>Processing Time: {generation.processing_time}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 