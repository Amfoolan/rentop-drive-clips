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
      if (!video.video_file_path) {
        // Pour l'instant, on crée un fichier de démonstration
        const demoContent = `Vidéo générée: ${video.title}\nURL: ${video.url}\nDate: ${new Date(video.created_at).toLocaleDateString()}\nTexte overlay: ${video.overlay_text}\nTexte voix-off: ${video.voiceover_text}`;
        
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Téléchargement",
          description: "Fichier de démonstration téléchargé"
        });
      } else {
        // Code pour télécharger le vrai fichier vidéo depuis Supabase Storage
        const { data, error } = await supabase.storage
          .from('videos')
          .download(video.video_file_path);

        if (error) throw error;

        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${video.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Téléchargement",
          description: "Vidéo téléchargée avec succès"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger la vidéo"
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