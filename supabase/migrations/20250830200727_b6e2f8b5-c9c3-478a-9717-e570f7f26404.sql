-- Add user_id column to track video ownership
ALTER TABLE public.generated_videos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing videos to have a default user (if any exist)
-- This is a one-time migration - in production you'd need to handle this differently
UPDATE public.generated_videos 
SET user_id = auth.uid() 
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE public.generated_videos 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the existing overly permissive RLS policies
DROP POLICY IF EXISTS "Anyone can create videos" ON public.generated_videos;
DROP POLICY IF EXISTS "Anyone can update videos" ON public.generated_videos;
DROP POLICY IF EXISTS "Anyone can view videos" ON public.generated_videos;

-- Create secure RLS policies that restrict access to video owners only
CREATE POLICY "Users can create their own videos" 
ON public.generated_videos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own videos" 
ON public.generated_videos 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
ON public.generated_videos 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
ON public.generated_videos 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON public.generated_videos(user_id);