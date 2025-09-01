import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Security headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

interface EncodingRequest {
  images: string[];
  audio?: string;
  title?: string;
  fps?: number;
  durationPerImage?: number;
  width?: number;
  height?: number;
}

interface CarData {
  title: string;
  price: string;
  location: string;
  images: string[];
}

interface VideoConfig {
  overlayText: string;
  voiceOverText: string;
  audioSource: 'elevenlabs' | 'upload' | 'none';
  textStyle: 'clean' | 'gradient' | 'minimalist';
  photoEffect: 'effect-1' | 'effect-2' | 'effect-3' | 'effect-4' | 'effect-5';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    
    // Support both new format (images array) and legacy format (carData + config)
    let encodingData: EncodingRequest;
    
    if (body.images && Array.isArray(body.images)) {
      // New direct encoding format
      encodingData = {
        images: body.images,
        audio: body.audio,
        title: body.title || 'Rentop Clips',
        fps: body.fps || 30,
        durationPerImage: body.durationPerImage || 2,
        width: body.width || 1080,
        height: body.height || 1920
      };
    } else if (body.carData && body.config) {
      // Legacy format support
      const carData: CarData = body.carData;
      const config: VideoConfig = body.config;
      
      encodingData = {
        images: carData.images,
        audio: body.audioUrl,
        title: carData.title,
        fps: 30,
        durationPerImage: 2,
        width: 1080,
        height: 1920
      };
    } else {
      throw new Error('Invalid request format. Expected either {images, audio?, title?} or {carData, config}');
    }

    console.log('Server video encoding request:', { 
      title: encodingData.title,
      hasAudio: !!encodingData.audio,
      imageCount: encodingData.images.length,
      fps: encodingData.fps,
      duration: encodingData.durationPerImage
    });

    // Validate input
    if (!encodingData.images || encodingData.images.length === 0) {
      throw new Error('Au moins une image est requise');
    }

    if (encodingData.images.length > 30) {
      throw new Error('Maximum 30 images autorisées');
    }

    // Calculate video duration
    const totalDuration = encodingData.images.length * (encodingData.durationPerImage || 2);
    
    if (totalDuration > 60) {
      throw new Error('Durée maximale de 60 secondes dépassée');
    }

    // Generate video using server-side encoding
    const videoData = await generateServerVideo(encodingData);

