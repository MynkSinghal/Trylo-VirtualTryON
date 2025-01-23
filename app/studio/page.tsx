'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Sparkles, Upload, Shirt, 
  Waypoints, 
  Blocks, 
  Image as ImageIcon, 
  Loader2,
  Download,
  ClipboardPaste
} from 'lucide-react';
import Image from 'next/image';
import { generateTryOn, type Category } from '@/lib/api';
import { ProcessingStatus } from '../components/ProcessingStatus';

export default function StudioPage() {
  const { toast } = useToast();
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('tops');
  const [mode, setMode] = useState<'performance' | 'balanced' | 'quality'>('balanced');
  const [numSamples, setNumSamples] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent, type: 'model' | 'garment') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file, type);
    }
  };

  const handlePaste = async (type: 'model' | 'garment') => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], 'pasted-image.png', { type });
            handleImageFile(file, type === 'model' ? 'model' : 'garment');
            return;
          }
        }
      }
      toast({
        title: "No Image Found",
        description: "No image found in clipboard",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Clipboard Error",
        description: "Failed to access clipboard",
        variant: "destructive"
      });
    }
  };

  const handleImageFile = (file: File, type: 'model' | 'garment') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === 'model') {
        setModelImage(file);
        setModelPreview(preview);
      } else {
        setGarmentImage(file);
        setGarmentPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'garment') => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file, type);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    
    const response = await fetch(result);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'try-on-result.png';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const processImages = async () => {
    if (!modelImage || !garmentImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both a model and garment image.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const results = await generateTryOn({
        modelImage,
        garmentImage,
        category,
        mode,
        numSamples,
        onStatusUpdate: setProcessingStatus,
      });
      
      if (results.length > 0) {
        setResult(results[0]);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate try-on image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-bold">Mayank Studio</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Upload Box */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Upload Model Photo</h2>
          <div
            className="border-2 border-dashed border-gray-700 rounded-lg p-12 h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-yellow-400 hover:bg-gray-900/30"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'model')}
          >
            {modelPreview ? (
              <div className="relative h-full w-full">
                <Image
                  src={modelPreview}
                  alt="Model preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <Upload className="w-16 h-16 mx-auto text-gray-500 transition-colors group-hover:text-yellow-400" />
                <p className="text-gray-400 text-lg">Drag and drop or click to upload</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'model')}
                  id="model-upload"
                />
                <div className="flex gap-2">
                  <Button 
                    asChild 
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                  >
                    <label htmlFor="model-upload">Choose File</label>
                  </Button>
                  <Button
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                    onClick={() => handlePaste('model')}
                  >
                    <ClipboardPaste className="w-4 h-4 mr-2" />
                    Paste
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Garment Upload Box */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Upload Garment</h2>
            
            {/* Category Selection */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`flex-1 py-6 ${category === 'tops' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                onClick={() => setCategory('tops')}
              >
                <Shirt className="w-5 h-5 mr-2" />
                Top
              </Button>
              <Button
                variant="outline"
                className={`flex-1 py-6 ${category === 'bottoms' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                onClick={() => setCategory('bottoms')}
              >
                <Waypoints className="w-5 h-5 mr-2" />
                Bottom
              </Button>
              <Button
                variant="outline"
                className={`flex-1 py-6 ${category === 'one-pieces' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                onClick={() => setCategory('one-pieces')}
              >
                <Blocks className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Full Body
              </Button>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-yellow-400"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'garment')}
            >
              {garmentPreview ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={garmentPreview}
                    alt="Garment preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-600" />
                  <p className="text-gray-400 text-lg">Drag and drop or click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'garment')}
                    id="garment-upload"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button 
                      asChild 
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                    >
                      <label htmlFor="garment-upload">Choose File</label>
                    </Button>
                    <Button
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                      onClick={() => handlePaste('garment')}
                    >
                      <ClipboardPaste className="w-4 h-4 mr-2" />
                      Paste
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Quality</label>
                <Select value={mode} onValueChange={(value: 'performance' | 'balanced' | 'quality') => setMode(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Fast</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Samples</label>
                <Select 
                  value={numSamples.toString()} 
                  onValueChange={(value) => setNumSamples(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Sample</SelectItem>
                    <SelectItem value="2">2 Samples</SelectItem>
                    <SelectItem value="3">3 Samples</SelectItem>
                    <SelectItem value="4">4 Samples</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Updated Result Box */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Result</h2>
            {result && !isProcessing && (
              <Button
                variant="outline"
                className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
          <div className="border-2 border-gray-700 rounded-lg p-8 h-[400px]">
            {isProcessing ? (
              <ProcessingStatus status={processingStatus} />
            ) : result ? (
              <div className="relative h-full">
                <Image
                  src={result}
                  alt="Result preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <p className="text-lg">Your result will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={processImages}
          disabled={!modelImage || !garmentImage || isProcessing}
          className="bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Generate Try-on'
          )}
        </Button>
      </div>
    </div>
  );
}