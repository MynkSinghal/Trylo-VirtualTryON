import { supabase } from './client';

export async function uploadImage(
  bucket: 'generations-model-images' | 'generations-garment-images' | 'generations-result-images',
  path: string,
  file: File | Blob
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data.path;
}

export async function getImageUrl(
  bucket: 'generations-model-images' | 'generations-garment-images' | 'generations-result-images',
  path: string
): Promise<string> {
  const { data } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteImage(
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
} 