import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CarData, VideoConfig } from '@/components/VideoGenerator/StepByStepGenerator';

interface GenerateVideoOptions {
  onProgress?: (progress: number) => void;
  onStatus?: (status: string) => void;
  onToast?: (title: string, description: string, variant?: 'default' | 'destructive') => void;
}

export async function generateVideoWithFFmpeg(
  carData: CarData, 
  config: VideoConfig, 
  audioUrl?: string,
  options: GenerateVideoOptions = {}
): Promise<Blob> {
  const { onProgress, onStatus, onToast } = options;

  onProgress?.(0);
  onStatus?.('Initialisation de FFmpeg...');
  
  console.log('Starting FFmpeg video generation:', { carData: carData.title, audioUrl: !!audioUrl });

  try {
    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    
    // Add logging
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
    });
    
    ffmpeg.on('progress', ({ progress }) => {
      if (progress > 0) {
        onProgress?.(70 + (progress * 0.2)); // Map FFmpeg progress to our 70-90% range
      }
    });
    
    // Load FFmpeg with multiple CDN fallbacks and retries
    onStatus?.('Chargement de FFmpeg WebAssembly...');
    console.log('Loading FFmpeg with multiple CDN fallbacks...');
    
    const cdnUrls = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
      'https://cdn.skypack.dev/@ffmpeg/core@0.12.6/dist/esm'
    ];

    let ffmpegLoaded = false;
    let lastError = null;

    for (let i = 0; i < cdnUrls.length && !ffmpegLoaded; i++) {
      const baseURL = cdnUrls[i];
      onStatus?.(`Tentative de chargement FFmpeg depuis CDN ${i + 1}/${cdnUrls.length}...`);
      
      try {
        console.log(`Trying to load FFmpeg from: ${baseURL}`);
        
        // Use timeout for each attempt
        const loadPromise = ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        // Add timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout loading from ${baseURL}`)), 30000)
        );

        await Promise.race([loadPromise, timeoutPromise]);
        ffmpegLoaded = true;
        console.log(`FFmpeg loaded successfully from: ${baseURL}`);
        
      } catch (error) {
        console.warn(`Failed to load FFmpeg from ${baseURL}:`, error);
        lastError = error;
        
        if (i < cdnUrls.length - 1) {
          onStatus?.(`Échec CDN ${i + 1}, essai du suivant...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        }
      }
    }

    if (!ffmpegLoaded) {
      throw new Error(`Impossible de charger FFmpeg depuis tous les CDNs. Dernière erreur: ${lastError?.message}`);
    }
    
    console.log('FFmpeg loaded successfully');
    
    onProgress?.(10);
    onStatus?.('Préparation des images...');

    // Process images - take up to 10 images for the video
    const imagesToUse = carData.images.slice(0, 10);
    const imageDuration = 1.5; // seconds per image
    const totalVideoDuration = imagesToUse.length * imageDuration;

    // Download and process images
    for (let i = 0; i < imagesToUse.length; i++) {
      onStatus?.(`Téléchargement image ${i + 1}/${imagesToUse.length}...`);
      const imageData = await fetchFile(imagesToUse[i]);
      await ffmpeg.writeFile(`image${i}.jpg`, imageData);
      onProgress?.(10 + (i / imagesToUse.length) * 30);
    }

    onStatus?.('Traitement de l\'audio...');
    onProgress?.(40);

    // Handle audio
    let audioCommand = '';
    if (audioUrl) {
      try {
        const audioData = await fetchFile(audioUrl);
        await ffmpeg.writeFile('audio.mp3', audioData);
        audioCommand = '-i audio.mp3';
      } catch (error) {
        console.warn('Failed to load audio, proceeding without:', error);
        onToast?.('Audio non disponible', 'Génération de la vidéo sans audio', 'default');
      }
    }

    onStatus?.('Création des frames vidéo...');
    onProgress?.(50);

    // Create simple video from images with text overlay
    const overlayText = config.overlayText || carData.title;
    const escapedText = overlayText.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    onStatus?.('Assemblage de la vidéo...');
    onProgress?.(70);

    // Build simple FFmpeg command for slideshow
    let command = [];
    
    // Add all images as inputs
    for (let i = 0; i < imagesToUse.length; i++) {
      command.push('-loop', '1', '-t', imageDuration.toString(), '-i', `image${i}.jpg`);
    }
    
    // Add audio if available
    if (audioCommand) {
      command.push('-i', 'audio.mp3');
    }
    
    // Build filter to create slideshow with text
    const videoFilters = imagesToUse.map((_, i) => 
      `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v${i}]`
    ).join(';');
    
    const concatFilter = `${videoFilters};${imagesToUse.map((_, i) => `[v${i}]`).join('')}concat=n=${imagesToUse.length}:v=1:a=0[v]`;
    const textFilter = `[v]drawtext=text='${escapedText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-150[out]`;
    
    command.push(
      '-filter_complex', `${concatFilter};${textFilter}`,
      '-map', '[out]'
    );
    
    if (audioCommand) {
      command.push('-map', `${imagesToUse.length}:a`, '-c:a', 'aac', '-shortest');
    } else {
      command.push('-an');
    }
    
    command.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      'output.mp4'
    );

    // Execute FFmpeg command
    onStatus?.('Génération du fichier MP4...');
    onProgress?.(80);
    
    console.log('Executing FFmpeg command:', command.join(' '));
    await ffmpeg.exec(command);
    console.log('FFmpeg execution completed');

    onStatus?.('Finalisation...');
    onProgress?.(90);

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });

    onProgress?.(100);
    onStatus?.('Terminé !');

    onToast?.('Vidéo MP4 générée !', 'Votre vidéo TikTok/Instagram a été générée avec succès');
    
    return videoBlob;

  } catch (error) {
    console.error('FFmpeg video generation error:', error);
    onToast?.('Erreur de génération', `Impossible de générer la vidéo: ${error.message}`, 'destructive');
    throw error;
  }
}