const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

function base64ToBlob(base64DataUrl: string): Blob | null {
  try {
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) return null
    
    const mimeType = matches[1]
    const base64Data = matches[2]
    const binaryData = atob(base64Data)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    return new Blob([bytes], { type: mimeType })
  } catch (e) {
    console.error('Error converting base64 to blob:', e)
    return null
  }
}

async function fetchImageAsBlob(imageUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status)
      return null
    }
    return await response.blob()
  } catch (e) {
    console.error('Error fetching image:', e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let imageUrls: string[] = []
    let organs = 'auto'
    
    // Try to parse JSON body first
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const body = await req.json()
      imageUrls = Array.isArray(body.imageUrl) ? body.imageUrl : [body.imageUrl].filter(Boolean)
      organs = body.organ || body.organs || 'auto'
    } else {
      // Fall back to formData
      const formData = await req.formData()
      const images = formData.getAll('images')
      const organsParam = formData.get('organs') as string
      organs = organsParam || 'auto'
      
      // Handle images as URLs in formData
      for (const image of images) {
        if (typeof image === 'string') {
          imageUrls.push(image)
        }
      }
    }

    if (imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plantnetApiKey = Deno.env.get('PLANTNET_API_KEY')
    if (!plantnetApiKey) {
      return new Response(
        JSON.stringify({ error: 'PlantNet API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plantnetFormData = new FormData()
    
    for (const imageUrl of imageUrls) {
      let filename = 'plant_image.jpg'
      
      // Handle base64 data URLs
      if (imageUrl.startsWith('data:')) {
        const blob = base64ToBlob(imageUrl)
        if (blob) {
          plantnetFormData.append('images', blob, filename)
        }
      }
      // Handle HTTP URLs
      else if (imageUrl.startsWith('http')) {
        const blob = await fetchImageAsBlob(imageUrl)
        if (blob) {
          plantnetFormData.append('images', blob, filename)
        }
      }
    }

    plantnetFormData.append('organs', organs)

    const plantnetResponse = await fetch(
      `https://my-api.plantnet.org/v2/identify/weurope?api-key=${plantnetApiKey}&lang=de`,
      {
        method: 'POST',
        body: plantnetFormData,
      }
    )

    if (!plantnetResponse.ok) {
      const errorText = await plantnetResponse.text()
      return new Response(
        JSON.stringify({ error: `PlantNet API error: ${plantnetResponse.status}`, details: errorText }),
        { status: plantnetResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await plantnetResponse.json()

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in plantnet-proxy:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
