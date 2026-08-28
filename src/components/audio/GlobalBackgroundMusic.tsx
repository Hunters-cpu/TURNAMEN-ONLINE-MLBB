import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Radio,
  Youtube,
  Headphones,
  Eye,
  EyeOff,
  ListMusic,
  Check,
  RotateCcw,
  X
} from 'lucide-react';
import { SiteConfig, BackgroundMusicTrack, MusicSourceType } from '../../types';

interface GlobalBackgroundMusicProps {
  siteConfig: SiteConfig;
}

export const GlobalBackgroundMusic: React.FC<GlobalBackgroundMusicProps> = ({ siteConfig }) => {
  const bgConfig = siteConfig.backgroundMusic;
  const isEnabled = bgConfig?.isEnabled !== false;
  
  // All available tracks
  const tracks = bgConfig?.tracks || [];

  // Active track ID state (can be changed by user locally or synced with admin config)
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    try {
      const savedUserTrack = localStorage.getItem('hunters_bg_music_user_track_id');
      if (savedUserTrack && tracks.some(t => t.id === savedUserTrack)) {
        return savedUserTrack;
      }
    } catch (e) {}
    return bgConfig?.activeTrackId || tracks[0]?.id || '';
  });

  // Sync if admin changes active track and user hasn't overridden
  useEffect(() => {
    if (bgConfig?.activeTrackId) {
      const savedUserTrack = localStorage.getItem('hunters_bg_music_user_track_id');
      if (!savedUserTrack || !tracks.some(t => t.id === savedUserTrack)) {
        setSelectedTrackId(bgConfig.activeTrackId);
      }
    }
  }, [bgConfig?.activeTrackId]);

  // Find active track object
  const activeTrack: BackgroundMusicTrack | undefined = 
    tracks.find((t) => t.id === selectedTrackId) ||
    tracks.find((t) => t.id === bgConfig?.activeTrackId) ||
    tracks[0];

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

  // Track playback state (default to true so music plays automatically)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [showTrackList, setShowTrackList] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showVideoFeed, setShowVideoFeed] = useState<boolean>(!bgConfig?.hideVideo);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoPlay = useRef<boolean>(false);
  const currentLoadedTrackUrl = useRef<string>('');

  // Sync Audio Element for HTML5 / Direct Audio
  useEffect(() => {
    if (sourceType === 'upload' || sourceType === 'direct_link') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.loop = bgConfig?.loop !== false;

      // Handle onended event as a reliable fallback for looping full song
      const handleEnded = () => {
        if (bgConfig?.loop !== false) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          setIsPlaying(false);
        }
      };

      audio.removeEventListener('ended', handleEnded);
      audio.addEventListener('ended', handleEnded);

      if (activeTrack && activeTrack.url) {
        if (currentLoadedTrackUrl.current !== activeTrack.url) {
          currentLoadedTrackUrl.current = activeTrack.url;
          audio.src = activeTrack.url;
          audio.load();
          if (isPlaying) {
            audio.play()
              .then(() => {
                setIsPlaying(true);
                setAudioError(null);
              })
              .catch(() => {
                // Autoplay may need user gesture; listener below handles first click
              });
          }
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      // Pause HTML5 audio if switching to YouTube / Spotify / SoundCloud
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [activeTrack?.id, activeTrack?.url, bgConfig?.loop, sourceType]);

  // Update volume on HTML5 audio element
  useEffect(() => {
    if (audioRef.current) {
      const effectiveVol = isMuted ? 0 : Math.max(0, Math.min(100, userVolume)) / 100;
      audioRef.current.volume = effectiveVol;
    }
  }, [userVolume, isMuted]);

  // AutoPlay on initial load
  useEffect(() => {
    if (activeTrack && !hasAttemptedAutoPlay.current) {
      hasAttemptedAutoPlay.current = true;
      setIsPlaying(true);
      if (sourceType === 'upload' || sourceType === 'direct_link') {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setAudioError(null);
            })
            .catch(() => {
              // Wait for first user click to unlock browser audio policy
            });
        }
      }
    }
  }, [activeTrack?.id, sourceType]);

  // Unlocking audio on first user gesture anywhere on the screen if autoplay was blocked
  useEffect(() => {
    const handleFirstGesture = () => {
      if (isPlaying && activeTrack) {
        if (sourceType === 'upload' || sourceType === 'direct_link') {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setAudioError(null);
              })
              .catch(() => {});
          }
        }
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [isPlaying, activeTrack, sourceType]);

  // Listen to custom window events for music control
  useEffect(() => {
    const handleCustomPlay = (e: CustomEvent) => {
      const track: BackgroundMusicTrack | undefined = e.detail?.track;
      if (track) {
        setSelectedTrackId(track.id);
        setIsPlaying(true);
        setAudioError(null);
        if (track.sourceType === 'upload' || track.sourceType === 'direct_link') {
          if (audioRef.current) {
            currentLoadedTrackUrl.current = track.url;
            audioRef.current.src = track.url;
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch((err) => {
                setAudioError('Klik tombol play untuk memulai audio: ' + err.message);
              });
          }
        }
      } else {
        resumePlay();
      }
    };

    const handleCustomStop = () => {
      pausePlay();
    };

    const handleCustomToggle = () => {
      togglePlay();
    };

    const handleCustomVolume = (e: CustomEvent) => {
      if (typeof e.detail?.volume === 'number') {
        changeVolume(e.detail.volume);
      }
    };

    window.addEventListener('hunters:play-music' as any, handleCustomPlay);
    window.addEventListener('hunters:stop-music' as any, handleCustomStop);
    window.addEventListener('hunters:toggle-music' as any, handleCustomToggle);
    window.addEventListener('hunters:set-music-volume' as any, handleCustomVolume);

    return () => {
      window.removeEventListener('hunters:play-music' as any, handleCustomPlay);
      window.removeEventListener('hunters:stop-music' as any, handleCustomStop);
      window.removeEventListener('hunters:toggle-music' as any, handleCustomToggle);
      window.removeEventListener('hunters:set-music-volume' as any, handleCustomVolume);
    };
  }, [activeTrack, sourceType, isPlaying]);

  const resumePlay = () => {
    setIsPlaying(true);
    setAudioError(null);
    if (sourceType === 'upload' || sourceType === 'direct_link') {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const pausePlay = () => {
    setIsPlaying(false);
    if (sourceType === 'upload' || sourceType === 'direct_link') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!activeTrack) {
      setAudioError('Musik latar belum diatur.');
      return;
    }

    if (isPlaying) {
      pausePlay();
    } else {
      resumePlay();
    }
  };

  const changeVolume = (vol: number) => {
    setUserVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
      try {
        localStorage.setItem('hunters_bg_music_muted', 'false');
      } catch (e) {}
    }
    try {
      localStorage.setItem('hunters_bg_music_volume', vol.toString());
    } catch (e) {}
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem('hunters_bg_music_muted', nextMuted ? 'true' : 'false');
    } catch (e) {}
  };

  // Switch Track from User Widget
  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    try {
      localStorage.setItem('hunters_bg_music_user_track_id', trackId);
    } catch (e) {}

    const chosenTrack = tracks.find(t => t.id === trackId);
    if (chosenTrack) {
      setIsPlaying(true);
      setAudioError(null);
      if (chosenTrack.sourceType === 'upload' || chosenTrack.sourceType === 'direct_link') {
        if (audioRef.current) {
          currentLoadedTrackUrl.current = chosenTrack.url;
          audioRef.current.src = chosenTrack.url;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }
    setShowTrackList(false);
  };

  const handleResetToAdminDefault = () => {
    try {
      localStorage.removeItem('hunters_bg_music_user_track_id');
    } catch (e) {}
    if (bgConfig?.activeTrackId) {
      handleSelectTrack(bgConfig.activeTrackId);
    }
  };

  if (!isEnabled || !activeTrack || bgConfig?.widgetPosition === 'hidden') {
    return null;
  }

  // Positioning classes (Bottom Right or Top Right)
  const isTopRight = bgConfig?.widgetPosition === 'top-right';
  const positionClasses = isTopRight
    ? 'fixed top-20 right-4 sm:top-24 sm:right-6 z-40'
    : 'fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40';

  // Dynamic Icon according to Source
  const renderFloatingIcon = () => {
    switch (sourceType) {
      case 'youtube':
        return <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case 'spotify':
        return <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />;
      case 'soundcloud':
        return <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      default:
        return <Music className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
    }
  };

  // Construct iframe URLs
  const youtubeIframeSrc = activeTrack.youtubeVideoId
    ? `https://www.youtube-nocookie.com/embed/${activeTrack.youtubeVideoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${activeTrack.youtubeVideoId}`
    : activeTrack.embedUrl || '';

  const spotifyIframeSrc = activeTrack.embedUrl || (activeTrack.spotifyId
    ? `https://open.spotify.com/embed/${activeTrack.spotifyType || 'track'}/${activeTrack.spotifyId}?utm_source=generator&theme=0`
    : '');

  const soundcloudIframeSrc = activeTrack.embedUrl || (activeTrack.url
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(activeTrack.url)}&color=%23f59e0b&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`
    : '');

  return (
    <>
      {/* 
        ========================================================================
        PERSISTENT BACKGROUND MEDIA PLAYERS (ALWAYS MOUNTED IN DOM)
        - Never unmounted when panel opens/closes so audio NEVER interrupts/restarts!
        ========================================================================
      */}
      <div id="persistent-background-music-engine" className="fixed bottom-0 right-0 pointer-events-none z-0">
        {/* YouTube Persistent Iframe */}
        {sourceType === 'youtube' && activeTrack.youtubeVideoId && isPlaying && (
          <div 
            className={`transition-opacity duration-300 ${
              isPanelOpen && showVideoFeed
                ? 'fixed bottom-40 right-6 sm:bottom-44 sm:right-8 w-72 sm:w-80 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 pointer-events-auto z-50'
                : 'w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
            }`}
          >
            <iframe
              id="persistent-youtube-player-iframe"
              src={youtubeIframeSrc}
              title="YouTube Background Music Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Spotify Persistent Iframe */}
        {sourceType === 'spotify' && spotifyIframeSrc && isPlaying && (
          <div 
            className={`transition-opacity duration-300 ${
              isPanelOpen 
                ? 'fixed bottom-40 right-6 sm:bottom-44 sm:right-8 w-72 sm:w-80 h-[152px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 pointer-events-auto z-50'
                : 'w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
            }`}
          >
            <iframe
              id="persistent-spotify-player-iframe"
              src={spotifyIframeSrc}
              title="Spotify Background Music Player"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* SoundCloud Persistent Iframe */}
        {sourceType === 'soundcloud' && soundcloudIframeSrc && isPlaying && (
          <div 
            className={`transition-opacity duration-300 ${
              isPanelOpen 
                ? 'fixed bottom-40 right-6 sm:bottom-44 sm:right-8 w-72 sm:w-80 h-[166px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 pointer-events-auto z-50'
                : 'w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
            }`}
          >
            <iframe
              id="persistent-soundcloud-player-iframe"
              src={soundcloudIframeSrc}
              title="SoundCloud Background Music Player"
              allow="autoplay"
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        FLOATING WIDGET CONTAINER & CONTROL PANEL (KANAN BAWAH LAYAR)
        ========================================================================
      */}
      <div 
        id="persistent-music-container"
        className={positionClasses + ' flex flex-col items-end gap-2 pointer-events-auto select-none'}
      >
        {/* EXPANDABLE SETTINGS & CONTROLS PANEL */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              id="bg-music-control-card"
              initial={{ opacity: 0, scale: 0.92, y: isTopRight ? -15 : 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: isTopRight ? -15 : 15 }}
              transition={{ duration: 0.18 }}
              className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-700/80 p-4 rounded-3xl shadow-2xl w-80 sm:w-96 text-white space-y-3.5 relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
                sourceType === 'youtube' ? 'bg-red-500/20' : sourceType === 'spotify' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              }`} />

              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    {renderFloatingIcon()}
                    <span>
                      {sourceType === 'youtube' ? 'YouTube Player' : sourceType === 'spotify' ? 'Spotify Player' : sourceType === 'soundcloud' ? 'SoundCloud Player' : 'Musik Latar Website'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {tracks.length > 1 && (
                    <button
                      id="btn-toggle-track-list"
                      onClick={() => setShowTrackList(!showTrackList)}
                      title="Ganti Musik / Pilih Lagu Lain"
                      className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                        showTrackList 
                          ? 'bg-amber-500 text-neutral-950' 
                          : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                      }`}
                    >
                      <ListMusic className="w-3.5 h-3.5" />
                      <span>Ganti Lagu</span>
                    </button>
                  )}
                  {sourceType === 'youtube' && (
                    <button
                      onClick={() => setShowVideoFeed(!showVideoFeed)}
                      title={showVideoFeed ? 'Sembunyikan Video (Audio Saja)' : 'Tampilkan Video'}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 text-xs"
                    >
                      {showVideoFeed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    id="btn-close-music-panel"
                    onClick={() => {
                      setIsPanelOpen(false);
                      setShowTrackList(false);
                    }}
                    title="Tutup Panel (Musik Tetap Berjalan)"
                    className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TRACK SELECTOR LIST (IF USER CLICKS GANTI LAGU) */}
              {showTrackList && (
                <div className="bg-neutral-900/90 rounded-2xl p-2.5 border border-neutral-800 space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 pb-1 border-b border-neutral-800">
                    <span className="flex items-center gap-1">
                      <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pilih Lagu Lain:</span>
                    </span>
                    <button
                      onClick={handleResetToAdminDefault}
                      title="Kembalikan ke lagu utama pilihan Admin"
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Default Admin</span>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {tracks.map((t) => {
                      const isThisActive = t.id === activeTrack?.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTrack(t.id)}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            isThisActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                              : 'bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              {t.sourceType}
                            </span>
                            <span className="truncate">{t.title}</span>
                          </div>
                          {isThisActive && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Track Title Banner */}
              <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Lagu Aktif:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono">
                    {activeTrack.duration || '1 Lagu Penuh'}
                  </span>
                </div>
                <div className="text-xs font-bold text-neutral-100 truncate flex items-center gap-1.5">
                  <span className="truncate">{activeTrack.title}</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{isPlaying ? 'Sedang Berputar Otomatis (Looping Penuh)' : 'Musik Dihentikan Sementara'}</span>
                </div>
              </div>

              {/* Error feedback if any */}
              {audioError && (
                <div className="text-[10px] text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-800/40">
                  {audioError}
                </div>
              )}

              {/* Volume Slider & Controls */}
              <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium flex items-center gap-1">
                    <span>Volume:</span>
                    <span className="font-mono font-bold text-amber-300">{isMuted ? '0% (Muted)' : `${userVolume}%`}</span>
                  </span>
                  <button
                    id="btn-toggle-mute"
                    onClick={toggleMute}
                    className={`text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                      isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{isMuted ? 'Bunyikan' : 'Matikan'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => changeVolume(0)} className="text-neutral-400 hover:text-white cursor-pointer">
                    <VolumeX className="w-4 h-4" />
                  </button>
                  <input
                    id="user-bg-music-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : userVolume}
                    onChange={(e) => changeVolume(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <button onClick={() => changeVolume(100)} className="text-neutral-400 hover:text-white cursor-pointer">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Quick Presets */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[0, 25, 50, 75, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => changeVolume(preset)}
                      className={`text-[10px] font-mono py-1 rounded cursor-pointer transition-colors ${
                        userVolume === preset && !isMuted
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Play / Pause Action in Panel */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  id="btn-panel-toggle-play"
                  onClick={togglePlay}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Hentikan Musik (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Lanjutkan Musik (Play)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-neutral-400 text-center leading-tight bg-neutral-900/40 p-1.5 rounded-lg">
                ✨ Musik tetap berputar di latar belakang saat panel ditutup atau saat pindah halaman!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- */}
        {/* MAIN COMPACT FLOATING BUTTON WIDGET (KANAN BAWAH LAYAR) */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md p-1 rounded-full border border-neutral-700/80 shadow-2xl">
          {/* Main Action Button (Play / Pause / Source Icon) */}
          <button
            id="btn-floating-music-toggle"
            onClick={togglePlay}
            title={isPlaying ? `Matikan Musik (${activeTrack.title})` : `Putar Musik (${activeTrack.title})`}
            className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 shadow-md cursor-pointer ${
              isPlaying
                ? sourceType === 'youtube'
                  ? 'bg-gradient-to-tr from-red-600 to-red-500 text-white shadow-red-500/30 ring-2 ring-red-400/40 ring-offset-2 ring-offset-neutral-950'
                  : sourceType === 'spotify'
                  ? 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-neutral-950'
                  : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 shadow-amber-500/30 ring-2 ring-amber-400/40 ring-offset-2 ring-offset-neutral-950'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-center justify-center gap-0.5">
                <span className="w-0.5 sm:w-1 bg-current rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '12px' }}></span>
                <span className="w-0.5 sm:w-1 bg-current rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" style={{ height: '16px' }}></span>
                <span className="w-0.5 sm:w-1 bg-current rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" style={{ height: '10px' }}></span>
                <span className="w-0.5 sm:w-1 bg-current rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.3s]" style={{ height: '14px' }}></span>
              </div>
            ) : (
              renderFloatingIcon()
            )}
          </button>

          {/* Title label preview */}
          {bgConfig?.showTitle !== false && (
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="hidden sm:block text-left px-2 max-w-[130px] truncate cursor-pointer"
            >
              <span className="text-[10px] font-bold text-white truncate block leading-tight">
                {activeTrack.title}
              </span>
              <span className="text-[9px] text-amber-400/90 font-mono flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                {isPlaying ? 'MEMUTAR' : 'MATI'}
              </span>
            </button>
          )}

          {/* Quick Open Volume Panel Button */}
          <button
            id="btn-open-music-volume-panel"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            title="Buka Pengaturan Musik (Volume, Matikan, Ganti Lagu)"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-bold text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/80 transition-colors cursor-pointer"
          >
            <span className="font-mono text-[11px] text-amber-300">
              {isMuted ? '🔇' : `${userVolume}%`}
            </span>
            {isPanelOpen ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />}
          </button>
        </div>
      </div>
    </>
  );
};
