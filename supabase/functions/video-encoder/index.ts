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
  
  // For now, simulate video generation with a delay
  // In a real implementation, this would use server-side FFmpeg or similar
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Create a mock video URL (in production, this would be a real generated video)
  const videoUrl = `https://example.com/generated-video-${Date.now()}.mp4`;
  
  console.log('Video slideshow generated:', {
    imageCount: params.images.length,
    duration: params.duration,
    hasAudio: !!params.audioUrl,
    videoUrl
  });
  
  return { url: videoUrl };
}