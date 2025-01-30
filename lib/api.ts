import { toast } from '@/hooks/use-toast';
import { createGeneration } from '@/lib/supabase/database';
import { uploadImage } from '@/lib/supabase/storage';
import type { Generation } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

const API_BASE_URL = 'https://api.fashn.ai/v1';
const API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY;
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_TIME = 60000; // 60 seconds

export type Category = 'tops' | 'bottoms' | 'one-pieces';
export type QualityMode = 'performance' | 'balanced' | 'quality';

interface GenerateTryOnParams {
  modelImage: File;
  garmentImage: File;
  category: Category;
  mode: QualityMode;
  numSamples?: number;
  onStatusUpdate?: (status: string) => void;
  userId: string;
}

// Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
}

export async function generateTryOn({
  modelImage,
  garmentImage,
  category,
  mode,
  numSamples = 1,
  onStatusUpdate,
  userId,
}: GenerateTryOnParams): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('FASHN API key not configured');
  }

  try {
    onStatusUpdate?.('Preparing images...');

    // Convert images to base64
    const modelBase64 = await fileToBase64(modelImage);
    const garmentBase64 = await fileToBase64(garmentImage);

    // Initiate the generation
    onStatusUpdate?.('Starting generation...');
    const initResponse = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: modelBase64,
        garment_image: garmentBase64,
        category: category.toLowerCase(),
        mode: mode.toLowerCase(),
        restore_background: true,
        num_samples: numSamples
      })
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to initiate generation (${initResponse.status})`);
    }

    const { id } = await initResponse.json();
    if (!id) throw new Error('No generation ID received');

    // Poll for results
    onStatusUpdate?.('Processing...');
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME) {
      const statusResponse = await fetch(`${API_BASE_URL}/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status (${statusResponse.status})`);
      }

      const data = await statusResponse.json();
      console.log('Status response:', data);

      switch (data.status) {
        case 'completed':
          if (!data.output?.length) {
            throw new Error('No output received');
          }

          // Generate unique timestamps for each file
          const timestamp = Date.now();
          const modelImagePath = `${userId}/${timestamp}_model.${modelImage.name.split('.').pop()}`;
          const garmentImagePath = `${userId}/${timestamp}_garment.${garmentImage.name.split('.').pop()}`;
          const resultImagePath = `${userId}/${timestamp}_result.jpg`;

          // Store the successful generation in Supabase
          await createGeneration({
            userId,
            modelImagePath,
            garmentImagePath,
            resultImagePath,
            category,
            mode,
            processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
          });

          // Upload images to Supabase storage
          await Promise.all([
            uploadImage('generations-model-images', modelImagePath, modelImage),
            uploadImage('generations-garment-images', garmentImagePath, garmentImage),
            // Download and upload the result image
            fetch(data.output[0])
              .then(res => res.blob())
              .then(blob => uploadImage('generations-result-images', resultImagePath, blob))
          ]);

          return data.output;

        case 'failed':
          throw new Error(data.error?.message || 'Generation failed');

        case 'starting':
        case 'in_queue':
        case 'processing':
          onStatusUpdate?.(data.status);
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
          continue;

        default:
          throw new Error(`Unknown status: ${data.status}`);
      }
    }

    throw new Error('Generation timed out');

  } catch (error) {
    console.error('FASHN API Error:', error);
    throw error;
  }
}

async function storeGeneration({
  userId,
  modelImage,
  garmentImage,
  resultUrls,
  category,
  mode,
}: {
  userId: string;
  modelImage: File;
  garmentImage: File;
  resultUrls: string[];
  category: Category;
  mode: QualityMode;
}) {
  // Use the imported functions instead of direct supabase calls
  const timestamp = Date.now();
  const modelImagePath = `${userId}/${timestamp}_model.${modelImage.name.split('.').pop()}`;
  const garmentImagePath = `${userId}/${timestamp}_garment.${garmentImage.name.split('.').pop()}`;
  const resultImagePath = `${userId}/${timestamp}_result.jpg`;

  // Upload files using the imported uploadImage function
  await Promise.all([
    uploadImage('generations-model-images', modelImagePath, modelImage),
    uploadImage('generations-garment-images', garmentImagePath, garmentImage),
    // Download and upload result image
    fetch(resultUrls[0])
      .then(res => res.blob())
      .then(blob => uploadImage('generations-result-images', resultImagePath, blob))
  ]);

  // Store generation record using the imported createGeneration function
  await createGeneration({
    userId,
    modelImagePath,
    garmentImagePath,
    resultImagePath,
    category,
    mode
  });

  return { modelImagePath, garmentImagePath, resultImagePath };
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

// Helper function to convert base64 to File
async function base64ToFile(base64String: string, filename: string): Promise<File> {
  const res = await fetch(base64String);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

// Helper function to validate image
async function validateImage(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Invalid image file'));
    img.src = URL.createObjectURL(file);
  });
}
