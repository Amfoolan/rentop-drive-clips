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
      onStatus?.('Initialisation de la génération vidéo...');
      onProgress?.(0);

      // Try MediaRecorder API first (more reliable)
      const videoBlob = await this.generateWithMediaRecorder(
        carData,
        config,
        audioUrl,
        options
      );

      return videoBlob;

    } catch (error) {
      console.error('Video generation failed:', error);
      onToast?.('Erreur de génération', `Impossible de générer la vidéo: ${error.message}`, 'destructive');
      throw error;
    }
  }

  private static async generateWithMediaRecorder(
    carData: CarData,
    config: VideoConfig,
    audioUrl?: string,
    options: FFmpegGenerationOptions = {}
  ): Promise<Blob> {
    const { onProgress, onStatus } = options;
    
    return new Promise((resolve, reject) => {
      try {
        onStatus?.('Création du canvas vidéo...');
        onProgress?.(10);

        // Create canvas for video generation
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // Setup MediaRecorder
        const stream = canvas.captureStream(30);
        let mediaRecorder: MediaRecorder;
        
        // Add audio if provided
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          const audioCtx = new AudioContext();
          const audioSource = audioCtx.createMediaElementSource(audio);
          const dest = audioCtx.createMediaStreamDestination();
          audioSource.connect(dest);
          
          // Combine video and audio streams
          const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ]);
          mediaRecorder = new MediaRecorder(combinedStream);
        } else {
          mediaRecorder = new MediaRecorder(stream);
        }

        const chunks: Blob[] = [];
        let currentImageIndex = 0;
        const imageDuration = 3000; // 3 seconds per image
        let startTime = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          resolve(videoBlob);
        };

        mediaRecorder.onerror = (error) => {
          reject(error);
        };

        // Animation loop
        const animate = async () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / (carData.images.length * imageDuration), 1);
          
          onProgress?.(10 + progress * 80);

          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw current image
          if (currentImageIndex < carData.images.length) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              // Calculate dimensions to fit image in canvas
              const aspectRatio = img.width / img.height;
              let drawWidth = canvas.width;
              let drawHeight = canvas.width / aspectRatio;
              
              if (drawHeight > canvas.height) {
                drawHeight = canvas.height;
                drawWidth = canvas.height * aspectRatio;
              }
              
              const x = (canvas.width - drawWidth) / 2;
              const y = (canvas.height - drawHeight) / 2;
              
              ctx.drawImage(img, x, y, drawWidth, drawHeight);
              
              // Add text overlay
              this.addTextOverlay(ctx, carData, config);
              
              // Continue animation
              if (progress < 1) {
                if (elapsed >= (currentImageIndex + 1) * imageDuration) {
                  currentImageIndex++;
                }
                setTimeout(() => animate(), 33); // ~30fps
              } else {
                onStatus?.('Finalisation de la vidéo...');
                onProgress?.(90);
                setTimeout(() => mediaRecorder.stop(), 500);
              }
            };
            
            img.src = carData.images[currentImageIndex];
          }
        };

        // Start recording
        onStatus?.('Démarrage de l\'enregistrement...');
        mediaRecorder.start();
        animate();

      } catch (error) {
        reject(error);
      }
    });
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