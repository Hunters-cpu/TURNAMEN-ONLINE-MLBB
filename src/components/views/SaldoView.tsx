import React, { useState } from 'react';
import { 
  Coins, ArrowDownLeft, ArrowUpRight, QrCode, CreditCard, 
  Upload, Image as ImageIcon, CheckCircle2, Clock, AlertCircle, 
  Send, ShieldCheck, HelpCircle, Building2, Wallet, RefreshCw, FileText,
  Smartphone, Copy, Check, DollarSign, Sparkles
} from 'lucide-react';
import { UserWallet, TopUpRequest, WithdrawalRequest, TabType, WalletTransaction, SiteConfig, UserAccount } from '../../types';
import { QrisDisplay } from '../QrisDisplay';
import { notifyAdminEvent } from '../../lib/notificationService';
import { SaweriaPaymentModal } from '../SaweriaPaymentModal';
import { processTopUpPaymentSuccess, formatRupiah } from '../../lib/saweriaService';

interface SaldoViewProps {
  userWallet: UserWallet;
  setUserWallet: React.Dispatch<React.SetStateAction<UserWallet>>;
  setActiveTab: (tab: TabType) => void;
  qrisNmid?: string;
  qrisImageUrl?: string;
  adminWa?: string;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  initialSubTab?: string;
  currentUser?: UserAccount | null;
}

