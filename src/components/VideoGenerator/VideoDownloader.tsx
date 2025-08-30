import { GeneratedVideo } from "@/hooks/useGeneratedVideos";

export class VideoDownloader {
  static async downloadVideo(video: GeneratedVideo): Promise<void> {
    try {
      // Create a more realistic demo video file (base64 encoded simple video data)
      const videoData = VideoDownloader.createDemoVideo(video);
      
      const blob = new Blob([videoData], { type: 'video/mp4' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${VideoDownloader.sanitizeFilename(video.title)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Erreur lors du téléchargement de la vidéo');
    }
  }

  private static createDemoVideo(video: GeneratedVideo): Uint8Array {
    // Create a minimal MP4 file structure for demo purposes
    // This is a very basic MP4 header - in production, you would generate a real video
    const mp4Header = new Uint8Array([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
    ]);

    // Add video metadata as comments in the file
    const metadata = `
# Vidéo générée par Rentop Video Creator
# Titre: ${video.title}
# URL source: ${video.url}
# Date: ${new Date(video.created_at).toLocaleDateString()}
# Texte overlay: ${video.overlay_text || 'N/A'}
# Script voix-off: ${video.voiceover_text || 'N/A'}
# Format: MP4 - 1080x1920 (9:16)
# Durée: 15 secondes
# Images utilisées: ${Array.isArray(video.car_data?.images) ? video.car_data.images.length : 0}
# Statut: ${video.status}
`;

    const metadataBytes = new TextEncoder().encode(metadata);
    
    // Combine header with metadata
    const result = new Uint8Array(mp4Header.length + metadataBytes.length);
    result.set(mp4Header, 0);
    result.set(metadataBytes, mp4Header.length);
    
    return result;
  }

  private static sanitizeFilename(filename: string): string {
    // Remove invalid characters for filenames
    return filename
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100); // Limit length
  }
}