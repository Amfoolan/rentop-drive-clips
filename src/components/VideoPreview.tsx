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
      setProgress(0);
      setCurrentImageIndex(0);
      // Simulate video playback with image cycling
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          const next = (prev + 1) % carData.images.length;
          return next;
        });
        setProgress(prev => {
          const newProgress = prev + (100 / carData.images.length);
          if (newProgress >= 100) {
            setIsPlaying(false);
            setCurrentImageIndex(0);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return newProgress;
        });
      }, 1500); // Change image every 1.5 seconds
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu vidéo
            </div>
            <Badge variant="secondary" className="text-xs">9:16</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Preview Container - Responsive */}
          <div className="relative">
            <div className="aspect-[9/16] bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden relative border border-border/50">
              {/* Current Image */}
              <div className="absolute inset-0">
                <img 
                  src={carData.images[currentImageIndex]}
                  alt={`${carData.model} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <h3 className="text-white font-bold text-sm mb-1 leading-tight">
                    {carData.overlayText.split(' • ')[0]}
                  </h3>
                  <p className="text-white/90 text-xs leading-tight">
                    {carData.overlayText.split(' • ')[1]}
                  </p>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-primary/90 text-white text-xs">
                      {carData.price}
                    </Badge>
                  </div>
                </div>

                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handlePlayPause}
                    className="rounded-full w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5 text-white" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="absolute top-2 left-2 right-2 flex gap-0.5">
                {carData.images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                      index < currentImageIndex 
                        ? 'bg-white' 
                        : index === currentImageIndex && isPlaying
                          ? 'bg-white/70' 
                          : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Sound Control */}
              {isPlaying && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full w-6 h-6 bg-black/30 backdrop-blur-sm border border-white/30 hover:bg-black/50 p-0"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3 w-3 text-white" />
                    ) : (
                      <Volume2 className="h-3 w-3 text-white" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Audio Preview - Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Voix-off</h4>
              <Badge variant="outline" className="text-xs">
                {Math.ceil(carData.voiceOver.length / 12)}s
              </Badge>
            </div>
            <div className="p-2 bg-muted/30 rounded-md border border-border/50">
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                "{carData.voiceOver}"
              </p>
            </div>
            {isPlaying && (
              <Progress value={progress} className="h-1" />
            )}
          </div>

          {/* Video Specs - Compact Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-3">
            <div>
              <p className="text-muted-foreground">Format</p>
              <p className="font-medium">1080x1920</p>
            </div>
            <div>
              <p className="text-muted-foreground">Images</p>
              <p className="font-medium">{carData.images.length} photos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}