import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  Settings, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Key
} from "lucide-react";
import { useState } from "react";
import { VideoConfig } from "../StepByStepGenerator";

interface SocialNetworkSettingsProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

const socialNetworks = [
  {
    id: "tiktok",
    name: "TikTok",
    description: "Plateforme principale pour les vidéos courtes",
    icon: "📱",
    connected: false,
    color: "bg-pink-500"
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    description: "Réseaux de Meta pour le contenu visuel",
    icon: "📷",
    connected: false,
    color: "bg-purple-500"
  },
  {
    id: "twitter",
    name: "Twitter/X",
    description: "Plateforme de microblogging",
    icon: "🐦",
    connected: false,
    color: "bg-blue-500"
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Réseau social principal de Meta",
    icon: "👥",
    connected: false,
    color: "bg-blue-600"
  }
];

export function SocialNetworkSettings({ config, onConfigChange }: SocialNetworkSettingsProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const updateSocialNetwork = (network: string, enabled: boolean) => {
    onConfigChange({
      ...config,
      socialNetworks: {
        ...config.socialNetworks,
        [network]: enabled
      }
    });
  };

  const connectNetwork = (networkId: string) => {
    // Simulate connection process
    console.log(`Connecting to ${networkId}...`);
  };

  const enabledNetworks = Object.entries(config.socialNetworks).filter(([_, enabled]) => enabled);

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Configuration des réseaux sociaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
              <p className="text-2xl font-bold text-primary">{enabledNetworks.length}</p>
              <p className="text-xs text-muted-foreground">Activés</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">0</p>
              <p className="text-xs text-muted-foreground">Connectés</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center border border-accent/20">
              <p className="text-2xl font-bold text-accent">{socialNetworks.length}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </div>
          </div>

          {/* Network List */}
          <div className="space-y-4">
            {socialNetworks.map((network) => {
              const isEnabled = config.socialNetworks[network.id as keyof typeof config.socialNetworks];
              const isConnected = network.connected;
              
              return (
                <div key={network.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{network.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{network.name}</span>
                          {isConnected ? (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connecté
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Non connecté
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{network.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => updateSocialNetwork(network.id, checked)}
                    />
                  </div>
                  
                  {isEnabled && (
                    <div className="pl-11 space-y-3">
                      {!isConnected && (
                        <div className="bg-muted/20 rounded-lg p-3 space-y-3">
                          <p className="text-sm font-medium">Configuration requise</p>
                          <div className="space-y-2">
                            <Label htmlFor={`${network.id}-key`} className="text-xs">
                              Clé API {network.name}
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`${network.id}-key`}
                                type="password"
                                placeholder="Entrez votre clé API..."
                                value={apiKeys[network.id] || ""}
                                onChange={(e) => setApiKeys(prev => ({
                                  ...prev,
                                  [network.id]: e.target.value
                                }))}
                                className="text-xs"
                              />
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => connectNetwork(network.id)}
                                className="text-xs"
                              >
                                <Key className="h-3 w-3 mr-1" />
                                Connecter
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isConnected && (
                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Prêt pour la publication automatique
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Help Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Comment configurer les APIs ?
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Créez un compte développeur sur chaque plateforme</li>
              <li>Générez une clé API avec les permissions de publication</li>
              <li>Collez la clé dans le champ correspondant</li>
              <li>Testez la connexion avec le bouton "Connecter"</li>
            </ol>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs">
              <ExternalLink className="h-3 w-3" />
              Guide détaillé
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}