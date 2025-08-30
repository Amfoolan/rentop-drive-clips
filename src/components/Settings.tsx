import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Mic, 
  Share2, 
  Key, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save
} from "lucide-react";

interface ApiSettings {
  elevenlabs: {
    apiKey: string;
    connected: boolean;
  };
  socialNetworks: {
    tiktok: {
      clientKey: string;
      clientSecret: string;
      accessToken: string;
      connected: boolean;
      enabled: boolean;
    };
    instagram: {
      clientId: string;
      clientSecret: string;
      accessToken: string;
      connected: boolean;
      enabled: boolean;
    };
    youtube: {
      clientId: string;
      clientSecret: string;
      accessToken: string;
      connected: boolean;
      enabled: boolean;
    };
  };
}

const defaultSettings: ApiSettings = {
  elevenlabs: {
    apiKey: "",
    connected: false
  },
  socialNetworks: {
    tiktok: {
      clientKey: "",
      clientSecret: "",
      accessToken: "",
      connected: false,
      enabled: false
    },
    instagram: {
      clientId: "",
      clientSecret: "",
      accessToken: "",
      connected: false,
      enabled: false
    },
    youtube: {
      clientId: "",
      clientSecret: "",
      accessToken: "",
      connected: false,
      enabled: false
    }
  }
};

export function Settings() {
  const [settings, setSettings] = useState<ApiSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('rentop-api-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('rentop-api-settings', JSON.stringify(settings));
      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Tester la connexion ElevenLabs
  const testElevenLabsConnection = async () => {
    if (!settings.elevenlabs.apiKey) {
      toast.error("Veuillez entrer votre clé API ElevenLabs");
      return;
    }

    try {
      const response = await fetch(`https://hlfozjnlhahdbnosltxl.supabase.co/functions/v1/test-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: "Test de connexion ElevenLabs depuis les paramètres",
          voiceId: "9BWtsMINqrJLrRacOk9x",
          model: "eleven_turbo_v2_5",
          apiKey: settings.elevenlabs.apiKey
        })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          elevenlabs: { ...prev.elevenlabs, connected: true }
        }));
        toast.success("Connexion ElevenLabs réussie");
      } else {
        toast.error("Échec de la connexion ElevenLabs - Vérifiez votre clé API");
      }
    } catch (error) {
      toast.error("Erreur de connexion - Vérifiez votre clé API");
    }
  };

  // Connecter un réseau social
  const connectSocialNetwork = (network: keyof ApiSettings['socialNetworks']) => {
    // Simulation de connexion OAuth
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        socialNetworks: {
          ...prev.socialNetworks,
          [network]: {
            ...prev.socialNetworks[network],
            connected: true,
            enabled: true
          }
        }
      }));
      toast.success(`Connexion ${network.toUpperCase()} réussie`);
    }, 1500);
  };

  const updateElevenLabsKey = (apiKey: string) => {
    setSettings(prev => ({
      ...prev,
      elevenlabs: { ...prev.elevenlabs, apiKey, connected: false }
    }));
  };

  const updateSocialNetworkField = (
    network: keyof ApiSettings['socialNetworks'],
    field: string,
    value: string | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      socialNetworks: {
        ...prev.socialNetworks,
        [network]: {
          ...prev.socialNetworks[network],
          [field]: value
        }
      }
    }));
  };

  const socialNetworkData = [
    {
      id: 'tiktok' as const,
      name: 'TikTok',
      description: 'Publication automatique sur TikTok',
      color: 'bg-pink-500',
      fields: [
        { key: 'clientKey', label: 'Client Key' },
        { key: 'clientSecret', label: 'Client Secret' },
        { key: 'accessToken', label: 'Access Token' }
      ]
    },
    {
      id: 'instagram' as const,
      name: 'Instagram',
      description: 'Publication sur Instagram Reels',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      fields: [
        { key: 'clientId', label: 'Client ID' },
        { key: 'clientSecret', label: 'Client Secret' },
        { key: 'accessToken', label: 'Access Token' }
      ]
    },
    {
      id: 'youtube' as const,
      name: 'YouTube',
      description: 'Upload sur YouTube Shorts',
      color: 'bg-red-500',
      fields: [
        { key: 'clientId', label: 'Client ID' },
        { key: 'clientSecret', label: 'Client Secret' },
        { key: 'accessToken', label: 'Access Token' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Paramètres API et Connexions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="elevenlabs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
              <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
            </TabsList>

            <TabsContent value="elevenlabs" className="space-y-6">
              <Card className="border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Configuration ElevenLabs
                    {settings.elevenlabs.connected && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connecté
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs-key">Clé API ElevenLabs</Label>
                    <Input
                      id="elevenlabs-key"
                      type="password"
                      placeholder="sk-..."
                      value={settings.elevenlabs.apiKey}
                      onChange={(e) => updateElevenLabsKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Obtenez votre clé API sur{" "}
                      <a 
                        href="https://elevenlabs.io/speech-synthesis" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        elevenlabs.io <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testElevenLabsConnection}
                      disabled={!settings.elevenlabs.apiKey}
                      variant="outline"
                    >
                      Tester la connexion
                    </Button>
                    {settings.elevenlabs.connected && (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connexion validée
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="space-y-6">
                {socialNetworkData.map((network) => {
                  const networkConfig = settings.socialNetworks[network.id];
                  
                  return (
                    <Card key={network.id} className="border border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${network.color}`}></div>
                            {network.name}
                            {networkConfig.connected && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Connecté
                              </Badge>
                            )}
                          </CardTitle>
                          <Switch
                            checked={networkConfig.enabled}
                            onCheckedChange={(enabled) => 
                              updateSocialNetworkField(network.id, 'enabled', enabled)
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {network.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!networkConfig.connected ? (
                          <div className="space-y-4">
                            {network.fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label htmlFor={`${network.id}-${field.key}`}>
                                  {field.label}
                                </Label>
                                <Input
                                  id={`${network.id}-${field.key}`}
                                  type="password"
                                  placeholder="***"
                                  value={networkConfig[field.key as keyof typeof networkConfig] as string}
                                  onChange={(e) => 
                                    updateSocialNetworkField(network.id, field.key, e.target.value)
                                  }
                                />
                              </div>
                            ))}
                            <Button
                              onClick={() => connectSocialNetwork(network.id)}
                              className="w-full"
                              disabled={
                                !(networkConfig as any).clientId && 
                                !(networkConfig as any).clientKey
                              }
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Connecter {network.name}
                            </Button>
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">
                                📖 <strong>Guide de configuration {network.name}:</strong>
                              </p>
                              <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                                <li>Créez une application sur {network.name} Developer Portal</li>
                                <li>Ajoutez les URLs de redirection autorisées</li>
                                <li>Copiez les clés API dans les champs ci-dessus</li>
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">
                                Connexion {network.name} active
                              </span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              Vos vidéos peuvent maintenant être publiées automatiquement sur {network.name}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => 
                                updateSocialNetworkField(network.id, 'connected', false)
                              }
                            >
                              Déconnecter
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-border/50">
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="w-full" 
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}