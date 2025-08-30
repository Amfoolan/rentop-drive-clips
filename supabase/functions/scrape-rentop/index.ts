import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CarData {
  title: string;
  price: string;
  location: string;
  images: string[];
  specs: {
    year: string;
    color: string;
    horsepower: string;
    engine: string;
    maxSpeed: string;
    acceleration: string;
  };
}

function extractImagesFromHTML(html: string): string[] {
  const images: string[] = [];
  
  console.log('🔍 Starting image extraction from Rentop HTML...');
  console.log('📄 HTML content length:', html.length);
  
  // Pattern 1: Look for _next/image URLs in img src attributes
  const imgNextPattern = /<img[^>]+src=["']([^"']*_next\/image[^"']*)["'][^>]*>/gi;
  let match;
  let count = 0;
  
  while ((match = imgNextPattern.exec(html)) !== null) {
    const imgSrc = match[1];
    console.log(`🔍 Found img with _next/image: ${imgSrc.substring(0, 100)}...`);
    
    // Extract the encoded URL from _next/image?url=...
    const urlMatch = imgSrc.match(/url=([^&]+)/);
    if (urlMatch) {
      try {
        const decodedUrl = decodeURIComponent(urlMatch[1]);
        console.log(`🔍 Decoded URL: ${decodedUrl.substring(0, 100)}...`);
        
        if (decodedUrl.includes('supabase.co') && decodedUrl.includes('rental_items_images')) {
          if (!images.includes(decodedUrl)) {
            images.push(decodedUrl);
            count++;
            console.log(`✅ Added image ${count}:`, decodedUrl.substring(0, 80) + '...');
          }
        }
      } catch (e) {
        console.log('❌ Failed to decode URL:', urlMatch[1]);
      }
    }
  }
  
  // Pattern 2: Look for direct Supabase URLs
  const directPattern = /https:\/\/[^"'\s]*supabase\.co[^"'\s]*rental_items_images[^"'\s]*/gi;
  while ((match = directPattern.exec(html)) !== null) {
    const imageUrl = match[0];
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      count++;
      console.log(`✅ Added direct image ${count}:`, imageUrl.substring(0, 80) + '...');
    }
  }
  
  console.log(`📊 Total unique images found: ${images.length}`);
  return images.slice(0, 20); // Limit to 20 images
}

function extractCarData(html: string, url: string): CarData | null {
  try {
    console.log('🚀 Starting data extraction from Rentop HTML...');
    
    // Extract title
    let title = '';
    const titlePatterns = [
      /<h1[^>]*>([^<]*Rent[^<]*AUDI[^<]*)<\/h1>/i,
      /<h1[^>]*>([^<]*Rent[^<]*)<\/h1>/i,
      /<title[^>]*>([^<]*Rent[^<]*)</i,
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = match[1].trim()
          .replace(/&[^;]+;/g, '')
          .replace(/\s+/g, ' ');
        console.log('✅ Found title:', title);
        break;
      }
    }
    
    // Extract price
    let price = '';
    const pricePatterns = [
      /From\s+AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      /AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = `AED ${match[1]}`;
        console.log('✅ Found price:', price);
        break;
      }
    }
    
    // Extract images
    const images = extractImagesFromHTML(html);
    console.log('📊 Image extraction completed. Total images:', images.length);
    
    // Validation
    if (!title || !price || images.length < 3) {
      console.log('❌ Insufficient data:', { title: !!title, price: !!price, images: images.length });
      return null;
    }
    
    // Extract specs from URL and content
    const yearMatch = url.match(/(\d{4})/) || html.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    const colorFromUrl = url.match(/-([a-z]+)(-|$)/);
    const color = colorFromUrl ? 
      colorFromUrl[1].charAt(0).toUpperCase() + colorFromUrl[1].slice(1) : 'White';
    
    // Default specs for common cars
    let horsepower = '340';
    let engine = '3.0L V6';
    
    if (title.toLowerCase().includes('q8')) {
      horsepower = '340';
      engine = '3.0L V6 Turbo';
    } else if (title.toLowerCase().includes('r8')) {
      horsepower = '562';
      engine = '5.2L V10';
    }
    
    const result: CarData = {
      title,
      price,
      location: 'Dubai',
      images,
      specs: {
        year,
        color,
        horsepower,
        engine,
        maxSpeed: '250 km/h',
        acceleration: '5.9s'
      }
    };
    
    console.log('🎉 Successfully extracted data:', {
      title: result.title,
      price: result.price,
      imageCount: result.images.length,
      specs: result.specs
    });
    
    return result;
  } catch (error) {
    console.error('💥 Error extracting data:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.includes('rentop.co')) {
      return new Response(
        JSON.stringify({ error: 'URL Rentop valide requise' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🌐 Scraping Rentop URL:', url);

    // Fetch the actual website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch URL:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `Impossible de récupérer la page (${response.status})` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const html = await response.text();
    console.log('✅ Successfully fetched HTML:', html.length, 'characters');

    // Extract car data from HTML
    const carData = extractCarData(html, url);

    if (!carData) {
      return new Response(
        JSON.stringify({ 
          error: 'Impossible d\'extraire les données de cette page Rentop. Vérifiez que l\'URL contient une voiture avec des photos.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🎯 Returning extracted data:', {
      title: carData.title,
      price: carData.price,
      imageCount: carData.images.length
    });

    return new Response(
      JSON.stringify({ success: true, data: carData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur lors du scraping' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});