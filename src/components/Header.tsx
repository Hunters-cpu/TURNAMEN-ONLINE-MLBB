import React from 'react';
import { LogIn, User, Sparkles, Sun, Moon, Globe } from 'lucide-react';
import { TabType, UserAccount, AppNotification } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  currentUser?: UserAccount | null;
  notifications?: AppNotification[];
  onSelectInfoMatchSubTab?: (subTab: string) => void;
  tickerText?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  notifications = [],
  onSelectInfoMatchSubTab,
  tickerText = 'Selamat datang di Turnamen Resmi Hunters Community DEXZ STORE! Pendaftaran Free Fire & MLBB telah dibuka. Segera daftarkan squad Anda dan raih total hadiah jutaan rupiah!'
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-[#070210]/95 backdrop-blur-md border-b border-purple-900/60 shadow-xl shadow-purple-950/40 select-none">
      {/* ========================================================================= */}
      {/* 🔹 BARIS 1 — HEADER UTAMA: SEMUA SEJAJAR, TINGGI SAMA, 1 BARIS */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5 h-12 sm:h-13">
        {/* LOGO HC & NAMA WEBSITE */}
        <div 
          onClick={() => setActiveTab('beranda')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 p-0.5 shadow-md shadow-purple-950/60 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <div className="w-full h-full bg-[#070210] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400 text-sm sm:text-base tracking-tighter">
              HC
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs sm:text-sm tracking-tight text-white uppercase group-hover:text-purple-300 transition-colors whitespace-nowrap">
              HUNTERS COMMUNITY
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-black bg-gradient-to-r from-red-600 to-purple-600 text-white rounded uppercase tracking-wider shadow-sm shrink-0">
              DEXZ STORE
            </span>
          </div>
        </div>

        {/* TOMBOL AKSI SEJAJAR: MODE TEMA, BINTANG, NOTIFIKASI, & ADMIN/LOGIN */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* TOMBOL TOGGLE THEME (PROFESSIONAL POLISH / DARK MODE) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`h-8 sm:h-8.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 shadow-sm'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/60 text-amber-300'
            }`}
            title={theme === 'dark' ? 'Aktifkan Tema "Professional Polish" (Mode Terang)' : 'Aktifkan Tema Esports Dark'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-[11px] font-bold">Polish</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span className="hidden sm:inline text-[11px] font-bold">Dark</span>
              </>
            )}
          </button>

          {/* TOMBOL BINTANG (GEMINI AI) */}
          <button
            type="button"
            onClick={() => setActiveTab('gemini-ai')}
            className={`h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl border text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'gemini-ai'
                ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white border-amber-400/80 shadow-md shadow-purple-950/60'
                : 'bg-purple-950/40 hover:bg-purple-900/60 text-amber-300 border-purple-800/60 hover:border-amber-500/60'
            }`}
            title="Pusat Kecerdasan Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline text-[11px]">Gemini AI</span>
            <span className="inline sm:hidden text-[11px]">AI</span>
          </button>

          {/* TOMBOL GOOGLE WORKSPACE (GMAIL & CALENDAR) */}
          <button
            type="button"
            onClick={() => setActiveTab('workspace-google')}
            className={`h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl border text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'workspace-google'
                ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border-neutral-700 hover:border-amber-500/60'
            }`}
            title="Google Workspace (Gmail & Calendar Turnamen)"
          >
            <span className="text-[11px]">📅</span>
            <span className="hidden sm:inline text-[11px]">Workspace</span>
          </button>

          {/* TOMBOL BRIDGE WEBSITE (KHUSUS ADMIN) */}
          {currentUser && (currentUser.role === 'admin' || currentUser.isSuperAdmin) && (
            <button
              type="button"
              onClick={() => setActiveTab('bridge-website')}
              className={`h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl border text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'bridge-website'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 border-neutral-700 hover:border-amber-500/60'
              }`}
              title="Hubungkan ke Website Lain (Akses Khusus Admin: Real-Time Bridge & Webhook)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline text-[11px]">Bridge Web</span>
              <span className="hidden lg:inline text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">ADMIN</span>
            </button>
          )}

          {/* TOMBOL NOTIFIKASI (LONCENG) */}
          <NotificationCenter
            notifications={notifications}
            currentUser={currentUser || null}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectInfoMatchSubTab={onSelectInfoMatchSubTab}
          />

          {/* TOMBOL ADMIN UTAMA / PROFIL AKUN */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                setActiveTab('login');
              } else if (currentUser.role === 'admin' || currentUser.isSuperAdmin) {
                setActiveTab('admin');
              } else {
                setActiveTab('profil');
              }
            }}
            className={`h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentUser 
                ? (currentUser.role === 'admin' || currentUser.isSuperAdmin)
                  ? 'bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 shadow-sm shadow-red-950/40'
                  : 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30 shadow-sm shadow-purple-950/40'
                : 'bg-[#10051e] border-purple-900/60 hover:border-purple-500/60 text-purple-200 hover:bg-purple-950/50'
            }`}
            title={currentUser ? `Akun: ${currentUser.name} (Buka Profil)` : 'Masuk ke Akun Anda'}
          >
            {currentUser ? (
              <>
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover shrink-0 border border-purple-400"
                  />
                ) : (
                  <User className={`w-3.5 h-3.5 shrink-0 ${currentUser.role === 'admin' || currentUser.isSuperAdmin ? 'text-red-400' : 'text-purple-400'}`} />
                )}
                <span className="max-w-[70px] xs:max-w-[95px] sm:max-w-[120px] truncate text-[11px] font-bold">
                  {currentUser.role === 'admin' || currentUser.isSuperAdmin ? (currentUser.name || 'ADMIN UTAMA') : (currentUser.nickname || currentUser.name)}
                </span>
                <span className={`px-1.5 py-0.2 text-[8.5px] rounded font-black tracking-wider shrink-0 shadow-sm ${
                  currentUser.role === 'admin' || currentUser.isSuperAdmin 
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white' 
                    : 'bg-purple-600 text-white'
                }`}>
                  {currentUser.role === 'admin' || currentUser.isSuperAdmin ? 'ADMIN' : 'PEMAIN'}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-[11px] font-bold">Masuk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔹 BARIS 2 — TICKER INFORMASI: SEJAJAR TINGGI SAMA DENGAN UNDUH APK */}
      {/* ========================================================================= */}
      <div className="bg-[#0a0314]/95 border-t border-purple-900/40 px-3 sm:px-6 py-1 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4 h-7">
          {/* RUNNING TICKER CONTAINER */}
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 h-full">
            <span className="px-2 py-0.5 bg-red-950/80 border border-red-500/50 text-red-400 font-black text-[9.5px] sm:text-[10px] rounded-md shrink-0 uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap">
              ⚠️ INFO RUNNING TICKER:
            </span>

            {/* MARQUEE TEXT ANIMATION */}
            <div className="overflow-hidden relative flex-1 min-w-0 h-full flex items-center">
              <div className="animate-marquee font-mono font-bold text-[10.5px] sm:text-[11px] text-purple-100 flex items-center gap-10 whitespace-nowrap">
                <span>{tickerText}</span>
                <span className="text-purple-400">•</span>
                <span>{tickerText}</span>
              </div>
            </div>
          </div>

          {/* TOMBOL UNDUH APK ANDROID */}
          <div className="flex items-center gap-2 shrink-0 h-full">
            <button
              type="button"
              onClick={() => setActiveTab('unduh-apk')}
              className="h-6.5 sm:h-7 px-2.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white border border-purple-400/40 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-purple-950/40 shrink-0 whitespace-nowrap active:scale-95"
            >
              <span>📱 UNDUH APK</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-[9.5px] font-mono text-purple-300/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>DEXZ STORE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};



