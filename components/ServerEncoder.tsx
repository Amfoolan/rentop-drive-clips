"use client";
import { useState } from "react";

type Payload = {
  images: string[];
  audio?: string;
  title?: string;
  fps?: number;
  durationPerImage?: number;
  width?: number;
  height?: number;
};

async function generateServerMp4(payload: Payload) {
  const res = await fetch("/encode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      width: 1080,
      height: 1920,
      fps: 30,
      durationPerImage: 2,
      ...payload,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.ok) throw new Error(json?.error || `encode failed (${res.status})`);
  return json.url as string;
}

export default function ServerEncoder() {
  const [images, setImages] = useState("");
  const [audio, setAudio] = useState("");
  const [title, setTitle] = useState("Rentop Clips Studio");
  const [fps, setFps] = useState(30);
  const [dur, setDur] = useState(2);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true); setErr(null); setVideoUrl(null);
    try {
      const list = images.split("\n").map(s => s.trim()).filter(Boolean);
      if (list.length < 2) throw new Error("Ajoute au moins 2 URLs d’images");
      const url = await generateServerMp4({
        images: list,
        audio: audio.trim() || undefined,
        title: title.trim() || undefined,
        fps,
        durationPerImage: dur,
      });
      setVideoUrl(url);
    } catch (e:any) {
      setErr(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🚀 Encodage Serveur (MP4 H.264/AAC)</h2>

      <label className="block text-sm font-medium">Images URLs (une par ligne)</label>
      <textarea
        className="w-full border rounded p-2 h-36"
        placeholder={"https://picsum.photos/seed/1/1080/1920\nhttps://picsum.photos/seed/2/1080/1920\nhttps://picsum.photos/seed/3/1080/1920"}
        value={images}
        onChange={(e)=>setImages(e.target.value)}
      />

      <label className="block text-sm font-medium">Audio MP3 (optionnel)</label>
      <input
        className="w-full border rounded p-2"
        placeholder="https://exemple.com/music.mp3"
        value={audio}
        onChange={(e)=>setAudio(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Titre overlay (optionnel)</label>
          <input className="w-full border rounded p-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium">FPS</label>
            <input type="number" min={24} max={60} className="w-24 border rounded p-2"
              value={fps} onChange={(e)=>setFps(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Durée / image (s)</label>
            <input type="number" min={1} max={5} className="w-28 border rounded p-2"
              value={dur} onChange={(e)=>setDur(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Encodage..." : "⚡ Générer MP4 Serveur"}
      </button>

      {err && <p className="text-red-600">{err}</p>}

      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded border" />
          <div className="flex gap-4">
            <a href={videoUrl} download="rentop-clip.mp4" className="underline">Télécharger MP4</a>
            <a href={videoUrl} target="_blank" rel="noreferrer" className="underline">Ouvrir dans un onglet</a>
          </div>
          <p className="text-xs opacity-70 break-all">{videoUrl}</p>
        </div>
      )}
    </div>
  );
}
