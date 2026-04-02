import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, organ = 'auto' } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const plantNetApiKey = Deno.env.get('PLANTNET_API_KEY')
    if (!plantNetApiKey) {
      return new Response(JSON.stringify({ error: 'PlantNet API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()

    // Create form data for PlantNet
    const formData = new FormData()
    formData.append('images', imageBlob as any)
    formData.append('organs', organ)

    // Call PlantNet Disease API
    const plantNetUrl = `https://my-api.plantnet.org/v2/diseases/identify?api-key=${plantNetApiKey}&lang=de&nb-results=3&include-related-images=true`
    
    const plantNetResponse = await fetch(plantNetUrl, {
      method: 'POST',
      body: formData,
    })

    if (!plantNetResponse.ok) {
      const errorText = await plantNetResponse.text()
      return new Response(JSON.stringify({ error: `PlantNet API error: ${plantNetResponse.status}`, details: errorText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: plantNetResponse.status,
      })
    }

    const data = await plantNetResponse.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
