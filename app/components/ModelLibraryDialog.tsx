'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { maleModels, femaleModels, type Model } from '../../src/lib/modelLibrary';

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
      <DialogContent className="max-w-3xl bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Model Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="male" value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'male' | 'female')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="male" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Male Models
            </TabsTrigger>
            <TabsTrigger value="female" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Female Models
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="male" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {maleModels.map((model: Model) => (
                <div 
                  key={model.id}
                  className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-yellow-400 group"
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="relative h-60 w-full">
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      <p className="text-white font-medium text-sm truncate">{model.name}</p>
                    </div>
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
                  className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-yellow-400 group"
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="relative h-60 w-full">
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      <p className="text-white font-medium text-sm truncate">{model.name}</p>
                    </div>
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