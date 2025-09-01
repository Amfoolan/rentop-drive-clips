import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');
const SHOTSTACK_BASE_URL = 'https://api.shotstack.io/stage';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { renderId }: { renderId: string } = await req.json();

    console.log('Checking Shotstack render status for:', renderId);

    // Check render status
    const statusResponse = await fetch(`${SHOTSTACK_BASE_URL}/render/${renderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SHOTSTACK_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Shotstack status error:', errorText);
      throw new Error(`Erreur statut Shotstack: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log('Shotstack render status:', statusData);

    const { status, url, error } = statusData.response;

    return new Response(JSON.stringify({
      status: status, // queued, rendering, done, failed
      url: url, // MP4 download URL when done
      error: error,
      progress: status === 'rendering' ? 50 : (status === 'done' ? 100 : 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Shotstack status check error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});