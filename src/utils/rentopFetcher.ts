// Function to extract images from HTML content - look for Supabase storage URLs
const extractImagesFromHTML = (html: string, baseUrl: string): string[] => {
  const images: string[] = [];
  
  // Look for Supabase storage URLs which are the real car images (URL encoded)
  const supabasePattern = /https%3A%2F%2Fhjkyepaqdsyqjvhqedha\.supabase\.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Frental_items_images%2F[^"&]+/g;
  let match;
  
  while ((match = supabasePattern.exec(html)) !== null) {
    const decodedUrl = decodeURIComponent(match[0]);
    if (!images.includes(decodedUrl)) {
      images.push(decodedUrl);
    }
  }
  
  // Also look for standard img src patterns as backup
  const imgPattern = /<img[^>]+src=["']([^"']+(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*>/gi;
  
  while ((match = imgPattern.exec(html)) !== null) {
    let imageUrl = match[1];
    
    // Only include Supabase storage images or high-quality car images
    if (imageUrl.includes('supabase.co') || 
        imageUrl.includes('rental_items_images') ||
        (imageUrl.includes('rentop.co') && 
         !imageUrl.includes('logo') && 
         !imageUrl.includes('icon') &&
         !imageUrl.includes('brand'))) {
      
      // Convert relative URLs to absolute
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = 'https://www.rentop.co' + imageUrl;
      }
      
      if (!images.includes(imageUrl)) {
        images.push(imageUrl);
      }
    }
  }

  // Remove duplicates and return first 15 images
  return [...new Set(images)].slice(0, 15);
};

// Function to extract real data from HTML content - NO FALLBACK DATA
export const extractRentopDataFromHTML = (html: string, url: string) => {
  try {
    console.log('Extracting real data from HTML, length:', html.length);
    
    // Extract car title from the page - look for the main heading
    let title = '';
    const titlePatterns = [
      /<h1[^>]*>([^<]*Rent[^<]*)<\/h1>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<title[^>]*>([^<]*Rent[^<]*)</i
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = match[1].trim()
          .replace(/&[^;]+;/g, '')
          .replace(/\s+/g, ' ')
          .replace(/rent\s+/i, '')
          .replace(/\s+in\s+(dubai|uae)/i, '');
        
        // Clean up the title further
        if (title.toLowerCase().includes('rent')) {
          title = title.replace(/rent\s+/gi, '').trim();
        }
        break;
      }
    }
    
    // Extract price in AED from the page - MUST FIND REAL PRICE
    let price = '';
    const pricePatterns = [
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
      /(\d+(?:,\d{3})*)\s*AED/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = `AED ${match[1]}`;
        break;
      }
    }
    
    // Extract images from the HTML - MUST FIND REAL IMAGES
    const images = extractImagesFromHTML(html, url);
    
    // Only return data if we have minimum required information
    if (!title || !price || images.length < 5) {
      console.log('Insufficient data extracted:', { title: !!title, price: !!price, images: images.length });
      return null;
    }
    
    // Extract additional specs from URL and HTML
    const yearMatch = url.match(/(\d{4})/) || html.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '2024';
    
    // Extract color from URL
    const colorMatch = url.match(/-([a-z]+)(-|$)/);
    const color = colorMatch ? 
      colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1) : 
      'Non spécifié';
    
    // Car-specific specs (only for known models)
    let horsepower = 'Non spécifié';
    let engine = 'Non spécifié';
    
    if (title.toLowerCase().includes('r8')) {
      horsepower = '562';
      engine = '5.2L V10';
    }
    
    console.log('Successfully extracted real data:', { title, price, images: images.length, year, color });
    
    return {
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
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
};