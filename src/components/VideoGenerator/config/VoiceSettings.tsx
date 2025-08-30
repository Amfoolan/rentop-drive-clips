import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Play, Pause, Volume2 } from "lucide-react";
import { useState } from "react";
import { VideoConfig } from "../StepByStepGenerator";

interface VoiceSettingsProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

const elevenLabsVoices = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Voix féminine claire et professionnelle" },
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Voix féminine expressive et naturelle" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Voix masculine mature et confiante" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Voix masculine jeune et énergique" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "Voix féminine douce et apaisante" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Voix masculine profonde et autoritaire" }
];

export function VoiceSettings({ config, onConfigChange }: VoiceSettingsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const updateVoiceSettings = (updates: Partial<VideoConfig['voiceSettings']>) => {
    onConfigChange({
      ...config,
      voiceSettings: { ...config.voiceSettings, ...updates }
    });
  };

  const updateVoiceId = (voiceId: string) => {
    onConfigChange({ ...config, voiceId });
  };

  const selectedVoice = elevenLabsVoices.find(v => v.id === config.voiceId) || elevenLabsVoices[0];

  const testVoice = () => {
    setIsPlaying(true);
    // Simulate voice test
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4" />
            Configuration Eleven Labs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-3">
            <Label>Voix sélectionnée</Label>
            <Select value={config.voiceId} onValueChange={updateVoiceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {elevenLabsVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">{selectedVoice.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVoice.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testVoice}
                  disabled={isPlaying}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
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
          </div>

          {/* Voice Parameters */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stabilité</Label>
                <Badge variant="outline">{Math.round(config.voiceSettings.stability * 100)}%</Badge>
              </div>
              <Slider
                value={[config.voiceSettings.stability]}
                onValueChange={([value]) => updateVoiceSettings({ stability: value })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Plus élevée = voix plus stable et prévisible
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Similarité</Label>
                <Badge variant="outline">{Math.round(config.voiceSettings.similarity_boost * 100)}%</Badge>
              </div>
              <Slider
                value={[config.voiceSettings.similarity_boost]}
                onValueChange={([value]) => updateVoiceSettings({ similarity_boost: value })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Plus élevée = voix plus fidèle à l'original
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Vitesse</Label>
                <Badge variant="outline">{config.voiceSettings.speed}x</Badge>
              </div>
              <Slider
                value={[config.voiceSettings.speed]}
                onValueChange={([value]) => updateVoiceSettings({ speed: value })}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Contrôle la vitesse de lecture de la voix
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-accent" />
              <span className="font-medium text-accent">Aperçu du texte</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {config.voiceOverText || "Aucun script configuré"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}