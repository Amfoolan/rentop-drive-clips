import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, Loader2, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CarData } from "../StepByStepGenerator";
import { fetchRentopData } from "@/utils/rentopFetcher";

interface UrlInputStepProps {
  onDataExtracted: (data: CarData) => void;
}

export function UrlInputStep({ onDataExtracted }: UrlInputStepProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    
    if (!url.includes("rentop.co")) {
      setError("Veuillez saisir une URL Rentop valide (ex: https://www.rentop.co/car/...)");
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract data from the provided Rentop URL
      const extractedData = await fetchRentopData(url);
      
      if (!extractedData) {
        throw new Error("Impossible d'extraire les données de cette URL");
      }

      toast({
        title: "Données extraites avec succès",
        description: "Les informations ont été extraites de l'URL fournie",
        variant: extractedData.images.length === 0 ? "destructive" : "default"
      });
      
      onDataExtracted(extractedData);
    } catch (error) {
      console.error("Error:", error);
      setError("Impossible d'extraire les données de cette URL. Vérifiez que l'URL est accessible.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Étape 1: URL de la voiture Rentop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL de la voiture</Label>
            <Input
              id="url"
              placeholder="https://www.rentop.co/car/lamborghini-huracan-tecnica-2024-3"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              className="text-base"
              disabled={isLoading}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Comment ça marche ?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Allez sur <span className="font-medium">rentop.co</span> et trouvez une voiture</li>
              <li>Copiez l'URL de la page de la voiture</li>
              <li>Collez l'URL ici pour extraire les données automatiquement</li>
            </ol>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm text-blue-800">Note importante</h4>
            </div>
            <p className="text-sm text-blue-700">
              Les informations seront extraites de l'URL fournie. Si les images ne correspondent pas exactement à votre voiture, 
              vous pourrez les ajuster à l'étape suivante de configuration.
            </p>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!url || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extraction des données...
              </>
            ) : (
              "Extraire les données"
            )}
          </Button>

          {url.includes("rentop.co") && (
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full" />
                URL Rentop valide
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}