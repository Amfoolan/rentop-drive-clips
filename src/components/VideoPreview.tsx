import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download,
  Share2,
  Eye,
  Settings
} from "lucide-react";

const defaultCarData = {
  model: "Porsche 911 GT3 RS",
  images: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=600&fit=crop", 
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=600&fit=crop"
  ],
  overlayText: "Porsche 911 GT3 RS • Réserve sur Rentop.co",
  voiceOver: "Découvre la Porsche 911 GT3 RS disponible à Paris. Réserve maintenant sur Rentop.co !",
  price: "280€/jour"
};

interface VideoPreviewProps {
  images?: string[];
  overlayText?: string;
  voiceOverText?: string;
  model?: string;
  price?: string;
}

export function VideoPreview({ 
  images, 
  overlayText, 
  voiceOverText, 
  model, 
  price 
}: VideoPreviewProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use provided props or fallback to defaults
  const carData = {
    model: model || defaultCarData.model,
    images: images || defaultCarData.images,
    overlayText: overlayText || defaultCarData.overlayText,
    voiceOver: voiceOverText || defaultCarData.voiceOver,
    price: price || defaultCarData.price
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setIsPlaying(true);
      // Simulate video playback with image cycling
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % carData.images.length);
        setProgress(prev => {
          const newProgress = prev + 2; // 2% per interval
          if (newProgress >= 100) {
            setIsPlaying(false);
            setCurrentImageIndex(0);
            return 0;
          }
          return newProgress;
        });
      }, 1000); // Change image every second
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prévisualisation vidéo
          </div>
          <Badge variant="secondary">9:16 - TikTok</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Preview Container */}
        <div className="relative">
          <div className="video-preview bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden relative">
            {/* Current Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={carData.images[currentImageIndex]}
                alt={`${carData.model} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-xl mb-2">
                  {carData.overlayText.split(' • ')[0]}
                </h3>
                <p className="text-white/90 text-sm">
                  {carData.overlayText.split(' • ')[1]}
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-accent text-white">
                    {carData.price}
                  </Badge>
                </div>
              </div>

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    variant="glass"
                    size="xl"
                    onClick={handlePlayPause}
                    className="rounded-full w-20 h-20"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Progress Indicators */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {carData.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index < currentImageIndex 
                      ? 'bg-white' 
                      : index === currentImageIndex 
                        ? 'bg-white/70' 
                        : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            {isPlaying && (
              <div className="absolute bottom-20 right-4 flex flex-col gap-2">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={handlePlayPause}
                  className="rounded-full"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Audio Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Audio Voice-over</h4>
            <Button variant="outline" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Écouter
            </Button>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground italic">
              "{carData.voiceOver}"
            </p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="generate" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Video Specs */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-sm text-muted-foreground">Format</p>
            <p className="font-medium">9:16 - 1080x1920</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Durée</p>
            <p className="font-medium">15 secondes</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Images</p>
            <p className="font-medium">{carData.images.length} photos</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Voix</p>
            <p className="font-medium">ElevenLabs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}