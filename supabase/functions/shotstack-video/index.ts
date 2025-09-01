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
  uploadedAudio?: {
    file: File;
    duration: number;
    url: string;
  };
  textStyle: 'clean' | 'gradient' | 'minimalist';
  photoEffect: 'effect-1' | 'effect-2' | 'effect-3' | 'effect-4' | 'effect-5';
}

const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');
const SHOTSTACK_BASE_URL = 'https://api.shotstack.io/stage'; // Use 'production' for live

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

    console.log('Creating Shotstack video with:', { 
      audioSource: config.audioSource, 
      hasAudioUrl: !!audioUrl,
      imageCount: carData.images.length 
    });

    // Calculate duration - 3 seconds per image, minimum 5 seconds
    const imageDuration = 3;
    const totalDuration = Math.max(carData.images.length * imageDuration, 5);

    // Create HTML overlay with car info
    const overlayHTML = `
      <div style="
        width: 1080px; 
        height: 1920px; 
        font-family: 'Arial', sans-serif;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 40px;
        background: linear-gradient(transparent 0%, transparent 70%, rgba(0,0,0,0.8) 100%);
      ">
        <!-- Top info -->
        <div style="
          background: rgba(0,0,0,0.8);
          padding: 20px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          text-align: center;
        ">
          <h1 style="
            color: white;
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 10px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          ">${carData.title}</h1>
          <p style="
            color: #FFD700;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          ">${carData.price}</p>
        </div>

        <!-- Bottom info -->
        <div style="
          text-align: center;
          background: rgba(0,0,0,0.9);
          padding: 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        ">
          <p style="
            color: white;
            font-size: 22px;
            margin: 0 0 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          ">${carData.location}</p>
          ${config.overlayText ? `
          <p style="
            color: #87CEEB;
            font-size: 18px;
            margin: 0;
            line-height: 1.4;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          ">${config.overlayText}</p>
          ` : ''}
        </div>
      </div>
    `;

    // Create timeline tracks
    const tracks = [];

    // Background track with car images
    const imageClips = carData.images.map((imageUrl, index) => ({
      asset: {
        type: "image",
        src: imageUrl
      },
      start: index * imageDuration,
      length: imageDuration,
      fit: "cover",
      scale: 1.1, // Slight zoom for Ken Burns effect
      transition: {
        in: "fade",
        out: "fade"
      },
      effect: "zoomIn"
    }));

    tracks.push({
      clips: imageClips
    });

    // Text overlay track
    tracks.push({
      clips: [{
        asset: {
          type: "html",
          html: overlayHTML,
          css: "body { margin: 0; padding: 0; }"
        },
        start: 0,
        length: totalDuration,
        position: "center"
      }]
    });

    // Create timeline object
    const timeline: any = {
      soundtrack: config.audioSource !== 'none' && audioUrl ? {
        src: audioUrl,
        effect: "fadeInFadeOut",
        volume: 0.8
      } : undefined,
      tracks: tracks
    };

    // Create Shotstack render request
    const renderRequest = {
      timeline: timeline,
      output: {
        format: "mp4",
        resolution: "hd", // 1080p
        aspectRatio: "9:16", // TikTok format
        fps: 25,
        scaleTo: "preview" // For faster processing, use "hd" for final
      }
    };

    console.log('Sending Shotstack render request:', JSON.stringify(renderRequest, null, 2));

    // Submit render to Shotstack
    const renderResponse = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SHOTSTACK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderRequest)
    });

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      console.error('Shotstack render error:', errorText);
      throw new Error(`Erreur Shotstack: ${renderResponse.status} - ${errorText}`);
    }

    const renderData = await renderResponse.json();
    console.log('Shotstack render started:', renderData);

    return new Response(JSON.stringify({
      renderId: renderData.response.id,
      status: 'rendering',
      message: 'Génération vidéo démarrée avec Shotstack'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Shotstack video generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: 'Vérifiez les logs pour plus de détails'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});