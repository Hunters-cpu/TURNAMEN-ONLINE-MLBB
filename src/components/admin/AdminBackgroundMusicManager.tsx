import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Upload, 
  Link as LinkIcon,
  Trash2, 
  CheckCircle2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  FileAudio, 
  AlertCircle,
  Clock,
  User,
  RefreshCw,
  Sliders,
  Info,
  Youtube,
  Headphones,
  ExternalLink,
  Eye,
  EyeOff,
  Layout,
  Check,
  Flame,
  Globe
} from 'lucide-react';
import { 
  SiteConfig, 
  BackgroundMusicTrack, 
  BackgroundMusicConfig, 
  UserAccount, 
  MusicSourceType, 
  MusicWidgetPosition 
} from '../../types';
import { parseMusicLink, ParsedMusicInfo } from '../../utils/musicLinkParser';

interface AdminBackgroundMusicManagerProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  currentUser: UserAccount | null;
}

export const AdminBackgroundMusicManager: React.FC<AdminBackgroundMusicManagerProps> = ({
  siteConfig,
  setSiteConfig,
  currentUser
}) => {
  const bgConfig: BackgroundMusicConfig = siteConfig.backgroundMusic || {
    isEnabled: true,
    activeTrackId: '',
    defaultVolume: 50,
    autoPlayOnLoad: false,
    loop: true,
    hideVideo: true,
    showTitle: true,
    widgetPosition: 'bottom-right',
    tracks: []
  };

  // Active Tab: 'link' (default/highlighted) | 'upload'
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');

  // --- LINK FORM STATE ---
  const [inputUrl, setInputUrl] = useState<string>('');
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [parsedInfo, setParsedInfo] = useState<ParsedMusicInfo | null>(null);

  // --- FILE UPLOAD STATE ---
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileDuration, setFileDuration] = useState<string>('00:00');

  // --- GENERAL OPTIONS STATE ---
  const [defaultVolume, setDefaultVolume] = useState<number>(bgConfig.defaultVolume ?? 50);
  const [autoPlayOnLoad, setAutoPlayOnLoad] = useState<boolean>(bgConfig.autoPlayOnLoad ?? true);
  const [loop, setLoop] = useState<boolean>(bgConfig.loop !== false);
  const [hideVideo, setHideVideo] = useState<boolean>(bgConfig.hideVideo !== false);
  const [showTitle, setShowTitle] = useState<boolean>(bgConfig.showTitle !== false);
  const [widgetPosition, setWidgetPosition] = useState<MusicWidgetPosition>(bgConfig.widgetPosition || 'bottom-right');
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(bgConfig.isEnabled !== false);

  // --- INTERACTION & FEEDBACK STATE ---
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Preview State
  const [previewTrack, setPreviewTrack] = useState<BackgroundMusicTrack | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-parse Link on change
  useEffect(() => {
    if (inputUrl.trim()) {
      const parsed = parseMusicLink(inputUrl, autoPlayOnLoad, loop);
      setParsedInfo(parsed);
      if (!linkTitle && parsed.isValid && parsed.titleSuggestion) {
        setLinkTitle(parsed.titleSuggestion);
      }
    } else {
      setParsedInfo(null);
    }
  }, [inputUrl, autoPlayOnLoad, loop]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Handle File Selection (Upload Tab)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Ukuran file musik melebihi batas maksimal 10MB! Harap gunakan file lebih kecil atau gunakan opsi Tempel Link.');
      setSelectedFile(null);
      setFileBase64(null);
      return;
    }

    const allowed = ['.mp3', '.wav', '.ogg', '.m4a'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowed = allowed.some(ext => fileNameLower.endsWith(ext)) || file.type.startsWith('audio/');
    
    if (!isAllowed) {
      setErrorMessage('Format file tidak didukung! Format yang didukung: MP3, WAV, OGG, M4A.');
      setSelectedFile(null);
      setFileBase64(null);
      return;
    }

    setSelectedFile(file);
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setFileBase64(dataUrl);

      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        setFileDuration(formatDuration(tempAudio.duration));
      };
    };
    reader.readAsDataURL(file);
  };

  // 2. Save Link Music Track
  const handleSaveLinkTrack = () => {
    setErrorMessage(null);
    if (!inputUrl.trim()) {
      setErrorMessage('Silakan tempel tautan musik YouTube, Spotify, atau SoundCloud.');
      return;
    }

    const parsed = parseMusicLink(inputUrl, autoPlayOnLoad, loop);
    if (!parsed.isValid) {
      setErrorMessage(parsed.errorMessage || 'Link tidak valid. Pastikan tautan berasal dari YouTube, Spotify, atau SoundCloud.');
      return;
    }

    setIsProcessing(true);
    try {
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newTrackId = `track-${parsed.sourceType}-${Date.now()}`;
      const titleToUse = linkTitle.trim() || parsed.titleSuggestion || 'Musik Latar Turnamen';

      const newTrack: BackgroundMusicTrack = {
        id: newTrackId,
        title: titleToUse,
        url: parsed.originalUrl,
        sourceType: parsed.sourceType,
        originalUrl: parsed.originalUrl,
        embedUrl: parsed.embedUrl,
        youtubeVideoId: parsed.youtubeVideoId,
        spotifyType: parsed.spotifyType,
        spotifyId: parsed.spotifyId,
        thumbnailUrl: parsed.thumbnailUrl,
        duration: parsed.sourceType === 'youtube' ? 'Video/Audio' : parsed.sourceType === 'spotify' ? 'Full Track' : 'SoundCloud Stream',
        hideVideo: hideVideo,
        uploadedBy: currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin DEXZ STORE',
        uploadedAt: nowStr
      };

      const updatedTracks = [newTrack, ...(bgConfig.tracks || [])];
      const updatedConfig: BackgroundMusicConfig = {
        ...bgConfig,
        isEnabled: isFeatureEnabled,
        activeTrackId: newTrackId, // otomatis aktif
        defaultVolume,
        autoPlayOnLoad,
        loop,
        hideVideo,
        showTitle,
        widgetPosition,
        tracks: updatedTracks
      };

      setSiteConfig((prev) => ({
        ...prev,
        backgroundMusic: updatedConfig
      }));

      // Broadcast update
      window.dispatchEvent(new CustomEvent('hunters:play-music', { detail: { track: newTrack } }));

      // Reset form
      setInputUrl('');
      setLinkTitle('');
      setParsedInfo(null);

      triggerToast(`✅ Link ${parsed.platformName} berhasil disimpan & diatur sebagai musik latar utama!`);
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Save Upload File Track
  const handleSaveUploadTrack = () => {
    setErrorMessage(null);
    if (!selectedFile || !fileBase64) {
      setErrorMessage('Silakan pilih berkas file audio (MP3/WAV/OGG/M4A) terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    try {
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newTrackId = 'track-upload-' + Date.now();
      const titleToUse = uploadTitle.trim() || selectedFile.name;

      const newTrack: BackgroundMusicTrack = {
        id: newTrackId,
        title: titleToUse,
        url: fileBase64,
        sourceType: 'upload',
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: selectedFile.type || 'audio/mpeg',
        duration: fileDuration,
        uploadedBy: currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin DEXZ STORE',
        uploadedAt: nowStr
      };

      const updatedTracks = [newTrack, ...(bgConfig.tracks || [])];
      const updatedConfig: BackgroundMusicConfig = {
        ...bgConfig,
        isEnabled: isFeatureEnabled,
        activeTrackId: newTrackId,
        defaultVolume,
        autoPlayOnLoad,
        loop,
        hideVideo,
        showTitle,
        widgetPosition,
        tracks: updatedTracks
      };

      setSiteConfig((prev) => ({
        ...prev,
        backgroundMusic: updatedConfig
      }));

      window.dispatchEvent(new CustomEvent('hunters:play-music', { detail: { track: newTrack } }));

      setSelectedFile(null);
      setFileBase64(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      triggerToast('✅ File musik berhasil diunggah & dijadikan musik latar utama!');
    } catch (err: any) {
      setErrorMessage('Gagal mengunggah file: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Set Active Track
  const handleSetActiveTrack = (track: BackgroundMusicTrack) => {
    const updatedConfig: BackgroundMusicConfig = {
      ...bgConfig,
      activeTrackId: track.id
    };

    setSiteConfig((prev) => ({
      ...prev,
      backgroundMusic: updatedConfig
    }));

    window.dispatchEvent(new CustomEvent('hunters:play-music', { detail: { track } }));
    triggerToast(`✅ "${track.title}" sekarang menjadi Musik Latar Utama website!`);
  };

  // 5. Delete Track
  const handleDeleteTrack = (trackId: string) => {
    const trackToDelete = bgConfig.tracks?.find(t => t.id === trackId);
    if (!trackToDelete) return;

    if (!window.confirm(`Hapus musik "${trackToDelete.title}" dari daftar?`)) return;

    const isCurrentActive = bgConfig.activeTrackId === trackId;
    const remainingTracks = (bgConfig.tracks || []).filter(t => t.id !== trackId);
    const nextActiveTrack = remainingTracks.length > 0 ? remainingTracks[0] : undefined;

    const updatedConfig: BackgroundMusicConfig = {
      ...bgConfig,
      activeTrackId: isCurrentActive ? (nextActiveTrack ? nextActiveTrack.id : '') : bgConfig.activeTrackId,
      tracks: remainingTracks
    };

    setSiteConfig((prev) => ({
      ...prev,
      backgroundMusic: updatedConfig
    }));

    if (isCurrentActive) {
      if (nextActiveTrack) {
        window.dispatchEvent(new CustomEvent('hunters:play-music', { detail: { track: nextActiveTrack } }));
      } else {
        window.dispatchEvent(new CustomEvent('hunters:stop-music'));
      }
    }

    triggerToast(remainingTracks.length === 0 ? '🗑️ Musik dihapus. Pemutar latar sedang kosong.' : '🗑️ Musik berhasil dihapus.');
  };

  // 6. Save Overall Options
  const handleSaveGeneralOptions = () => {
    const updatedConfig: BackgroundMusicConfig = {
      ...bgConfig,
      isEnabled: isFeatureEnabled,
      defaultVolume,
      autoPlayOnLoad,
      loop,
      hideVideo,
      showTitle,
      widgetPosition
    };

    setSiteConfig((prev) => ({
      ...prev,
      backgroundMusic: updatedConfig
    }));

    window.dispatchEvent(new CustomEvent('hunters:set-music-volume', { detail: { volume: defaultVolume } }));
    triggerToast('✅ Semua pengaturan pemutar & opsi pemutaran berhasil disimpan!');
  };

  // Quick Preset Link Insertion
  const handleQuickInsertSample = (type: 'youtube' | 'spotify' | 'soundcloud') => {
    if (type === 'youtube') {
      setInputUrl('https://youtu.be/kJQP7kiw5Fk');
      setLinkTitle('Free Fire World Series (FFWS) Official Theme');
    } else if (type === 'spotify') {
      setInputUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT');
      setLinkTitle('Never Gonna Give You Up — Gaming Remix');
    } else {
      setInputUrl('https://soundcloud.com/nocopyrightsounds/cartoon-on-on-feat-daniel-levi-ncs-release');
      setLinkTitle('Cartoon - On & On (feat. Daniel Levi) [NCS Release]');
    }
  };

  const activeTrackObj = bgConfig.tracks?.find(t => t.id === bgConfig.activeTrackId) || bgConfig.tracks?.[0];

  // Helper for source badge
  const renderSourceBadge = (sourceType: MusicSourceType) => {
    switch (sourceType) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
            <Youtube className="w-3 h-3 text-red-500" />
            <span>YouTube</span>
          </span>
        );
      case 'spotify':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
            <Headphones className="w-3 h-3 text-emerald-400" />
            <span>Spotify</span>
          </span>
        );
      case 'soundcloud':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
            <Radio className="w-3 h-3 text-amber-500" />
            <span>SoundCloud</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            <FileAudio className="w-3 h-3 text-blue-400" />
            <span>File Upload</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* HEADER SECTION */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>KELOLA WEBSITE & AUDIO</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Music className="w-7 h-7 text-amber-400" />
              <span>🎵 MUSIK LATAR — YOUTUBE, SPOTIFY, SOUNDCLOUD & UPLOAD</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
              Cukup tempel link YouTube, Spotify, atau SoundCloud untuk memutar musik latar turnamen secara instan tanpa perlu unggah file berat.
            </p>
          </div>

          {/* ACTIVE STATUS BADGE */}
          <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center gap-3 shrink-0 shadow-lg">
            <div className={`w-3.5 h-3.5 rounded-full ${activeTrackObj ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Lagu Utama Aktif:</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                {activeTrackObj ? (
                  <>
                    {renderSourceBadge(activeTrackObj.sourceType)}
                    <span className="text-emerald-400 truncate max-w-[170px]">{activeTrackObj.title}</span>
                  </>
                ) : (
                  <span className="text-neutral-400">Belum Ada Musik Aktif</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {successToast && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FEATURE SUMMARY TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5">
            <Youtube className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="font-black text-red-400 block">🎬 YouTube</span>
              <span className="text-neutral-400 text-[10px]">Gratis, lagu tanpa batas</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5">
            <Headphones className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-black text-emerald-400 block">🎧 Spotify</span>
              <span className="text-neutral-400 text-[10px]">Track, album & playlist</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-black text-amber-400 block">🎵 SoundCloud</span>
              <span className="text-neutral-400 text-[10px]">Musik bebas & orisinal</span>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-2.5">
            <FileAudio className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="font-black text-blue-400 block">📤 File Upload</span>
              <span className="text-neutral-400 text-[10px]">MP3, WAV, OGG (Maks 10MB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SOURCE SELECTION TABS: [DARI LINK] vs [UPLOAD FILE] */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>🔗 1. TEMPEL LINK (YOUTUBE / SPOTIFY / SOUNDCLOUD)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📤 2. UPLOAD FILE LANGSUNG (MP3/WAV/OGG)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 🔗 TEMPEL LINK FORM */}
        {/* ========================================================================= */}
        {activeTab === 'link' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick platform examples */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#050505] rounded-2xl border border-neutral-800">
              <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Contoh Cepat Satu-Klik:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickInsertSample('youtube')}
                  className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Youtube className="w-3 h-3" />
                  <span>Contoh YouTube</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsertSample('spotify')}
                  className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Contoh Spotify</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickInsertSample('soundcloud')}
                  className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Radio className="w-3 h-3" />
                  <span>Contoh SoundCloud</span>
                </button>
              </div>
            </div>

            {/* Input URL Box */}
            <div className="space-y-2">
              <label className="font-extrabold text-white text-xs uppercase flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                <span>Tempel Link Musik / Video (YouTube, Spotify, SoundCloud):</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://youtu.be/xxxxxx atau https://open.spotify.com/track/... atau https://soundcloud.com/..."
                  className="w-full bg-[#050505] border-2 border-neutral-700 focus:border-amber-500 rounded-2xl p-4 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
                {inputUrl && (
                  <button
                    onClick={() => { setInputUrl(''); setParsedInfo(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Live Detected Info Card */}
            {parsedInfo && (
              <div className={`p-4 rounded-2xl border transition-all ${
                parsedInfo.isValid 
                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100' 
                  : 'bg-red-950/30 border-red-700/40 text-red-300'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {parsedInfo.thumbnailUrl ? (
                      <img 
                        src={parsedInfo.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                        <Music className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {renderSourceBadge(parsedInfo.sourceType)}
                        <span className="text-xs font-bold text-white">{parsedInfo.platformName}</span>
                      </div>
                      <p className="text-xs font-bold text-amber-300 mt-0.5 line-clamp-1">
                        {parsedInfo.titleSuggestion}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono truncate max-w-md block">
                        {parsedInfo.originalUrl}
                      </span>
                    </div>
                  </div>

                  {parsedInfo.isValid && (
                    <span className="text-[11px] font-black uppercase text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Terdeteksi</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-neutral-200 text-xs uppercase block">
                📌 Judul Musik / Label Tampilan:
              </label>
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Contoh: Free Fire Theme 2026 / Victory Arena Beat"
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons for Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSaveLinkTrack}
                disabled={isProcessing || !inputUrl.trim() || (parsedInfo !== null && !parsedInfo.isValid)}
                className={`py-3.5 px-4 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
                  inputUrl.trim() && (!parsedInfo || parsedInfo.isValid) && !isProcessing
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 cursor-pointer shadow-amber-500/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>[✅ TAMPILKAN & SIMPAN SEBAGAI MUSIK UTAMA]</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (parsedInfo && parsedInfo.isValid) {
                    setPreviewTrack({
                      id: 'preview',
                      title: linkTitle || parsedInfo.titleSuggestion,
                      url: parsedInfo.originalUrl,
                      sourceType: parsedInfo.sourceType,
                      embedUrl: parsedInfo.embedUrl,
                      youtubeVideoId: parsedInfo.youtubeVideoId,
                      spotifyType: parsedInfo.spotifyType,
                      spotifyId: parsedInfo.spotifyId,
                      hideVideo: hideVideo,
                      uploadedAt: ''
                    });
                    setIsPreviewModalOpen(true);
                  } else {
                    setErrorMessage('Masukkan link valid terlebih dahulu untuk pratinjau.');
                  }
                }}
                disabled={!inputUrl.trim()}
                className="py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>[🔍 PRATINJAU PEMUTAR]</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 📤 UPLOAD FILE LANGSUNG FORM */}
        {/* ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="font-extrabold text-neutral-200 text-xs uppercase block">
                Judul Musik / Lagu:
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Contoh: Hunters Esports Theme Song 2026"
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded-3xl p-6 text-center bg-[#050505] transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleFileChange}
                className="hidden"
                id="admin-upload-music-file"
              />
              <label
                htmlFor="admin-upload-music-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <FileAudio className="w-10 h-10 text-amber-400" />
                <div>
                  <span className="font-extrabold text-white text-sm block">
                    {selectedFile ? selectedFile.name : 'Pilih Berkas Audio (MP3, WAV, OGG, M4A)'}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {selectedFile
                      ? `Ukuran: ${formatFileSize(selectedFile.size)} • Durasi: ${fileDuration}`
                      : 'Ukuran maksimal 10MB per berkas audio'}
                  </span>
                </div>
                <span className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-black rounded-xl text-xs uppercase tracking-wider">
                  📁 Pilih File Dari Perangkat
                </span>
              </label>
            </div>

            <button
              onClick={handleSaveUploadTrack}
              disabled={isProcessing || !selectedFile}
              className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
                selectedFile && !isProcessing
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 cursor-pointer shadow-amber-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Mengunggah & Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✅ Upload & Jadikan Musik Latar Utama</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ⚙️ PENGATURAN TAMBAHAN ADMIN & OPSI PEMUTARAN */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>⚙️ OPSI PEMUTARAN & TAMPILAN PEMUTAR</span>
          </h3>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
            Konfigurasi Global
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Feature Switch */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="font-extrabold text-white block text-xs">Aktifkan Musik Website</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Tampilkan pemutar musik di seluruh halaman</span>
              </div>
              <input
                type="checkbox"
                checked={isFeatureEnabled}
                onChange={(e) => setIsFeatureEnabled(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>

          {/* 2. Autoplay */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="font-extrabold text-white block text-xs">▶️ Mulai Otomatis (Autoplay)</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Putar otomatis saat halaman website dibuka</span>
              </div>
              <input
                type="checkbox"
                checked={autoPlayOnLoad}
                onChange={(e) => setAutoPlayOnLoad(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>

          {/* 3. Loop */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="font-extrabold text-white block text-xs">🔁 Ulangi Terus-Menerus (Loop)</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Lagu berulang sampai dihentikan pengunjung</span>
              </div>
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>

          {/* 4. YouTube Audio Only Mode */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="font-extrabold text-white block text-xs">🎬 Hanya Audio (Hemat Kuota)</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Sembunyikan video YouTube, hanya mainkan suara</span>
              </div>
              <input
                type="checkbox"
                checked={hideVideo}
                onChange={(e) => setHideVideo(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>

          {/* 5. Show Title */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="font-extrabold text-white block text-xs">📌 Tampilkan Judul Lagu</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Nama lagu muncul di bawah pemutar mengambang</span>
              </div>
              <input
                type="checkbox"
                checked={showTitle}
                onChange={(e) => setShowTitle(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>

          {/* 6. Widget Position */}
          <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white block text-xs">📍 Posisi Pemutar:</span>
              <span className="font-mono text-amber-400 font-bold">{widgetPosition}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['bottom-right', 'top-right', 'hidden'] as MusicWidgetPosition[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setWidgetPosition(pos)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-colors ${
                    widgetPosition === pos
                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {pos === 'bottom-right' ? 'Bawah Kanan' : pos === 'top-right' ? 'Atas Kanan' : 'Tersembunyi'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Volume Slider */}
        <div className="p-4 bg-[#050505] rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-neutral-200">🔊 Volume Awal Default Pengguna:</span>
            <span className="font-mono font-black text-amber-400 text-sm">{defaultVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-neutral-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={defaultVolume}
              onChange={(e) => setDefaultVolume(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <Volume2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[0, 25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDefaultVolume(preset)}
                className={`text-[11px] font-mono py-1 rounded-lg font-bold border transition-colors ${
                  defaultVolume === preset
                    ? 'bg-amber-500 text-neutral-950 border-amber-400'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Save Options Button */}
        <button
          onClick={handleSaveGeneralOptions}
          className="w-full py-3.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-white font-black uppercase tracking-wider text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Simpan Seluruh Pengaturan Opsi & Pemutar</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📋 DAFTAR SEMUA MUSIK LATAR & PLAYLIST */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>DAFTAR SEMUA MUSIK LATAR ({bgConfig.tracks?.length || 0} LAGU)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Pilih salah satu lagu untuk dijadikan musik utama, uji pratinjau, atau hapus lagu yang tidak digunakan.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            Aktif Sekarang: <span className="text-amber-400 font-bold">{activeTrackObj?.title || 'Tidak Ada'}</span>
          </div>
        </div>

        {(!bgConfig.tracks || bgConfig.tracks.length === 0) ? (
          <div className="p-8 text-center bg-[#050505] rounded-2xl border border-neutral-800 text-neutral-400 space-y-2">
            <Music className="w-10 h-10 mx-auto text-neutral-600 animate-bounce" />
            <p className="font-bold text-sm text-neutral-300">Belum ada lagu yang tersimpan.</p>
            <p className="text-xs">Gunakan tab 🔗 Tempel Link atau 📤 Upload File di atas untuk menambahkan musik latar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bgConfig.tracks.map((track, idx) => {
              const isActive = track.id === bgConfig.activeTrackId;

              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-500/15 to-neutral-950 border-amber-500/60 shadow-xl shadow-amber-500/10'
                      : 'bg-[#050505] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                          #{idx + 1}
                        </span>
                        {renderSourceBadge(track.sourceType)}
                      </div>

                      {isActive ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Musik Utama Aktif</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                          Tersimpan
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-white text-xs sm:text-sm line-clamp-2" title={track.title}>
                        {track.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono truncate" title={track.originalUrl || track.fileName || track.url}>
                        🔗 {track.originalUrl || track.fileName || track.url}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                      <span className="flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{track.duration || 'Looping'}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded truncate max-w-[130px]">
                        <User className="w-3 h-3 text-neutral-400" />
                        <span className="truncate">{track.uploadedBy || 'Admin'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        setPreviewTrack(track);
                        setIsPreviewModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>🔍 Pratinjau Pemutar</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          onClick={() => handleSetActiveTrack(track)}
                          className="flex-1 py-1.5 bg-neutral-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-black text-[11px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1 border border-emerald-500/30 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Jadikan Utama</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-1.5 bg-amber-500/10 text-amber-400 font-bold text-[11px] rounded-xl text-center border border-amber-500/30">
                          ✓ Sedang Digunakan
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-red-600 text-neutral-400 hover:text-white rounded-xl transition-colors border border-neutral-800 cursor-pointer"
                        title="Hapus Musik"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📋 TABEL PERBANDINGAN SUMBER MUSIK */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="border-b border-neutral-800 pb-3">
          <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>RINGKASAN FITUR SEMUA SUMBER MUSIK</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3 font-black uppercase">Sumber</th>
                <th className="py-2.5 px-3 font-black uppercase">Format Link</th>
                <th className="py-2.5 px-3 font-black uppercase">Hasil Pemutar</th>
                <th className="py-2.5 px-3 font-black uppercase">Kelebihan Utama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              <tr>
                <td className="py-3 px-3 font-bold text-red-400 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4" />
                  <span>YouTube</span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">youtu.be/xxx atau youtube.com/watch?v=xxx</td>
                <td className="py-3 px-3">Pemutar Tersemat (Bisa sembunyikan video)</td>
                <td className="py-3 px-3 text-emerald-400 font-medium">Koleksi tak terbatas, lagu resmi & bebas lisensi</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-emerald-400 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  <span>Spotify</span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">open.spotify.com/track/... /album/... /playlist/...</td>
                <td className="py-3 px-3">Widget Spotify resmi (Cover + Artist)</td>
                <td className="py-3 px-3 text-emerald-400 font-medium">Kualitas tinggi, jutaan lagu, playlist penuh</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  <span>SoundCloud</span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">soundcloud.com/artist/track-name</td>
                <td className="py-3 px-3">Widget SoundCloud + Gelombang Suara</td>
                <td className="py-3 px-3 text-emerald-400 font-medium">Musik orisinal, EDM, bebas royalty, suara hidup</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-blue-400 flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4" />
                  <span>File Upload</span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">Upload berkas MP3, WAV, OGG</td>
                <td className="py-3 px-3">HTML5 Audio Player Mandiri</td>
                <td className="py-3 px-3 text-emerald-400 font-medium">Mandiri, tidak tergantung platform eksternal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL PRATINJAU AUDIO / PLAYER */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && previewTrack && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f0f0f] border border-amber-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                {renderSourceBadge(previewTrack.sourceType)}
                <h3 className="font-black text-sm text-white uppercase truncate max-w-[260px]">
                  Pratinjau: {previewTrack.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setPreviewTrack(null);
                }}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Embedded Player Body based on Source */}
            <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center min-h-[160px]">
              {previewTrack.sourceType === 'youtube' && (
                <div className="w-full aspect-video">
                  <iframe
                    src={previewTrack.embedUrl || `https://www.youtube-nocookie.com/embed/${previewTrack.youtubeVideoId}?autoplay=1`}
                    title="YouTube Audio Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {previewTrack.sourceType === 'spotify' && (
                <div className="w-full h-[152px]">
                  <iframe
                    src={previewTrack.embedUrl}
                    title="Spotify Track Preview"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {previewTrack.sourceType === 'soundcloud' && (
                <div className="w-full h-[166px]">
                  <iframe
                    src={previewTrack.embedUrl}
                    title="SoundCloud Audio Preview"
                    allow="autoplay"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {(previewTrack.sourceType === 'upload' || previewTrack.sourceType === 'direct_link') && (
                <div className="p-6 text-center w-full space-y-3">
                  <Music className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                  <audio
                    src={previewTrack.url}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  handleSetActiveTrack(previewTrack);
                  setIsPreviewModalOpen(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                ✅ Jadikan Musik Utama Website
              </button>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setPreviewTrack(null);
                }}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
