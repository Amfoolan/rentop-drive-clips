"use client";

interface PreviewPlayerProps {
  videoUrl: string;
  title?: string;
}

export default function PreviewPlayer({ videoUrl, title }: PreviewPlayerProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      
      <div className="relative">
        <video
          src={videoUrl}
          controls
          className="w-full max-w-xs mx-auto rounded border"
          style={{ aspectRatio: '9/16' }}
          poster="/logo.png"
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Format: MP4 (1080x1920) - Compatible TikTok/Instagram Reels
        </p>
      </div>
    </div>
  );
}