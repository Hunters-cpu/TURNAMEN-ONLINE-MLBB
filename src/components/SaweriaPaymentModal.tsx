import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Maximize2, 
  Copy, 
  Check, 
  Sparkles,
  Info,
  Banknote,
  Flame,
  Swords
} from 'lucide-react';
import { generateSaweriaQris, formatRupiah, SAWERIA_URL, SAWERIA_WEBHOOK_URL } from '../lib/saweriaService';

export interface SaweriaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  type: 'FF_REGISTRATION' | 'MLBB_REGISTRATION' | 'TOPUP' | 'FEATURE_RECOMMENDATION' | 'DONATION';
  amount: number;
  payerName: string;
  payerPhone?: string;
  referenceId: string;
  metadata?: any;
  onConfirmSuccess: () => Promise<void> | void;
  successButtonText?: string;
}

export const SaweriaPaymentModal: React.FC<SaweriaPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  type,
  amount,
  payerName,
  payerPhone,
  referenceId,
  metadata,
  onConfirmSuccess,
  successButtonText = 'Selesai'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const qrisData = generateSaweriaQris({
    amount,
    payerName,
    type,
    referenceId,
    note: subtitle
  });

  const handlePayConfirm = async () => {
    setIsProcessing(true);
    try {
      // Simulate real verification check with Saweria webhook backend
      await new Promise(resolve => setTimeout(resolve, 1400));
      await onConfirmSuccess();
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error confirming Saweria payment:', err);
      setIsProcessing(false);
      alert('Terjadi kendala saat memproses pembayaran. Silakan coba kembali.');
    }
  };

  const copySaweriaUrl = () => {
    navigator.clipboard.writeText(SAWERIA_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getTypeBadge = () => {
    switch (type) {
      case 'FF_REGISTRATION':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Flame className="w-3 h-3 text-amber-400" /> Pendaftaran Free Fire
          </span>
        );
      case 'MLBB_REGISTRATION':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Swords className="w-3 h-3 text-cyan-400" /> Pendaftaran Mobile Legends
          </span>
        );
      case 'TOPUP':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Banknote className="w-3 h-3 text-emerald-400" /> Top Up Saldo Pengguna
          </span>
        );
      case 'FEATURE_RECOMMENDATION':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Sparkles className="w-3 h-3 text-purple-400" /> Rekomendasi Fitur
          </span>
        );
      case 'DONATION':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <span>💝</span> Donasi Saweria
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0c0d14] border-2 border-amber-500/70 rounded-3xl max-w-md w-full p-5 sm:p-6 text-white shadow-2xl relative space-y-4 my-auto">
        
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: QRIS SCREEN */}
        {!isSuccess ? (
          <div className="space-y-4 text-center">
            {/* BADGE & HEADER */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-center gap-2">
                {getTypeBadge()}
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                  @Hntrs
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-300 font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {/* QR CODE DISPLAY BOX */}
            <div className="bg-white p-3.5 rounded-2xl border-4 border-amber-500 shadow-2xl space-y-2 text-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-[10px]">
                <div className="flex items-center gap-1 font-black bg-red-600 text-white px-2 py-0.5 rounded">
                  <QrCode className="w-3 h-3" />
                  <span>QRIS SAWERIA</span>
                </div>
                <span className="font-extrabold text-slate-700 font-mono">
                  HUNTERS COMMUNITY • @Hntrs
                </span>
              </div>

              <div 
                onClick={() => setIsZoomed(true)}
                className="relative group cursor-pointer inline-block bg-slate-50 p-2 rounded-xl border border-slate-300 shadow-inner"
                title="Klik untuk memperbesar QRIS"
              >
                <img
                  src={qrisData.qrCodeUrl}
                  alt="QRIS Saweria"
                  className="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 rounded-xl backdrop-blur-[2px]">
                  <Maximize2 className="w-4 h-4" />
                  <span>Perbesar QR Code</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-600 font-medium leading-tight">
                Pindai dengan <strong className="text-slate-900">DANA • OVO • GoPay • ShopeePay • LinkAja • BCA • BRI • Mandiri • Semua Bank</strong>
              </div>
            </div>

            {/* DIRECT LINK & WEBHOOK STATUS */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-slate-300">
                <span className="text-[11px] font-medium truncate">Tautan: <strong className="text-amber-400 font-mono">saweria.co/Hntrs</strong></span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={copySaweriaUrl}
                    className="text-slate-300 hover:text-white flex items-center gap-1 font-bold text-[10px] bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <a
                    href={SAWERIA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold text-[10px] bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Buka</span>
                  </a>
                </div>
              </div>

              {/* ACTION: SAYA SUDAH BAYAR BUTTON */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayConfirm}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Mengirim Bukti &amp; Menunggu Verifikasi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>SAYA SUDAH BAYAR (KIRIM KE ADMIN ⏳)</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pembayaran masuk ke antrean verifikasi wajib oleh Admin resmi DEXZ STORE.</span>
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: SUCCESS CONFIRMATION SCREEN */
          <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/60 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
                <span>⏳ MENUNGGU KONFIRMASI ADMIN</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Bukti Pembayaran Terkirim!
              </h3>
              <p className="text-xs text-slate-300">
                Pembayaran Anda sebesar <strong className="text-amber-400 font-mono">{formatRupiah(amount)}</strong> telah masuk ke antrean verifikasi Admin. Status akan diperbarui setelah dikonfirmasi oleh Admin resmi.
              </p>
            </div>

            {/* DETAILS RECEIPT CARD */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs font-medium">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Nama / Pengirim:</span>
                <span className="font-bold text-white">{payerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Nominal:</span>
                <span className="font-black text-amber-400 font-mono text-sm">{formatRupiah(amount)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Jenis Permintaan:</span>
                <span className="font-bold text-cyan-300">{type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Metode:</span>
                <span className="font-bold text-emerald-400">QRIS Saweria (@Hntrs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Sistem:</span>
                <span className="font-bold text-amber-400">⏳ MENUNGGU KONFIRMASI ADMIN</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all active:scale-98"
            >
              {successButtonText}
            </button>
          </div>
        )}

      </div>

      {/* ZOOM MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 max-w-sm w-full space-y-4 text-center shadow-2xl relative">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <h4 className="font-black text-white text-sm uppercase">QRIS SAWERIA • {formatRupiah(amount)}</h4>
            <div className="bg-white p-3 rounded-2xl">
              <img
                src={qrisData.qrCodeUrl}
                alt="QRIS Zoom"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
            >
              Tutup Zoom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
