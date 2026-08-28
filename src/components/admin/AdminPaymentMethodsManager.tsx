import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building, 
  Upload, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Flame, 
  Swords, 
  Sparkles, 
  Lightbulb, 
  Coins, 
  Image as ImageIcon, 
  Eye, 
  Search, 
  Filter, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  DollarSign,
  Heart,
  Tag
} from 'lucide-react';
import { 
  SiteConfig, 
  PaymentMethodsConfig, 
  CustomPaymentType, 
  CustomPaymentTransaction, 
  RegisteredTeam, 
  UserWallet, 
  MatchPredictionBet, 
  FeatureRecommendation, 
  TopUpRequest, 
  WithdrawalRequest,
  WalletTransaction
} from '../../types';
import { INITIAL_PAYMENT_METHODS_CONFIG } from '../../data/initialData';
import { QrisDisplay } from '../QrisDisplay';
import { notifyConfirmationResult, notifyBalanceAdded } from '../../lib/notificationService';

interface AdminPaymentMethodsManagerProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  handleSaveAllConfig: (newConfig: SiteConfig, message?: string) => void;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  userWallet?: UserWallet;
  setUserWallet?: React.Dispatch<React.SetStateAction<UserWallet>>;
  bets?: MatchPredictionBet[];
  setBets?: React.Dispatch<React.SetStateAction<MatchPredictionBet[]>>;
  showNotification: (message: string) => void;
}

