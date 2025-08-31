import { GeneratedVideo } from "@/hooks/useGeneratedVideos";
import { VideoConfig } from "./StepByStepGenerator";

export class VideoDownloader {
  static async downloadVideo(video: GeneratedVideo, config?: VideoConfig): Promise<void> {
    try {
      console.log('Starting video download for:', video.title);
      
      // Create a proper video file with all features
      const videoBlob = await VideoDownloader.createVideoFile(video, config);
      
      const url = window.URL.createObjectURL(videoBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${VideoDownloader.sanitizeFilename(video.title)}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Video download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Erreur lors du téléchargement de la vidéo');
    }
  }

  private static async createVideoFile(video: GeneratedVideo, config?: VideoConfig): Promise<Blob> {
    console.log('Creating video file...');
    
    // Create a canvas to generate video frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Set up canvas for TikTok format (9:16)
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Preload all images
    const images = video.car_data?.images || [];
    const loadedImages = await VideoDownloader.preloadImages(images);
    console.log(`Loaded ${loadedImages.length} images`);

    // Determine video duration (from audio or default)
    let videoDurationSeconds = 15; // Default
    if (config?.uploadedAudio?.duration) {
      videoDurationSeconds = config.uploadedAudio.duration;
    }
    
    const fps = 30;
    const totalFrames = videoDurationSeconds * fps;
    const imageDuration = totalFrames / Math.max(loadedImages.length, 1);

    // Create video stream from canvas
    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];
    
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Video recording stopped');
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(videoBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        reject(new Error('MediaRecorder error'));
      };

      // Start recording
      mediaRecorder.start();
      console.log('Started video recording');

      // Generate video frames
      let frameCount = 0;

      const generateFrame = () => {
        if (frameCount >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        // Clear canvas with styled background
        VideoDownloader.drawBackground(ctx, width, height, config?.photoEffect);

        // Calculate current image index with smooth transitions
        const imageIndex = Math.floor(frameCount / imageDuration) % loadedImages.length;
        const currentImage = loadedImages[imageIndex];

        if (currentImage) {
          VideoDownloader.drawImageWithEffect(ctx, currentImage, width, height, config?.photoEffect);
        }

        // Draw text overlays with styling
        VideoDownloader.drawTextOverlays(ctx, width, height, video, config);

        frameCount++;
        
        // Continue to next frame (targeting 30fps)
        setTimeout(generateFrame, 1000 / fps);
      };

      generateFrame();
    });
  }

  private static async preloadImages(imageUrls: string[]): Promise<HTMLImageElement[]> {
    const loadPromises = imageUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          // Create a placeholder image instead of rejecting
          const placeholderImg = new Image();
          placeholderImg.width = 400;
          placeholderImg.height = 300;
          resolve(placeholderImg);
        };
        img.src = url;
      });
    });

    const results = await Promise.all(loadPromises);
    return results.filter(img => img !== null);
  }

  private static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, effect?: string) {
    // Create styled background based on effect
    switch (effect) {
      case 'effect-1': // Gradient blue
        const gradient1 = ctx.createLinearGradient(0, 0, 0, height);
        gradient1.addColorStop(0, '#1e3a8a');
        gradient1.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradient1;
        break;
      
      case 'effect-2': // Gradient warm
        const gradient2 = ctx.createLinearGradient(0, 0, 0, height);
        gradient2.addColorStop(0, '#dc2626');
        gradient2.addColorStop(1, '#7c2d12');
        ctx.fillStyle = gradient2;
        break;
      
      case 'effect-3': // Dark elegant
        const gradient3 = ctx.createLinearGradient(0, 0, 0, height);
        gradient3.addColorStop(0, '#1f2937');
        gradient3.addColorStop(1, '#000000');
        ctx.fillStyle = gradient3;
        break;
      
      default: // Clean gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e1e1e');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
    }
    
    ctx.fillRect(0, 0, width, height);
  }

  private static drawImageWithEffect(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, effect?: string) {
    // Calculate image positioning (centered, maintain aspect ratio)
    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider
      drawHeight = height * 0.7; // 70% of canvas height
      drawWidth = drawHeight * imgAspectRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = height * 0.15; // 15% from top
    } else {
      // Image is taller
      drawWidth = width * 0.9; // 90% of canvas width
      drawHeight = drawWidth / imgAspectRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    }

    // Apply visual effects
    ctx.save();
    
    switch (effect) {
      case 'effect-1': // Rounded corners with shadow
        VideoDownloader.drawRoundedImage(ctx, img, offsetX, offsetY, drawWidth, drawHeight, 20);
        break;
      
      case 'effect-2': // Border effect
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(offsetX - 2, offsetY - 2, drawWidth + 4, drawHeight + 4);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        break;
      
      default: // Simple draw
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    ctx.restore();
  }

  private static drawRoundedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
    ctx.drawImage(img, x, y, width, height);
  }

  private static drawTextOverlays(ctx: CanvasRenderingContext2D, width: number, height: number, video: GeneratedVideo, config?: VideoConfig) {
    ctx.save();
    
    // Main title
    const title = video.title || '';
    const overlayText = config?.overlayText || video.overlay_text || '';
    
    // Draw title based on text style
    switch (config?.textStyle) {
      case 'gradient':
        VideoDownloader.drawGradientText(ctx, title, width / 2, height - 200, '60px Arial', width * 0.9);
        break;
      
      case 'minimalist':
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        VideoDownloader.drawMultilineText(ctx, title, width / 2, height - 200, width * 0.9, 60);
        break;
      
      default: // clean
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        VideoDownloader.drawMultilineText(ctx, title, width / 2, height - 200, width * 0.9, 70);
    }

    // Draw overlay text if provided
    if (overlayText) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      VideoDownloader.drawMultilineText(ctx, overlayText, width / 2, height - 100, width * 0.9, 50);
    }

    // Draw car details
    if (video.car_data?.price) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${video.car_data.price}`, width / 2, 150);
    }
    
    ctx.restore();
  }

  private static drawGradientText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, maxWidth: number) {
    ctx.font = font;
    const gradient = ctx.createLinearGradient(0, y - 50, 0, y + 50);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = gradient;
    ctx.textAlign = 'center';
    VideoDownloader.drawMultilineText(ctx, text, x, y, maxWidth, 70);
  }

  private static drawMultilineText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        if (ctx.fillStyle !== ctx.strokeStyle && ctx.lineWidth > 0) {
          ctx.strokeText(line, x, currentY);
        }
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (ctx.fillStyle !== ctx.strokeStyle && ctx.lineWidth > 0) {
      ctx.strokeText(line, x, currentY);
    }
    ctx.fillText(line, x, currentY);
  }

  private static sanitizeFilename(filename: string): string {
    // Remove invalid characters for filenames
    return filename
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100); // Limit length
  }
}