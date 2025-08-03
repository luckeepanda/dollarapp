/*
  # Create Storage Bucket for Game Images

  1. Storage Setup
    - Create 'game-images' bucket in Supabase storage
    - Set up proper access policies for authenticated users
    - Allow restaurants to upload images for their games
    - Allow public read access for displaying images

  2. Security Policies
    - Restaurants can upload images to their own folder
    - Public can view all images (for game display)
    - File size and type restrictions handled in application layer

  3. Bucket Configuration
    - Public bucket for easy image serving
    - Organized by restaurant ID folders
    - Supports common image formats (PNG, JPG, JPEG, WebP)
*/

-- Create the game-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images',
  'game-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

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