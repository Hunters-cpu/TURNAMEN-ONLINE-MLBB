import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Request, Response } from 'express';

// Server-side lazy initialized Gemini client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak ditemukan di environment server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. MULTI-TURN CHAT HANDLER
 * Supports:
 * - gemini-3.5-flash (General + Google Search Grounding)
 * - gemini-3.1-pro-preview (Complex + ThinkingLevel.HIGH)
 * - gemini-3.1-flash-lite (Ultra Low Latency)
 */
export async function handleGeminiChat(req: Request, res: Response) {
  try {
    const { 
      messages, 
      systemInstruction, 
      mode = 'flash', // 'flash' | 'pro' | 'lite'
      enableThinking = false,
      useSearch = false 
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar pesan (messages) wajib diisi.' });
    }

    const ai = getAIClient();

    // Select model based on user intent
    let selectedModel = 'gemini-3.5-flash';
    if (mode === 'pro' || enableThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (mode === 'lite') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    // Prepare contents payload format for generateContent
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || '' }]
    }));

    // Build configuration
    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    // Thinking mode configuration (Only for Gemini 3 series, no maxOutputTokens)
    if (enableThinking && selectedModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
    }

    // Search grounding (Only supported on gemini-3.5-flash / gemini-3.7-flash)
    if (useSearch && selectedModel.includes('flash') && !selectedModel.includes('lite')) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config
    });

    const replyText = response.text || 'Maaf, AI tidak menghasilkan teks respons.';

    // Extract Google Search grounding sources if available
    let searchSources: Array<{ title: string; uri: string }> = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          searchSources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri
          });
        }
      });
    }

    return res.json({
      success: true,
      modelUsed: selectedModel,
      reply: replyText,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
      isThinkingUsed: !!enableThinking
    });
  } catch (error: any) {
    console.error('[GEMINI CHAT ERROR]:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Gagal memproses percakapan Gemini.' 
    });
  }
}

/**
 * 2. HIGH-QUALITY IMAGE GENERATION HANDLER
 * Supports:
 * - gemini-3-pro-image (1K, 2K, 4K resolution)
 * - gemini-3.1-flash-image (512px, 1K, 2K, 4K resolution)
 */
export async function handleGeminiGenerateImage(req: Request, res: Response) {
  try {
    const { 
      prompt, 
      imageSize = '1K', // '1K' | '2K' | '4K'
      aspectRatio = '1:1', // '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
      modelQuality = 'pro' // 'pro' | 'flash'
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt deskripsi gambar wajib diisi.' });
    }

    const ai = getAIClient();
    const selectedModel = modelQuality === 'pro' ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    let generatedImageUrl = '';
    let captionText = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          captionText += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        success: false,
        error: 'Model tidak mengembalikan data gambar. Pastikan prompt tidak melanggar kebijakan keamanan.',
        textResponse: captionText
      });
    }

    return res.json({
      success: true,
      modelUsed: selectedModel,
      imageUrl: generatedImageUrl,
      caption: captionText || undefined,
      aspectRatio,
      imageSize
    });
  } catch (error: any) {
    console.error('[GEMINI GENERATE IMAGE ERROR]:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Gagal menghasilkan gambar AI.' 
    });
  }
}

/**
 * 3. IMAGE EDITING HANDLER
 * Supports:
 * - gemini-3.1-flash-image (Nano Banana 2 / High Quality Editor)
 */
export async function handleGeminiEditImage(req: Request, res: Response) {
  try {
    const { 
      image, // base64 string
      mimeType = 'image/png',
      prompt,
      aspectRatio = '1:1'
    } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ success: false, error: 'Gambar asli (base64) dan prompt instruksi edit wajib diisi.' });
    }

    // Clean base64 string if it has data URL prefix
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    const ai = getAIClient();
    const selectedModel = 'gemini-3.1-flash-image';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    let editedImageUrl = '';
    let explanationText = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          editedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          explanationText += part.text;
        }
      }
    }

    if (!editedImageUrl) {
      return res.status(500).json({
        success: false,
        error: 'Model tidak mengembalikan gambar hasil editan.',
        textResponse: explanationText
      });
    }

    return res.json({
      success: true,
      modelUsed: selectedModel,
      imageUrl: editedImageUrl,
      explanation: explanationText || undefined
    });
  } catch (error: any) {
    console.error('[GEMINI EDIT IMAGE ERROR]:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Gagal mengedit gambar AI.' 
    });
  }
}

/**
 * 4. LOW-LATENCY QUICK QUERY (gemini-3.1-flash-lite)
 * For instant sub-second answers: FAQ, Rule Lookup, Quick Advice
 */
export async function handleGeminiQuickQuery(req: Request, res: Response) {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt query wajib diisi.' });
    }

    const ai = getAIClient();
    const selectedModel = 'gemini-3.1-flash-lite';

    const systemInstruction = `Kamu adalah Asisten Kilat Hunters Community turnamen esports Free Fire & Mobile Legends DEXZ STORE. Berikan jawaban yang ringkas, super cepat, akurat, dan langsung pada intinya dalam bahasa Indonesia. ${context || ''}`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    return res.json({
      success: true,
      modelUsed: selectedModel,
      reply: response.text || 'Tidak ada respons yang dihasilkan.'
    });
  } catch (error: any) {
    console.error('[GEMINI QUICK QUERY ERROR]:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Gagal memproses respon kilat Gemini.' 
    });
  }
}

/**
 * 5. DEEP ESPORTS STRATEGY & HIGH THINKING ANALYSIS (gemini-3.1-pro-preview)
 * High reasoning level for match predictions, draft synergy, drop-zone rotations, and dispute rulings
 */
export async function handleGeminiEsportsAnalysis(req: Request, res: Response) {
  try {
    const { 
      analysisType, // 'draft_synergy' | 'drop_zone' | 'prediction_breakdown' | 'dispute_ruling' | 'scrim_review'
      payload,
      customQuery 
    } = req.body;

    const ai = getAIClient();
    const selectedModel = 'gemini-3.1-pro-preview';

    const systemInstruction = `Kamu adalah Kepala Analis Strategi Esports & Juri Utama Turnamen Hunters Community (DEXZ STORE). 
Analisis setiap situasi secara mendalam, kritis, objektif, dan berikan kalkulasi win-rate serta rekomendasi taktis tingkat tinggi.
Gunakan penalaran berstandar turnamen profesional internasional (MPL / FFWS).`;

    const promptText = `JENIS ANALISIS: ${analysisType}\nDATA PERTANDINGAN / KASUS:\n${JSON.stringify(payload, null, 2)}\n\nINSTRUKSI KHUSUS:\n${customQuery || 'Berikan analisis taktis mendalam, risiko, kelemahan lawan, dan langkah aksi terbaik.'}`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: promptText,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    return res.json({
      success: true,
      modelUsed: selectedModel,
      analysis: response.text || 'Tidak ada analisis yang dihasilkan.',
      isDeepThinking: true
    });
  } catch (error: any) {
    console.error('[GEMINI ESPORTS ANALYSIS ERROR]:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Gagal melakukan analisis taktis mendalam.' 
    });
  }
}
