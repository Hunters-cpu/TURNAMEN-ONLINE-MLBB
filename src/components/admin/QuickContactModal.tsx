import React, { useState, useEffect } from 'react';
import { X, Headphones, Save, Phone, Mail, Globe, MessageSquare } from 'lucide-react';
import { SiteConfig } from '../../types';

interface QuickContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const QuickContactModal: React.FC<QuickContactModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig
}) => {
  const [adminWa, setAdminWa] = useState(siteConfig.adminWa || '+62 831 4883 4663');
  const [officialEmail, setOfficialEmail] = useState(siteConfig.officialEmail || 'official@hunterscommunity.id');
  const [officialDomain, setOfficialDomain] = useState(siteConfig.officialDomain || 'https://hunterscommunity.id');
  const [runningTickerText, setRunningTickerText] = useState(siteConfig.runningTickerText || 'Selamat datang di Turnamen Resmi Hunters Community DEXZ STORE!');

  useEffect(() => {
    if (siteConfig) {
      setAdminWa(siteConfig.adminWa || '+62 831 4883 4663');
      setOfficialEmail(siteConfig.officialEmail || 'official@hunterscommunity.id');
      setOfficialDomain(siteConfig.officialDomain || 'https://hunterscommunity.id');
      setRunningTickerText(siteConfig.runningTickerText || 'Selamat datang di Turnamen Resmi Hunters Community DEXZ STORE!');
    }
  }, [siteConfig, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSiteConfig({
      ...siteConfig,
      adminWa: adminWa.trim(),
      officialEmail: officialEmail.trim(),
      officialDomain: officialDomain.trim(),
      runningTickerText: runningTickerText.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                ⚡ EDIT LANGSUNG KONTAK OFFICIAL
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Kelola Kontak Admin & Running Ticker
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
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nomor WhatsApp Admin Official:</span>
            </label>
            <input
              type="text"
              value={adminWa}
              onChange={(e) => setAdminWa(e.target.value)}
              placeholder="+62 831 4883 4663"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Official Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Email Resmi Official:</span>
            </label>
            <input
              type="email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              placeholder="official@hunterscommunity.id"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Official Domain */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Domain / Link Website:</span>
            </label>
            <input
              type="text"
              value={officialDomain}
              onChange={(e) => setOfficialDomain(e.target.value)}
              placeholder="https://hunterscommunity.id"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Running Ticker Text */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Teks Running Ticker Berjalan di Header:</span>
            </label>
            <textarea
              rows={3}
              value={runningTickerText}
              onChange={(e) => setRunningTickerText(e.target.value)}
              placeholder="Teks informasi berjalan di bagian atas..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-950/60 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Kontak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
