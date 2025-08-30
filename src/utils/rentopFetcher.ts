// Function to extract images from HTML content - COMPREHENSIVE DEBUG VERSION
const extractImagesFromHTML = (html: string, baseUrl: string): string[] => {
  const images: string[] = [];
  
  console.log('🔍 Starting comprehensive image extraction from HTML...');
  console.log('📄 HTML content length:', html.length);
  
  // Pattern 1: Look for URL-encoded Supabase storage URLs (most common in Rentop)
  console.log('🔍 Pattern 1: Searching for URL-encoded Supabase URLs...');
  const encodedSupabasePattern = /https%3A%2F%2Fhjkyepaqdsyqjvhqedha\.supabase\.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Frental_items_images%2F[^"&\s]+/g;
  let match;
  let encodedCount = 0;
  
  while ((match = encodedSupabasePattern.exec(html)) !== null) {
    const decodedUrl = decodeURIComponent(match[0]);
    if (!images.includes(decodedUrl)) {
      images.push(decodedUrl);
      encodedCount++;
      console.log(`✅ Found encoded Supabase image ${encodedCount}:`, decodedUrl.substring(0, 100) + '...');
    }
  }
  console.log(`📊 Pattern 1 found: ${encodedCount} images`);
  
  // Pattern 2: Look for direct Supabase URLs (already decoded)
  console.log('🔍 Pattern 2: Searching for direct Supabase URLs...');
  const directSupabasePattern = /https:\/\/hjkyepaqdsyqjvhqedha\.supabase\.co\/storage\/v1\/object\/public\/rental_items_images\/[^"'\s]+/g;
  let directCount = 0;
  
  while ((match = directSupabasePattern.exec(html)) !== null) {
    const imageUrl = match[0];
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      directCount++;
      console.log(`✅ Found direct Supabase image ${directCount}:`, imageUrl.substring(0, 100) + '...');
    }
  }
  console.log(`📊 Pattern 2 found: ${directCount} images`);
  
  // Pattern 3: Look for ALL img tags with car-related alt text
  console.log('🔍 Pattern 3: Searching for img tags with car alt text...');
  const carImgPattern = /<img[^>]+alt="[^"]*(?:Rent|AUDI|BMW|Mercedes|Lamborghini|Ferrari|Porsche|car|vehicle|Q8|R8)[^"]*"[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let carImgCount = 0;
  
  while ((match = carImgPattern.exec(html)) !== null) {
    let imageUrl = match[1];
    
    // Skip logos, icons, and brand images
    if (imageUrl.includes('logo') || imageUrl.includes('icon') || imageUrl.includes('/brand')) {
      continue;
    }
    
    // Convert relative URLs to absolute
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.rentop.co' + imageUrl;
    }
    
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      carImgCount++;
      console.log(`✅ Found car img tag ${carImgCount}:`, imageUrl.substring(0, 100) + '...');
    }
  }
  console.log(`📊 Pattern 3 found: ${carImgCount} images`);
  
  // Pattern 4: Look for ANY img src that contains rental_items_images
  console.log('🔍 Pattern 4: Searching for any rental_items_images...');
  const rentalImgPattern = /<img[^>]+src=["']([^"']*rental_items_images[^"']*)["'][^>]*>/gi;
  let rentalCount = 0;
  
  while ((match = rentalImgPattern.exec(html)) !== null) {
    let imageUrl = match[1];
    
    // Convert relative URLs to absolute
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.rentop.co' + imageUrl;
    }
    
    if (!images.includes(imageUrl)) {
      images.push(imageUrl);
      rentalCount++;
      console.log(`✅ Found rental items image ${rentalCount}:`, imageUrl.substring(0, 100) + '...');
    }
  }
  console.log(`📊 Pattern 4 found: ${rentalCount} images`);
  
  // Pattern 5: Look for _next/image wrapped URLs
  console.log('🔍 Pattern 5: Searching for _next/image URLs...');
  const nextImagePattern = /_next\/image\?url=([^&"']+)/g;
  let nextCount = 0;
  
  while ((match = nextImagePattern.exec(html)) !== null) {
    try {
      const decodedUrl = decodeURIComponent(match[1]);
      if (decodedUrl.includes('supabase.co') && decodedUrl.includes('rental_items_images')) {
        if (!images.includes(decodedUrl)) {
          images.push(decodedUrl);
          nextCount++;
          console.log(`✅ Found _next/image URL ${nextCount}:`, decodedUrl.substring(0, 100) + '...');
        }
      }
    } catch (e) {
      console.log('❌ Failed to decode URL:', match[1]);
    }
  }
  console.log(`📊 Pattern 5 found: ${nextCount} images`);
  
  // Final results
  const uniqueImages = [...new Set(images)].slice(0, 20);
  console.log(`🎯 FINAL RESULTS:`);
  console.log(`   Total images found: ${images.length}`);
  console.log(`   Unique images: ${uniqueImages.length}`);
  console.log(`   Returning: ${uniqueImages.length} images`);
  
  // Log first few URLs for debugging
  uniqueImages.slice(0, 3).forEach((url, i) => {
    console.log(`   Image ${i + 1}: ${url.substring(0, 120)}...`);
  });
  
  return uniqueImages;
};

// Function to extract real data from HTML content - IMPROVED WITH DEBUG
export const extractRentopDataFromHTML = (html: string, url: string) => {
  try {
    console.log('🚀 Starting data extraction from Rentop HTML...');
    console.log('📄 URL:', url);
    console.log('📄 HTML content length:', html.length);
    
    // Extract car title from the page
    let title = '';
    const titlePatterns = [
      /<h1[^>]*>([^<]*Rent[^<]*?(?:AUDI|BMW|Mercedes|Lamborghini|Ferrari|Porsche)[^<]*)<\/h1>/i,
      /<h1[^>]*>([^<]*Rent[^<]*)<\/h1>/i,
      /<h1[^>]*class="[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<title[^>]*>([^<]*Rent[^<]*)</i
    ];
    
    console.log('🔍 Searching for title...');
    for (let i = 0; i < titlePatterns.length; i++) {
      const pattern = titlePatterns[i];
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = match[1].trim()
          .replace(/&[^;]+;/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^rent\s+/i, '')
          .replace(/\s+in\s+(dubai|uae|united arab emirates)$/i, '');
        
        console.log(`✅ Found title with pattern ${i + 1}:`, title);
        break;
      }
    }
    
    if (!title) {
      console.log('❌ No title found');
    }
    
    // Extract price in AED from the page
    let price = '';
    const pricePatterns = [
      /From\s+AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /From\s+AED\s*(\d+(?:,\d{3})*)/i,
      /AED\s*&nbsp;\s*(\d+(?:,\d{3})*)/i,
      /AED\s*(\d+(?:,\d{3})*)/i,
      /(\d+(?:,\d{3})*)\s*AED/i
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
    
    if (!price) {
      console.log('❌ No price found');
    }
    
    // Extract images from the HTML
    console.log('🔍 Starting image extraction...');
    const images = extractImagesFromHTML(html, url);
    console.log('📊 Image extraction completed. Total images:', images.length);
    
    // Validation - require minimum data (reduced to 3 images minimum)
    const hasTitle = !!title;
    const hasPrice = !!price;
    const hasMinImages = images.length >= 3;
    
    console.log('🔍 Validation check:');
    console.log('   Has title:', hasTitle);
    console.log('   Has price:', hasPrice);
    console.log('   Has min images (3+):', hasMinImages, `(${images.length} found)`);
    
    if (!hasTitle || !hasPrice || !hasMinImages) {
      console.log('❌ Insufficient data extracted - returning null');
      return null;
    }
    
    // Extract additional specs
    const yearMatch = url.match(/(\d{4})/) || html.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    const colorFromUrl = url.match(/-([a-z]+)(-|$)/);
    const colorFromTitle = title.match(/\b(white|black|red|blue|yellow|green|silver|gray|grey)\b/i);
    const color = colorFromUrl ? 
      colorFromUrl[1].charAt(0).toUpperCase() + colorFromUrl[1].slice(1) : 
      (colorFromTitle ? colorFromTitle[1] : 'Non spécifié');
    
    // Extract car specs
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
    
    console.log('🎉 Successfully extracted complete data:');
    console.log('   Title:', result.title);
    console.log('   Price:', result.price);
    console.log('   Images:', result.images.length);
    console.log('   Year:', result.specs.year);
    console.log('   Color:', result.specs.color);
    
    return result;
  } catch (error) {
    console.error('💥 Error extracting from HTML:', error);
    return null;
  }
};