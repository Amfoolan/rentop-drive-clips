import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ALLOWED_EMAILS = ['rentop.co.ae@gmail.com', 'amine.ready@gmail.com'];

serve(async (req) => {
  const { record } = await req.json()

  // Vérifier si l'email est autorisé
  if (!ALLOWED_EMAILS.includes(record.email.toLowerCase())) {
    return new Response(
      JSON.stringify({ 
        error: 'Accès refusé. Cette application est privée.' 
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Utilisateur autorisé' }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})