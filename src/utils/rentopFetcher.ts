// Function to extract images from HTML content
const extractImagesFromHTML = (html: string, baseUrl: string): string[] => {
  const images: string[] = [];
  const domain = new URL(baseUrl).origin;
  
  // Multiple patterns to catch different image sources
  const imagePatterns = [
    // Standard img src attributes
    /<img[^>]+src=["']([^"']+(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*>/gi,
    // CSS background images
    /background-image:\s*url\(['"]?([^'"()]+(?:jpg|jpeg|png|webp)[^'"()]*)['"]?\)/gi,
    // Data attributes for lazy loading
    /data-src=["']([^"']+(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    /data-lazy=["']([^"']+(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    // Srcset attributes
    /srcset=["']([^"']+(?:jpg|jpeg|png|webp)[^"']*)["']/gi
  ];

  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let imageUrl = match[1];
      
      // Clean and validate URL
      if (imageUrl && !images.includes(imageUrl)) {
        // Convert relative URLs to absolute
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = domain + imageUrl;
        }
        
        // Filter for car-related images and avoid thumbnails, icons, logos
        const isCarImage = imageUrl.includes('rental') || 
                          imageUrl.includes('car') || 
                          imageUrl.includes('vehicle') ||
                          imageUrl.includes('supabase') ||
                          imageUrl.includes('upload') ||
                          (!imageUrl.includes('thumb') && 
                           !imageUrl.includes('icon') && 
                           !imageUrl.includes('logo') &&
                           !imageUrl.includes('favicon'));
        
        if (isCarImage && imageUrl.length > 20) {
          images.push(imageUrl);
        }
      }
    }
  });

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
    
    // Extract car title from the page
    const titlePatterns = [
      /<title[^>]*>([^<]+)</i,
      /<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
      /<h1[^>]*>([^<]+)</i,
      /<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i
    ];
    
    let title = 'Véhicule de location';
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = match[1].trim().replace(/\s+/g, ' ').replace(/&[^;]+;/g, '');
        if (title.toLowerCase().includes('rentop')) {
          title = title.replace(/rentop/gi, '').trim();
        }
        break;
      }
    }
    
    // Extract price in AED from the page
    const pricePatterns = [
      /AED\s*(\d+(?:[,\.]\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:[,\.]\d{3})*(?:\.\d{2})?)\s*AED/i,
      /price[^>]*>.*?AED\s*(\d+(?:[,\.]\d{3})*)/i,
      /درهم\s*(\d+(?:,\d{3})*)/i,
      /(\d+(?:,\d{3})*)\s*درهم/i
    ];
    
    let price = 'Prix sur demande';
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const priceValue = match[1].replace(/,/g, '');
        if (parseInt(priceValue) > 0) {
          price = `AED ${match[1]}`;
          break;
        }
      }
    }
    
    // Extract images from the page
    const images = extractImagesFromHTML(html, url);
    
    // Extract additional specs from the page
    const yearMatch = html.match(/(?:year|model)[^>]*>.*?(\d{4})/i) || html.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : '2024';
    
    // Extract color if available
    const colorPatterns = [
      /color[^>]*>([^<]+)/i,
      /colour[^>]*>([^<]+)/i,
      /"color":\s*"([^"]+)"/i
    ];
    let color = 'Non spécifié';
    for (const pattern of colorPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        color = match[1].trim();
        break;
      }
    }
    
    // Extract engine info
    const enginePatterns = [
      /engine[^>]*>([^<]+)/i,
      /(\d+\.\d+L)/i,
      /"engine":\s*"([^"]+)"/i
    ];
    let engine = 'Non spécifié';
    for (const pattern of enginePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        engine = match[1].trim();
        break;
      }
    }
    
    // Extract horsepower
    const hpPatterns = [
      /(\d+)\s*(?:hp|HP|bhp|BHP|chevaux)/i,
      /"horsepower":\s*(\d+)/i,
      /power[^>]*>.*?(\d+)/i
    ];
    let horsepower = 'Non spécifié';
    for (const pattern of hpPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        horsepower = match[1];
        break;
      }
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