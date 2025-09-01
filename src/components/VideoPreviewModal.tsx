import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Eye, Download, Sparkles } from "lucide-react";

interface VideoPreviewModalProps {
  carData?: {
    title: string;
    price: string;
    location: string;
    images: string[];
  };
  config?: {
    overlayText: string;
    voiceOverText: string;
    audioSource: 'elevenlabs' | 'upload' | 'none';
    uploadedAudio?: {
      file: File;
      duration: number;
      url: string;
    };
    textStyle: string;
    photoEffect: string;
    textPosition?: string;
    voiceId: string;
    voiceSettings: {
      stability: number;
      similarity_boost: number;
      speed: number;
    };
  };
}

export function VideoPreviewModal({ carData, config }: VideoPreviewModalProps) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("visual");

  const playPreview = () => {
    if (isPreviewPlaying) return;
    
    setIsPreviewPlaying(true);
    setCurrentImageIndex(0);
    
    // Calculate total duration and image timing based on audio
    let totalDuration = 15000; // Default 15 seconds
    if (config?.audioSource === 'upload' && config.uploadedAudio) {
      totalDuration = config.uploadedAudio.duration * 1000; // Convert to milliseconds
    }
    
    // Calculate how long each image should be shown
    const imageDisplayTime = Math.max(1000, totalDuration / previewImages.length); // Minimum 1 second per image
    
    // Create repeated image sequence if needed
    const imagesNeeded = Math.ceil(totalDuration / imageDisplayTime);
    const repeatedImages = [];
    for (let i = 0; i < imagesNeeded; i++) {
      repeatedImages.push(previewImages[i % previewImages.length]);
    }
    
    let currentImageIdx = 0;
    
    // Cycle through images
    const imageInterval = setInterval(() => {
      currentImageIdx++;
      setCurrentImageIndex(currentImageIdx);
      
      if (currentImageIdx >= repeatedImages.length - 1) {
        clearInterval(imageInterval);
        setTimeout(() => {
          setIsPreviewPlaying(false);
          setCurrentImageIndex(0);
        }, 500);
      }
    }, imageDisplayTime);

    // Stop after total duration
    setTimeout(() => {
      clearInterval(imageInterval);
      setIsPreviewPlaying(false);
      setCurrentImageIndex(0);
    }, totalDuration + 500);
  };

  const getEffectName = (effect: string) => {
    switch(effect) {
      case 'effect-1': return 'Effet 1 - Panoramique G→D';
      case 'effect-2': return 'Effet 2 - Zoom In';  
      case 'effect-3': return 'Effet 3 - Zoom Out';
      case 'effect-4': return 'Effet 4 - Fondu';
      case 'effect-5': return 'Effet 5 - Glissement';
      default: return 'Aucun effet sélectionné';
    }
  };

  const getTextStyleName = (style: string) => {
    switch(style) {
      case 'clean': return 'Style Clean';
      case 'gradient': return 'Style Gradient';
      case 'minimalist': return 'Style Minimalist';
      default: return 'Aucun style sélectionné';
    }
  };

  const previewImages = carData?.images && carData.images.length > 0 
    ? carData.images 
    : ["/placeholder.svg"];

  return (
    <Card className="glass-card border-0 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Aperçu vidéo avec effets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Aperçu visuel</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            {/* Video Preview Container */}
            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden border-2 border-primary/20">
              {/* Simulated phone frame */}
              <div className="absolute inset-2 bg-gradient-to-b from-slate-900 to-black rounded-lg overflow-hidden">
                
                {/* Preview Images Grid with Effects */}
                <div className="relative w-full h-full">
                  {previewImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        isPreviewPlaying ? 
                          `${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${
                            index === currentImageIndex && config?.photoEffect === 'effect-1' ? 'animate-slide-in-right' : 
                            index === currentImageIndex && config?.photoEffect === 'effect-2' ? 'animate-scale-in' :
                            index === currentImageIndex && config?.photoEffect === 'effect-3' ? 'animate-scale-out' :
                            index === currentImageIndex && config?.photoEffect === 'effect-4' ? 'animate-fade-in' :
                            index === currentImageIndex && config?.photoEffect === 'effect-5' ? 'animate-slide-in-right' : ''
                          }` 
                          : index === 0 ? 'opacity-50' : 'opacity-25'
                      }`}
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Overlay simulation based on text style */}
                      {config?.overlayText && (
                        <div className={`absolute ${config.textPosition || 'bottom-6'} left-4 right-4 ${
                          index === currentImageIndex ? 'animate-fade-in' : ''
                        }`}>
                          {config.textStyle === 'clean' && (
                            <div className="bg-black/80 rounded-lg p-3 text-center">
                              <div className="text-white text-sm font-bold">{config.overlayText}</div>
                              <div className="bg-primary text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                                {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                          
                          {config.textStyle === 'gradient' && (
                            <div className="bg-gradient-to-t from-black/90 to-transparent rounded-lg p-3 text-center">
                              <div className="text-white text-sm font-bold">{config.overlayText}</div>
                              <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                                {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                          
                          {config.textStyle === 'minimalist' && (
                            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                              <div className="text-white text-sm font-semibold">
                                {config.overlayText} • {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Image Progress Indicators */}
                   <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                     {previewImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          index < currentImageIndex 
                            ? 'bg-white' 
                            : index === currentImageIndex && isPreviewPlaying
                              ? 'bg-white animate-grow' 
                              : 'bg-white/30'
                        }`}
                      />
                    ))}
                   </div>

                   {/* Preview Controls Overlay */}
                   {!isPreviewPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
                        <Button 
                          onClick={playPreview}
                          disabled={!config}
                          variant="hero"
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 backdrop-blur"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Aperçu ({config?.audioSource === 'upload' && config.uploadedAudio ? Math.ceil(config.uploadedAudio.duration) : previewImages.length * 2}s)
                        </Button>
                     </div>
                   )}

                   {/* Current Image Indicator */}
                   {isPreviewPlaying && (
                     <div className="absolute bottom-4 left-4 bg-black/50 rounded px-2 py-1 z-20">
                        <span className="text-white text-xs">
                          {currentImageIndex + 1}/{previewImages.length}
                        </span>
                     </div>
                   )}
                 </div>

                {/* TikTok-like UI Elements */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="text-white text-xs bg-black/50 rounded-full px-2 py-1">
                    {carData?.location || "Dubai"}
                  </div>
                  <div className="text-white text-xs bg-black/50 rounded-full px-2 py-1">
                    Live
                  </div>
                </div>
                
                {/* Right side buttons (TikTok style) */}
                <div className="absolute right-3 bottom-20 space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Format TikTok 9:16
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Durée: ~{config?.audioSource === 'upload' && config.uploadedAudio ? Math.ceil(config.uploadedAudio.duration) : previewImages.length * 2}s
                </Badge>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium">Configuration actuelle:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• Style: {config ? getTextStyleName(config.textStyle) : "Non configuré"}</div>
                  <div>• Animation: {config ? getEffectName(config.photoEffect) : "Non configuré"}</div>
                  <div>• Position: {config?.textPosition || "Non configuré"}</div>
                  <div>• Voix: {config?.voiceId ? "Configurée" : "Non configurée"}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <h4 className="font-medium text-primary mb-2">Texte d'overlay</h4>
                <p className="text-sm">
                  {config?.overlayText || "Aucun texte configuré"}
                </p>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h4 className="font-medium text-accent mb-2">Script voix-off</h4>
                <p className="text-sm">
                  {config?.voiceOverText || "Aucun script configuré"}
                </p>
              </div>

              <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                <h4 className="font-medium text-secondary mb-2">Paramètres vidéo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Style overlay:</span>
                    <span>{config ? getTextStyleName(config.textStyle) : "Non défini"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effet animation:</span>
                    <span>{config ? getEffectName(config.photoEffect) : "Non défini"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position texte:</span>
                    <span className="capitalize">{config?.textPosition?.replace('-', ' ') || "Non défini"}</span>
                  </div>
                </div>
              </div>

              {config?.voiceSettings && (
                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Paramètres voix</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Stabilité:</span>
                      <span>{Math.round(config.voiceSettings.stability * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Similarité:</span>
                      <span>{Math.round(config.voiceSettings.similarity_boost * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vitesse:</span>
                      <span>{config.voiceSettings.speed}x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <Button 
            variant="generate" 
            className="w-full"
            disabled={!config?.overlayText || !config?.voiceOverText}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Générer la vidéo finale
          </Button>
          
          {(!config?.overlayText || !config?.voiceOverText) && (
            <p className="text-xs text-muted-foreground text-center">
              Configurez d'abord les textes dans l'onglet Configuration
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* Animation keyframes for the grow effect */
// Add to global CSS or use Tailwind animation
const growKeyframes = `
  @keyframes grow {
    from { width: 0%; }
    to { width: 100%; }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = growKeyframes;
  document.head.appendChild(style);
}