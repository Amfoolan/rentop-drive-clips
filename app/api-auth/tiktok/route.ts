import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      // Redirect vers TikTok OAuth
      const clientKey = process.env.TIKTOK_CLIENT_KEY!;
      const redirectUri = `${req.nextUrl.origin}/api-auth/tiktok`;
      const scope = 'video.upload,video.publish';
      const state = 'random_state_string'; // générer aléatoirement
      
      const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      return NextResponse.redirect(authUrl);
    }
    
    // TODO: Échanger code contre access_token
    // 1) POST https://open.tiktokapis.com/v2/oauth/token/
    //    - Headers: { Content-Type: "application/x-www-form-urlencoded" }
    //    - Body: client_key={client_key}&client_secret={client_secret}&code={code}&grant_type=authorization_code&redirect_uri={redirect_uri}
    //    - Retour: { access_token, refresh_token, expires_in, refresh_expires_in, scope }
    //
    // 2) Stocker tokens avec refresh logic
    
    console.log("TikTok OAuth callback:", { code });
    
    return NextResponse.json({
      ok: false,
      note: "OAuth TikTok callback - à implémenter",
      code
    });
    
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}