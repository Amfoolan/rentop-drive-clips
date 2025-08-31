import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TextEditor } from "../TextEditor";
import { CarData, VideoConfig } from "../StepByStepGenerator";

interface TextEditingStepProps {
  carData: CarData;
  config: VideoConfig;
  onNext: (updatedConfig: VideoConfig) => void;
  onPrev: () => void;
}

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  textAlign: string;
  stroke: string;
  strokeWidth: number;
}

export function TextEditingStep({ carData, config, onNext, onPrev }: TextEditingStepProps) {
  const [updatedConfig, setUpdatedConfig] = useState(config);

  const handleTextUpdate = (text: string, position: { x: number; y: number }, style: TextStyle) => {
    setUpdatedConfig(prev => ({
      ...prev,
      overlayText: text,
      textPosition: position.y < 640 ? 'top' : position.y > 1280 ? 'bottom' : 'center'
    }));
  };

  const handleComplete = () => {
    onNext(updatedConfig);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-center">
            Personnalisez votre texte
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Utilisez l'éditeur visuel pour positionner et styliser votre texte
          </p>
        </CardHeader>
        <CardContent>
          <TextEditor
            backgroundImage={carData.images[0]}
            initialText={config.overlayText}
            onTextUpdate={handleTextUpdate}
            onComplete={handleComplete}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleComplete} className="flex items-center gap-2">
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}