import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface FinalPreviewStepProps {
  carData: CarData;
  config: VideoConfig;
  onConfirm: () => void;
  onBack: () => void;
}

export function FinalPreviewStep({ carData, config, onConfirm, onBack }: FinalPreviewStepProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  // Estimation des coûts et durée
  const estimatedDuration = Math.ceil(config.voiceOverText.length / 12); // ~12 caractères par seconde
  const estimatedCost = Math.ceil(config.voiceOverText.length / 1000) * 0.15; // Estimation ElevenLabs
  const selectedImages = carData.images.slice(0, Math.min(10, carData.images.length));
  
  const activeSocialNetworks = Object.entries(config.socialNetworks)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform);

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
            
            <div className="relative">
              <VideoPreview
                images={selectedImages}
                overlayText={config.overlayText}
                voiceOverText={config.voiceOverText}
                model={carData.title}
                price={carData.price}
              />
              
              {/* Overlay de contrôle */}
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white"
                >
                  {isPlayingPreview ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                  <span className="ml-2">
                    {isPlayingPreview ? 'Pause' : 'Aperçu muet'}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Résumé de la configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Informations vidéo */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration vidéo
              </h4>
              
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
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Voix sélectionnée</span>
                  </div>
                  <p className="text-sm">{config.voiceId === 'EXAVITQu4vr4xnSDxMaL' ? 'Sarah (Féminine)' : 'Voix personnalisée'}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stabilité: {config.voiceSettings.stability} • 
                    Similarité: {config.voiceSettings.similarity_boost} • 
                    Vitesse: {config.voiceSettings.speed}x
                  </div>
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