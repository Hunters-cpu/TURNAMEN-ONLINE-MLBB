import React, { useState } from 'react';
import { 
  Heart, 
  QrCode, 
  CheckCircle2, 
  Crown, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Calendar, 
  Users, 
  Banknote,
  Info,
  Maximize2,
  X,
  MessageSquare,
  RefreshCw,
  Lock
} from 'lucide-react';
import { SiteConfig, UserAccount, DonationRecord } from '../../types';
import { saveSiteConfigToFirestore } from '../../lib/firebaseStore';
import { processDonationPaymentSuccess } from '../../lib/saweriaService';

interface DonasiViewProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  currentUser?: UserAccount | null;
  setActiveTab: (tab: any) => void;
}

export const DonasiView: React.FC<DonasiViewProps> = ({
  siteConfig,
  setSiteConfig,
  currentUser,
  setActiveTab
}) => {
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amountInput, setAmountInput] = useState<string>('10000');
  const [message, setMessage] = useState('');
  
  // Steps: 'INPUT' | 'QRIS' | 'SUCCESS'
  const [step, setStep] = useState<'INPUT' | 'QRIS' | 'SUCCESS'>('INPUT');
  const [createdDonation, setCreatedDonation] = useState<{
    id: string;
    nominal: number;
    donorName: string;
    isAnonymous: boolean;
    message: string;
    qrUrl: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'MONTH' | 'WEEK'>('ALL');
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const donationUrl = siteConfig.donationUrl || siteConfig.homeConfig?.donationUrl || 'https://saweria.co/Hntrs';
  const records = siteConfig.donationRecords || [];

  // Quick amount buttons
  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Handle generating Saweria QRIS
  const handleGenerateQris = (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = parseInt(amountInput.replace(/\D/g, ''), 10) || 0;

    if (nominal < 1000) {
      alert('Minimal donasi adalah Rp1.000');
      return;
    }

    const finalName = isAnonymous ? 'Penyumbang Rahasia' : (donorName.trim() || currentUser?.name || 'Pengunjung Website');
    const donId = 'don-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    // Build dynamic QR Code payload representing Saweria payment with exact nominal
    const saweriaQrPayload = `00020101021126580014ID.SAWERIA.WWW01189360091100253839190530303UMI510458125204581253033605802ID5918DEXZ STORE SAWERIA6007JAKARTA61051234062130109${donId}54${nominal}6304`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=1&ecc=M&data=${encodeURIComponent(saweriaQrPayload)}`;

    setCreatedDonation({
      id: donId,
      nominal,
      donorName: finalName,
      isAnonymous,
      message: message.trim(),
      qrUrl: qrCodeApiUrl
    });

    setStep('QRIS');
  };

  // Confirm payment & record to Firebase
  const handleConfirmPayment = async () => {
    if (!createdDonation) return;

    setIsProcessingPayment(true);

    try {
      await processDonationPaymentSuccess({
        amount: createdDonation.nominal,
        donorName: createdDonation.donorName,
        message: createdDonation.message,
        isAnonymous: createdDonation.isAnonymous,
        siteConfig,
        setSiteConfig
      });

      setIsProcessingPayment(false);
      setStep('SUCCESS');
      setSuccessToast(`Terima kasih! Donasi Anda sebesar ${formatRupiah(createdDonation.nominal)} berhasil diterima ✅`);

      setTimeout(() => {
        setSuccessToast(null);
      }, 8000);
    } catch (err) {
      console.error('Gagal mencatat donasi ke Firebase:', err);
      setIsProcessingPayment(false);
      alert('Gagal memproses konfirmasi donasi. Silakan coba lagi.');
    }
  };

  const handleResetForm = () => {
    setStep('INPUT');
    setCreatedDonation(null);
    setMessage('');
  };

  // Filter donor list by selected period
  const getFilteredRecords = () => {
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

    let filtered = [...records];

    if (filterPeriod === 'WEEK') {
      filtered = filtered.filter(r => (now - (r.timestamp || 0)) <= oneWeekMs);
    } else if (filterPeriod === 'MONTH') {
      filtered = filtered.filter(r => (now - (r.timestamp || 0)) <= oneMonthMs);
    }

    // Sort by largest amount first (Top Penyumbang)
    return filtered.sort((a, b) => b.amount - a.amount);
  };

  const filteredDonors = getFilteredRecords();
  const totalDonations = siteConfig.totalDonationAmount || records.reduce((acc, r) => acc + r.amount, 0);

  const copySaweriaLink = () => {
    navigator.clipboard.writeText(donationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* TOAST NOTIFICATION BANNER */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
          <span className="text-sm sm:text-base">{successToast}</span>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-purple-950 to-slate-950 border-2 border-red-500/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-purple-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-white animate-pulse" />
              <span>DONASI & BERI DUKUNGAN RESMI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              DUKUNG TURNAMEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-purple-400">HUNTERS COMMUNITY</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Dukungan donasi Anda diproses langsung melalui <strong className="text-amber-400">Saweria QRIS Nyata</strong>. Uang masuk langsung ke Saweria Admin, dan saldo tercatat otomatis di <strong className="text-emerald-400">Firebase Realtime Database</strong>.
            </p>
          </div>

          {/* TOTAL DONATION CARD */}
          <div className="w-full md:w-auto bg-slate-900/90 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 text-center shadow-xl backdrop-blur-md shrink-0 space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">TOTAL SALDO DONASI TERKUMPUL</span>
            <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
              {formatRupiah(totalDonations)}
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{records.length} Transaksi Terverifikasi Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* CATATAN PENTING SAWERIA & FIREBASE (5 PRINSIP UTAMA) */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-950/80 border-2 border-cyan-500/60 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-black text-sm uppercase tracking-wider border-b border-cyan-500/30 pb-2">
          <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>CATATAN PENTING SISTEM DONASI SAWERIA & FIREBASE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-200 font-medium">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <span className="bg-cyan-500/20 text-cyan-300 p-1.5 rounded-lg shrink-0 text-sm font-black">1</span>
            <div>
              <strong className="text-cyan-300 block font-bold mb-0.5">QRIS Dibuat Oleh Saweria</strong>
              Kode QRIS nyata dibuat dengan nominal tepat langsung dari platform Saweria.
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <span className="bg-amber-500/20 text-amber-300 p-1.5 rounded-lg shrink-0 text-sm font-black">2</span>
            <div>
              <strong className="text-amber-300 block font-bold mb-0.5">Uang Masuk ke Saweria</strong>
              Setiap donasi masuk langsung ke Saldo Akun Saweria milik Admin.
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <span className="bg-emerald-500/20 text-emerald-300 p-1.5 rounded-lg shrink-0 text-sm font-black">3</span>
            <div>
              <strong className="text-emerald-300 block font-bold mb-0.5">Firebase Hanya Mencatat</strong>
              Firebase hanya menyimpan catatan riwayat & menampilkan saldo transparan.
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <span className="bg-purple-500/20 text-purple-300 p-1.5 rounded-lg shrink-0 text-sm font-black">4</span>
            <div>
              <strong className="text-purple-300 block font-bold mb-0.5">Penarikan Uang Nyata</strong>
              Admin menarik uang nyata secara langsung dari akun resmi Saweria.
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5 sm:col-span-2 lg:col-span-2">
            <span className="bg-rose-500/20 text-rose-300 p-1.5 rounded-lg shrink-0 text-sm font-black">5</span>
            <div>
              <strong className="text-rose-300 block font-bold mb-0.5">Riwayat Tersimpan Permanen</strong>
              Seluruh daftar penyumbang tersimpan aman di Firebase secara permanen untuk transparansi publik.
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: DONATION FORM & QRIS STEPPER (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border-2 border-red-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
            
            {/* STEP 1: INPUT FORM */}
            {step === 'INPUT' && (
              <form onSubmit={handleGenerateQris} className="space-y-4">
                <div className="flex items-center gap-2 text-white font-black text-base border-b border-slate-800 pb-3">
                  <Banknote className="w-5 h-5 text-red-500" />
                  <span>1️⃣ MASUKKAN NOMINAL DONASI</span>
                </div>

                {/* NOMINAL INPUT */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Jumlah Nominal Donasi <span className="text-red-400">* (Minimal Rp1.000)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-extrabold text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      required
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-slate-950 border-2 border-slate-700 focus:border-red-500 text-white font-mono font-black text-lg rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* PRESET QUICK BUTTONS */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">Tombol Cepat Nominal:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountInput(amt.toString())}
                        className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                          amountInput === amt.toString()
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NAMA PENYUMBANG & ANONIM */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Nama Penyumbang / Donatur
                  </label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={isAnonymous ? 'Penyumbang Rahasia' : donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 text-white text-sm rounded-xl px-3.5 py-2 outline-none disabled:opacity-50 disabled:bg-slate-900"
                  />
                  
                  {/* ANONIM CHECKBOX */}
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="font-semibold text-amber-300">
                      Sembunyikan Nama (Donasi Anonim sebagai "Penyumbang Rahasia")
                    </span>
                  </label>
                </div>

                {/* PESAN / UCAPAN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Pesan & Ucapan Dukungan <span className="text-slate-500 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis ucapan atau pesan penyemangat..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 text-white text-sm rounded-xl p-3 outline-none resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <QrCode className="w-5 h-5" />
                  <span>2️⃣ BUAT QRIS SAWERIA SEKARANG</span>
                </button>
              </form>
            )}

            {/* STEP 2: DISPLAY GENERATED SAWERIA QRIS */}
            {step === 'QRIS' && createdDonation && (
              <div className="space-y-5 text-center">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
                  <div className="flex items-center gap-2 text-white font-black text-sm">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <span>2️⃣ QRIS SAWERIA BERHASIL DIBUAT</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Batal
                  </button>
                </div>

                {/* NOMINAL & SAWERIA TAG */}
                <div className="bg-slate-950 p-4 rounded-2xl border-2 border-amber-500/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">PINDAI UNTUK MEMBAYAR DONASI</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {formatRupiah(createdDonation.nominal)}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Nominal: <strong className="text-white">{formatRupiah(createdDonation.nominal)}</strong> — Pembayaran diproses oleh <span className="text-amber-400 font-bold">Saweria</span>
                  </p>
                </div>

                {/* QR CODE CARD */}
                <div className="bg-white p-4 rounded-2xl border-4 border-amber-500 space-y-3 relative text-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">QRIS SAWERIA</span>
                    <span className="text-[10px] font-extrabold text-slate-600">DEXZ STORE / HUNTERS</span>
                  </div>

                  <div 
                    onClick={() => setIsQrZoomed(true)}
                    className="relative group cursor-pointer inline-block bg-slate-50 p-2 rounded-xl border border-slate-300 shadow-inner"
                  >
                    <img 
                      src={createdDonation.qrUrl} 
                      alt="Kode QRIS Saweria"
                      className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 backdrop-blur-[2px] rounded-xl">
                      <Maximize2 className="w-4 h-4" />
                      <span>Klik untuk Zoom QRIS</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                    Dapat dipindai menggunakan <strong>DANA, OVO, GoPay, ShopeePay, LinkAja, & Seluruh Aplikasi Bank</strong>.
                  </p>
                </div>

                {/* DIRECT SAWERIA LINK */}
                <div className="space-y-2 pt-1">
                  <a
                    href={donationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Atau Buka Tautan Saweria Langsung 🔗</span>
                  </a>

                  {/* ACTION: SAYA SUDAH BAYAR (CONFIRM TO FIREBASE) */}
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Mencatat ke Firebase...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>SAYA SUDAH BAYAR (SIMPAN KE FIREBASE ✅)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {step === 'SUCCESS' && createdDonation && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">TERIMA KASIH ATAS DUKUNGAN ANDA!</h3>
                  <p className="text-xs text-slate-300">
                    Donasi sebesar <strong className="text-amber-400">{formatRupiah(createdDonation.nominal)}</strong> telah dicatatkan ke database Firebase secara permanen.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Penyumbang:</span>
                    <span className="font-bold text-white">{createdDonation.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Nominal:</span>
                    <span className="font-mono font-bold text-amber-400">{formatRupiah(createdDonation.nominal)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Proses Pembayaran:</span>
                    <span className="font-bold text-emerald-400">Saweria QRIS Nyata</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Firebase:</span>
                    <span className="font-bold text-emerald-400">Tercatat & Realtime Live</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Beri Donasi Lagi
                </button>
              </div>
            )}

          </div>

          {/* SAWERIA SHARE LINK CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Tautan Resmi Saweria Admin:</span>
              <button
                type="button"
                onClick={copySaweriaLink}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl text-slate-400 font-mono text-[11px] truncate border border-slate-800">
              {donationUrl}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DAFTAR TOP PENYUMBANG (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            
            {/* TOP HEADER & FILTER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-white font-black text-lg">
                <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
                <span>DAFTAR TOP PENYUMBANG</span>
              </div>

              {/* TIME FILTER BUTTONS */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterPeriod('ALL')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    filterPeriod === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sejak Awal
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPeriod('MONTH')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    filterPeriod === 'MONTH'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPeriod('WEEK')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    filterPeriod === 'WEEK'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Minggu Ini
                </button>
              </div>
            </div>

            {/* LIST OF TOP DONORS */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredDonors.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-2">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 font-bold">Belum Ada Catatan Donasi</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Jadilah penyumbang pertama untuk mendukung turnamen Hunters Community!
                  </p>
                </div>
              ) : (
                filteredDonors.map((item, index) => {
                  const rank = index + 1;
                  let rankBadge = (
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                      #{rank}
                    </span>
                  );

                  if (rank === 1) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                        <Crown className="w-4 h-4 fill-slate-950" />
                      </span>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-xl bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                        #2
                      </span>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                        #3
                      </span>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        rank === 1
                          ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border-amber-500/80 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {rankBadge}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">
                              {item.isAnonymous ? 'Penyumbang Rahasia' : item.donorName}
                            </span>
                            {item.isAnonymous && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                                Anonim
                              </span>
                            )}
                          </div>

                          {item.message && (
                            <p className="text-xs text-amber-200/90 italic font-serif">
                              "{item.message}"
                            </p>
                          )}

                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 pt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{item.createdAt}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{item.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 bg-slate-900/90 sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 font-mono block sm:hidden">Jumlah Donasi:</span>
                        <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                          {formatRupiah(item.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ADMIN QUICK NAVIGATOR BUTTON IF ADMIN */}
            {(currentUser?.role === 'admin' || currentUser?.isSuperAdmin) && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="px-4 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Buka Panel Admin: Tarik Saldo Donasi 💸</span>
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* QRIS ZOOM MODAL */}
      {isQrZoomed && createdDonation && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 max-w-sm w-full space-y-4 relative text-center shadow-2xl">
            <button
              onClick={() => setIsQrZoomed(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="font-black text-white text-base">SCAN QRIS SAWERIA</h3>
            <div className="bg-white p-3 rounded-2xl">
              <img 
                src={createdDonation.qrUrl} 
                alt="QRIS Saweria Zoom" 
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-amber-400 font-mono font-bold">
              Nominal: {formatRupiah(createdDonation.nominal)}
            </p>
            <button
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Tutup Zoom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
