import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  Wand2, 
  Search, 
  Zap, 
  BrainCircuit, 
  ShieldAlert, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  Flame, 
  Swords, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Cpu,
  ChevronRight,
  MessageSquare,
  Sliders,
  Sparkle
} from 'lucide-react';
import { 
  sendGeminiChat, 
  generateEsportsImage, 
  editEsportsImage, 
  analyzeEsportsTactics,
  ChatMessage 
} from '../../lib/geminiClient';
import { SiteConfig, RegisteredTeam } from '../../types';

interface GeminiAIViewProps {
  siteConfig: SiteConfig;
  registeredTeams: RegisteredTeam[];
  onOpenRegisterModal?: () => void;
}

type AITab = 'chat' | 'image-generator' | 'image-editor' | 'tactics-lab';
type ChatRole = 'coach' | 'admin' | 'scout' | 'thinker';

const ROLE_CONFIGS: Record<ChatRole, {
  name: string;
  badge: string;
  icon: any;
  color: string;
  defaultModel: 'flash' | 'pro' | 'lite';
  enableThinking: boolean;
  useSearch: boolean;
  systemInstruction: string;
  samplePrompts: string[];
}> = {
  coach: {
    name: 'Esports Coach & Strategy',
    badge: 'Coach Meta',
    icon: Swords,
    color: 'from-amber-500 to-orange-600',
    defaultModel: 'flash',
    enableThinking: false,
    useSearch: true,
    systemInstruction: 'Kamu adalah Kepala Pelatih Esports profesional untuk turnamen Free Fire dan Mobile Legends: Bang Bang (MLBB) di Hunters Community DEXZ STORE. Berikan saran taktis, tips hero counter, rotasi map Bermuda/Purgatory/Kalahari, draft pick MPL, itemization, dan manajemen mental tim secara santun, bersemangat, dan taktis.',
    samplePrompts: [
      'Bagaimana counter hero Assassin lincah seperti Ling dan Fanny di patch sekarang?',
      'Berikan strategi rotasi drop-zone Brasilia (Purgatory) di Free Fire untuk turnamen',
      'Hero apa saja yang wajib first pick/ban di turnamen MLBB saat ini?',
      'Tips komunikasi kapten tim saat late game menghadapi situasi tertinggal skor'
    ]
  },
  admin: {
    name: 'Tournament Admin & Rules',
    badge: 'Admin Assistant',
    icon: ShieldAlert,
    color: 'from-red-600 to-purple-600',
    defaultModel: 'lite',
    enableThinking: false,
    useSearch: false,
    systemInstruction: 'Kamu adalah Asisten Admin Resmi Turnamen Hunters Community DEXZ STORE. Kamu membantu peserta memahami syarat turnamen, verifikasi slot, aturan tie-breaker, pelarangan cheat/bug, jam kehadiran, dan mekanisme hadiah dengan akurat, tegas, ramah, dan ringkas.',
    samplePrompts: [
      'Berapa batas keterlambatan tim sebelum dinyatakan WO (Walk Out)?',
      'Bagaimana cara mendaftar dan memverifikasi pembayaran via Saweria / Admin?',
      'Apakah boleh mengganti pemain cadangan sebelum babak semifinal?',
      'Jelaskan sistem pembagian poin placement dan kill di turnamen Free Fire'
    ]
  },
  scout: {
    name: 'Live Meta & Patch Researcher',
    badge: 'Google Search Live',
    icon: Search,
    color: 'from-blue-500 to-cyan-600',
    defaultModel: 'flash',
    enableThinking: false,
    useSearch: true,
    systemInstruction: 'Kamu adalah Peneliti Meta Esports yang menggunakan data real-time Google Search. Berikan informasi mutakhir tentang patch notes terbaru Free Fire & MLBB, turnamen dunia FFWS & M-Series, tier list hero, dan update buff/nerf resmi.',
    samplePrompts: [
      'Apa saja hero MLBB yang baru saja di-buff pada patch update minggu ini?',
      'Karakter Free Fire apa yang sedang meta untuk role Rusher dan Support?',
      'Siapa tim esports juara bertahan turnamen Free Fire World Series terakhir?',
      'Item counter defense terbaru untuk menghadapi burst magic damage'
    ]
  },
  thinker: {
    name: 'Deep Tactical Thinker (High Reasoning)',
    badge: 'Gemini 3.1 Pro Thinking',
    icon: BrainCircuit,
    color: 'from-purple-600 to-pink-600',
    defaultModel: 'pro',
    enableThinking: true,
    useSearch: false,
    systemInstruction: 'Kamu adalah Master Analis & Strategist tingkat tertinggi menggunakan penalaran berpikir mendalam (High Thinking). Lakukan kalkulasi probabilitas kemenangan, analisis draft 5v5 multi-komposisi, pemetaan risiko split-push, dan mitigasi konflik sengketa turnamen secara komprehensif.',
    samplePrompts: [
      'Analisis mendalam kalkulasi drafting 5v5: Ling + Angela vs Nolan + Diggie',
      'Simulasi makro gameplay FF: rotasi 12 tim di safe zone 4 & 5 dengan minim casualty',
      'Resolusi adil untuk sengketa laga: Tim A disconnect massal di menit ke-3 laga semifinal',
      'Formula pembobotan performa MVP pemain turnamen berdasarkan Kill, Assist, Damage & KDA'
    ]
  }
};

