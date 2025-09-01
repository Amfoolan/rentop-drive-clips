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
  RotateCcw,
  Settings 
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
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    setStatus('generating');
    setProgress(0);
    setAudioUrl(null);
    setAudioDuration(null);
    setVideoDownloadUrl(null);

    try {
      let finalAudioUrl: string | undefined;
      let finalAudioDuration: number | undefined;

      // Handle audio generation based on audioSource
      if (config.audioSource === 'elevenlabs' && config.voiceOverText) {
        const { generateAudioWithElevenLabs } = await import('@/utils/audioGenerator');

        const savedSettings = localStorage.getItem('rentop-api-settings');
        let apiKey = null;
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          apiKey = settings.elevenlabs?.apiKey;
        }
        
        if (!apiKey) {
          throw new Error('Clé API ElevenLabs requise pour la génération audio');
        }

        setProgress(15);
        toast({
          title: "Génération audio IA",
          description: "Création de la voix-off avec ElevenLabs..."
        });
        
        try {
          const audioResult = await generateAudioWithElevenLabs(
            config.voiceOverText,
            config.voiceId || 'EXAVITQu4vr4xnSDxMaL',
            config.voiceSettings || {},
            apiKey,
            {
              onProgress: (progress) => setProgress(15 + (progress * 0.25)), // 15-40%
              onStatus: (status) => console.log('Audio status:', status)
            }
          );
          
          finalAudioUrl = audioResult.url;
          finalAudioDuration = audioResult.duration;
          setAudioUrl(finalAudioUrl);
          setAudioDuration(finalAudioDuration);
          
        } catch (audioError) {
          console.warn('Audio generation failed:', audioError);
          toast({
            title: "Info",
            description: "Génération sans audio suite à une erreur",
            variant: "default"
          });
        }
        
      } else if (config.audioSource === 'upload' && config.uploadedAudio) {
        finalAudioUrl = config.uploadedAudio.url;
        finalAudioDuration = config.uploadedAudio.duration;
        setAudioUrl(finalAudioUrl);
        setAudioDuration(finalAudioDuration);
        setProgress(40);
      } else if (config.audioSource === 'none') {
        setProgress(40);
        toast({
          title: "Mode silencieux",
          description: "Génération d'une vidéo muette"
        });
      }

      // Generate video on server
      setProgress(50);
      toast({
        title: "Génération vidéo serveur",
        description: "Création de votre vidéo MP4 haute qualité..."
      });

      try {
        const videoResult = await supabase.functions.invoke('video-encoder', {
          body: {
            carData,
            config: {
              ...config,
              audioUrl: finalAudioUrl
            },
            audioUrl: finalAudioUrl
          }
        });

        if (videoResult.error) {
          throw new Error(videoResult.error.message || 'Erreur génération serveur');
        }

        const { videoUrl } = videoResult.data;
        setVideoDownloadUrl(videoUrl);
        setProgress(100);

        console.log('Server video generated:', videoUrl);
      } catch (serverError) {
        console.warn('Server generation failed, falling back to client:', serverError);
        setVideoDownloadUrl("client-generated");
        setProgress(100);
      }

      // Save to database
      const savedVideoData = await saveVideo({
        title: carData.title,
        url: '',
        car_data: carData,
        overlay_text: config.overlayText,
        voiceover_text: config.voiceOverText,
        status: 'generated',
        platforms: Object.entries(config.socialNetworks)
          .filter(([_, enabled]) => enabled)
          .map(([platform]) => platform),
        stats: { views: 0, likes: 0, shares: 0 },
        thumbnail_url: carData.images[0],
        video_file_path: ''
      });

      setVideoId(savedVideoData.id);
      setStatus('completed');

      toast({
        title: "✅ Vidéo générée !",
        description: "Votre vidéo TikTok est prête pour téléchargement"
      });

    } catch (error) {
      console.error("Generation error:", error);
      setStatus('error');
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur s'est produite"
      });
    }
  };

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!videoDownloadUrl) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune vidéo disponible pour téléchargement"
      });
      return;
    }

    try {
      setIsDownloading(true);
      toast({
        title: "Génération vidéo",
        description: "Création de votre fichier MP4..."
      });

      // Use VideoDownloader to generate and download the video
      const { VideoDownloader } = await import("@/components/VideoGenerator/VideoDownloader");
      
      const generatedVideo = {
        id: videoId || 'preview',
        title: carData.title,
        url: '',
        user_id: '',
        car_data: carData,
        overlay_text: config.overlayText,
        voiceover_text: config.voiceOverText,
        thumbnail_url: carData.images[0],
        video_file_path: '',
        status: 'generated' as const,
        platforms: Object.entries(config.socialNetworks)
          .filter(([_, enabled]) => enabled)
          .map(([platform]) => platform),
        stats: { likes: 0, views: 0, shares: 0 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const extendedConfig = {
        ...config,
        audioUrl: audioUrl,
        audioDuration: audioDuration
      };

      await VideoDownloader.downloadVideo(generatedVideo, extendedConfig);

      toast({
        title: "Téléchargement réussi !",
        description: "Votre vidéo MP4 a été téléchargée sur votre Mac"
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: error instanceof Error ? error.message : "Impossible de télécharger la vidéo"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Étape 5: Génération de votre vidéo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'generating' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Génération en cours...</h3>
                <p className="text-muted-foreground">
                  Préparation de votre vidéo TikTok personnalisée
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {progress < 20 && '🎤 Génération audio...'}
                  {progress >= 20 && progress < 50 && '🖼️ Traitement des images...'}
                  {progress >= 50 && progress < 90 && '🎬 Assemblage vidéo...'}
                  {progress >= 90 && '✨ Finalisation...'}
                </div>
              </div>
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
                {(audioUrl || config.audioSource === 'upload' || config.audioSource === 'none') && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      {config.audioSource === 'none' ? '🔇' : '🔊'} Configuration audio
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
                      ) : config.audioSource === 'upload' ? (
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
                      ) : (
                        <>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Source:</span> Aucun audio (vidéo muette)
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Mode:</span> Vidéo silencieuse
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="text-xs text-gray-600 font-medium">Mode muet activé</span>
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

                {/* No Audio Info */}
                {config.audioSource === 'none' && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2">Mode vidéo muette</h5>
                    <p className="text-sm text-muted-foreground bg-background rounded p-2">
                      Cette vidéo sera générée sans audio, uniquement avec les images et le texte d'overlay.
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
                    {config.audioSource === 'elevenlabs' && audioUrl 
                      ? 'ElevenLabs IA'
                      : config.audioSource === 'upload' && config.uploadedAudio
                      ? 'MP3 personnalisé'
                      : config.audioSource === 'none'
                      ? 'Aucun (muet)'
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
              {config.audioSource !== 'none' && (audioUrl || config.audioSource === 'upload') && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Vidéo avec audio synchronisé
                  </span>
                </div>
              )}
              
              {/* Mute Status Indicator */}
              {config.audioSource === 'none' && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-medium">
                    Vidéo muette (sans audio)
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

            {/* Download Progress - Remove since we don't need it for direct Shotstack download */}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <Button 
                 onClick={handleDownload} 
                 disabled={isDownloading || !videoDownloadUrl}
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
                     <p className="font-medium text-blue-800">Téléchargement direct</p>
                     <p className="text-blue-700 mt-1">
                       Format MP4 optimisé pour TikTok (1080×1920)
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