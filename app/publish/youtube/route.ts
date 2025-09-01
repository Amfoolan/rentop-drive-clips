import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, caption } = await req.json();
    
    // TODO: Implémenter YouTube Data API v3
    // 1) POST /upload/youtube/v3/videos pour upload
    //    - Endpoint: https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status
    //    - Headers: { Authorization: `Bearer ${access_token}`, Content-Type: "multipart/related" }
    //    - Body multipart: metadata JSON + video binary
    //    - Metadata: { 
    //        snippet: { title: caption.slice(0,100), description: caption, tags: ["shorts"], categoryId: "22" },
    //        status: { privacyStatus: "public", selfDeclaredMadeForKids: false }
    //      }
    //    - Retour: { id: "video_id", snippet: { ... } }
    //
    // Note: YouTube Shorts détecté automatiquement si durée < 60s et ratio vertical
    
    console.log("YouTube publish request:", { videoUrl, caption });
    
    return NextResponse.json({
      ok: false,
      note: "A implémenter: YouTube Data API v3",
      steps: [
        "1. Créer Google Cloud Project + activer YouTube Data API v3",
        "2. Configurer OAuth 2.0 avec scope https://www.googleapis.com/auth/youtube.upload",
        "3. Gérer quota API (coût 1600 unités par upload)",
        "4. Implémenter upload multipart avec metadata",
        "5. Format Shorts: durée < 60s, ratio vertical automatiquement détecté"
      ]
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}