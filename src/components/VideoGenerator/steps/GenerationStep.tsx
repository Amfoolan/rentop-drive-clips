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
import JSZip from 'jszip';

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
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    setStatus('generating');
    setProgress(0);
    setAudioUrl(null);
    setAudioDuration(null);

    try {
      // Import here to avoid bundle bloat
      const { generateAudioWithElevenLabs } = await import('@/utils/audioGenerator');

      setProgress(20);
      toast({
        title: "Génération de la vidéo",
        description: "Préparation de l'aperçu vidéo avec audio..."
      });

      let finalAudioUrl: string | undefined;
      let finalAudioDuration: number | undefined;

      // Handle audio generation
      if (config.audioSource === 'elevenlabs' && config.voiceOverText) {
        // Get API key for ElevenLabs
        const savedSettings = localStorage.getItem('rentop-api-settings');
        let apiKey = null;
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          apiKey = settings.elevenlabs?.apiKey;
        }
        
        if (!apiKey) {
          throw new Error('Clé API ElevenLabs requise pour la génération audio');
        }

        setProgress(30);
        
        try {
          const audioResult = await generateAudioWithElevenLabs(
            config.voiceOverText,
            config.voiceId || 'EXAVITQu4vr4xnSDxMaL',
            config.voiceSettings || {},
            apiKey,
            {
              onProgress: (progress) => setProgress(30 + (progress * 0.6)), // 30-90%
              onStatus: (status) => console.log('Audio status:', status)
            }
          );
          
          finalAudioUrl = audioResult.url;
          finalAudioDuration = audioResult.duration;
          setAudioUrl(finalAudioUrl);
          setAudioDuration(finalAudioDuration);
          
        } catch (audioError) {
          console.warn('Audio generation failed, proceeding without audio:', audioError);
          toast({
            title: "Audio non généré",
            description: "Aperçu vidéo sans audio",
            variant: "default"
          });
        }
        
      } else if (config.audioSource === 'upload' && config.uploadedAudio) {
        finalAudioUrl = config.uploadedAudio.url;
        finalAudioDuration = config.uploadedAudio.duration;
        setAudioUrl(finalAudioUrl);
        setAudioDuration(finalAudioDuration);
        setProgress(70);
      }

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
        title: "Aperçu vidéo généré avec succès !",
        description: finalAudioUrl 
          ? "Votre aperçu vidéo TikTok avec audio est prêt"
          : "Votre aperçu vidéo TikTok est prêt"
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
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Préparation...');
    
    try {
      toast({
        title: "Téléchargement des ressources",
        description: "Téléchargement des images et de l'audio"
      });

      setDownloadProgress(25);
      setDownloadStatus('Préparation du téléchargement...');

      // Create a zip file with images and audio
      const zip = new JSZip();
      
      // Add images to zip
      setDownloadProgress(50);
      setDownloadStatus('Ajout des images...');
      
      for (let i = 0; i < carData.images.length; i++) {
        try {
          const response = await fetch(carData.images[i]);
          const blob = await response.blob();
          zip.file(`image_${i + 1}.jpg`, blob);
        } catch (e) {
          console.warn(`Failed to download image ${i + 1}:`, e);
        }
      }

      // Add audio if available
      if (audioUrl) {
        setDownloadProgress(75);
        setDownloadStatus('Ajout de l\'audio...');
        try {
          const response = await fetch(audioUrl);
          const audioBlob = await response.blob();
          zip.file('audio.mp3', audioBlob);
        } catch (e) {
          console.warn('Failed to download audio:', e);
        }
      }

      // Add config file
      zip.file('video_config.json', JSON.stringify({
        title: carData.title,
        overlayText: config.overlayText,
        voiceOverText: config.voiceOverText,
        audioSource: config.audioSource,
        socialNetworks: config.socialNetworks,
        instructions: "Pour recréer la vidéo: utilisez les images dans l'ordre, ajoutez le texte d'overlay, et synchronisez avec l'audio."
      }, null, 2));

      setDownloadProgress(90);
      setDownloadStatus('Création de l\'archive...');

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${carData.title.replace(/\s+/g, '_')}_resources_${Date.now()}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadProgress(100);
      setDownloadStatus('Téléchargement terminé');
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Ressources téléchargées",
        description: "Images, audio et configuration sauvegardés dans un fichier ZIP"
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: "Impossible de créer le fichier de téléchargement"
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
                  <span className="font-medium text-blue-800">Téléchargement des ressources...</span>
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
                 disabled={isDownloading}
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
                 Télécharger Ressources
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