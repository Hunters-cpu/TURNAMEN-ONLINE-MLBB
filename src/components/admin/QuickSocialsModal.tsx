import React, { useState, useEffect } from 'react';
import { X, Phone, Radio, ExternalLink, Save, Share2, MessageSquare } from 'lucide-react';
import { SiteConfig } from '../../types';

interface QuickSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const QuickSocialsModal: React.FC<QuickSocialsModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig
}) => {
  const [adminWa, setAdminWa] = useState('');
  const [waGroupLink, setWaGroupLink] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tickerText, setTickerText] = useState('');

  useEffect(() => {
    setAdminWa(siteConfig.adminWa || siteConfig.contactInfo?.adminWa || '+62 831-4883-4663');
    setWaGroupLink(siteConfig.communityGroups?.[0]?.link || 'https://chat.whatsapp.com/invite/hunters-community');
    setYoutubeUrl(siteConfig.homeConfig?.youtubeUrl || 'https://youtube.com/@dexzstoreofficial');
    setTiktokUrl(siteConfig.homeConfig?.tiktokUrl || 'https://tiktok.com/@dexzstore.esports');
    setInstagramUrl(siteConfig.homeConfig?.instagramUrl || 'https://instagram.com/hunters.community_official');
    setTickerText(siteConfig.tickerText || '🔥 SELAMAT DATANG DI HUNTERS COMMUNITY X DEXZ STORE — TURNAMEN RESMI FREE FIRE & MOBILE LEGENDS!');
  }, [siteConfig, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWa = adminWa.replace(/[^0-9]/g, '');

    const updatedGroups = siteConfig.communityGroups ? [...siteConfig.communityGroups] : [];
    if (updatedGroups.length > 0) {
      updatedGroups[0] = { ...updatedGroups[0], link: waGroupLink.trim() };
    }

    setSiteConfig({
      ...siteConfig,
      adminWa: adminWa.trim(),
      adminWaClean: cleanWa,
      tickerText: tickerText.trim(),
      communityGroups: updatedGroups,
      homeConfig: {
        ...siteConfig.homeConfig,
        youtubeUrl: youtubeUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
        instagramUrl: instagramUrl.trim(),
      } as any,
      contactInfo: {
        ...siteConfig.contactInfo,
        adminWa: adminWa.trim(),
        adminWaClean: cleanWa,
        instagram: instagramUrl.trim(),
        tiktok: tiktokUrl.trim(),
      } as any
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                ⚡ EDIT LANGSUNG KONTAK & SOSMED
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Edit Link WhatsApp, Sosmed & Ticker
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Nomor WhatsApp Admin Official:</label>
            <input
              type="text"
              value={adminWa}
              onChange={(e) => setAdminWa(e.target.value)}
              placeholder="+62 831-4883-4663"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-emerald-400 focus:outline-none focus:border-purple-400 font-mono font-bold"
              required
            />
          </div>

          {/* WhatsApp Group Link */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Link Undangan Grup WhatsApp Peserta:</label>
            <input
              type="text"
              value={waGroupLink}
              onChange={(e) => setWaGroupLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/invite/..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* YouTube Live / Channel */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Link Channel / Live YouTube:</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-red-400 focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* TikTok Live / Account */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Link Akun / Live TikTok:</label>
            <input
              type="text"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://tiktok.com/@..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-pink-400 focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* Instagram Link */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Link Akun Instagram:</label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-purple-300 focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {/* Ticker Running Text */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Teks Berjalan Header (Ticker Bar):</label>
            <textarea
              rows={2}
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-purple-400 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
