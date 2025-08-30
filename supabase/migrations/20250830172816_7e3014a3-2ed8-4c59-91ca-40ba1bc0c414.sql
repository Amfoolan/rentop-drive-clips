-- Créer la table pour stocker les informations des vidéos générées
CREATE TABLE public.generated_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  car_data JSONB NOT NULL,
  overlay_text TEXT,
  voiceover_text TEXT,
  thumbnail_url TEXT,
  video_file_path TEXT,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'processing', 'published', 'failed')),
  platforms JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS (pour l'instant ouvertes, à sécuriser plus tard avec l'auth)
CREATE POLICY "Anyone can view videos" 
ON public.generated_videos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update videos" 
ON public.generated_videos 
FOR UPDATE 
USING (true);

-- Créer un bucket de stockage pour les vidéos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Créer les politiques pour le stockage des vidéos
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Anyone can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos');

-- Créer fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer trigger pour automatic timestamp updates
CREATE TRIGGER update_generated_videos_updated_at
    BEFORE UPDATE ON public.generated_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();