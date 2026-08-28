import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  ExternalLink, 
  MessageSquare,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { sendQuickGeminiQuery } from '../lib/geminiClient';
import { TabType } from '../types';

interface FloatingAIAssistantProps {
  onNavigateToTab: (tab: TabType) => void;
}

interface QuickMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ onNavigateToTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<QuickMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: '⚡ Hai! Saya Asisten Kilat Hunters Community (Gemini 3.1 Flash Lite). Tanya jadwal, biaya slot, hadiah, atau aturan turnamen secara instan!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (quickPrompt?: string) => {
    const text = (quickPrompt || input).trim();
    if (!text || isLoading) return;

    const userMsg: QuickMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendQuickGeminiQuery(
        text,
        'Hunters Community adalah platform turnamen Free Fire dan Mobile Legends resmi dikelola oleh DEXZ STORE dengan pembayaran via Saweria dan Admin.'
      );

      const aiMsg: QuickMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: QuickMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Maaf, respon gagal dimuat: ${err?.message || 'Koneksi AI terganggu'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-2xl shadow-purple-950/80 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 group border-2 border-purple-400/40"
          title="Buka Asisten AI Kilat"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline font-black text-xs uppercase tracking-wider pr-1">
            Tanya AI Kilat
          </span>
        </button>
      )}

      {/* FLOATING CHAT POPUP WINDOW */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-[#090314] border-2 border-purple-600/60 rounded-3xl shadow-2xl shadow-purple-950/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#14062b] to-[#0d021f] p-3.5 border-b border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">AI Kilat (Low-Latency)</h4>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    3.1 Flash Lite
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">Respon sub-detik instan</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToTab('gemini-ai');
                }}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Buka Pusat AI Lengkap"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={m.id} className={`flex gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      isAi
                        ? 'bg-[#150929] text-neutral-200 border border-purple-900/40 rounded-tl-none'
                        : 'bg-purple-600 text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-purple-300 bg-[#150929] p-2.5 rounded-xl w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Menjawab kilat...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="px-3 py-1.5 bg-[#0e041e] border-t border-purple-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['Cara Daftar?', 'Biaya Slot Turnamen', 'Jadwal Pertandingan', 'Aturan WO'].map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2 py-0.5 bg-neutral-900 hover:bg-purple-900/60 text-neutral-300 rounded text-[10px] whitespace-nowrap border border-purple-900/40 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[#0a0217] border-t border-purple-900/50 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan kilat..."
              className="flex-1 bg-neutral-950 border border-purple-900/50 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