export const GeminiAIView: React.FC<GeminiAIViewProps> = ({ 
  siteConfig, 
  registeredTeams,
  onOpenRegisterModal 
}) => {
  const [activeAITab, setActiveAITab] = useState<AITab>('chat');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('coach');

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content: '👋 Halo Pejuang Esports! Saya **Gemini AI Intelligence** untuk **Hunters Community & DEXZ STORE**.\n\nSaya siap membantu Anda dengan:\n- 🎮 **Strategi & Draft Meta** Free Fire & MLBB\n- 🔍 **Informasi Patch & Berita Live** (Google Search Grounding)\n- 🧠 **Analisis Taktis Mendalam** (Gemini 3.1 Pro High Thinking)\n- 🎨 **Pembuatan Logo & Poster Turnamen** (Kualitas 1K/2K/4K)\n\nSilakan tanyakan apa saja atau pilih topik cepat di bawah!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatModelMode, setChatModelMode] = useState<'flash' | 'pro' | 'lite'>('flash');
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);

  // --- IMAGE GENERATOR STATE ---
  const [genPrompt, setGenPrompt] = useState('');
  const [genImageSize, setGenImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [genAspectRatio, setGenAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [genModelQuality, setGenModelQuality] = useState<'pro' | 'flash'>('pro');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageResult, setGeneratedImageResult] = useState<string | null>(null);
  const [generatedImageCaption, setGeneratedImageCaption] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // --- IMAGE EDITOR STATE ---
  const [editSourceImage, setEditSourceImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImageResult, setEditedImageResult] = useState<string | null>(null);
  const [editExplanation, setEditExplanation] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TACTICS LAB STATE ---
  const [tacticGame, setTacticGame] = useState<'MLBB' | 'FF'>('MLBB');
  const [tacticType, setTacticType] = useState<string>('draft_synergy');
  const [tacticTeamA, setTacticTeamA] = useState('Tim Alpha Hunters (Nolan, Angela, Lapu-Lapu, Brody, Pharsa)');
  const [tacticTeamB, setTacticTeamB] = useState('Tim Bravo Predators (Fanny, Mathilda, Terizla, Beatrix, Valentina)');
  const [tacticCustomQuery, setTacticCustomQuery] = useState('Analisis kelemahan draft Tim B saat teamfight lord menit ke-12 dan rekomendasi strategi Tim A.');
  const [isTacticsLoading, setIsTacticsLoading] = useState(false);
  const [tacticsResult, setTacticsResult] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (activeAITab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeAITab]);

  // Handle role switch
  const handleRoleChange = (role: ChatRole) => {
    setSelectedRole(role);
    const cfg = ROLE_CONFIGS[role];
    setChatModelMode(cfg.defaultModel);
    setIsThinkingEnabled(cfg.enableThinking);
    setIsSearchEnabled(cfg.useSearch);
  };

  // Submit Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      // Build history for API
      const apiHistory = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const roleConfig = ROLE_CONFIGS[selectedRole];
      const res = await sendGeminiChat({
        messages: apiHistory,
        mode: chatModelMode,
        systemInstruction: roleConfig.systemInstruction,
        enableThinking: isThinkingEnabled,
        useSearch: isSearchEnabled
      });

      const modelMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        searchSources: res.searchSources,
        isThinkingUsed: res.isThinkingUsed,
        modelUsed: res.modelUsed
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Maaf, terjadi kendala saat memproses jawaban: ${err?.message || 'Koneksi AI terganggu'}. Silakan coba lagi.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Image Generation
  const handleGenerateImage = async () => {
    if (!genPrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setGenError(null);
    setGeneratedImageResult(null);
    setGeneratedImageCaption(null);

    try {
      const res = await generateEsportsImage({
        prompt: `Create a professional high-quality esports tournament graphic: ${genPrompt.trim()}. Ultra sharp, dynamic lighting, professional esports typography, 8k render aesthetic.`,
        imageSize: genImageSize,
        aspectRatio: genAspectRatio,
        modelQuality: genModelQuality
      });

      setGeneratedImageResult(res.imageUrl);
      setGeneratedImageCaption(res.caption || null);
    } catch (err: any) {
      setGenError(err?.message || 'Gagal menghasilkan gambar AI. Coba gunakan prompt yang lebih spesifik.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle Image Upload for Editing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (PNG, JPG, WEBP) yang didukung!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditSourceImage(event.target?.result as string);
      setEditedImageResult(null);
      setEditError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Image Editing
  const handleEditImage = async () => {
    if (!editSourceImage || !editPrompt.trim() || isEditingImage) return;
    setIsEditingImage(true);
    setEditError(null);
    setEditedImageResult(null);
    setEditExplanation(null);

    try {
      const res = await editEsportsImage({
        image: editSourceImage,
        prompt: editPrompt.trim(),
        aspectRatio: '1:1'
      });

      setEditedImageResult(res.imageUrl);
      setEditExplanation(res.explanation || null);
    } catch (err: any) {
      setEditError(err?.message || 'Gagal mengedit gambar AI.');
    } finally {
      setIsEditingImage(false);
    }
  };

  // Handle Deep Tactics Analysis
  const handleRunTactics = async () => {
    if (isTacticsLoading) return;
    setIsTacticsLoading(true);
    setTacticsResult(null);

    try {
      const payload = {
        game: tacticGame,
        tacticType,
        teamA: tacticTeamA,
        teamB: tacticTeamB,
        tournamentContext: 'Turnamen Resmi Hunters Community DEXZ STORE'
      };

      const res = await analyzeEsportsTactics(
        tacticType,
        payload,
        tacticCustomQuery
      );

      setTacticsResult(res.analysis);
    } catch (err: any) {
      setTacticsResult(`⚠️ Gagal melakukan analisis mendalam: ${err?.message || 'Koneksi error'}`);
    } finally {
      setIsTacticsLoading(false);
    }
  };

  const currentRoleCfg = ROLE_CONFIGS[selectedRole];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c051a] via-[#14062b] to-[#080214] border-2 border-purple-600/50 p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/40 text-purple-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>HUNTERS AI INTELLIGENCE CENTER • POWERED BY GEMINI</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Pusat Kecerdasan AI Turnamen
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Analisis strategi tim, tanyakan aturan turnamen instan, telusuri meta patch terbaru dengan Google Search, dan buat logo serta poster turnamen beresolusi tinggi (1K/2K/4K) secara otomatis.
            </p>
          </div>

          {/* Model Status Pills */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span className="text-neutral-300">Gemini 3.1 Pro (High Thinking)</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs">
              <Search className="w-4 h-4 text-blue-400" />
              <span className="text-neutral-300">Gemini 3.5 Flash (Google Search)</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-300">Gemini 3 Pro Image (1K-4K)</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-neutral-950 p-2 rounded-2xl border border-neutral-800">
        <button
          onClick={() => setActiveAITab('chat')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer uppercase ${
            activeAITab === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveAITab('image-generator')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer uppercase ${
            activeAITab === 'image-generator'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 shadow-lg shadow-orange-950/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Sparkle className="w-4 h-4" />
          <span>Buat Poster & Logo</span>
        </button>

        <button
          onClick={() => setActiveAITab('image-editor')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer uppercase ${
            activeAITab === 'image-editor'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-rose-950/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Edit Gambar AI</span>
        </button>

        <button
          onClick={() => setActiveAITab('tactics-lab')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer uppercase ${
            activeAITab === 'tactics-lab'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Laboratorium Taktis</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CHATBOT TAB */}
      {/* ========================================================================= */}
      {activeAITab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDEBAR: ROLE SELECTION & SETTINGS */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0b0615] border border-purple-900/40 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Pilih Peran AI</span>
                </span>
                <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                  4 Spesialis
                </span>
              </div>

              <div className="space-y-2">
                {(Object.keys(ROLE_CONFIGS) as ChatRole[]).map((rKey) => {
                  const role = ROLE_CONFIGS[rKey];
                  const Icon = role.icon;
                  const isSelected = selectedRole === rKey;

                  return (
                    <button
                      key={rKey}
                      onClick={() => handleRoleChange(rKey)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? `bg-gradient-to-r ${role.color} text-white border-white/30 shadow-lg font-bold`
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                          <span className="text-xs font-black">{role.badge}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-white/90' : 'text-neutral-400'}`}>
                        {role.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* ADVANCED AI CONTROLS */}
              <div className="border-t border-purple-900/30 pt-4 space-y-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Konfigurasi Model</span>
                </p>

                {/* Model Engine Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-medium">Model Gemini:</label>
                  <select
                    value={chatModelMode}
                    onChange={(e) => setChatModelMode(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="flash">Gemini 3.5 Flash (Seimbang &amp; Search)</option>
                    <option value="pro">Gemini 3.1 Pro (Penalaran Kompleks)</option>
                    <option value="lite">Gemini 3.1 Flash Lite (Ultra Cepat)</option>
                  </select>
                </div>

                {/* Thinking Mode Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                      <span>Thinking Mode</span>
                    </p>
                    <p className="text-[10px] text-neutral-400">High Reasoning Level</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isThinkingEnabled}
                    onChange={(e) => {
                      setIsThinkingEnabled(e.target.checked);
                      if (e.target.checked) setChatModelMode('pro');
                    }}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Search Grounding Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Search</span>
                    </p>
                    <p className="text-[10px] text-neutral-400">Data Web Real-time</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSearchEnabled}
                    onChange={(e) => setIsSearchEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CHAT THREAD & INPUT */}
          <div className="lg:col-span-3 bg-[#080312] border border-purple-900/50 rounded-2xl flex flex-col h-[700px] shadow-2xl overflow-hidden">
            {/* CHAT HEADER */}
            <div className="p-4 bg-[#0e061d] border-b border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${currentRoleCfg.color} text-white shadow-md`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <span>{currentRoleCfg.name}</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.2 rounded-full font-bold">
                      {chatModelMode === 'pro' ? 'Gemini 3.1 Pro' : chatModelMode === 'lite' ? 'Flash Lite' : 'Gemini 3.5 Flash'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {isThinkingEnabled ? '🧠 High Thinking Aktif' : isSearchEnabled ? '🌐 Google Search Grounding Aktif' : '⚡ Respon Cepat Siap'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Bersihkan riwayat percakapan?')) {
                    setMessages([
                      {
                        id: 'msg-reset',
                        role: 'model',
                        content: '✨ Percakapan telah direset. Ada yang bisa saya bantu terkait turnamen Free Fire / Mobile Legends?',
                        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }
                }}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Hapus Percakapan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* MESSAGES SCROLLABLE CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-purple-950/40'
                            : 'bg-[#120824] text-neutral-200 border border-purple-900/40 rounded-tl-none shadow-md'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Search Sources Citations */}
                      {msg.searchSources && msg.searchSources.length > 0 && (
                        <div className="bg-[#0b0517] p-2.5 rounded-xl border border-blue-500/30 space-y-1.5 text-[11px]">
                          <p className="text-blue-400 font-bold flex items-center gap-1.5">
                            <Search className="w-3 h-3" />
                            <span>Sumber Penelusuran Google Search:</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.searchSources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-950/60 hover:bg-blue-900 text-blue-300 rounded border border-blue-500/40 text-[10px] transition-colors"
                              >
                                <span>{src.title.length > 25 ? src.title.substring(0, 25) + '...' : src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp & Metadata Footer */}
                      <div className={`flex items-center gap-2 text-[10px] text-neutral-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {msg.modelUsed && (
                          <span className="bg-neutral-900 px-1.5 py-0.2 rounded text-neutral-400 font-mono">
                            {msg.modelUsed}
                          </span>
                        )}
                        {msg.isThinkingUsed && (
                          <span className="text-purple-400 font-bold">🧠 High Thinking</span>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <span className="text-xs font-black">YOU</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#120824] border border-purple-900/40 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-purple-300">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                    <span>
                      {isThinkingEnabled 
                        ? 'Gemini 3.1 Pro sedang berpikir mendalam (High Thinking)...' 
                        : isSearchEnabled 
                        ? 'Gemini 3.5 Flash sedang mencari informasi live...' 
                        : 'Gemini sedang menyusun jawaban...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK SAMPLE PROMPTS CHIPS */}
            <div className="px-4 py-2 bg-[#0a0415] border-t border-purple-900/30 overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
                Saran Topik:
              </span>
              {currentRoleCfg.samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sp)}
                  className="px-2.5 py-1 bg-neutral-900/90 hover:bg-purple-950 text-neutral-300 hover:text-purple-200 border border-purple-900/40 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {sp}
                </button>
              ))}
            </div>

            {/* INPUT FORM */}
            <div className="p-3 sm:p-4 bg-[#0c051b] border-t border-purple-900/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Tanya apapun ke ${currentRoleCfg.name}...`}
                  className="flex-1 bg-neutral-950 border border-purple-900/50 focus:border-purple-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMAGE GENERATOR TAB (1K, 2K, 4K) */}
      {/* ========================================================================= */}
      {activeAITab === 'image-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: CONTROLS */}
          <div className="lg:col-span-1 bg-[#0b0615] border border-amber-500/40 p-6 rounded-3xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Buat Poster / Logo AI</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Didukung model <strong>gemini-3-pro-image</strong> beresolusi tinggi 1K, 2K, dan 4K.
              </p>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Deskripsi Gambar (Prompt):</label>
              <textarea
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                rows={4}
                placeholder="Contoh: Logo tim esports Hunters Garuda dengan elang api menyala, warna neon emas & ungu, latar belakang gelap futuristik, badge turnamen..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            {/* Template Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Pilihan Cepat Template:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '🛡️ Logo Tim Esports', prompt: 'Modern sharp vector esports team logo of an aggressive cyber tiger with glowing neon eyes, shield badge, metallic gold accents, isolated dark background.' },
                  { label: '🏆 Poster Juara 1', prompt: 'Epic esports tournament championship victory banner with golden trophy, fiery particle effects, glowing stage lights, champion cup, ultra realistic 3D lighting.' },
                  { label: '🔥 Matchday FF', prompt: 'Action-packed Free Fire tournament matchday flyer, battle royale battlefield atmosphere, smoke, neon fire, energetic gaming font placeholder.' },
                  { label: '⚔️ Matchday MLBB', prompt: 'High-intensity Mobile Legends 5v5 arena showdown poster, lord pit background, glowing magic runes, cinematic esports atmosphere.' }
                ].map((tpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGenPrompt(tpl.prompt)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-[11px] text-neutral-300 text-left font-medium transition-colors cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector (1K, 2K, 4K) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Resolusi Ukuran Gambar:</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">1K / 2K / 4K UHD</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setGenImageSize(sz)}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                      genImageSize === sz
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-950/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sz} {sz === '4K' ? '🔥 Ultra' : sz === '2K' ? 'HD' : 'Standard'}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Rasio Aspek:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: '1:1', label: '1:1 (Kotak / Logo)' },
                  { ratio: '16:9', label: '16:9 (Banner)' },
                  { ratio: '9:16', label: '9:16 (Story / Reels)' },
                  { ratio: '4:3', label: '4:3 (Flyer)' },
                  { ratio: '3:4', label: '3:4 (Poster)' }
                ].map((item) => (
                  <button
                    key={item.ratio}
                    onClick={() => setGenAspectRatio(item.ratio as any)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      genAspectRatio === item.ratio
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateImage}
              disabled={!genPrompt.trim() || isGeneratingImage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/60 transition-all cursor-pointer"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Merender Gambar ({genImageSize})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Hasilkan Gambar Sekarang ({genImageSize})</span>
                </>
              )}
            </button>

            {genError && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300">
                {genError}
              </div>
            )}
          </div>

          {/* RIGHT: PREVIEW CANVAS */}
          <div className="lg:col-span-2 bg-[#080312] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[500px]">
            {isGeneratingImage ? (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white uppercase">
                    AI Sedang Membuat Grafis Esports...
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    Model <strong>gemini-3-pro-image</strong> sedang memproses prompt, pencahayaan, dan detail beresolusi <strong>{genImageSize}</strong>.
                  </p>
                </div>
              </div>
            ) : generatedImageResult ? (
              <div className="space-y-4 w-full max-w-lg animate-in zoom-in-95 duration-200">
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl group">
                  <img
                    src={generatedImageResult}
                    alt="AI Generated Esports"
                    className="w-full h-auto object-contain bg-black"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-amber-500/40">
                    {genImageSize} • {genAspectRatio}
                  </div>
                </div>

                {generatedImageCaption && (
                  <p className="text-xs text-neutral-300 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                    {generatedImageCaption}
                  </p>
                )}

                <div className="flex gap-3">
                  <a
                    href={generatedImageResult}
                    download={`hunters-esports-ai-${Date.now()}.png`}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Gambar ({genImageSize})</span>
                  </a>

                  <button
                    onClick={() => {
                      setEditSourceImage(generatedImageResult);
                      setActiveAITab('image-editor');
                    }}
                    className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Edit di Studio</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 text-neutral-500 p-8">
                <ImageIcon className="w-16 h-16 mx-auto stroke-1 text-neutral-700" />
                <h4 className="text-sm font-bold text-neutral-400 uppercase">
                  Belum Ada Gambar yang Dihasilkan
                </h4>
                <p className="text-xs max-w-sm">
                  Masukkan deskripsi logo tim atau poster turnamen di sisi kiri dan tekan tombol untuk memulai pembuatan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. IMAGE EDITOR TAB */}
      {/* ========================================================================= */}
      {activeAITab === 'image-editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CONTROLS */}
          <div className="lg:col-span-1 bg-[#0b0615] border border-pink-500/40 p-6 rounded-3xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-pink-400" />
                <span>Edit &amp; Modifikasi Gambar</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Unggah gambar atau logo yang sudah ada dan berikan instruksi perubahan ke <strong>gemini-3.1-flash-image</strong>.
              </p>
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300">1. Unggah Gambar Sumber:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {editSourceImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 max-h-48 bg-black">
                  <img
                    src={editSourceImage}
                    alt="Source"
                    className="w-full h-48 object-contain"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/80 hover:bg-neutral-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-neutral-600 transition-colors cursor-pointer"
                  >
                    Ganti Gambar
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-pink-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-950/60"
                >
                  <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-300">Klik untuk Unggah Logo/Gambar</p>
                  <p className="text-[10px] text-neutral-500 mt-1">PNG, JPG, WEBP (Maks 10MB)</p>
                </div>
              )}
            </div>

            {/* Edit Instruction Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">2. Instruksi Perubahan AI:</label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                placeholder="Contoh: Tambahkan efek api emas membara di sekitar logo, ubah background jadi ungu cyberpunk, dan tambahkan teks 'CHAMPION' di bawahnya..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-pink-500 rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEditImage}
              disabled={!editSourceImage || !editPrompt.trim() || isEditingImage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 transition-all cursor-pointer"
            >
              {isEditingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Mengedit Gambar...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Terapkan Modifikasi AI</span>
                </>
              )}
            </button>

            {editError && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300">
                {editError}
              </div>
            )}
          </div>

          {/* RIGHT: COMPARISON & RESULT */}
          <div className="lg:col-span-2 bg-[#080312] border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[500px]">
            {isEditingImage ? (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 rounded-3xl bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center mx-auto animate-pulse">
                  <Wand2 className="w-8 h-8 text-pink-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white uppercase">
                    AI Sedang Mengedit Gambar Anda...
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    Model <strong>gemini-3.1-flash-image</strong> sedang memodifikasi layer, warna, dan instruksi edit.
                  </p>
                </div>
              </div>
            ) : editedImageResult ? (
              <div className="space-y-4 w-full max-w-lg animate-in zoom-in-95 duration-200">
                <div className="relative rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-2xl">
                  <img
                    src={editedImageResult}
                    alt="AI Edited Result"
                    className="w-full h-auto object-contain bg-black"
                  />
                  <div className="absolute top-3 left-3 bg-pink-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow">
                    Hasil Editan AI
                  </div>
                </div>

                {editExplanation && (
                  <p className="text-xs text-neutral-300 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                    {editExplanation}
                  </p>
                )}

                <a
                  href={editedImageResult}
                  download={`hunters-edited-ai-${Date.now()}.png`}
                  className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar Hasil Edit</span>
                </a>
              </div>
            ) : (
              <div className="text-center space-y-3 text-neutral-500 p-8">
                <Wand2 className="w-16 h-16 mx-auto stroke-1 text-neutral-700" />
                <h4 className="text-sm font-bold text-neutral-400 uppercase">
                  Siap Melakukan Editing Gambar
                </h4>
                <p className="text-xs max-w-sm">
                  Unggah logo atau grafis tim Anda, ketik instruksi perubahan di sisi kiri, dan biarkan AI memperbarui desainnya.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TACTICS LAB (GEMINI 3.1 PRO HIGH THINKING) */}
      {/* ========================================================================= */}
      {activeAITab === 'tactics-lab' && (
        <div className="space-y-6">
          <div className="bg-[#0b0615] border border-cyan-500/40 p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/40 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase mb-2">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>HIGH THINKING STRATEGY SIMULATOR (GEMINI 3.1 PRO)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
                  Laboratorium Analisis &amp; Prediksi Taktis
                </h3>
              </div>

              {/* Game Selector */}
              <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setTacticGame('MLBB')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    tacticGame === 'MLBB' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ⚔️ Mobile Legends
                </button>
                <button
                  onClick={() => setTacticGame('FF')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    tacticGame === 'FF' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🔥 Free Fire
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Komposisi / Data Tim A:</label>
                <input
                  type="text"
                  value={tacticTeamA}
                  onChange={(e) => setTacticTeamA(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Komposisi / Data Tim B:</label>
                <input
                  type="text"
                  value={tacticTeamB}
                  onChange={(e) => setTacticTeamB(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Fokus Analisis Khusus (Instruksi Taktis):</label>
              <textarea
                value={tacticCustomQuery}
                onChange={(e) => setTacticCustomQuery(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              onClick={handleRunTactics}
              disabled={isTacticsLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60 transition-all cursor-pointer"
            >
              {isTacticsLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Gemini 3.1 Pro Sedang Melakukan Deep Reasoning (High Thinking)...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  <span>Jalankan Analisis Taktis Mendalam (High Thinking)</span>
                </>
              )}
            </button>
          </div>

          {/* TACTICS OUTPUT */}
          {tacticsResult && (
            <div className="bg-[#080312] border-2 border-cyan-500/50 p-6 sm:p-8 rounded-3xl space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm sm:text-base font-black text-white uppercase">
                    Hasil Laporan Analisis Taktis Mendalam
                  </h4>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  Gemini 3.1 Pro • ThinkingLevel.HIGH
                </span>
              </div>

              <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans bg-[#0c051b] p-5 rounded-2xl border border-neutral-800">
                {tacticsResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
