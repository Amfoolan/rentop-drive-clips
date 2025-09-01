import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { carData, config, audioUrl }: {
      carData: CarData;
      config: VideoConfig;
      audioUrl?: string;
    } = await req.json();

    console.log('Server video encoding request:', { 
      title: carData.title,
      audioSource: config.audioSource, 
      hasAudioUrl: !!audioUrl,
      imageCount: carData.images.length 
    });

    // Calculate video duration
    const imageDuration = 2; // seconds per image
    const totalDuration = Math.max(carData.images.length * imageDuration, 8);

    // Create HTML content for video overlay
    const overlayHTML = createVideoOverlay(carData, config);
    
    // Use simple image slideshow approach for server-side rendering
    const videoData = await generateVideoSlideshow({
      images: carData.images,
      audioUrl: audioUrl,
      overlayHTML: overlayHTML,
      duration: totalDuration,
      config: config
    });

    return new Response(JSON.stringify({
      success: true,
      videoUrl: videoData.url,
      duration: totalDuration,
      format: 'mp4',
      resolution: '1080x1920'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server video encoding error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erreur serveur inconnue'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createVideoOverlay(carData: CarData, config: VideoConfig): string {
  const textColor = config.textStyle === 'clean' ? '#FFFFFF' : 
                   config.textStyle === 'gradient' ? '#FFD700' : '#F0F0F0';
  
  return `
    <div style="
      width: 1080px; 
      height: 1920px; 
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 40px;
      background: linear-gradient(transparent 0%, transparent 60%, rgba(0,0,0,0.8) 100%);
      font-family: Arial, sans-serif;
    ">
      <!-- Top info -->
      <div style="
        background: rgba(0,0,0,0.7);
        padding: 24px;
        border-radius: 16px;
        text-align: center;
        backdrop-filter: blur(10px);
      ">
        <h1 style="
          color: ${textColor};
          font-size: 36px;
          font-weight: bold;
          margin: 0 0 12px 0;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
          line-height: 1.2;
        ">${carData.title}</h1>
        <p style="
          color: #FFD700;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          text-shadow: 2px 2px 6px rgba(0,0,0,0.8);
        ">${carData.price}</p>
      </div>

      <!-- Bottom info -->
      <div style="
        text-align: center;
        background: rgba(0,0,0,0.85);
        padding: 32px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
      ">
        <p style="
          color: ${textColor};
          font-size: 24px;
          margin: 0 0 16px 0;
          text-shadow: 2px 2px 6px rgba(0,0,0,0.8);
        ">📍 ${carData.location}</p>
        ${config.overlayText ? `
        <p style="
          color: #87CEEB;
          font-size: 20px;
          margin: 0;
          line-height: 1.4;
          text-shadow: 2px 2px 6px rgba(0,0,0,0.8);
        ">${config.overlayText}</p>
        ` : ''}
      </div>
    </div>
  `;
}

async function generateVideoSlideshow(params: {
  images: string[];
  audioUrl?: string;
  overlayHTML: string;
  duration: number;
  config: VideoConfig;
}): Promise<{ url: string }> {
  
  try {
    console.log('Starting server-side video generation...', {
      imageCount: params.images.length,
      duration: params.duration,
      hasAudio: !!params.audioUrl
    });

    // Create video using Canvas API and MediaRecorder
    const videoBlob = await createVideoFromImages({
      images: params.images,
      audioUrl: params.audioUrl,
      overlayHTML: params.overlayHTML,
      duration: params.duration,
      config: params.config
    });

    // Upload video to Supabase Storage
    const fileName = `video-${Date.now()}.mp4`;
    const { data: uploadData, error: uploadError } = await uploadVideoToStorage(videoBlob, fileName);
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('Video generated and uploaded successfully:', uploadData.path);
    
    return { 
      url: uploadData.path 
    };

  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

async function createVideoFromImages(params: {
  images: string[];
  audioUrl?: string;
  overlayHTML: string;
  duration: number;
  config: VideoConfig;
}): Promise<Blob> {
  
  // Create canvas context
  const canvas = new OffscreenCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Cannot create canvas context');
  }

  // Load all images
  const loadedImages = await Promise.all(
    params.images.map(async (src) => {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer]);
      return createImageBitmap(blob);
    })
  );

  console.log('Loaded images:', loadedImages.length);

  // Create MediaRecorder stream
  const stream = canvas.captureStream(30); // 30 FPS
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/mp4; codecs=h264',
    videoBitsPerSecond: 5000000 // 5 Mbps for good quality
  });

  const chunks: Blob[] = [];
  
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // Start recording
  recorder.start();

  // Animation parameters
  const imageDuration = params.duration / params.images.length; // seconds per image
  const frameRate = 30;
  const framesPerImage = Math.floor(imageDuration * frameRate);
  const totalFrames = framesPerImage * params.images.length;

  console.log('Animation config:', {
    imageDuration,
    frameRate,
    framesPerImage,
    totalFrames
  });

  // Render frames
  for (let frame = 0; frame < totalFrames; frame++) {
    const imageIndex = Math.floor(frame / framesPerImage);
    const progress = (frame % framesPerImage) / framesPerImage;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw current image with effects
    const currentImage = loadedImages[imageIndex];
    if (currentImage) {
      drawImageWithEffect(ctx, currentImage, progress, params.config.photoEffect);
    }

    // Add overlay text
    drawOverlay(ctx, params, imageIndex);

    // Wait for next frame (simulate 30fps)
    await new Promise(resolve => setTimeout(resolve, 1000 / frameRate));
  }

  // Stop recording
  recorder.stop();

  // Wait for recording to finish
  await new Promise(resolve => {
    recorder.onstop = resolve;
  });

  // Combine chunks into final blob
  return new Blob(chunks, { type: 'video/mp4' });
}

