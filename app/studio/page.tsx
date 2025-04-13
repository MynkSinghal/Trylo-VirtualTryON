'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, Upload,
  Image as ImageIcon, 
  Loader2,
  Download,
  Zap,
  Scale,
  Diamond,
  Play,
  Store,
  User,
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
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ModelLibraryDialog } from '../components/ModelLibraryDialog';
import { Model } from '../../src/lib/modelLibrary';

const QUALITY_TIMES = {
  performance: '9sec',
  balanced: '15sec',
  quality: '20sec'
} as const;

// Helper function to convert base64 to File
const base64ToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export default function StudioPage() {
  const { toast } = useToast();
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentName, setGarmentName] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [modelLibraryOpen, setModelLibraryOpen] = useState(false);
  const [category, setCategory] = useState<Category>('tops');
  const [mode, setMode] = useState<'performance' | 'balanced' | 'quality'>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Handle selected garment from library
  useEffect(() => {
    const checkForSelectedGarment = async () => {
      const selectedGarmentPath = localStorage.getItem('selectedGarmentPath');
      const selectedGarmentName = localStorage.getItem('selectedGarmentName');
      
      if (selectedGarmentPath) {
        try {
          // Fetch the selected garment image from the public folder
          const response = await fetch(selectedGarmentPath);
          if (!response.ok) throw new Error('Failed to fetch garment image');
          
          const blob = await response.blob();
          
          // Create a File object from the blob
          const filename = selectedGarmentPath.split('/').pop() || 'garment.jpg';
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
          
          // Set garment image and preview
          setGarmentImage(file);
          setGarmentPreview(URL.createObjectURL(blob));
          
          // Set the garment name if available
          if (selectedGarmentName) {
            setGarmentName(selectedGarmentName);
          }
          
          // Clear the localStorage entries
          localStorage.removeItem('selectedGarmentPath');
          localStorage.removeItem('selectedGarmentName');
          
          // Show success toast
          toast({
            title: "Garment Selected",
            description: `${selectedGarmentName || 'Garment'} from library has been loaded`,
            variant: "default"
          });
        } catch (error) {
          console.error("Error loading garment from library:", error);
          toast({
            title: "Error",
            description: "Failed to load garment from library",
            variant: "destructive"
          });
          
          // Clear the localStorage entries
          localStorage.removeItem('selectedGarmentPath');
          localStorage.removeItem('selectedGarmentName');
        }
      }
    };
    
    checkForSelectedGarment();
  }, [toast]);

  // Handle selection of a model from the library
  const handleModelSelect = async (model: Model) => {
    try {
      // Fetch the selected model image
      const response = await fetch(model.imageUrl);
      if (!response.ok) throw new Error('Failed to fetch model image');
      
      const blob = await response.blob();
      
      // Create a File object from the blob
      const filename = model.imageUrl.split('/').pop() || 'model.png';
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      
      // Set model image and preview
      setModelImage(file);
      setModelPreview(URL.createObjectURL(blob));
      setModelName(model.name);
      
      // Show success toast
      toast({
        title: "Model Selected",
        description: `${model.name} has been loaded`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error loading model from library:", error);
      toast({
        title: "Error",
        description: "Failed to load model from library",
        variant: "destructive"
      });
    }
  };

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
        setGarmentName(null); // Reset garment name when uploading a new image
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
    if (!modelImage || !garmentImage || !user) {
      toast({
        title: "Error",
        description: !user 
          ? "Please log in to generate images" 
          : "Please upload both a model and garment image.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    
    try {
      const results = await generateTryOn({
        modelImage,
        garmentImage,
        category,
        mode,
        numSamples: 1,
        onStatusUpdate: (status) => {
          console.log('Status update:', status);
          setProcessingStatus(status);
        },
        userId: user.id,
      });
      
      console.log('Received results:', results);
      if (results.length > 0) {
        console.log('Setting result to:', results[0]);
        setResult(results[0]);
      } else {
        throw new Error('No results received from the API');
      }
    } catch (error) {
      console.error('Generation error:', error);
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
    <div className="min-h-screen bg-black text-white">
      <nav className="container flex justify-between items-center h-16 px-6">
        <Logo />
        <Link href="/my-generations">
          <InteractiveHoverButton className="px-8 py-2 text-sm flex items-center gap-2 min-w-[160px] whitespace-nowrap">
            
            My Generations
          </InteractiveHoverButton>
        </Link>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="min-h-screen bg-black text-white flex flex-col">
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Model Upload Box */}
              <Card className="p-6 bg-gray-900/50 border-gray-800">
                <h2 className="text-2xl font-semibold mb-4">Upload Model Photo</h2>
                <div
                  id="model-box"
                  className="border-2 border-dashed border-gray-500 rounded-lg p-6 h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-yellow-400 hover:bg-gray-700/30 relative group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, 'model')}
                  tabIndex={0}
                >
                  {modelPreview ? (
                    <div className="relative h-full w-full group flex items-center justify-center">
                      <Image
                        src={modelPreview}
                        alt="Model preview"
                        fill
                        className="object-contain rounded-lg transition-all duration-300 group-hover:opacity-50"
                        unoptimized
                      />
                      {modelName && (
                        <div className="absolute top-0 left-0 right-0 bg-black/70 text-center py-2 px-4">
                          <p className="text-sm font-medium">{modelName}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/80 p-4 rounded-lg flex flex-col items-center gap-2">
                          <p className="text-sm text-gray-300">Click or drag to replace</p>
                          <div className="flex gap-2 mt-2">
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
                              size="sm"
                              className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                            >
                              <label htmlFor="model-upload">Replace Image</label>
                            </Button>
                            
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                              onClick={() => setModelLibraryOpen(true)}
                            >
                              <User className="w-4 h-4" />
                              Model Library
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gray-900/50 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <Upload className="w-10 h-10 text-gray-500 transition-colors group-hover:text-yellow-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-lg font-medium">Drop your image here</p>
                        <p className="text-gray-500 text-sm">or paste from clipboard</p>
                      </div>
                      <div className="flex gap-2">
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
                        
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                          onClick={() => setModelLibraryOpen(true)}
                        >
                          <User className="w-4 h-4" />
                          Model Library
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Garment Upload Box */}
              <Card className="p-6 bg-gray-900/50 border-gray-800">
                <h2 className="text-2xl font-semibold mb-4">Upload Garment</h2>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    id="garment-box"
                    className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:border-yellow-400 relative group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'garment')}
                    tabIndex={0}
                  >
                    {garmentPreview ? (
                      <div className="relative h-[400px] w-full group">
                        <Image
                          src={garmentPreview}
                          alt="Garment preview"
                          fill
                          className="object-contain rounded-lg transition-all duration-300 group-hover:opacity-50"
                          unoptimized
                        />
                        {garmentName && (
                          <div className="absolute top-0 left-0 right-0 bg-black/70 text-center py-2 px-4">
                            <p className="text-sm font-medium">{garmentName}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-black/80 p-4 rounded-lg flex flex-col items-center gap-2">
                            <p className="text-sm text-gray-300">Click or drag to replace</p>
                            <div className="flex gap-2 mt-2">
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
                                size="sm"
                                className="transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                              >
                                <label htmlFor="garment-upload">Replace Image</label>
                              </Button>
                              
                              <Link href="/garment-library">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                                >
                                  <Store className="w-4 h-4" />
                                  Browse Library
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                          <ImageIcon className="w-8 h-8 text-gray-600 transition-colors group-hover:text-yellow-400" />
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-400 text-lg font-medium">Drop your garment here</p>
                          <p className="text-gray-500 text-sm">or paste from clipboard</p>
                        </div>
                        <div className="flex gap-2 mt-4">
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
                          
                          <Link href="/garment-library">
                            <Button 
                              variant="outline"
                              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                            >
                              <Store className="w-4 h-4" />
                              Browse Library
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Garment Type Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 py-3 ${category === 'tops' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                      onClick={() => setCategory('tops')}
                    >
                      <TopSvg className={`w-4 h-4 mr-2 ${category === 'tops' ? 'text-black' : 'text-white'}`} />
                      Top
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 py-3 ${category === 'bottoms' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                      onClick={() => setCategory('bottoms')}
                    >
                      <BottomSvg className={`w-4 h-4 mr-2 ${category === 'bottoms' ? 'text-black' : 'text-white'}`} />
                      Bottom
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 py-3 ${category === 'one-pieces' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                      onClick={() => setCategory('one-pieces')}
                    >
                      <FullbodySvg className={`w-4 h-4 mr-2 ${category === 'one-pieces' ? 'text-black' : 'text-white'}`} />
                      Full Body
                    </Button>
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
                <div className="border-2 border-gray-700 rounded-lg p-6 h-[500px]">
                  {isProcessing ? (
                    <ProcessingStatus status={processingStatus} />
                  ) : result ? (
                    <div className="relative h-full w-full flex items-center justify-center">
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
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 py-3 ${mode === 'performance' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                    onClick={() => setMode('performance')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Performance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 py-3 ${mode === 'balanced' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                    onClick={() => setMode('balanced')}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Balanced
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 py-3 ${mode === 'quality' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'hover:bg-gray-800'}`}
                    onClick={() => setMode('quality')}
                  >
                    <Diamond className="w-4 h-4 mr-2" />
                    Quality
                  </Button>
                </div>
                <div className="mt-4">
                  {result && !isProcessing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setModelImage(null);
                          setGarmentImage(null);
                          setModelPreview(null);
                          setGarmentPreview(null);
                          setGarmentName(null);
                          setResult(null);
                          setProcessingStatus('');
                        }}
                        variant="outline"
                        className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-6"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate New
                      </Button>
                      <Button
                        onClick={processImages}
                        disabled={!modelImage || !garmentImage || isProcessing}
                        className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 py-6"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run (~{QUALITY_TIMES[mode]})
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={processImages}
                      disabled={!modelImage || !garmentImage || isProcessing}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 py-6"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run (~{QUALITY_TIMES[mode]})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
          <Footer />
        </div>
      </main>
      
      {/* Model Library Dialog */}
      <ModelLibraryDialog 
        open={modelLibraryOpen} 
        onOpenChange={setModelLibraryOpen} 
        onSelectModel={handleModelSelect} 
      />
    </div>
  );
}