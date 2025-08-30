// Function to extract images from HTML content - IMPROVED VERSION
const extractImagesFromHTML = (html: string, baseUrl: string): string[] => {
  const images: string[] = [];
  
  console.log('Starting image extraction from HTML...');
  
  // Pattern 1: Look for URL-encoded Supabase storage URLs (most common)
  const encodedSupabasePattern = /https%3A%2F%2Fhjkyepaqdsyqjvhqedha\.supabase\.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Frental_items_images%2F[^"&\s]+/g;
  let match;
  
  while ((match = encodedSupabasePattern.exec(html)) !== null) {
    const decodedUrl = decodeURIComponent(match[0]);
    if (!images.includes(decodedUrl)) {
      images.push(decodedUrl);
      console.log('Found encoded Supabase image:', decodedUrl);
    }
  }
  
  // Pattern 2: Look for direct Supabase URLs (already decoded)
  const directSupabasePattern = /https:\/\/hjkyepaqdsyqjvhqedha\.supabase\.co\/storage\/v1\/object\/public\/rental_items_images\/[^"'\s]+/g;
  
  while ((match = directSupabasePattern.exec(html)) !== null) {
    const imageUrl = match[0];
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      console.log('Found direct Supabase image:', imageUrl);
    }
  }
  
  // Pattern 3: Look for Rentop _next/image URLs that wrap Supabase URLs
  const nextImagePattern = /src="([^"]*_next\/image[^"]*url=([^"&]+)[^"]*)"/g;
  
  while ((match = nextImagePattern.exec(html)) !== null) {
    const fullUrl = match[1];
    const encodedImageUrl = match[2];
    
    // Decode the inner image URL
    try {
      const decodedImageUrl = decodeURIComponent(encodedImageUrl);
      if (decodedImageUrl.includes('supabase.co') && decodedImageUrl.includes('rental_items_images')) {
        if (!images.includes(decodedImageUrl)) {
          images.push(decodedImageUrl);
          console.log('Found _next/image wrapped URL:', decodedImageUrl);
        }
      }
    } catch (e) {
      console.log('Failed to decode URL:', encodedImageUrl);
    }
  }
  
  // Pattern 4: Generic img src patterns for car images
  const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*alt="[^"]*(?:Rent|AUDI|BMW|Mercedes|car|vehicle)[^"]*"/gi;
  
  while ((match = imgPattern.exec(html)) !== null) {
    let imageUrl = match[1];
    
    // Skip logos, icons, and non-car images
    if (imageUrl.includes('logo') || imageUrl.includes('icon') || imageUrl.includes('brand')) {
      continue;
    }
    
    // Convert relative URLs to absolute
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.rentop.co' + imageUrl;
    }
    
    // Only include high-quality car images
    if (imageUrl.includes('supabase.co') || 
        imageUrl.includes('rental_items_images') ||
        (imageUrl.includes('rentop.co') && imageUrl.includes('_next/image'))) {
      if (!images.includes(imageUrl)) {
        images.push(imageUrl);
        console.log('Found generic car image:', imageUrl);
      }
    }
  }
  
  console.log(`Total images extracted: ${images.length}`);
  
  // Remove duplicates and return first 15 images
  const uniqueImages = [...new Set(images)].slice(0, 15);
  console.log(`Unique images after deduplication: ${uniqueImages.length}`);
  
  return uniqueImages;
};

// Function to extract real data from HTML content - IMPROVED VERSION
export const extractRentopDataFromHTML = (html: string, url: string) => {
  try {
    console.log('Extracting real data from HTML, content length:', html.length);
    
    // Extract car title from the page - look for the main heading
    let title = '';
    const titlePatterns = [
      /<h1[^>]*>([^<]*Rent[^<]*?(?:AUDI|BMW|Mercedes|Lamborghini|Ferrari|Porsche)[^<]*)<\/h1>/i,
      /<h1[^>]*>([^<]*Rent[^<]*)<\/h1>/i,
      /<h1[^>]*class="[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<title[^>]*>([^<]*Rent[^<]*)</i
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = match[1].trim()
          .replace(/&[^;]+;/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^rent\s+/i, '')
          .replace(/\s+in\s+(dubai|uae|united arab emirates)$/i, '');
        
        console.log('Found title:', title);
        break;
      }
    }
    
    // Extract price in AED from the page - MUST FIND REAL PRICE
    let price = '';
    const pricePatterns = [
      /From\s+AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      /AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
      /(\d+(?:,\d{3})*)\s*AED/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = `AED ${match[1]}`;
        console.log('Found price:', price);
        break;
      }
    }
    
    // Extract images from the HTML
    const images = extractImagesFromHTML(html, url);
    console.log('Images extracted:', images.length);
    
    // Validation - require minimum data
    if (!title || !price || images.length < 5) {
      console.log('Insufficient data extracted:', { 
        hasTitle: !!title, 
        hasPrice: !!price, 
        imageCount: images.length 
      });
      return null;
    }
    
    // Extract additional specs from URL and HTML
    const yearMatch = url.match(/(\d{4})/) || html.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    // Extract color from URL or title
    const colorFromUrl = url.match(/-([a-z]+)(-|$)/);
    const colorFromTitle = title.match(/\b(white|black|red|blue|yellow|green|silver|gray|grey)\b/i);
    const color = colorFromUrl ? 
      colorFromUrl[1].charAt(0).toUpperCase() + colorFromUrl[1].slice(1) : 
      (colorFromTitle ? colorFromTitle[1] : 'Non spécifié');
    
    // Extract car brand and model for specs
    let horsepower = 'Non spécifié';
    let engine = 'Non spécifié';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('r8')) {
      horsepower = '562';
      engine = '5.2L V10';
    } else if (titleLower.includes('q8')) {
      horsepower = '340';
      engine = '3.0L V6';
    }
    
    const result = {
      title,
      price,
      location: 'Dubai',
      images,
      specs: {
        year,
        color,
        horsepower,
        engine,
        maxSpeed: 'Non spécifié',
        acceleration: 'Non spécifié'
      }
    };
    
    console.log('Successfully extracted complete data:', {
      title: result.title,
      price: result.price,
      imageCount: result.images.length,
      specs: result.specs
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
};