export const AdminPaymentMethodsManager: React.FC<AdminPaymentMethodsManagerProps> = ({
  config,
  setConfig,
  handleSaveAllConfig,
  registeredTeams,
  setRegisteredTeams,
  userWallet,
  setUserWallet,
  bets = [],
  setBets,
  showNotification,
}) => {
  const [subTab, setSubTab] = useState<'qris-6-options' | 'ewallet-bank' | 'verification-queue'>('qris-6-options');

  // Custom Payment Types Form State
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newCustomName, setNewCustomName] = useState<string>('');
  const [newCustomCategory, setNewCustomCategory] = useState<string>('Umum');
  const [newCustomAmount, setNewCustomAmount] = useState<string>('50000');
  const [newCustomDescription, setNewCustomDescription] = useState<string>('');
  const [newCustomQrisUrl, setNewCustomQrisUrl] = useState<string>('');

  // Queue Filters State
  const [queueFilterCategory, setQueueFilterCategory] = useState<string>('ALL');
  const [queueFilterStatus, setQueueFilterStatus] = useState<string>('ALL');
  const [queueSearchTerm, setQueueSearchTerm] = useState<string>('');
  const [zoomedProofUrl, setZoomedProofUrl] = useState<string | null>(null);

  // Reject Prompt State
  const [rejectingItem, setRejectingItem] = useState<{
    id: string;
    type: 'TEAM_REGISTRATION' | 'FEATURE_REC' | 'BET' | 'TOPUP' | 'WITHDRAWAL' | 'CUSTOM';
    title: string;
    recipientPhone?: string;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  const paymentConfig = config.paymentConfig || INITIAL_PAYMENT_METHODS_CONFIG;

  const updatePaymentConfig = (updated: Partial<PaymentMethodsConfig>) => {
    const nextConfig: PaymentMethodsConfig = {
      ...(config.paymentConfig || INITIAL_PAYMENT_METHODS_CONFIG),
      ...updated,
    };
    setConfig({
      ...config,
      paymentConfig: nextConfig,
    });
  };

  const handleFileUploadForField = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: keyof PaymentMethodsConfig,
    successMsg: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto QRIS maksimal 10MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updatePaymentConfig({ [fieldKey]: base64 });
        showNotification(successMsg);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomPaymentType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) {
      alert('Nama jenis pembayaran wajib diisi!');
      return;
    }

    const numericAmount = parseInt(newCustomAmount.replace(/\D/g, ''), 10) || 50000;
    const newType: CustomPaymentType = {
      id: `custom-pay-${Date.now()}`,
      name: newCustomName.trim(),
      category: newCustomCategory.trim() || 'Umum',
      description: newCustomDescription.trim(),
      amount: numericAmount,
      qrisImageUrl: newCustomQrisUrl.trim(),
      isEnabled: true,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    };

    const currentCustoms = paymentConfig.customPaymentTypes || [];
    const updatedCustoms = [...currentCustoms, newType];
    updatePaymentConfig({ customPaymentTypes: updatedCustoms });

    // Reset Form
    setNewCustomName('');
    setNewCustomCategory('Umum');
    setNewCustomAmount('50000');
    setNewCustomDescription('');
    setNewCustomQrisUrl('');
    setShowAddCustomModal(false);

    showNotification(`Jenis pembayaran baru "${newType.name}" berhasil ditambahkan!`);
  };

  const handleDeleteCustomPaymentType = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus jenis pembayaran "${name}"?`)) {
      const currentCustoms = paymentConfig.customPaymentTypes || [];
      const updated = currentCustoms.filter(c => c.id !== id);
      updatePaymentConfig({ customPaymentTypes: updated });
      showNotification(`Jenis pembayaran "${name}" berhasil dihapus.`);
    }
  };

  const handleToggleCustomPaymentType = (id: string) => {
    const currentCustoms = paymentConfig.customPaymentTypes || [];
    const updated = currentCustoms.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c);
    updatePaymentConfig({ customPaymentTypes: updated });
  };

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // ==========================================
  // PAYMENT APPROVAL ACTIONS (MANUAL VERIFICATION)
  // ==========================================
  const handleApproveTeam = (team: RegisteredTeam) => {
    setRegisteredTeams(prev => prev.map(t => {
      if (t.id === team.id) {
        return { ...t, status: 'Sah' };
      }
      return t;
    }));

    notifyConfirmationResult(
      team.captainPhone,
      team.teamName,
      true,
      'pendaftaran',
      `Slot #${team.slotNumber} (${team.game}) telah DIVERIFIKASI SAH oleh Admin!`
    );

    showNotification(`Pendaftaran tim "${team.teamName}" (${team.game}) berhasil dikonfirmasi SAH!`);
  };

  const handleApproveRecommendation = (rec: FeatureRecommendation) => {
    const updated = (config.featureRecommendations || []).map(r => {
      if (r.id === rec.id) {
        return { ...r, status: 'DIPROSES' as const, paymentStatus: 'LUNAS' as const };
      }
      return r;
    });
    const newConfig = { ...config, featureRecommendations: updated };
    setConfig(newConfig);
    handleSaveAllConfig(newConfig, `Rekomendasi fitur dari "${rec.userName}" berhasil DITERIMA & DIPROSES!`);
  };

  const handleApproveBet = (bet: MatchPredictionBet) => {
    if (setBets) {
      setBets(prev => prev.map(b => {
        if (b.id === bet.id) {
          return { ...b, status: 'Dikonfirmasi' };
        }
        return b;
      }));
    }
    showNotification(`Taruhan match untuk "${bet.userName}" (${formatRupiah(bet.betAmount)}) berhasil DITERIMA & DIAKTIFKAN!`);
  };

  const handleApproveTopUp = (req: TopUpRequest) => {
    if (!userWallet || !setUserWallet) return;
    const currentBalance = userWallet.balance;
    const newBalance = currentBalance + req.amount;

    const updatedHistory = (userWallet.topUpHistory || []).map(t => {
      if (t.id === req.id) {
        return { ...t, status: 'Approved' as const, processedAt: new Date().toLocaleString('id-ID') };
      }
      return t;
    });

    const newTx: WalletTransaction = {
      id: `tx-topup-approved-${Date.now()}`,
      userName: req.userName,
      userPhone: req.userPhone,
      type: 'TOPUP',
      typeLabel: 'Top Up Saldo (Dikonfirmasi Sah)',
      amount: req.amount,
      balanceAfter: newBalance,
      status: 'Berhasil',
      note: `Top Up Saldo Rp ${req.amount.toLocaleString('id-ID')} telah disetujui & masuk ke saldo akun.`,
      referenceId: req.id,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setUserWallet({
      ...userWallet,
      balance: newBalance,
      topUpHistory: updatedHistory,
      transactions: [newTx, ...(userWallet.transactions || [])]
    });

    notifyBalanceAdded(
      req.userPhone,
      req.userName,
      req.amount,
      'Top Up Saldo Akun (Dikonfirmasi Admin)',
      newBalance
    );
    showNotification(`Top Up saldo sebesar ${formatRupiah(req.amount)} untuk "${req.userName}" BERHASIL DISETUJUI & MASUK KE SALDO!`);
  };

  const handleApproveWithdrawal = (req: WithdrawalRequest) => {
    if (!userWallet || !setUserWallet) return;
    const updatedWithdrawals = (userWallet.withdrawalHistory || []).map(w => {
      if (w.id === req.id) {
        return { ...w, status: 'Approved' as const, processedAt: new Date().toLocaleString('id-ID') };
      }
      return w;
    });

    setUserWallet({
      ...userWallet,
      withdrawalHistory: updatedWithdrawals
    });

    showNotification(`Permintaan penarikan saldo sebesar ${formatRupiah(req.amount)} untuk "${req.accountName}" BERHASIL DIKONFIRMASI SELESAI DITRANSFER!`);
  };

  const handleApproveCustomPayment = (tx: CustomPaymentTransaction) => {
    const currentTxs = paymentConfig.customPaymentTransactions || [];
    const updated = currentTxs.map(t => {
      if (t.id === tx.id) {
        return { ...t, status: 'Sah' as const, processedAt: new Date().toLocaleString('id-ID') };
      }
      return t;
    });
    updatePaymentConfig({ customPaymentTransactions: updated });
    showNotification(`Pembayaran khusus "${tx.paymentTypeName}" dari "${tx.userName}" berhasil DIVERIFIKASI SAH!`);
  };

  // REJECT EXECUTION
  const executeRejection = () => {
    if (!rejectingItem) return;
    const reason = rejectionReasonInput.trim() || 'Bukti transfer tidak valid atau tidak masuk ke rekening resmi.';

    if (rejectingItem.type === 'TEAM_REGISTRATION') {
      setRegisteredTeams(prev => prev.map(t => {
        if (t.id === rejectingItem.id) {
          return { ...t, status: 'Gagal' };
        }
        return t;
      }));
      if (rejectingItem.recipientPhone) {
        notifyConfirmationResult(
          rejectingItem.recipientPhone,
          rejectingItem.title,
          false,
          'pendaftaran',
          '',
          reason
        );
      }
      showNotification(`Pendaftaran tim "${rejectingItem.title}" DITOLAK. Alasan: ${reason}`);
    } else if (rejectingItem.type === 'FEATURE_REC') {
      const updated = (config.featureRecommendations || []).map(r => {
        if (r.id === rejectingItem.id) {
          return { ...r, status: 'DITOLAK' as const, adminReason: reason };
        }
        return r;
      });
      const newConfig = { ...config, featureRecommendations: updated };
      setConfig(newConfig);
      handleSaveAllConfig(newConfig, `Rekomendasi fitur DITOLAK. Alasan: ${reason}`);
    } else if (rejectingItem.type === 'BET') {
      if (setBets) {
        setBets(prev => prev.map(b => {
          if (b.id === rejectingItem.id) {
            return { ...b, status: 'Dibatalkan' };
          }
          return b;
        }));
      }
      showNotification(`Taruhan match DITOLAK. Alasan: ${reason}`);
    } else if (rejectingItem.type === 'TOPUP') {
      if (userWallet && setUserWallet) {
        const updatedHistory = (userWallet.topUpHistory || []).map(t => {
          if (t.id === rejectingItem.id) {
            return { ...t, status: 'Rejected' as const, rejectionReason: reason, processedAt: new Date().toLocaleString('id-ID') };
          }
          return t;
        });
        setUserWallet({ ...userWallet, topUpHistory: updatedHistory });
      }
      showNotification(`Permintaan Top Up DITOLAK. Alasan: ${reason}`);
    } else if (rejectingItem.type === 'WITHDRAWAL') {
      if (userWallet && setUserWallet) {
        const currentReq = userWallet.withdrawalHistory?.find(w => w.id === rejectingItem.id);
        const refundAmount = currentReq ? currentReq.amount : 0;
        const newBalance = userWallet.balance + refundAmount; // Refund balance to user!

        const updatedWithdrawals = (userWallet.withdrawalHistory || []).map(w => {
          if (w.id === rejectingItem.id) {
            return { ...w, status: 'Rejected' as const, rejectionReason: reason, processedAt: new Date().toLocaleString('id-ID') };
          }
          return w;
        });

        setUserWallet({
          ...userWallet,
          balance: newBalance,
          withdrawalHistory: updatedWithdrawals
        });
      }
      showNotification(`Permintaan penarikan DITOLAK & saldo direfund. Alasan: ${reason}`);
    } else if (rejectingItem.type === 'CUSTOM') {
      const currentTxs = paymentConfig.customPaymentTransactions || [];
      const updated = currentTxs.map(t => {
        if (t.id === rejectingItem.id) {
          return { ...t, status: 'Ditolak' as const, rejectionReason: reason, processedAt: new Date().toLocaleString('id-ID') };
        }
        return t;
      });
      updatePaymentConfig({ customPaymentTransactions: updated });
      showNotification(`Pembayaran tambahan DITOLAK. Alasan: ${reason}`);
    }

    setRejectingItem(null);
    setRejectionReasonInput('');
  };

  // Compile Unified Queue Items
  const allQueueItems: Array<{
    id: string;
    type: 'TEAM_REGISTRATION' | 'FEATURE_REC' | 'BET' | 'TOPUP' | 'WITHDRAWAL' | 'CUSTOM';
    categoryLabel: string;
    title: string;
    payerName: string;
    payerPhone: string;
    amount: number;
    proofUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    statusText: string;
    createdAt: string;
    rejectionReason?: string;
    rawItem: any;
  }> = [];

  // 1. Teams (FF & MLBB)
  registeredTeams.forEach(t => {
    const st = t.status === 'Sah' ? 'APPROVED' : t.status === 'Gagal' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: t.id,
      type: 'TEAM_REGISTRATION',
      categoryLabel: t.game === 'FF' ? 'Pendaftaran Free Fire' : 'Pendaftaran Mobile Legends',
      title: `Tim: ${t.teamName} (Slot #${t.slotNumber})`,
      payerName: t.captainName,
      payerPhone: t.captainPhone,
      amount: parseInt((t.paymentAmount || '50000').replace(/\D/g, ''), 10) || 50000,
      proofUrl: t.paymentProofUrl,
      status: st,
      statusText: t.status === 'Sah' ? 'SAH' : t.status === 'Gagal' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: t.registeredAt,
      rawItem: t
    });
  });

  // 2. Feature Recommendations
  (config.featureRecommendations || []).forEach(r => {
    const st = r.status === 'DIPROSES' || r.status === 'BERHASIL_DITAMBAHKAN' ? 'APPROVED' : r.status === 'DITOLAK' || r.status === 'TIDAK_DAPAT_DIPROSES' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: r.id,
      type: 'FEATURE_REC',
      categoryLabel: 'Rekomendasi Fitur',
      title: `Usulan: "${r.featureText.substring(0, 40)}..."`,
      payerName: r.userName,
      payerPhone: '-',
      amount: r.fee || 5000,
      status: st,
      statusText: st === 'APPROVED' ? 'DITERIMA' : st === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: r.createdAt,
      rejectionReason: r.adminReason,
      rawItem: r
    });
  });

  // 3. Bets (QRIS Unpaid)
  bets.filter(b => b.paymentMethod === 'qris').forEach(b => {
    const st = b.status === 'Dikonfirmasi' ? 'APPROVED' : b.status === 'Dibatalkan' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: b.id,
      type: 'BET',
      categoryLabel: 'Taruhan Match (QRIS)',
      title: `Match: ${b.matchTitle} (Pilih: ${b.pickedTeam})`,
      payerName: b.userName,
      payerPhone: b.userPhone,
      amount: b.betAmount,
      proofUrl: b.paymentProofUrl,
      status: st,
      statusText: b.status === 'Dikonfirmasi' ? 'TERPASANG' : b.status === 'Dibatalkan' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: b.placedAt,
      rawItem: b
    });
  });

  // 4. Top Up Requests
  (userWallet?.topUpHistory || []).forEach(top => {
    const st = top.status === 'Approved' ? 'APPROVED' : top.status === 'Rejected' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: top.id,
      type: 'TOPUP',
      categoryLabel: 'Top Up Saldo',
      title: `Top Up Saldo Akun Member`,
      payerName: top.userName,
      payerPhone: top.userPhone,
      amount: top.amount,
      proofUrl: top.paymentProofUrl,
      status: st,
      statusText: st === 'APPROVED' ? 'SAH / MASUK' : st === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: top.requestedAt,
      rejectionReason: top.rejectionReason,
      rawItem: top
    });
  });

  // 5. Withdrawal Requests
  (userWallet?.withdrawalHistory || []).forEach(w => {
    const st = w.status === 'Approved' ? 'APPROVED' : w.status === 'Rejected' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: w.id,
      type: 'WITHDRAWAL',
      categoryLabel: 'Penarikan Saldo',
      title: `Tujuan: ${w.method} - ${w.accountNumber} (${w.accountName})`,
      payerName: w.accountName,
      payerPhone: w.userPhone || '-',
      amount: w.amount,
      status: st,
      statusText: st === 'APPROVED' ? 'SELESAI DITRANSFER' : st === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: w.requestedAt,
      rejectionReason: w.rejectionReason,
      rawItem: w
    });
  });

  // 6. Custom Payment Transactions
  (paymentConfig.customPaymentTransactions || []).forEach(ctx => {
    const st = ctx.status === 'Sah' ? 'APPROVED' : ctx.status === 'Ditolak' ? 'REJECTED' : 'PENDING';
    allQueueItems.push({
      id: ctx.id,
      type: 'CUSTOM',
      categoryLabel: `Custom: ${ctx.paymentTypeName}`,
      title: `Pembayaran ${ctx.paymentTypeName}`,
      payerName: ctx.userName,
      payerPhone: ctx.userPhone,
      amount: ctx.amount,
      proofUrl: ctx.paymentProofUrl,
      status: st,
      statusText: ctx.status === 'Sah' ? 'SAH' : ctx.status === 'Ditolak' ? 'DITOLAK' : 'MENUNGGU KONFIRMASI',
      createdAt: ctx.createdAt,
      rejectionReason: ctx.rejectionReason,
      rawItem: ctx
    });
  });

  // Filter Queue Items
  const filteredQueueItems = allQueueItems.filter(item => {
    const matchCat = queueFilterCategory === 'ALL' || item.type === queueFilterCategory;
    const matchStatus = queueFilterStatus === 'ALL' || item.status === queueFilterStatus;
    const matchSearch = 
      item.payerName.toLowerCase().includes(queueSearchTerm.toLowerCase()) ||
      item.payerPhone.toLowerCase().includes(queueSearchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(queueSearchTerm.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(queueSearchTerm.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const pendingCount = allQueueItems.filter(i => i.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER BAR */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase mb-2">
            <CreditCard className="w-4 h-4" />
            <span>SISTEM METODE PEMBAYARAN MANUAL & QRIS TERPISAH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            💰 KELOLA METODE PEMBAYARAN & VERIFIKASI ADMIN
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Semua pembayaran wajib dikonfirmasi manual oleh Admin. Setiap kategori pembayaran memiliki kode QRIS dan nominal tersendiri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAllConfig(config, 'Seluruh pengaturan metode pembayaran berhasil disimpan!')}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center gap-2 shrink-0 cursor-pointer active:scale-98 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setSubTab('qris-6-options')}
          className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            subTab === 'qris-6-options'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-xl shadow-orange-950/40'
              : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>6 Opsi QRIS Terpisah & Biaya</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('verification-queue')}
          className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            subTab === 'verification-queue'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-xl shadow-emerald-950/40'
              : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Antrean Verifikasi Admin ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('ewallet-bank')}
          className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            subTab === 'ewallet-bank'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-xl shadow-blue-950/40'
              : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>E-Wallet & Transfer Bank</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: 6 OPSI QRIS TERPISAH & BIAYA */}
      {/* ========================================================================= */}
      {subTab === 'qris-6-options' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* PETUNJUK UTAMA */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border-2 border-amber-500/40 p-4 sm:p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>ATURAN UTAMA SISTEM PEMBAYARAN:</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside leading-relaxed">
              <li>Setiap jenis pembayaran memiliki <strong className="text-white">QRIS SENDIRI</strong> yang terpisah dan tidak tertukar.</li>
              <li>QRIS <strong className="text-amber-300">HANYA MUNCUL</strong> setelah pengguna menekan tombol <span className="text-white font-bold underline">[💳 BAYAR SEKARANG] / [💳 BAYAR & DAFTAR]</span>.</li>
              <li>Semua pembayaran wajib dikonfirmasi Admin (Status: <span className="text-amber-300 font-bold">⏳ MENUNGGU</span> → <span className="text-emerald-400 font-bold">✅ SAH</span> / <span className="text-red-400 font-bold">❌ DITOLAK</span>).</li>
            </ul>
          </div>

          {/* GLOBAL NMID & HOLDER CONFIG */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>PENGATURAN IDENTITAS MERCHANT QRIS (DEFAULT)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-bold">NMID QRIS Official:</label>
                <input
                  type="text"
                  value={paymentConfig.qrisNmid || 'ID1025383919053'}
                  onChange={(e) => updatePaymentConfig({ qrisNmid: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-bold">Atas Nama Merchant QRIS:</label>
                <input
                  type="text"
                  value={paymentConfig.qrisHolder || 'DEXZ STORE / HUNTERS'}
                  onChange={(e) => updatePaymentConfig({ qrisHolder: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 1 — PENDAFTARAN TURNAMEN FREE FIRE */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-orange-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">OPSI 1</span>
                  <h4 className="text-base font-black text-white uppercase">PENDAFTARAN TURNAMEN FREE FIRE</h4>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                Biaya: {formatRupiah(paymentConfig.feeFf || 50000)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5 uppercase">
                    1. Nominal Biaya Pendaftaran FF (Rp):
                  </label>
                  <input
                    type="number"
                    value={paymentConfig.feeFf || 50000}
                    onChange={(e) => updatePaymentConfig({ feeFf: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Nominal ini otomatis muncul di formulir pendaftaran Free Fire.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-bold block uppercase">
                    2. Upload Barcode QRIS Khusus Free Fire:
                  </label>

                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-orange-500/50 rounded-2xl p-4 cursor-pointer text-xs text-orange-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS Khusus FF (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisFfImageUrl', 'Gambar QRIS Khusus Free Fire berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-1">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Atau Masukkan URL Online Gambar QRIS FF:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/qris-ff.png"
                      value={paymentConfig.qrisFfImageUrl || ''}
                      onChange={(e) => updatePaymentConfig({ qrisFfImageUrl: e.target.value })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {paymentConfig.qrisFfImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updatePaymentConfig({ qrisFfImageUrl: '' });
                        showNotification('QRIS Khusus FF direset ke default.');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                    >
                      Reset QRIS Khusus FF ke Default
                    </button>
                  )}
                </div>
              </div>

              {/* LIVE PREVIEW QRIS FF */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Pratinjau QRIS Khusus Free Fire:</span>
                <QrisDisplay 
                  game="FF" 
                  category="FF" 
                  qrisNmid={paymentConfig.qrisNmid} 
                  qrisImageUrl={paymentConfig.qrisFfImageUrl || paymentConfig.qrisImageUrl} 
                  customFee={formatRupiah(paymentConfig.feeFf || 50000)}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 2 — PENDAFTARAN TURNAMEN MOBILE LEGENDS */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">OPSI 2</span>
                  <h4 className="text-base font-black text-white uppercase">PENDAFTARAN TURNAMEN MOBILE LEGENDS</h4>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                Biaya: {formatRupiah(paymentConfig.feeMlbb || 50000)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5 uppercase">
                    1. Nominal Biaya Pendaftaran MLBB (Rp):
                  </label>
                  <input
                    type="number"
                    value={paymentConfig.feeMlbb || 50000}
                    onChange={(e) => updatePaymentConfig({ feeMlbb: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Nominal ini dapat diatur berbeda dari Free Fire.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-bold block uppercase">
                    2. Upload Barcode QRIS Khusus Mobile Legends:
                  </label>

                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-cyan-500/50 rounded-2xl p-4 cursor-pointer text-xs text-cyan-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS Khusus MLBB (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisMlbbImageUrl', 'Gambar QRIS Khusus Mobile Legends berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-1">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Atau Masukkan URL Online Gambar QRIS MLBB:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/qris-mlbb.png"
                      value={paymentConfig.qrisMlbbImageUrl || ''}
                      onChange={(e) => updatePaymentConfig({ qrisMlbbImageUrl: e.target.value })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {paymentConfig.qrisMlbbImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updatePaymentConfig({ qrisMlbbImageUrl: '' });
                        showNotification('QRIS Khusus MLBB direset ke default.');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                    >
                      Reset QRIS Khusus MLBB ke Default
                    </button>
                  )}
                </div>
              </div>

              {/* LIVE PREVIEW QRIS MLBB */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Pratinjau QRIS Khusus Mobile Legends:</span>
                <QrisDisplay 
                  game="MLBB" 
                  category="MLBB" 
                  qrisNmid={paymentConfig.qrisNmid} 
                  qrisImageUrl={paymentConfig.qrisMlbbImageUrl || paymentConfig.qrisImageUrl} 
                  customFee={formatRupiah(paymentConfig.feeMlbb || 50000)}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 3 — PENDAFTARAN TURNAMEN MENDATANG */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">OPSI 3</span>
                  <h4 className="text-base font-black text-white uppercase">PENDAFTARAN TURNAMEN MENDATANG</h4>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                Biaya: {formatRupiah(paymentConfig.feeUpcoming || 50000)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5 uppercase">
                    1. Nominal Biaya Turnamen Mendatang (Rp):
                  </label>
                  <input
                    type="number"
                    value={paymentConfig.feeUpcoming || 50000}
                    onChange={(e) => updatePaymentConfig({ feeUpcoming: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-bold block uppercase">
                    2. Upload Barcode QRIS Khusus Turnamen Mendatang:
                  </label>

                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-purple-500/50 rounded-2xl p-4 cursor-pointer text-xs text-purple-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS Mendatang (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisUpcomingImageUrl', 'Gambar QRIS Khusus Turnamen Mendatang berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-1">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Atau Masukkan URL Online Gambar QRIS Mendatang:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/qris-upcoming.png"
                      value={paymentConfig.qrisUpcomingImageUrl || ''}
                      onChange={(e) => updatePaymentConfig({ qrisUpcomingImageUrl: e.target.value })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW QRIS UPCOMING */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Pratinjau QRIS Turnamen Mendatang:</span>
                <QrisDisplay 
                  category="UPCOMING" 
                  qrisNmid={paymentConfig.qrisNmid} 
                  qrisImageUrl={paymentConfig.qrisUpcomingImageUrl || paymentConfig.qrisImageUrl} 
                  customFee={formatRupiah(paymentConfig.feeUpcoming || 50000)}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 4 — REKOMENDASI FITUR / MENU BARU */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-yellow-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-yellow-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">OPSI 4</span>
                  <h4 className="text-base font-black text-white uppercase">REKOMENDASI FITUR / MENU BARU</h4>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
                Biaya: {formatRupiah(paymentConfig.feeRecommendation || 5000)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5 uppercase">
                    1. Nominal Biaya Pengajuan Rekomendasi (Rp):
                  </label>
                  <input
                    type="number"
                    value={paymentConfig.feeRecommendation || 5000}
                    onChange={(e) => updatePaymentConfig({ feeRecommendation: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-yellow-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Biaya administrasi saat pengguna mengajukan rekomendasi menu/fitur baru.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-bold block uppercase">
                    2. Upload Barcode QRIS Khusus Rekomendasi Fitur:
                  </label>

                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-yellow-500/50 rounded-2xl p-4 cursor-pointer text-xs text-yellow-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS Rekomendasi (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisRecommendationImageUrl', 'Gambar QRIS Khusus Rekomendasi Fitur berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-1">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Atau Masukkan URL Online Gambar QRIS Rekomendasi:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/qris-rekomendasi.png"
                      value={paymentConfig.qrisRecommendationImageUrl || ''}
                      onChange={(e) => updatePaymentConfig({ qrisRecommendationImageUrl: e.target.value })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW QRIS RECOMMENDATION */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Pratinjau QRIS Rekomendasi Fitur:</span>
                <QrisDisplay 
                  category="RECOMMENDATION" 
                  qrisNmid={paymentConfig.qrisNmid} 
                  qrisImageUrl={paymentConfig.qrisRecommendationImageUrl || paymentConfig.qrisImageUrl} 
                  customFee={formatRupiah(paymentConfig.feeRecommendation || 5000)}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 5 — PASANG TARUHAN (SALDO TIDAK CUKUP) */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">OPSI 5</span>
                  <h4 className="text-base font-black text-white uppercase">PASANG TARUHAN (SALDO TIDAK CUKUP)</h4>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                Min: {formatRupiah(paymentConfig.minBetAmount || 1000)} - Max: {formatRupiah(paymentConfig.maxBetAmount || 1000000)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-300 font-bold block mb-1 uppercase">
                      Minimal Taruhan (Rp):
                    </label>
                    <input
                      type="number"
                      value={paymentConfig.minBetAmount || 1000}
                      onChange={(e) => updatePaymentConfig({ minBetAmount: parseInt(e.target.value, 10) || 1000 })}
                      className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-300 font-bold block mb-1 uppercase">
                      Maksimal Taruhan (Rp):
                    </label>
                    <input
                      type="number"
                      value={paymentConfig.maxBetAmount || 1000000}
                      onChange={(e) => updatePaymentConfig({ maxBetAmount: parseInt(e.target.value, 10) || 1000000 })}
                      className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
                  💡 <strong>Catatan Khusus:</strong> QRIS ini HANYA muncul jika saldo pengguna tidak cukup saat memasang taruhan. Jika saldo akun pengguna cukup, taruhan langsung terpasang dari saldo tanpa bayar QRIS.
                </div>

                <div className="space-y-2">
                  <label className="text-neutral-300 font-bold block uppercase">
                    Upload Barcode QRIS Khusus Taruhan Match:
                  </label>

                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-emerald-500/50 rounded-2xl p-4 cursor-pointer text-xs text-emerald-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS Taruhan (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisBetImageUrl', 'Gambar QRIS Khusus Taruhan berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-1">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-bold">Atau Masukkan URL Online Gambar QRIS Taruhan:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/qris-taruhan.png"
                      value={paymentConfig.qrisBetImageUrl || ''}
                      onChange={(e) => updatePaymentConfig({ qrisBetImageUrl: e.target.value })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW QRIS BET */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Pratinjau QRIS Khusus Taruhan:</span>
                <QrisDisplay 
                  category="BET" 
                  qrisNmid={paymentConfig.qrisNmid} 
                  qrisImageUrl={paymentConfig.qrisBetImageUrl || paymentConfig.qrisImageUrl} 
                  customFee="Sesuai Nominal Taruhan"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📌 OPSI 6 — JENIS PEMBAYARAN TAMBAHAN (CUSTOM PAYMENT TYPES) */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">OPSI 6</span>
                  <h4 className="text-base font-black text-white uppercase">JENIS PEMBAYARAN TAMBAHAN (CUSTOM PAYMENT)</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jenis Pembayaran Baru</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Admin dapat menambahkan jenis pembayaran apa saja (misal: Pendaftaran Scrimmage Khusus, Merchandise Kaos Turnamen, Biaya Unban, Tiket VIP, dll).
            </p>

            {/* LIST CUSTOM PAYMENT TYPES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(paymentConfig.customPaymentTypes || []).map((c) => (
                <div key={c.id} className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                    <div>
                      <span className="text-[10px] text-blue-400 font-bold uppercase">{c.category || 'Umum'}</span>
                      <h5 className="text-sm font-black text-white uppercase">{c.name}</h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCustomPaymentType(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer ${
                        c.isEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {c.isEnabled ? '✅ AKTIF' : '❌ NONAKTIF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Nominal Wajib:</span>
                    <strong className="text-amber-400 font-mono text-sm">{formatRupiah(c.amount)}</strong>
                  </div>

                  {c.description && (
                    <p className="text-[11px] text-neutral-400 leading-relaxed bg-[#0a0a0a] p-2 rounded-lg">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {c.id}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomPaymentType(c.id, c.name)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PENGATURAN TAMBAHAN: TOP UP SALDO, PENARIKAN, & DONASI */}
          {/* ========================================================================= */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
            <h4 className="text-sm font-black text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>PENGATURAN TOP UP SALDO, PENARIKAN, & DONASI SAWERIA</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* TOP UP SALDO */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                  <Coins className="w-4 h-4" />
                  <span>TOP UP SALDO PENGGUNA</span>
                </div>
                <div className="text-xs space-y-2">
                  <label className="text-neutral-400 block font-bold">Minimal Top Up (Rp):</label>
                  <input
                    type="number"
                    value={paymentConfig.minTopUpAmount || 10000}
                    onChange={(e) => updatePaymentConfig({ minTopUpAmount: parseInt(e.target.value, 10) || 10000 })}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                  <label className="flex items-center justify-center gap-1.5 bg-[#0a0a0a] hover:bg-neutral-800 border border-dashed border-amber-500/50 rounded-xl p-2.5 cursor-pointer text-[11px] text-amber-400 font-bold transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QRIS Khusus Top Up</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForField(e, 'qrisTopupImageUrl', 'QRIS Khusus Top Up berhasil diunggah!')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* PENARIKAN SALDO */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                  <Building className="w-4 h-4" />
                  <span>PENARIKAN SALDO (WITHDRAWAL)</span>
                </div>
                <div className="text-xs space-y-2 text-neutral-300">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    ❌ <strong>TIDAK ADA QRIS.</strong> Pengguna menerima uang. Pengguna mengajukan permintaan & Admin mentransfer manual ke rekening/E-Wallet pengguna.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-bold">
                    Konfirmasi dilakukan di tab "Antrean Verifikasi Admin".
                  </p>
                </div>
              </div>

              {/* DONASI SAWERIA */}
              <div className="bg-[#050505] p-4 rounded-2xl border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>DONASI / DUKUNGAN (SAWERIA)</span>
                </div>
                <div className="text-xs space-y-2 text-neutral-300">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    ❌ <strong>TIDAK PAKAI QRIS DI WEBSITE.</strong> Tidak perlu konfirmasi Admin. Langsung terhubung ke URL resmi Saweria:
                  </p>
                  <a
                    href="https://saweria.co/Hntrs"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center p-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs hover:text-white"
                  >
                    https://saweria.co/Hntrs ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: ANTREAN VERIFIKASI PEMBAYARAN ADMIN (MANUAL) */}
      {/* ========================================================================= */}
      {subTab === 'verification-queue' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>ANTREAN & DAFTAR REKAP VERIFIKASI PEMBAYARAN</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tinjau bukti pembayaran masuk, setujui (Sah), atau tolak dengan mencantumkan alasan penolakan resmi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-black">
                  ⏳ {pendingCount} Menunggu Konfirmasi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari nama pengirim / no WA / tim..."
                  value={queueSearchTerm}
                  onChange={(e) => setQueueSearchTerm(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* FILTER CATEGORY */}
              <select
                value={queueFilterCategory}
                onChange={(e) => setQueueFilterCategory(e.target.value)}
                className="bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Kategori Transaksi</option>
                <option value="TEAM_REGISTRATION">Pendaftaran Tim (FF & MLBB)</option>
                <option value="FEATURE_REC">Rekomendasi Fitur</option>
                <option value="BET">Taruhan Match (QRIS)</option>
                <option value="TOPUP">Top Up Saldo</option>
                <option value="WITHDRAWAL">Penarikan Saldo</option>
                <option value="CUSTOM">Pembayaran Tambahan</option>
              </select>

              {/* FILTER STATUS */}
              <select
                value={queueFilterStatus}
                onChange={(e) => setQueueFilterStatus(e.target.value)}
                className="bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">⏳ Menunggu Konfirmasi</option>
                <option value="APPROVED">✅ Sah / Diterima</option>
                <option value="REJECTED">❌ Ditolak</option>
              </select>
            </div>
          </div>

          {/* QUEUE ITEMS LIST */}
          <div className="space-y-3">
            {filteredQueueItems.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-10 text-center space-y-2">
                <Clock className="w-10 h-10 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-black text-white uppercase">Tidak ada transaksi ditemukan</h4>
                <p className="text-xs text-neutral-500">Sesuaikan filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              filteredQueueItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`bg-[#0f0f0f] border rounded-3xl p-4 sm:p-5 transition-all space-y-3 ${
                    item.status === 'PENDING'
                      ? 'border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : item.status === 'APPROVED'
                      ? 'border-emerald-500/30'
                      : 'border-red-500/30 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                        {item.categoryLabel}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase">{item.title}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : item.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-neutral-400">Pengirim / Pemilik:</p>
                      <p className="font-bold text-white">{item.payerName} ({item.payerPhone})</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-neutral-400">Nominal Transaksi:</p>
                      <p className="font-mono font-black text-amber-400 text-sm">{formatRupiah(item.amount)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-neutral-400">Waktu Pengajuan:</p>
                      <p className="font-mono text-neutral-300">{item.createdAt}</p>
                    </div>
                  </div>

                  {/* PROOF IMAGE & REJECTION NOTE */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center gap-3">
                      {item.proofUrl ? (
                        <button
                          type="button"
                          onClick={() => setZoomedProofUrl(item.proofUrl || null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Foto Bukti Transfer 📸</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-500 italic">Bukti foto tidak dilampirkan</span>
                      )}

                      {item.rejectionReason && (
                        <span className="text-[11px] text-red-300 font-bold">
                          Alasan Tolak: "{item.rejectionReason}"
                        </span>
                      )}
                    </div>

                    {/* ACTION BUTTONS (SAH / TOLAK) */}
                    <div className="flex items-center gap-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.type === 'TEAM_REGISTRATION') handleApproveTeam(item.rawItem);
                              else if (item.type === 'FEATURE_REC') handleApproveRecommendation(item.rawItem);
                              else if (item.type === 'BET') handleApproveBet(item.rawItem);
                              else if (item.type === 'TOPUP') handleApproveTopUp(item.rawItem);
                              else if (item.type === 'WITHDRAWAL') handleApproveWithdrawal(item.rawItem);
                              else if (item.type === 'CUSTOM') handleApproveCustomPayment(item.rawItem);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>✅ Konfirmasi SAH</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRejectingItem({
                                id: item.id,
                                type: item.type,
                                title: item.title,
                                recipientPhone: item.payerPhone
                              });
                            }}
                            className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>❌ Tolak Transaksi</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: E-WALLET & TRANSFER BANK PROVIDERS */}
      {/* ========================================================================= */}
      {subTab === 'ewallet-bank' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* E-WALLET PROVIDERS */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h4 className="font-black text-sm text-white uppercase">PENYEDIA E-WALLET (DANA, OVO, GOPAY, SHOPEEPAY, LINKAJA)</h4>
              </div>

              <button
                type="button"
                onClick={() => updatePaymentConfig({ ewalletEnabled: !paymentConfig.ewalletEnabled })}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                  paymentConfig.ewalletEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {paymentConfig.ewalletEnabled ? '✅ TAMPILKAN' : '❌ SEMBUNYIKAN'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(paymentConfig.ewalletProviders || []).map((p, idx) => (
                <div key={p.id} className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-black text-xs text-white uppercase">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = paymentConfig.ewalletProviders.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item);
                        updatePaymentConfig({ ewalletProviders: updated });
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {p.enabled ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-0.5">Nomor HP:</label>
                      <input
                        type="text"
                        value={p.number}
                        onChange={(e) => {
                          const updated = paymentConfig.ewalletProviders.map((item, i) => i === idx ? { ...item, number: e.target.value } : item);
                          updatePaymentConfig({ ewalletProviders: updated });
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-0.5">Atas Nama:</label>
                      <input
                        type="text"
                        value={p.holder}
                        onChange={(e) => {
                          const updated = paymentConfig.ewalletProviders.map((item, i) => i === idx ? { ...item, holder: e.target.value } : item);
                          updatePaymentConfig({ ewalletProviders: updated });
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BANK PROVIDERS */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <h4 className="font-black text-sm text-white uppercase">TRANSFER BANK (BCA, MANDIRI, BRI, BNI, BSI, JAGO, SEABANK, DLL)</h4>
              </div>

              <button
                type="button"
                onClick={() => updatePaymentConfig({ bankEnabled: !paymentConfig.bankEnabled })}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                  paymentConfig.bankEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {paymentConfig.bankEnabled ? '✅ TAMPILKAN' : '❌ SEMBUNYIKAN'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(paymentConfig.bankProviders || []).map((b, idx) => (
                <div key={b.id} className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-black text-xs text-white uppercase">{b.name} ({b.code})</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = paymentConfig.bankProviders.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item);
                        updatePaymentConfig({ bankProviders: updated });
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {b.enabled ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-0.5">No. Rekening:</label>
                      <input
                        type="text"
                        value={b.number}
                        onChange={(e) => {
                          const updated = paymentConfig.bankProviders.map((item, i) => i === idx ? { ...item, number: e.target.value } : item);
                          updatePaymentConfig({ bankProviders: updated });
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-0.5">Atas Nama Rekening:</label>
                      <input
                        type="text"
                        value={b.holder}
                        onChange={(e) => {
                          const updated = paymentConfig.bankProviders.map((item, i) => i === idx ? { ...item, holder: e.target.value } : item);
                          updatePaymentConfig({ bankProviders: updated });
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH JENIS PEMBAYARAN BARU */}
      {/* ========================================================================= */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Tambah Jenis Pembayaran Baru</span>
            </h3>

            <form onSubmit={handleAddCustomPaymentType} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">Nama Pembayaran: *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pendaftaran Fast Scrim / Jersey Official"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Kategori:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Scrim / Merch"
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Nominal (Rp): *</label>
                  <input
                    type="number"
                    required
                    value={newCustomAmount}
                    onChange={(e) => setNewCustomAmount(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white font-mono focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat tentang pembayaran ini..."
                  value={newCustomDescription}
                  onChange={(e) => setNewCustomDescription(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">URL Gambar QRIS Khusus (Opsional):</label>
                <input
                  type="text"
                  placeholder="https://example.com/qris-custom.png"
                  value={newCustomQrisUrl}
                  onChange={(e) => setNewCustomQrisUrl(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-white font-mono focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase"
                >
                  Simpan Jenis Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT ALASAN PENOLAKAN RESMI */}
      {/* ========================================================================= */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f0f0f] border border-red-500/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-400 font-black text-sm uppercase">
              <XCircle className="w-5 h-5" />
              <span>Tolak Transaksi Pembayaran</span>
            </div>

            <p className="text-xs text-neutral-300">
              Anda akan menolak transaksi untuk: <strong className="text-white">{rejectingItem.title}</strong>. Mohon isi alasan penolakan secara rinci untuk pengguna.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-400 uppercase">Alasan Penolakan: *</label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Contoh: Bukti transfer buram / nominal tidak sesuai / mutasi rekening tidak masuk..."
                className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeRejection}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shadow-lg shadow-red-950/50"
              >
                Konfirmasi Tolak Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM PROOF MODAL */}
      {zoomedProofUrl && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomedProofUrl(null)}
        >
          <div className="bg-[#050505] p-4 rounded-3xl max-w-lg w-full border border-neutral-700 shadow-2xl space-y-3 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-black text-white uppercase block">Foto Bukti Transfer Pembayaran</span>
            <img src={zoomedProofUrl} alt="Bukti Transfer" className="w-full max-h-[70vh] object-contain rounded-2xl mx-auto" />
            <button
              type="button"
              onClick={() => setZoomedProofUrl(null)}
              className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
