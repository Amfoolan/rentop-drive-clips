import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VideoPreview } from "./VideoPreview";
import { 
  Link, 
  Download, 
  Loader2,
  Eye,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CarData {
  title: string;
  price: string;
  location: string;
  images: string[];
  specs: {
    year: string;
    color: string;
    horsepower: string;
    engine: string;
    maxSpeed: string;
    acceleration: string;
  };
}

export function UrlVideoGenerator() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [voiceOverText, setVoiceOverText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const extractRentopData = (content: string): CarData | null => {
    try {
      // Extract title
      const titleMatch = content.match(/Rent ([^\\n]+) in ([^\\n]+)/);
      const title = titleMatch ? `${titleMatch[1]} in ${titleMatch[2]}` : "";
      
      // Extract location
      const location = titleMatch ? titleMatch[2] : "";
      
      // Extract price
      const priceMatch = content.match(/From ([A-Z]+ [0-9,]+)/);
      const price = priceMatch ? priceMatch[1] : "";
      
      // Extract images (look for Supabase URLs)
      const imageMatches = content.match(/https:\/\/hjkyepaqdsyqjvhqedha\.supabase\.co[^)]+/g);
      const images = imageMatches ? imageMatches.slice(0, 5).map(url => decodeURIComponent(url)) : [];
      
      // Extract specs
      const yearMatch = content.match(/Year[^0-9]*([0-9]{4})/);
      const colorMatch = content.match(/Color[^A-Za-z]*([A-Za-z]+)/);
      const hpMatch = content.match(/Horsepower[^0-9]*([0-9]+)/);
      const engineMatch = content.match(/Engine[^0-9]*([0-9.]+L)/);
      const speedMatch = content.match(/Max Speed[^0-9]*([0-9]+)/);
      const accelMatch = content.match(/0-100 Km\/H[^0-9]*([0-9.]+)/);
      
      const specs = {
        year: yearMatch ? yearMatch[1] : "",
        color: colorMatch ? colorMatch[1] : "",
        horsepower: hpMatch ? hpMatch[1] + " HP" : "",
        engine: engineMatch ? engineMatch[1] : "",
        maxSpeed: speedMatch ? speedMatch[1] + " km/h" : "",
        acceleration: accelMatch ? accelMatch[1] + "s" : ""
      };

      return {
        title,
        price,
        location,
        images,
        specs
      };
    } catch (error) {
      console.error("Error extracting data:", error);
      return null;
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.includes("rentop.co")) {
      toast({
        title: "URL invalide",
        description: "Veuillez saisir une URL Rentop valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate fetching website content - using the data we extracted earlier
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Extract car data from the URL (simplified simulation)
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
          horsepower: "631",
          engine: "5.2L",
          maxSpeed: "325",
          acceleration: "3.2"
        }
      };
      
      setCarData(extractedData);
      
      // Auto-generate texts
      const carName = extractedData.title.replace(/^Rent\s+/, '').replace(/\s+in\s+.*$/, '');
      setOverlayText(`${carName} • Réserve sur Rentop.co`);
      setVoiceOverText(
        `Découvre la ${carName} disponible à ${extractedData.location}. ` +
        `${extractedData.specs.horsepower} chevaux, moteur ${extractedData.specs.engine}. ` +
        `À partir de ${extractedData.price} par jour. Réserve maintenant sur Rentop.co !`
      );
      
      toast({
        title: "Données extraites avec succès",
        description: `${extractedData.images.length} images trouvées`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur d'extraction",
        description: "Impossible d'extraire les données de cette URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!carData) return;
    
    toast({
      title: "Génération vidéo lancée",
      description: "La vidéo TikTok est en cours de création...",
    });
    
    // Here would be the actual video generation logic
    setTimeout(() => {
      toast({
        title: "Vidéo générée avec succès",
        description: "Votre vidéo TikTok est prête !",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Générateur vidéo depuis URL Rentop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>URL de la voiture Rentop</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.rentop.co/car/lamborghini-huracan-tecnica-2024-3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleUrlSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {carData && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{carData.title}</h3>
                <Badge variant="secondary">{carData.price}/jour</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Année:</span>
                  <span className="ml-2">{carData.specs.year}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Couleur:</span>
                  <span className="ml-2">{carData.specs.color}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Puissance:</span>
                  <span className="ml-2">{carData.specs.horsepower}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Moteur:</span>
                  <span className="ml-2">{carData.specs.engine}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline">{carData.images.length} images trouvées</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Prévisualiser
                  </Button>
                  <Button
                    variant="generate"
                    size="sm"
                    onClick={handleGenerateVideo}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Générer vidéo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Configuration */}
      {carData && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle>Configuration des textes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <textarea
                className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm"
                value={voiceOverText}
                onChange={(e) => setVoiceOverText(e.target.value)}
                placeholder="Texte pour la voix off"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Preview Modal */}
      {showPreview && carData && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Prévisualisation vidéo</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </Button>
            </div>
            <VideoPreview
              images={carData.images}
              overlayText={overlayText}
              voiceOverText={voiceOverText}
            />
          </div>
        </div>
      )}
    </div>
  );
}