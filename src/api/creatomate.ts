interface CreatomateRequest {
  images: string[]
  audio?: string
  title?: string
}

interface CreatomateResponse {
  success: boolean
  videoUrl?: string
  error?: string
}

const CREATOMATE_API_KEY = process.env.CREATOMATE_API_KEY
const CREATOMATE_API_URL = 'https://api.creatomate.com/v1/renders'

export async function POST(request: Request): Promise<Response> {
  try {
    if (!CREATOMATE_API_KEY) {
      return Response.json({ 
        success: false, 
        error: 'Clé API Creatomate manquante' 
      }, { status: 500 })
    }

    const body: CreatomateRequest = await request.json()
    const { images, audio, title } = body

    if (!images || images.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Au moins 2 images sont requises' 
      }, { status: 400 })
    }

    // Template Creatomate basique pour slideshow
    const templateData = {
      template_id: "slideshow-template", // Vous devrez créer ce template dans Creatomate
      modifications: {
        "images": images.map((url, index) => ({
          id: `image-${index}`,
          source: url
        })),
        ...(audio && { "audio": { source: audio } }),
        ...(title && { "title": { text: title } })
      }
    }

    const response = await fetch(CREATOMATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ 
        success: false, 
        error: `Erreur Creatomate: ${error}` 
      }, { status: response.status })
    }

    const result = await response.json()
    
    // Creatomate retourne un render ID, il faut ensuite polling pour récupérer l'URL
    const renderId = result.id
    
    // Polling pour attendre que la vidéo soit prête
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`${CREATOMATE_API_URL}/${renderId}`, {
        headers: {
          'Authorization': `Bearer ${CREATOMATE_API_KEY}`
        }
      })
      
      const statusResult = await statusResponse.json()
      
      if (statusResult.status === 'succeeded') {
        return Response.json({ 
          success: true, 
          videoUrl: statusResult.url 
        })
      }
      
      if (statusResult.status === 'failed') {
        return Response.json({ 
          success: false, 
          error: 'La génération de vidéo a échoué' 
        }, { status: 500 })
      }
      
      // Attendre 10 secondes avant le prochain check
      await new Promise(resolve => setTimeout(resolve, 10000))
      attempts++
    }
    
    return Response.json({ 
      success: false, 
      error: 'Timeout: la génération prend trop de temps' 
    }, { status: 408 })

  } catch (error: any) {
    console.error('Erreur API Creatomate:', error)
    return Response.json({ 
      success: false, 
      error: error.message || 'Erreur serveur interne' 
    }, { status: 500 })
  }
}