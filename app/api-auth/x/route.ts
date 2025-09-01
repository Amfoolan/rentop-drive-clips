import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      // Redirect vers X OAuth 2.0
      const clientId = process.env.X_CLIENT_ID!;
      const redirectUri = `${req.nextUrl.origin}/api-auth/x`;
      const scope = 'tweet.write,media.upload,users.read';
      const state = 'random_state_string'; // générer aléatoirement
      const codeChallenge = 'code_challenge'; // PKCE challenge à générer
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      
      return NextResponse.redirect(authUrl);
    }
    
    // TODO: Échanger code contre access_token
    // 1) POST https://api.twitter.com/2/oauth2/token
    //    - Headers: { Content-Type: "application/x-www-form-urlencoded", Authorization: "Basic " + base64(client_id:client_secret) }
    //    - Body: grant_type=authorization_code&code={code}&redirect_uri={redirect_uri}&code_verifier={code_verifier}
    //    - Retour: { access_token, refresh_token, expires_in, scope, token_type }
    //
    // 2) Stocker tokens avec PKCE verifier
    
    console.log("X OAuth callback:", { code });
    
    return NextResponse.json({
      ok: false,
      note: "OAuth X callback - à implémenter",
      code
    });
    
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}