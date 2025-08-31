import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Music, Play, Pause, Trash2, Check } from "lucide-react";
import { useState, useRef } from "react";
import { VideoConfig } from "../StepByStepGenerator";

interface AudioUploadProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

export function AudioUpload({ config, onConfigChange }: AudioUploadProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio valide (MP3, WAV, etc.)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Le fichier audio ne doit pas dépasser 50MB');
      return;
    }

    // Create audio URL for preview and get duration
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      
      // Update config with uploaded audio
      onConfigChange({
        ...config,
        audioSource: 'upload',
        uploadedAudio: {
          file,
          duration,
          url: audioUrl
        }
      });
      
      setUploadProgress(100);
    });

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    audio.load();
  };

  const playAudio = () => {
    if (!config.uploadedAudio) return;
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = config.uploadedAudio.url;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  const removeAudio = () => {
    if (config.uploadedAudio?.url) {
      URL.revokeObjectURL(config.uploadedAudio.url);
    }
    
    onConfigChange({
      ...config,
      audioSource: 'elevenlabs',
      uploadedAudio: undefined
    });
    
    setUploadProgress(0);
    setIsPlaying(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-muted/20 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Music className="h-4 w-4" />
            Upload audio MP3
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!config.uploadedAudio ? (
            <>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Uploadez votre piste audio</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Formats supportés: MP3, WAV, M4A (max 50MB)
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choisir un fichier audio
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Audio file info */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Fichier audio uploadé</h4>
                      <p className="text-sm text-muted-foreground">{config.uploadedAudio.file.name}</p>
                      <div className="flex gap-4 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatDuration(config.uploadedAudio.duration)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(config.uploadedAudio.file.size)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={removeAudio}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Audio controls */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={playAudio}
                  variant="outline" 
                  size="sm"
                  disabled={!config.uploadedAudio}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Écouter
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Audio prêt pour la génération</span>
                </div>
              </div>

              {/* Video adaptation info */}
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                <h4 className="font-medium text-accent text-sm mb-2">Adaptation vidéo</h4>
                <p className="text-xs text-muted-foreground">
                  Les photos seront répétées pour couvrir toute la durée de votre piste audio ({formatDuration(config.uploadedAudio.duration)}).
                  Si vous avez 5 photos et 15 secondes d'audio, les photos défileront 3 fois.
                </p>
              </div>

              <audio ref={audioRef} className="hidden" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}