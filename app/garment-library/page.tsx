'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Shirt, 
  Footprints, 
  Glasses, 
  UserRound,
  User2,
  User,
  Store,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for the garment library
// In a real app, this would come from an API or database
const garmentData = {
  male: {
    shirts: [
      { id: 1, name: 'Blue Formal Shirt', image: '/garments/male/shirts/blue-formal.jpg' },
      { id: 2, name: 'White Casual Shirt', image: '/garments/male/shirts/white-casual.png' },
      { id: 3, name: 'Black Dress Shirt', image: '/garments/male/shirts/black-dress.png' },
    ],
    tshirts: [
      { id: 4, name: 'Red Graphic Tee', image: '/garments/male/tshirts/red-graphic.png' },
      { id: 5, name: 'Navy Basic Tee', image: '/garments/male/tshirts/navy-basic.png' },
      { id: 6, name: 'Striped Tee', image: '/garments/male/tshirts/striped.png' },
    ],
    pants: [
      { id: 7, name: 'Khaki Chinos', image: '/garments/male/pants/khaki-chinos.png' },
      { id: 8, name: 'Blue Jeans', image: '/garments/male/pants/blue-jeans.png' },
      { id: 9, name: 'Black Dress Pants', image: '/garments/male/pants/black-dress.png' },
    ],
    coats: [
      { id: 10, name: 'Winter Coat', image: '/garments/male/coats/winter-coat.png' },
      { id: 11, name: 'Leather Jacket', image: '/garments/male/coats/leather-jacket.png' },
      { id: 12, name: 'Blazer', image: '/garments/male/coats/blazer.png' },
    ],
    kurtas: [
      { id: 13, name: 'Embroidered Kurta', image: '/garments/male/kurtas/embroidered.png' },
      { id: 14, name: 'Simple White Kurta', image: '/garments/male/kurtas/white.png' },
      { id: 15, name: 'Wedding Kurta', image: '/garments/male/kurtas/wedding.png' },
    ],
  },
  female: {
    shirts: [
      { id: 16, name: 'White Blouse', image: '/garments/female/shirts/white-blouse.png' },
      { id: 17, name: 'Floral Shirt', image: '/garments/female/shirts/floral.png' },
      { id: 18, name: 'Silk Button-up', image: '/garments/female/shirts/silk.png' },
    ],
    tshirts: [
      { id: 19, name: 'Pink Graphic Tee', image: '/garments/female/tshirts/pink-graphic.png' },
      { id: 20, name: 'Basic White Tee', image: '/garments/female/tshirts/white-basic.png' },
      { id: 21, name: 'Crop Top', image: '/garments/female/tshirts/crop-top.png' },
    ],
    pants: [
      { id: 22, name: 'Black Leggings', image: '/garments/female/pants/black-leggings.png' },
      { id: 23, name: 'Skinny Jeans', image: '/garments/female/pants/skinny-jeans.png' },
      { id: 24, name: 'Wide Leg Pants', image: '/garments/female/pants/wide-leg.png' },
    ],
    dresses: [
      { id: 25, name: 'Summer Dress', image: '/garments/female/dresses/summer.png' },
      { id: 26, name: 'Cocktail Dress', image: '/garments/female/dresses/cocktail.png' },
      { id: 27, name: 'Maxi Dress', image: '/garments/female/dresses/maxi.png' },
    ],
    skirts: [
      { id: 28, name: 'A-line Skirt', image: '/garments/female/skirts/a-line.png' },
      { id: 29, name: 'Pencil Skirt', image: '/garments/female/skirts/pencil.png' },
      { id: 30, name: 'Pleated Skirt', image: '/garments/female/skirts/pleated.png' },
    ],
    saree: [
      { id: 25, name: 'Kanjiwaram Saree', image: '/garments/female/saree/kanjiwaram.png' },
      { id: 26, name: 'Gujrati Saree', image: '/garments/female/saree/gujrati.png' },
      { id: 27, name: 'Rajasthani Saree', image: '/garments/female/saree/rajasthani.png' },
    ],
  }
};

// Type definitions for garment data structure
type MaleCategories = 'shirts' | 'tshirts' | 'pants' | 'coats' | 'kurtas';
type FemaleCategories = 'shirts' | 'tshirts' | 'pants' | 'dresses' | 'skirts' | 'saree';
type GenderCategories = MaleCategories | FemaleCategories;

