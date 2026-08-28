import React, { useState } from 'react';
import { 
  FileText, Send, Mail, CheckCircle2, ShieldCheck, Flame, Swords, User, Phone, Users, 
  AlertCircle, Lock, Edit3, CreditCard, Copy, ExternalLink, QrCode, Building, 
  Smartphone, MessageSquare, Check, Upload, Image as ImageIcon, FileCheck, Camera, Trash2,
  Sparkles, DollarSign
} from 'lucide-react';
import { RegisteredTeam, SiteConfig, TabType, EwalletProvider, BankProvider } from '../../types';
import { saveSingleTeamToFirestore } from '../../lib/firebaseStore';
import { notifyAdminEvent } from '../../lib/notificationService';
import { QrisDisplay } from '../QrisDisplay';
import { MlbbDraftPickSection } from '../MlbbDraftPickSection';
import { SaweriaPaymentModal } from '../SaweriaPaymentModal';
import { processTournamentPaymentSuccess, formatRupiah, SAWERIA_URL } from '../../lib/saweriaService';
import { isGameRegistrationOpen, isGameTournamentAdded } from '../../utils/tournamentStatus';

interface FormPendaftaranViewProps {
  siteConfig: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
  initialGame?: 'FF' | 'MLBB';
}

export const FormPendaftaranView: React.FC<FormPendaftaranViewProps> = ({
  siteConfig,
  setSiteConfig = () => {},
  registeredTeams,
  setRegisteredTeams,
  setActiveTab,
  isAdmin = false,
  initialGame = 'FF',
}) => {
  const [game, setGame] = useState<'FF' | 'MLBB'>(initialGame);

  React.useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
    }
  }, [initialGame]);

  const [teamName, setTeamName] = useState(() => {
    try { return localStorage.getItem('hunters_draft_teamName') || ''; } catch { return ''; }
  });
  const [captainName, setCaptainName] = useState(() => {
    try { return localStorage.getItem('hunters_draft_captainName') || ''; } catch { return ''; }
  });
  const [captainPhone, setCaptainPhone] = useState(() => {
    try { return localStorage.getItem('hunters_draft_captainPhone') || ''; } catch { return ''; }
  });

  // Saweria Payment Modal State
  const [showSaweriaModal, setShowSaweriaModal] = useState(false);
  const [teamForSaweria, setTeamForSaweria] = useState<RegisteredTeam | null>(null);

  // Structured player state for Free Fire (5 fields)
  const [ffPlayer1, setFfPlayer1] = useState(() => {
    try { return localStorage.getItem('hunters_draft_ffPlayer1') || ''; } catch { return ''; }
  });
  const [ffPlayer2, setFfPlayer2] = useState(() => {
    try { return localStorage.getItem('hunters_draft_ffPlayer2') || ''; } catch { return ''; }
  });
  const [ffPlayer3, setFfPlayer3] = useState(() => {
    try { return localStorage.getItem('hunters_draft_ffPlayer3') || ''; } catch { return ''; }
  });
  const [ffPlayer4, setFfPlayer4] = useState(() => {
    try { return localStorage.getItem('hunters_draft_ffPlayer4') || ''; } catch { return ''; }
  });
  const [ffCadangan, setFfCadangan] = useState(() => {
    try { return localStorage.getItem('hunters_draft_ffCadangan') || ''; } catch { return ''; }
  });

  // Structured player state for MLBB (6 fields)
  const [mlPlayer1, setMlPlayer1] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlPlayer1') || ''; } catch { return ''; }
  });
  const [mlPlayer2, setMlPlayer2] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlPlayer2') || ''; } catch { return ''; }
  });
  const [mlPlayer3, setMlPlayer3] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlPlayer3') || ''; } catch { return ''; }
  });
  const [mlPlayer4, setMlPlayer4] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlPlayer4') || ''; } catch { return ''; }
  });
  const [mlPlayer5, setMlPlayer5] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlPlayer5') || ''; } catch { return ''; }
  });
  const [mlCadangan, setMlCadangan] = useState(() => {
    try { return localStorage.getItem('hunters_draft_mlCadangan') || ''; } catch { return ''; }
  });

  // Auto-save form draft to localStorage on any field change
  React.useEffect(() => {
    try {
      localStorage.setItem('hunters_draft_teamName', teamName);
      localStorage.setItem('hunters_draft_captainName', captainName);
      localStorage.setItem('hunters_draft_captainPhone', captainPhone);
      localStorage.setItem('hunters_draft_ffPlayer1', ffPlayer1);
      localStorage.setItem('hunters_draft_ffPlayer2', ffPlayer2);
      localStorage.setItem('hunters_draft_ffPlayer3', ffPlayer3);
      localStorage.setItem('hunters_draft_ffPlayer4', ffPlayer4);
      localStorage.setItem('hunters_draft_ffCadangan', ffCadangan);
      localStorage.setItem('hunters_draft_mlPlayer1', mlPlayer1);
      localStorage.setItem('hunters_draft_mlPlayer2', mlPlayer2);
      localStorage.setItem('hunters_draft_mlPlayer3', mlPlayer3);
      localStorage.setItem('hunters_draft_mlPlayer4', mlPlayer4);
      localStorage.setItem('hunters_draft_mlPlayer5', mlPlayer5);
      localStorage.setItem('hunters_draft_mlCadangan', mlCadangan);
    } catch (e) {}
  }, [
    teamName, captainName, captainPhone,
    ffPlayer1, ffPlayer2, ffPlayer3, ffPlayer4, ffCadangan,
    mlPlayer1, mlPlayer2, mlPlayer3, mlPlayer4, mlPlayer5, mlCadangan
  ]);

  // MLBB Draft Pick Tool Toggle State
  const [showDraftPickTool, setShowDraftPickTool] = useState(false);

  // Payment Selection States
  const [paymentCategory, setPaymentCategory] = useState<'qris' | 'ewallet' | 'bank'>('qris');
  const [selectedEwalletId, setSelectedEwalletId] = useState<string>('dana');
  const [selectedBankId, setSelectedBankId] = useState<string>('bca');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Bukti Pembayaran States
  const [paymentProofImg, setPaymentProofImg] = useState<string | null>(null);
  const [paymentFileName, setPaymentFileName] = useState<string>('');
  const [paymentSenderName, setPaymentSenderName] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('50.000');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegisteredTeam | null>(null);

  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti pembayaran terlalu besar (Maksimal 10MB)!');
        return;
      }
      setPaymentFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fallback Payment Config if not defined
  const paymentConfig = siteConfig.paymentConfig || {
    qrisEnabled: true,
    qrisNmid: siteConfig.qrisNmid || 'ID1025383919053',
    qrisHolder: 'DEXZ STORE / HUNTERS',
    ewalletEnabled: true,
    ewalletProviders: [
      { id: 'ovo', name: 'OVO', number: siteConfig.ewalletNumber || '083803540456', holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'ovo://' },
      { id: 'dana', name: 'DANA', number: siteConfig.ewalletNumber || '083803540456', holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'dana://' },
      { id: 'gopay', name: 'GoPay', number: siteConfig.ewalletNumber || '083803540456', holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'gopay://' },
      { id: 'shopeepay', name: 'ShopeePay', number: siteConfig.ewalletNumber || '083803540456', holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'shopeepay://' },
      { id: 'linkaja', name: 'LinkAja', number: siteConfig.ewalletNumber || '083803540456', holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'linkaja://' },
    ],
    bankEnabled: true,
    bankProviders: [
      { id: 'bca', name: 'Bank BCA', code: '014', number: siteConfig.bankBcaNumber || '83148834663', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bca://' },
      { id: 'mandiri', name: 'Bank Mandiri (Livin)', code: '008', number: '1230008314883', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'mandiri.livin://' },
      { id: 'bri', name: 'Bank BRI (BRImo)', code: '002', number: '012301083148831', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'brimo://' },
      { id: 'bni', name: 'Bank BNI Mobile', code: '009', number: '0831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bnimobile://' },
      { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', code: '451', number: '7831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bsimobile://' },
      { id: 'jago', name: 'Bank Jago', code: '542', number: '108314883466', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'jago://' },
      { id: 'seabank', name: 'SeaBank', code: '535', number: '901831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'seabank://' },
      { id: 'blu', name: 'blu by BCA Digital', code: '501', number: '083803540456', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'blu://' },
      { id: 'permata', name: 'Bank Permata', code: '013', number: '8528083148834663', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'permatamobile://' },
      { id: 'danamon', name: 'Bank Danamon', code: '011', number: '003612345678', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'danamon://' },
    ]
  };

  const enabledEwallets = paymentConfig.ewalletProviders.filter(p => p.enabled);
  const enabledBanks = paymentConfig.bankProviders.filter(p => p.enabled);

  const activeEwallet = enabledEwallets.find(e => e.id === selectedEwalletId) || enabledEwallets[0];
  const activeBank = enabledBanks.find(b => b.id === selectedBankId) || enabledBanks[0];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleOpenApp = (appLink: string, providerName: string) => {
    try {
      window.location.href = appLink;
    } catch (e) {
      console.log('Cannot open app directly:', e);
    }
  };

  const formConfig = siteConfig.formConfig || {
    isFormOpen: true,
    targetEmail: 'hunters51community@gmail.com',
    customInstructions: 'Isi formulir berikut dengan teliti. Data pendaftaran tim akan dikirimkan otomatis ke WhatsApp Admin & email panitia.',
    successMessage: 'Pendaftaran Berhasil! Data tim Anda telah dikirimkan ke WhatsApp Admin & email panitia.'
  };

  const targetEmail = formConfig.targetEmail || 'hunters51community@gmail.com';
  const adminWaClean = siteConfig.adminWaClean || '6283148834663';

  // Helper to format payment method title
  const getSelectedPaymentMethodText = () => {
    if (paymentCategory === 'qris') {
      return `QRIS ALL PAYMENT (NMID: ${paymentConfig.qrisNmid || siteConfig.qrisNmid})`;
    } else if (paymentCategory === 'ewallet' && activeEwallet) {
      return `E-Wallet (${activeEwallet.name} - ${activeEwallet.number} a.n ${activeEwallet.holder})`;
    } else if (paymentCategory === 'bank' && activeBank) {
      return `Transfer Bank (${activeBank.name} [Kode: ${activeBank.code}] - ${activeBank.number} a.n ${activeBank.holder})`;
    }
    return 'QRIS ALL PAYMENT';
  };

  const isFfOpen = isGameRegistrationOpen(siteConfig, 'FF');
  const isMlbbOpen = isGameRegistrationOpen(siteConfig, 'MLBB');
  const isCurrentGameOpen = isGameRegistrationOpen(siteConfig, game);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCurrentGameOpen) {
      alert(`⚠️ Maaf, pendaftaran turnamen ${game === 'FF' ? 'Free Fire' : 'Mobile Legends'} saat ini sedang DITUTUP oleh Panitia. Pendaftaran hanya bisa dilakukan jika status dibuka.`);
      return;
    }

    if (!teamName.trim() || !captainName.trim() || !captainPhone.trim()) {
      alert('Nama Tim, Nama Kapten, dan WhatsApp Kapten wajib diisi!');
      return;
    }

    setIsSubmitting(true);

    let rosters: string[] = [];

    if (game === 'FF') {
      rosters = [
        `Pemain 1 / Kapten: ${ffPlayer1.trim() || captainName.trim()}`,
        ffPlayer2.trim() ? `Pemain 2: ${ffPlayer2.trim()}` : '',
        ffPlayer3.trim() ? `Pemain 3: ${ffPlayer3.trim()}` : '',
        ffPlayer4.trim() ? `Pemain 4: ${ffPlayer4.trim()}` : '',
        ffCadangan.trim() ? `Cadangan (1/2 orang): ${ffCadangan.trim()}` : '',
      ].filter(Boolean);
    } else {
      rosters = [
        `Pemain 1 / Kapten: ${mlPlayer1.trim() || captainName.trim()}`,
        mlPlayer2.trim() ? `Pemain 2: ${mlPlayer2.trim()}` : '',
        mlPlayer3.trim() ? `Pemain 3: ${mlPlayer3.trim()}` : '',
        mlPlayer4.trim() ? `Pemain 4: ${mlPlayer4.trim()}` : '',
        mlPlayer5.trim() ? `Pemain 5: ${mlPlayer5.trim()}` : '',
        mlCadangan.trim() ? `Cadangan (1/2 orang): ${mlCadangan.trim()}` : '',
      ].filter(Boolean);
    }

    const selectedPaymentMethod = getSelectedPaymentMethodText();

    const newTeam: RegisteredTeam = {
      id: `team-${Date.now()}`,
      slotNumber: 0, // Slot kosong sampai dikonfirmasi Sah oleh Admin
      game,
      teamName: teamName.trim(),
      captainName: captainName.trim(),
      captainPhone: captainPhone.trim(),
      roster: rosters.length > 0 ? rosters : [`Kapten: ${captainName.trim()}`],
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Menunggu Pembayaran',
      paymentMethod: selectedPaymentMethod,
      paymentProvider: paymentCategory === 'ewallet' ? activeEwallet?.name : paymentCategory === 'bank' ? activeBank?.name : 'QRIS',
      paymentProofUrl: paymentProofImg || undefined,
      paymentSenderName: paymentSenderName.trim() || captainName.trim(),
      paymentAmount: paymentAmount.trim() || '50.000',
      paymentNotes: paymentNotes.trim() || undefined,
      paymentSubmittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setRegisteredTeams(prev => [newTeam, ...prev]);
    saveSingleTeamToFirestore(newTeam);
    notifyAdminEvent(
      'pendaftaran',
      'Pendaftaran Tim Baru',
      `Tim "${newTeam.teamName}" (${newTeam.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}) mendaftar (Status: Menunggu Pembayaran & Konfirmasi Admin). Kapten: ${newTeam.captainName} (${newTeam.captainPhone}).`,
      newTeam
    );
    setSubmittedData(newTeam);
    setIsSubmitting(false);

    // Clear saved form draft upon successful submission
    try {
      const keys = [
        'hunters_draft_teamName', 'hunters_draft_captainName', 'hunters_draft_captainPhone',
        'hunters_draft_ffPlayer1', 'hunters_draft_ffPlayer2', 'hunters_draft_ffPlayer3', 'hunters_draft_ffPlayer4', 'hunters_draft_ffCadangan',
        'hunters_draft_mlPlayer1', 'hunters_draft_mlPlayer2', 'hunters_draft_mlPlayer3', 'hunters_draft_mlPlayer4', 'hunters_draft_mlPlayer5', 'hunters_draft_mlCadangan'
      ];
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}

    // Format WhatsApp direct message to Admin
    const waText = 
      `💳 *KONFIRMASI FORMULIR & BUKTI PEMBAYARAN* 💳\n` +
      `----------------------------------------\n` +
      `• *Game*: ${newTeam.game === 'FF' ? 'Free Fire' : 'Mobile Legends: Bang Bang'}\n` +
      `• *Slot #*: #${newTeam.slotNumber}\n` +
      `• *Nama Tim*: ${newTeam.teamName}\n` +
      `• *Nama Kapten*: ${newTeam.captainName}\n` +
      `• *WA Kapten*: ${newTeam.captainPhone}\n` +
      `• *Metode Bayar*: ${selectedPaymentMethod}\n` +
      `----------------------------------------\n` +
      `📑 *DETAIL BUKTI PEMBAYARAN*:\n` +
      `• *Atas Nama Pengirim*: ${paymentSenderName.trim() || captainName.trim()}\n` +
      `• *Nominal Transfer*: Rp${paymentAmount.trim() || '50.000'}\n` +
      (paymentNotes.trim() ? `• *No. Ref / Catatan*: ${paymentNotes.trim()}\n` : '') +
      `• *Foto Bukti*: ${paymentProofImg ? '📸 TERLAMPIR DI FORMULIR PENDAFTARAN' : '⚠️ Belum Diunggah'}\n` +
      `• *Waktu*: ${newTeam.registeredAt}\n` +
      `----------------------------------------\n` +
      `• *Roster Pemain*:\n${newTeam.roster.map((r, i) => `  ${i+1}. ${r}`).join('\n')}\n` +
      `----------------------------------------\n` +
      `Halo Admin DEXZ STORE / HUNTERS (+${adminWaClean}), berikut data pendaftaran & bukti pembayaran formulir tim kami. Mohon verifikasi & ubah status pendaftaran kami menjadi SAH! Terima kasih.`;

    const waUrl = `https://wa.me/${adminWaClean}?text=${encodeURIComponent(waText)}`;

    // Format Mailto Email to Panitia
    const subject = encodeURIComponent(`[PENDAFTARAN TURNAMEN] ${game} - ${newTeam.teamName}`);
    const emailBody = encodeURIComponent(
      `HALO PANITIA HUNTERS COMMUNITY / DEXZ STORE,\n\n` +
      `Berikut data pendaftaran tim baru:\n` +
      `----------------------------------------\n` +
      `• Game: ${newTeam.game}\n` +
      `• Slot #: ${newTeam.slotNumber}\n` +
      `• Nama Tim: ${newTeam.teamName}\n` +
      `• Nama Kapten: ${newTeam.captainName}\n` +
      `• WA Kapten: ${newTeam.captainPhone}\n` +
      `• Metode Pembayaran: ${selectedPaymentMethod}\n` +
      `• Roster:\n${newTeam.roster.map((r, i) => `  ${i+1}. ${r}`).join('\n')}\n` +
      `• Waktu Daftar: ${newTeam.registeredAt}\n` +
      `----------------------------------------\n` +
      `Mohon verifikasi pembayaran tim kami!`
    );

    // Auto trigger payment app open if selected provider has app link
    if (paymentCategory === 'ewallet' && activeEwallet?.appLink) {
      setTimeout(() => handleOpenApp(activeEwallet.appLink, activeEwallet.name), 1500);
    } else if (paymentCategory === 'bank' && activeBank?.appLink) {
      setTimeout(() => handleOpenApp(activeBank.appLink, activeBank.name), 1500);
    }
  };

  const handleInitiateSaweriaPayment = () => {
    if (!isCurrentGameOpen) {
      alert(`⚠️ Maaf, pendaftaran turnamen ${game === 'FF' ? 'Free Fire' : 'Mobile Legends'} saat ini sedang DITUTUP oleh Panitia. Pendaftaran hanya bisa dilakukan jika status dibuka.`);
      return;
    }

    if (!teamName.trim() || !captainName.trim() || !captainPhone.trim()) {
      alert('Nama Tim, Nama Lengkap Kapten, dan No WhatsApp Kapten wajib diisi terlebih dahulu!');
      return;
    }

    let rosters: string[] = [];
    if (game === 'FF') {
      rosters = [
        `Pemain 1 / Kapten: ${ffPlayer1.trim() || captainName.trim()}`,
        ffPlayer2.trim() ? `Pemain 2: ${ffPlayer2.trim()}` : '',
        ffPlayer3.trim() ? `Pemain 3: ${ffPlayer3.trim()}` : '',
        ffPlayer4.trim() ? `Pemain 4: ${ffPlayer4.trim()}` : '',
        ffCadangan.trim() ? `Cadangan: ${ffCadangan.trim()}` : '',
      ].filter(Boolean);
    } else {
      rosters = [
        `Pemain 1 / Kapten: ${mlPlayer1.trim() || captainName.trim()}`,
        mlPlayer2.trim() ? `Pemain 2: ${mlPlayer2.trim()}` : '',
        mlPlayer3.trim() ? `Pemain 3: ${mlPlayer3.trim()}` : '',
        mlPlayer4.trim() ? `Pemain 4: ${mlPlayer4.trim()}` : '',
        mlPlayer5.trim() ? `Pemain 5: ${mlPlayer5.trim()}` : '',
        mlCadangan.trim() ? `Cadangan: ${mlCadangan.trim()}` : '',
      ].filter(Boolean);
    }

    const tempTeam: RegisteredTeam = {
      id: `team-${Date.now()}`,
      slotNumber: 0,
      game,
      teamName: teamName.trim(),
      captainName: captainName.trim(),
      captainPhone: captainPhone.trim(),
      roster: rosters.length > 0 ? rosters : [`Kapten: ${captainName.trim()}`],
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Menunggu Pembayaran',
      paymentMethod: 'Saweria QRIS Nyata',
      paymentProvider: 'Saweria Hntrs',
      paymentAmount: '50.000',
      paymentSenderName: captainName.trim()
    };

    setTeamForSaweria(tempTeam);
    setShowSaweriaModal(true);
  };

  const handleSaweriaSuccess = async () => {
    if (!teamForSaweria) return;
    const feeAmount = siteConfig.prizePoolConfig?.feePerSlot || 50000;
    const confirmedTeam = await processTournamentPaymentSuccess({
      team: teamForSaweria,
      amount: feeAmount,
      allTeams: registeredTeams,
      siteConfig,
      setRegisteredTeams,
      setSiteConfig
    });

    setSubmittedData(confirmedTeam);
    setShowSaweriaModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950 via-neutral-900 to-amber-950 p-6 sm:p-8 border border-orange-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <FileText className="w-4 h-4" />
            <span className="uppercase tracking-wider">FORMULIR REGISTRASI LANGSUNG</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Send className="w-8 h-8 text-orange-400 shrink-0" />
            <span>📋 FORMULIR PENDAFTARAN TIM</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            {formConfig.customInstructions}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>📲 Data langsung terkirim otomatis ke WhatsApp Admin (<strong className="text-white">+{adminWaClean}</strong>) & email panitia (<strong className="text-white">{targetEmail}</strong>).</span>
          </div>
        </div>
      </div>

      {/* ADMIN EDIT FORM BANNER */}
      {isAdmin && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
          <span className="font-bold flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mode Admin: Anda dapat mengatur email pendaftaran & memilih opsi metode pembayaran yang diizinkan di Panel Admin.</span>
          </span>
          <button
            onClick={() => setActiveTab('admin')}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px] shrink-0"
          >
            Pengaturan Form & Bayar
          </button>
        </div>
      )}

      {/* SUBMISSION SUCCESS CARD */}
      {submittedData && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 p-6 rounded-3xl space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 text-amber-400">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-lg font-black uppercase">PENDAFTARAN TERKIRIM — MENUNGGU KONFIRMASI ADMIN ⏳</h3>
              <p className="text-xs text-amber-300">Data pendaftaran dan bukti pembayaran telah masuk ke antrean verifikasi Admin resmi.</p>
            </div>
          </div>

          <div className="bg-[#050505] p-4 rounded-2xl border border-amber-500/30 space-y-3 text-xs text-neutral-300 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <p className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Ringkasan Data Pendaftaran &amp; Bukti Pembayaran:</span>
              </p>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ⏳ MENUNGGU KONFIRMASI ADMIN
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-[#0a0a0a] p-3 rounded-xl border border-neutral-800">
                <p>• <span className="text-neutral-400">Game:</span> <strong className="text-white">{submittedData.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}</strong></p>
                <p>• <span className="text-neutral-400">Status Slot:</span> <strong className="text-amber-400">{submittedData.status === 'Sah' && (submittedData.slotNumber ?? 0) > 0 ? `Slot #${submittedData.slotNumber} (Sah)` : '⏳ Menunggu Konfirmasi Sah dari Admin (Slot Belum Terisi)'}</strong></p>
                <p>• <span className="text-neutral-400">Nama Tim:</span> <strong className="text-white">{submittedData.teamName}</strong></p>
                <p>• <span className="text-neutral-400">Kapten:</span> <strong className="text-white">{submittedData.captainName} ({submittedData.captainPhone})</strong></p>
                <p>• <span className="text-neutral-400">Metode Bayar:</span> <strong className="text-emerald-400">{submittedData.paymentMethod}</strong></p>
                <p>• <span className="text-neutral-400">Pengirim:</span> <strong className="text-white">{submittedData.paymentSenderName || submittedData.captainName}</strong></p>
                <p>• <span className="text-neutral-400">Nominal Transfer:</span> <strong className="text-emerald-400">Rp{submittedData.paymentAmount || '50.000'}</strong></p>
              </div>

              {submittedData.paymentProofUrl ? (
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-emerald-500/40 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>BUKTI PEMBAYARAN DIUNGGAH:</span>
                  </span>
                  <div className="relative group rounded-lg overflow-hidden border border-neutral-700 bg-black max-h-36 flex items-center justify-center">
                    <img
                      src={submittedData.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="max-h-32 object-contain rounded-md"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-300/80 italic">📸 Foto siap diverifikasi oleh WhatsApp Admin.</p>
                </div>
              ) : (
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-amber-500/30 space-y-1 flex flex-col justify-center">
                  <p className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Bukti Foto Belum Diunggah</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">Anda dapat langsung mengirimkan screenshot transfer pembayaran via WhatsApp ke Admin.</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2 space-y-0.5">
              <p>• Terkirim Ke WhatsApp Admin: <strong className="text-emerald-400">+{adminWaClean}</strong></p>
              <p>• Terkirim Ke Email Panitia: <strong className="text-white">{targetEmail}</strong></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                const waText = 
                  `💳 *KONFIRMASI FORMULIR & BUKTI PEMBAYARAN* 💳\n` +
                  `----------------------------------------\n` +
                  `• *Game*: ${submittedData.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}\n` +
                  `• *Slot #*: #${submittedData.slotNumber}\n` +
                  `• *Nama Tim*: ${submittedData.teamName}\n` +
                  `• *Nama Kapten*: ${submittedData.captainName}\n` +
                  `• *WA Kapten*: ${submittedData.captainPhone}\n` +
                  `• *Metode Bayar*: ${submittedData.paymentMethod}\n` +
                  `• *Atas Nama Pengirim*: ${submittedData.paymentSenderName || submittedData.captainName}\n` +
                  `• *Nominal Transfer*: Rp${submittedData.paymentAmount || '50.000'}\n` +
                  (submittedData.paymentNotes ? `• *Catatan*: ${submittedData.paymentNotes}\n` : '') +
                  `• *Status Bukti Foto*: ${submittedData.paymentProofUrl ? '📸 DILAMPIRKAN PADA FORMULIR' : '⚠️ Belum Diunggah'}\n` +
                  `----------------------------------------\n` +
                  `Halo Admin DEXZ STORE / HUNTERS (+${adminWaClean}), saya mengonfirmasi pendaftaran tim & bukti pembayaran di atas. Mohon verifikasi & ubah status slot kami menjadi SAH!`;
                window.open(`https://wa.me/${adminWaClean}?text=${encodeURIComponent(waText)}`, '_blank');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>📱 Buka WhatsApp Admin (+{adminWaClean}) & Kirim Konfirmasi</span>
            </button>

            {paymentCategory === 'ewallet' && activeEwallet && (
              <button
                onClick={() => handleOpenApp(activeEwallet.appLink, activeEwallet.name)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider"
              >
                <ExternalLink className="w-4 h-4" />
                <span>🚀 Buka Aplikasi {activeEwallet.name} Sekarang</span>
              </button>
            )}

            {paymentCategory === 'bank' && activeBank && (
              <button
                onClick={() => handleOpenApp(activeBank.appLink, activeBank.name)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider"
              >
                <ExternalLink className="w-4 h-4" />
                <span>🚀 Buka Aplikasi {activeBank.name} Sekarang</span>
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedData(null);
                setTeamName('');
                setCaptainName('');
                setCaptainPhone('');
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Daftar Tim Lainnya</span>
            </button>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM */}
      {!submittedData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NOTICE JIKA PENDAFTARAN DITUTUP */}
          {!isCurrentGameOpen && (
            <div className="p-4 bg-red-950/80 border-2 border-red-500/80 rounded-2xl flex items-center gap-3.5 text-red-200 shadow-2xl animate-in fade-in">
              <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/40 text-red-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-black text-red-300 uppercase text-sm">
                  ⚠️ PENDAFTARAN {game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'} SEDANG DITUTUP
                </p>
                <p className="text-red-200/90 leading-relaxed">
                  Pendaftaran untuk game ini sedang ditutup oleh Panitia Turnamen. Anda hanya dapat mendaftar jika status pendaftaran telah dibuka oleh Admin.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: GAME SELECTION */}
          <div className="bg-[#0f0f0f] border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>1. PILIH GAME TURNAMEN</span>
              </h3>
              <span className="text-[11px] text-neutral-400 font-bold">
                Status: <strong className={isCurrentGameOpen ? 'text-emerald-400' : 'text-red-400'}>{isCurrentGameOpen ? '🟢 Pendaftaran Dibuka' : '🔴 Pendaftaran Ditutup'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGame('FF')}
                className={`p-4 rounded-xl border font-black text-xs uppercase flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  game === 'FF'
                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-950/50 scale-[1.02]'
                    : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>FREE FIRE</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isFfOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {isFfOpen ? '🟢 BUKA' : '🔴 TUTUP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setGame('MLBB')}
                className={`p-4 rounded-xl border font-black text-xs uppercase flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  game === 'MLBB'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                    : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-cyan-300" />
                  <span>MLBB</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isMlbbOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {isMlbbOpen ? '🟢 BUKA' : '🔴 TUTUP'}
                </span>
              </button>
            </div>

            {game === 'MLBB' && (
              <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 p-3.5 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-300 border border-cyan-500/40">
                      <Swords className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">FITUR DRAFT PICK & ANALISIS COUNTER HERO MLBB</p>
                      <p className="text-[11px] text-cyan-300">Gunakan simulator draft pick 5v5 & analisis hero penakluk musuh sebelum bertanding.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDraftPickTool(!showDraftPickTool)}
                    className="shrink-0 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>{showDraftPickTool ? '✕ Sembunyikan Draft Pick' : '🎮 Buka Simulator Draft Pick'}</span>
                  </button>
                </div>

                {showDraftPickTool && (
                  <div className="pt-2">
                    <MlbbDraftPickSection />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: TEAM & CAPTAIN DATA */}
          <div className="bg-[#0f0f0f] border border-neutral-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>2. DATA UTAMA TIM & KAPTEN</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nama Tim / Squad: *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: HUNTERS ESPORTS"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nama Lengkap Kapten: *
                </label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="Contoh: Rizky Febrian"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  No. WhatsApp Aktif Kapten: *
                </label>
                <input
                  type="text"
                  required
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  placeholder="Contoh: 083148834663"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: ROSTER PLAYER DATA */}
          {game === 'FF' ? (
            <div className="space-y-4 bg-[#050505] p-5 rounded-2xl border border-orange-500/30">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>🔥 DAFTAR ANGGOTA TIM FREE FIRE (5 FORMULIR)</span>
                </h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded uppercase">4 Inti + 1 Cadangan</span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black text-orange-400 uppercase tracking-wider">PEMAIN INTI:</p>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 1 / Kapten: * (Nickname & ID Game)
                  </label>
                  <input
                    type="text"
                    required
                    value={ffPlayer1}
                    onChange={(e) => setFfPlayer1(e.target.value)}
                    placeholder="Contoh: Dexz (ID: 123456789)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 2: * (Nickname & ID Game)
                  </label>
                  <input
                    type="text"
                    required
                    value={ffPlayer2}
                    onChange={(e) => setFfPlayer2(e.target.value)}
                    placeholder="Contoh: Player2 (ID: 987654321)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 3: * (Nickname & ID Game)
                  </label>
                  <input
                    type="text"
                    required
                    value={ffPlayer3}
                    onChange={(e) => setFfPlayer3(e.target.value)}
                    placeholder="Contoh: Player3 (ID: 456789123)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 4: * (Nickname & ID Game)
                  </label>
                  <input
                    type="text"
                    required
                    value={ffPlayer4}
                    onChange={(e) => setFfPlayer4(e.target.value)}
                    placeholder="Contoh: Player4 (ID: 321654987)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">CADANGAN 1/2 ORANG:</p>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Nama / Nickname Pemain Cadangan:
                  </label>
                  <input
                    type="text"
                    value={ffCadangan}
                    onChange={(e) => setFfCadangan(e.target.value)}
                    placeholder="Contoh: Cadangan1 (ID: 112233) & Cadangan2 (ID: 445566)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-[#050505] p-5 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>⚔️ DAFTAR ANGGOTA TIM MOBILE LEGENDS: BANG-BANG (6 FORMULIR)</span>
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded uppercase">5 Inti + 1 Cadangan</span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">PEMAIN INTI:</p>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 1 / Kapten: * (Nama & Role)
                  </label>
                  <input
                    type="text"
                    required
                    value={mlPlayer1}
                    onChange={(e) => setMlPlayer1(e.target.value)}
                    placeholder="Contoh: Dexz (Role: Jungler / Exp)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 2: * (Nama & Role)
                  </label>
                  <input
                    type="text"
                    required
                    value={mlPlayer2}
                    onChange={(e) => setMlPlayer2(e.target.value)}
                    placeholder="Contoh: Player2 (Role: Midlaner)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 3: * (Nama & Role)
                  </label>
                  <input
                    type="text"
                    required
                    value={mlPlayer3}
                    onChange={(e) => setMlPlayer3(e.target.value)}
                    placeholder="Contoh: Player3 (Role: Goldlaner)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 4: * (Nama & Role)
                  </label>
                  <input
                    type="text"
                    required
                    value={mlPlayer4}
                    onChange={(e) => setMlPlayer4(e.target.value)}
                    placeholder="Contoh: Player4 (Role: Roamer)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pemain 5: * (Nama & Role)
                  </label>
                  <input
                    type="text"
                    required
                    value={mlPlayer5}
                    onChange={(e) => setMlPlayer5(e.target.value)}
                    placeholder="Contoh: Player5 (Role: Explaner)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">CADANGAN 1/2 ORANG:</p>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Nama Pemain Cadangan:
                  </label>
                  <input
                    type="text"
                    value={mlCadangan}
                    onChange={(e) => setMlCadangan(e.target.value)}
                    placeholder="Contoh: Cadangan1 & Cadangan2 (Opsional)"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: METODE PEMBAYARAN SELECTION */}
          <div className="bg-[#0f0f0f] border border-neutral-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  3. PILIH METODE PEMBAYARAN REGISTRASI
                </span>
              </h3>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Otomatis Buka Aplikasi Bayar Saat Dipilih
              </span>
            </div>

            {/* MAIN CATEGORY TOGGLES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(paymentConfig.qrisEnabled) && (
                <button
                  type="button"
                  onClick={() => setPaymentCategory('qris')}
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
                    paymentCategory === 'qris'
                      ? 'bg-orange-600 text-white border-orange-400 shadow-lg'
                      : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-orange-300" />
                  <span>QRIS (ALL BANK & E-WALLET)</span>
                </button>
              )}

              {(paymentConfig.ewalletEnabled && enabledEwallets.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('ewallet');
                    if (activeEwallet?.appLink) {
                      handleOpenApp(activeEwallet.appLink, activeEwallet.name);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
                    paymentCategory === 'ewallet'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                      : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span>E-WALLET ({enabledEwallets.length} OPSI)</span>
                </button>
              )}

              {(paymentConfig.bankEnabled && enabledBanks.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('bank');
                    if (activeBank?.appLink) {
                      handleOpenApp(activeBank.appLink, activeBank.name);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
                    paymentCategory === 'bank'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                      : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-300" />
                  <span>TRANSFER BANK ({enabledBanks.length} OPSI)</span>
                </button>
              )}
            </div>

            {/* DETAIL BY CATEGORY */}
            {paymentCategory === 'qris' && (
              <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-400 uppercase">
                    ⚡ BAYAR VIA BARCODE QRIS {game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'}
                  </span>
                  <span className="text-[10px] text-neutral-400">Scan via DANA, OVO, GoPay, ShopeePay, BCA Mobile, Livin, dll.</span>
                </div>
                <QrisDisplay 
                  game={game} 
                  category={game}
                  qrisNmid={paymentConfig.qrisNmid || siteConfig.qrisNmid} 
                  qrisImageUrl={(game === 'FF' ? paymentConfig.qrisFfImageUrl : paymentConfig.qrisMlbbImageUrl) || paymentConfig.qrisImageUrl || siteConfig.qrisImageUrl} 
                />
              </div>
            )}

            {paymentCategory === 'ewallet' && (
              <div className="space-y-4 bg-[#050505] p-4 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200">
                <p className="text-xs font-black text-emerald-400 uppercase">
                  📱 PILIH PENSEDIA E-WALLET (KLIK UNTUK OTOMATIS BUKA APLIKASI):
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {enabledEwallets.map((ew) => (
                    <button
                      key={ew.id}
                      type="button"
                      onClick={() => {
                        setSelectedEwalletId(ew.id);
                        if (ew.appLink) {
                          handleOpenApp(ew.appLink, ew.name);
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedEwalletId === ew.id
                          ? 'bg-emerald-600/30 border-emerald-400 text-white font-black shadow-md scale-[1.02]'
                          : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{ew.name}</span>
                      <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">Buka App 🚀</span>
                    </button>
                  ))}
                </div>

                {activeEwallet && (
                  <div className="bg-[#0f0f0f] p-4 rounded-xl border border-neutral-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-mono">Nomor HP E-Wallet {activeEwallet.name}:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-black text-emerald-400 font-mono">{activeEwallet.number}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(activeEwallet.number, activeEwallet.name)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            {copiedText === activeEwallet.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText === activeEwallet.name ? 'Tersalin!' : 'Salin Nomor'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1">Atas Nama: <strong className="text-white">{activeEwallet.holder}</strong></p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenApp(activeEwallet.appLink, activeEwallet.name)}
                        className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>🚀 Buka Aplikasi {activeEwallet.name}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentCategory === 'bank' && (
              <div className="space-y-4 bg-[#050505] p-4 rounded-xl border border-blue-500/30 animate-in fade-in duration-200">
                <p className="text-xs font-black text-blue-400 uppercase">
                  🏦 PILIH APLIKASI BANK TRANSFER (KLIK UNTUK OTOMATIS BUKA M-BANKING):
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {enabledBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setSelectedBankId(bank.id);
                        if (bank.appLink) {
                          handleOpenApp(bank.appLink, bank.name);
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedBankId === bank.id
                          ? 'bg-blue-600/30 border-blue-400 text-white font-black shadow-md scale-[1.02]'
                          : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{bank.name}</span>
                      <span className="text-[9px] text-blue-400 font-mono block mt-0.5">Code {bank.code}</span>
                    </button>
                  ))}
                </div>

                {activeBank && (
                  <div className="bg-[#0f0f0f] p-4 rounded-xl border border-neutral-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-mono">No. Rekening {activeBank.name} (Kode Bank: {activeBank.code}):</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-black text-blue-400 font-mono">{activeBank.number}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(activeBank.number, activeBank.name)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            {copiedText === activeBank.name ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText === activeBank.name ? 'Tersalin!' : 'Salin Rekening'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1">Atas Nama Rekening: <strong className="text-white">{activeBank.holder}</strong></p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenApp(activeBank.appLink, activeBank.name)}
                        className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>🚀 Buka App {activeBank.name}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 4: UNGGAH BUKTI PEMBAYARAN TRANSFER & DETAIL KONFIRMASI */}
          <div className="bg-[#0f0f0f] border border-neutral-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>4. UNGGAH BUKTI PEMBAYARAN (FOTO BUKTI / SCREENSHOT TRANSFER)</span>
              </h3>
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                📸 Dikirimkan Langsung ke WhatsApp Admin
              </span>
            </div>

            {/* DRAG & DROP / FILE INPUT ZONE */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-300 uppercase">
                Unggah Bukti Struk / Screenshot Pembayaran:
              </label>

              {!paymentProofImg ? (
                <label className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#050505] hover:bg-emerald-950/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofFileUpload}
                    className="hidden"
                  />
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Klik atau Tarik Foto Bukti Pembayaran ke Sini</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Format: JPG, PNG, WEBP, atau Screenshot (Maksimal 10MB)</p>
                  </div>
                  <span className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] px-4 py-2 rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Gambar Dari Galeri / Kamera</span>
                  </span>
                </label>
              ) : (
                <div className="bg-[#050505] border border-emerald-500/50 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>FOTO BUKTI PEMBAYARAN BERHASIL DIUNGGAH</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProofImg(null);
                        setPaymentFileName('');
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1 bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black max-h-48 w-full sm:w-48 flex items-center justify-center shrink-0">
                      <img
                        src={paymentProofImg}
                        alt="Bukti Transfer Preview"
                        className="max-h-44 object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-xs text-neutral-300 w-full">
                      <p className="font-mono text-emerald-400 font-bold truncate">📁 File: {paymentFileName}</p>
                      <p className="text-[11px] text-neutral-400">Bukti ini telah siap untuk dikirimkan dan diverifikasi oleh Panitia WhatsApp Admin.</p>
                      <div className="pt-2">
                        <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                          ✓ Terlampir Pada Konfirmasi WA Admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SENDER DETAILS FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Atas Nama Pengirim / Rekening: *
                </label>
                <input
                  type="text"
                  value={paymentSenderName}
                  onChange={(e) => setPaymentSenderName(e.target.value)}
                  placeholder="Contoh: Budi Santoso / DANA Budi"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nominal Transfer (Rp):
                </label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="50.000"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  No. Referensi / Catatan Bukti:
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Contoh: Ref 123456 / Bayar Tim FF"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            {isCurrentGameOpen ? (
              <>
                {/* 💰 TOMBOL 1: BAYAR SEKARANG VIA SAWERIA QRIS (OTOMATIS SAH) */}
                <button
                  type="button"
                  onClick={handleInitiateSaweriaPayment}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-orange-950/60 active:scale-98 transition-all uppercase tracking-wider cursor-pointer border-2 border-amber-400/50"
                >
                  <DollarSign className="w-5 h-5 text-yellow-300" />
                  <span>💰 BAYAR SEKARANG (SAWERIA QRIS NYATA — OTOMATIS SAH & TERDAFTAR ✅)</span>
                </button>

                {/* TOMBOL 2: KONFIRMASI MANUAL VIA WA ADMIN */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Konfirmasi Manual & Kirim Bukti Ke WhatsApp Admin (+{adminWaClean})</span>
                </button>
              </>
            ) : (
              <div className="p-5 bg-neutral-900/90 border-2 border-red-500/50 rounded-2xl text-center space-y-2 shadow-xl">
                <div className="flex items-center justify-center gap-2 text-red-400 font-black text-sm uppercase">
                  <Lock className="w-5 h-5" />
                  <span>PENDAFTARAN {game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'} SEDANG DITUTUP</span>
                </div>
                <p className="text-xs text-neutral-400 max-w-lg mx-auto">
                  Pengisian dan pengiriman formulir dinonaktifkan karena panitia sedang menutup pendaftaran turnamen {game === 'FF' ? 'Free Fire' : 'Mobile Legends'}.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-all"
                  >
                    ← Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* SAWERIA PAYMENT MODAL */}
      {showSaweriaModal && teamForSaweria && (
        <SaweriaPaymentModal
          isOpen={showSaweriaModal}
          onClose={() => setShowSaweriaModal(false)}
          title={`Pendaftaran ${teamForSaweria.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}`}
          subtitle={`Pendaftaran Tim: ${teamForSaweria.teamName} (Kapten: ${teamForSaweria.captainName})`}
          type={teamForSaweria.game === 'FF' ? 'FF_REGISTRATION' : 'MLBB_REGISTRATION'}
          amount={siteConfig.prizePoolConfig?.feePerSlot || 50000}
          payerName={teamForSaweria.teamName}
          payerPhone={teamForSaweria.captainPhone}
          referenceId={teamForSaweria.id}
          onConfirmSuccess={handleSaweriaSuccess}
          successButtonText="Lihat Bukti Pendaftaran & Status Sah"
        />
      )}
    </div>
  );
};
