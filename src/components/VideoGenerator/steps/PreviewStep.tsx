import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, MapPin, Calendar, Palette, Zap, Images, Play, AlertTriangle } from "lucide-react";
import { CarData } from "../StepByStepGenerator";
import { VideoPreview } from "../../VideoPreview";

interface PreviewStepProps {
  carData: CarData;
  onConfirm: () => void;
  onImageCountChange?: (count: number) => void;
  onRetryExtraction?: () => void;
}

export function PreviewStep({ carData, onConfirm, onImageCountChange, onRetryExtraction }: PreviewStepProps) {
  const [selectedImageCount, setSelectedImageCount] = useState(Math.max(5, carData.images.length));
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  
  const hasEnoughImages = carData.images.length >= 5;
  const selectedImages = carData.images.slice(0, selectedImageCount);

  const handleImageCountChange = (value: number[]) => {
    const count = value[0];
    setSelectedImageCount(count);
    onImageCountChange?.(count);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Étape 2: Aperçu des données extraites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Car Info - Simplified */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{carData.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {carData.location}
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {carData.price}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Images Status Alert */}
          {!hasEnoughImages && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Attention - Pas assez d'images</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Seulement {carData.images.length} image(s) trouvée(s). Il faut minimum 5 images pour créer une vidéo de qualité.
              </p>
              {onRetryExtraction && (
                <Button 
                  onClick={onRetryExtraction}
                  variant="outline" 
                  size="sm"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <Images className="h-4 w-4 mr-2" />
                  Essayer de récupérer plus d'images
                </Button>
              )}
            </div>
          )}

          {/* Image Count Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                <Label>Nombre d'images pour la vidéo</Label>
              </div>
              <Badge variant={hasEnoughImages ? "default" : "destructive"}>
                {carData.images.length} disponibles
              </Badge>
            </div>
            
            <div className="space-y-3">
              <Slider
                value={[selectedImageCount]}
                onValueChange={handleImageCountChange}
                max={Math.max(carData.images.length, 15)}
                min={5}
                step={1}
                disabled={carData.images.length < 5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Minimum: 5 images</span>
                <span className="font-medium">Sélectionné: {selectedImageCount}</span>
                <span>Maximum: {Math.max(carData.images.length, 15)}</span>
              </div>
            </div>
          </div>

          {/* Images Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Images sélectionnées</h4>
              <div className="flex gap-2">
                <Badge variant="outline">{selectedImages.length} images</Badge>
                <Button
                  onClick={() => setShowVideoPreview(!showVideoPreview)}
                  variant="outline"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {showVideoPreview ? 'Masquer' : 'Aperçu vidéo'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Preview */}
          {showVideoPreview && hasEnoughImages && (
            <div className="border border-border rounded-lg p-4">
              <div className="flex justify-center">
                <VideoPreview
                  images={selectedImages}
                  overlayText={carData.title}
                  voiceOverText={`Découvrez cette magnifique ${carData.title} disponible à ${carData.location} pour ${carData.price} par jour. Réservez maintenant sur Rentop !`}
                  model={carData.title}
                  price={carData.price}
                />
              </div>
            </div>
          )}

          {/* Performance Stats - Simplified */}
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Données extraites avec succès</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Titre: {carData.title} • Prix: {carData.price} • {selectedImageCount} images sélectionnées
            </p>
          </div>

          {hasEnoughImages ? (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">Prêt pour la vidéo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedImageCount} images sélectionnées. Vous pouvez maintenant passer à la configuration de votre vidéo.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Images insuffisantes</span>
              </div>
              <p className="text-sm text-yellow-700">
                Vous devez avoir au moins 5 images pour continuer. Essayez avec une autre URL Rentop ou ajoutez manuellement des images.
              </p>
            </div>
          )}

          <Button 
            onClick={onConfirm} 
            className="w-full" 
            size="lg"
            disabled={!hasEnoughImages}
          >
            Continuer vers la configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}