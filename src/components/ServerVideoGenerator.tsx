import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServerVideoGeneratorProps {
  onVideoGenerated?: (videoUrl: string) => void;
}

export const ServerVideoGenerator: React.FC<ServerVideoGeneratorProps> = ({
  onVideoGenerated
}) => {
  const [images, setImages] = useState<string>('');
  const [audio, setAudio] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [fps, setFps] = useState<number>(30);
  const [durationPerImage, setDurationPerImage] = useState<number>(2);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleGenerate = async () => {
    const imageList = images.split('\n').map(s => s.trim()).filter(Boolean);
    
    if (imageList.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins une image',
        variant: 'destructive'
      });
      return;
    }

    if (imageList.length > 30) {
      toast({
        title: 'Erreur',
        description: 'Maximum 30 images autorisées',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus('Initialisation...');
    setVideoUrl(null);

    try {
      setStatus('Envoi des données au serveur...');
      setProgress(10);

      // Call the server-side encoding Edge Function with new format
      const { data, error } = await supabase.functions.invoke('video-encoder-v2', {
        body: {
          images: imageList,
          audio: audio.trim() || undefined,
          title: title || 'Rentop Clips Studio',
          fps: fps,
          durationPerImage: durationPerImage,
          width: 1080,
          height: 1920
        }
      });

      if (error) {
        throw new Error(`Server encoding failed: ${error.message}`);
      }

      if (!data?.success || !data?.url) {
        throw new Error(data?.error || 'Server returned invalid response');
      }

      setStatus('Vidéo générée avec succès !');
      setProgress(100);
      setVideoUrl(data.url);
      
      toast({
        title: 'Succès !',
        description: `Vidéo générée côté serveur (Durée: ${data.duration}s)`,
      });

      if (onVideoGenerated) {
        onVideoGenerated(data.url);
      }

    } catch (error: any) {
      console.error('Server encoding error:', error);
      setStatus('Erreur de génération');
      toast({
        title: 'Erreur de génération',
        description: error.message || 'Impossible de générer la vidéo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExampleImages = () => {
    const exampleImages = [
      'https://picsum.photos/seed/car1/1080/1920',
      'https://picsum.photos/seed/car2/1080/1920',
      'https://picsum.photos/seed/car3/1080/1920',
      'https://picsum.photos/seed/car4/1080/1920',
      'https://picsum.photos/seed/car5/1080/1920'
    ].join('\n');
    
    setImages(exampleImages);
    setTitle('Test Rentop Clips Studio');
    
    toast({
      title: 'Images d\'exemple chargées',
      description: '5 images Picsum prêtes pour test'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎬 Générateur Vidéo Serveur
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadExampleImages}
            >
              📸 Charger exemples
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="images">Images URLs (une par ligne)</Label>
            <Textarea
              id="images"
              placeholder="https://picsum.photos/seed/1/1080/1920&#10;https://picsum.photos/seed/2/1080/1920&#10;https://picsum.photos/seed/3/1080/1920"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Max 30 images. Format recommandé: 1080x1920 (9:16)
            </p>
          </div>

          <div>
            <Label htmlFor="audio">Audio MP3 URL (optionnel)</Label>
            <Input
              id="audio"
              placeholder="https://example.com/music.mp3"
              value={audio}
              onChange={(e) => setAudio(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre overlay</Label>
              <Input
                id="title"
                placeholder="Lamborghini Huracan 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div>
                <Label htmlFor="fps">FPS</Label>
                <Input
                  id="fps"
                  type="number"
                  min={24}
                  max={60}
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div>
                <Label htmlFor="duration">Durée/image (s)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={5}
                  value={durationPerImage}
                  onChange={(e) => setDurationPerImage(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '⏳ Génération en cours...' : '🚀 Générer MP4 Serveur'}
          </Button>
        </CardContent>
      </Card>

      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>🎥 Vidéo Générée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <video
                src={videoUrl}
                controls
                className="max-w-xs rounded border"
                style={{ aspectRatio: '9/16' }}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline"
                onClick={() => window.open(videoUrl, '_blank')}
              >
                📥 Télécharger
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(videoUrl);
                  toast({
                    title: 'URL copiée',
                    description: 'URL de la vidéo copiée dans le presse-papiers'
                  });
                }}
              >
                📋 Copier URL
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Format: WebM (1080x1920) - Compatible réseaux sociaux</p>
              <p>Encodage: Serveur Supabase Edge Functions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};