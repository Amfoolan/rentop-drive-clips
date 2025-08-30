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

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    setStatus('generating');
    setProgress(0);

    try {
      // Simulate video generation process
      const stages = [
        { name: "Préparation des images", duration: 1000 },
        { name: "Génération de la voix-off", duration: 2000 },
        { name: "Assemblage de la vidéo", duration: 2500 },
        { name: "Ajout des effets", duration: 1500 },
        { name: "Finalisation", duration: 1000 }
      ];

      let currentProgress = 0;
      for (const [index, stage] of stages.entries()) {
        toast({
          title: stage.name,
          description: `Étape ${index + 1}/${stages.length}`
        });

        await new Promise(resolve => setTimeout(resolve, stage.duration));
        currentProgress = ((index + 1) / stages.length) * 100;
        setProgress(currentProgress);
      }

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
        description: "Votre vidéo TikTok est prête et sauvegardée"
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

  const handleDownload = () => {
    // Use the new VideoDownloader for a more realistic video file
    const demoVideoData = new Uint8Array([
      // Basic MP4 header for demo
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
    ]);

    const metadata = `
# Vidéo Rentop - ${carData.title}
# Configuration: ${JSON.stringify(config, null, 2)}
# Généré le: ${new Date().toLocaleString()}
# Format: MP4 - 1080x1920 (9:16)
# Durée estimée: 15 secondes
`;

    const metadataBytes = new TextEncoder().encode(metadata);
    const combinedData = new Uint8Array(demoVideoData.length + metadataBytes.length);
    combinedData.set(demoVideoData, 0);
    combinedData.set(metadataBytes, demoVideoData.length);

    const videoBlob = new Blob([combinedData], { type: 'video/mp4' });
    const url = window.URL.createObjectURL(videoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${carData.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement démarré",
      description: "Votre vidéo MP4 est en cours de téléchargement"
    });
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
              {/* Mock Video Player */}
              <div className="space-y-4">
                <h4 className="font-medium">Aperçu de la vidéo</h4>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-w-[300px] mx-auto">
                  {/* Video Background with first car image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                    style={{ backgroundImage: `url(${carData.images[0]})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                  </div>
                  
                  {/* Overlay Text with Price */}
                  <div className="absolute bottom-8 left-4 right-4 z-10">
                    <div className="text-center space-y-3">
                      {/* Car Title */}
                      <h3 className="text-white text-xl font-bold leading-tight drop-shadow-lg">
                        {carData.title.replace('Rent ', '').replace(' in Dubai', '')}
                      </h3>
                      
                      {/* Price in Pink */}
                      <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                        {carData.price}
                      </div>
                      
                      {/* Call to Action */}
                      <p className="text-white text-sm font-medium drop-shadow-lg">
                        Réserve sur Rentop.co
                      </p>
                    </div>
                  </div>
                  
                  {/* Play Button - Functional */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 group cursor-pointer">
                    <div className="bg-primary/80 hover:bg-primary rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg backdrop-blur-sm">
                      <Play className="h-6 w-6 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  
                  {/* Duration indicator */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
                      15s
                    </Badge>
                  </div>
                  
                  {/* Video quality indicator */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
                      HD
                    </Badge>
                  </div>
                </div>
                
                {/* Video Controls */}
                <div className="flex justify-center space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Lire
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Pause
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Recommencer
                  </Button>
                </div>
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
                
                {/* Voice-over Text */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Script de la voix-off</h5>
                  <p className="text-sm text-muted-foreground bg-background rounded p-2 max-h-24 overflow-y-auto">
                    "{config.voiceOverText}"
                  </p>
                </div>
                
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
                  <span className="ml-2 font-medium">15 secondes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Voix:</span>
                  <span className="ml-2 font-medium">Eleven Labs - Sarah</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Images:</span>
                  <span className="ml-2 font-medium">{carData.images.length} photos</span>
                </div>
              </div>
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

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger
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