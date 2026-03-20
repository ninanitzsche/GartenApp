import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const images = formData.getAll('images')
    const organs = formData.get('organs') as string || 'auto'

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plantnetApiKey = Deno.env.get('PLANTNET_API_KEY')
    if (!plantnetApiKey) {
      return new Response(
        JSON.stringify({ error: 'Pl@ntNet API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plantnetFormData = new FormData()
    
    for (const image of images) {
      let filename = 'plant_image.jpg'
      
      if (image instanceof File) {
        plantnetFormData.append('images', image, image.name || filename)
      } else if (typeof image === 'string') {
        // Handle base64 data URLs
        if (image.startsWith('data:')) {
          const blob = base64ToBlob(image)
          if (blob) {
            plantnetFormData.append('images', blob, filename)
          }
        }
        // Handle HTTP URLs
        else if (image.startsWith('http')) {
          try {
            const imageResponse = await fetch(image)
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob()
              plantnetFormData.append('images', imageBlob, filename)
            }
          } catch (e) {
            console.error('Error fetching image from URL:', image, e)
          }
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
        JSON.stringify({ error: `Pl@ntNet API error: ${plantnetResponse.status}`, details: errorText }),
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
