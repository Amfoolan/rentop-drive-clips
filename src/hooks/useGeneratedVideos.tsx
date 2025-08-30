import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedVideo {
  id: string;
  title: string;
  url: string;
  car_data: any;
  overlay_text?: string | null;
  voiceover_text?: string | null;
  thumbnail_url?: string | null;
  video_file_path?: string | null;
  status: string;
  platforms: any;
  stats: any;
  created_at: string;
  updated_at: string;
}

export const useGeneratedVideos = () => {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les vidéos"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVideo = async (videoData: Omit<GeneratedVideo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('generated_videos')
        .insert([videoData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchVideos(); // Refresh the list
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la vidéo"
      });
      throw error;
    }
  };

  const downloadVideo = async (video: GeneratedVideo) => {
    try {
      // Import VideoDownloader dynamically to avoid circular deps
      const { VideoDownloader } = await import('@/components/VideoGenerator/VideoDownloader');
      await VideoDownloader.downloadVideo(video);
      
      toast({
        title: "Téléchargement réussi",
        description: "Votre vidéo a été téléchargée"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: error.message || "Impossible de télécharger la vidéo"
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    saveVideo,
    downloadVideo,
    refreshVideos: fetchVideos
  };
};