// Kalyan-Ji Bakery — Gemini Image Generation Service
// Prompt-first: user's description drives everything. System enforces realistic, real-world bakeable cakes.

// API key is loaded at runtime — never hardcoded in source.
// Priority: 1) window.__CAKE_API_KEY (set by hosting env) → 2) localStorage → 3) user prompt
function _getApiKey() {
  if (window.__CAKE_API_KEY) return window.__CAKE_API_KEY;
  const stored = localStorage.getItem('kj_gemini_key');
  if (stored) return stored;
  return null;
}

// Allow the user to set their own key from the UI
window.setCakeApiKey = function(key) {
  localStorage.setItem('kj_gemini_key', key);
  window.__CAKE_API_KEY = key;
};

const GEMINI_API_KEY = _getApiKey();

// Build a hyper-detailed image prompt from user's free-text description
async function buildPromptFromUserText(userText, inspirationBase64) {
  const systemInstruction = `You are a professional cake photography prompt engineer for a luxury bakery.

Your job: take the customer's cake description and expand it into a hyper-detailed, visually specific image generation prompt.

STRICT RULES:
1. The customer's description is LAW. If they say "Lightning McQueen car shaped cake", the cake MUST be shaped like Lightning McQueen / a car. If they say "happy birthday Lanya", those exact words MUST appear on the cake. Never water down or ignore their specific requests.
2. The cake must look like it can ACTUALLY be made by a skilled professional baker in real life. No cartoon renders, no impossible physics. Real fondant, real buttercream, real edible decorations.
3. Add rich visual detail: specify the frosting finish, colour palette, decoration placement, lighting, surface texture — everything a photographer would notice.
${inspirationBase64 ? '4. An inspiration/reference image has been provided. Use it to inform the style, colour palette, decoration approach, and composition — but still honour the customer\'s written description above all.' : ''}
4. Output ONLY the image prompt. No preamble, no explanation, no JSON. Just the prompt text itself.
5. End every prompt with this exact photography style block: "Professional food photography, shot on a white marble surface with soft natural side-lighting, shallow depth of field, warm bokeh background, ultra-sharp focus on the cake surface, no hands, no people, no text overlays, no watermarks. Hyperrealistic, 8K, luxury artisan bakery editorial quality."`;

  const parts = [{ text: `Customer description: "${userText}"\n\nWrite the image generation prompt now:` }];

  if (inspirationBase64) {
    // Insert inspiration image before the text instruction
    parts.unshift({
      inlineData: {
        mimeType: inspirationBase64.mimeType,
        data: inspirationBase64.data,
      }
    });
    parts.unshift({ text: 'This is the customer\'s inspiration/reference image:' });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Prompt build failed: HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

// Method 1: Imagen 4 via :predict (best quality)
async function generateWithImagen4(prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_few',
          personGeneration: 'dont_allow',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Imagen 4 HTTP ${response.status}`);
  }

  const data = await response.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image data in Imagen 4 response');
  return `data:image/png;base64,${b64}`;
}

// Method 2: Gemini Flash Image via :generateContent (fallback)
async function generateWithGeminiFlashImage(prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini Flash HTTP ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
  if (!imagePart) throw new Error('No image in Gemini Flash Image response');
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

// Main: build expanded prompt from user text + optional inspiration image, then generate
async function generateCakeImageFromPrompt(userText, inspirationBase64) {
  const apiKey = _getApiKey();
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Please add your Gemini API key to cake-ai-image.js');
  }

  // Step 1: Expand user text into a detailed image prompt
  let imagePrompt;
  try {
    imagePrompt = await buildPromptFromUserText(userText, inspirationBase64);
  } catch (e) {
    imagePrompt = `A photorealistic professional cake: ${userText}. The cake looks like it can actually be made by a skilled professional baker. Real fondant, real buttercream, real edible decorations. Shot on white marble, soft natural lighting, shallow depth of field, ultra-sharp focus, no hands, no people, no text overlays. Hyperrealistic, 8K, luxury artisan bakery editorial quality.`;
  }

  // Step 2: Try Imagen 4 first, fall back to Gemini Flash
  try {
    return { image: await generateWithImagen4(imagePrompt, apiKey), prompt: imagePrompt };
  } catch (e1) {
    console.warn('Imagen 4 failed, trying Gemini Flash Image:', e1.message);
    try {
      return { image: await generateWithGeminiFlashImage(imagePrompt, apiKey), prompt: imagePrompt };
    } catch (e2) {
      throw new Error(`Image generation failed. Imagen 4: ${e1.message}. Gemini Flash: ${e2.message}`);
    }
  }
}

// Export
window.generateCakeImageFromPrompt = generateCakeImageFromPrompt;
window.GEMINI_API_KEY_REF = () => _getApiKey();
window.generateCakeImage = (config) => {
  const text = config._rawPrompt || 'A beautiful celebration cake';
  return generateCakeImageFromPrompt(text).then(r => r.image);
};
window.buildCakePrompt = () => '';
