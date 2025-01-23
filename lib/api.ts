import { toast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_FASHN_API_URL || 'https://api.fashn.ai/v1';
const API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY;

export type Category = 'tops' | 'bottoms' | 'one-pieces';

interface TryOnParams {
  modelImage: File;
  garmentImage: File;
  category: Category;
  mode: 'performance' | 'balanced' | 'quality';
  numSamples?: number;
  onStatusUpdate?: (status: string) => void;
  // Additional FASHN API parameters
  nsfwFilter?: boolean;
  coverFeet?: boolean;
  adjustHands?: boolean;
  restoreBackground?: boolean;
  restoreClothes?: boolean;
  garmentPhotoType?: 'auto' | 'flat-lay' | 'model';
  longTop?: boolean;
  seed?: number;
}

// Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
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
  nsfwFilter = true,
  coverFeet = false,
  adjustHands = false,
  restoreBackground = false,
  restoreClothes = false,
  garmentPhotoType = 'auto',
  longTop = false,
  seed = 42,
}: TryOnParams): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('API key not configured. Please check your environment variables.');
  }

  try {
    onStatusUpdate?.('Converting images...');
    const [modelBase64, garmentBase64] = await Promise.all([
      fileToBase64(modelImage),
      fileToBase64(garmentImage)
    ]);

    onStatusUpdate?.('Sending request...');
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: modelBase64,
        garment_image: garmentBase64,
        category,
        mode,
        num_samples: numSamples,
        nsfw_filter: nsfwFilter,
        cover_feet: coverFeet,
        adjust_hands: adjustHands,
        restore_background: restoreBackground,
        restore_clothes: restoreClothes,
        garment_photo_type: garmentPhotoType,
        long_top: longTop,
        seed,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate try-on';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('API Error Response:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error('No task ID received from the API');
    }
    
    // Poll for results
    const results = await pollForResults(data.id, onStatusUpdate);
    return results;
  } catch (error) {
    console.error('Try-on generation error:', error);
    if (error instanceof Error) {
      throw new Error(`Generation failed: ${error.message}`);
    }
    throw error;
  }
}

async function pollForResults(taskId: string, onStatusUpdate?: (status: string) => void): Promise<string[]> {
  const maxAttempts = 48; // 4 minutes with 5-second intervals (respecting rate limits)
  let attempts = 0;

  // Status types from API: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed'
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to check try-on status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Status Check Error:', errorData);
        } catch (e) {
          console.error('Failed to parse status error response:', e);
        }
        throw new Error(`Status Check Error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Poll response:', data);
      
      if (data.status === 'completed') {
        onStatusUpdate?.('Generation complete!');
        if (!data.output || !data.output.length) {
          throw new Error('No results received from the API');
        }
        return data.output;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Generation failed without specific error message');
      } else {
        // Map API status to user-friendly messages
        const statusMessages = {
          'starting': 'Initializing...',
          'in_queue': 'Waiting in queue...',
          'processing': 'Processing your image...'
        };
        const message = statusMessages[data.status as keyof typeof statusMessages] || 'Processing...';
        onStatusUpdate?.(message);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
      }
    } catch (error) {
      console.error('Error polling for results:', error);
      throw error;
    }
  }

  throw new Error('Timed out waiting for results. Please try again.');
}