const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
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
    let imageUrl: string | undefined
    let organ = 'auto'
    
    // Try to parse JSON body
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const body = await req.json()
      imageUrl = body.imageUrl
      organ = body.organ || body.organs || 'auto'
    } else {
      // Fall back to formData
      const formData = await req.formData()
      imageUrl = formData.get('imageUrl') as string | undefined
      organ = (formData.get('organ') || formData.get('organs')) as string || 'auto'
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
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

    // Fetch the image and convert to blob
    const imageBlob = await fetchImageAsBlob(imageUrl)
    if (!imageBlob) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plantnetFormData = new FormData()
    plantnetFormData.append('images', imageBlob, 'plant_image.jpg')
    plantnetFormData.append('organs', organ)

    const plantnetResponse = await fetch(
      `https://my-api.plantnet.org/v2/diseases/identify?api-key=${plantnetApiKey}&lang=de&nb-results=3&include-related-images=true`,
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
    console.error('Error in plantnet-disease-proxy:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
