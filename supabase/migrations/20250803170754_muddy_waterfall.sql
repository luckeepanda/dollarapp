/*
  # Fix Game Images Storage Bucket MIME Types

  1. Storage Bucket Fix
    - Update the 'game-images' bucket to properly support image MIME types
    - Fix the allowed_mime_types array format
    - Ensure bucket is properly configured for image uploads

  2. Bucket Configuration
    - Public bucket for easy image serving
    - 5MB file size limit
    - Support for JPEG, JPG, PNG, WebP formats
    - Proper MIME type validation

  3. Security Policies
    - Maintain existing security policies
    - Ensure restaurants can upload to their folders
    - Public read access for image display
*/

-- First, delete the existing bucket if it exists (to recreate with correct settings)
DELETE FROM storage.buckets WHERE id = 'game-images';

-- Create the game-images storage bucket with correct MIME type configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images',
  'game-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- Recreate storage policies (they get deleted when bucket is deleted)

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload game images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'game-images' AND
  -- Allow restaurants to upload to their own folder
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow authenticated users to update their own images
CREATE POLICY "Users can update their own game images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'game-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own game images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'game-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to all game images
CREATE POLICY "Public can view game images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'game-images');