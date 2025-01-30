import { supabase } from './client';
import type { Generation } from './types';
import { deleteImage } from './storage';

export async function createGeneration({
  userId,
  modelImagePath,
  garmentImagePath,
  resultImagePath,
  category,
  mode,
  processingTime,
}: {
  userId: string;
  modelImagePath: string;
  garmentImagePath: string;
  resultImagePath: string;
  category: Generation['category'];
  mode: Generation['mode'];
  processingTime?: string;
}) {
  // Verify the userId matches the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized access');
  }

  const { data, error } = await supabase
    .from('generations')
    .insert({
      user_id: userId,
      model_image_path: modelImagePath,
      garment_image_path: garmentImagePath,
      result_image_path: resultImagePath,
      category,
      mode,
      processing_time: processingTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserGenerations(userId: string) {
  // Verify the userId matches the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized access');
  }

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)  // This combined with RLS ensures double protection
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generations:', error);
    throw error;
  }

  return data || [];
}

export async function deleteGeneration(id: string, userId: string) {
  const { data: generation, error: fetchError } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Delete images from storage
  await Promise.all([
    deleteImage('generations-model-images', generation.model_image_path),
    deleteImage('generations-garment-images', generation.garment_image_path),
    deleteImage('generations-result-images', generation.result_image_path),
  ]);

  // Delete database record
  const { error: deleteError } = await supabase
    .from('generations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;
} 