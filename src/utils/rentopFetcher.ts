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

export const fetchRentopData = async (url: string) => {
  try {
    // Fallback to URL parsing for now - real web fetching will be handled in the component
    const urlParts = url.split('/');
    const carSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    const slugParts = carSlug.split('-');
    const brand = slugParts[0]?.replace(/\b\w/g, l => l.toUpperCase()) || '';
    const model = slugParts.slice(1, -2).join(' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    const year = carSlug.match(/(\d{4})/)?.[1] || '2024';
    
    const title = `${brand} ${model} ${year}`.trim();
    
    return {
      title: title || 'Véhicule de location',
      price: 'Prix sur demande',
      location: 'Dubai',
      images: [],
      specs: {
        year,
        color: 'Non spécifié',
        horsepower: 'Non spécifié',
        engine: 'Non spécifié',
        maxSpeed: 'Non spécifié',
        acceleration: 'Non spécifié'
      }
    };
  } catch (error) {
    console.error('Error fetching Rentop data:', error);
    return null;
  }
};

// Function to extract real data from HTML content
export const extractRentopDataFromHTML = (html: string, url: string) => {
  try {
    console.log('Extracting data from HTML, length:', html.length);
    
    // Extract car title from the page - look for the main heading
    let title = 'Véhicule de location';
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
    
    // Extract price in AED from the page
    let price = 'Prix sur demande';
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
    
    // Extract images from the HTML - look for Supabase storage URLs
    const images = extractImagesFromHTML(html, url);
    
    // Extract additional specs from URL and HTML
    const yearMatch = url.match(/(\d{4})/) || html.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : '2024';
    
    // Extract color from URL
    const colorMatch = url.match(/-([a-z]+)(-|$)/);
    const color = colorMatch ? 
      colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1) : 
      'Non spécifié';
    
    // For Audi R8, we know the general specs
    let horsepower = 'Non spécifé';
    let engine = 'Non spécifié';
    
    if (title.toLowerCase().includes('r8')) {
      horsepower = '562';
      engine = '5.2L V10';
    }
    
    console.log('Extracted data:', { title, price, images: images.length, year, color, engine, horsepower });
    
    return {
      title: title || 'Véhicule de location',
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