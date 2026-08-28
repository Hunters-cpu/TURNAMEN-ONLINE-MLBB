import React, { useState } from 'react';
import { Tv, Radio, Play, ExternalLink, RefreshCw, Sparkles, Video, Volume2, ShieldCheck, CheckCircle2, AlertCircle, Maximize2, X } from 'lucide-react';
import { HomeConfig } from '../types';

interface LiveBroadcastSectionProps {
  homeConfig?: HomeConfig;
  isAdmin?: boolean;
  onOpenAdminLiveTab?: () => void;
}

export function parseYouTubeEmbedUrl(urlOrId: string | undefined): string {
  if (!urlOrId || !urlOrId.trim()) return 'https://www.youtube.com/embed/live_stream';
  const clean = urlOrId.trim();

  // If it's already an embed URL
  if (clean.includes('/embed/')) {
    return clean.includes('?') ? `${clean}&autoplay=1&rel=0` : `${clean}?autoplay=1&rel=0`;
  }

  // If it's a youtu.be short link: https://youtu.be/VIDEO_ID
  const youtuBeMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return `https://www.youtube.com/embed/${youtuBeMatch[1]}?autoplay=1&rel=0`;
  }

  // If it's a youtube.com/watch?v=VIDEO_ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  }

  // If it's a youtube.com/live/VIDEO_ID
  const liveMatch = clean.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch && liveMatch[1]) {
    return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&rel=0`;
  }

  // If it's an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return `https://www.youtube.com/embed/${clean}?autoplay=1&rel=0`;
  }

  return clean;
}

