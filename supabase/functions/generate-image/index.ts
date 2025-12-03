import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map aspect ratio to dimensions and descriptive text
function getAspectRatioConfig(aspectRatio?: string): { width: number; height: number; description: string } {
  switch (aspectRatio) {
    case '1:1':
    case 'square':
      return { width: 1024, height: 1024, description: 'square 1:1 aspect ratio' };
    case '16:9':
    case 'landscape':
      return { width: 1536, height: 864, description: 'wide landscape 16:9 aspect ratio' };
    case '9:16':
    case 'portrait':
    case 'story':
      return { width: 864, height: 1536, description: 'tall portrait 9:16 aspect ratio (like Instagram Story)' };
    case '4:3':
      return { width: 1536, height: 1152, description: 'landscape 4:3 aspect ratio' };
    case '3:4':
      return { width: 1152, height: 1536, description: 'portrait 3:4 aspect ratio' };
    case '4:5':
      return { width: 1200, height: 1500, description: 'portrait 4:5 aspect ratio (like Instagram Post)' };
    case '2:1':
      return { width: 1536, height: 768, description: 'ultra-wide 2:1 panoramic aspect ratio' };
    case '1:2':
      return { width: 768, height: 1536, description: 'ultra-tall 1:2 vertical aspect ratio' };
    default:
      return { width: 1536, height: 1024, description: 'landscape orientation' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio, width, height } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get aspect ratio configuration
    const aspectConfig = getAspectRatioConfig(aspectRatio);
    
    // Use custom dimensions if provided, otherwise use aspect ratio config
    const targetWidth = width || aspectConfig.width;
    const targetHeight = height || aspectConfig.height;
    
    console.log('Generating image with prompt:', prompt);
    console.log('Aspect ratio:', aspectRatio || 'default');
    console.log('Target dimensions:', targetWidth, 'x', targetHeight);
    console.log('Aspect description:', aspectConfig.description);

    // Build enhanced prompt with explicit aspect ratio and dimension guidance
    const enhancedPrompt = `Generate a high-quality image with ${aspectConfig.description}. 
The image should fill the entire canvas with dimensions approximately ${targetWidth}x${targetHeight} pixels.
IMPORTANT: Extend the background and scene to fill the complete frame edge-to-edge, no cropping, no black bars.

Subject/Scene: ${prompt}

Requirements:
- Ultra high resolution, maximum detail and clarity
- Professional photography quality
- Complete scene that fills the entire ${aspectConfig.description} frame
- Seamless background that extends to all edges
- 4K quality output`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received successfully');
    
    // Extract image from response
    const message = data.choices?.[0]?.message;
    const images = message?.images || [];
    const textContent = message?.content || '';

    if (images.length === 0) {
      console.error('No images in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No image generated', response: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the first generated image
    const generatedImage = images[0];
    const imageUrl = generatedImage?.image_url?.url || generatedImage?.url;

    console.log('Image generated successfully');
    console.log('Image URL type:', typeof imageUrl);
    console.log('Image URL length:', imageUrl?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl,
        textContent,
        model: 'google/gemini-3-pro-image-preview',
        requestedDimensions: { width: targetWidth, height: targetHeight },
        aspectRatio: aspectRatio || 'default'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
