import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      // Redirect vers Pinterest OAuth
      const clientId = process.env.PINTEREST_CLIENT_ID!;
      const redirectUri = `${req.nextUrl.origin}/api-auth/pinterest`;
      const scope = 'pins:read,pins:write,boards:read,boards:write';
      const state = 'random_state_string'; // générer aléatoirement
      
      const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
      
      return NextResponse.redirect(authUrl);
    }
    
    // TODO: Échanger code contre access_token
    // 1) POST https://api.pinterest.com/v5/oauth/token
    //    - Headers: { Content-Type: "application/x-www-form-urlencoded" }
    //    - Body: grant_type=authorization_code&client_id={client_id}&client_secret={client_secret}&code={code}&redirect_uri={redirect_uri}
    //    - Retour: { access_token, refresh_token, expires_in, refresh_token_expires_in, scope, token_type }
    //
    // 2) Stocker tokens avec refresh logic
    
    console.log("Pinterest OAuth callback:", { code });
    
    return NextResponse.json({
      ok: false,
      note: "OAuth Pinterest callback - à implémenter",
      code
    });
    
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}