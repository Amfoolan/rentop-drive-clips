"use client";
import { useState } from "react";

export default function PublishPanel({ videoUrl }: { videoUrl: string }) {
  const [caption, setCaption] = useState("Réserve ta voiture sur Rentop.co 🚗");
  const [publishing, setPublishing] = useState<string | null>(null);

  const handlePublish = async (platform: string) => {
    setPublishing(platform);
    try {
      const res = await fetch(`/publish/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, caption })
      });
      const json = await res.json();
      console.log(`${platform} publish result:`, json);
      alert(`${platform}: ${json.note || json.error || "Success"}`);
    } catch (e: any) {
      alert(`Erreur ${platform}: ${e.message}`);
    } finally {
      setPublishing(null);
    }
  };

  const handleAuth = (platform: string) => {
    window.location.href = `/api-auth/${platform}`;
  };

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Vidéo générée</h2>
      
      <div className="bg-gray-50 p-4 rounded border">
        <video 
          src={videoUrl} 
          controls 
          className="w-full max-w-xs mx-auto rounded border" 
          style={{ aspectRatio: '9/16' }}
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Description</label>
        <textarea 
          className="w-full border rounded p-2 h-24" 
          value={caption} 
          onChange={e => setCaption(e.target.value)} 
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button 
          className="border rounded px-3 py-2 hover:bg-gray-50" 
          onClick={() => window.open(videoUrl, "_blank")}
        >
          📥 Télécharger MP4
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="Configurer OAuth d'abord"
          onClick={() => handleAuth('instagram')}
        >
          📷 Auth Instagram
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="A implémenter"
          onClick={() => handlePublish('instagram')}
          disabled={publishing === 'instagram'}
        >
          {publishing === 'instagram' ? '⏳' : '📷'} Publier Instagram
        </button>

        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="Configurer OAuth d'abord"
          onClick={() => handleAuth('tiktok')}
        >
          🎵 Auth TikTok
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="A implémenter"
          onClick={() => handlePublish('tiktok')}
          disabled={publishing === 'tiktok'}
        >
          {publishing === 'tiktok' ? '⏳' : '🎵'} Publier TikTok
        </button>

        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="Configurer OAuth d'abord"
          onClick={() => handleAuth('youtube')}
        >
          📺 Auth YouTube
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="A implémenter"
          onClick={() => handlePublish('youtube')}
          disabled={publishing === 'youtube'}
        >
          {publishing === 'youtube' ? '⏳' : '📺'} Publier YouTube
        </button>

        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="Configurer OAuth d'abord"
          onClick={() => handleAuth('pinterest')}
        >
          📌 Auth Pinterest
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="A implémenter"
          onClick={() => handlePublish('pinterest')}
          disabled={publishing === 'pinterest'}
        >
          {publishing === 'pinterest' ? '⏳' : '📌'} Publier Pinterest
        </button>

        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="Configurer OAuth d'abord"
          onClick={() => handleAuth('x')}
        >
          🐦 Auth X
        </button>
        
        <button 
          className="border rounded px-3 py-2 opacity-60 cursor-not-allowed" 
          title="A implémenter"
          onClick={() => handlePublish('x')}
          disabled={publishing === 'x'}
        >
          {publishing === 'x' ? '⏳' : '🐦'} Publier X
        </button>
      </div>
    </section>
  );
}