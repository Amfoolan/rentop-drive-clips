import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      // Redirect vers Google OAuth
      const clientId = process.env.YOUTUBE_CLIENT_ID!;
      const redirectUri = `${req.nextUrl.origin}/api-auth/youtube`;
      const scope = 'https://www.googleapis.com/auth/youtube.upload';
      const state = 'random_state_string'; // générer aléatoirement
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&state=${state}`;
      
      return NextResponse.redirect(authUrl);
    }
    
    // TODO: Échanger code contre access_token
    // 1) POST https://oauth2.googleapis.com/token
    //    - Headers: { Content-Type: "application/x-www-form-urlencoded" }
    //    - Body: client_id={client_id}&client_secret={client_secret}&code={code}&grant_type=authorization_code&redirect_uri={redirect_uri}
    //    - Retour: { access_token, refresh_token, expires_in, scope, token_type }
    //
    // 2) Stocker tokens avec refresh automatique
    
    console.log("YouTube OAuth callback:", { code });
    
    return NextResponse.json({
      ok: false,
      note: "OAuth YouTube callback - à implémenter",
      code
    });
    
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}