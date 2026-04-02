import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, model, temperature, max_tokens } = await req.json()

    const aiApiKey = Deno.env.get('AI_API_KEY')
    const aiApiUrl = Deno.env.get('AI_API_URL') || 'https://opencode.ai/zen/v1/chat/completions'
    const aiModel = model || Deno.env.get('AI_MODEL') || 'mimo-v2-pro-free'

    if (!aiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 3000,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      return new Response(
        JSON.stringify({ error: `AI API error: ${aiResponse.status}`, details: errorText }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await aiResponse.json()

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-proxy:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
