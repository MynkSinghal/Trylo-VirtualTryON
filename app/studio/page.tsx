'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, Upload,
  Image as ImageIcon, 
  Loader2,
  Download,
} from 'lucide-react';
import Image from 'next/image';
import { generateTryOn, type Category } from '@/lib/api';
import { ProcessingStatus } from '../components/ProcessingStatus';
import TopSvg from '../icons/top.svg';
import BottomSvg from '../icons/bottom.svg';
import FullbodySvg from '../icons/fullbody.svg';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { Logo } from '../components/Logo';

const QUALITY_TIMES = {
  performance: '~9sec',
  balanced: '~15sec',
  quality: '~20sec'
} as const;

export default function StudioPage() {
  const { toast } = useToast();
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('tops');
  const [mode, setMode] = useState<'performance' | 'balanced' | 'quality'>('balanced');
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

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Determine which box is focused
          const activeElement = document.activeElement;
          const modelBox = document.getElementById('model-box');
          const garmentBox = document.getElementById('garment-box');
          
          if (modelBox?.contains(activeElement)) {
            handleImageFile(file, 'model');
          } else if (garmentBox?.contains(activeElement)) {
            handleImageFile(file, 'garment');
          }
        }
        break;
      }
    }
  };

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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
    setResult(null); // Reset result when starting new processing
    try {
      const results = await generateTryOn({
        modelImage,
        garmentImage,
        category,
        mode,
        numSamples: 1,
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 p-6">
        <nav className="flex justify-between items-center mb-8">
          <Logo />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model Upload Box */}
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Upload Model Photo</h2>
            <div
              id="model-box"
              className="border-2 border-dashed border-gray-700 rounded-lg p-12 h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-yellow-400 hover:bg-gray-900/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'model')}
              tabIndex={0}
            >
              {modelPreview ? (
                <div className="relative h-full w-full">
                  <Image
                    src={modelPreview}
                    alt="Model preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <Upload className="w-16 h-16 mx-auto text-gray-500 transition-colors group-hover:text-yellow-400" />
                  <p className="text-gray-400 text-lg">Drag and drop, paste, or click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'model')}
                    id="model-upload"
                  />
                  <Button 
                    asChild 
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                  >
                    <label htmlFor="model-upload">Choose File</label>
                  </Button>
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
                  <TopSvg className={`w-5 h-5 mr-2 ${category === 'tops' ? 'text-black' : 'text-white'}`} />
                  Top
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 py-6 ${category === 'bottoms' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                  onClick={() => setCategory('bottoms')}
                >
                  <BottomSvg className={`w-5 h-5 mr-2 ${category === 'bottoms' ? 'text-black' : 'text-white'}`} />
                  Bottom
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 py-6 ${category === 'one-pieces' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                  onClick={() => setCategory('one-pieces')}
                >
                  <FullbodySvg className={`w-5 h-5 mr-2 ${category === 'one-pieces' ? 'text-black' : 'text-white'}`} />
                  Full Body
                </Button>
              </div>

              {/* Upload Area */}
              <div
                id="garment-box"
                className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-yellow-400"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'garment')}
                tabIndex={0}
              >
                {garmentPreview ? (
                  <div className="relative h-64 w-full">
                    <Image
                      src={garmentPreview}
                      alt="Garment preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-600" />
                    <p className="text-gray-400 text-lg">Drag and drop, paste, or click to upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'garment')}
                      id="garment-upload"
                    />
                    <Button 
                      asChild 
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                    >
                      <label htmlFor="garment-upload">Choose File</label>
                    </Button>
                  </div>
                )}
              </div>

              {/* Generation Settings */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Quality</label>
                <Select value={mode} onValueChange={(value: 'performance' | 'balanced' | 'quality') => setMode(value)}>
                  <SelectTrigger className="w-full transition-all duration-300 data-[state=open]:bg-yellow-400 data-[state=open]:text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance" className="hover:bg-yellow-400 hover:text-black">Fast</SelectItem>
                    <SelectItem value="balanced" className="hover:bg-yellow-400 hover:text-black">Balanced</SelectItem>
                    <SelectItem value="quality" className="hover:bg-yellow-400 hover:text-black">Quality</SelectItem>
                  </SelectContent>
                </Select>
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
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ImageIcon className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Your result will appear here</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Estimated time: {QUALITY_TIMES[mode]}
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
      <Footer />
    </div>
  );
}