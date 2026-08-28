import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Radio, 
  Lock, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  Youtube,
  Headphones,
  FileAudio,
  Eye,
  EyeOff
} from 'lucide-react';
import { SiteConfig, BackgroundMusicTrack, MusicSourceType } from '../../types';

interface UserBackgroundMusicSettingsProps {
  siteConfig: SiteConfig;
}

export const UserBackgroundMusicSettings: React.FC<UserBackgroundMusicSettingsProps> = ({ siteConfig }) => {
  const bgConfig = siteConfig.backgroundMusic;
  const isEnabled = bgConfig?.isEnabled !== false;

  const activeTrack: BackgroundMusicTrack | undefined = bgConfig?.tracks?.find(
    (t) => t.id === bgConfig?.activeTrackId
  ) || bgConfig?.tracks?.[0];

  const sourceType: MusicSourceType = activeTrack?.sourceType || 'upload';

  // User Volume preference (0 - 100)
  const [userVolume, setUserVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hunters_bg_music_volume');
      if (saved !== null) return parseInt(saved, 10);
    } catch (e) {}
    return bgConfig?.defaultVolume ?? 50;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hunters_bg_music_muted');
      return saved === 'true';
    } catch (e) {}
    return false;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [showEmbeddedPlayer, setShowEmbeddedPlayer] = useState<boolean>(false);

  const handleTogglePlay = () => {
    window.dispatchEvent(new CustomEvent('hunters:toggle-music'));
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (vol: number) => {
    setUserVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
    window.dispatchEvent(new CustomEvent('hunters:set-music-volume', { detail: { volume: vol } }));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    window.dispatchEvent(new CustomEvent('hunters:set-music-volume', { detail: { volume: nextMuted ? 0 : userVolume } }));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const renderSourceBadge = (source: MusicSourceType) => {
    switch (source) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube Audio</span>
          </span>
        );
      case 'spotify':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spotify Music</span>
          </span>
        );
      case 'soundcloud':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>SoundCloud Stream</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
            <FileAudio className="w-3.5 h-3.5 text-blue-400" />
            <span>File Musik Lokal</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 p-6 sm:p-8 border border-neutral-700 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="uppercase tracking-wider">PENGATURAN MUSIK LATAR PENGGUNA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Music className="w-8 h-8 text-amber-400" />
            <span>🎵 MUSIK LATAR BELAKANG</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Nikmati suasana turnamen esports dengan audio musik latar (YouTube, Spotify, SoundCloud & Upload). Atur pemutaran, sesuaikan volume pendengaran Anda, dan preferensi tersimpan otomatis di perangkat Anda.
          </p>
        </div>
      </div>

      {/* MAIN PLAYER CARD */}
      <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Lagu Latar Turnamen Resmi:
              </span>
              {activeTrack && renderSourceBadge(activeTrack.sourceType)}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              <span>{activeTrack?.title || 'Musik Belum Dikonfigurasi Panitia'}</span>
            </h3>

            <p className="text-xs text-neutral-400">
              Durasi: <span className="font-mono text-white font-bold">{activeTrack?.duration || 'Looping'}</span> • Diunggah oleh: <span className="text-neutral-300">{activeTrack?.uploadedBy || 'Admin DEXZ STORE'}</span>
            </p>
          </div>

          {/* MAIN BIG PLAY / PAUSE BUTTON */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              id="btn-user-page-play-music"
              onClick={handleTogglePlay}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Hentikan Musik</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Putar Musik Latar</span>
                </>
              )}
            </button>

            {(sourceType === 'youtube' || sourceType === 'spotify' || sourceType === 'soundcloud') && (
              <button
                onClick={() => setShowEmbeddedPlayer(!showEmbeddedPlayer)}
                className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showEmbeddedPlayer ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                <span>{showEmbeddedPlayer ? 'Tutup Player' : 'Lihat Player'}</span>
              </button>
            )}
          </div>
        </div>

        {/* EMBEDDED PLAYER IF TOGGLED */}
        {showEmbeddedPlayer && activeTrack && (
          <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 p-2 animate-in fade-in">
            {sourceType === 'youtube' && (
              <div className="aspect-video w-full">
                <iframe
                  src={activeTrack.embedUrl || `https://www.youtube-nocookie.com/embed/${activeTrack.youtubeVideoId}?autoplay=1`}
                  title="YouTube Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 rounded-xl"
                />
              </div>
            )}
            {sourceType === 'spotify' && (
              <div className="h-[152px] w-full">
                <iframe
                  src={activeTrack.embedUrl}
                  title="Spotify Player"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="w-full h-full border-0 rounded-xl"
                />
              </div>
            )}
            {sourceType === 'soundcloud' && (
              <div className="h-[166px] w-full">
                <iframe
                  src={activeTrack.embedUrl}
                  title="SoundCloud Player"
                  allow="autoplay"
                  className="w-full h-full border-0 rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {/* VOLUME SLIDER SECTION */}
        <div className="space-y-4 max-w-2xl bg-[#050505] p-5 sm:p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                Volume Musik Pribadi Anda:
              </span>
            </div>
            <span className="font-mono font-black text-amber-400 text-sm">
              {isMuted ? '0% (Mute)' : `${userVolume}%`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <input
              id="user-setting-volume-range"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : userVolume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <button
              onClick={() => handleVolumeChange(100)}
              className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
              title="Set Maksimal 100%"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[0, 25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => handleVolumeChange(preset)}
                className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                  userVolume === preset && !isMuted
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>

          {saveToast && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Volume disimpan otomatis di browser perangkat Anda!</span>
            </div>
          )}
        </div>

        {/* SYSTEM INFORMATION & PERSISTENCE NOTICE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-1.5">
            <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Musik Berjalan Antar Halaman</span>
            </span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Musik tidak akan berhenti atau terulang dari awal ketika Anda berpindah halaman (misal dari Beranda ke Jadwal, Pendaftaran, atau Aturan).
            </p>
          </div>

          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-1.5">
            <span className="font-extrabold text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-neutral-400" />
              <span>Pengaturan Musik Utama</span>
            </span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Hanya Admin DEXZ STORE terverifikasi yang memiliki hak akses untuk mengunggah, mengganti, dan menghapus musik latar utama website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
