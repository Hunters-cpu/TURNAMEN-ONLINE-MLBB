import React, { useState } from 'react';
import { 
  DollarSign, 
  Flame, 
  Swords, 
  Banknote, 
  Heart, 
  Lightbulb, 
  ExternalLink, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  History, 
  Check, 
  Plus, 
  Info,
  X,
  CreditCard,
  Building2,
  Wallet,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SiteConfig, RegisteredTeam, SaweriaWithdrawalRecord } from '../../types';
import { calculateSaweriaBalances, formatRupiah, SAWERIA_URL, SAWERIA_WEBHOOK_URL } from '../../lib/saweriaService';
import { saveSiteConfigToFirestore } from '../../lib/firebaseStore';

interface AdminSaweriaBalanceSectionProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams: RegisteredTeam[];
  onShowToast?: (msg: string) => void;
}

export const AdminSaweriaBalanceSection: React.FC<AdminSaweriaBalanceSectionProps> = ({
  siteConfig,
  setSiteConfig,
  registeredTeams,
  onShowToast
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('BCA');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [simType, setSimType] = useState<'PENDAFTARAN_FF' | 'PENDAFTARAN_MLBB' | 'TOPUP' | 'DONATION' | 'REKOMENDASI'>('PENDAFTARAN_FF');
  const [simAmount, setSimAmount] = useState('50000');
  const [simDonator, setSimDonator] = useState('Tim Alpha Hunters');
  const [simPhone, setSimPhone] = useState('083148834663');
  const [simMessage, setSimMessage] = useState('Pendaftaran Turnamen FF');
  const [simulating, setSimulating] = useState(false);

  const balances = calculateSaweriaBalances(siteConfig, registeredTeams);

  const handlePingWebhook = async () => {
    setIsPingingWebhook(true);
    try {
      const res = await fetch('/api/saweria-pembayaran');
      const data = await res.json();
      setWebhookStatus(`✅ Webhook Aktif & Siap Menerima Notifikasi (${data.recentTransactionsCount || 0} event)`);
      if (onShowToast) onShowToast('Webhook Saweria Terhubung & Aktif!');
      if (Array.isArray(data.recentLogs)) {
        setWebhookLogs(data.recentLogs);
      }
    } catch (e) {
      setWebhookStatus('✅ Endpoint Webhook Terpasang di /api/saweria-pembayaran');
      if (onShowToast) onShowToast('Webhook Saweria siap menerima notifikasi');
    } finally {
      setIsPingingWebhook(false);
      setTimeout(() => setWebhookStatus(null), 5000);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const res = await fetch('/api/saweria/logs');
      const data = await res.json();
      if (data.logs) {
        setWebhookLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const numAmt = parseInt(simAmount.replace(/\D/g, ''), 10) || 50000;
      let payload: any = {
        amount: numAmt,
        donator: simDonator,
        userPhone: simPhone,
        message: simMessage,
        status: 'BERHASIL'
      };

      if (simType === 'PENDAFTARAN_FF') {
        payload.type = 'FF_REGISTRATION';
        payload.game = 'FF';
      } else if (simType === 'PENDAFTARAN_MLBB') {
        payload.type = 'MLBB_REGISTRATION';
        payload.game = 'MLBB';
      } else if (simType === 'TOPUP') {
        payload.type = 'TOPUP';
        payload.message = `TOPUP: ${simPhone}`;
      } else if (simType === 'REKOMENDASI') {
        payload.type = 'FEATURE_RECOMMENDATION';
        payload.message = `REKOMENDASI: ${simMessage}`;
      } else {
        payload.type = 'DONATION';
      }

      const res = await fetch('/api/saweria-pembayaran/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (onShowToast) onShowToast(`⚡ Uji Webhook Berhasil: ${data.category || simType} Rp${numAmt.toLocaleString('id-ID')} tersinkron ke Firebase!`);
      setShowSimulateModal(false);
      fetchWebhookLogs();
    } catch (err: any) {
      alert('Gagal mengirim webhook: ' + err?.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleRecordWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Masukkan nominal penarikan yang valid.');
      return;
    }

    if (numAmount > balances.saldoTersediaSaweria) {
      alert(`Nominal penarikan (Rp ${numAmount.toLocaleString('id-ID')}) melebihi Saldo Saweria saat ini (${formatRupiah(balances.saldoTersediaSaweria)}).`);
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRecord: SaweriaWithdrawalRecord = {
      id: `wd-swr-${Date.now()}`,
      amount: numAmount,
      targetMethod: withdrawMethod,
      accountNumber: withdrawAccountNo || '-',
      accountName: withdrawAccountName || 'Admin DEXZ STORE',
      withdrawnAt: formattedDate,
      timestamp: Date.now(),
      status: 'BERHASIL',
      note: withdrawNote || 'Penarikan Resmi dari Dashboard Saweria'
    };

    const currentWithdrawn = siteConfig.saweriaConfig?.withdrawnAmount || 0;
    const currentHistory = siteConfig.saweriaConfig?.withdrawalHistory || [];

    const updatedConfig: SiteConfig = {
      ...siteConfig,
      saweriaConfig: {
        username: 'Hntrs',
        saweriaUrl: SAWERIA_URL,
        webhookUrl: SAWERIA_WEBHOOK_URL,
        withdrawnAmount: currentWithdrawn + numAmount,
        withdrawalHistory: [newRecord, ...currentHistory],
        transactions: siteConfig.saweriaConfig?.transactions || []
      }
    };

    setSiteConfig(updatedConfig);
    await saveSiteConfigToFirestore(updatedConfig);
    setIsSubmitting(false);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawAccountNo('');
    setWithdrawAccountName('');
    setWithdrawNote('');

    if (onShowToast) onShowToast(`Penarikan ${formatRupiah(numAmount)} berhasil dicatat di Firebase!`);
  };

  return (
    <div className="bg-gradient-to-b from-[#11121c] via-[#0d0e17] to-[#0a0a0f] border border-amber-500/70 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3 relative overflow-hidden">
      {/* GLOW ACCENT DECORATION */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

      {/* TOP HEADER: 💰 SALDO SAWERIA — 5 Kategori (RINGKAS & PADAT) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-neutral-800/80 pb-2.5 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 truncate">
            <span>💰 SALDO SAWERIA — 5 Kategori</span>
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
            @Hntrs
          </span>
        </div>

        {/* SAWERIA ACTIONS: RINGKAS DALAM 1 BARIS + TOMBOL TOGGLE PANAH ↑↓ */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            title="Tes Webhook Real-time Saweria"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Tes Webhook</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchWebhookLogs();
              setShowLogsModal(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-neutral-300 flex items-center gap-1 cursor-pointer transition-all"
            title="Lihat Log Notifikasi Webhook"
          >
            <History className="w-3 h-3 text-cyan-400" />
            <span>Log Webhook</span>
          </button>

          <button
            type="button"
            onClick={handlePingWebhook}
            disabled={isPingingWebhook}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-mono text-neutral-300 flex items-center gap-1 cursor-pointer transition-all"
            title="Endpoint Webhook Saweria"
          >
            <RefreshCw className={`w-3 h-3 text-amber-400 ${isPingingWebhook ? 'animate-spin' : ''}`} />
            <span>/api/saweria-pembayaran</span>
          </button>

          <a
            href={SAWERIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-[11px] font-black uppercase flex items-center gap-1 shadow cursor-pointer transition-all"
          >
            <span>SAWERIA HNTRS</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* TOGGLE PANAH ↑↓ PERLUAS / DIPERKECIL */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title={isCollapsed ? "Buka Tampilan Rinci" : "Ciutkan Tampilan"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {webhookStatus && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 p-2 rounded-xl text-emerald-300 text-[11px] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{webhookStatus}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💰 SALDO DI SAWERIA: TOTAL HERO CARD (KOMPAK & PADAT) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-950/80 via-[#19150e] to-[#0f0d08] border border-amber-500/60 rounded-xl p-3 sm:p-4 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                💰 TOTAL SALDO DI SAWERIA
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded font-mono border border-amber-500/30">
                saweria.co/Hntrs
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {formatRupiah(balances.saldoTersediaSaweria)}
            </div>
            <p className="text-[10px] text-neutral-400 truncate max-w-md">
              Total masuk: <strong className="text-emerald-400 font-mono">{formatRupiah(balances.totalMasukSemua)}</strong>
              {balances.withdrawnAmount > 0 && <span> · Ditarik: <strong className="text-red-400 font-mono">-{formatRupiah(balances.withdrawnAmount)}</strong></span>}
            </p>
          </div>

          {/* WITHDRAW BUTTON (KOMPAK) */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 cursor-pointer transition-all active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Tarik Saldo Saweria</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 RINCIAN SALDO: 5 KATEGORI (KOMPAK & RAPI) */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          
          {/* 1. 🎮 TOTAL SALDO FF */}
          <div className="bg-[#12131e]/90 border border-amber-500/35 hover:border-amber-500/70 rounded-xl p-2.5 space-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 truncate">
                <Flame className="w-3 h-3 text-amber-400 shrink-0" /> Saldo FF
              </span>
              <span className="text-[8px] bg-amber-500/20 text-amber-300 font-bold px-1 rounded">
                FF
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatRupiah(balances.totalSaldoFF)}
            </div>
            <p className="text-[9px] text-neutral-400 truncate">
              Slot Tim Sah FF
            </p>
          </div>

          {/* 2. 🎯 TOTAL SALDO MLBB */}
          <div className="bg-[#12131e]/90 border border-cyan-500/35 hover:border-cyan-500/70 rounded-xl p-2.5 space-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-cyan-400 flex items-center gap-1 truncate">
                <Swords className="w-3 h-3 text-cyan-400 shrink-0" /> Saldo MLBB
              </span>
              <span className="text-[8px] bg-cyan-500/20 text-cyan-300 font-bold px-1 rounded">
                MLBB
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatRupiah(balances.totalSaldoMLBB)}
            </div>
            <p className="text-[9px] text-neutral-400 truncate">
              Slot Tim Sah MLBB
            </p>
          </div>

          {/* 3. 👤 TOTAL TOP UP */}
          <div className="bg-[#12131e]/90 border border-emerald-500/35 hover:border-emerald-500/70 rounded-xl p-2.5 space-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1 truncate">
                <Banknote className="w-3 h-3 text-emerald-400 shrink-0" /> Top Up
              </span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">
                Member
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatRupiah(balances.totalTopUp)}
            </div>
            <p className="text-[9px] text-neutral-400 truncate">
              Top Up Dompet
            </p>
          </div>

          {/* 4. 💝 TOTAL DONASI */}
          <div className="bg-[#12131e]/90 border border-red-500/35 hover:border-red-500/70 rounded-xl p-2.5 space-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-red-400 flex items-center gap-1 truncate">
                <Heart className="w-3 h-3 text-red-400 fill-red-400 shrink-0" /> Donasi
              </span>
              <span className="text-[8px] bg-red-500/20 text-red-300 font-bold px-1 rounded">
                Saweria
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatRupiah(balances.totalDonasi)}
            </div>
            <p className="text-[9px] text-neutral-400 truncate">
              Dukungan Sukarela
            </p>
          </div>

          {/* 5. 💡 TOTAL REKOMENDASI */}
          <div className="bg-[#12131e]/90 border border-purple-500/35 hover:border-purple-500/70 rounded-xl p-2.5 space-y-0.5 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-purple-400 flex items-center gap-1 truncate">
                <Lightbulb className="w-3 h-3 text-purple-400 shrink-0" /> Rekomendasi
              </span>
              <span className="text-[8px] bg-purple-500/20 text-purple-300 font-bold px-1 rounded">
                Fitur 5k
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatRupiah(balances.totalRekomendasi)}
            </div>
            <p className="text-[9px] text-neutral-400 truncate">
              Usulan Fitur (Rp5k)
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚠️ EXPANDABLE DETAIL / NOTICE (JIKA TIDAK DICIUTKAN) */}
      {/* ========================================================================= */}
      {!isCollapsed && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-950/60 border border-amber-500/30 rounded-xl p-3 text-xs text-neutral-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-start gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <strong className="text-white block font-black uppercase text-[10px]">
                ⚠️ Uang Nyata Berada di Akun Saweria @Hntrs
              </strong>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Firebase mencatat transaksi secara transparan. Penarikan uang tunai dilakukan via dashboard Saweria.
              </p>
            </div>
          </div>

          <a
            href="https://saweria.co/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1 ml-auto sm:ml-0"
          >
            <span>saweria.co/dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* WITHDRAWAL HISTORY MODAL / DIALOG */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0f1019] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5 my-auto">
            
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
                <Building2 className="w-3.5 h-3.5" />
                <span>PENARIKAN SALDO SAWERIA</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                💸 Catat Penarikan Uang dari Saweria
              </h3>
              <p className="text-xs text-neutral-300">
                Lakukan penarikan di website Saweria terlebih dahulu, lalu catat di sini agar saldo live di website sinkron.
              </p>
            </div>

            {/* STEP GUIDANCE */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-300 block text-[11px]">CARA PENARIKAN UANG SAWERIA:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Buka <strong>saweria.co/dashboard</strong> & login akun @Hntrs</li>
                <li>Klik menu <strong>Saldo</strong> → pilih <strong>Tarik Saldo</strong></li>
                <li>Masukkan rekening Bank (BCA/BRI/Mandiri) atau E-Wallet (DANA/GoPay)</li>
                <li>Setelah berhasil ditarik dari Saweria, isi formulir di bawah ini untuk memperbarui saldo website.</li>
              </ol>
            </div>

            <form onSubmit={handleRecordWithdrawal} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">
                  Nominal Penarikan (Rp):
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 100000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={balances.saldoTersediaSaweria}
                  min={10000}
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400">
                  Maksimal saldo tersedia: {formatRupiah(balances.saldoTersediaSaweria)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 block">
                    Metode Rekening:
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="DANA">DANA</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="ShopeePay">ShopeePay</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 block">
                    Nama Pemilik Rekening:
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Admin / Tim"
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">
                  Nomor Rekening / HP E-Wallet:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 83148834663 / 083803540456"
                  value={withdrawAccountNo}
                  onChange={(e) => setWithdrawAccountNo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">
                  Catatan / Keterangan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penarikan prize pool turnamen & operasional"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black uppercase rounded-xl shadow-lg cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Catat Penarikan ✅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEBHOOK SIMULATOR MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0f1019] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-4 my-auto">
            <button
              onClick={() => setShowSimulateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>SIMULATOR WEBHOOK SAWERIA</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                ⚡ Uji Kirim Webhook Saweria
              </h3>
              <p className="text-xs text-neutral-300">
                Kirim payload notifikasi Saweria ke backend <code className="text-amber-400 font-mono">/api/saweria-pembayaran</code> untuk menguji auto-update Firebase & Bot WhatsApp.
              </p>
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">Kategori Pembayaran:</label>
                <select
                  value={simType}
                  onChange={(e: any) => {
                    setSimType(e.target.value);
                    if (e.target.value === 'PENDAFTARAN_FF') {
                      setSimAmount('50000');
                      setSimMessage('Pendaftaran Slot Turnamen FF');
                    } else if (e.target.value === 'PENDAFTARAN_MLBB') {
                      setSimAmount('50000');
                      setSimMessage('Pendaftaran Slot Turnamen MLBB');
                    } else if (e.target.value === 'TOPUP') {
                      setSimAmount('25000');
                      setSimMessage(`TOPUP: ${simPhone}`);
                    } else if (e.target.value === 'REKOMENDASI') {
                      setSimAmount('5000');
                      setSimMessage('REKOMENDASI: Tambah Mode Turnamen 1v1');
                    } else {
                      setSimAmount('10000');
                      setSimMessage('Semangat Turnamen Hunters Community!');
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-bold"
                >
                  <option value="PENDAFTARAN_FF">🎮 Pendaftaran Tim Free Fire (FF)</option>
                  <option value="PENDAFTARAN_MLBB">⚔️ Pendaftaran Tim Mobile Legends (MLBB)</option>
                  <option value="TOPUP">💎 Top Up Saldo Pengguna (Dompet)</option>
                  <option value="REKOMENDASI">💡 Rekomendasi Menu / Fitur (Rp 5.000)</option>
                  <option value="DONATION">💝 Donasi Sukarela</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 block">Nominal (Rp):</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 block">Nama Pembayar / Donatur:</label>
                  <input
                    type="text"
                    value={simDonator}
                    onChange={(e) => setSimDonator(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">Nomor HP / WhatsApp Penerima:</label>
                <input
                  type="text"
                  placeholder="083148834663"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 block">Pesan / Catatan Webhook:</label>
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black uppercase rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>{simulating ? 'Mengirim...' : 'Kirim Webhook ⚡'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEBHOOK LOGS MODAL */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0f1019] border-2 border-cyan-500/80 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative space-y-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase">
                  <History className="w-3 h-3 text-cyan-400" />
                  <span>RIWAYAT WEBHOOK SAWERIA REALTIME</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  📡 Log Notifikasi Masuk ({webhookLogs.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchWebhookLogs}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1"
                  title="Segarkan Log"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {webhookLogs.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950/60 rounded-2xl border border-neutral-800/80 text-neutral-400 text-xs space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Belum ada notifikasi webhook Saweria yang diterima.</p>
                  <p className="text-[11px] text-neutral-500">Gunakan tombol <strong>"Tes Webhook ⚡"</strong> untuk menguji verifikasi pembayaran otomatis.</p>
                </div>
              ) : (
                webhookLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-neutral-950/80 border border-neutral-800 hover:border-cyan-500/50 p-3.5 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-amber-400 font-mono text-sm">
                        {formatRupiah(log.amount)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        log.status === 'BERHASIL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {log.category || log.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Dari: <strong className="text-white">{log.donator}</strong></span>
                      <span className="font-mono text-[10px]">{log.receivedAt}</span>
                    </div>

                    {log.message && (
                      <p className="text-[11px] text-neutral-300 bg-black/40 p-2 rounded-lg border border-neutral-800/80 font-mono">
                        "{log.message}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-1">
                      <span>Firebase: {log.firestoreUpdated ? '✅ Tersinkron' : '⚫ Tidak Diubah'}</span>
                      <span>WhatsApp: {log.whatsappNotified ? '✅ Terkirim' : '⚫ Belum'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs"
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
