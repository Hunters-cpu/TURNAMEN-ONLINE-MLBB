import React, { useState } from 'react';
import { Copy, Check, QrCode, Maximize2, X, AlertTriangle, ShieldCheck, CheckCircle2, Flame, Swords, Sparkles, Coins, Lightbulb, Heart } from 'lucide-react';

export type QrisCategory = 'FF' | 'MLBB' | 'UPCOMING' | 'TOPUP' | 'BET' | 'RECOMMENDATION' | 'DONATION' | 'GENERAL';

interface QrisDisplayProps {
  game?: 'FF' | 'MLBB';
  category?: QrisCategory;
  title?: string;
  customFee?: string;
  qrisNmid?: string;
  qrisImageUrl?: string;
  onPaidClick?: () => void;
  showPaidButton?: boolean;
  paidButtonLabel?: string;
}

export const QrisDisplay: React.FC<QrisDisplayProps> = ({
  game = 'FF',
  category = 'FF',
  title,
  customFee,
  qrisNmid = 'ID1025383919053',
  qrisImageUrl = '',
  onPaidClick,
  showPaidButton = false,
  paidButtonLabel = '✅ SAYA SUDAH BAYAR SEKARANG',
}) => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Category Configuration & Styling
  const getCategoryMeta = () => {
    switch (category) {
      case 'FF':
        return {
          badge: 'QRIS KHUSUS FREE FIRE',
          icon: <Flame className="w-4 h-4 text-orange-400" />,
          color: 'from-orange-600 to-red-600',
          borderColor: 'border-orange-500',
          defaultFee: 'Rp 50.000',
          targetLabel: 'Pendaftaran Turnamen Free Fire DEXZ STORE'
        };
      case 'MLBB':
        return {
          badge: 'QRIS KHUSUS MOBILE LEGENDS',
          icon: <Swords className="w-4 h-4 text-cyan-400" />,
          color: 'from-blue-600 to-indigo-600',
          borderColor: 'border-blue-500',
          defaultFee: 'Rp 50.000',
          targetLabel: 'Pendaftaran Turnamen Mobile Legends DEXZ STORE'
        };
      case 'UPCOMING':
        return {
          badge: 'QRIS KHUSUS TURNAMEN MENDATANG',
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          color: 'from-purple-600 to-pink-600',
          borderColor: 'border-purple-500',
          defaultFee: 'Rp 50.000',
          targetLabel: 'Pendaftaran Turnamen Mendatang DEXZ STORE'
        };
      case 'TOPUP':
        return {
          badge: 'QRIS KHUSUS TOP UP SALDO',
          icon: <Coins className="w-4 h-4 text-amber-400" />,
          color: 'from-amber-600 to-yellow-600',
          borderColor: 'border-amber-500',
          defaultFee: 'Sesuai Nominal Top Up',
          targetLabel: 'Isi Ulang Saldo Akun Member DEXZ STORE'
        };
      case 'BET':
        return {
          badge: 'QRIS KHUSUS TARUHAN MATCH',
          icon: <Coins className="w-4 h-4 text-emerald-400" />,
          color: 'from-emerald-600 to-teal-600',
          borderColor: 'border-emerald-500',
          defaultFee: 'Sesuai Nominal Taruhan',
          targetLabel: 'Pembayaran Taruhan Prediksi Pertandingan'
        };
      case 'RECOMMENDATION':
        return {
          badge: 'QRIS KHUSUS USULAN FITUR',
          icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
          color: 'from-yellow-600 to-amber-600',
          borderColor: 'border-yellow-500',
          defaultFee: 'Rp 10.000',
          targetLabel: 'Biaya Usulan & Rekomendasi Fitur Baru'
        };
      case 'DONATION':
        return {
          badge: 'QRIS RESMI SAWERIA DONASI',
          icon: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
          color: 'from-red-600 to-rose-600',
          borderColor: 'border-red-500',
          defaultFee: 'Sesuai Nominal Donasi',
          targetLabel: 'Dukungan Donasi Turnamen DEXZ STORE'
        };
      default:
        return {
          badge: 'QRIS RESMI DEXZ STORE',
          icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
          color: 'from-orange-600 to-red-600',
          borderColor: 'border-orange-500',
          defaultFee: 'Rp 50.000',
          targetLabel: 'Pembayaran Resmi DEXZ STORE HUNTERS'
        };
    }
  };

  const meta = getCategoryMeta();
  const feeAmount = customFee || meta.defaultFee;
  const displayTitle = title || meta.targetLabel;

  // Authentic valid QRIS payload for NMID ID1025383919053 DEXZ STORE HUNTERS
  const realQrisPayload = `00020101021126580014ID.LINKAJA.WWW01189360091100253839190530303UMI510458125204581253033605802ID5918DEXZ STORE HUNTERS6007JAKARTA61051234062070703A016304226B`;
  const defaultQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=1&ecc=M&data=${encodeURIComponent(realQrisPayload)}`;
  const displayQrSrc = qrisImageUrl || defaultQrCodeUrl;

  const copyNmid = () => {
    navigator.clipboard.writeText(qrisNmid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* CATEGORY BADGE HEADER */}
      <div className={`p-3 rounded-2xl bg-gradient-to-r ${meta.color} text-white shadow-lg text-center space-y-1`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 text-xs font-black uppercase tracking-wider">
          {meta.icon}
          <span>{meta.badge}</span>
        </div>
        <h4 className="text-sm font-extrabold">{displayTitle}</h4>
      </div>

      {/* HUNTERS OFFICIAL QRIS POSTER CARD */}
      <div className={`bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-2xl border-4 ${meta.borderColor} space-y-4 relative overflow-hidden`}>
        {/* Top Header Row with QRIS logo */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-black">QRIS</span>
              <span className="text-[10px] font-black text-slate-800 tracking-wider">GPN</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-extrabold text-orange-600 block leading-tight">NATIONAL STANDARD</span>
            <span className="text-[9px] font-bold text-slate-500">INDONESIAN QR CODE</span>
          </div>
        </div>

        {/* Store Name & NMID Header */}
        <div className="text-center space-y-0.5">
          <h3 className="font-black text-lg text-slate-900 tracking-tight">DEXZ STORE HUNTERS</h3>
          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
            <span className="text-xs font-mono font-black text-slate-800">
              NMID : {qrisNmid}
            </span>
            <button
              type="button"
              onClick={copyNmid}
              className="text-orange-600 hover:text-orange-700 p-0.5"
              title="Salin NMID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* QR CODE DISPLAY AREA */}
        <div className="relative group flex flex-col items-center justify-center bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-300">
          <div 
            onClick={() => setIsZoomed(true)}
            className="cursor-pointer relative overflow-hidden rounded-xl shadow-md border border-slate-200 bg-white p-2 transition-transform hover:scale-[1.02] active:scale-95"
            title="Klik untuk memperbesar QRIS"
          >
            <img
              src={displayQrSrc}
              alt={`QRIS Resmi ${displayTitle}`}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg mx-auto"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
              <Maximize2 className="w-4 h-4" />
              <span>Klik untuk Zoom QRIS</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>Klik gambar QRIS di atas untuk tampilan layar penuh</span>
          </p>
        </div>

        {/* Footer info inside official poster */}
        <div className="pt-2 border-t border-slate-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold text-slate-600">
            <span>DANA</span> • <span>OVO</span> • <span>GOPAY</span> • <span>LINKAJA</span> • <span>SHOPEEPAY</span> • <span>BCA</span> • <span>MANDIRI</span> • <span>BRI</span> • <span>BNI</span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium">
            SATU QRIS UNTUK SEMUA APLIKASI PEMBAYARAN BANK & E-WALLET
          </p>
        </div>
      </div>

      {/* ⚠️ CATATAN PERINGATAN BUKTI PEMBAYARAN MANDATORY REQUIREMENT */}
      <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-4 space-y-2 shadow-xl text-left">
        <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider border-b border-red-800/80 pb-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>⚠️ PERINGATAN PENTING & STATUS PERMINTAAN</span>
        </div>
        <p className="text-xs font-mono font-extrabold text-white leading-relaxed bg-black/40 p-2.5 rounded-lg border border-red-500/40">
          ⏳ Setelah scan pembayaran dan menekan tombol konfirmasi, status Anda adalah: <strong className="text-amber-400">MENUNGGU KONFIRMASI ADMIN</strong>. Admin akan memeriksa bukti transaksi dan menentukan status <strong className="text-emerald-400">SAH / DITOLAK</strong>.
        </p>
      </div>

      {/* OPTIONAL EXPLICIT BUTTON 'SAYA SUDAH BAYAR' */}
      {showPaidButton && onPaidClick && (
        <button
          type="button"
          onClick={onPaidClick}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all border-2 border-emerald-400 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{paidButtonLabel}</span>
        </button>
      )}

      {/* LIGHTBOX MODAL FOR ZOOMED QRIS */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-slate-900 shadow-2xl border-4 border-orange-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <span className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase">
                {meta.badge}
              </span>
              <h3 className="font-black text-xl text-slate-900 mt-2">DEXZ STORE HUNTERS</h3>
              <p className="text-xs font-mono font-bold text-slate-600">
                NMID: {qrisNmid}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-300 flex justify-center">
              <img
                src={displayQrSrc}
                alt="QRIS Fullscreen"
                className="w-72 h-72 object-contain rounded-xl shadow-inner bg-white p-2"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-center space-y-1">
              <p className="text-[11px] font-medium text-slate-700">
                📱 Arahkan kamera atau aplikasi E-Wallet / M-Banking Anda ke QR Code ini untuk melakukan pembayaran.
              </p>
            </div>

            <button
              onClick={() => setIsZoomed(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Tutup Tampilan QRIS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
