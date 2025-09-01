"use client";
import { useState } from "react";

type Props = { onEncoded: (url: string) => void };

export default function ClipBuilder({ onEncoded }: Props) {
  const [images, setImages] = useState<string>("");
  const [audio, setAudio] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const [fps, setFps] = useState(30);
  const [dur, setDur] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEncode() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        images: images.split("\n").map(s => s.trim()).filter(Boolean),
        audio: audio.trim() || undefined,
        title,
        fps,
        durationPerImage: dur,
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
      onEncoded(json.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <label className="block font-medium mb-2">Images URLs (une par ligne)</label>
        <textarea 
          className="w-full border rounded p-2 h-32" 
          value={images} 
          onChange={e => setImages(e.target.value)} 
          placeholder="https://picsum.photos/seed/1/1080/1920&#10;https://picsum.photos/seed/2/1080/1920&#10;https://picsum.photos/seed/3/1080/1920" 
        />
      </div>
      <div>
        <label className="block font-medium mb-2">Audio MP3 URL (optionnel)</label>
        <input 
          className="w-full border rounded p-2" 
          value={audio} 
          onChange={e => setAudio(e.target.value)} 
          placeholder="https://example.com/music.mp3" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-2">Titre overlay (optionnel)</label>
          <input 
            className="w-full border rounded p-2" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Lamborghini Huracan 2024" 
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block font-medium mb-2">FPS</label>
            <input 
              type="number" 
              className="w-20 border rounded p-2" 
              value={fps} 
              min={24} 
              max={60} 
              onChange={e => setFps(Number(e.target.value))} 
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Durée/image (s)</label>
            <input 
              type="number" 
              className="w-24 border rounded p-2" 
              value={dur} 
              min={1} 
              max={5} 
              onChange={e => setDur(Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <button 
        disabled={loading} 
        onClick={handleEncode} 
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Encodage..." : "Générer MP4"}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </section>
  );
}