'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Generation {
  id: number;
  model_image_path: string;
  garment_image_path: string;
  result_image_path: string;
  created_at: string;
  mode: string;
  category: string;
}

export default function MyGenerationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const supabase = createClientComponentClient();

  // Format text to proper case
  const formatText = (text: string) => {
    // Split by spaces and format each word
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fetchGenerations = async (pageNumber = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const from = (pageNumber - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform the data to include public URLs for images from correct buckets
      const generationsWithUrls = await Promise.all((data || []).map(async (generation) => {
        const modelUrl = supabase.storage
          .from('generations-model-images')
          .getPublicUrl(generation.model_image_path);
        
        const garmentUrl = supabase.storage
          .from('generations-garment-images')
          .getPublicUrl(generation.garment_image_path);
        
        const resultUrl = supabase.storage
          .from('generations-result-images')
          .getPublicUrl(generation.result_image_path);

        return {
          ...generation,
          model_image_path: modelUrl.data.publicUrl,
          garment_image_path: garmentUrl.data.publicUrl,
          result_image_path: resultUrl.data.publicUrl,
        };
      }));

      if (pageNumber === 1) {
        setGenerations(generationsWithUrls);
      } else {
        setGenerations(prev => [...prev, ...generationsWithUrls]);
      }
      
      setHasMore(generationsWithUrls.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching generations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your generations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and fetch generations on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      fetchGenerations();
    };

    checkAuth();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGenerations(nextPage);
  };

  const handleDelete = async (generation: Generation) => {
    try {
      setIsDeleting(true);
      
      // Extract file paths from the URLs
      const modelPath = generation.model_image_path.split('/').slice(-2).join('/');
      const garmentPath = generation.garment_image_path.split('/').slice(-2).join('/');
      const resultPath = generation.result_image_path.split('/').slice(-2).join('/');
      
      // Delete files from storage
      const { error: modelError } = await supabase.storage
        .from('generations-model-images')
        .remove([modelPath]);
      
      if (modelError) throw modelError;
      
      const { error: garmentError } = await supabase.storage
        .from('generations-garment-images')
        .remove([garmentPath]);
      
      if (garmentError) throw garmentError;
      
      const { error: resultError } = await supabase.storage
        .from('generations-result-images')
        .remove([resultPath]);
      
      if (resultError) throw resultError;

      // Delete the database record
      const { error: dbError } = await supabase
        .from('generations')
        .delete()
        .eq('id', generation.id);

      if (dbError) throw dbError;

      // Update the UI
      setGenerations(prev => prev.filter(g => g.id !== generation.id));
      toast({
        title: "Success",
        description: "Generation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: "Error",
        description: "Failed to delete generation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (generation: Generation) => {
    try {
      const response = await fetch(generation.result_image_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generation-${generation.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download generation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="page-header">My Generations</h1>
            <p className="page-subheader">View and manage all your virtual try-on generations</p>
          </motion.div>
          
          {/* Create New Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <button 
              onClick={() => router.push('/studio')}
              className="auth-button max-w-xs mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create New Generation
            </button>
          </motion.div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            </div>
          )}
          
          {/* Grid of Generations */}
          {!loading && (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Empty State */}
                {generations.length === 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="col-span-full flex flex-col items-center justify-center glass-card p-12 text-center"
                  >
                    <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No generations yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first virtual try-on generation
                    </p>
                    <button 
                      onClick={() => router.push('/studio')}
                      className="auth-button max-w-xs"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Generation
                    </button>
                  </motion.div>
                )}
                
                {/* Generation Cards */}
                {generations.map((generation) => (
                  <motion.div
                    key={generation.id}
                    variants={itemVariants}
                    className="glass-card group"
                  >
                    {/* Images Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div className="relative">
                        <Image
                          src={generation.model_image_path}
                          alt="Model"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="relative">
                        <Image
                          src={generation.garment_image_path}
                          alt="Garment"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="relative col-span-2">
                        <Image
                          src={generation.result_image_path}
                          alt="Result"
                          width={400}
                          height={200}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm">
                          <span className="font-medium text-yellow-400">{formatText(generation.mode)}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-400">{formatText(generation.category)}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(generation.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(generation)}
                          className="flex-1 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full py-2 px-4 flex items-center justify-center gap-2 transition-colors duration-200"
                          disabled={isDeleting}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Result</span>
                        </button>
                        <button
                          onClick={() => handleDelete(generation)}
                          className="bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-full py-2 px-4 flex items-center justify-center gap-2 transition-colors duration-200"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {hasMore && generations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={loadMore}
                    className="auth-button-secondary max-w-xs"
                  >
                    Load More Generations
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 