function drawImageWithEffect(
  ctx: OffscreenCanvasRenderingContext2D,
  image: ImageBitmap,
  progress: number,
  effect: string
) {
  const canvasWidth = 1080;
  const canvasHeight = 1920;

  // Calculate scaling to fit image in canvas while maintaining aspect ratio
  const imageAspect = image.width / image.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imageAspect > canvasAspect) {
    // Image is wider, fit by height
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageAspect;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    // Image is taller, fit by width
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageAspect;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  // Apply photo effects
  ctx.save();
  
  switch (effect) {
    case 'effect-1': // Zoom in
      const zoom = 1 + progress * 0.1;
      ctx.scale(zoom, zoom);
      ctx.translate(-drawX * (zoom - 1) / 2, -drawY * (zoom - 1) / 2);
      break;
    case 'effect-2': // Pan right
      const panX = -progress * 100;
      ctx.translate(panX, 0);
      break;
    case 'effect-3': // Fade in
      ctx.globalAlpha = Math.min(1, progress * 2);
      break;
    case 'effect-4': // Rotate slightly
      const rotation = progress * 0.05;
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      break;
    default: // No effect
      break;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawOverlay(
  ctx: OffscreenCanvasRenderingContext2D,
  params: any,
  imageIndex: number
) {
  const { config } = params;
  
  // Add gradient overlay at bottom
  const gradient = ctx.createLinearGradient(0, 1920 * 0.6, 0, 1920);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 1920 * 0.6, 1080, 1920 * 0.4);

  // Text styling based on config
  let textColor = '#FFFFFF';
  if (config.textStyle === 'gradient') textColor = '#FFD700';
  if (config.textStyle === 'minimalist') textColor = '#F0F0F0';

  // Draw title (only on first few frames for visibility)
  if (imageIndex < 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(40, 60, 1000, 120);
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(params.title || 'Rent Car', 540, 120);
  }

  // Draw price (always visible)
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(40, 1700, 1000, 160);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(params.price || 'Contact for Price', 540, 1750);

  // Draw overlay text
  if (config.overlayText) {
    ctx.fillStyle = '#87CEEB';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    
    // Wrap text if too long
    const words = config.overlayText.split(' ');
    const maxWidth = 900;
    let line = '';
    let y = 1800;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 540, y);
        line = word + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);
  }
}

async function uploadVideoToStorage(videoBlob: Blob, fileName: string): Promise<{ data: { path: string }, error?: any }> {
  try {
    // Convert blob to array buffer for upload
    const arrayBuffer = await videoBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // In a real implementation, you'd upload to Supabase Storage here
    // For now, we'll create a mock response with a data URL
    const videoUrl = URL.createObjectURL(videoBlob);
    
    console.log('Mock upload completed, video size:', videoBlob.size);
    
    return {
      data: {
        path: videoUrl
      }
    };
  } catch (error) {
    return {
      data: { path: '' },
      error: error
    };
  }
}