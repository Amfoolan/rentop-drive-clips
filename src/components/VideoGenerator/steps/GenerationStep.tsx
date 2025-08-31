import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Download, 
  Share2, 
  CheckCircle, 
  Loader2,
  RotateCcw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeneratedVideos } from "@/hooks/useGeneratedVideos";
import { CarData, VideoConfig } from "../StepByStepGenerator";
import { supabase } from "@/integrations/supabase/client";
import { VideoPreview } from "@/components/VideoPreview";

interface GenerationStepProps {
  carData: CarData;
  config: VideoConfig;
  onComplete: () => void;
}

export function GenerationStep({ carData, config, onComplete }: GenerationStepProps) {
  const { toast } = useToast();
  const { saveVideo } = useGeneratedVideos();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'generating' | 'completed' | 'error'>('generating');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    setStatus('generating');
    setProgress(0);
    setAudioUrl(null);
    setAudioDuration(null);
    setGeneratedVideoBlob(null);

    try {
      // Step 1: Generate audio if needed
      setProgress(20);
      toast({
        title: "Génération de l'audio",
        description: "Préparation de la voix-off..."
      });

      let audioDataForVideo = null;
      
      if (config.audioSource === 'elevenlabs' && config.voiceOverText) {
        const savedSettings = localStorage.getItem('rentop-api-settings');
        let apiKey = null;
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          apiKey = settings.elevenlabs?.apiKey;
        }

        const audioResponse = await supabase.functions.invoke('test-voice', {
          body: {
            voiceId: config.voiceId,
            text: config.voiceOverText,
            voiceSettings: config.voiceSettings,
            apiKey: apiKey
          }
        });

        if (audioResponse.error) {
          console.warn('Audio generation failed:', audioResponse.error);
          toast({
            variant: "destructive",
            title: "Avertissement audio",
            description: "La génération audio a échoué, la vidéo sera créée sans son"
          });
        } else if (audioResponse.data) {
          const blob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);
          setAudioUrl(audioUrl);
          
          const estimatedDuration = Math.max(config.voiceOverText.length / 12, 5);
          setAudioDuration(estimatedDuration);
          
          // Convert blob to base64 for the edge function
          const arrayBuffer = await blob.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          audioDataForVideo = base64Audio;
        }
      } else if (config.audioSource === 'upload' && config.uploadedAudio) {
        setAudioUrl(config.uploadedAudio.url);
        setAudioDuration(config.uploadedAudio.duration);
        
        // Convert uploaded audio to base64
        const response = await fetch(config.uploadedAudio.url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        audioDataForVideo = base64Audio;
      }

      // Step 2: Generate video with real edge function
      setProgress(40);
      toast({
        title: "Génération de la vidéo",
        description: "Création de la vidéo MP4 avec FFmpeg..."
      });

      const videoResponse = await supabase.functions.invoke('generate-video', {
        body: {
          carData: {
            images: carData.images,
            title: carData.title,
            price: carData.price,
            location: carData.location
          },
          config: {
            overlayText: config.overlayText,
            voiceSettings: config.voiceSettings,
            socialNetworks: config.socialNetworks,
            photoEffect: config.photoEffect,
            textStyle: config.textStyle,
            textPosition: config.textPosition,
            audioData: audioDataForVideo // Send audio data if available
          }
        }
      });

      setProgress(80);

      if (videoResponse.error) {
        throw new Error(`Erreur génération vidéo: ${videoResponse.error.message || 'Erreur inconnue'}`);
      }

      if (!videoResponse.data) {
        throw new Error('Aucune donnée vidéo reçue');
      }

      // Convert base64 video data to blob
      const videoBlob = new Blob([videoResponse.data], { type: 'video/mp4' });
      setGeneratedVideoBlob(videoBlob);

      setProgress(100);

      // Save to database
      const videoData = await saveVideo({
        title: carData.title,
        url: window.location.href,
        car_data: carData,
        overlay_text: config.overlayText,
        voiceover_text: config.voiceOverText,
        status: 'generated',
        platforms: Object.entries(config.socialNetworks)
          .filter(([_, enabled]) => enabled)
          .map(([platform]) => platform),
        stats: { views: 0, likes: 0, shares: 0 },
        thumbnail_url: carData.images[0],
        video_file_path: `videos/generated_${Date.now()}.mp4`
      });

      setVideoId(videoData.id);
      setStatus('completed');

      toast({
        title: "Vidéo générée avec succès !",
        description: audioUrl 
          ? "Votre vidéo TikTok avec audio est prête et sauvegardée"
          : "Votre vidéo TikTok est prête et sauvegardée"
      });

    } catch (error) {
      console.error("Generation error:", error);
      setStatus('error');
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Une erreur s'est produite lors de la génération"
      });
    }
  };

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading || !generatedVideoBlob) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Préparation du téléchargement...');
    
    try {
      toast({
        title: "Téléchargement démarré",
        description: "Téléchargement de votre vidéo MP4"
      });

      // Create download link for the generated video
      const url = URL.createObjectURL(generatedVideoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${carData.title.replace(/\s+/g, '_')}_${Date.now()}.mp4`;
      
      setDownloadProgress(50);
      setDownloadStatus('Téléchargement en cours...');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadProgress(100);
      setDownloadStatus('Téléchargement terminé');
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement réussi",
        description: "Votre vidéo MP4 a été téléchargée avec succès"
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: `Problème: ${error.message || 'Erreur inconnue'}`
      });
    } finally {
      setIsDownloading(false);
      setDownloadStatus('');
      setDownloadProgress(0);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Étape 4: Génération de votre vidéo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'generating' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Génération en cours...</h3>
              <p className="text-muted-foreground">
                Votre vidéo TikTok est en cours de création avec IA
              </p>
            </div>
            
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% terminé
            </p>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-primary">Vidéo générée avec succès !</h3>
                <p className="text-muted-foreground">
                  Votre vidéo TikTok est prête et a été sauvegardée
                </p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Video Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Aperçu interactif de la vidéo</h4>
                <VideoPreview
                  images={carData.images}
                  overlayText={config.overlayText}
                  voiceOverText={config.voiceOverText}
                  model={carData.title.replace('Rent ', '').replace(' in UAE in Dubai', '')}
                  price={carData.price}
                  audioUrl={audioUrl}
                  audioDuration={audioDuration}
                  config={{
                    photoEffect: config.photoEffect,
                    textStyle: config.textStyle,
                    textPosition: config.textPosition
                  }}
                />
              </div>

              {/* Video Configuration Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Configuration de la vidéo</h4>
                
                {/* Overlay Text */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Texte d'overlay</h5>
                  <p className="text-sm text-muted-foreground bg-background rounded p-2">
                    "{config.overlayText}"
                  </p>
                </div>
                
                {/* Audio Configuration */}
                {(audioUrl || config.audioSource === 'upload') && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      🔊 Configuration audio
                    </h5>
                    <div className="space-y-2 text-sm">
                      {config.audioSource === 'elevenlabs' ? (
                        <>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Source:</span> ElevenLabs (IA)
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Voix:</span> {config.voiceId === 'EXAVITQu4vr4xnSDxMaL' ? 'Sarah' : 'Voix sélectionnée'}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Durée estimée:</span> {audioDuration ? `${Math.ceil(audioDuration)}s` : 'Calculée automatiquement'}
                          </p>
                          {audioUrl && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">Audio généré avec succès</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Source:</span> Fichier uploadé
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Fichier:</span> {config.uploadedAudio?.file.name || 'Fichier MP3'}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Durée:</span> {audioDuration ? `${Math.ceil(audioDuration)}s` : 'Non définie'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-medium">Fichier audio prêt</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Voice-over Text (only for ElevenLabs) */}
                {config.audioSource === 'elevenlabs' && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2">Script de la voix-off</h5>
                    <p className="text-sm text-muted-foreground bg-background rounded p-2 max-h-24 overflow-y-auto">
                      "{config.voiceOverText}"
                    </p>
                  </div>
                )}
                
                {/* Images Used */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Images utilisées ({carData.images.length})</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {carData.images.slice(0, 8).map((image, index) => (
                      <div 
                        key={index}
                        className="aspect-square bg-cover bg-center rounded border-2 border-primary/20"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    ))}
                    {carData.images.length > 8 && (
                      <div className="aspect-square bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{carData.images.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Détails techniques</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <span className="ml-2 font-medium">MP4 - 1080x1920 (9:16)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="ml-2 font-medium">{audioDuration ? `${Math.ceil(audioDuration)}s` : '15s'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Audio:</span>
                  <span className="ml-2 font-medium">
                    {audioUrl || config.audioSource === 'upload' 
                      ? (config.audioSource === 'elevenlabs' ? 'ElevenLabs IA' : 'MP3 personnalisé')
                      : 'Aucun'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Images:</span>
                  <span className="ml-2 font-medium">{carData.images.length} photos</span>
                </div>
              </div>
              
              {/* Audio Status Indicator */}
              {(audioUrl || config.audioSource === 'upload') && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Vidéo avec audio synchronisé
                  </span>
                </div>
              )}
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <h4 className="font-medium">Plateformes configurées</h4>
              <div className="flex gap-2">
                {Object.entries(config.socialNetworks)
                  .filter(([_, enabled]) => enabled)
                  .map(([platform]) => (
                    <Badge key={platform} variant="secondary" className="capitalize">
                      {platform}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Download Progress */}
            {isDownloading && (
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-800">Génération MP4 en cours...</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
                <p className="text-sm text-blue-700">
                  {downloadStatus} - {Math.round(downloadProgress)}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <Button 
                 onClick={handleDownload} 
                 disabled={isDownloading || !generatedVideoBlob}
                 className="flex items-center gap-2" 
                 size="lg"
               >
                 {isDownloading ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Téléchargement...
                   </>
                 ) : (
                   <>
                     <Download className="h-4 w-4" />
                     Télécharger MP4
                   </>
                 )}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
              <Button variant="secondary" onClick={onComplete} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Nouvelle vidéo
              </Button>
            </div>

              {/* Download Info */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Download className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Format de téléchargement</p>
                    <p className="text-blue-700 mt-1">
                      MP4 1080x1920 (9:16) - Compatible TikTok, Instagram Reels, YouTube Shorts
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      • Audio : {config.audioSource === 'elevenlabs' ? 'ElevenLabs IA ✓' : config.audioSource === 'upload' ? 'Audio personnalisé ✓' : 'Aucun ✗'}
                      • Effets visuels ✓ 
                      • Texte overlay ✓
                    </p>
                  </div>
                </div>
              </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-destructive">
              <h3 className="text-lg font-semibold">Erreur de génération</h3>
              <p className="text-sm text-muted-foreground">
                Une erreur s'est produite lors de la génération de votre vidéo
              </p>
            </div>
            <Button onClick={generateVideo} variant="outline">
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}