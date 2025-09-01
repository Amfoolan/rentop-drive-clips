"use client";

import { useState } from "react";
import ClipBuilder from "@/components/ClipBuilder";
import PublishPanel from "@/components/PublishPanel";

export default function Page() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Rentop Clips Studio</h1>
      <ClipBuilder onEncoded={setVideoUrl} />
      {videoUrl && <PublishPanel videoUrl={videoUrl} />}
    </main>
  );
}