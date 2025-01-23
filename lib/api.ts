import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://api.fashn.ai/v1';
const API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY;

export type Category = 'tops' | 'bottoms' | 'one-pieces';

interface TryOnParams {
  modelImage: File;
  garmentImage: File;
  category: Category;
  mode: 'performance' | 'balanced' | 'quality';
  numSamples?: number;
  onStatusUpdate?: (status: string) => void;
}

export async function generateTryOn({
  modelImage,
  garmentImage,
  category,
  mode = 'balanced',
  numSamples = 1,
  onStatusUpdate,
}: TryOnParams): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('API key not found');
  }

  const formData = new FormData();
  formData.append('model_image', modelImage);
  formData.append('garment_image', garmentImage);
  formData.append('category', category);
  formData.append('mode', mode);
  formData.append('num_samples', numSamples.toString());

  try {
    onStatusUpdate?.('Uploading images...');
    const response = await fetch(`${API_BASE_URL}/try-on`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to generate try-on');
    }

    const { task_id } = await response.json();
    
    // Poll for results
    const results = await pollForResults(task_id, onStatusUpdate);
    return results;
  } catch (error) {
    console.error('Try-on generation error:', error);
    throw error;
  }
}

async function pollForResults(taskId: string, onStatusUpdate?: (status: string) => void): Promise<string[]> {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE_URL}/try-on/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check try-on status');
      }

      const data = await response.json();
      
      if (data.status === 'completed') {
        onStatusUpdate?.('Generation complete!');
        return data.results;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Generation failed');
      } else {
        onStatusUpdate?.(data.status_message || 'Processing...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
      }
    } catch (error) {
      console.error('Error polling for results:', error);
      throw error;
    }
  }

  throw new Error('Timed out waiting for results');
}