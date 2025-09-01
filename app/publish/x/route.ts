import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, caption } = await req.json();
    
    // TODO: Implémenter X (Twitter) API v2
    // 1) POST /2/media/upload pour upload média
    //    - Endpoint: https://upload.twitter.com/1.1/media/upload.json
    //    - Method: Chunked upload pour vidéos > 5MB
    //    - Steps: INIT -> APPEND (chunks) -> FINALIZE -> STATUS (si processing)
    //    - Headers: { Authorization: OAuth 1.0a signature }
    //
    // 2) POST /2/tweets pour créer tweet avec média
    //    - Endpoint: https://api.twitter.com/2/tweets
    //    - Body: { text: caption, media: { media_ids: [media_id] } }
    //    - Headers: { Authorization: `Bearer ${access_token}` }
    //    - Retour: { data: { id: "tweet_id", text: "..." } }
    
    console.log("X publish request:", { videoUrl, caption });
    
    return NextResponse.json({
      ok: false,
      note: "A implémenter: X (Twitter) API v2",
      steps: [
        "1. Créer X Developer Account + Project",
        "2. Configurer OAuth 2.0 avec scopes tweet.write, media.upload",
        "3. Implémenter chunked upload pour vidéos",
        "4. Gérer processing status pour gros fichiers",
        "5. Limites: 512MB max, formats MP4/MOV/GIF"
      ]
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}