import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, MapPin, Calendar, Palette, Zap } from "lucide-react";
import { CarData } from "../StepByStepGenerator";

interface PreviewStepProps {
  carData: CarData;
  onConfirm: () => void;
}

export function PreviewStep({ carData, onConfirm }: PreviewStepProps) {
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
          {/* Car Info */}
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
                    {carData.price}/jour
                  </Badge>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="font-semibold">{carData.specs.year}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <Palette className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Couleur</p>
                <p className="font-semibold">{carData.specs.color}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Puissance</p>
                <p className="font-semibold">{carData.specs.horsepower}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <div className="h-5 w-5 mx-auto mb-2 text-primary flex items-center justify-center text-xs font-bold">
                  V
                </div>
                <p className="text-sm text-muted-foreground">Moteur</p>
                <p className="font-semibold">{carData.specs.engine}</p>
              </div>
            </div>
          </div>

          {/* Images Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Images trouvées</h4>
              <Badge variant="outline">{carData.images.length} images</Badge>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {carData.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Vitesse max</p>
              <p className="text-2xl font-bold text-primary">{carData.specs.maxSpeed}</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">0-100 km/h</p>
              <p className="text-2xl font-bold text-accent">{carData.specs.acceleration}</p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Données vérifiées</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Toutes les informations ont été extraites avec succès. Vous pouvez maintenant passer à la configuration de votre vidéo.
            </p>
          </div>

          <Button onClick={onConfirm} className="w-full" size="lg">
            Continuer vers la configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}