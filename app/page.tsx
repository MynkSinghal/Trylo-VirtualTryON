'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Shirt, Palette, ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useAuth } from '@/contexts/auth-context';
import { Marquee } from './components/magicui/marquee';

export default function HomePage() {
  const { user } = useAuth();
  
  // References for scroll-linked animations
  const targetRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  
  // Transform values for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.8, 0]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Navbar rightLink={user ? { href: "/my-generations", text: "My Generations" } : undefined} />

      {/* Hero Section with Parallax */}
      <div ref={targetRef} className="relative min-h-screen flex items-center">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y, opacity }}
        >
          <div className="absolute inset-0 bg-black" />
        </motion.div>
        
        <div className="container mx-auto px-4 pt-24 z-10">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-2 px-4 py-1.5 glass-effect rounded-full text-sm text-yellow-300 font-medium inline-flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>AI-Powered Virtual Try-On</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
              Virtual Try-On
                <span className="block mt-2 font-cursive text-yellow-400 text-6xl md:text-8xl">Reimagined</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-300 max-w-2xl font-poppins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Experience the future of fashion with our AI-powered virtual try-on technology. 
                Upload your photo and instantly see how any garment looks on you.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="pt-8"
              >
                <Link href="/studio">
                  <motion.button 
                    className="group relative px-8 py-4 bg-yellow-400/90 hover:bg-yellow-400 text-black font-bold rounded-full overflow-hidden transition-all hover:pr-12"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enter Studio
                    <motion.span 
                      className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      animate={{ x: 0 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut" 
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ 
                y: [0, 12, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut" 
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Features Section */}
      <div ref={featuresRef} className="py-32 relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="container mx-auto px-4"
        >
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How it <span className="font-cursive text-yellow-400">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">Our advanced AI technology makes virtual try-on simple, fast, and incredibly realistic</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              variants={itemVariants}
              className="glass-card p-8"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Your Photo</h3>
              <p className="text-gray-400">Start by uploading a full-body photo of yourself in a neutral position.</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="glass-card p-8"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Select Garments</h3>
              <p className="text-gray-400">Browse our extensive library of garments or upload your own items to try on.</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="glass-card p-8"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-gradient-to-br from-green-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-white" />
            </div>
              <h3 className="text-xl font-bold mb-3">See Results</h3>
              <p className="text-gray-400">Our AI generates realistic images of you wearing the selected garments in seconds.</p>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="text-center mt-16"
          >
            <Link href="/studio">
              <button className="group relative inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full hover:bg-white/10 transition-all hover:pl-10">
                <span className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </span>
                Try it yourself
              </button>
          </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Testimonials */}
      <div className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              What People Are <span className="font-cursive text-yellow-400">Saying</span>
            </h2>
            <p className="text-gray-400 text-lg">Join hundreds of satisfied users who have transformed their shopping experience</p>
          </motion.div>
        </div>
          
        <div className="w-full">
          <Marquee pauseOnHover className="py-4">
            <div className="flex gap-8">
              <div className="glass-card p-8 w-[400px]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  <div>
                    <h4 className="font-bold">Priya Sharma</h4>
                    <p className="text-sm text-gray-400">Fashion Designer</p>
                  </div>
                </div>
                <p className="text-gray-300">"As a fashion designer, I'm amazed by the accuracy of this virtual try-on tool. It's revolutionizing how my clients visualize designs!"</p>
              </div>

              <div className="glass-card p-8 w-[400px]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                  <div>
                    <h4 className="font-bold">Arjun Patel</h4>
                    <p className="text-sm text-gray-400">Tech Entrepreneur</p>
                  </div>
                </div>
                <p className="text-gray-300">"The AI technology behind this platform is incredible. It's making online shopping so much more convenient and reliable."</p>
              </div>

              <div className="glass-card p-8 w-[400px]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                  <div>
                    <h4 className="font-bold">Neha Gupta</h4>
                    <p className="text-sm text-gray-400">Fashion Blogger</p>
                  </div>
                </div>
                <p className="text-gray-300">"This is a game-changer for my followers! No more uncertainty about how clothes will look. The virtual try-on is spot on!"</p>
              </div>

              <div className="glass-card p-8 w-[400px]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                  <div>
                    <h4 className="font-bold">Rahul Verma</h4>
                    <p className="text-sm text-gray-400">E-commerce Manager</p>
                  </div>
                </div>
                <p className="text-gray-300">"We've seen a significant reduction in returns since implementing this on our platform. Our customers love the try-before-you-buy experience!"</p>
              </div>

              <div className="glass-card p-8 w-[400px]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-rose-400"></div>
                  <div>
                    <h4 className="font-bold">Ananya Desai</h4>
                    <p className="text-sm text-gray-400">Style Consultant</p>
                  </div>
                </div>
                <p className="text-gray-300">"My styling consultations have become so much more effective. Clients can instantly see how different styles suit them!"</p>
              </div>
            </div>
          </Marquee>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container relative mx-auto px-4 text-center z-10"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 max-w-3xl mx-auto leading-tight">
            Ready to transform your <span className="font-cursive text-yellow-400">shopping</span> experience?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying the future of virtual try-on technology.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/studio">
              <button className="px-10 py-5 bg-yellow-400/90 hover:bg-yellow-400 text-black font-bold rounded-full text-lg shadow-xl shadow-yellow-500/20">
                Get Started Now
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}