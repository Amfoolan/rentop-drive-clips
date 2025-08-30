import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { UrlInputStep } from "./steps/UrlInputStep";
import { PreviewStep } from "./steps/PreviewStep";
import { ConfigurationStep } from "./steps/ConfigurationStep";
import { FinalPreviewStep } from "./steps/FinalPreviewStep";
import { GenerationStep } from "./steps/GenerationStep";

export interface CarData {
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

export interface VideoConfig {
  overlayText: string;
  voiceOverText: string;
  voiceId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    speed: number;
  };
  socialNetworks: {
    twitter: boolean;
    instagram: boolean;
    tiktok: boolean;
    facebook: boolean;
  };
}

const steps = [
  { id: 1, title: "URL Rentop", description: "Coller le lien de la voiture" },
  { id: 2, title: "Aperçu", description: "Vérifier les données extraites" },
  { id: 3, title: "Configuration", description: "Textes et paramètres voix" },
  { id: 4, title: "Prévisualisation", description: "Aperçu final avant génération" },
  { id: 5, title: "Génération", description: "Créer la vidéo TikTok" }
];

export function StepByStepGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    overlayText: "",
    voiceOverText: "",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah voice
    voiceSettings: {
      stability: 0.75,
      similarity_boost: 0.75,
      speed: 1.0
    },
    socialNetworks: {
      twitter: false,
      instagram: false,
      tiktok: true,
      facebook: false
    }
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="gradient-text">Créateur de Vidéo Rentop</CardTitle>
              <Badge variant="outline" className="text-sm">
                Étape {currentStep} sur {steps.length}
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 ${
                    currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 ${
                        currentStep === step.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`} />
                    )}
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <UrlInputStep 
            onDataExtracted={(data) => {
              setCarData(data);
              // Auto-generate initial config
              const carName = data.title.replace(/^Rent\s+/, '').replace(/\s+in\s+.*$/, '');
              setVideoConfig(prev => ({
                ...prev,
                overlayText: `${carName} • Réserve sur Rentop.co`,
                voiceOverText: `Découvre la ${carName} disponible à ${data.location}. ${data.price}. Réserve maintenant sur Rentop.co !`
              }));
              nextStep();
            }}
          />
        )}
        
        {currentStep === 2 && carData && (
          <PreviewStep 
            carData={carData}
            onConfirm={nextStep}
            onImageCountChange={(count) => {
              // Update the number of images selected
              console.log(`Selected ${count} images for video`);
            }}
            onRetryExtraction={() => {
              // Go back to URL step to retry extraction
              setCurrentStep(1);
            }}
          />
        )}
        
        {currentStep === 3 && carData && (
          <ConfigurationStep 
            carData={carData}
            config={videoConfig}
            onConfigChange={setVideoConfig}
            onNext={nextStep}
          />
        )}
        
        {currentStep === 4 && carData && (
          <FinalPreviewStep 
            carData={carData}
            config={videoConfig}
            onConfirm={nextStep}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 5 && carData && (
          <GenerationStep 
            carData={carData}
            config={videoConfig}
            onComplete={() => {
              // Reset for new video
              setCurrentStep(1);
              setCarData(null);
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {currentStep === 1 && "Commencez par coller un lien Rentop"}
          {currentStep === 2 && "Vérifiez les informations extraites"}
          {currentStep === 3 && "Configurez votre vidéo"}
          {currentStep === 4 && "Prévisualisez votre vidéo finale"}
          {currentStep === 5 && "Votre vidéo est en cours de création"}
        </div>
        
        <div className="w-24" /> {/* Spacer for centering */}
      </div>
    </div>
  );
}