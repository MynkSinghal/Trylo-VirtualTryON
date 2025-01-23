import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = 'https://api.fashn.ai/v1';
const API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY;

export type Category = 'tops' | 'bottoms' | 'one-pieces';

interface FashnAIResponse {
  id: string;
  status?: string;
  output?: string[];
  error: string | null;
}

interface TryOnOptions {
  modelImage: string | File;
  garmentImage: string | File;
  category: Category;
  mode?: 'performance' | 'balanced' | 'quality';
  numSamples?: number;
}

async function uploadToCloudinary(file: File): Promise<string> {
  // In a real implementation, you would upload to your server or cloud storage
  // For now, we'll simulate it by returning a data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateTryOn({
  modelImage,
  garmentImage,
  category,
  mode = 'balanced',
  numSamples = 1,
  onStatusUpdate,
}: TryOnOptions & { onStatusUpdate: (status: string) => void }): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    // Convert File objects to URLs if needed
    const modelUrl = modelImage instanceof File ? await uploadToCloudinary(modelImage) : modelImage;
    const garmentUrl = garmentImage instanceof File ? await uploadToCloudinary(garmentImage) : garmentImage;

    // Initial API call to start the generation
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: modelUrl,
        garment_image: garmentUrl,
        category: category === 'full-body' ? 'one-pieces' : category,
        mode,
        num_samples: numSamples,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start generation');
    }

    const { id } = await response.json() as FashnAIResponse;

    // Poll for results
    const result = await pollForResult(id, onStatusUpdate);
    return result.output || [];
  } catch (error) {
    console.error('Try-on generation failed:', error);
    throw error;
  }
}

async function pollForResult(id: string, updateStatus: (status: string) => void): Promise<FashnAIResponse> {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${API_BASE_URL}/status/${id}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    const result = await response.json() as FashnAIResponse;
    
    switch (result.status) {
      case 'completed':
        updateStatus('Generation completed!');
        return result;
      case 'failed':
        throw new Error(result.error || 'Generation failed');
      case 'processing':
        updateStatus('Processing your image... This may take a few minutes.');
        break;
      case 'queued':
        updateStatus('Waiting in queue... We\'ll start processing soon.');
        break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  
  throw new Error('Timeout waiting for result');
}