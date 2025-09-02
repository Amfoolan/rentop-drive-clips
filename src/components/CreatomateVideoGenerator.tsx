import { useState } from 'react'

interface CreatomateResponse {
  success: boolean
  videoUrl?: string
  error?: string
}

export default function CreatomateVideoGenerator() {
  const [images, setImages] = useState("")
  const [audio, setAudio] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateVideo = async () => {
    setLoading(true)
    setError(null)
    setVideoUrl(null)

    try {
      const imageUrls = images.split('\n').map(s => s.trim()).filter(Boolean)
      if (imageUrls.length < 2) {
        throw new Error('Veuillez ajouter au moins 2 URLs d\'images')
      }

      const response = await fetch('/api/creatomate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imageUrls,
          audio: audio.trim() || undefined,
          title: title.trim() || undefined,
        }),
      })

      const result: CreatomateResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération')
      }

      setVideoUrl(result.videoUrl!)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Creatomate Video Generator</h1>
        <p className="text-muted-foreground">Créez des vidéos professionnelles à partir d'images</p>
      </div>

      <div className="bg-card p-6 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            URLs des images (une par ligne)
          </label>
          <textarea
            className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground resize-none"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            value={images}
            onChange={(e) => setImages(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            URL de l'audio (optionnel)
          </label>
          <input
            type="url"
            className="w-full p-3 border border-input rounded-md bg-background text-foreground"
            placeholder="https://example.com/audio.mp3"
            value={audio}
            onChange={(e) => setAudio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Titre de la vidéo (optionnel)
          </label>
          <input
            type="text"
            className="w-full p-3 border border-input rounded-md bg-background text-foreground"
            placeholder="Mon titre de vidéo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <button
          onClick={generateVideo}
          disabled={loading || !images.trim()}
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {loading ? 'Génération en cours...' : 'Générer la vidéo'}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
          <p className="font-medium">Erreur:</p>
          <p>{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Vidéo générée</h3>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-md"
            style={{ maxHeight: '400px' }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
          <div className="flex gap-4">
            <a
              href={videoUrl}
              download="video.mp4"
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
            >
              Télécharger
            </a>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-outline text-foreground px-4 py-2 rounded-md border hover:bg-accent transition-colors"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
      )}
    </div>
  )
}