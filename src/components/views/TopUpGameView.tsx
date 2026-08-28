import React, { useState } from 'react';
import { 
  Gamepad2, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Search,
  Gift,
  Edit3,
  Save,
  Check,
  Globe,
  Settings
} from 'lucide-react';
import { SiteConfig, TabType } from '../../types';

interface TopUpGameViewProps {
  siteConfig?: SiteConfig;
  isAdmin?: boolean;
  onUpdateTopUpUrl?: (newUrl: string) => void;
  setActiveTab?: (tab: TabType) => void;
}

export const TopUpGameView: React.FC<TopUpGameViewProps> = ({
  siteConfig,
  isAdmin = false,
  onUpdateTopUpUrl,
  setActiveTab
}) => {
  const currentUrl = siteConfig?.topUpGameUrl || 'https://saweria.co/Hntrs/toko-top-up';
  
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl) {
      alert('URL Top Up tidak boleh kosong!');
      return;
    }
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (onUpdateTopUpUrl) {
      onUpdateTopUpUrl(formattedUrl);
    }
    
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const gamesList = [
    { name: 'Mobile Legends: Bang Bang', icon: '⚔️', desc: 'Diamonds, Weekly Diamond Pass, Starlight' },
    { name: 'Free Fire', icon: '🔥', desc: 'Diamonds FF, Member Mingguan/Bulanan' },
    { name: 'PUBG Mobile', icon: '🪖', desc: 'UC PUBG Mobile, Royale Pass' },
    { name: 'Valorant', icon: '💎', desc: 'Valorant Points (VP)' },
    { name: 'Magic Chess', icon: '♟️', desc: 'Chess Pass, Diamonds Magic Chess' },
    { name: 'Delta Force — Garena', icon: '🔫', desc: 'Delta Coins & Pass' },
    { name: 'Roblox', icon: '🧱', desc: 'Robux Card & Top Up' },
    { name: 'Steam Voucher (Indonesia)', icon: '🎮', desc: 'Saldo Steam Wallet IDR' },
    { name: 'Google Play Saldo (Indonesia)', icon: '📱', desc: 'Kode Voucher Google Play' },
    { name: 'FolaPlay', icon: '🎁', desc: 'Layanan Gaming Extra' },
  ];

  const advantages = [
    { title: 'Harga Terjangkau', desc: 'Harga mulai dari Rp4.500 dengan diskon promo harian.', icon: Sparkles },
    { title: 'Proses Cepat & Otomatis', desc: 'Top Up masuk serba instan dalam kurun waktu hitungan detik.', icon: Clock },
    { title: 'Banyak Pilihan Pembayaran', desc: 'QRIS, Bank BCA/BRI/Mandiri/BNI, DANA, GoPay, OVO, ShopeePay.', icon: CreditCard },
    { title: 'Transaksi Aman & Terjamin', desc: 'Legal 100%, garansi resmi dari distributor game.', icon: ShieldCheck },
    { title: 'Track Order Pesanan', desc: 'Bisa pantau pesanan Anda kapan saja lewat menu Track Order.', icon: Search },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-5xl mx-auto">
      {/* ADMIN CONTROL PANEL BOX FOR EDITING TOP UP LINK */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-950/70 via-neutral-900 to-amber-950/70 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>⚙️ PANEL ADMIN: KELOLA LINK TOP UP GAME</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-black text-[10px]">ADMIN ONLY</span>
                </h3>
                <p className="text-xs text-amber-200/80">
                  Anda dapat mengubah URL/link toko top up rekomendasi secara langsung di bawah ini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl(currentUrl);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ubah Link Toko</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* EDIT FORM */}
          {isEditing && (
            <form onSubmit={handleSave} className="pt-3 border-t border-amber-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>URL Toko Top Up Game Resmi:</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://saweria.co/Hntrs/toko-top-up"
                    className="flex-1 bg-[#090909] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Berhasil! Link Top Up Game telah diperbarui & tersimpan secara otomatis.</span>
            </div>
          )}
        </div>
      )}

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-orange-950/40 border border-orange-500/30 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4" />
            <span>🏪 REKOMENDASI TOKO TOP UP GAME</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            ⚡ PROSES OTOMATIS & RESMI
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          🏪 Hntrs — Toko Top Up Game Terpercaya
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
          Pusat rekomendasi top up voucher & diamond game favorit Anda dengan harga murah, proses kilat otomatis 24 jam, dan terjamin aman 100%.
        </p>

        {/* BUKA TOKO BUTTON */}
        <div className="pt-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-950/50 uppercase tracking-wider"
          >
            <span>🔗 BUKA TOKO</span>
            <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-[11px] text-neutral-400 mt-2 font-mono break-all">
            Langsung pindah ke halaman toko resmi di <span className="text-orange-400">{currentUrl}</span>
          </p>
        </div>
      </div>

      {/* LAYANAN TERSEDIA */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            ✅ LAYANAN GAME TERSEDIA:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {gamesList.map((g, idx) => (
            <div 
              key={idx} 
              className="bg-[#141414] border border-neutral-800 hover:border-orange-500/50 rounded-xl p-3.5 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:scale-110 transition-transform">
                  {g.icon}
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-orange-400 transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">{g.desc}</p>
                </div>
              </div>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 opacity-80 group-hover:opacity-100"
              >
                <span>Beli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* KEUNGGULAN TOKO */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            ✅ KEUNGGULAN TOKO:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((adv, idx) => {
            const IconComp = adv.icon;
            return (
              <div key={idx} className="bg-[#141414] border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">{adv.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{adv.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARA KERJA */}
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
          <Gift className="w-4 h-4 text-orange-400" />
          <span>CARA KERJANNYA:</span>
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Pengguna menekan tombol <strong>BUKA TOKO</strong> → langsung pindah ke halaman toko di <code className="text-orange-400 bg-black px-1.5 py-0.5 rounded break-all">{currentUrl}</code> → pilih produk game → tentukan jumlah → lakukan pembayaran → transaksi selesai.
        </p>
      </div>

      {/* PEMBERITAHUAN PENTING DISCLAIMER BOX */}
      <div className="bg-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <h3 className="font-black text-sm sm:text-base uppercase tracking-wide">
            ⚠️ PEMBERITAHUAN PENTING:
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans font-medium">
          HUNTERS COMMUNITY HANYA MEMPROMOSIKAN TOKO TERSEBUT. SELURUH TRANSAKSI, PEMBAYARAN, DAN PENGIRIMAN BERLANGSUNG SEPENUHNYA DI WEBSITE TOKO TERKAIT. SILAKAN BACA SYARAT & KETENTUAN SERTA KEBIJAKAN PRIVASI DI WEBSITE TOKO SEBELUM MELAKUKAN PEMBELIAN. HUNTERS COMMUNITY TIDAK BERTANGGUNG JAWAB ATAS MASALAH TRANSAKSI YANG TERJADI DI TOKO TERSEBUT.
        </p>
      </div>
    </div>
  );
};
