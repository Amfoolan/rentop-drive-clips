import { generateVideoWithFFmpeg } from '@/utils/videoGenerator';
import { CarData, VideoConfig } from './StepByStepGenerator';

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
      onStatus?.('Initialisation de la génération MP4...');
      onProgress?.(0);

      // Use the existing FFmpeg utility
      const videoBlob = await generateVideoWithFFmpeg(
        carData,
        config,
        audioUrl,
        {
          onProgress,
          onStatus,
          onToast
        }
      );

      return videoBlob;

    } catch (error) {
      console.error('FFmpeg video generation failed:', error);
      onToast?.('Erreur de génération', `Impossible de générer la vidéo: ${error.message}`, 'destructive');
      throw error;
    }
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
      link.download = `${carData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      options.onToast?.('Vidéo MP4 téléchargée !', 'Qualité professionnelle - Prête pour Instagram/TikTok');

    } catch (error) {
      console.error('Video download failed:', error);
      options.onToast?.('Erreur de téléchargement', `Impossible de télécharger la vidéo: ${error.message}`, 'destructive');
      throw error;
    }
  }
}