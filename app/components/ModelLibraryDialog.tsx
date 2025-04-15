'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { maleModels, femaleModels, type Model } from '../../src/lib/modelLibrary';
import { User, User2 } from 'lucide-react';

interface ModelLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: Model) => void;
}

export function ModelLibraryDialog({ open, onOpenChange, onSelectModel }: ModelLibraryDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'male' | 'female'>('male');

  const handleSelectModel = (model: Model) => {
    onSelectModel(model);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-card bg-black/95 backdrop-blur-sm border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Model Library
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="male" value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'male' | 'female')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="male" 
              className="flex items-center gap-2 text-base py-3 data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              <User className="w-4 h-4" /> Male Models
            </TabsTrigger>
            <TabsTrigger 
              value="female" 
              className="flex items-center gap-2 text-base py-3 data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              <User2 className="w-4 h-4" /> Female Models
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="male" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {maleModels.map((model: Model) => (
                <div 
                  key={model.id}
                  className="relative bg-black/50 rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-yellow-400/50 group"
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="relative h-60 w-full">
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-30"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="auth-button"
                      >
                        Select Model
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                      {model.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="female" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {femaleModels.map((model: Model) => (
                <div 
                  key={model.id}
                  className="relative bg-black/50 rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-yellow-400/50 group"
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="relative h-60 w-full">
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-30"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="auth-button"
                      >
                        Select Model
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                      {model.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 