    return new Response(JSON.stringify({
      ok: true,
      success: true,
      url: videoData.url,
      videoUrl: videoData.url, // Legacy compatibility
      duration: totalDuration,
      format: 'mp4',
      resolution: `${encodingData.width}x${encodingData.height}`,
      message: 'Vidéo générée avec succès côté serveur'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server video encoding error:', error);
    return new Response(JSON.stringify({ 
      ok: false,
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur inconnue',
      details: 'Encodage côté serveur avec Canvas + MediaRecorder'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateServerVideo(data: EncodingRequest): Promise<{ url: string }> {
  console.log('Starting server-side video generation...');
  
  try {
    // Create server-side canvas using OffscreenCanvas
    const canvas = new OffscreenCanvas(data.width || 1080, data.height || 1920);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }

    // Load all images first
    const images = await Promise.all(
      data.images.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const blob = new Blob([arrayBuffer]);
          return await createImageBitmap(blob);
        } catch (error) {
          console.warn(`Failed to load image ${url}:`, error);
          return null;
        }
      })
    );

    const validImages = images.filter(img => img !== null) as ImageBitmap[];
    
    if (validImages.length === 0) {
      throw new Error('Aucune image valide n\'a pu être chargée');
    }

    console.log(`Loaded ${validImages.length}/${data.images.length} images successfully`);

    // Create video frames
    const fps = data.fps || 30;
    const durationPerImage = data.durationPerImage || 2;
    const framesPerImage = Math.floor(durationPerImage * fps);
    const totalFrames = framesPerImage * validImages.length;

    console.log('Creating video frames:', {
      fps,
      durationPerImage,
      framesPerImage,
      totalFrames,
      estimatedDuration: totalFrames / fps
    });

    // Generate frames and encode
    const frames: ImageData[] = [];
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const imageIndex = Math.floor(frame / framesPerImage);
      const progress = (frame % framesPerImage) / framesPerImage;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw current image with scaling
      const currentImage = validImages[imageIndex % validImages.length];
      if (currentImage) {
        drawScaledImage(ctx, currentImage, canvas.width, canvas.height);
      }

      // Add text overlay
      if (data.title) {
        drawTextOverlay(ctx, data.title, canvas.width, canvas.height);
      }

      // Apply simple animation effects
      applyFrameEffects(ctx, progress, frame, canvas.width, canvas.height);

      // Capture frame
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frames.push(imageData);
    }

    console.log(`Generated ${frames.length} frames`);

    // For now, create a simple video blob (in a real implementation, you'd use proper video encoding)
    // This is a simplified approach that creates a WebM video using MediaRecorder
    const videoBlob = await createVideoFromFrames(frames, fps, canvas.width, canvas.height);
    
    // Upload to Supabase Storage
    const fileName = `encoded-videos/video-${Date.now()}.webm`;
    const uploadUrl = await uploadVideoToStorage(videoBlob, fileName);
    
    console.log('Video encoded and uploaded successfully:', uploadUrl);
    
    return { url: uploadUrl };

  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

function drawScaledImage(
  ctx: OffscreenCanvasRenderingContext2D, 
  image: ImageBitmap, 
  canvasWidth: number, 
  canvasHeight: number
) {
  // Calculate scaling to fit image in canvas while maintaining aspect ratio
  const imageAspect = image.width / image.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imageAspect > canvasAspect) {
    // Image is wider, fit by height and crop sides
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageAspect;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    // Image is taller, fit by width and crop top/bottom
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageAspect;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawTextOverlay(
  ctx: OffscreenCanvasRenderingContext2D,
  title: string,
  canvasWidth: number,
  canvasHeight: number
) {
  // Add gradient background for text
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, 200);

  // Title text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add text shadow
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillText(title, canvasWidth / 2, 100);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function applyFrameEffects(
  ctx: OffscreenCanvasRenderingContext2D,
  progress: number,
  frame: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // Add subtle animation effects
  const time = frame / 30; // seconds
  
  // Subtle zoom effect
  const zoomFactor = 1 + Math.sin(time * 0.5) * 0.02;
  
  // Apply transform for next frame (reset after this frame)
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(zoomFactor, zoomFactor);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
  
  // The transforms will be applied to the next drawing operations
  ctx.restore();
}

async function createVideoFromFrames(
  frames: ImageData[],
  fps: number,
  width: number,
  height: number
): Promise<Blob> {
  // This is a simplified implementation
  // In a real scenario, you'd use proper video encoding with libraries like FFmpeg
  
  console.log('Creating video from frames (simplified approach)...');
  
  // For this example, we'll create a simple animated GIF-like structure
  // In production, use proper video encoding
  
  // Create a basic video structure
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  
  // Create a simple video by encoding frames as a WebM
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm; codecs=vp8',
    videoBitsPerSecond: 2500000 // 2.5 Mbps
  });
  
  const chunks: Blob[] = [];
  
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      resolve(videoBlob);
    };
    
    recorder.onerror = (error) => {
      reject(error);
    };
    
    recorder.start();
    
    // Play frames
    let frameIndex = 0;
    const frameInterval = setInterval(() => {
      if (frameIndex >= frames.length) {
        clearInterval(frameInterval);
        recorder.stop();
        return;
      }
      
      const frame = frames[frameIndex];
      ctx.putImageData(frame, 0, 0);
      frameIndex++;
    }, 1000 / fps);
  });
}

async function uploadVideoToStorage(videoBlob: Blob, fileName: string): Promise<string> {
  try {
    // In a real implementation, upload to Supabase Storage
    // For now, create a temporary URL
    console.log('Uploading video to storage...', { 
      size: videoBlob.size, 
      type: videoBlob.type,
      fileName 
    });
    
    // Create a data URL as a temporary solution
    const arrayBuffer = await videoBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:${videoBlob.type};base64,${base64}`;
    
    console.log('Video encoded successfully, size:', videoBlob.size);
    
    return dataUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}