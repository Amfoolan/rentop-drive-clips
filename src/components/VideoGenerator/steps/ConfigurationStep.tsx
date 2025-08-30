import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Clean</span>
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary"></div>
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
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Gradient</span>
                      <div className="w-4 h-4 rounded-full border-2 border-muted"></div>
                    </div>
                    <div className="bg-gradient-to-t from-black/90 to-transparent rounded p-3 text-center">
                      <div className="text-white text-sm font-bold">AUDI Q8 S Line Kit (2021) White</div>
                      <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-2 py-1 rounded-full text-xs mt-2 inline-block">
                        699 AED/jour
                      </div>
                    </div>
                  </div>

                  {/* Style Option 3 - Minimalist */}
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Style Minimalist</span>
                      <div className="w-4 h-4 rounded-full border-2 border-muted"></div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded p-3 text-center">
                      <div className="text-white text-sm font-semibold">AUDI Q8 • 699 AED/jour</div>
                    </div>
                  </div>
                </div>
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
                <h4 className="font-medium text-sm">Aperçu des textes</h4>
                <div className="space-y-2">
                  <div className="bg-primary/10 rounded p-2 border border-primary/20">
                    <span className="text-xs text-primary font-medium">OVERLAY</span>
                    <p className="text-sm">{config.overlayText || "Aucun texte d'overlay"}</p>
                  </div>
                  <div className="bg-accent/10 rounded p-2 border border-accent/20">
                    <span className="text-xs text-accent font-medium">VOIX-OFF</span>
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