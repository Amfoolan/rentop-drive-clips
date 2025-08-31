import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, IText, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Move, 
  Palette, 
  RotateCcw, 
  Check,
  AlignCenter,
  AlignLeft,
  AlignRight
} from "lucide-react";

interface TextEditorProps {
  backgroundImage: string;
  initialText: string;
  onTextUpdate: (text: string, position: { x: number; y: number }, style: TextStyle) => void;
  onComplete: () => void;
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

const PRESET_POSITIONS = [
  { name: "Haut centre", x: 540, y: 300 },
  { name: "Centre", x: 540, y: 960 },
  { name: "Bas centre", x: 540, y: 1620 },
  { name: "Haut gauche", x: 150, y: 300 },
  { name: "Haut droite", x: 930, y: 300 }
];

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Impact",
  "Comic Sans MS",
  "Verdana",
  "Georgia"
];

const COLORS = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080"
];

export function TextEditor({ backgroundImage, initialText, onTextUpdate, onComplete }: TextEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedText, setSelectedText] = useState<IText | null>(null);
  const [currentText, setCurrentText] = useState(initialText);
  
  // Style controls
  const [fontSize, setFontSize] = useState([48]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontWeight, setFontWeight] = useState("bold");
  const [textAlign, setTextAlign] = useState("center");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1080,
      height: 1920,
      backgroundColor: "transparent",
    });

    // Add background image as canvas background
    if (backgroundImage) {
      canvas.backgroundColor = "#f0f0f0";
      
      // Add the image as a background object that can't be selected
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const fabricImg = new FabricImage(img, {
          left: 0,
          top: 0,
          scaleX: 1080 / img.width,
          scaleY: 1920 / img.height,
          selectable: false,
          evented: false
        });
        canvas.add(fabricImg);
        canvas.sendObjectToBack(fabricImg);
        canvas.renderAll();
      };
      img.src = backgroundImage;
    }

    // Add initial text
    const textObj = new IText(currentText, {
      left: 540,
      top: 960,
      fontSize: 48,
      fontFamily: "Arial",
      fill: "#ffffff",
      fontWeight: "bold",
      textAlign: "center",
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center"
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    setSelectedText(textObj);
    setFabricCanvas(canvas);

    // Event listeners
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0] as IText;
      if (obj && obj.type === 'i-text') {
        setSelectedText(obj);
        updateStyleControls(obj);
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0] as IText;
      if (obj && obj.type === 'i-text') {
        setSelectedText(obj);
        updateStyleControls(obj);
      }
    });

    canvas.on('object:modified', () => {
      if (selectedText) {
        notifyTextUpdate();
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [backgroundImage]);

  const updateStyleControls = (textObj: IText) => {
    setFontSize([textObj.fontSize || 48]);
    setFontFamily(textObj.fontFamily || "Arial");
    setTextColor(textObj.fill as string || "#ffffff");
    setFontWeight(textObj.fontWeight as string || "bold");
    setTextAlign(textObj.textAlign || "center");
    setStrokeColor(textObj.stroke as string || "#000000");
    setStrokeWidth([textObj.strokeWidth || 2]);
  };

  const notifyTextUpdate = () => {
    if (selectedText) {
      const style: TextStyle = {
        fontSize: selectedText.fontSize || 48,
        fontFamily: selectedText.fontFamily || "Arial",
        fill: selectedText.fill as string || "#ffffff",
        fontWeight: selectedText.fontWeight as string || "bold",
        textAlign: selectedText.textAlign || "center",
        stroke: selectedText.stroke as string || "#000000",
        strokeWidth: selectedText.strokeWidth || 2
      };
      
      onTextUpdate(
        selectedText.text || "",
        { x: selectedText.left || 0, y: selectedText.top || 0 },
        style
      );
    }
  };

  const updateText = () => {
    if (selectedText && fabricCanvas) {
      selectedText.set({ text: currentText });
      fabricCanvas.renderAll();
      notifyTextUpdate();
    }
  };

  const updateStyle = (property: string, value: any) => {
    if (selectedText && fabricCanvas) {
      selectedText.set({ [property]: value });
      fabricCanvas.renderAll();
      notifyTextUpdate();
    }
  };

  const setPresetPosition = (position: { x: number; y: number }) => {
    if (selectedText && fabricCanvas) {
      selectedText.set({
        left: position.x,
        top: position.y
      });
      fabricCanvas.renderAll();
      notifyTextUpdate();
    }
  };

  const resetText = () => {
    if (fabricCanvas && selectedText) {
      fabricCanvas.remove(selectedText);
      
      const newText = new IText(initialText, {
        left: 540,
        top: 960,
        fontSize: 48,
        fontFamily: "Arial",
        fill: "#ffffff",
        fontWeight: "bold",
        textAlign: "center",
        stroke: "#000000",
        strokeWidth: 2,
        originX: "center",
        originY: "center"
      });

      fabricCanvas.add(newText);
      fabricCanvas.setActiveObject(newText);
      setSelectedText(newText);
      setCurrentText(initialText);
      
      // Reset controls
      setFontSize([48]);
      setFontFamily("Arial");
      setTextColor("#ffffff");
      setFontWeight("bold");
      setTextAlign("center");
      setStrokeColor("#000000");
      setStrokeWidth([2]);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Canvas */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Éditeur visuel de texte</h3>
          <p className="text-sm text-muted-foreground">
            Glissez-déposez le texte pour le positionner
          </p>
        </div>
        
        <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-background flex justify-center">
          <div className="relative" style={{ width: '270px', height: '480px' }}>
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          </div>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button onClick={resetText} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={onComplete} className="bg-primary">
            <Check className="h-4 w-4 mr-2" />
            Valider
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Texte et contenu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-content">Contenu du texte</Label>
              <Input
                id="text-content"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                onBlur={updateText}
                onKeyDown={(e) => e.key === 'Enter' && updateText()}
                placeholder="Votre texte ici..."
              />
            </div>

            <div>
              <Label>Taille de police</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={fontSize}
                  onValueChange={(value) => {
                    setFontSize(value);
                    updateStyle('fontSize', value[0]);
                  }}
                  max={120}
                  min={16}
                  step={2}
                  className="flex-1"
                />
                <Badge variant="secondary">{fontSize[0]}px</Badge>
              </div>
            </div>

            <div>
              <Label>Police</Label>
              <Select value={fontFamily} onValueChange={(value) => {
                setFontFamily(value);
                updateStyle('fontFamily', value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map(font => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Style et couleurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Couleur du texte</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 ${textColor === color ? 'border-primary' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setTextColor(color);
                      updateStyle('fill', color);
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Contour</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${strokeColor === color ? 'border-primary' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setStrokeColor(color);
                      updateStyle('stroke', color);
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <Label className="text-sm">Épaisseur</Label>
                <Slider
                  value={strokeWidth}
                  onValueChange={(value) => {
                    setStrokeWidth(value);
                    updateStyle('strokeWidth', value[0]);
                  }}
                  max={10}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary">{strokeWidth[0]}px</Badge>
              </div>
            </div>

            <div>
              <Label>Alignement</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTextAlign('left');
                    updateStyle('textAlign', 'left');
                  }}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTextAlign('center');
                    updateStyle('textAlign', 'center');
                  }}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTextAlign('right');
                    updateStyle('textAlign', 'right');
                  }}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Move className="h-5 w-5" />
              Positions prédéfinies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_POSITIONS.map((pos) => (
                <Button
                  key={pos.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetPosition(pos)}
                  className="justify-start"
                >
                  {pos.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}