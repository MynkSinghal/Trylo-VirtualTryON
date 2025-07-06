import { createGeneration } from './supabase/database';
import { uploadImage } from './supabase/storage';

interface GenerateTryOnParams {
  modelImage: File;
  garmentImage: File;
  numSamples?: number;
  onStatusUpdate?: (status: string) => void;
  userId: string;
}

// Convert File to base64 data URI (full format including data: prefix)
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Return the full data URI format (e.g., "data:image/jpeg;base64,abc123...")
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
}

// Sleep utility for polling
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateTryOn({
  modelImage,
  garmentImage,
  numSamples = 1,
  onStatusUpdate,
  userId
}: GenerateTryOnParams): Promise<{ outputImages: string[] }> {
  const startTime = Date.now();
  
  try {
    // Prepare images
    onStatusUpdate?.('Preparing images...');
    
    // Convert images to base64
    const modelBase64 = await fileToBase64(modelImage);
    const garmentBase64 = await fileToBase64(garmentImage);

    // Debug: Check if data URIs are valid
    console.log('Model data URI length:', modelBase64?.length || 0);
    console.log('Garment data URI length:', garmentBase64?.length || 0);

    if (!modelBase64 || !garmentBase64) {
      throw new Error('Failed to convert images to base64');
    }

    // Prepare request body according to FASHN API documentation
    const requestBody = {
      model_name: "tryon-v1.6",
      inputs: {
        model_image: modelBase64,
        garment_image: garmentBase64
      }
    };

    console.log('Request body structure:', {
      model_name: requestBody.model_name,
      inputs: {
        model_image: `[data URI ${requestBody.inputs.model_image.length} chars]`,
        garment_image: `[data URI ${requestBody.inputs.garment_image.length} chars]`
      }
    });

    // Step 1: Start the prediction
    onStatusUpdate?.('Starting generation...');
    const initResponse = await fetch(`/api/fashn?endpoint=run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!initResponse.ok) {
      const error = await initResponse.json();
      console.error('FASHN API Error:', error);
      throw new Error(error.error || 'Failed to start prediction');
    }

    const initData = await initResponse.json();
    console.log('Prediction started:', initData);

    if (!initData.id) {
      throw new Error('No prediction ID returned from FASHN API');
    }

    const predictionId = initData.id;

    // Step 2: Poll for completion
    onStatusUpdate?.('Processing try-on...');
    
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max (120 * 1 second)
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Wait before checking status
      await sleep(1000); // Check every 1 second
      
      // Check prediction status
      const statusResponse = await fetch(`/api/fashn?endpoint=status&id=${predictionId}`, {
        method: 'GET'
      });

      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        console.error('Status check error:', error);
        throw new Error(error.error || 'Failed to check prediction status');
      }

      const statusData = await statusResponse.json();
      console.log('Status check result:', statusData);

      switch (statusData.status) {
        case 'starting':
        case 'in_queue':
          onStatusUpdate?.('Waiting in queue...');
          break;
          
        case 'processing':
          onStatusUpdate?.('Generating try-on...');
          break;
          
        case 'completed':
          onStatusUpdate?.('Finalizing results...');
          
          if (!statusData.output || !Array.isArray(statusData.output)) {
            throw new Error('No output images received from FASHN API');
          }

          // Save to existing Supabase storage and database
          try {
            const timestamp = Date.now();
            const modelImagePath = `${userId}/${timestamp}_model.${modelImage.name.split('.').pop()}`;
            const garmentImagePath = `${userId}/${timestamp}_garment.${garmentImage.name.split('.').pop()}`;
            const resultImagePath = `${userId}/${timestamp}_result.jpg`;

            onStatusUpdate?.('Saving images...');

            // Upload images to storage
            await Promise.all([
              uploadImage('generations-model-images', modelImagePath, modelImage),
              uploadImage('generations-garment-images', garmentImagePath, garmentImage),
              // Download and upload result image
              fetch(statusData.output[0])
                .then(res => res.blob())
                .then(blob => uploadImage('generations-result-images', resultImagePath, blob))
            ]);

                         // Save generation record to database
             await createGeneration({
               userId,
               modelImagePath,
               garmentImagePath,
               resultImagePath,
               category: 'tops', // Default since FASHN doesn't use categories
               mode: 'balanced', // Default since FASHN doesn't use modes
               processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
             });

            console.log('Generation saved successfully');

          } catch (saveError) {
            console.error('Error saving to storage/database:', saveError);
            // Don't throw here, just log - the generation was successful
          }

          return {
            outputImages: statusData.output
          };
          
        case 'failed':
          const errorMessage = statusData.error?.message || statusData.error || 'Generation failed';
          console.error('FASHN generation failed:', statusData.error);
          throw new Error(errorMessage);
          
        default:
          console.log('Unknown status:', statusData.status);
          onStatusUpdate?.('Processing...');
      }
    }

    // Timeout
    throw new Error('Generation timed out. Please try again.');

  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}
