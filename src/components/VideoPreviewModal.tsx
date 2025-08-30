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
  const [activeTab, setActiveTab] = useState("visual");

  const playPreview = () => {
    setIsPreviewPlaying(true);
    // Simulate preview duration
    setTimeout(() => {
      setIsPreviewPlaying(false);
    }, 8000); // 8 seconds preview
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

  const mockImages = carData?.images?.slice(0, 4) || [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=600&fit=crop", 
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=600&fit=crop"
  ];

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
                  {mockImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-all duration-2000 ${
                        isPreviewPlaying ? 
                          `${index === 0 ? 'opacity-100' : 'opacity-0'} ${
                            config?.photoEffect === 'effect-1' ? 'animate-slide-in-right' : 
                            config?.photoEffect === 'effect-2' ? 'animate-scale-in' :
                            config?.photoEffect === 'effect-3' ? 'animate-scale-out' :
                            config?.photoEffect === 'effect-4' ? 'animate-fade-in' :
                            config?.photoEffect === 'effect-5' ? 'animate-slide-in-right' : ''
                          }` 
                          : 'opacity-25'
                      }`}
                      style={{
                        animationDelay: `${index * 2}s`,
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Overlay simulation based on text style */}
                      {config?.overlayText && (
                        <div className={`absolute ${config.textPosition || 'bottom-6'} left-4 right-4`}>
                          {config.textStyle === 'clean' && (
                            <div className="bg-black/80 rounded-lg p-3 text-center animate-fade-in">
                              <div className="text-white text-sm font-bold">{config.overlayText}</div>
                              <div className="bg-primary text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                                {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                          
                          {config.textStyle === 'gradient' && (
                            <div className="bg-gradient-to-t from-black/90 to-transparent rounded-lg p-3 text-center animate-fade-in">
                              <div className="text-white text-sm font-bold">{config.overlayText}</div>
                              <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                                {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                          
                          {config.textStyle === 'minimalist' && (
                            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center animate-fade-in">
                              <div className="text-white text-sm font-semibold">
                                {config.overlayText} • {carData?.price || "Prix"}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Preview Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Button 
                      onClick={playPreview}
                      disabled={isPreviewPlaying || !config}
                      variant="hero"
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur"
                    >
                      {isPreviewPlaying ? (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Aperçu en cours...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Aperçu (8s)
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {isPreviewPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div className="h-full bg-primary w-0 animate-[grow_8s_linear_forwards]"></div>
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
                  Durée: ~15-20s
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