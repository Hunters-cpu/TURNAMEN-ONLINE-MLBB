import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Maximize2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Swords, 
  Coins, 
  Lightbulb, 
  Upload, 
  Camera, 
  Trash2, 
  FileCheck, 
  Clock, 
  DollarSign,
  Send,
  Building,
  Smartphone
} from 'lucide-react';
import { PaymentMethodsConfig } from '../types';

export type PaymentCategoryType = 
  | 'FF_REGISTRATION'
  | 'MLBB_REGISTRATION'
  | 'UPCOMING_REGISTRATION'
  | 'FEATURE_RECOMMENDATION'
  | 'BET_UNPAID'
  | 'TOPUP'
  | 'CUSTOM_PAYMENT';

export interface DedicatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PaymentCategoryType;
  title: string;
  subtitle?: string;
  amount: number;
  payerName: string;
  payerPhone?: string;
  referenceId: string;
  paymentConfig?: PaymentMethodsConfig;
  onConfirmSuccess: (proofData: {
    proofUrl?: string;
    senderName: string;
    note?: string;
    amount: number;
  }) => Promise<void> | void;
  customButtonLabel?: string;
}

export const DedicatedPaymentModal: React.FC<DedicatedPaymentModalProps> = ({
  isOpen,
  onClose,
  category,
  title,
  subtitle,
  amount,
  payerName,
  payerPhone,
  referenceId,
  paymentConfig,
  onConfirmSuccess,
  customButtonLabel = '✅ SAYA SUDAH BAYAR & KIRIM BUKTI'
}) => {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(payerName || '');
  const [senderPhone, setSenderPhone] = useState<string>(payerPhone || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copiedNmid, setCopiedNmid] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);

  if (!isOpen) return null;

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Determine specific QRIS image & badge styling based on category
  const getCategoryDetails = () => {
    switch (category) {
      case 'FF_REGISTRATION':
        return {
          badge: '📌 OPSI 1 — QRIS KHUSUS TURNAMEN FREE FIRE',
          icon: <Flame className="w-4 h-4 text-orange-400" />,
          colorGradient: 'from-orange-600 via-amber-600 to-red-600',
          borderColor: 'border-orange-500/50',
          textColor: 'text-orange-400',
          qrisImage: paymentConfig?.qrisFfImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Pendaftaran Turnamen Free Fire'
        };
      case 'MLBB_REGISTRATION':
        return {
          badge: '📌 OPSI 2 — QRIS KHUSUS TURNAMEN MOBILE LEGENDS',
          icon: <Swords className="w-4 h-4 text-cyan-400" />,
          colorGradient: 'from-blue-600 via-indigo-600 to-cyan-600',
          borderColor: 'border-cyan-500/50',
          textColor: 'text-cyan-400',
          qrisImage: paymentConfig?.qrisMlbbImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Pendaftaran Turnamen Mobile Legends'
        };
      case 'UPCOMING_REGISTRATION':
        return {
          badge: '📌 OPSI 3 — QRIS KHUSUS TURNAMEN MENDATANG',
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          colorGradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
          borderColor: 'border-purple-500/50',
          textColor: 'text-purple-400',
          qrisImage: paymentConfig?.qrisUpcomingImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Pendaftaran Turnamen Mendatang'
        };
      case 'FEATURE_RECOMMENDATION':
        return {
          badge: '📌 OPSI 4 — QRIS KHUSUS BIAYA REKOMENDASI FITUR',
          icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
          colorGradient: 'from-amber-600 via-yellow-600 to-orange-600',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          qrisImage: paymentConfig?.qrisRecommendationImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Biaya Pengajuan Rekomendasi Fitur / Menu'
        };
      case 'BET_UNPAID':
        return {
          badge: '📌 OPSI 5 — QRIS KHUSUS PASANG TARUHAN (SALDO KURANG)',
          icon: <Coins className="w-4 h-4 text-emerald-400" />,
          colorGradient: 'from-emerald-600 via-teal-600 to-green-600',
          borderColor: 'border-emerald-500/50',
          textColor: 'text-emerald-400',
          qrisImage: paymentConfig?.qrisBetImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Pembayaran Taruhan Prediksi Match'
        };
      case 'TOPUP':
        return {
          badge: '💰 QRIS KHUSUS TOP UP SALDO PENGGUNA',
          icon: <Coins className="w-4 h-4 text-amber-400" />,
          colorGradient: 'from-amber-500 via-yellow-500 to-orange-500',
          borderColor: 'border-amber-500/50',
          textColor: 'text-amber-400',
          qrisImage: paymentConfig?.qrisTopupImageUrl || paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Isi Ulang Saldo Akun Pengguna'
        };
      case 'CUSTOM_PAYMENT':
      default:
        return {
          badge: '📌 OPSI 6 — QRIS KHUSUS PEMBAYARAN TAMBAHAN',
          icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
          colorGradient: 'from-blue-600 via-slate-700 to-neutral-800',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-400',
          qrisImage: paymentConfig?.qrisImageUrl || '',
          defaultTitle: 'Pembayaran Khusus'
        };
    }
  };

  const catMeta = getCategoryDetails();
  const nmid = paymentConfig?.qrisNmid || 'ID1025383919053';
  const holder = paymentConfig?.qrisHolder || 'DEXZ STORE / HUNTERS';

  // Authentic QR Code fallback payload
  const realQrisPayload = `00020101021126580014ID.LINKAJA.WWW01189360091100253839190530303UMI510458125204581253033605802ID5918DEXZ STORE HUNTERS6007JAKARTA61051234062070703A016304226B`;
  const defaultQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=1&ecc=M&data=${encodeURIComponent(realQrisPayload)}`;
  const displayQrisUrl = catMeta.qrisImage || defaultQrCodeUrl;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti transfer maksimal 10MB!');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyNmid = () => {
    navigator.clipboard.writeText(nmid);
    setCopiedNmid(true);
    setTimeout(() => setCopiedNmid(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert('Mohon masukkan Nama Pengirim / Pemilik Akun Transfer!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmSuccess({
        proofUrl: proofImage || undefined,
        senderName: senderName.trim(),
        note: notes.trim(),
        amount
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setIsSubmitting(false);
      alert('Terjadi kesalahan saat memproses konfirmasi. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* HEADER BAR */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${catMeta.colorGradient} text-white flex items-center justify-between shadow-lg shrink-0`}>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 text-[10px] font-black uppercase tracking-wider">
              {catMeta.icon}
              <span>{catMeta.badge}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>{title || catMeta.defaultTitle}</span>
            </h3>
            {subtitle && <p className="text-xs text-white/90 font-medium">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-neutral-300">
          {!isSuccess ? (
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* PERINGATAN KONFIRMASI MANUAL ADMIN */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <strong className="block font-black uppercase">PERHATIAN: PEMBAYARAN DIKONFIRMASI MANUAL OLEH ADMIN</strong>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Setelah scan QRIS & transfer, kirimkan konfirmasi Anda. Admin akan memverifikasi bukti transaksi. Status awal transaksi Anda adalah <span className="font-bold underline text-white">⏳ MENUNGGU KONFIRMASI ADMIN</span>.
                  </p>
                </div>
              </div>

              {/* QRIS DISPLAY BOX */}
              <div className="bg-[#050505] border-2 border-dashed border-neutral-700 rounded-2xl p-4 sm:p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-neutral-300 font-bold uppercase text-[11px]">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>PINDAI / SCAN QRIS DI BAWAH INI</span>
                </div>

                <div className="relative inline-block bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border-2 border-neutral-300 group">
                  <img
                    src={displayQrisUrl}
                    alt="QRIS Barcode"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    title="Perbesar QRIS"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs font-black text-white">{holder}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] font-mono text-neutral-400">NMID: {nmid}</span>
                    <button
                      type="button"
                      onClick={handleCopyNmid}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                    >
                      {copiedNmid ? '✓ Tersalin' : 'Salin NMID'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800 space-y-1">
                  <p className="text-white font-bold">📲 Mendukung Semua Aplikasi Pembayaran:</p>
                  <p>BCA Mobile, Mandiri Livin, BRI BRImo, BNI, DANA, GoPay, OVO, ShopeePay, LinkAja, SeaBank, dll.</p>
                </div>
              </div>

              {/* FORM PENGIRIM & UPLOAD BUKTI */}
              <div className="space-y-3 bg-[#050505] p-4 rounded-2xl border border-neutral-800">
                <div className="font-black text-xs text-white uppercase flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>DATA PENGIRIM & UNGGAH BUKTI TRANSFER (OPSIONAL)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Nama Pengirim / Rekening: *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Contoh: Budi Santoso / DANA Budi"
                      className="w-full bg-[#0f0f0f] border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      No. WhatsApp Pengirim:
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-[#0f0f0f] border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    No. Referensi / Catatan Tambahan:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: No. Ref 123456 / Bukti transfer via DANA"
                    className="w-full bg-[#0f0f0f] border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* UPLOAD STRUK TRANSFER */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    Foto Struk / Tangkapan Layar Bukti Transfer:
                  </label>

                  {!proofImage ? (
                    <label className="border border-dashed border-neutral-700 hover:border-emerald-400 bg-[#0f0f0f] hover:bg-neutral-900 rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-center cursor-pointer transition-all">
                      <Camera className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">Pilih Foto Bukti Dari Galeri / Kamera</span>
                        <span className="text-[10px] text-neutral-400">Format: JPG, PNG (Maks 10MB)</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="bg-[#0f0f0f] p-3 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-12 h-12 rounded-lg bg-black border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={proofImage} alt="Bukti" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold text-emerald-400 block truncate">✓ {proofFileName || 'Bukti Berhasil Diunggah'}</span>
                          <span className="text-[10px] text-neutral-400">Siap diverifikasi Admin</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProofImage(null);
                          setProofFileName('');
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-98 cursor-pointer bg-gradient-to-r ${catMeta.colorGradient} text-white hover:brightness-110`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MEMPROSES KONFIRMASI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{customButtonLabel}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SUCCESS VIEW */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white uppercase">
                  PEMBAYARAN TERKIRIM — MENUNGGU KONFIRMASI ADMIN ⏳
                </h4>
                <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Data pembayaran Anda sebesar <strong className="text-amber-400 font-mono">{formatRupiah(amount)}</strong> telah masuk ke antrean verifikasi Admin.
                </p>
              </div>

              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400">Jenis Transaksi:</span>
                  <strong className="text-white">{title || catMeta.defaultTitle}</strong>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400">Nama Pengirim:</span>
                  <strong className="text-white">{senderName}</strong>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400">Status Saat Ini:</span>
                  <span className="bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                    ⏳ MENUNGGU KONFIRMASI
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Tutup Jendela
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ZOOM MODAL */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          onClick={() => setIsZoomed(false)}
        >
          <div className="bg-white p-4 rounded-3xl max-w-sm w-full shadow-2xl space-y-3 text-center" onClick={(e) => e.stopPropagation()}>
            <img src={displayQrisUrl} alt="QRIS Zoom" className="w-full aspect-square object-contain" />
            <p className="text-xs font-black text-slate-900 font-mono">{holder}</p>
            <p className="text-[10px] text-slate-600 font-mono">NMID: {nmid}</p>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
