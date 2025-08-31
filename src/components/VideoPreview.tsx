import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye,
} from "lucide-react";

interface VideoPreviewProps {
  images?: string[];
  overlayText?: string;
  voiceOverText?: string;
  model?: string;
  price?: string;
  audioUrl?: string;
  audioDuration?: number;
  config?: {
    photoEffect?: string;
    textStyle?: string;
    textPosition?: string;
  };
}

export function VideoPreview({ 
  images = [], 
  overlayText = "", 
  voiceOverText = "", 
  model = "", 
  price = "",
  audioUrl,
  audioDuration,
  config
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Use real car data with fallbacks
  const carData = {
    model: model || "Voiture de luxe",
    images: images.length > 0 ? images : ["/placeholder.svg"],
    overlayText: overlayText || "Réservez maintenant",
    voiceOver: voiceOverText || "Découvrez cette magnifique voiture",
    price: price || "Prix sur demande"
  };

  // Calculate timing based on audio duration or fallback
  const totalDuration = audioDuration ? audioDuration * 1000 : Math.max(carData.images.length * 2000, 10000);
  const imageDisplayTime = totalDuration / carData.images.length;

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.muted = isMuted;
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentImageIndex(0);
        setProgress(0);
        setAudioProgress(0);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioUrl, isMuted]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Stop playback
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      if (audioRef.current) audioRef.current.pause();
    } else {
      // Start playback
      setIsPlaying(true);
      setProgress(0);
      setAudioProgress(0);
      setCurrentImageIndex(0);

      // Start audio if available
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }

      // Image cycling
      let imageIndex = 0;
      intervalRef.current = setInterval(() => {
        imageIndex = (imageIndex + 1) % carData.images.length;
        setCurrentImageIndex(imageIndex);
      }, imageDisplayTime);

      // Progress tracking
      const startTime = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(newProgress);
        
        if (audioRef.current && audioDuration) {
          setAudioProgress((audioRef.current.currentTime / audioDuration) * 100);
        }

        if (newProgress >= 100) {
          setIsPlaying(false);
          setCurrentImageIndex(0);
          setProgress(0);
          setAudioProgress(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (progressRef.current) clearInterval(progressRef.current);
        }
      }, 100);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
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
              {/* Current Image with Effects */}
              <div className={`absolute inset-0 transition-all duration-1000 ${
                config?.photoEffect === 'effect-1' ? 'animate-slide-in-right' :
                config?.photoEffect === 'effect-2' ? 'animate-scale-in' :
                config?.photoEffect === 'effect-3' ? 'animate-scale-out' :
                config?.photoEffect === 'effect-4' ? 'animate-fade-in' : ''
              }`}>
                <img 
                  src={carData.images[currentImageIndex]}
                  alt={`${carData.model} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {/* Overlay Text with Configured Style */}
                <div className={`absolute ${config?.textPosition || 'bottom-6'} left-4 right-4`}>
                  {config?.textStyle === 'clean' && (
                    <div className="bg-black/80 rounded-lg p-3 text-center">
                      <h3 className="text-white text-sm font-bold mb-1">{carData.overlayText}</h3>
                      <Badge className="bg-primary text-white text-xs">
                        {carData.price}
                      </Badge>
                    </div>
                  )}
                  
                  {config?.textStyle === 'gradient' && (
                    <div className="bg-gradient-to-t from-black/90 to-transparent rounded-lg p-3 text-center">
                      <h3 className="text-white text-sm font-bold mb-1">{carData.overlayText}</h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs">
                        {carData.price}
                      </Badge>
                    </div>
                  )}
                  
                  {config?.textStyle === 'minimalist' && (
                    <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                      <span className="text-white text-sm font-semibold">
                        {carData.overlayText} • {carData.price}
                      </span>
                    </div>
                  )}
                  
                  {!config?.textStyle && (
                    <div className="bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h3 className="text-white font-bold text-sm mb-1 leading-tight">
                        {carData.overlayText.split(' • ')[0] || carData.model}
                      </h3>
                      <p className="text-white/90 text-xs leading-tight">
                        {carData.overlayText.split(' • ')[1] || "Réservez maintenant"}
                      </p>
                      <div className="mt-1">
                        <Badge variant="secondary" className="bg-primary/90 text-white text-xs">
                          {carData.price}
                        </Badge>
                      </div>
                    </div>
                  )}
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
              {audioUrl && isPlaying && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleMute}
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
              <h4 className="font-medium text-sm">Audio</h4>
              <Badge variant="outline" className="text-xs">
                {audioDuration ? `${Math.ceil(audioDuration)}s` : `${Math.ceil(totalDuration/1000)}s`}
              </Badge>
            </div>
            <div className="p-2 bg-muted/30 rounded-md border border-border/50">
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                "{carData.voiceOver}"
              </p>
            </div>
            {isPlaying && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1" />
                {audioUrl && audioDuration && (
                  <Progress value={audioProgress} className="h-0.5 opacity-60" />
                )}
              </div>
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