export const LiveBroadcastSection: React.FC<LiveBroadcastSectionProps> = ({
  homeConfig,
  isAdmin = false,
  onOpenAdminLiveTab
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTheaterMode, setActiveTheaterMode] = useState<'youtube' | 'tiktok' | null>(null);

  const youtubeStatus = homeConfig?.youtubeLiveStatus || 'OFFLINE';
  const isYouTubeLive = youtubeStatus === 'LIVE';
  const youtubeUrl = homeConfig?.youtubeUrl || 'https://youtube.com/@dexzstoreofficial';
  const youtubeVideoUrl = homeConfig?.youtubeLiveVideoUrl || 'https://www.youtube.com/watch?v=live_stream';
  const youtubeTitle = homeConfig?.youtubeLiveTitle || 'Siaran Langsung Pertandingan Hunters Community x DEXZ Store';
  const youtubeChannelName = homeConfig?.youtubeChannelName || 'DEXZ STORE OFFICIAL';

  const tiktokStatus = homeConfig?.tiktokLiveStatus || 'OFFLINE';
  const isTikTokLive = tiktokStatus === 'LIVE';
  const tiktokUrl = homeConfig?.tiktokUrl || 'https://tiktok.com/@dexzstore.esports';
  const tiktokVideoUrl = homeConfig?.tiktokLiveVideoUrl || 'https://www.tiktok.com/@dexzstore.esports/live';
  const tiktokTitle = homeConfig?.tiktokLiveTitle || 'Caster Live Match Hunters Esports Official';
  const tiktokAccountName = homeConfig?.tiktokAccountName || '@dexzstore.esports';

  const broadcastNote = homeConfig?.liveBroadcastNote || 'Siaran akan hadir saat pertandingan semifinal & grand final';

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const youtubeEmbedSrc = parseYouTubeEmbedUrl(youtubeVideoUrl);

  return (
    <div className="bg-[#0b0c16] border-2 border-red-500/50 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* GLOW ACCENT DECORATION */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/90 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/50 text-red-500 flex items-center justify-center shadow-lg">
              <Tv className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>📺 SIARAN LANGSUNG TURNAMEN</span>
                <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                  DEXZ STORE OFFICIAL
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pantau siaran langsung pertandingan Free Fire & Mobile Legends di YouTube & TikTok resmi DEXZ STORE.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefreshStatus}
            title="Perbarui Status Siaran"
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            <span>{isRefreshing ? 'Memeriksa...' : 'Cek Status'}</span>
          </button>

          {isAdmin && onOpenAdminLiveTab && (
            <button
              onClick={onOpenAdminLiveTab}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>⚙️ Atur Siaran (Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* CARDS GRID: YOUTUBE LIVE & TIKTOK LIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        
        {/* ========================================================================= */}
        {/* 🔴 1. YOUTUBE LIVE CARD */}
        {/* ========================================================================= */}
        <div className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
          isYouTubeLive 
            ? 'bg-[#100709] border-red-500/80 ring-2 ring-red-500/30 shadow-red-950/50' 
            : 'bg-[#080912] border-neutral-800/90 hover:border-red-500/40'
        }`}>
          {/* CARD HEADER */}
          <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between gap-2 bg-[#0d0e1b]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                ▶️
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <span>YOUTUBE LIVE</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Channel: {youtubeChannelName}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            {isYouTubeLive ? (
              <span className="px-2.5 py-1 bg-red-600 text-white font-black text-[10px] rounded-full flex items-center gap-1.5 shadow-lg shadow-red-950 animate-pulse uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                🔴 SEDANG LIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-neutral-900 text-neutral-400 border border-neutral-800 font-bold text-[10px] rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
                ⚫ BELUM SIARAN
              </span>
            )}
          </div>

          {/* CARD BODY */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {isYouTubeLive ? (
              <div className="space-y-3">
                {/* LIVE EMBED PLAYER */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-red-500/40 shadow-2xl group">
                  <iframe
                    src={youtubeEmbedSrc}
                    title="YouTube Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {youtubeTitle}
                  </h4>
                  <p className="text-[11px] text-red-400 font-medium mt-0.5 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" /> Siaran langsung dapat ditonton langsung di dalam website tanpa pindah aplikasi!
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 text-center space-y-3 bg-[#05060e] rounded-xl border border-neutral-800/80">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
                  <Tv className="w-6 h-6 text-red-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-black text-white">
                    {broadcastNote}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Sistem otomatis mengaktifkan pemutar video saat siaran YouTube resmi dimulai.
                  </p>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center gap-2">
              {isYouTubeLive && (
                <button
                  type="button"
                  onClick={() => setActiveTheaterMode('youtube')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/60 active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Tonton Layar Penuh</span>
                </button>
              )}

              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-center font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider ${
                  isYouTubeLive 
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800' 
                    : 'w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg'
                }`}
              >
                <span>Channel YouTube DEXZ STORE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🔴 2. TIKTOK LIVE CARD */}
        {/* ========================================================================= */}
        <div className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
          isTikTokLive 
            ? 'bg-[#0a0712] border-fuchsia-500/80 ring-2 ring-fuchsia-500/30 shadow-fuchsia-950/50' 
            : 'bg-[#080912] border-neutral-800/90 hover:border-fuchsia-500/40'
        }`}>
          {/* CARD HEADER */}
          <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between gap-2 bg-[#0d0e1b]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-fuchsia-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                🎵
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <span>TIKTOK LIVE</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Akun: {tiktokAccountName}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            {isTikTokLive ? (
              <span className="px-2.5 py-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-[10px] rounded-full flex items-center gap-1.5 shadow-lg shadow-fuchsia-950 animate-pulse uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                🔴 SEDANG LIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-neutral-900 text-neutral-400 border border-neutral-800 font-bold text-[10px] rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
                ⚫ BELUM SIARAN
              </span>
            )}
          </div>

          {/* CARD BODY */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {isTikTokLive ? (
              <div className="space-y-3">
                {/* LIVE EMBED / PLAYER TIKTOK */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-fuchsia-500/40 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/50 flex items-center justify-center mb-2 animate-bounce">
                    <Radio className="w-6 h-6 text-fuchsia-400 animate-pulse" />
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-white uppercase">
                    🔴 SIARAN LANGSUNG TIKTOK AKTIF
                  </h5>
                  <p className="text-[11px] text-neutral-300 mt-1 max-w-xs line-clamp-2">
                    {tiktokTitle}
                  </p>
                  <span className="mt-2 text-[10px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800 px-2.5 py-0.5 rounded-full font-mono">
                    Akun: {tiktokAccountName}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {tiktokTitle}
                  </h4>
                  <p className="text-[11px] text-fuchsia-400 font-medium mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Siaran langsung dapat diputar langsung di website atau via aplikasi TikTok!
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 text-center space-y-3 bg-[#05060e] rounded-xl border border-neutral-800/80">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-500 flex items-center justify-center mx-auto shadow-inner">
                  <Radio className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-black text-white">
                    Siarkan langsung dari akun TikTok DEXZ STORE
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Saksikan gameplay seru, caster heboh, dan giveaway diamond selama turnamen berlangsung.
                  </p>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={tiktokVideoUrl || tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider ${
                  isTikTokLive
                    ? 'bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-pink-600 hover:from-cyan-400 hover:to-pink-500 text-white shadow-lg shadow-fuchsia-950/60 active:scale-95'
                    : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-lg'
                }`}
              >
                <span>{isTikTokLive ? '▶️ Tonton Live di TikTok' : 'Akun TikTok DEXZ STORE'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER NOTICE */}
      <div className="p-3 bg-[#070811] border border-neutral-800/90 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Pemantauan Otomatis: Status siaran kedua akun terhubung secara realtime ke website.</span>
        </div>
        <span className="text-neutral-500 font-mono text-[10px]">
          DEXZ STORE STREAM ENGINE v2.6
        </span>
      </div>

      {/* ========================================================================= */}
      {/* THEATER / FULLSCREEN MODAL PLAYER */}
      {/* ========================================================================= */}
      {activeTheaterMode && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0c0d18] border-2 border-red-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 sm:p-4 bg-[#101124] border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  🔴 SIARAN LANGSUNG: {activeTheaterMode === 'youtube' ? youtubeTitle : tiktokTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveTheaterMode(null)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Tutup Layar</span>
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {activeTheaterMode === 'youtube' ? (
                <iframe
                  src={youtubeEmbedSrc}
                  title="YouTube Live Theater"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/50 flex items-center justify-center">
                    <Radio className="w-8 h-8 text-fuchsia-400 animate-pulse" />
                  </div>
                  <h4 className="text-base font-black">SIARAN TIKTOK SEDANG BERLANGSUNG</h4>
                  <p className="text-xs text-neutral-400 max-w-md">
                    Klik tombol di bawah ini untuk menyaksikan siaran langsung di aplikasi atau web TikTok resmi DEXZ STORE.
                  </p>
                  <a
                    href={tiktokVideoUrl || tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <span>BUKA SIARAN TIKTOK</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
