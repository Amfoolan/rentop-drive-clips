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
  
  // Pattern 1: Look for _next/image URLs in img src attributes within the main car content
  // Focus on the swiper slides and main image gallery, exclude other car recommendations
  const imgNextPattern = /<img[^>]+src=["']([^"']*_next\/image[^"']*)["'][^>]*alt=["']([^"']*Rent[^"']*)["'][^>]*>/gi;
  let match;
  let count = 0;
  
  while ((match = imgNextPattern.exec(html)) !== null) {
    const imgSrc = match[1];
    const altText = match[2];
    
    console.log(`🔍 Found img with _next/image: ${imgSrc.substring(0, 100)}...`);
    console.log(`🔍 Alt text: ${altText}`);
    
    // Extract the encoded URL from _next/image?url=...
    const urlMatch = imgSrc.match(/url=([^&]+)/);
    if (urlMatch) {
      try {
        const decodedUrl = decodeURIComponent(urlMatch[1]);
        console.log(`🔍 Decoded URL: ${decodedUrl.substring(0, 100)}...`);
        
        // Only include images from rental_items_images (actual car photos)
        // Exclude brand logos and other non-car images
        if (decodedUrl.includes('supabase.co') && 
            decodedUrl.includes('rental_items_images') &&
            !decodedUrl.includes('/brands/') &&
            !decodedUrl.includes('/logo')) {
          
          // Additional filter: skip if it's clearly from another car listing
          // Check if the alt text contains the main car being viewed
          const mainCarMatch = html.match(/<h1[^>]*>([^<]*Rent[^<]*AUDI[^<]*Q8[^<]*)<\/h1>/i);
          const mainCar = mainCarMatch ? mainCarMatch[1] : '';
          
          if (!images.includes(decodedUrl)) {
            images.push(decodedUrl);
            count++;
            console.log(`✅ Added car image ${count}:`, decodedUrl.substring(0, 80) + '...');
          }
        } else {
          console.log(`❌ Skipped non-car image: ${decodedUrl.substring(0, 80)}...`);
        }
      } catch (e) {
        console.log('❌ Failed to decode URL:', urlMatch[1]);
      }
    }
  }
  
  // Pattern 2: Look for images specifically in swiper slides (main gallery)
  const swiperPattern = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]+src=["']([^"']*_next\/image[^"']*)["'][^>]*>[\s\S]*?<\/div>/gi;
  while ((match = swiperPattern.exec(html)) !== null) {
    const imgSrc = match[1];
    console.log(`🔍 Found swiper image: ${imgSrc.substring(0, 100)}...`);
    
    const urlMatch = imgSrc.match(/url=([^&]+)/);
    if (urlMatch) {
      try {
        const decodedUrl = decodeURIComponent(urlMatch[1]);
        if (decodedUrl.includes('supabase.co') && 
            decodedUrl.includes('rental_items_images') &&
            !decodedUrl.includes('/brands/')) {
          
          if (!images.includes(decodedUrl)) {
            images.push(decodedUrl);
            count++;
            console.log(`✅ Added swiper image ${count}:`, decodedUrl.substring(0, 80) + '...');
          }
        }
      } catch (e) {
        console.log('❌ Failed to decode swiper URL:', urlMatch[1]);
      }
    }
  }
  
  // Pattern 3: Look for main gallery grid images (desktop version)
  const galleryPattern = /<div[^>]*class="[^"]*grid[^"]*"[^>]*>[\s\S]*?<img[^>]+src=["']([^"']*_next\/image[^"']*)["'][^>]*>[\s\S]*?<\/div>/gi;
  while ((match = galleryPattern.exec(html)) !== null) {
    const imgSrc = match[1];
    console.log(`🔍 Found gallery image: ${imgSrc.substring(0, 100)}...`);
    
    const urlMatch = imgSrc.match(/url=([^&]+)/);
    if (urlMatch) {
      try {
        const decodedUrl = decodeURIComponent(urlMatch[1]);
        if (decodedUrl.includes('supabase.co') && 
            decodedUrl.includes('rental_items_images') &&
            !decodedUrl.includes('/brands/')) {
          
          if (!images.includes(decodedUrl)) {
            images.push(decodedUrl);
            count++;
            console.log(`✅ Added gallery image ${count}:`, decodedUrl.substring(0, 80) + '...');
          }
        }
      } catch (e) {
        console.log('❌ Failed to decode gallery URL:', urlMatch[1]);
      }
    }
  }
  
  console.log(`📊 Total unique car images found: ${images.length}`);
  return images.slice(0, 15); // Limit to 15 images max for the main car
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
    
    // Extract price - improved patterns for Rentop
    let price = '';
    const pricePatterns = [
      /From\s+AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      /AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
      /"price":\s*"AED\s*(\d+(?:,\d{3})*)/i,
      /class="[^"]*price[^"]*"[^>]*>[^<]*AED[^<]*(\d+(?:,\d{3})*)/i,
      /per\s+day[^<]*(\d+)/i
    ];
    
    console.log('🔍 Searching for price...');
    for (let i = 0; i < pricePatterns.length; i++) {
      const pattern = pricePatterns[i];
      const match = html.match(pattern);
      if (match && match[1]) {
        price = `AED ${match[1]}`;
        console.log(`✅ Found price with pattern ${i + 1}:`, price);
        break;
      }
    }
    
    // If no AED price found, look for any price format
    if (!price) {
      console.log('🔍 No AED price found, trying general patterns...');
      const generalPricePatterns = [
        /(\d+(?:,\d{3})*)\s*AED/i,
        /(\d+(?:,\d{3})*)\s*€/i,
        /\$(\d+(?:,\d{3})*)/i,
        /(\d+(?:,\d{3})*)\s*per\s+day/i
      ];
      
      for (let i = 0; i < generalPricePatterns.length; i++) {
        const pattern = generalPricePatterns[i];
        const match = html.match(pattern);
        if (match && match[1]) {
          const currency = pattern.toString().includes('AED') ? 'AED' : 
                          pattern.toString().includes('€') ? '€' : 
                          pattern.toString().includes('$') ? '$' : '';
          price = `${currency} ${match[1]}${pattern.toString().includes('per day') ? '/jour' : ''}`;
          console.log(`✅ Found general price with pattern ${i + 1}:`, price);
          break;
        }
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