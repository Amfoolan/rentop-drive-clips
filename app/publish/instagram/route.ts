import { NextRequest, NextResponse } from "next/server";

// Prévoir: ig_user_id et access_token en DB, refresh quand nécessaire
export async function POST(req: NextRequest) {
  try {
    const { videoUrl, caption } = await req.json();
    
    // TODO: Implémenter Meta Graph API
    // 1) POST /{ig_user_id}/media avec video_url et caption
    //    - Endpoint: https://graph.facebook.com/v18.0/{ig_user_id}/media
    //    - Body: { media_type: "REELS", video_url: videoUrl, caption }
    //    - Headers: { Authorization: `Bearer ${access_token}` }
    //    - Retour: { id: "creation_id" }
    //
    // 2) POST /{ig_user_id}/media_publish avec creation_id
    //    - Endpoint: https://graph.facebook.com/v18.0/{ig_user_id}/media_publish
    //    - Body: { creation_id }
    //    - Retour: { id: "media_id" }
    //
    // 3) GET /{media_id} pour récupérer permalink
    //    - Endpoint: https://graph.facebook.com/v18.0/{media_id}?fields=permalink
    //    - Retour: { permalink: "https://www.instagram.com/reel/..." }
    
    console.log("Instagram publish request:", { videoUrl, caption });
    
    return NextResponse.json({
      ok: false,
      note: "A implémenter: Meta Graph API publish",
      steps: [
        "1. Configurer Instagram Business Account",
        "2. Créer Facebook App avec Instagram Basic Display",
        "3. Obtenir access_token avec scopes instagram_content_publish",
        "4. Implémenter création + publication media",
        "5. Gérer refresh des tokens"
      ]
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}