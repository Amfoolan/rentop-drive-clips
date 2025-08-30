import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  Volume2, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Mic
} from "lucide-react";
import { CarData, VideoConfig } from "../StepByStepGenerator";
import { VideoPreview } from "../../VideoPreview";
import { supabase } from "@/integrations/supabase/client";

interface FinalPreviewStepProps {
  carData: CarData;
  config: VideoConfig;
  onConfirm: () => void;
  onBack: () => void;
  onConfigChange: (config: VideoConfig) => void;
}

const elevenLabsVoices = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Voix féminine claire et professionnelle", gender: "Féminin" },
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Voix féminine expressive et naturelle", gender: "Féminin" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Voix masculine mature et confiante", gender: "Masculin" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Voix masculine jeune et énergique", gender: "Masculin" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "Voix féminine douce et apaisante", gender: "Féminin" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Voix masculine profonde et autoritaire", gender: "Masculin" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "Voix féminine professionnelle", gender: "Féminin" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", description: "Voix masculine claire", gender: "Masculin" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "Voix féminine élégante", gender: "Féminin" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", description: "Voix masculine chaleureuse", gender: "Masculin" }
];

export function FinalPreviewStep({ carData, config, onConfirm, onBack, onConfigChange }: FinalPreviewStepProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Estimation des coûts et durée
  const estimatedDuration = Math.ceil(config.voiceOverText.length / 12); // ~12 caractères par seconde
  const estimatedCost = Math.ceil(config.voiceOverText.length / 1000) * 0.15; // Estimation ElevenLabs
  const selectedImages = carData.images.slice(0, Math.min(10, carData.images.length));
  
  const activeSocialNetworks = Object.entries(config.socialNetworks)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform);

  const selectedVoice = elevenLabsVoices.find(v => v.id === config.voiceId) || elevenLabsVoices[0];

  const updateVoiceSettings = (updates: Partial<VideoConfig['voiceSettings']>) => {
    onConfigChange({
      ...config,
      voiceSettings: { ...config.voiceSettings, ...updates }
    });
  };

  const updateVoiceId = (voiceId: string) => {
    onConfigChange({ ...config, voiceId });
  };

  const testVoice = async () => {
    setIsTestingVoice(true);
    
    try {
      const testText = config.voiceOverText.substring(0, 100) + (config.voiceOverText.length > 100 ? "..." : "");
      
      const response = await supabase.functions.invoke('test-voice', {
        body: {
          voiceId: config.voiceId,
          text: testText,
          voiceSettings: config.voiceSettings
        }
      });

      if (response.error) {
        console.error('Voice test error:', response.error);
      } else {
        console.log('Voice test completed successfully');
      }
      
      // Simulate playback duration
      setTimeout(() => {
        setIsTestingVoice(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error testing voice:', error);
      setIsTestingVoice(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Étape 4: Prévisualisation finale
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Vérifiez tous les paramètres avant de générer votre vidéo et consommer des crédits
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Aperçu vidéo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçu de la vidéo</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{estimatedDuration}s
              </Badge>
            </div>
            
            <div className="relative max-w-xs mx-auto">
              <VideoPreview
                images={selectedImages}
                overlayText={config.overlayText}
                voiceOverText={config.voiceOverText}
                model={carData.title}
                price={carData.price}
              />
              
              {/* Overlay de contrôle */}
              <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 rounded-lg px-3 py-1 text-xs font-medium text-gray-700">
                  Aperçu muet
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Résumé de la configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Configuration Voix - Section étendue */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Configuration de la voix
              </h4>
              
              {/* Voice Selection */}
              <div className="bg-muted/20 rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Choisir la voix</Label>
                  <Select value={config.voiceId} onValueChange={updateVoiceId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elevenLabsVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                            <span className="font-medium">{voice.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Voice Info */}
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-primary">{selectedVoice.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {selectedVoice.gender}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedVoice.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={testVoice}
                      disabled={isTestingVoice}
                      className="flex items-center gap-2"
                    >
                      {isTestingVoice ? (
                        <>
                          <Pause className="h-3 w-3" />
                          Test...
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Tester
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Voice Parameters */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Stabilité</Label>
                      <Badge variant="outline" className="text-xs">{Math.round(config.voiceSettings.stability * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[config.voiceSettings.stability]}
                      onValueChange={([value]) => updateVoiceSettings({ stability: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Similarité</Label>
                      <Badge variant="outline" className="text-xs">{Math.round(config.voiceSettings.similarity_boost * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[config.voiceSettings.similarity_boost]}
                      onValueChange={([value]) => updateVoiceSettings({ similarity_boost: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Vitesse</Label>
                      <Badge variant="outline" className="text-xs">{config.voiceSettings.speed}x</Badge>
                    </div>
                    <Slider
                      value={[config.voiceSettings.speed]}
                      onValueChange={([value]) => updateVoiceSettings({ speed: value })}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Autres paramètres */}
              <div className="space-y-3">
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Texte de superposition</span>
                  </div>
                  <p className="text-sm">{config.overlayText}</p>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Plateformes cibles</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeSocialNetworks.map(platform => (
                      <Badge key={platform} variant="secondary" className="text-xs capitalize">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Texte de voix-off */}
            <div className="space-y-4">
              <h4 className="font-semibold">Texte de la voix-off</h4>
              
              <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contenu audio</span>
                  <Badge variant="outline">
                    {config.voiceOverText.length} caractères
                  </Badge>
                </div>
                
                <div className="text-sm">
                  {showFullText ? (
                    <p className="leading-relaxed">{config.voiceOverText}</p>
                  ) : (
                    <p className="leading-relaxed">
                      {config.voiceOverText.substring(0, 150)}
                      {config.voiceOverText.length > 150 && '...'}
                    </p>
                  )}
                </div>
                
                {config.voiceOverText.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullText(!showFullText)}
                    className="text-xs"
                  >
                    {showFullText ? 'Voir moins' : 'Voir tout'}
                  </Button>
                )}
              </div>
              
              {/* Note importante */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Avant de continuer</p>
                    <p className="text-blue-700 mt-1">
                      La génération audio utilisera des crédits ElevenLabs. 
                      Vérifiez bien le texte et les paramètres car il ne sera pas possible 
                      de modifier après génération.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimation des coûts */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
            <h4 className="font-semibold mb-3">Estimation de la génération</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{selectedImages.length}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">~{estimatedDuration}s</p>
                <p className="text-sm text-muted-foreground">Durée audio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">${estimatedCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Coût estimé</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
            >
              Retour à la configuration
            </Button>
            
            <Button
              onClick={onConfirm}
              className="flex-1"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Générer la vidéo finale
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Une fois la génération lancée, elle prendra environ 30-60 secondes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}