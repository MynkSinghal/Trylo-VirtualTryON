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
        restore_background: true,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate try-on';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
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
  // Remove maxAttempts as we'll wait indefinitely
  const POLL_INTERVAL = 5000; // 5 seconds between polls

  while (true) { // Keep polling until we get a definitive response
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
        // Only throw if it's a fatal error (not a temporary one)
        if (response.status !== 429 && response.status !== 503) {
          throw new Error(`Status Check Error (${response.status}): ${errorMessage}`);
        }
        // For rate limits (429) or service unavailable (503), we'll retry
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * 2)); // Wait longer for rate limits
        continue;
      }

      const data = await response.json();
      console.log('Poll response:', data);
      
      // Map API status to user-friendly messages
      const statusMessages = {
        'starting': 'Initializing generation...',
        'in_queue': 'Waiting in queue...',
        'processing': 'Processing your image...',
        'completed': 'Generation complete!',
        'failed': 'Generation failed',
        'cancelled': 'Generation was cancelled'
      };

      // Update status message
      const message = statusMessages[data.status as keyof typeof statusMessages] || 'Processing...';
      onStatusUpdate?.(message);
      
      // Handle definitive statuses
      switch (data.status) {
        case 'completed':
          if (!data.output || !data.output.length) {
            throw new Error('No results received from the API');
          }
          return data.output;
        case 'failed':
          throw new Error(data.error || 'Generation failed without specific error message');
        case 'cancelled':
          throw new Error('Generation was cancelled');
        default:
          // For all other statuses (starting, in_queue, processing), keep polling
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
          continue;
      }
    } catch (error) {
      // If it's a known fatal error, throw it
      if (error instanceof Error && 
          (error.message.includes('cancelled') || 
           error.message.includes('failed') || 
           error.message.includes('No results'))) {
        throw error;
      }
      
      // For other errors (network issues, etc.), log and retry
      console.error('Error polling for results (retrying):', error);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
}
