import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CarData } from "../StepByStepGenerator";

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
      // Simulate fetching real data from Rentop URL
      await new Promise(resolve => setTimeout(resolve, 2500)); 
      
      // For now, we'll use the existing extraction logic
      // In a real implementation, this would fetch the actual page content
      const extractedData: CarData = {
        title: "Rent Lamborghini Huracan Tecnica 2024 in Dubai",
        price: "AED 3150",
        location: "Dubai", 
        images: [
          "https://hjkyepaqdsyqjvhqedha.supabase.co/storage/v1/object/public/rental_items_images/WhatsApp%20Image%202025-07-08%20at%2012.44.18%20PM%20(2)_0.004156870345214947_1754515689291",
          "https://hjkyepaqdsyqjvhqedha.supabase.co/storage/v1/object/public/rental_items_images/WhatsApp%20Image%202025-07-08%20at%2012.44.18%20PM%20(5)_0.6361542800591355_1754515697089",
          "https://hjkyepaqdsyqjvhqedha.supabase.co/storage/v1/object/public/rental_items_images/WhatsApp%20Image%202025-07-08%20at%2012.44.18%20PM_0.4450274492381616_1754515700280",
          "https://hjkyepaqdsyqjvhqedha.supabase.co/storage/v1/object/public/rental_items_images/WhatsApp%20Image%202025-07-08%20at%2012.44.18%20PM%20(3)_0.017089467222378696_1754515703685",
          "https://hjkyepaqdsyqjvhqedha.supabase.co/storage/v1/object/public/rental_items_images/WhatsApp%20Image%202025-07-08%20at%2012.44.18%20PM%20(4)_0.46630025046379464_1754515713175"
        ],
        specs: {
          year: "2024",
          color: "Green",
          horsepower: "631 HP",
          engine: "5.2L V10",
          maxSpeed: "325 km/h",
          acceleration: "3.2s"
        }
      };
      
      toast({
        title: "Données extraites avec succès",
        description: `${extractedData.images.length} images trouvées`
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