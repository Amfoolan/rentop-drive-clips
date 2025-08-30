import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Webhook, 
  Car, 
  Mic, 
  Share2,
  Play,
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCars = [
  { id: 1, model: "Porsche 911 GT3 RS", price: "280€/jour", images: 5 },
  { id: 2, model: "BMW M4 Competition", price: "220€/jour", images: 4 },
  { id: 3, model: "Audi RS6 Avant", price: "200€/jour", images: 6 },
  { id: 4, model: "Mercedes-AMG GT R", price: "300€/jour", images: 5 },
  { id: 5, model: "Lamborghini Huracán", price: "450€/jour", images: 7 }
];

const elevenLabsVoices = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", language: "FR", gender: "Femme" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", language: "FR", gender: "Homme" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", language: "FR", gender: "Femme" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", language: "FR", gender: "Femme" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", language: "FR", gender: "Homme" }
];

export function ConfigurationPanel() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [overlayText, setOverlayText] = useState("Porsche 911 GT3 RS • Réserve sur Rentop.co");
  const [voiceOverText, setVoiceOverText] = useState("Découvre la Porsche 911 GT3 RS disponible à Paris. Réserve maintenant sur Rentop.co !");
  const [quotas, setQuotas] = useState({
    tiktok: 12,
    instagram: 10,
    youtube: 8
  });
  const [platforms, setPlatforms] = useState({
    tiktok: true,
    instagram: true,
    youtube: false
  });

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Vos paramètres ont été mis à jour avec succès.",
    });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'URL du webhook N8N",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Test du webhook en cours...",
      description: "Connexion à N8N...",
    });

    // Simulate webhook test
    setTimeout(() => {
      toast({
        title: "Webhook testé avec succès",
        description: "La connexion avec N8N fonctionne correctement.",
      });
    }, 2000);
  };

  const handlePreviewVoice = async (voiceId: string) => {
    toast({
      title: "Prévisualisation de la voix",
      description: "Génération de l'audio de test en cours...",
    });
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration de génération
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook Configuration */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            URL Webhook N8N
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleTestWebhook}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Car Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Sélection du véhicule
          </Label>
          <Select value={selectedCar} onValueChange={setSelectedCar}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une voiture de la BDD" />
            </SelectTrigger>
            <SelectContent>
              {mockCars.map((car) => (
                <SelectItem key={car.id} value={car.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{car.model}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">{car.price}</Badge>
                      <Badge variant="outline">{car.images} photos</Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voix ElevenLabs
          </Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une voix" />
            </SelectTrigger>
            <SelectContent>
              {elevenLabsVoices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{voice.name}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">{voice.gender}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(voice.id);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Texte overlay</Label>
            <Input
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Texte affiché sur la vidéo"
            />
          </div>

          <div className="space-y-2">
            <Label>Script voice-over</Label>
            <Textarea
              value={voiceOverText}
              onChange={(e) => setVoiceOverText(e.target.value)}
              placeholder="Texte pour la voix off"
              rows={3}
            />
          </div>
        </div>

        {/* Platform Configuration */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Plateformes de publication
          </Label>
          
          <div className="space-y-4">
            {Object.entries(platforms).map(([platform, enabled]) => (
              <div key={platform} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setPlatforms(prev => ({ ...prev, [platform]: checked }))
                    }
                  />
                  <div>
                    <p className="font-medium capitalize">{platform}</p>
                    <p className="text-sm text-muted-foreground">
                      Format 9:16 - {quotas[platform as keyof typeof quotas]} max/jour
                    </p>
                  </div>
                </div>
                <Input
                  type="number"
                  value={quotas[platform as keyof typeof quotas]}
                  onChange={(e) => 
                    setQuotas(prev => ({ 
                      ...prev, 
                      [platform]: parseInt(e.target.value) || 0 
                    }))
                  }
                  className="w-20"
                  min="1"
                  max="50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button variant="generate" className="flex-1" onClick={handleSaveConfiguration}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
          <Button variant="hero" className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Générer maintenant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}