import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoGenerationRequest {
  carData: {
    title: string;
    images: string[];
    price: string;
    location: string;
  };
  config: {
    overlayText: string;
    voiceOverText: string;
    audioSource: 'elevenlabs' | 'upload';
    voiceId?: string;
    voiceSettings?: {
      stability: number;
      similarity_boost: number;
      speed: number;
    };
    audioUrl?: string;
    audioDuration?: number;
    uploadedAudio?: {
      url: string;
      duration: number;
    };
    socialNetworks: Record<string, boolean>;
    textPosition: string;
    textStyle: 'clean' | 'gradient' | 'minimalist';
    photoEffect: 'effect-1' | 'effect-2' | 'effect-3' | 'effect-4' | 'effect-5';
  };
  apiKey?: string;
}

async function downloadImage(url: string): Promise<Uint8Array> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error('Image download error:', error);
    throw error;
  }
}

async function generateAudioWithElevenLabs(
  text: string, 
  voiceId: string, 
  voiceSettings: any,
  apiKey: string
): Promise<Uint8Array> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: voiceSettings?.stability || 0.75,
          similarity_boost: voiceSettings?.similarity_boost || 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function createFFmpegCommand(
  imageCount: number,
  audioDuration: number,
  photoEffect: string,
  overlayText: string,
  textStyle: string,
  textPosition: string
): string[] {
  // Calculate video duration based on audio or default
  const videoDuration = Math.max(audioDuration || 15, 10);
  const imageDisplayTime = videoDuration / imageCount;

  let filterComplex = '';
  
  // Create image inputs and apply effects
  for (let i = 0; i < imageCount; i++) {
    // Scale and pad images to 1080x1920 (9:16 aspect ratio)
    filterComplex += `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setpts=PTS-STARTPTS+${i * imageDisplayTime}/TB[v${i}];`;
    
    // Apply photo effects
    switch (photoEffect) {
      case 'effect-1': // Pan Left-Right
        filterComplex += `[v${i}]scale=1200:1920,crop=1080:1920:iw*t/${imageDisplayTime}*0.1:0[pv${i}];`;
        break;
      case 'effect-2': // Zoom In
        filterComplex += `[v${i}]scale=iw*(1+0.1*t/${imageDisplayTime}):ih*(1+0.1*t/${imageDisplayTime}),crop=1080:1920[pv${i}];`;
        break;
      case 'effect-3': // Zoom Out
        filterComplex += `[v${i}]scale=iw*(1.1-0.1*t/${imageDisplayTime}):ih*(1.1-0.1*t/${imageDisplayTime}),crop=1080:1920[pv${i}];`;
        break;
      case 'effect-4': // Fade
        filterComplex += `[v${i}]fade=t=in:st=${i * imageDisplayTime}:d=0.5,fade=t=out:st=${(i + 1) * imageDisplayTime - 0.5}:d=0.5[pv${i}];`;
        break;
      case 'effect-5': // Slide Up
        filterComplex += `[v${i}]pad=1080:2400:0:480,crop=1080:1920:0:480*t/${imageDisplayTime}[pv${i}];`;
        break;
      default:
        filterComplex += `[v${i}][pv${i}];`;
    }
  }

  // Concatenate all processed images
  let concatInputs = '';
  for (let i = 0; i < imageCount; i++) {
    concatInputs += `[pv${i}]`;
  }
  filterComplex += `${concatInputs}concat=n=${imageCount}:v=1:a=0,format=yuv420p[video];`;

  // Add text overlay based on style and position
  const textY = textPosition === 'bottom-6' ? 'h-200' : 
                textPosition === 'bottom-20' ? 'h-400' : 'h-600';

  let textFilter = '';
  switch (textStyle) {
    case 'clean':
      textFilter = `drawbox=x=40:y=${textY}:w=1000:h=160:color=black@0.8:t=fill,`;
      textFilter += `drawtext=text='${overlayText}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=${textY}+40:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`;
      break;
    case 'gradient':
      textFilter = `drawbox=x=0:y=${textY}:w=1080:h=200:color=black@0.9:t=fill,`;
      textFilter += `drawtext=text='${overlayText}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=${textY}+60:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`;
      break;
    case 'minimalist':
      textFilter = `drawbox=x=40:y=${textY}:w=1000:h=80:color=white@0.1:t=fill,`;
      textFilter += `drawtext=text='${overlayText}':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=${textY}+25:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`;
      break;
    default:
      textFilter = `drawtext=text='${overlayText}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=${textY}:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`;
  }

  filterComplex += `[video]${textFilter}[output]`;

  return [
    '-filter_complex', filterComplex,
    '-map', '[output]',
    '-map', `${imageCount}:a`, // Audio input
    '-c:v', 'libx264',
    '-profile:v', 'high', // High profile for better quality
    '-preset', 'medium', // Balance between quality and speed
    '-crf', '18', // High quality (lower CRF = better quality)
    '-c:a', 'aac',
    '-b:a', '192k', // Higher bitrate for better audio
    '-ar', '48000', // Higher sample rate
    '-r', '30', // 30 FPS
    '-pix_fmt', 'yuv420p', // Compatibility with all players
    '-movflags', '+faststart', // Web optimization
    '-t', videoDuration.toString(),
    '-shortest',
    '-f', 'mp4'
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VideoGenerationRequest = await req.json();
    console.log('Video generation request received');

    const { carData, config, apiKey } = body;

    // Validate required data
    if (!carData.images || carData.images.length === 0) {
      throw new Error('No images provided');
    }

    // Step 1: Download images
    console.log('Downloading images...');
    const imageBuffers: Uint8Array[] = [];
    for (const imageUrl of carData.images.slice(0, 10)) { // Limit to 10 images
      try {
        const imageBuffer = await downloadImage(imageUrl);
        imageBuffers.push(imageBuffer);
      } catch (error) {
        console.warn(`Failed to download image ${imageUrl}:`, error);
      }
    }

    if (imageBuffers.length === 0) {
      throw new Error('No images could be downloaded');
    }

    // Step 2: Generate or prepare audio
    console.log('Preparing audio...');
    let audioBuffer: Uint8Array;
    let audioDuration: number;

    if (config.audioSource === 'elevenlabs') {
      // Check if we already have generated audio URL from client
      if (config.audioUrl && config.audioDuration) {
        console.log('Using pre-generated ElevenLabs audio from client');
        
        // Download the audio from the provided URL
        try {
          const audioResponse = await fetch(config.audioUrl);
          if (!audioResponse.ok) {
            throw new Error('Failed to download audio from URL');
          }
          audioBuffer = new Uint8Array(await audioResponse.arrayBuffer());
          audioDuration = config.audioDuration;
        } catch (error) {
          console.warn('Failed to use pre-generated audio, generating new:', error);
          // Fall back to generating new audio
          if (!config.voiceOverText) {
            throw new Error('No voice-over text provided and no valid audio URL');
          }

          const elevenlabsApiKey = apiKey || Deno.env.get('ELEVENLABS_API_KEY');
          if (!elevenlabsApiKey) {
            throw new Error('ElevenLabs API key is required');
          }

          audioBuffer = await generateAudioWithElevenLabs(
            config.voiceOverText,
            config.voiceId || 'EXAVITQu4vr4xnSDxMaL',
            config.voiceSettings,
            elevenlabsApiKey
          );
          
          // Estimate duration based on text length
          audioDuration = Math.max(config.voiceOverText.length / 12, 5);
        }
      } else {
        // Generate new audio with ElevenLabs
        if (!config.voiceOverText) {
          throw new Error('No voice-over text provided');
        }

        const elevenlabsApiKey = apiKey || Deno.env.get('ELEVENLABS_API_KEY');
        if (!elevenlabsApiKey) {
          throw new Error('ElevenLabs API key is required');
        }

        audioBuffer = await generateAudioWithElevenLabs(
          config.voiceOverText,
          config.voiceId || 'EXAVITQu4vr4xnSDxMaL',
          config.voiceSettings,
          elevenlabsApiKey
        );
        
        // Estimate duration based on text length
        audioDuration = Math.max(config.voiceOverText.length / 12, 5);
      }
      
    } else if (config.audioSource === 'upload' && config.uploadedAudio) {
      // For uploaded audio, we need to handle it differently
      // Since we only have a blob URL from the client, we'll create a silent video for now
      // and suggest using ElevenLabs for best results
      console.log('Uploaded audio detected, creating video without audio for now');
      
      // Create a simple sine wave audio as fallback (10 seconds)
      audioDuration = config.uploadedAudio.duration || 10;
      
      // Generate a simple audio tone using FFmpeg
      const tempDir = await Deno.makeTempDir();
      const silentAudioPath = `${tempDir}/silent.mp3`;
      
      // Create silent audio file with FFmpeg
      const silentAudioProcess = new Deno.Command('ffmpeg', {
        args: [
          '-f', 'lavfi',
          '-i', `anullsrc=channel_layout=stereo:sample_rate=44100`,
          '-t', audioDuration.toString(),
          '-c:a', 'mp3',
          '-b:a', '128k',
          silentAudioPath
        ],
        stdout: 'piped',
        stderr: 'piped'
      });

      const silentResult = await silentAudioProcess.output();
      if (!silentResult.success) {
        console.warn('Failed to create silent audio, using minimal audio');
        // Create minimal audio buffer as fallback
        audioBuffer = new Uint8Array(1024);
      } else {
        audioBuffer = await Deno.readFile(silentAudioPath);
      }
      
      // Clean up
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch (error) {
        console.warn('Failed to clean up temp files:', error);
      }
    } else {
      throw new Error('No valid audio source configured');
    }

    // Step 3: Create video with FFmpeg
    console.log('Generating video with FFmpeg...');
    
    // Create temporary files
    const tempDir = await Deno.makeTempDir();
    
    // Write image files
    const imageFiles: string[] = [];
    for (let i = 0; i < imageBuffers.length; i++) {
      const imagePath = `${tempDir}/image_${i}.jpg`;
      await Deno.writeFile(imagePath, imageBuffers[i]);
      imageFiles.push(imagePath);
    }

    // Write audio file
    const audioPath = `${tempDir}/audio.mp3`;
    await Deno.writeFile(audioPath, audioBuffer);

    // Prepare FFmpeg command
    const outputPath = `${tempDir}/output.mp4`;
    const ffmpegArgs = [
      // Input images
      ...imageFiles.flatMap(path => ['-loop', '1', '-t', (audioDuration / imageBuffers.length).toString(), '-i', path]),
      // Input audio
      '-i', audioPath,
      // Apply filters and encoding
      ...createFFmpegCommand(
        imageBuffers.length,
        audioDuration,
        config.photoEffect,
        config.overlayText,
        config.textStyle,
        config.textPosition
      ),
      // Output
      outputPath
    ];

    console.log('Running FFmpeg command...');
    const ffmpegProcess = new Deno.Command('ffmpeg', {
      args: ffmpegArgs,
      stdout: 'piped',
      stderr: 'piped'
    });

    const ffmpegResult = await ffmpegProcess.output();
    
    if (!ffmpegResult.success) {
      const errorOutput = new TextDecoder().decode(ffmpegResult.stderr);
      console.error('FFmpeg error:', errorOutput);
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    // Read the generated video
    const videoBuffer = await Deno.readFile(outputPath);

    // Clean up temporary files
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up temp files:', error);
    }

    console.log(`Video generated successfully, size: ${videoBuffer.length} bytes`);

    // Return the video file
    return new Response(videoBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="tiktok_video_${Date.now()}.mp4"`
      },
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Video generation failed',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});