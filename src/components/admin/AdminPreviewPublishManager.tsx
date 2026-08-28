import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  Send, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  Music, 
  Share2, 
  Clock, 
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import { SiteConfig, AdminAccount } from '../../types';

interface AdminPreviewPublishManagerProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  handleSaveAllConfig: (newConfig: SiteConfig, message?: string) => void;
  currentUser?: AdminAccount | null;
  onPreviewLiveSite?: () => void;
}

export const AdminPreviewPublishManager: React.FC<AdminPreviewPublishManagerProps> = ({
  config,
  setConfig,
  handleSaveAllConfig,
  currentUser,
  onPreviewLiveSite
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<string>(
    new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  );

  const identity = config.websiteIdentity || {
    siteName: 'HUNTERS COMMUNITY',
    siteTitle: 'Turnamen Esports Free Fire & Mobile Legends Resmi',
    siteDescription: 'Platform resmi turnamen game Free Fire & Mobile Legends Bang Bang berhadiah jutaan rupiah.',
    themeColor: 'cyan',
    footerText: 'Dikelola oleh DEXZ STORE — © 2026 HUNTERS COMMUNITY. All rights reserved.'
  };

  const currentTheme = identity.themeColor || 'cyan';
  const activeMusicTrack = config.backgroundMusic?.tracks?.find(
    t => t.id === config.backgroundMusic?.activeTrackId
  ) || config.backgroundMusic?.tracks?.[0];

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      handleSaveAllConfig(config, 'Publikasikan Perubahan Kategori 6 ke Seluruh Pengguna');
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setLastPublishedAt(nowStr);
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER CARD */}
      <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                KATEGORI 6 — MENU 6
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                Live Deployment Ready
              </span>
            </div>
            <h3 className="font-black text-lg text-white uppercase flex items-center gap-2 mt-2">
              <Save className="w-5 h-5 text-blue-400" />
              <span>💾 Simpan Perubahan &amp; Lihat Pratinjau Website</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Simpan seluruh konfigurasi Kategori 6 (Identitas, Tautan Sosmed, Halaman Statis, Jam Operasional, dan Musik Latar), cek pratinjau visual interaktif, lalu publikasikan langsung ke semua pengguna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-mono">
              🕒 Terakhir Rilis: <strong className="text-cyan-400">{lastPublishedAt}</strong>
            </span>
          </div>
        </div>

        {/* PRIMARY ACTIONS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => {
              handleSaveAllConfig(config, 'Simpan Pengaturan Kategori 6');
              alert('✅ Semua konfigurasi Kategori 6 berhasil disimpan di sistem lokal & database!');
            }}
            className="p-4 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 border border-blue-500/40 rounded-xl text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Save className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-blue-300 font-bold">STEP 1</span>
            </div>
            <strong className="block text-xs font-black text-white uppercase">1. Simpan Perubahan</strong>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Simpan draf konfigurasi website terbaru</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="p-4 bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800/80 hover:to-pink-800/80 border border-purple-500/40 rounded-xl text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-purple-300 font-bold">STEP 2</span>
            </div>
            <strong className="block text-xs font-black text-white uppercase">2. Lihat Pratinjau</strong>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Cek visual tampilan sebelum publikasi</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="p-4 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 border border-emerald-500/60 rounded-xl text-left transition-all cursor-pointer group shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              {isPublishing ? (
                <RefreshCw className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              )}
              <span className="text-[10px] font-mono text-emerald-300 font-bold">STEP 3</span>
            </div>
            <strong className="block text-xs font-black text-white uppercase">3. Publikasikan</strong>
            <span className="text-[10px] text-emerald-200 mt-0.5 block">Terapkan langsung ke semua user</span>
          </button>
        </div>

        {publishSuccess && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-white font-black">🎉 PUBLIKASI BERHASIL!</p>
              <p className="text-[11px] text-emerald-300 font-normal">
                Perubahan nama website, identitas, banner, musik, jam kerja, dan footer sudah langsung aktif di halaman utama semua pengguna tanpa reload manual!
              </p>
            </div>
          </div>
        )}

        {/* LIVE PREVIEW COMPONENT CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Pratinjau Visual Komponen Website Saat Ini:</span>
            </label>
            <span className="text-[11px] text-cyan-400 font-mono">Live Mockup Preview</span>
          </div>

          <div className="bg-[#050505] border-2 border-neutral-800 rounded-2xl p-5 space-y-4 shadow-inner">
            {/* MOCK HEADER */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                  {config.websiteIdentity?.logoUrl ? (
                    <img src={config.websiteIdentity.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    'HC'
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white tracking-wide">
                    {identity.siteName || 'HUNTERS COMMUNITY'}
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    {identity.siteTitle || 'Pusat Turnamen Esports Free Fire & Mobile Legends'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  config.operatingHours?.adminStatus === 'ONLINE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : config.operatingHours?.adminStatus === 'BUSY'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  ● {config.operatingHours?.adminStatus || 'ONLINE'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 font-mono text-[10px]">
                  ⏰ {config.operatingHours?.openTime || '08:00'} - {config.operatingHours?.closeTime || '22:00'} {config.operatingHours?.timezone || 'WIB'}
                </span>
              </div>
            </div>

            {/* MOCK HERO BANNER */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 relative overflow-hidden space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>RESMI MUSIM 2026</span>
              </div>
              <h2 className="text-lg font-black text-white">
                {config.homeConfig?.heroTitle || 'PUSAT TURNAMEN RESMI ESPORTS'}
              </h2>
              <p className="text-xs text-neutral-300 max-w-xl line-clamp-2">
                {identity.siteDescription || 'Turnamen resmi berhadiah jutaan rupiah dikelola oleh DEXZ STORE.'}
              </p>

              {/* MUSIC BADGE */}
              {activeMusicTrack && config.backgroundMusic?.isEnabled && (
                <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                  <Music className="w-3.5 h-3.5 animate-bounce" />
                  <span>Musik Aktif: <strong>{activeMusicTrack.title}</strong> ({activeMusicTrack.duration || '05:26'})</span>
                </div>
              )}
            </div>

            {/* MOCK FOOTER */}
            <div className="p-3 bg-[#0a0a0a] rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
              <p className="text-[11px] font-mono text-center sm:text-left">
                {identity.footerText || 'Dikelola oleh DEXZ STORE — © 2026 HUNTERS COMMUNITY. All rights reserved.'}
              </p>

              <div className="flex items-center gap-3 text-[10px]">
                <span className="hover:text-cyan-400 transition-colors">📺 YouTube</span>
                <span className="hover:text-pink-400 transition-colors">📱 TikTok</span>
                <span className="hover:text-purple-400 transition-colors">📸 Instagram</span>
                <span className="hover:text-indigo-400 transition-colors">💬 Discord</span>
                <span className="text-emerald-400 font-bold">WhatsApp Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f0f] border-2 border-purple-500/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-black text-sm uppercase">
                <Eye className="w-5 h-5" />
                <span>Pratinjau Halaman Beranda Pengguna</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 bg-black rounded-xl border border-neutral-800 space-y-3 text-xs text-neutral-300">
              <p className="font-bold text-white text-sm">
                Informasi &amp; Tampilan yang akan dilihat pengguna:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] font-mono">
                <li>Nama Website: <strong className="text-cyan-400">{identity.siteName}</strong></li>
                <li>Judul Web: <strong className="text-white">{identity.siteTitle}</strong></li>
                <li>Status Layanan: <strong className="text-emerald-400">{config.operatingHours?.adminStatus || 'ONLINE'} ({config.operatingHours?.openTime} - {config.operatingHours?.closeTime} {config.operatingHours?.timezone})</strong></li>
                <li>Musik Latar: <strong className="text-amber-300">{activeMusicTrack?.title || 'None'}</strong> (Autoplay On)</li>
                <li>Footer: <strong className="text-neutral-400">{identity.footerText}</strong></li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="flex-1 py-3 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-700 cursor-pointer"
              >
                Kembali ke Editor
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  handlePublish();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer"
              >
                🚀 Publikasikan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
