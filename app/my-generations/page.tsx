'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Generation {
  id: string;
  created_at: string;
  image_url: string;
  user_id: string;
}

export default function MyGenerationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGenerations(data || []);
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

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGenerations(prev => prev.filter(gen => gen.id !== id));
      toast({
        title: 'Success',
        description: 'Generation deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete generation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (generation: Generation) => {
    try {
      await navigator.share({
        title: 'Check out my virtual try-on!',
        text: 'Generated with Trylo Virtual Try-On',
        url: generation.image_url,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: 'Failed to share generation. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownload = async (generation: Generation) => {
    try {
      const response = await fetch(generation.image_url);
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
              onClick={() => router.push('/generate')}
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
                    onClick={() => router.push('/generate')}
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
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <img
                      src={generation.image_url}
                      alt={`Generation ${generation.id}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <motion.button
                        onClick={() => handleDownload(generation)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare(generation)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(generation.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        disabled={deleting === generation.id}
                      >
                        {deleting === generation.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-bold mb-1">Generation #{generation.id}</h3>
                    <p className="text-sm text-gray-400">
                      Created on {new Date(generation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
} 