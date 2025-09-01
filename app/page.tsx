"use client";

import { useState } from "react";

export default function Page() {
  const [images, setImages] = useState("");
  const [audio, setAudio] = useState("");
  const [title, setTitle] = useState("Lamborghini Huracan 2024");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleEncode() {
    setLoading(true);
    setErr(null);
    setVideoUrl(null);
    
    try {
      const payload = {
        images: images.split("\n").map(s => s.trim()).filter(Boolean),
        audio: audio.trim() || undefined,
        title,
        fps: 30,
        durationPerImage: 2,
        width: 1080,
        height: 1920
      };

      const res = await fetch("/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "encode failed");
      
      setVideoUrl(json.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function loadExampleImages() {
    setImages([
      "https://picsum.photos/1080/1920?random=1",
      "https://picsum.photos/1080/1920?random=2", 
      "https://picsum.photos/1080/1920?random=3",
      "https://picsum.photos/1080/1920?random=4",
      "https://picsum.photos/1080/1920?random=5"
    ].join("\n"));
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Rentop Drive Clips</h1>
        <p className="text-gray-600">Générateur de vidéos MP4 avec encodage serveur</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URLs des images (une par ligne)</label>
          <textarea 
            className="w-full border rounded-lg p-3 h-36 font-mono text-sm" 
            placeholder="https://picsum.photos/1080/1920?random=1&#10;https://picsum.photos/1080/1920?random=2&#10;..."
            value={images} 
            onChange={e => setImages(e.target.value)} 
          />
          <button 
            onClick={loadExampleImages}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Charger des images d'exemple
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL audio MP3 (optionnel)</label>
          <input 
            className="w-full border rounded-lg p-3" 
            placeholder="https://example.com/audio.mp3"
            value={audio} 
            onChange={e => setAudio(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Titre overlay (optionnel)</label>
          <input 
            className="w-full border rounded-lg p-3" 
            placeholder="Lamborghini Huracan 2024"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>

        <button 
          className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800" 
          disabled={loading || !images.trim()} 
          onClick={handleEncode}
        >
          {loading ? "Encodage en cours..." : "Générer MP4"}
        </button>

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{err}</p>
          </div>
        )}

        {videoUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <p className="text-green-600 text-sm font-medium">✅ Vidéo générée avec succès!</p>
            <video 
              src={videoUrl} 
              controls 
              className="w-full rounded-lg border max-h-96" 
            />
            <div className="flex gap-2">
              <a 
                href={videoUrl} 
                download 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                📥 Télécharger MP4
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(videoUrl)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                📋 Copier URL
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
        <p>• Format de sortie: MP4 H.264 + AAC, 1080x1920, 30fps</p>
        <p>• Durée recommandée: 10-20 secondes (6-12 images)</p>
        <p>• Images: minimum 2, maximum 30</p>
      </div>
    </main>
  );
}