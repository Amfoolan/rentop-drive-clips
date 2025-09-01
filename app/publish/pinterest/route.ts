import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, caption } = await req.json();
    
    // TODO: Implémenter Pinterest API v5
    // 1) POST /pins pour créer un Pin vidéo
    //    - Endpoint: https://api.pinterest.com/v5/pins
    //    - Headers: { Authorization: `Bearer ${access_token}`, Content-Type: "application/json" }
    //    - Body: {
    //        link: "https://rentop.co", // lien de destination
    //        title: caption.slice(0, 100),
    //        description: caption,
    //        media_source: {
    //          source_type: "video_url",
    //          url: videoUrl,
    //          cover_image_url: thumbnail_url // optionnel
    //        },
    //        board_id: "board_id" // requis
    //      }
    //    - Retour: { id: "pin_id", url: "https://pinterest.com/pin/..." }
    
    console.log("Pinterest publish request:", { videoUrl, caption });
    
    return NextResponse.json({
      ok: false,
      note: "A implémenter: Pinterest API v5",
      steps: [
        "1. Créer Pinterest Developer App",
        "2. Obtenir access_token avec scopes pins:read, pins:write, boards:read",
        "3. Créer/sélectionner board_id pour publication",
        "4. Implémenter création Pin avec video_url",
        "5. Pinterest supporte vidéos jusqu'à 2GB, max 15min"
      ]
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}