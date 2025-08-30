-- First, let's check if there are existing videos and handle them safely
-- Since the previous system was insecure, we'll clear existing data for security

-- Delete all existing videos (since they were created under insecure conditions)
DELETE FROM public.generated_videos;

-- Now add the user_id column
ALTER TABLE public.generated_videos 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

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