export const SaldoView: React.FC<SaldoViewProps> = ({
  userWallet,
  setUserWallet,
  setActiveTab,
  qrisNmid,
  qrisImageUrl,
  adminWa = '+62 831 4883 4663',
  siteConfig,
  setSiteConfig = () => {},
  initialSubTab,
  currentUser,
}) => {
  const [activeAction, setActiveAction] = useState<'topup' | 'withdraw' | null>(() => {
    if (initialSubTab === 'topup') return 'topup';
    if (initialSubTab === 'withdrawal') return 'withdraw';
    return null;
  });

  React.useEffect(() => {
    if (initialSubTab === 'topup') setActiveAction('topup');
    else if (initialSubTab === 'withdrawal') setActiveAction('withdraw');
    else if (initialSubTab === 'pribadi' || initialSubTab === 'mutasi') setActiveAction(null);
  }, [initialSubTab]);

  // TOP UP STATE
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState<'qris' | 'ewallet' | 'bank'>('qris');
  const [selectedEwalletName, setSelectedEwalletName] = useState<string>('DANA');
  const [topUpAmount, setTopUpAmount] = useState<string>('50000');
  const [topUpName, setTopUpName] = useState<string>(() => currentUser?.username || '');
  const [topUpPhone, setTopUpPhone] = useState<string>(() => currentUser?.phone || '');
  const [topUpProofImage, setTopUpProofImage] = useState<string | null>(null);
  const [topUpProofFileName, setTopUpProofFileName] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [showTopUpQris, setShowTopUpQris] = useState<boolean>(false);

  // Saweria Modal State for Top Up
  const [showSaweriaTopUpModal, setShowSaweriaTopUpModal] = useState<boolean>(false);
  const [pendingTopUpData, setPendingTopUpData] = useState<{ amount: number; name: string; phone: string } | null>(null);

  // WITHDRAWAL STATE
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50000');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('DANA');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState<string>('');
  const [withdrawAccountName, setWithdrawAccountName] = useState<string>('');
  const [withdrawUserPhone, setWithdrawUserPhone] = useState<string>(() => currentUser?.phone || '');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleTopUpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti transfer maksimal 10MB!');
        return;
      }
      setTopUpProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTopUpProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateSaweriaTopUp = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseInt(topUpAmount.replace(/\D/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount < 10000) {
      setErrorMsg('Minimal Top Up Saldo adalah Rp 10.000.');
      return;
    }

    if (!topUpName.trim()) {
      setErrorMsg('Silakan masukkan nama lengkap akun Anda.');
      return;
    }

    setPendingTopUpData({
      amount: numericAmount,
      name: topUpName.trim(),
      phone: topUpPhone.trim() || '083148834663'
    });
    setShowSaweriaTopUpModal(true);
  };

  const handleSaweriaTopUpSuccess = async () => {
    if (!pendingTopUpData) return;
    await processTopUpPaymentSuccess({
      amount: pendingTopUpData.amount,
      userName: pendingTopUpData.name,
      userPhone: pendingTopUpData.phone,
      userWallet,
      setUserWallet,
      siteConfig,
      setSiteConfig
    });

    setSuccessMsg(`✅ TOP UP BERHASIL! Saldo Anda otomatis bertambah sebesar ${formatRupiah(pendingTopUpData.amount)}.`);
    setShowSaweriaTopUpModal(false);
    setActiveAction(null);
  };

  const handleInitiateTopUpPayment = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseInt(topUpAmount.replace(/\D/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount < 10000) {
      setErrorMsg('Minimal Top Up Saldo adalah Rp 10.000.');
      return;
    }

    if (!topUpName.trim() || !topUpPhone.trim()) {
      setErrorMsg('Silakan isi nama lengkap dan nomor WhatsApp aktif Anda.');
      return;
    }

    setShowTopUpQris(true);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseInt(topUpAmount.replace(/\D/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount < 10000) {
      setErrorMsg('Minimal Top Up Saldo adalah Rp 10.000.');
      return;
    }

    if (!topUpName.trim() || !topUpPhone.trim()) {
      setErrorMsg('Silakan isi nama lengkap dan nomor WhatsApp aktif Anda.');
      return;
    }

    if (!topUpProofImage) {
      setErrorMsg('Harap unggah bukti pembayaran / transfer terlebih dahulu sebelum konfirmasi.');
      return;
    }

    const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const methodLabel = topUpPaymentMethod === 'qris'
      ? 'QRIS Top Up Resmi'
      : topUpPaymentMethod === 'ewallet'
      ? `E-Wallet Admin (${selectedEwalletName})`
      : 'Transfer Bank BCA';

    const newReq: TopUpRequest = {
      id: `topup-${Date.now()}`,
      userName: topUpName.trim(),
      userPhone: topUpPhone.trim(),
      amount: numericAmount,
      paymentProofUrl: topUpProofImage,
      status: 'Pending',
      requestedAt: timestampStr,
    };

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userName: topUpName.trim(),
      userPhone: topUpPhone.trim(),
      type: 'TOPUP',
      typeLabel: `Top Up Saldo (${methodLabel})`,
      amount: numericAmount,
      balanceAfter: userWallet.balance, // Saldo belum bertambah!
      status: 'Pending',
      note: `Metode: ${methodLabel} • ⏳ Menunggu Konfirmasi Admin`,
      referenceId: newReq.id,
      timestamp: timestampStr
    };

    setUserWallet(prev => ({
      ...prev,
      topUpHistory: [newReq, ...(prev.topUpHistory || [])],
      transactions: [newTx, ...(prev.transactions || [])]
    }));

    notifyAdminEvent(
      'topup',
      'Pengajuan Top Up Saldo Baru',
      `Member "${topUpName}" (${topUpPhone}) mengajukan Top Up Rp ${numericAmount.toLocaleString('id-ID')} via ${methodLabel}. Status: ⏳ Menunggu Konfirmasi Admin.`,
      newReq
    );

    setSuccessMsg(`✅ Permintaan Top Up Rp ${numericAmount.toLocaleString('id-ID')} berhasil dikirim ke Admin! Status: ⏳ MENUNGGU KONFIRMASI ADMIN. Saldo akan bertambah setelah disetujui Admin.`);
    
    setTopUpProofImage(null);
    setTopUpProofFileName('');
    setShowTopUpQris(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount < 20000) {
      setErrorMsg('Minimal Penarikan Saldo adalah Rp 20.000.');
      return;
    }

    if (userWallet.balance < numericAmount) {
      setErrorMsg(`Saldo Anda tidak mencukupi untuk melakukan penarikan Rp ${numericAmount.toLocaleString('id-ID')}. Saldo Anda saat ini: Rp ${userWallet.balance.toLocaleString('id-ID')}`);
      return;
    }

    if (!withdrawAccountNo.trim() || !withdrawAccountName.trim() || !withdrawUserPhone.trim()) {
      setErrorMsg('Silakan lengkapi nomor rekening/E-Wallet dan nama pemilik rekening.');
      return;
    }

    const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const newReq: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      userName: withdrawAccountName.trim(),
      userPhone: withdrawUserPhone.trim(),
      amount: numericAmount,
      method: withdrawMethod,
      accountNumber: withdrawAccountNo.trim(),
      accountName: withdrawAccountName.trim(),
      status: 'Pending',
      requestedAt: timestampStr,
    };

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userName: withdrawAccountName.trim(),
      userPhone: withdrawUserPhone.trim(),
      type: 'WITHDRAW',
      typeLabel: `Penarikan Saldo (${withdrawMethod})`,
      amount: -numericAmount,
      balanceAfter: userWallet.balance, // SALDO BELUM BERKURANG!
      status: 'Pending',
      note: `Rek: ${withdrawAccountNo.trim()} (${withdrawAccountName.trim()}) • ⏳ Menunggu Konfirmasi Admin (Saldo Belum Terpotong)`,
      referenceId: newReq.id,
      timestamp: timestampStr
    };

    setUserWallet(prev => ({
      ...prev,
      // Saldo BELUM berkurang! Saldo dipotong oleh Admin saat klik PROSES di Panel Admin
      withdrawalHistory: [newReq, ...(prev.withdrawalHistory || [])],
      transactions: [newTx, ...(prev.transactions || [])]
    }));

    notifyAdminEvent(
      'withdrawal',
      'Pengajuan Penarikan Saldo Baru',
      `Member "${withdrawAccountName}" (${withdrawUserPhone}) mengajukan Penarikan Rp ${numericAmount.toLocaleString('id-ID')} ke ${withdrawMethod} ${withdrawAccountNo}. Status: ⏳ Menunggu Konfirmasi Admin.`,
      newReq
    );

    setSuccessMsg(`✅ Permintaan penarikan Rp ${numericAmount.toLocaleString('id-ID')} berhasil dikirim ke Admin. Status: ⏳ MENUNGGU KONFIRMASI ADMIN. Saldo Anda belum berkurang hingga disetujui Admin.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER & SALDO DISPLAY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 p-6 sm:p-8 border border-amber-500/40 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>PENGELOLAAN DOMPET & SALDO RESMI</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-300 uppercase tracking-wider">
              SALDO ANDA
            </h1>
            <div className="text-3xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight flex items-center gap-2">
              <span>Rp {userWallet.balance.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Gunakan saldo Anda untuk memasang taruhan prediksi match turnamen atau lakukan penarikan saldo kapan saja ke rekening/E-Wallet Anda.
            </p>
          </div>

          {/* DUA OPSI UTAMA: TOP UP & TARIK SALDO */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
            <button
              onClick={() => {
                setActiveAction(activeAction === 'topup' ? null : 'topup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-3.5 rounded-xl border font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                activeAction === 'topup'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Top Up Saldo</span>
            </button>

            <button
              onClick={() => {
                setActiveAction(activeAction === 'withdraw' ? null : 'withdraw');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-3.5 rounded-xl border font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                activeAction === 'withdraw'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Tarik Saldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION TOP UP SALDO */}
      {activeAction === 'topup' && (
        <form onSubmit={handleTopUpSubmit} className="bg-[#0f0f0f] border border-emerald-500/40 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white uppercase">OPSI TOP UP SALDO</h2>
            </div>

            {/* PAYMENT METHOD SELECTOR TABS */}
            <div className="flex items-center gap-1.5 bg-[#050505] p-1 rounded-xl border border-neutral-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setTopUpPaymentMethod('qris')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  topUpPaymentMethod === 'qris'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <span>QRIS All Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setTopUpPaymentMethod('ewallet')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  topUpPaymentMethod === 'ewallet'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>E-Wallet Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setTopUpPaymentMethod('bank')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  topUpPaymentMethod === 'bank'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Bank BCA</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: PAYMENT METHOD DETAILS & QRIS DISPLAY */}
            <div className="space-y-3">
              {!showTopUpQris ? (
                <div className="p-6 bg-[#050505] border border-dashed border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase">QRIS Pembayaran Disembunyikan</h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Pilih nominal dan isi data akun di sebelah kanan, lalu klik <strong className="text-emerald-400 font-bold">[💳 BAYAR & TAMBAH SALDO]</strong> untuk menampilkan QRIS Top Up Resmi.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Konfirmasi Wajib Oleh Admin</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  {topUpPaymentMethod === 'qris' && (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-2">1. Scan QRIS Khusus Top Up Saldo:</label>
                      <QrisDisplay 
                        category="TOPUP"
                        customFee={parseInt(topUpAmount.replace(/\D/g, ''), 10) || 50000}
                        qrisNmid={qrisNmid || siteConfig?.paymentConfig?.qrisTopupNmid || siteConfig?.qrisNmid || siteConfig?.paymentConfig?.qrisNmid}
                        qrisImageUrl={siteConfig?.paymentConfig?.qrisTopupImageUrl || qrisImageUrl || siteConfig?.qrisImageUrl || siteConfig?.paymentConfig?.qrisImageUrl}
                      />
                    </div>
                  )}

                  {topUpPaymentMethod === 'ewallet' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-300 block">1. Pilih E-Wallet & Transfer ke Akun Admin:</label>

                      {/* E-WALLET SELECTION PILLS */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {['DANA', 'OVO', 'GoPay', 'ShopeePay', 'LinkAja'].map((ew) => (
                          <button
                            key={ew}
                            type="button"
                            onClick={() => setSelectedEwalletName(ew)}
                            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border text-center ${
                              selectedEwalletName === ew
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                                : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:border-emerald-500/50'
                            }`}
                          >
                            {ew}
                          </button>
                        ))}
                      </div>

                      {/* E-WALLET ADMIN ACCOUNT CARD */}
                      <div className="bg-[#050505] border-2 border-emerald-500/60 rounded-2xl p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 font-bold block uppercase">E-WALLET OFFICIAL ADMIN</span>
                              <strong className="text-sm text-emerald-400 font-black">{selectedEwalletName} ADMIN</strong>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-mono font-bold">
                            AKTIF
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-400 font-bold block uppercase">Nomor HP E-Wallet Admin:</span>
                          <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
                            <span className="font-mono font-black text-white text-base tracking-wider">
                              {siteConfig?.ewalletNumber || '083803540456'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(siteConfig?.ewalletNumber || '083803540456')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedNumber ? 'Tersalin!' : 'Salin Nomor'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-0.5 pt-1">
                          <span className="text-[10px] text-neutral-400 font-bold block uppercase">Atas Nama Pemilik:</span>
                          <p className="font-black text-amber-300 text-xs">
                            {siteConfig?.ewalletHolder || 'DEXZ STORE / HUNTERS'}
                          </p>
                        </div>

                        <p className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-800">
                          💡 Transfer saldo sesuai nominal Top Up ke nomor {selectedEwalletName} Admin di atas, lalu unggah foto bukti transfer pada formulir sebelah kanan.
                        </p>
                      </div>
                    </div>
                  )}

                  {topUpPaymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-300 block">1. Transfer ke Rekening Bank Resmi Admin:</label>

                      {/* BANK BCA ADMIN ACCOUNT CARD */}
                      <div className="bg-[#050505] border-2 border-blue-500/60 rounded-2xl p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 font-bold block uppercase">BANK OFFICIAL ADMIN</span>
                              <strong className="text-sm text-blue-400 font-black">BANK BCA ADMIN</strong>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full text-[10px] font-mono font-bold">
                            AKTIF
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-400 font-bold block uppercase">Nomor Rekening BCA:</span>
                          <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
                            <span className="font-mono font-black text-white text-base tracking-wider">
                              {siteConfig?.bankBcaNumber || '83148834663'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(siteConfig?.bankBcaNumber || '83148834663')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedNumber ? 'Tersalin!' : 'Salin Rekening'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-0.5 pt-1">
                          <span className="text-[10px] text-neutral-400 font-bold block uppercase">Atas Nama Rekening:</span>
                          <p className="font-black text-amber-300 text-xs">
                            {siteConfig?.bankBcaHolder || 'HUNTERS / DEXZ STORE'}
                          </p>
                        </div>

                        <p className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-800">
                          💡 Transfer ke nomor rekening Bank BCA di atas, lalu unggah struk/foto bukti transfer pada formulir sebelah kanan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FORM INPUT TOP UP */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">1. Masukkan Nominal Top Up (Rp):</label>
                <input
                  type="text"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full bg-slate-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['10000', '25000', '50000', '100000', '200000', '500000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopUpAmount(preset)}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-mono text-slate-300 hover:border-emerald-500/50"
                    >
                      Rp {parseInt(preset).toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">2. Nama Lengkap Pemilik Akun:</label>
                <input
                  type="text"
                  required
                  value={topUpName}
                  onChange={(e) => setTopUpName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">3. Nomor WhatsApp Aktif:</label>
                <input
                  type="tel"
                  required
                  value={topUpPhone}
                  onChange={(e) => setTopUpPhone(e.target.value)}
                  placeholder="Contoh: 0831xxxx"
                  className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* UNGGAH BUKTI HANYA MUNCUL SETELAH TOMBOL BAYAR DITEKAN */}
              {showTopUpQris && (
                <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-emerald-300 block">4. Unggah Bukti Transfer / Pembayaran:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTopUpFileChange}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-slate-950 hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {topUpProofFileName && (
                    <p className="text-[11px] text-emerald-400 font-mono pt-1">
                      ✓ File terpilih: {topUpProofFileName}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 space-y-3">
                {!showTopUpQris ? (
                  <button
                    type="button"
                    onClick={handleInitiateTopUpPayment}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/40"
                  >
                    <CreditCard className="w-5 h-5 text-slate-950" />
                    <span>💳 BAYAR & TAMBAH SALDO</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-300/40"
                    >
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>✅ SAYA SUDAH BAYAR / KIRIM BUKTI KE ADMIN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTopUpQris(false)}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Kembali / Ubah Nominal
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SECTION TARIK SALDO */}
      {activeAction === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="bg-[#0f0f0f] border border-amber-500/40 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white uppercase">OPSI TARIK SALDO (WITHDRAWAL)</h2>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Semua Metode
            </span>
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">1. Masukkan Jumlah Penarikan (Rp):</label>
              <input
                type="text"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="w-full bg-slate-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500">Minimal penarikan Rp 20.000. Saldo Anda: Rp {userWallet.balance.toLocaleString('id-ID')}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">2. Pilih Metode Penarikan:</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <optgroup label="E-Wallet">
                  <option value="DANA">DANA</option>
                  <option value="OPO">OVO</option>
                  <option value="GoPay">GoPay</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="LinkAja">LinkAja</option>
                </optgroup>
                <optgroup label="Bank Transfer">
                  <option value="BCA">Bank BCA</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="Bank Lainnya">Bank Lainnya</option>
                </optgroup>
                <optgroup label="Lainnya">
                  <option value="QRIS/Lainnya">QRIS / Metode Lainnya</option>
                </optgroup>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">3. Nomor Rekening / E-Wallet Tujuan:</label>
              <input
                type="text"
                required
                value={withdrawAccountNo}
                onChange={(e) => setWithdrawAccountNo(e.target.value)}
                placeholder="Contoh: 0831xxxx atau 831488xxx"
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">4. Nama Pemilik Rekening / E-Wallet:</label>
              <input
                type="text"
                required
                value={withdrawAccountName}
                onChange={(e) => setWithdrawAccountName(e.target.value)}
                placeholder="Nama A.N Pemilik Rekening"
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">5. Nomor WhatsApp Anda:</label>
              <input
                type="tel"
                required
                value={withdrawUserPhone}
                onChange={(e) => setWithdrawUserPhone(e.target.value)}
                placeholder="Contoh: 0831xxxx"
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Permintaan Penarikan ke Admin</span>
            </button>
          </div>
        </form>
      )}

      {/* RIWAYAT TRANSAKSI SALDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TOP UP HISTORY */}
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-white text-sm uppercase">Riwayat Top Up</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{userWallet.topUpHistory.length} Transaksi</span>
          </div>

          {userWallet.topUpHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Belum ada riwayat Top Up.</p>
          ) : (
            <div className="space-y-2">
              {userWallet.topUpHistory.map((t) => (
                <div key={t.id} className="p-3 bg-slate-950 border border-neutral-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-emerald-400">+ Rp {t.amount.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-slate-400">{t.requestedAt}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                      t.status === 'Berhasil' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      t.status === 'Gagal' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}>
                      {t.status === 'Berhasil' ? '✅ SAH' : t.status === 'Gagal' ? '❌ DITOLAK' : '⏳ MENUNGGU ADMIN'}
                    </span>
                  </div>
                  {t.status === 'Gagal' && (
                    <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-[10px] text-red-300">
                      <strong>Alasan Penolakan:</strong> Permintaan ditolak oleh Admin. Silakan periksa kembali bukti transfer Anda.
                    </div>
                  )}
                  {t.status === 'Pending' && (
                    <p className="text-[10px] text-amber-300/80 font-mono">
                      ⏳ Sedang diperiksa oleh Admin. Saldo akan masuk setelah diverifikasi.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WITHDRAWAL HISTORY */}
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-white text-sm uppercase">Riwayat Penarikan Saldo</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{(userWallet.withdrawalHistory || []).length} Transaksi</span>
          </div>

          {(!userWallet.withdrawalHistory || userWallet.withdrawalHistory.length === 0) ? (
            <p className="text-xs text-slate-500 text-center py-4">Belum ada riwayat penarikan saldo.</p>
          ) : (
            <div className="space-y-2">
              {userWallet.withdrawalHistory.map((w) => (
                <div key={w.id} className="p-3 bg-slate-950 border border-neutral-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-amber-400">- Rp {w.amount.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-slate-400">{w.method} • {w.accountNumber} ({w.accountName})</p>
                      <p className="text-[9px] text-slate-500">{w.requestedAt}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                      w.status === 'Berhasil' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      w.status === 'Gagal' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}>
                      {w.status === 'Berhasil' ? '✅ DIPROSES / SAH' : w.status === 'Gagal' ? '❌ DITOLAK' : '⏳ MENUNGGU ADMIN'}
                    </span>
                  </div>
                  {w.status === 'Gagal' && (
                    <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-[10px] text-red-300">
                      <strong>Alasan Penolakan:</strong> Permintaan penarikan ditolak oleh Admin. Saldo Anda aman dan tidak terpotong.
                    </div>
                  )}
                  {w.status === 'Pending' && (
                    <p className="text-[10px] text-amber-300/80 font-mono">
                      ⏳ Menunggu Admin melakukan transfer ke rekening/E-Wallet tujuan Anda.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JURNAL AUDIT TRANSAKSI SALDO LENGKAP */}
      <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-black text-white text-sm uppercase">JURNAL MUTASI & AUDIT LOG SALDO (REALTIME)</h3>
              <p className="text-[10px] text-slate-400">Pusat pencatatan otomatis semua arus masuk, keluar, taruhan & kemenangan</p>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {(userWallet.transactions || []).length} Rekaman
          </span>
        </div>

        {(!userWallet.transactions || userWallet.transactions.length === 0) ? (
          <p className="text-xs text-slate-500 text-center py-6">Belum ada aktivitas mutasi saldo tercatat.</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {userWallet.transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 bg-slate-950 border border-neutral-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      tx.amount > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      tx.amount < 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {tx.typeLabel}
                    </span>
                    <strong className="text-white text-xs">{tx.userName}</strong>
                    {tx.userPhone && <span className="text-[10px] text-slate-500">({tx.userPhone})</span>}
                  </div>
                  {tx.note && <p className="text-[11px] text-slate-400 font-sans">{tx.note}</p>}
                  <p className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-mono font-black text-sm ${tx.amount > 0 ? 'text-emerald-400' : tx.amount < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {tx.amount > 0 ? `+ Rp ${tx.amount.toLocaleString('id-ID')}` : tx.amount < 0 ? `- Rp ${Math.abs(tx.amount).toLocaleString('id-ID')}` : `Rp 0`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Saldo Akhir: <strong className="text-amber-400">Rp {(tx.balanceAfter || 0).toLocaleString('id-ID')}</strong>
                  </p>
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded mt-0.5 ${
                    tx.status === 'Berhasil' ? 'bg-emerald-500/20 text-emerald-400' :
                    tx.status === 'Gagal' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAWERIA TOP UP MODAL */}
      {showSaweriaTopUpModal && pendingTopUpData && (
        <SaweriaPaymentModal
          isOpen={showSaweriaTopUpModal}
          onClose={() => setShowSaweriaTopUpModal(false)}
          title="Top Up Saldo Pengguna"
          subtitle={`Top Up Akun: ${pendingTopUpData.name} (${pendingTopUpData.phone})`}
          type="TOPUP"
          amount={pendingTopUpData.amount}
          payerName={pendingTopUpData.name}
          payerPhone={pendingTopUpData.phone}
          onConfirmSuccess={handleSaweriaTopUpSuccess}
          successButtonText="Lihat Saldo Saya"
        />
      )}
    </div>
  );
};
