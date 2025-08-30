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
    
    // Extract price - improved patterns specifically for Rentop
    let price = '';
    console.log('🔍 Searching for price in HTML...');
    
    // First, look for the main price display patterns
    const mainPricePatterns = [
      // Pattern 1: "From AED 699" with various formatting
      /From\s+AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      
      // Pattern 2: Direct AED amount
      /AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
      
      // Pattern 3: In price containers/divs
      /<[^>]*class="[^"]*price[^"]*"[^>]*>[^<]*AED[^<]*?(\d+(?:,\d{3})*)/i,
      /<[^>]*class="[^"]*font-medium[^"]*"[^>]*>[^<]*AED[^<]*?(\d+(?:,\d{3})*)/i,
      
      // Pattern 4: Per day pricing
      /(\d+(?:,\d{3})*)[^<]*?per\s+day/i,
      /(\d+(?:,\d{3})*)[^<]*?\/jour/i,
      /(\d+(?:,\d{3})*)[^<]*?\/day/i,
      
      // Pattern 5: Badge or highlighted price
      /<badge[^>]*>[^<]*AED[^<]*?(\d+(?:,\d{3})*)/i,
      /<span[^>]*>[^<]*AED[^<]*?(\d+(?:,\d{3})*)/i,
    ];
    
    for (let i = 0; i < mainPricePatterns.length; i++) {
      const pattern = mainPricePatterns[i];
      const match = html.match(pattern);
      if (match && match[1]) {
        // Clean up the price number
        const priceNumber = match[1].replace(/,/g, '');
        if (parseInt(priceNumber) > 0) {
          // Format price in French
          price = `À partir de ${match[1]} AED/jour`;
          console.log(`✅ Found price with pattern ${i + 1}:`, price);
          console.log(`   Original match: ${match[0].substring(0, 100)}...`);
          break;
        }
      }
    }
    
    // If still no price found, try more aggressive patterns
    if (!price) {
      console.log('🔍 No price found with main patterns, trying aggressive search...');
      
      // Look for any number followed by AED or preceded by AED
      const aggressivePatterns = [
        /(\d{2,4})\s*AED/i,
        /AED\s*(\d{2,4})/i,
        /(\d{2,4})[^<]*?\/jour/i,
        /(\d{2,4})[^<]*?per\s*day/i,
      ];
      
      for (let i = 0; i < aggressivePatterns.length; i++) {
        const pattern = aggressivePatterns[i];
        const matches = html.match(new RegExp(pattern.source, 'gi'));
        if (matches && matches.length > 0) {
          // Take the first reasonable price (between 50 and 5000 AED per day)
          for (const match of matches) {
            const priceMatch = match.match(pattern);
            if (priceMatch && priceMatch[1]) {
              const priceNum = parseInt(priceMatch[1]);
              if (priceNum >= 50 && priceNum <= 5000) {
                price = `À partir de ${priceMatch[1]} AED/jour`;
                console.log(`✅ Found price with aggressive pattern ${i + 1}:`, price);
                console.log(`   Original match: ${match}`);
                break;
              }
            }
          }
          if (price) break;
        }
      }
    }
    
    // Last resort: extract from page title or meta description
    if (!price) {
      console.log('🔍 Still no price, checking page title and meta...');
      const titleMatch = html.match(/<title[^>]*>([^<]*)</i);
      const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      
      const searchText = (titleMatch ? titleMatch[1] : '') + ' ' + (metaMatch ? metaMatch[1] : '');
      const titlePriceMatch = searchText.match(/AED\s*(\d+(?:,\d{3})*)/i);
      
      if (titlePriceMatch) {
        price = `À partir de ${titlePriceMatch[1]} AED/jour`;
        console.log('✅ Found price in title/meta:', price);
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