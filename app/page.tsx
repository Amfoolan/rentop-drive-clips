"use client";
import { useState } from "react";

export default function Page() {
  const [images, setImages] = useState("");
  const [audio, setAudio] = useState("");
  const [title, setTitle] = useState("Rentop Clips Studio");
  const [fps, setFps] = useState(30);
  const [dur, setDur] = useState(2);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setErr(null);
    setVideoUrl(null);

    try {
      const payload = {
        images: images.split("\n").map(s => s.trim()).filter(Boolean),
        audio: audio.trim() || undefined,
        title: title.trim() || undefined,
        fps,
        durationPerImage: dur,
        width: 1080,
        height: 1920,
      };

      const res = await fetch("/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `encode failed (${res.status})`);
      }

      setVideoUrl(json.url as string);
    } catch (e: any) {
      setErr(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Rentop Video Creator</h1>
      <p className="text-sm opacity-70">Encodage MP4 côté serveur (1080x1920)</p>

      <label>Images URLs (une par ligne)</label>
      <textarea
        className="w-full border rounded p-2 h-36"
        placeholder={"https://picsum.photos/seed/1/1080/1920\nhttps://picsum.photos/seed/2/1080/1920"}
        value={images}
        onChange={(e) => setImages(e.target.value)}
      />

      <label>Audio MP3 (optionnel)</label>
      <input
        className="w-full border rounded p-2"
        placeholder="https://exemple.com/music.mp3"
        value={audio}
        onChange={(e) => setAudio(e.target.value)}
      />

      <label>Titre overlay (optionnel)</label>
      <input
        className="w-full border rounded p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex gap-4">
        <input
          type="number"
          className="w-24 border rounded p-2"
          value={fps}
          min={24}
          max={60}
          onChange={(e) => setFps(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-24 border rounded p-2"
          value={dur}
          min={1}
          max={5}
          onChange={(e) => setDur(Number(e.target.value))}
        />
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Encodage..." : "⚡ Générer MP4 Serveur"}
      </button>

      {err && <p className="text-red-600">{err}</p>}

      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded border" />
          <a href={videoUrl} download="rentop-clip.mp4" className="underline">Télécharger MP4</a>
        </div>
      )}
    </main>
  );
}
