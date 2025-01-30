-- Update storage bucket policies
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('generations-model-images', 'generations-garment-images', 'generations-result-images')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('generations-model-images', 'generations-garment-images', 'generations-result-images')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('generations-model-images', 'generations-garment-images', 'generations-result-images')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add policy for public read access to authenticated users' own images
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('generations-model-images', 'generations-garment-images', 'generations-result-images')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable public access to the buckets (if not already enabled)
UPDATE storage.buckets
SET public = true
WHERE name IN ('generations-model-images', 'generations-garment-images', 'generations-result-images'); 