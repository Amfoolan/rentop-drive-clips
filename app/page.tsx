"use client";
import { useState } from "react";

export default function Page() {
  const [images, setImages] = useState("");
  const [audio, setAudio] = useState("");
  const [title, setTitle] = useState("Lamborghini Huracan 2024");
  const [fps, setFps] = useState(30);
  const [dur, setDur] = useState(2);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setErr(null); setVideoUrl(null);
    try {
      const payload = {
        images: images.split("\n").map(s => s.trim()).filter(Boolean),
        audio: audio.trim() || undefined,
        title: title.trim() || undefined,
        fps,
        durationPerImage: dur,
        width: 1080,
        height: 1920
      };
      // 👉 Appel direct à ta route Vercel (PAS d’Edge Function Supabase)
      const res = await fetch("/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || `encode failed (${res.status})`);
      setVideoUrl(json.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Rentop Video Creator</h1>

      <label className="block font-medium">Images URLs (une par ligne)</label>
      <textarea className="w-full border rounded p-2 h-36"
        placeholder={"https://picsum.photos/seed/1/1080/1920\nhttps://picsum.photos/seed/2/1080/1920\nhttps://picsum.photos/seed/3/1080/1920"}
        value={images} onChange={e=>setImages(e.target.value)} />

      <label className="block font-medium">Audio MP3 (optionnel)</label>
      <input className="w-full border rounded p-2" value={audio} onChange={e=>setAudio(e.target.value)} placeholder="https://exemple.com/music.mp3" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Titre overlay (optionnel)</label>
          <input className="w-full border rounded p-2" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block font-medium">FPS</label>
            <input type="number" className="w-24 border rounded p-2" min={24} max={60} value={fps} onChange={e=>setFps(Number(e.target.value))} />
          </div>
          <div>
            <label className="block font-medium">Durée / image (s)</label>
            <input type="number" className="w-28 border rounded p-2" min={1} max={5} value={dur} onChange={e=>setDur(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={loading}
        className="bg-black text-white px-4 py-2 rounded">
        {loading ? "Encodage..." : "Générer MP4 Serveur"}
      </button>

      {err && <p className="text-red-600">{err}</p>}

      {videoUrl && (
        <section className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded border" />
          <a href={videoUrl} download className="underline">Télécharger MP4</a>
        </section>
      )}
    </main>
  );
}
