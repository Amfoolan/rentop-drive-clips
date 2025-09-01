import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      // Redirect vers Instagram OAuth
      const clientId = process.env.INSTAGRAM_APP_ID!;
      const redirectUri = `${req.nextUrl.origin}/api-auth/instagram`;
      const scope = 'instagram_content_publish,pages_show_list,pages_read_engagement';
      
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
      
      return NextResponse.redirect(authUrl);
    }
    
    // TODO: Échanger code contre access_token
    // 1) POST https://api.instagram.com/oauth/access_token
    //    - Body: { client_id, client_secret, grant_type: "authorization_code", redirect_uri, code }
    //    - Retour: { access_token, user_id }
    //
    // 2) Échanger short-lived token contre long-lived token
    //    - GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret={client_secret}&access_token={access_token}
    //
    // 3) Stocker en DB avec user_id et expiration
    
    console.log("Instagram OAuth callback:", { code });
    
    return NextResponse.json({
      ok: false,
      note: "OAuth Instagram callback - à implémenter",
      code
    });
    
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}