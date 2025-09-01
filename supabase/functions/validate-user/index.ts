import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Security headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json()
    
    // Initialize Supabase client for audit logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get client info for audit logging
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const xForwardedFor = req.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor?.split(',')[0] || 'unknown'

    // Log the validation attempt
    await supabase.rpc('log_security_event', {
      p_event_type: 'email_validation_attempt',
      p_user_email: record.email,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_details: { timestamp: new Date().toISOString() }
    })

    // Note: Email validation is now handled by database trigger
    // This function serves as additional logging and can be removed if desired
    
    return new Response(
      JSON.stringify({ 
        message: 'Validation logged - database trigger will enforce email whitelist',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Validation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during validation',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})