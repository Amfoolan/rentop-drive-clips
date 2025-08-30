import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Mic, Share2 } from "lucide-react";
import { CarData, VideoConfig } from "../StepByStepGenerator";
import { VoiceSettings } from "../config/VoiceSettings";
import { SocialNetworkSettings } from "../config/SocialNetworkSettings";

interface ConfigurationStepProps {
  carData: CarData;
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
  onNext: () => void;
}

export function ConfigurationStep({ carData, config, onConfigChange, onNext }: ConfigurationStepProps) {
  const updateConfig = (updates: Partial<VideoConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Étape 3: Configuration de votre vidéo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Textes</TabsTrigger>
            <TabsTrigger value="voice">Voix</TabsTrigger>
            <TabsTrigger value="social">Réseaux</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="overlay">Texte d'overlay (affiché sur la vidéo)</Label>
                <Input
                  id="overlay"
                  value={config.overlayText}
                  onChange={(e) => updateConfig({ overlayText: e.target.value })}
                  placeholder="Ex: Lamborghini Huracan • Réserve sur Rentop.co"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Ce texte sera superposé sur votre vidéo TikTok
                </p>
              </div>

              {/* Overlay Design Options */}
              <div className="space-y-3">
                <Label>Style du texte overlay</Label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Style Option 1 - Clean */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.textStyle === 'clean' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ textStyle: 'clean' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Clean</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        config.textStyle === 'clean' ? 'border-primary bg-primary' : 'border-muted'
                      }`}></div>
                    </div>
                    <div className="bg-black/80 rounded p-3 text-center">
                      <div className="text-white text-sm font-bold">AUDI Q8 S Line Kit (2021) White</div>
                      <div className="text-white text-xs mt-1">Réserve sur Rentop.co</div>
                      <div className="bg-primary text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                        699 AED/jour
                      </div>
                    </div>
                  </div>

                  {/* Style Option 2 - Gradient */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.textStyle === 'gradient' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ textStyle: 'gradient' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Gradient</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        config.textStyle === 'gradient' ? 'border-primary bg-primary' : 'border-muted'
                      }`}></div>
                    </div>
                    <div className="bg-gradient-to-t from-black/90 to-transparent rounded p-3 text-center">
                      <div className="text-white text-sm font-bold">AUDI Q8 S Line Kit (2021) White</div>
                      <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                        699 AED/jour
                      </div>
                    </div>
                  </div>

                  {/* Style Option 3 - Minimalist */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.textStyle === 'minimalist' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ textStyle: 'minimalist' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Minimalist</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        config.textStyle === 'minimalist' ? 'border-primary bg-primary' : 'border-muted'
                      }`}></div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded p-3 text-center">
                      <div className="text-white text-sm font-semibold">AUDI Q8 • 699 AED/jour</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Effects */}
              <div className="space-y-4">
                <Label>Effets d'animation vidéo</Label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Effet 1 - Pan Left Right */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.photoEffect === 'effect-1' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ photoEffect: 'effect-1' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Effet 1</span>
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          config.photoEffect === 'effect-1' ? 'border-primary bg-primary' : 'border-muted'
                        }`}></div>
                      </div>
                      <Badge variant="outline" className="text-xs">Panoramique</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Mouvement de gauche à droite pour révéler progressivement la voiture</p>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="w-full h-2 bg-gradient-to-r from-muted via-primary/20 to-muted rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Effet 2 - Zoom In */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.photoEffect === 'effect-2' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ photoEffect: 'effect-2' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Effet 2</span>
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          config.photoEffect === 'effect-2' ? 'border-primary bg-primary' : 'border-muted'
                        }`}></div>
                      </div>
                      <Badge variant="outline" className="text-xs">Zoom In</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Zoom progressif vers l'intérieur pour créer un effet dramatique</p>
                    <div className="bg-muted/50 rounded p-2 flex justify-center">
                      <div className="w-4 h-4 border-2 border-primary rounded animate-ping"></div>
                    </div>
                  </div>

                  {/* Effet 3 - Zoom Out */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.photoEffect === 'effect-3' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ photoEffect: 'effect-3' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Effet 3</span>
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          config.photoEffect === 'effect-3' ? 'border-primary bg-primary' : 'border-muted'
                        }`}></div>
                      </div>
                      <Badge variant="outline" className="text-xs">Zoom Out</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Zoom arrière révélant progressivement l'environnement</p>
                    <div className="bg-muted/50 rounded p-2 flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Effet 4 - Fade Transition */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.photoEffect === 'effect-4' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ photoEffect: 'effect-4' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Effet 4</span>
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          config.photoEffect === 'effect-4' ? 'border-primary bg-primary' : 'border-muted'
                        }`}></div>
                      </div>
                      <Badge variant="outline" className="text-xs">Fondu</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Transitions fluides en fondu entre les images</p>
                    <div className="bg-muted/50 rounded p-2 flex gap-1">
                      <div className="w-3 h-3 bg-primary rounded animate-fade-in"></div>
                      <div className="w-3 h-3 bg-primary/50 rounded animate-fade-in" style={{animationDelay: '0.3s'}}></div>
                      <div className="w-3 h-3 bg-primary/25 rounded animate-fade-in" style={{animationDelay: '0.6s'}}></div>
                    </div>
                  </div>

                  {/* Effet 5 - Slide Up */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      config.photoEffect === 'effect-5' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => updateConfig({ photoEffect: 'effect-5' })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Effet 5</span>
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          config.photoEffect === 'effect-5' ? 'border-primary bg-primary' : 'border-muted'
                        }`}></div>
                      </div>
                      <Badge variant="outline" className="text-xs">Glissement</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Glissement vertical dynamique des images</p>
                    <div className="bg-muted/50 rounded p-2 overflow-hidden relative h-6">
                      <div className="w-full h-2 bg-primary rounded animate-slide-in-right"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Position Options */}
              <div className="space-y-3">
                <Label>Position du texte</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={config.textPosition === 'bottom-6' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateConfig({ textPosition: 'bottom-6' })}
                    className="text-xs"
                  >
                    Bas
                  </Button>
                  <Button 
                    variant={config.textPosition === 'bottom-20' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateConfig({ textPosition: 'bottom-20' })}
                    className="text-xs"
                  >
                    Milieu-Bas
                  </Button>
                  <Button 
                    variant={config.textPosition === 'bottom-32' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateConfig({ textPosition: 'bottom-32' })}
                    className="text-xs"
                  >
                    Remonté
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Position "Remonté" laisse de la place pour la description des réseaux sociaux
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceover">Script de la voix-off</Label>
                <Textarea
                  id="voiceover"
                  value={config.voiceOverText}
                  onChange={(e) => updateConfig({ voiceOverText: e.target.value })}
                  placeholder="Découvre la Lamborghini Huracan disponible à Dubai..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Ce texte sera lu par la voix artificielle d'Eleven Labs
                </p>
              </div>

              {/* Preview Box */}
              <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Aperçu des paramètres</h4>
                <div className="space-y-2">
                  <div className="bg-primary/10 rounded p-2 border border-primary/20">
                    <span className="text-xs text-primary font-medium">STYLE OVERLAY</span>
                    <p className="text-sm capitalize">{config.textStyle}</p>
                  </div>
                  <div className="bg-secondary/10 rounded p-2 border border-secondary/20">
                    <span className="text-xs text-secondary font-medium">EFFET VIDÉO</span>
                    <p className="text-sm capitalize">
                      {config.photoEffect === 'effect-1' && "Effet 1 - Panoramique"}
                      {config.photoEffect === 'effect-2' && "Effet 2 - Zoom In"}
                      {config.photoEffect === 'effect-3' && "Effet 3 - Zoom Out"}
                      {config.photoEffect === 'effect-4' && "Effet 4 - Fondu"}
                      {config.photoEffect === 'effect-5' && "Effet 5 - Glissement"}
                      {!config.photoEffect && "Aucun effet sélectionné"}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded p-2 border border-accent/20">
                    <span className="text-xs text-accent font-medium">TEXTE OVERLAY</span>
                    <p className="text-sm">{config.overlayText || "Aucun texte d'overlay"}</p>
                  </div>
                  <div className="bg-muted/20 rounded p-2 border border-muted/40">
                    <span className="text-xs text-muted-foreground font-medium">VOIX-OFF</span>
                    <p className="text-sm">{config.voiceOverText || "Aucun script de voix-off"}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceSettings 
              config={config}
              onConfigChange={onConfigChange}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialNetworkSettings 
              config={config}
              onConfigChange={onConfigChange}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button 
            onClick={onNext} 
            className="w-full" 
            size="lg"
            disabled={!config.overlayText || !config.voiceOverText}
          >
            Générer la vidéo
          </Button>
          {(!config.overlayText || !config.voiceOverText) && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Veuillez remplir tous les champs texte pour continuer
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}