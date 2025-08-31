import { supabase } from '@/integrations/supabase/client';

export interface AudioGenerationOptions {
  onProgress?: (progress: number) => void;
  onStatus?: (status: string) => void;
}

export async function generateAudioWithElevenLabs(
  text: string,
  voiceId: string,
  voiceSettings: any,
  apiKey: string,
  options: AudioGenerationOptions = {}
): Promise<{ url: string; duration: number }> {
  const { onProgress, onStatus } = options;

  onProgress?.(0);
  onStatus?.('Génération de l\'audio avec ElevenLabs...');

  try {
    const response = await supabase.functions.invoke('test-voice', {
      body: {
        text,
        voiceId,
        voiceSettings,
        apiKey
      }
    });

    if (response.error) {
      throw new Error(`Erreur ElevenLabs: ${response.error.message}`);
    }

    onProgress?.(50);
    onStatus?.('Traitement de l\'audio...');

    // Convert response to blob and create URL
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Estimate duration (rough calculation)
    const estimatedDuration = Math.max(text.length / 12, 5);
    
    onProgress?.(100);
    onStatus?.('Audio généré avec succès !');

    return {
      url: audioUrl,
      duration: estimatedDuration
    };

  } catch (error) {
    console.error('Audio generation error:', error);
    throw new Error(`Impossible de générer l'audio: ${error.message}`);
  }
}