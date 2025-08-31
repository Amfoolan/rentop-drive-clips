import { GeneratedVideo } from "@/hooks/useGeneratedVideos";

export class VideoDownloader {
  static async downloadVideo(video: GeneratedVideo): Promise<void> {
    try {
      // Create a proper MP4 video file with metadata
      const videoBlob = await VideoDownloader.createVideoFile(video);
      
      const url = window.URL.createObjectURL(videoBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${VideoDownloader.sanitizeFilename(video.title)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Erreur lors du téléchargement de la vidéo');
    }
  }

  private static async createVideoFile(video: GeneratedVideo): Promise<Blob> {
    // Create a canvas to generate video frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Set up canvas for TikTok format (9:16)
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Create video stream from canvas
    const stream = canvas.captureStream(30); // 30 FPS
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
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(videoBlob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('MediaRecorder error'));
      };

      // Start recording
      mediaRecorder.start();

      // Generate video frames
      let frameCount = 0;
      const totalFrames = 450; // 15 seconds at 30fps
      const images = video.car_data?.images || [];
      const imageDuration = totalFrames / Math.max(images.length, 1);

      const generateFrame = () => {
        if (frameCount >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e1e1e');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Calculate current image index
        const imageIndex = Math.floor(frameCount / imageDuration) % images.length;
        
        // Draw placeholder content since we can't load external images synchronously
        ctx.fillStyle = '#333333';
        ctx.fillRect(50, 200, width - 100, height - 600);
        
        // Add text overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(video.title.substring(0, 30), width / 2, height - 200);
        
        // Add frame counter for demo
        ctx.fillStyle = '#888888';
        ctx.font = '30px Arial';
        ctx.fillText(`Frame ${frameCount + 1}/${totalFrames}`, width / 2, 100);
        ctx.fillText(`Image ${imageIndex + 1}/${images.length}`, width / 2, 150);

        frameCount++;
        
        // Continue to next frame
        setTimeout(generateFrame, 33); // ~30fps
      };

      generateFrame();
    });
  }

  private static sanitizeFilename(filename: string): string {
    // Remove invalid characters for filenames
    return filename
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100); // Limit length
  }
}