// Categories for each gender
const maleCategories = [
  { id: 'shirts' as const, name: 'Shirts', icon: <Shirt className="w-5 h-5" /> },
  { id: 'tshirts' as const, name: 'T-Shirts', icon: <Shirt className="w-5 h-5" /> },
  { id: 'pants' as const, name: 'Pants', icon: <Footprints className="w-5 h-5" /> },
  { id: 'coats' as const, name: 'Coats & Jackets', icon: <Shirt className="w-5 h-5" /> },
  { id: 'kurtas' as const, name: 'Kurtas', icon: <Shirt className="w-5 h-5" /> },
];

const femaleCategories = [
  { id: 'shirts' as const, name: 'Shirts & Blouses', icon: <Shirt className="w-5 h-5" /> },
  { id: 'tshirts' as const, name: 'T-Shirts', icon: <Shirt className="w-5 h-5" /> },
  { id: 'pants' as const, name: 'Pants', icon: <Footprints className="w-5 h-5" /> },
  { id: 'dresses' as const, name: 'Dresses', icon: <Shirt className="w-5 h-5" /> },
  { id: 'skirts' as const, name: 'Skirts', icon: <Shirt className="w-5 h-5" /> },
  { id: 'saree' as const, name: 'Saree', icon: <Shirt className="w-5 h-5" /> },
];

type GarmentItem = {
  id: number;
  name: string;
  image: string;
};

export default function GarmentLibraryPage() {
  const router = useRouter();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [category, setCategory] = useState<GenderCategories>('shirts');
  const [selectedGarment, setSelectedGarment] = useState<GarmentItem | null>(null);
  
  // Function to handle garment selection
  const handleSelectGarment = (garment: GarmentItem) => {
    setSelectedGarment(garment);
    
    // Store both the image path and the actual file path
    localStorage.setItem('selectedGarmentPath', garment.image);
    localStorage.setItem('selectedGarmentName', garment.name);
    
    // Navigate back to the studio page
    router.push('/studio');
  };

  // Get the categories based on the selected gender
  const categories = gender === 'male' ? maleCategories : femaleCategories;
  
  // Get the garments for the selected gender and category
  // Use type assertion to help TypeScript understand our data structure
  const garments = gender === 'male' 
    ? garmentData.male[category as MaleCategories] || []
    : garmentData.female[category as FemaleCategories] || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center h-16 px-6">
          <div className="text-2xl font-bold">Trylo</div>
          <Link href="/studio">
            <Button variant="outline" className="auth-button-secondary flex items-center gap-2 px-4">
              <ChevronLeft className="h-4 w-4" />
              Back to Studio
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="page-header">Garment Library</h1>
          <p className="page-subheader">Select a garment from our collection to try on</p>
        </motion.div>

        {/* Gender Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Tabs defaultValue="male" onValueChange={(value) => setGender(value as 'male' | 'female')} className="w-full">
            <TabsList className="grid max-w-md grid-cols-2 mb-8">
              <TabsTrigger 
                value="male" 
                className="flex items-center gap-2 text-base py-3 data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <User className="w-4 h-4" /> Men's Collection
              </TabsTrigger>
              <TabsTrigger 
                value="female" 
                className="flex items-center gap-2 text-base py-3 data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <User2 className="w-4 h-4" /> Women's Collection
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Section */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 bg-black/95 backdrop-blur-sm border border-gray-800">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5" /> Categories
                  </h2>
                  <Separator className="my-4 bg-gray-800" />
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-2 pr-4">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={category === cat.id ? "default" : "outline"}
                          className={`w-full text-left ${
                            category === cat.id
                              ? "bg-yellow-400 text-black hover:bg-yellow-500 rounded-lg"
                              : "auth-button-secondary rounded-lg"
                          }`}
                          onClick={() => setCategory(cat.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {cat.icon}
                            <span className="text-left">{cat.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Garments Grid */}
              <div className="lg:col-span-3">
                <div className="glass-card p-6 bg-black/95 backdrop-blur-sm border border-gray-800">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shirt className="w-5 h-5" /> {gender === 'male' ? 'Men\'s' : 'Women\'s'} {categories.find(c => c.id === category)?.name}
                  </h2>
                  <Separator className="my-4 bg-gray-800" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {garments.map((garment) => (
                      <div
                        key={garment.id}
                        className="relative bg-black/50 rounded-lg overflow-hidden cursor-pointer border border-gray-800 group"
                      >
                        <div className="relative h-64">
                          <Image
                            src={garment.image}
                            alt={garment.name}
                            fill
                            className="object-cover object-center transition-opacity duration-300 group-hover:opacity-30"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex flex-col items-center gap-4">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="auth-button"
                              onClick={() => handleSelectGarment(garment)}
                            >
                              Select Garment
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <span className="px-3 py-1.5 rounded-full bg-black text-white text-sm font-medium">
                            {garment.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </motion.div>
      </main>
      
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© 2024 Trylo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 