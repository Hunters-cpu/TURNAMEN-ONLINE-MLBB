export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  searchSources?: Array<{ title: string; uri: string }>;
  isThinkingUsed?: boolean;
  modelUsed?: string;
}

export interface SendChatParams {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  mode?: 'flash' | 'pro' | 'lite';
  systemInstruction?: string;
  enableThinking?: boolean;
  useSearch?: boolean;
}

export interface GenerateImageParams {
  prompt: string;
  imageSize?: '1K' | '2K' | '4K';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  modelQuality?: 'pro' | 'flash';
}

export interface EditImageParams {
  image: string; // base64 string or data URL
  mimeType?: string;
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export async function sendGeminiChat(params: SendChatParams): Promise<{
  reply: string;
  modelUsed?: string;
  searchSources?: Array<{ title: string; uri: string }>;
  isThinkingUsed?: boolean;
}> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal berkomunikasi dengan Gemini AI.');
  }

  return {
    reply: data.reply,
    modelUsed: data.modelUsed,
    searchSources: data.searchSources,
    isThinkingUsed: data.isThinkingUsed,
  };
}

export async function generateEsportsImage(params: GenerateImageParams): Promise<{
  imageUrl: string;
  caption?: string;
  modelUsed: string;
  aspectRatio: string;
  imageSize: string;
}> {
  const res = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal menghasilkan gambar AI.');
  }

  return {
    imageUrl: data.imageUrl,
    caption: data.caption,
    modelUsed: data.modelUsed,
    aspectRatio: data.aspectRatio,
    imageSize: data.imageSize,
  };
}

export async function editEsportsImage(params: EditImageParams): Promise<{
  imageUrl: string;
  explanation?: string;
  modelUsed: string;
}> {
  const res = await fetch('/api/gemini/edit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal mengedit gambar AI.');
  }

  return {
    imageUrl: data.imageUrl,
    explanation: data.explanation,
    modelUsed: data.modelUsed,
  };
}

export async function sendQuickGeminiQuery(prompt: string, context?: string): Promise<{
  reply: string;
  modelUsed: string;
}> {
  const res = await fetch('/api/gemini/quick-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal mendapatkan respon cepat AI.');
  }

  return {
    reply: data.reply,
    modelUsed: data.modelUsed,
  };
}

export async function analyzeEsportsTactics(
  analysisType: string,
  payload: any,
  customQuery?: string
): Promise<{
  analysis: string;
  modelUsed: string;
  isDeepThinking: boolean;
}> {
  const res = await fetch('/api/gemini/esports-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysisType, payload, customQuery }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal memproses analisis taktis AI.');
  }

  return {
    analysis: data.analysis,
    modelUsed: data.modelUsed,
    isDeepThinking: data.isDeepThinking,
  };
}
