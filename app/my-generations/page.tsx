'use client';

import { motion } from 'framer-motion';
import { Download, Share2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export default function MyGenerationsPage() {
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
            <button className="auth-button max-w-xs mx-auto">
              <Plus className="w-5 h-5" />
              Create New Generation
            </button>
          </motion.div>
          
          {/* Grid of Generations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Empty State */}
            {Array.from({ length: 0 }).length === 0 && (
              <motion.div
                variants={itemVariants}
                className="col-span-full flex flex-col items-center justify-center glass-card p-12 text-center"
              >
                <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">No generations yet</h3>
                <p className="text-gray-400 mb-6">
                  Start by creating your first virtual try-on generation
                </p>
                <button className="auth-button max-w-xs">
                  <Plus className="w-5 h-5" />
                  Create First Generation
                </button>
              </motion.div>
            )}
            
            {/* Generation Cards */}
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card group"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-t-xl">
                  <img
                    src={`https://picsum.photos/seed/${index}/400/400`}
                    alt={`Generation ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-bold mb-1">Generation #{index + 1}</h3>
                  <p className="text-sm text-gray-400">Created on April {index + 1}, 2024</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Load More Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <button className="auth-button-secondary max-w-xs mx-auto">
              Load More
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 