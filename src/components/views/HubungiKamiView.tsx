import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Globe, Mail, Phone, MessageSquare, Send, Check, Copy, ShieldCheck, Bot, Sparkles, ArrowRight, User, Trash2, HelpCircle, Zap, Edit3, Settings } from 'lucide-react';
import { ADMIN_WA, ADMIN_WA_CLEAN, OFFICIAL_EMAIL, OFFICIAL_DOMAIN } from '../../data/initialData';
import { TabType, SiteConfig } from '../../types';
import { QuickContactModal } from '../admin/QuickContactModal';

interface HubungiKamiViewProps {
  adminWa?: string;
  adminWaClean?: string;
  officialEmail?: string;
  officialDomain?: string;
  setActiveTab?: (tab: TabType) => void;
  isAdmin?: boolean;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  actionTab?: TabType;
  actionLabel?: string;
}

export const HubungiKamiView: React.FC<HubungiKamiViewProps> = ({
  adminWa = ADMIN_WA,
  adminWaClean = ADMIN_WA_CLEAN,
  officialEmail = OFFICIAL_EMAIL,
  officialDomain = OFFICIAL_DOMAIN,
  setActiveTab,
  isAdmin = false,
  siteConfig,
  setSiteConfig
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const displayAdminWa = siteConfig?.adminWa || adminWa;
  const displayEmail = siteConfig?.officialEmail || officialEmail;
  const displayDomain = siteConfig?.officialDomain || officialDomain;
  const cleanPhone = displayAdminWa.replace(/[^0-9]/g, '');

  // Initial welcome message in chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Halo! Saya AI Customer Service Admin DEXZ STORE. Saya siap menjawab pertanyaan Anda seputar turnamen, pendaftaran, saldo, jadwal, dan aturan HUNTERS COMMUNITY secara otomatis & instan.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Preset example questions from user prompt
  const presetQuestions = [
    "Dimana saya bisa lihat jadwal?",
    "Bagaimana cara menambah saldo?",
    "Apakah Admin bisa mengubah saldo saya?",
    "Bagaimana cara mendaftar?",
    "Saya belum dapat kode ruang",
    "Apa bedanya Admin dan Member?",
    "Siapa yang mengelola website ini?",
    "Apakah saldo saya aman?"
  ];

  // Comprehensive AI Knowledge Base Engine
  const generateAiAnswer = (queryText: string): { text: string; actionTab?: TabType; actionLabel?: string } => {
    const q = queryText.toLowerCase().trim();

    // 1. Jadwal Pertandingan
    if (q.includes('jadwal') || q.includes('kapan tanding') || q.includes('jam berapa') || q.includes('lihat jadwal') || q.includes('jadwal tim')) {
      return {
        text: 'Silakan buka menu 📋 Jadwal Pertandingan. Di sana tertera semua pertandingan, tanggal, jam, babak, dan tim yang bertanding.',
        actionTab: 'info-match',
        actionLabel: 'Buka Menu 📋 Jadwal Pertandingan'
      };
    }

    // 2. Saldo & Top Up
    if (q.includes('tambah saldo') || q.includes('top up') || q.includes('topup') || q.includes('isi saldo') || q.includes('tambahkan saldo') || q.includes('menambah saldo')) {
      return {
        text: 'Buka menu 💰 Saldo → pilih Top Up → masukkan jumlah → bayar sesuai QRIS yang muncul → saldo akan bertambah otomatis setelah pembayaran terkonfirmasi.',
        actionTab: 'saldo',
        actionLabel: 'Buka Menu 💰 Saldo'
      };
    }

    // 3. Admin Mengubah Saldo
    if ((q.includes('admin') && q.includes('ubah') && q.includes('saldo')) || q.includes('admin bisa mengubah saldo') || q.includes('admin edit saldo') || q.includes('admin ganti saldo')) {
      return {
        text: 'TIDAK BISA. Saldo tersimpan aman di Firebase dan hanya bisa berubah secara otomatis dari pembayaran masuk, taruhan, atau hadiah kemenangan. Admin tidak dapat mengubah saldo secara manual.',
        actionTab: 'saldo',
        actionLabel: 'Cek Status Saldo'
      };
    }

    // 4. Cara Pendaftaran / Daftar
    if (q.includes('mendaftar') || q.includes('cara daftar') || q.includes('pendaftaran') || q.includes('daftar turnamen') || q.includes('ikut turnamen')) {
      return {
        text: 'Buka menu 📋 Pendaftaran → pilih Free Fire atau Mobile Legends → isi data lengkap tim → tekan KIRIM → tunggu status menjadi ✅ SAH → lakukan pembayaran → unggah bukti pembayaran → tunggu konfirmasi selesai.',
        actionTab: 'form-pendaftaran',
        actionLabel: 'Buka Menu 📋 Pendaftaran'
      };
    }

    // 5. Kode Ruang / Room ID
    if (q.includes('kode ruang') || q.includes('kode room') || q.includes('room id') || q.includes('password room') || q.includes('sandi room') || q.includes('belum dapat kode')) {
      return {
        text: 'Kode ruang dikirim ke nomor WhatsApp kapten tim 20 menit sebelum pertandingan dimulai. Pastikan nomor WhatsApp yang terdaftar benar dan sudah masuk grup resmi.',
        actionTab: 'info-match',
        actionLabel: 'Lihat Info Match & Kode'
      };
    }

    // 6. Perbedaan Admin & Member
    if (q.includes('bedanya admin') || q.includes('beda admin') || q.includes('perbedaan admin') || q.includes('hak akses') || q.includes('role')) {
      return {
        text: 'Admin: Mengelola semua data, konfirmasi pendaftaran, ubah jadwal, tetapkan pemenang, kirim pengumuman. Member: Hanya dapat mendaftar, melihat informasi, pasang taruhan, cek saldo — tidak dapat mengubah data apa pun.'
      };
    }

    // 7. Pengelola / Siapa DEXZ STORE
    if (q.includes('mengelola') || q.includes('pemilik') || q.includes('siapa dexz') || q.includes('siapa yang mengelola') || q.includes('penyelenggara')) {
      return {
        text: 'HUNTERS COMMUNITY dikelola oleh DEXZ STORE. Pusat Turnamen Free Fire & Mobile Legends yang resmi, aman, dan terpercaya.'
      };
    }

    // 8. Keamanan Saldo
    if (q.includes('saldo saya aman') || q.includes('keamanan saldo') || q.includes('saldo aman')) {
      return {
        text: 'Ya, saldo Anda tersimpan aman di Firebase. Setiap pengguna memiliki saldo sendiri-sendiri dan tidak dapat diubah oleh siapa pun kecuali sistem pembayaran otomatis.',
        actionTab: 'saldo',
        actionLabel: 'Buka Menu 💰 Saldo'
      };
    }

    // 9. Biaya Pendaftaran / Biaya Slot
    if (q.includes('biaya') || q.includes('harga slot') || q.includes('bayar berapa')) {
      return {
        text: 'Biaya pendaftaran turnamen adalah Rp50.000/Tim untuk game Free Fire maupun Mobile Legends.',
        actionTab: 'form-pendaftaran',
        actionLabel: 'Daftar Sekarang'
      };
    }

    // Default Fallback
    return {
      text: 'Terima kasih atas pertanyaannya. Untuk informasi resmi lebih lanjut atau kendala teknis, Anda dapat menghubungi WhatsApp Admin DEXZ STORE secara langsung.',
      actionTab: 'info-match',
      actionLabel: 'Lihat Info Turnamen'
    };
  };

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserQuery('');
    setIsTyping(true);

    // Instant AI response execution (0ms wait, instant answer on screen!)
    setTimeout(() => {
      const aiResult = generateAiAnswer(questionText);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiResult.text,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actionTab: aiResult.actionTab,
        actionLabel: aiResult.actionLabel
      };

      setChatHistory(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 150);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleAskQuestion(userQuery);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(displayEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 border border-emerald-500/40 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>JAWABAN OTOMATIS & INSTAN DETIK ITU JUGA</span>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-950 cursor-pointer transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>⚡ Edit Kontak Admin & Ticker Langsung</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-emerald-400 shrink-0" />
            <span>HUBUNGI CS ADMIN DEXZ STORE</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Silakan tulis pertanyaan Anda di bawah ini, AI akan menjawab secara otomatis berdasarkan seluruh isi, menu, aturan, dan cara kerja website HUNTERS COMMUNITY. Tanpa perlu mengirim pesan ke Admin &amp; tanpa menunggu balasan!
          </p>
        </div>
      </div>

      {/* INSTANT AI CHATBOT CONTAINER */}
      <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* CHAT HEADER */}
        <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>AI CS Official DEXZ STORE</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono font-bold">24/7 INSTAN</span>
              </span>
              <span className="text-[10px] text-emerald-400">Aktif & Siap Menjawab 0 Detik</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setChatHistory([{
              id: 'welcome-1',
              sender: 'ai',
              text: 'Halo! Saya AI Customer Service Admin DEXZ STORE. Silakan pilih pertanyaan atau ketik pesan Anda.',
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }])}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bersihkan Chat</span>
          </button>
        </div>

        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto bg-[#07090e]">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.actionTab && setActiveTab && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab(msg.actionTab!)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <span>{msg.actionLabel || 'Buka Halaman'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span className={`text-[9px] block text-right font-mono ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-emerald-400 font-mono italic animate-pulse">
              <Bot className="w-4 h-4" />
              <span>AI sedang mengetik jawaban resmi...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* PRESET QUICK CLICK QUESTIONS */}
        <div className="bg-slate-900/90 px-4 py-3 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>PILIH PERTANYAAN CEPAT (KLIK LANGSUNG DIJAWAB):</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskQuestion(q)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-xs text-slate-300 hover:text-emerald-300 font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT INPUT FORM */}
        <form onSubmit={handleSubmitForm} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Tulis pertanyaan Anda di sini... (contoh: kapan jadwal match saya?)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70"
          />
          <button
            type="submit"
            disabled={!userQuery.trim()}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer transition-all"
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* OFFICIAL HUMAN CONTACT CHANNELS GRID */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Atau Hubungi Admin Resmi Via WhatsApp / Email
            </h2>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Kontak</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WEBSITE */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-amber-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Website Resmi</span>
              <strong className="text-sm text-white font-extrabold">{displayDomain}</strong>
            </div>
            <a
              href={displayDomain.startsWith('http') ? displayDomain : `https://${displayDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 font-bold hover:underline block pt-1"
            >
              Kunjungi Website Portal →
            </a>
          </div>

          {/* EMAIL */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-pink-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Email Official</span>
              <strong className="text-xs sm:text-sm text-white font-mono font-bold break-all">{displayEmail}</strong>
            </div>
            <button
              onClick={copyEmail}
              className="text-xs text-pink-400 font-bold hover:underline inline-flex items-center gap-1 pt-1 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Email Tersalin' : 'Salin Email'}</span>
            </button>
          </div>

          {/* WHATSAPP ADMIN */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/60 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">WhatsApp Fast Response</span>
              <strong className="text-sm text-emerald-400 font-extrabold">{displayAdminWa}</strong>
            </div>
            <a
              href={`https://wa.me/${cleanPhone || '6283148834663'}?text=${encodeURIComponent('Halo Admin DEXZ STORE Hunters Community!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 font-bold hover:underline block pt-1"
            >
              Chat Direct WhatsApp Admin →
            </a>
          </div>
        </div>
      </div>

      {/* ORGANIZER DEXZ STORE BRANDING */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DEXZ STORE</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
          Penyelenggara Resmi • Terpercaya • Siap Melayani
        </h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          Mendukung perkembangan e-sports Indonesia dengan menyelenggarakan turnamen Free Fire &amp; Mobile Legends yang adil, terjangkau, adil, transparan, dan profesional.
        </p>
      </div>

      {/* QUICK CONTACT MODAL */}
      {siteConfig && setSiteConfig && (
        <QuickContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
        />
      )}
    </div>
  );
};
