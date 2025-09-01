import { CarData, VideoConfig } from './StepByStepGenerator';
import { supabase } from '@/integrations/supabase/client';

export interface FFmpegGenerationOptions {
  onProgress?: (progress: number) => void;
  onStatus?: (status: string) => void;
  onToast?: (title: string, description: string, variant?: 'default' | 'destructive') => void;
}

export class FFmpegVideoGenerator {
  static async generateMP4Video(
    carData: CarData,
    config: VideoConfig,
    audioUrl?: string,
    options: FFmpegGenerationOptions = {}
  ): Promise<Blob> {
    const { onProgress, onStatus, onToast } = options;

    try {
      onStatus?.('Initialisation de la génération vidéo côté serveur...');
      onProgress?.(0);

      // Use server-side encoding via Supabase Edge Function
      const videoBlob = await this.generateWithServerEncoding(
        carData,
        config,
        audioUrl,
        options
      );

      return videoBlob;

    } catch (error) {
      console.error('Server video generation failed:', error);
      onToast?.('Erreur de génération', `Impossible de générer la vidéo: ${error.message}`, 'destructive');
      throw error;
    }
  }

  private static async generateWithServerEncoding(
    carData: CarData,
    config: VideoConfig,
    audioUrl?: string,
    options: FFmpegGenerationOptions = {}
  ): Promise<Blob> {
    const { onProgress, onStatus, onToast } = options;
    
    try {
      onStatus?.('Envoi des données au serveur...');
      onProgress?.(10);

      // Call the new server-side encoding Edge Function
      const { data, error } = await supabase.functions.invoke('video-encoder-v2', {
        body: {
          carData: carData,
          config: config,
          audioUrl: audioUrl
        }
      });

      if (error) {
        throw new Error(`Server encoding failed: ${error.message}`);
      }

      if (!data?.success || !data?.url) {
        throw new Error(data?.error || 'Server returned invalid response');
      }

      onStatus?.('Téléchargement de la vidéo...');
      onProgress?.(80);

      // Download the generated video
      const videoResponse = await fetch(data.url);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`);
      }

      const videoBlob = await videoResponse.blob();
      
      onStatus?.('Vidéo générée avec succès !');
      onProgress?.(100);
      
      onToast?.('Succès !', `Vidéo MP4 générée côté serveur (${Math.round(videoBlob.size / 1024 / 1024 * 100) / 100} MB)`, 'default');

      return videoBlob;

    } catch (error) {
      console.error('Server encoding error:', error);
      onToast?.('Erreur serveur', `Échec encodage: ${error.message}`, 'destructive');
      throw error;
    }
  }

  private static addTextOverlay(
    ctx: CanvasRenderingContext2D,
    carData: CarData,
    config: VideoConfig
  ) {
    // Add gradient background for text
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, 200);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(carData.title, ctx.canvas.width / 2, 80);

    // Price
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`${carData.price}€`, ctx.canvas.width / 2, 130);

    // Location
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(carData.location, ctx.canvas.width / 2, 170);
  }

  static async downloadVideo(
    carData: CarData,
    config: VideoConfig,
    audioUrl?: string,
    options: FFmpegGenerationOptions = {}
  ): Promise<void> {
    try {
      // Generate the video
      const videoBlob = await this.generateMP4Video(carData, config, audioUrl, options);

      // Create download link
      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use WebM extension since MediaRecorder outputs WebM
      const fileName = `${carData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.webm`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      options.onToast?.('Vidéo téléchargée !', 'Format WebM - Compatible avec tous les navigateurs modernes');

    } catch (error) {
      console.error('Video download failed:', error);
      options.onToast?.('Erreur de téléchargement', `Impossible de télécharger la vidéo: ${error.message}`, 'destructive');
      throw error;
    }
  }
}