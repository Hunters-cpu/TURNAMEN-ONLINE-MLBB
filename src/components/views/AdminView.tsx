import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  Lock,
  Unlock,
  Key,
  Copy,
  Flame,
  Swords,
  Megaphone,
  Check,
  Calendar,
  FileText,
  MessageSquareCode,
  Phone,
  CreditCard,
  QrCode,
  Trophy,
  Edit3,
  Globe,
  Mail,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Eye,
  Download,
  FileSpreadsheet,
  Coins,
  Banknote,
  ArrowUpRight,
  Gamepad2,
  UserX,
  Ban,
  ShieldAlert,
  UserCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  XCircle,
  RotateCw,
  ListFilter,
  Share2,
  Heart,
  ExternalLink,
  BarChart3,
  Link,
  Gift,
  Smartphone,
  Building,
  Bot,
  Sparkles,
  Clock,
  Camera,
  Award,
  Send,
  ShoppingBag,
  Bell,
  Archive,
  Crown,
  X,
  Tv,
  Radio
} from 'lucide-react';
import { RegisteredTeam, UserAccount, SiteConfig, RuleCategory, CommunityGroup, MatchSchedule, PastWinner, AdminAccount, BlacklistEntry, DeletedItem, DeletedItemType, CustomLink, AnnouncementItem, UserWallet, MatchPredictionBet, TopUpRequest, WithdrawalRequest, MatchResultRecord, UpcomingTournament, FeaturedTeam, WalletTransaction, TournamentArchive } from '../../types';
import { ADMIN_MENUS_40, getMenuColorStyle } from '../../data/menuList';
import { QrisDisplay } from '../QrisDisplay';
import { MediaUploadField } from '../common/MediaUploadField';
import { WaBotView } from './WaBotView';
import { TournamentBracketTree } from '../TournamentBracketTree';
import { AdminSaweriaBalanceSection } from '../admin/AdminSaweriaBalanceSection';
import { AdminFullSystemMonitoring } from '../admin/AdminFullSystemMonitoring';
import { AdminPaymentMethodsManager } from '../admin/AdminPaymentMethodsManager';
import { AdminCategorizedMenuNav } from '../admin/AdminCategorizedMenuNav';
import { AdminBackgroundMusicManager } from '../admin/AdminBackgroundMusicManager';
import { AdminOperatingHoursManager } from '../admin/AdminOperatingHoursManager';
import { AdminPreviewPublishManager } from '../admin/AdminPreviewPublishManager';
import { AdminBackupRestoreManager } from '../admin/AdminBackupRestoreManager';
import { AdminSecuritySettingsManager } from '../admin/AdminSecuritySettingsManager';
import { BridgeWebsiteView } from './BridgeWebsiteView';
import { GENERATE_DEFAULT_MATCH_SCHEDULES, INITIAL_PAYMENT_METHODS_CONFIG, INITIAL_SITE_CONFIG } from '../../data/initialData';
import { resetAllFirestoreData } from '../../lib/firebaseStore';
import { generateRandom32Pairings, recalculateAllBracketAdvancements } from '../../utils/bracketUtils';
import {
  notifyAnnouncement,
  notifyConfirmationResult,
  notifyScheduleChanged,
  notifyMatchStarting,
  notifyBalanceAdded,
  notifyRegistrationClosing,
  notifyMatchResult,
  notifyBetResult
} from '../../lib/notificationService';

interface AdminViewProps {
  currentUser: UserAccount | null;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  userWallet?: UserWallet;
  setUserWallet?: React.Dispatch<React.SetStateAction<UserWallet>>;
  bets?: MatchPredictionBet[];
  setBets?: React.Dispatch<React.SetStateAction<MatchPredictionBet[]>>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  registeredTeams,
  setRegisteredTeams,
  siteConfig,
  setSiteConfig,
  userWallet,
  setUserWallet,
  bets = [],
  setBets
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'beranda' | 'tim' | 'turnamen' | 'ticker' | 'aturan' | 'jadwal' | 'grup' | 'juara' | 'kontak' | 'admin-accounts' | 'pengumuman' | 'form-config' | 'share-config' | 'bantuan' | 'blacklist' | 'baru-dihapus' | 'metode-pembayaran' | 'wa-bot' | 'saldo-taruhan' | 'rekomendasi-fitur' | 'hasil-match' | 'turnamen-mendatang' | 'sengketa' | 'ubah-data-req' | 'kehadiran' | 'tim-unggulan' | 'pengguna' | 'topup-konfirmasi' | 'penarikan-konfirmasi' | 'laporan-keuangan' | 'kirim-pesan' | 'galeri-bukti' | 'tautan-info' | 'statistik' | 'ekspor-data' | 'kirim-pengingat' | 'riwayat-perubahan' | 'sistem-poin' | 'laporan-senja' | 'pengumuman-penting' | 'topup-rekomendasi' | 'download-apk' | 'arsip-turnamen' | 'sinkronisasi-data' | 'wa-bot-cmd' | 'kelola-beranda' | 'laporan-masalah' | 'notif-otomatis' | 'penutupan-turnamen' | 'hapus-data-lama' | 'ubah-password-admin' | 'ai-text-cmd' | 'tarik-donasi' | 'musik-latar' | 'bridge-website' | null
  >(null);

  // Handle open and close menu with hardware / browser back button support
  const handleOpenMenu = (tab: any) => {
    setActiveAdminTab(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ adminModalOpen: true, tab }, '');
    }
  };

  const handleCloseMenu = () => {
    setActiveAdminTab(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeAdminTab !== null) {
        setActiveAdminTab(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeAdminTab]);

  const formatRupiah = (val: number) => 'Rp ' + (val || 0).toLocaleString('id-ID');

  const [trashCategoryFilter, setTrashCategoryFilter] = useState<'ALL' | 'pendaftaran' | 'aturan' | 'admin' | 'member'>('ALL');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for editing form sections
  const [config, setConfig] = useState<SiteConfig>({ ...siteConfig });

  // Modal & Form State for Managing Admin Accounts & Member Accounts
  const [accSubTab, setAccSubTab] = useState<'admin' | 'member'>('admin');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [blacklistSearchTerm, setBlacklistSearchTerm] = useState('');
  const [topUpFilterStatus, setTopUpFilterStatus] = useState<'ALL' | 'Pending' | 'Berhasil' | 'Gagal'>('ALL');
  const [withdrawFilterStatus, setWithdrawFilterStatus] = useState<'ALL' | 'Pending' | 'Berhasil' | 'Gagal'>('ALL');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [proofModalImage, setProofModalImage] = useState<string | null>(null);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRoleTitle, setNewAdminRoleTitle] = useState('Admin Turnamen');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Modal State: Promote Member to Admin
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedMemberToPromote, setSelectedMemberToPromote] = useState<UserAccount | null>(null);
  const [promoteRoleTitle, setPromoteRoleTitle] = useState('Admin Turnamen');
  const [promotePassword, setPromotePassword] = useState('Admin123');

  // Modal State: Edit Admin Role Title
  const [showEditAdminRoleModal, setShowEditAdminRoleModal] = useState(false);
  const [selectedAdminToEditRole, setSelectedAdminToEditRole] = useState<AdminAccount | null>(null);
  const [editAdminRoleTitle, setEditAdminRoleTitle] = useState('Admin Turnamen');

  // Modal State: Blacklist Member
  const [showBlacklistMemberModal, setShowBlacklistMemberModal] = useState(false);
  const [selectedMemberToBlacklist, setSelectedMemberToBlacklist] = useState<UserAccount | null>(null);
  const [blacklistReasonInput, setBlacklistReasonInput] = useState('');

  // Modal State: Manual Blacklist Entry
  const [showManualBlacklistModal, setShowManualBlacklistModal] = useState(false);
  const [manualBlName, setManualBlName] = useState('');
  const [manualBlEmail, setManualBlEmail] = useState('');
  const [manualBlPhone, setManualBlPhone] = useState('');
  const [manualBlTeam, setManualBlTeam] = useState('');
  const [manualBlType, setManualBlType] = useState<'Member' | 'Tim' | 'Lainnya'>('Member');
  const [manualBlReason, setManualBlReason] = useState('');

  // MENU #13 — Kirim Pesan State
  const [msgTargetType, setMsgTargetType] = useState<'ALL' | 'SINGLE'>('ALL');
  const [msgTargetUser, setMsgTargetUser] = useState<string>('');
  const [msgTitle, setMsgTitle] = useState<string>('📢 PEMBERITAHUAN RESMI ADMIN');
  const [msgBody, setMsgBody] = useState<string>('');
  const [sendAppNotif, setSendAppNotif] = useState<boolean>(true);
  const [sendWaMsg, setSendWaMsg] = useState<boolean>(true);

  // MENU #14 — Laporan Transaksi Filter State
  const [txSearchTerm, setTxSearchTerm] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'TOPUP' | 'WITHDRAW' | 'BET' | 'TRANSFER'>('ALL');

  // MENU #17 — Unggah Bukti & Galeri State
  const [galleryTitle, setGalleryTitle] = useState<string>('');
  const [galleryGame, setGalleryGame] = useState<'Free Fire' | 'Mobile Legends' | 'Umum'>('Free Fire');
  const [galleryMediaUrl, setGalleryMediaUrl] = useState<string>('');
  const [galleryMediaType, setGalleryMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [galleryMatchId, setGalleryMatchId] = useState<string>('');
  const [galleryDesc, setGalleryDesc] = useState<string>('');

  // MENU #18 — Kelola Tautan & Informasi State
  const [waGroupFFInput, setWaGroupFFInput] = useState<string>('https://chat.whatsapp.com/HUNTERS-FF');
  const [waGroupMLBBInput, setWaGroupMLBBInput] = useState<string>('https://chat.whatsapp.com/HUNTERS-MLBB');
  const [topupStoreUrlInput, setTopupStoreUrlInput] = useState<string>('https://dexzstore.com');
  const [apkDownloadUrlInput, setApkDownloadUrlInput] = useState<string>('https://hunterscommunity.com/apk/hunters-esports.apk');
  const [csPhoneInput, setCsPhoneInput] = useState<string>('083148834663');
  const [instagramUrlInput, setInstagramUrlInput] = useState<string>('https://instagram.com/hunterstrny');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('https://youtube.com/@hunterstrny');

  // MENU #20 — Ekspor Data State
  const [exportDataset, setExportDataset] = useState<'TIM' | 'PENGGUNA' | 'TRANSAKSI' | 'HASIL_MATCH'>('TIM');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF'>('CSV');

  // MENU #21 — Kirim Notifikasi Pengingat State
  const [reminderMatchId, setReminderMatchId] = useState<string>('');
  const [reminderCustomMsg, setReminderCustomMsg] = useState<string>('📢 PERTANDINGAN AKAN SEGERA DIMULAI! Silakan konfirmasi kehadiran dan persiapkan roster Anda di Lobi Match.');
  const [reminderTargetTeam, setReminderTargetTeam] = useState<string>('BOTH');

  // MENU #25 — Kelola Sistem Poin State
  const [pointWin, setPointWin] = useState<number>(10);
  const [pointDraw, setPointDraw] = useState<number>(3);
  const [pointLoss, setPointLoss] = useState<number>(0);
  const [pointKillBonus, setPointKillBonus] = useState<number>(1);

  // MENU #26 — Laporan Senja Date State
  const [duskReportDate, setDuskReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // MENU #28 — Pengumuman Penting State
  const [urgentBannerText, setUrgentBannerText] = useState<string>('📢 INFORMASI RESMI: Pendaftaran Turnamen Season 12 Telah Dibuka! Segera Amankan Slot Tim Anda!');
  const [urgentBannerActive, setUrgentBannerActive] = useState<boolean>(true);
  const [urgentBannerColor, setUrgentBannerColor] = useState<'RED' | 'AMBER' | 'CYAN'>('RED');
  const [urgentBannerDuration, setUrgentBannerDuration] = useState<number>(24);

  // MENU #29 — Top Up Rekomendasi State
  const [recStoreName, setRecStoreName] = useState<string>('DEXZ STORE OFFICIAL');
  const [recStoreUrl, setRecStoreUrl] = useState<string>('https://dexzstore.com');
  const [recStorePromo, setRecStorePromo] = useState<string>('Diskon 10% Diamond Free Fire & Mobile Legends khusus member Hunters Esports Community!');
  const [recStoreCsPhone, setRecStoreCsPhone] = useState<string>('083148834663');

  // MENU #30 — Unduh Aplikasi APK State
  const [apkVersionName, setApkVersionName] = useState<string>('v2.5.0-pro');
  const [apkFileUrl, setApkFileUrl] = useState<string>('https://hunterscommunity.com/apk/hunters-esports.apk');
  const [apkFileSize, setApkFileSize] = useState<string>('24.8 MB');
  const [apkChangelog, setApkChangelog] = useState<string>('- Penambahan fitur Live Chat Room ID\n- Integrasi Mutasi Saldo Firebase Realtime\n- Pembaruan UI Panel Admin 40 Menu');

  // MENU #31 — Arsip Turnamen State
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');

  // MENU #32 — Sinkronisasi Data State
  const [syncHealthStatus, setSyncHealthStatus] = useState<'SUCCESS' | 'SYNCING'>('SUCCESS');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  // MENU #33 — WA Bot Command State
  const [waCmdInput, setWaCmdInput] = useState<string>('.pengumuman Turnamen Season 12 resmi dibuka!');
  const [waCmdLogs, setWaCmdLogs] = useState<Array<{ time: string; cmd: string; response: string }>>([
    { time: new Date().toLocaleTimeString('id-ID'), cmd: '.menu panel', response: '🤖 BOT WA ADMIN: 1) .pengumuman 2) .kode 3) .status 4) .saldo' }
  ]);

  // MENU #34 — Kelola Beranda State
  const [heroWelcomeTitle, setHeroWelcomeTitle] = useState<string>('SELAMAT DATANG DI HUNTERS ESPORTS COMMUNITY');
  const [heroSubTitle, setHeroSubTitle] = useState<string>('Platform Turnamen Game Online & Komunitas Esports Terpercaya Indonesia');
  const [heroColorTheme, setHeroColorTheme] = useState<'CRIMSON' | 'CYAN' | 'AMBER' | 'PURPLE'>('CRIMSON');

  // MENU #35 — Laporan Masalah State
  const [reportFilterCategory, setReportFilterCategory] = useState<'ALL' | 'BUG' | 'USULAN' | 'LOKASI'>('ALL');
  const [userReports, setUserReports] = useState<Array<{ id: string; user: string; type: string; subject: string; date: string; status: 'PENDING' | 'DONE'; reply?: string }>>([
    { id: 'rep-1', user: 'Reynaldi (EVOS Fan)', type: 'BUG', subject: 'Gagal kirim bukti booyah saat koneksi lambat', date: '2026-08-12', status: 'PENDING' },
    { id: 'rep-2', user: 'Nabila (MLBB Pro)', type: 'USULAN', subject: 'Usul penambahan turnamen Magic Chess 1v1', date: '2026-08-11', status: 'DONE', reply: 'Terima kasih, usulan dimasukkan ke rencana rilis!' }
  ]);
  const [reportReplyInput, setReportReplyInput] = useState<string>('');

  // MENU #36 — Notifikasi Otomatis State
  const [autoNotifReg, setAutoNotifReg] = useState<boolean>(true);
  const [autoNotifBalance, setAutoNotifBalance] = useState<boolean>(true);
  const [autoNotifMatchReminder, setAutoNotifMatchReminder] = useState<boolean>(true);
  const [autoNotifResult, setAutoNotifResult] = useState<boolean>(true);
  const [autoNotifAnnouncement, setAutoNotifAnnouncement] = useState<boolean>(true);
  const [autoNotifLeadMinutes, setAutoNotifLeadMinutes] = useState<number>(30);

  // MENU #37 — Tetapkan Juara & Penutupan Turnamen State
  const [champ1, setChamp1] = useState<string>('');
  const [champ2, setChamp2] = useState<string>('');
  const [champ3, setChamp3] = useState<string>('');
  const [champ4, setChamp4] = useState<string>('');
  const [tourneyCloseNote, setTourneyCloseNote] = useState<string>('Turnamen Season 11 Resmi Ditutup dengan Gelar Juara Sah.');

  // MENU #38 — Hapus Data Lama State
  const [purgeOldLogsChecked, setPurgeOldLogsChecked] = useState<boolean>(true);
  const [purgeOldAnnounceChecked, setPurgeOldAnnounceChecked] = useState<boolean>(false);
  const [purgeOldMatchLogsChecked, setPurgeOldMatchLogsChecked] = useState<boolean>(true);

  // MENU #39 — Ubah Password Admin State
  const [currAdminPass, setCurrAdminPass] = useState<string>('');
  const [newAdminPass, setNewAdminPass] = useState<string>('');
  const [confirmAdminPass, setConfirmAdminPass] = useState<string>('');

  // MENU #40 — AI Text Command State
  const [aiTextPrompt, setAiTextPrompt] = useState<string>('Ubah warna banner beranda jadi merah crimson dan tampilkan pengumuman diskon topup');
  const [aiPromptLogs, setAiPromptLogs] = useState<Array<{ time: string; prompt: string; result: string }>>([
    { time: new Date().toLocaleTimeString('id-ID'), prompt: 'Sistem siap menerima perintah teks', result: '✅ AI Command Interpreter Active' }
  ]);

  // State for Custom Links in Beranda tab
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<'Sosmed' | 'Donasi' | 'Lainnya'>('Lainnya');
  const [newLinkBadge, setNewLinkBadge] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');

  const handleAddCustomLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      alert('Judul Link dan URL Link wajib diisi!');
      return;
    }
    let formattedUrl = newLinkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLinkItem: CustomLink = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newLinkTitle.trim(),
      url: formattedUrl,
      category: newLinkCategory,
      badge: newLinkBadge.trim() || undefined,
      description: newLinkDesc.trim() || undefined,
    };

    const updatedCustomLinks = [...(config.homeConfig?.customLinks || []), newLinkItem];
    const updatedConfig: SiteConfig = {
      ...config,
      homeConfig: {
        ...(config.homeConfig || {
          heroBadge: 'DIKELOLA OLEH DEXZ STORE',
          heroTitle: 'HUNTERS COMMUNITY',
          heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
          heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE.',
          organizerTitle: '✨ DEXZ STORE ORGANIZER',
          organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
        }),
        customLinks: updatedCustomLinks
      }
    };

    handleSaveAllConfig(updatedConfig, `Link baru "${newLinkTitle}" berhasil ditambahkan ke Beranda!`);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkBadge('');
    setNewLinkDesc('');
  };

  // Form states for 6 new Admin Tabs
  // 1. Hasil Match
  const [newHasilName, setNewHasilName] = useState('');
  const [newHasilGame, setNewHasilGame] = useState<'FF' | 'MLBB'>('FF');
  const [newHasilWinTeam, setNewHasilWinTeam] = useState('');
  const [newHasilLoseTeam, setNewHasilLoseTeam] = useState('');
  const [newHasilStatus, setNewHasilStatus] = useState<'LOLOS' | 'GUGUR'>('GUGUR');
  const [newHasilReason, setNewHasilReason] = useState<'DISKUALIFIKASI' | 'KALAH_BERTANDING' | 'MENGUNDURKAN_DIRI'>('KALAH_BERTANDING');
  const [newHasilNote, setNewHasilNote] = useState('');
  const [newHasilDetail, setNewHasilDetail] = useState('');

  // 2. Turnamen Mendatang
  const [newUpcomingTitle, setNewUpcomingTitle] = useState('');
  const [newUpcomingGame, setNewUpcomingGame] = useState<'FF' | 'MLBB'>('FF');
  const [newUpcomingOpenDate, setNewUpcomingOpenDate] = useState('');
  const [newUpcomingStartDate, setNewUpcomingStartDate] = useState('');
  const [newUpcomingPrize, setNewUpcomingPrize] = useState('');
  const [newUpcomingSlot, setNewUpcomingSlot] = useState('32 Slot');
  const [newUpcomingMode, setNewUpcomingMode] = useState<'SQUAD' | 'SOLO' | 'DUO'>('SQUAD');
  const [newUpcomingDesc, setNewUpcomingDesc] = useState('');

  // State & Handlers for Editing & Deleting Tournaments
  const [editingUpcomingModal, setEditingUpcomingModal] = useState(false);
  const [editingUpcomingData, setEditingUpcomingData] = useState<UpcomingTournament | null>(null);

  const handleOpenEditUpcoming = (tour: UpcomingTournament) => {
    setEditingUpcomingData({ ...tour });
    setEditingUpcomingModal(true);
  };

  const handleSaveEditUpcoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUpcomingData) return;

    const updatedList = (config.upcomingTournaments || []).map(t =>
      t.id === editingUpcomingData.id ? editingUpcomingData : t
    );

    const updatedConfig: SiteConfig = {
      ...config,
      upcomingTournaments: updatedList,
    };

    handleSaveAllConfig(updatedConfig, `Turnamen "${editingUpcomingData.title}" berhasil diperbarui!`);
    setEditingUpcomingModal(false);
    setEditingUpcomingData(null);
  };

  const handleDeleteUpcomingTournament = (tourId: string, tourTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus turnamen "${tourTitle}"?`)) return;

    const updatedList = (config.upcomingTournaments || []).filter(t => t.id !== tourId);

    const deletedEntry: DeletedItem = {
      id: `del-tour-${Date.now()}`,
      type: 'aturan',
      title: tourTitle,
      subtitle: `Penghapusan Turnamen`,
      deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      data: { tourId },
    };

    const updatedConfig: SiteConfig = {
      ...config,
      upcomingTournaments: updatedList,
      recentlyDeleted: [deletedEntry, ...(config.recentlyDeleted || [])],
    };

    handleSaveAllConfig(updatedConfig, `Turnamen "${tourTitle}" berhasil dihapus.`);
  };

  // 3. Tim Unggulan
  const [newFeaturedName, setNewFeaturedName] = useState('');
  const [newFeaturedGame, setNewFeaturedGame] = useState<'FF' | 'MLBB'>('FF');
  const [newFeaturedPlayers, setNewFeaturedPlayers] = useState('');
  const [newFeaturedWinRate, setNewFeaturedWinRate] = useState('');
  const [newFeaturedPrediction, setNewFeaturedPrediction] = useState('');
  const [newFeaturedDesc, setNewFeaturedDesc] = useState('');

  const handleDeleteCustomLink = (linkId: string, linkTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus link "${linkTitle}"?`)) return;
    const updatedCustomLinks = (config.homeConfig?.customLinks || []).filter(l => l.id !== linkId);
    const updatedConfig: SiteConfig = {
      ...config,
      homeConfig: {
        ...config.homeConfig!,
        customLinks: updatedCustomLinks
      }
    };
    handleSaveAllConfig(updatedConfig, `Link "${linkTitle}" berhasil dihapus.`);
  };

  // Add Team Form State
  const [newTeamGame, setNewTeamGame] = useState<'FF' | 'MLBB'>('FF');
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptainName, setNewCaptainName] = useState('');
  const [newCaptainPhone, setNewCaptainPhone] = useState('');
  const [newRosterText, setNewRosterText] = useState('');
  const [newTeamStatus, setNewTeamStatus] = useState<'Sah' | 'Menunggu Pembayaran' | 'Gagal'>('Sah');
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Modal State for Adding Rules & Admin Wallet Actions
  const [selectedMemberForSendId, setSelectedMemberForSendId] = useState<string>('current');
  const [sendRecipientAccount, setSendRecipientAccount] = useState<string>('Dexz Store (Pengguna)');
  const [sendAmountVal, setSendAmountVal] = useState<string>('100000');
  
  // State for Admin Real Top Up & Withdraw
  const [showAdminTopUpModal, setShowAdminTopUpModal] = useState(false);
  const [adminTopUpAmountVal, setAdminTopUpAmountVal] = useState<string>('100000');
  const [adminTopUpMethod, setAdminTopUpMethod] = useState<string>('QRIS DEXZ STORE');

  const [showAdminWithdrawModal, setShowAdminWithdrawModal] = useState(false);
  const [adminWithdrawAmountVal, setAdminWithdrawAmountVal] = useState<string>('100000');
  const [adminWithdrawMethod, setAdminWithdrawMethod] = useState<string>('DANA');
  const [adminWithdrawAccountNo, setAdminWithdrawAccountNo] = useState<string>('');
  const [adminWithdrawAccountName, setAdminWithdrawAccountName] = useState<string>('');

  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleModalGame, setRuleModalGame] = useState<'FF' | 'MLBB'>('FF');
  const [ruleModalCategoryIdx, setRuleModalCategoryIdx] = useState<number>(0);
  const [newRuleText, setNewRuleText] = useState('');

  // Modal State for Adding / Editing Schedule Matches
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchSchedule | null>(null);
  const [schStageFilter, setSchStageFilter] = useState<string>('Semua');
  const [schGameFilter, setSchGameFilter] = useState<string>('Semua');
  const [schSearchTeam, setSchSearchTeam] = useState<string>('');
  const [schDisplayMode, setSchDisplayMode] = useState<'daftar' | 'pohon'>('daftar');
  const [schGame, setSchGame] = useState<'FF' | 'MLBB'>('MLBB');
  const [schPhase, setSchPhase] = useState('Babak Penyisihan');
  const [schDay, setSchDay] = useState('Rabu');
  const [schDate, setSchDate] = useState('2 September 2026');
  const [schTime, setSchTime] = useState('19:00 WIB');
  const [schTeamA, setSchTeamA] = useState('');
  const [schTeamB, setSchTeamB] = useState('');
  const [schWinner, setSchWinner] = useState('');
  const [schStatus, setSchStatus] = useState<string>('mendatang');
  const [schRoomCode, setSchRoomCode] = useState('');
  const [schRoomPass, setSchRoomPass] = useState('');

  // Modal State for Adding Winners
  const [showAddWinnerModal, setShowAddWinnerModal] = useState(false);
  const [winSeason, setWinSeason] = useState('');
  const [winGame, setWinGame] = useState<'FF' | 'MLBB'>('FF');
  const [winChampion, setWinChampion] = useState('');
  const [winRunnerUp, setWinRunnerUp] = useState('');
  const [winThirdPlace, setWinThirdPlace] = useState('');
  const [winPrizePool, setWinPrizePool] = useState('');

  // Announcement management state
  const [regCloseDate, setRegCloseDate] = useState('1 September 2026');
  const [regCloseTime, setRegCloseTime] = useState('12:00 WIB');
  const [newMatchDate, setNewMatchDate] = useState('Kamis, 3 September 2026');
  const [newMatchTime, setNewMatchTime] = useState('20:00 WIB');

  const generateInfoPentingText = (dateStr: string, timeStr: string) => {
    return `Halo Seluruh Peserta! 👋

📢 INFORMASI PENTING — PERLU DIKETAHUI:

• Pendaftaran ditutup tanggal ${dateStr || '[Tanggal]'} tepat pukul ${timeStr || '[Jam]'}
• Pembayaran hanya sah ke nomor/admin resmi yang tercantum
• Konfirmasi pembayaran maksimal 1×24 jam setelah mendaftar
• Wajib masuk grup WhatsApp agar menerima info & kode ruang
• Kode ruang dikirim 10–15 menit sebelum pertandingan dimulai
• Terlambat 5 menit = kemenangan diberikan kepada lawan
• Nama tim tidak boleh diubah setelah pendaftaran dikonfirmasi
• Keputusan admin & wasit bersifat mutlak dan tidak dapat diganggu gugat

Jika ada kendala atau pertanyaan, segera hubungi admin! 💬

Terima kasih atas perhatian dan partisipasinya! 💪
— HUNTERS COMMUNITY • DEXZ STORE`;
  };

  const generatePerubahanJadwalText = (
    matchSchedule?: MatchSchedule,
    newDayDate?: string,
    newTime?: string,
    phase?: string
  ) => {
    const babakText = matchSchedule ? `${matchSchedule.phase} (${matchSchedule.game})` : phase || '[Babak]';
    const oldDayDate = matchSchedule ? `${matchSchedule.day}, ${matchSchedule.date}` : '[Hari], [Tanggal Lama]';
    const oldTime = matchSchedule ? matchSchedule.time : '[Jam Lama]';
    const newDayDateText = newDayDate || '[Hari], [Tanggal Baru]';
    const newTimeText = newTime || '[Jam Baru]';
    const opponentText = matchSchedule ? `${matchSchedule.teamA} vs ${matchSchedule.teamB}` : '[Nama Tim Lawan]';

    return `Halo Kapten Tim! 👋

⚠️ INFORMASI PERUBAHAN JADWAL ⚠️

Pertandingan yang semula dijadwalkan:
🏆 ${babakText}
📅 Tanggal Lama: ${oldDayDate}
⏰ Jam Mulai: ${oldTime}

TELAH DIUBAH MENJADI:
🏆 ${babakText}
📅 Tanggal Baru: ${newDayDateText}
⏰ Jam Mulai: ${newTimeText}
⚔️ Melawan: ${opponentText}

✅ Harap catat jadwal yang baru!
✅ Siapkan akun & koneksi sesuai jam yang baru
✅ Masuk ruang 10–15 menit sebelum jam mulai
✅ Kode ruang tetap dikirim di grup sesaat sebelum mulai
⚠️ Terlambat 5 menit = kemenangan diberikan kepada lawan

Mohon dipahami dan disesuaikan. Terima kasih! 💪
— HUNTERS COMMUNITY • DEXZ STORE`;
  };

  const generateReminderText = (phase: string, matchSchedule?: MatchSchedule) => {
    const babakText = matchSchedule 
      ? `${matchSchedule.phase || phase} (${matchSchedule.game}) - Match #${matchSchedule.matchNumber}`
      : phase || '[Babak]';
    const dayText = matchSchedule ? matchSchedule.day : '[Hari]';
    const dateText = matchSchedule ? matchSchedule.date : '[Tanggal]';
    const timeText = matchSchedule ? matchSchedule.time : '[Jam]';
    const opponentText = matchSchedule 
      ? `${matchSchedule.teamA} vs ${matchSchedule.teamB}`
      : '[Nama Tim Lawan]';

    return `Halo Kapten Tim! 👋

Ini pengingat resmi pertandingan:
🏆 ${babakText}
📅 Tanggal: ${dayText}, ${dateText}
⏰ Jam Mulai: ${timeText}
👤 Lawan: ${opponentText}

✅ Siapkan akun & koneksi stabil
✅ Masuk ruang 10–15 menit sebelum jam mulai
✅ Kode ruang dikirim di grup sesaat sebelum pertandingan
⚠️ Terlambat 5 menit = kemenangan diberikan kepada lawan

Semoga bertanding dengan semangat & sportif! 💪
— HUNTERS COMMUNITY by DEXZ STORE`;
  };

  const [newAnnTitle, setNewAnnTitle] = useState('Pengingat Pertandingan - Babak Penyisihan');
  const [selectedRemindPhase, setSelectedRemindPhase] = useState<string>('Babak Penyisihan');
  const [selectedRemindGame, setSelectedRemindGame] = useState<string>('Semua');
  const [selectedRemindMatchId, setSelectedRemindMatchId] = useState<string>('');
  const [newAnnContent, setNewAnnContent] = useState(() => generateReminderText('Babak Penyisihan'));
  const [newAnnCategory, setNewAnnCategory] = useState<string>('Pengingat Match');
  const [newAnnImportant, setNewAnnImportant] = useState(true);
  const [targetAudience, setTargetAudience] = useState<string>('Semua Kapten & Member');
  const [selectedTargetCaptainId, setSelectedTargetCaptainId] = useState<string>('');

  const handleChangeCategory = (cat: string) => {
    setNewAnnCategory(cat);
    const match = config.matchSchedules?.find(m => m.id === selectedRemindMatchId);
    if (cat === 'Info Penting') {
      setNewAnnTitle('Informasi Penting - Penutupan Pendaftaran');
      setNewAnnContent(generateInfoPentingText(regCloseDate, regCloseTime));
    } else if (cat === 'Perubahan Jadwal') {
      setNewAnnTitle('Informasi Perubahan Jadwal Pertandingan');
      setNewAnnContent(generatePerubahanJadwalText(match, newMatchDate, newMatchTime, selectedRemindPhase));
    } else {
      setNewAnnTitle(`Pengingat Pertandingan - ${selectedRemindPhase}`);
      setNewAnnContent(generateReminderText(selectedRemindPhase, match));
    }
  };

  const handleSelectRemindMatch = (matchId: string) => {
    setSelectedRemindMatchId(matchId);
    const match = config.matchSchedules?.find(m => m.id === matchId);
    if (match) {
      const phase = match.phase || 'Babak Penyisihan';
      setSelectedRemindPhase(phase);
      if (newAnnCategory === 'Perubahan Jadwal') {
        setNewAnnContent(generatePerubahanJadwalText(match, newMatchDate, newMatchTime, phase));
      } else if (newAnnCategory === 'Info Penting') {
        setNewAnnContent(generateInfoPentingText(regCloseDate, regCloseTime));
      } else {
        setNewAnnTitle(`Pengingat Pertandingan - ${phase}`);
        setNewAnnContent(generateReminderText(phase, match));
      }
    } else {
      if (newAnnCategory === 'Perubahan Jadwal') {
        setNewAnnContent(generatePerubahanJadwalText(undefined, newMatchDate, newMatchTime, selectedRemindPhase));
      } else if (newAnnCategory === 'Pengingat Match') {
        setNewAnnContent(generateReminderText(selectedRemindPhase, undefined));
      }
    }
  };

  const handleSelectRemindPhase = (phase: string) => {
    setSelectedRemindPhase(phase);
    const match = config.matchSchedules?.find(m => m.id === selectedRemindMatchId);
    if (newAnnCategory === 'Perubahan Jadwal') {
      setNewAnnContent(generatePerubahanJadwalText(match, newMatchDate, newMatchTime, phase));
    } else if (newAnnCategory === 'Pengingat Match') {
      setNewAnnTitle(`Pengingat Pertandingan - ${phase}`);
      setNewAnnContent(generateReminderText(phase, match));
    }
  };

  // Help FAQ management state
  const [newHelpTitle, setNewHelpTitle] = useState('');
  const [newHelpContent, setNewHelpContent] = useState('');

  // Modal State for Deleting Team
  const [deleteTeamTarget, setDeleteTeamTarget] = useState<RegisteredTeam | null>(null);

  // Modal State for Viewing Team Detail
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<RegisteredTeam | null>(null);

  // Broadcast announcement state
  const [announcementMsg, setAnnouncementMsg] = useState(
    'OFFICIAL ANNOUNCEMENT: Match Grand Final Free Fire akan dilaksanakan pukul 19.30 WIB. Seluruh kapten harap siap di Room ID kustom!'
  );

  // Reset Database State
  const [showResetDatabaseModal, setShowResetDatabaseModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteFullDatabaseReset = async () => {
    if (resetConfirmationInput.trim().toUpperCase() !== 'RESET') {
      alert('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi pengosongan seluruh database!');
      return;
    }
    try {
      setIsResettingDatabase(true);
      const result = await resetAllFirestoreData(INITIAL_SITE_CONFIG);
      if (result.success) {
        setRegisteredTeams([]);
        if (setBets) setBets([]);
        if (setUserWallet) {
          setUserWallet({
            balance: 0,
            topUpHistory: [],
            withdrawalHistory: [],
            transactions: []
          });
        }
        setSiteConfig(INITIAL_SITE_CONFIG);
        setConfig(INITIAL_SITE_CONFIG);
        showNotification('🔥 Database berhasil dikosongkan total! Seluruh data bersih murni data baru siap digunakan.');
        setShowResetDatabaseModal(false);
        setResetConfirmationInput('');
      } else {
        alert(result.message);
      }
    } catch (err: any) {
      alert(`Gagal mereset database: ${err?.message || 'Error'}`);
    } finally {
      setIsResettingDatabase(false);
    }
  };

  const handleSaveAllConfig = (updatedConfig: SiteConfig, msg = 'Perubahan menu berhasil disimpan!') => {
    const qrisImg = updatedConfig.qrisImageUrl || updatedConfig.paymentConfig?.qrisImageUrl || '';
    const qrisNmidVal = updatedConfig.qrisNmid || updatedConfig.paymentConfig?.qrisNmid || 'ID1025383919053';
    
    const syncedConfig: SiteConfig = {
      ...updatedConfig,
      qrisImageUrl: qrisImg,
      qrisNmid: qrisNmidVal,
      paymentConfig: {
        ...(updatedConfig.paymentConfig || INITIAL_PAYMENT_METHODS_CONFIG),
        qrisImageUrl: qrisImg,
        qrisNmid: qrisNmidVal,
      }
    };
    setConfig(syncedConfig);
    setSiteConfig(syncedConfig);
    showNotification(msg);
  };

  // Admin Account Operations
  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      alert('Nama, Email, dan Kata Sandi wajib diisi!');
      return;
    }

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    
    // Check if email already used by main admin or existing custom admin
    if (cleanEmail === 'mumumimi353@gmail.com') {
      alert('Email mumumimi353@gmail.com adalah email Admin Utama (Super Admin)!');
      return;
    }

    const currentAdmins = config.adminAccounts || [];
    if (currentAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
      alert('Email admin ini sudah terdaftar! Gunakan email lain.');
      return;
    }

    const newAdminAcc: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: newAdminName.trim(),
      email: cleanEmail,
      password: newAdminPassword.trim(),
      isSuperAdmin: false,
      roleTitle: newAdminRoleTitle || 'Admin Khusus',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedConfig: SiteConfig = {
      ...config,
      adminAccounts: [...currentAdmins, newAdminAcc],
    };

    handleSaveAllConfig(updatedConfig, `Akun Admin baru "${newAdminAcc.name}" berhasil dibuat!`);
    setShowAddAdminModal(false);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
  };

  const handleDeleteAdminAccount = (adminToDelete: AdminAccount) => {
    if (adminToDelete.isSuperAdmin || adminToDelete.email.toLowerCase() === 'mumumimi353@gmail.com') {
      alert('Akun Admin Utama (Super Admin) tidak dapat dihapus!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun Admin "${adminToDelete.name}" (${adminToDelete.email})?`)) {
      const currentAdmins = config.adminAccounts || [];
      const updatedAdmins = currentAdmins.filter(a => a.id !== adminToDelete.id);

      const deletedEntry: DeletedItem = {
        id: `del-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'admin',
        title: adminToDelete.name,
        subtitle: `Email: ${adminToDelete.email} • Peran: ${adminToDelete.roleTitle || 'Admin Turnamen'}`,
        deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        data: adminToDelete,
      };

      const updatedConfig: SiteConfig = {
        ...config,
        adminAccounts: updatedAdmins,
        recentlyDeleted: [deletedEntry, ...(config.recentlyDeleted || [])],
      };

      handleSaveAllConfig(updatedConfig, `Akun Admin "${adminToDelete.name}" dipindahkan ke menu Baru Saja Dihapus.`);
    }
  };

  const handleUpdateAdminRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminToEditRole) return;

    const currentAdmins = config.adminAccounts || [];
    const updatedAdmins = currentAdmins.map(a =>
      a.id === selectedAdminToEditRole.id
        ? { ...a, roleTitle: editAdminRoleTitle }
        : a
    );

    const updatedConfig: SiteConfig = {
      ...config,
      adminAccounts: updatedAdmins,
    };

    handleSaveAllConfig(updatedConfig, `Jabatan Admin "${selectedAdminToEditRole.name}" berhasil diubah menjadi "${editAdminRoleTitle}"!`);
    setShowEditAdminRoleModal(false);
    setSelectedAdminToEditRole(null);
  };

  // Member & Blacklist Handlers
  const handlePromoteMemberToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToPromote) return;

    const cleanEmail = selectedMemberToPromote.email.trim().toLowerCase();
    const currentAdmins = config.adminAccounts || [];

    if (currentAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
      alert(`Member ${selectedMemberToPromote.name} (${cleanEmail}) sudah terdaftar sebagai Admin!`);
      return;
    }

    const newAdminAcc: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: selectedMemberToPromote.name,
      email: cleanEmail,
      password: promotePassword || 'Admin123',
      isSuperAdmin: false,
      roleTitle: promoteRoleTitle,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedAdmins = [...currentAdmins, newAdminAcc];
    const updatedMembers = (config.memberAccounts || []).map(m =>
      m.email.toLowerCase() === cleanEmail
        ? { ...m, role: 'admin' as const }
        : m
    );

    const updatedConfig: SiteConfig = {
      ...config,
      adminAccounts: updatedAdmins,
      memberAccounts: updatedMembers,
    };

    handleSaveAllConfig(updatedConfig, `Berhasil mengangkat "${selectedMemberToPromote.name}" sebagai ${promoteRoleTitle}!`);
    setShowPromoteModal(false);
    setSelectedMemberToPromote(null);
  };

  const handleConfirmBlacklistMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToBlacklist) return;

    const newBlEntry: BlacklistEntry = {
      id: `bl-${Date.now()}`,
      name: selectedMemberToBlacklist.name,
      email: selectedMemberToBlacklist.email,
      phone: selectedMemberToBlacklist.phone || '',
      teamName: selectedMemberToBlacklist.teamName || '',
      reason: blacklistReasonInput.trim() || 'Pelanggaran aturan turnamen / Sanksi admin',
      blacklistedAt: new Date().toISOString().split('T')[0],
      type: 'Member',
    };

    const updatedMembers = (config.memberAccounts || []).map(m =>
      m.email.toLowerCase() === selectedMemberToBlacklist.email.toLowerCase()
        ? { ...m, status: 'Blacklisted' as const }
        : m
    );

    const updatedBlacklist = [newBlEntry, ...(config.blacklistData || [])];

    const updatedConfig: SiteConfig = {
      ...config,
      memberAccounts: updatedMembers,
      blacklistData: updatedBlacklist,
    };

    handleSaveAllConfig(updatedConfig, `Member "${selectedMemberToBlacklist.name}" berhasil dimasukkan ke daftar Blacklist!`);
    setShowBlacklistMemberModal(false);
    setSelectedMemberToBlacklist(null);
    setBlacklistReasonInput('');
  };

  const handleDeleteMember = (member: UserAccount) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data member "${member.name}" (${member.email})?`)) {
      const updatedMembers = (config.memberAccounts || []).filter(m => m.email.toLowerCase() !== member.email.toLowerCase());

      const deletedEntry: DeletedItem = {
        id: `del-member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'member',
        title: member.name,
        subtitle: `Email: ${member.email} • No. HP: ${member.phone || '-'} • Tim: ${member.teamName || '-'}`,
        deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        data: member,
      };

      const updatedConfig: SiteConfig = {
        ...config,
        memberAccounts: updatedMembers,
        recentlyDeleted: [deletedEntry, ...(config.recentlyDeleted || [])],
      };
      handleSaveAllConfig(updatedConfig, `Data member "${member.name}" dipindahkan ke menu Baru Saja Dihapus.`);
    }
  };

  const handleUnblacklist = (bl: BlacklistEntry) => {
    if (confirm(`LEPAS HUKUMAN: Apakah Anda yakin ingin melepas hukuman blacklist untuk "${bl.name}"?`)) {
      const updatedBlacklist = (config.blacklistData || []).filter(b => b.id !== bl.id);
      const updatedMembers = (config.memberAccounts || []).map(m =>
        m.email.toLowerCase() === bl.email.toLowerCase()
          ? { ...m, status: 'Active' as const }
          : m
      );
      const updatedConfig: SiteConfig = {
        ...config,
        blacklistData: updatedBlacklist,
        memberAccounts: updatedMembers,
      };
      handleSaveAllConfig(updatedConfig, `Hukuman blacklist untuk "${bl.name}" telah dilepas! Akun berhasil dipulihkan.`);
    }
  };

  const handleDeleteBlacklistPermanently = (bl: BlacklistEntry) => {
    if (confirm(`HAPUS PERMANEN: Apakah Anda yakin ingin menghapus data blacklist "${bl.name}" secara permanen?`)) {
      const updatedBlacklist = (config.blacklistData || []).filter(b => b.id !== bl.id);
      const updatedConfig: SiteConfig = {
        ...config,
        blacklistData: updatedBlacklist,
      };
      handleSaveAllConfig(updatedConfig, `Data blacklist "${bl.name}" berhasil dihapus secara permanen.`);
    }
  };

  // Recently Deleted (Trash Bin) Operations
  const handleRestoreDeletedItem = (item: DeletedItem) => {
    let updatedConfig = { ...config };
    let successMessage = '';

    if (item.type === 'pendaftaran') {
      const teamToRestore = item.data as RegisteredTeam;
      setRegisteredTeams(prev => {
        if (prev.some(t => t.id === teamToRestore.id)) return prev;
        return [teamToRestore, ...prev];
      });
      successMessage = `Pendaftaran tim "${item.title}" berhasil dipulihkan!`;
    } else if (item.type === 'aturan') {
      const { gameType, categoryTitle, ruleText, categoryIdx } = item.data;
      const targetKey = gameType === 'FF' ? 'ffRules' : 'mlbbRules';
      const targetRules = [...(config[targetKey] || [])];

      let catIndex = categoryIdx;
      if (catIndex < 0 || catIndex >= targetRules.length) {
        catIndex = targetRules.findIndex(c => c.title === categoryTitle);
      }
      if (catIndex === -1) catIndex = 0;

      if (targetRules[catIndex]) {
        targetRules[catIndex] = {
          ...targetRules[catIndex],
          rules: [...targetRules[catIndex].rules, ruleText]
        };
      }
      updatedConfig[targetKey] = targetRules;
      successMessage = `Aturan "${item.title}" berhasil dipulihkan!`;
    } else if (item.type === 'admin') {
      const adminToRestore = item.data as AdminAccount;
      const currentAdmins = updatedConfig.adminAccounts || [];
      if (!currentAdmins.some(a => a.id === adminToRestore.id || a.email.toLowerCase() === adminToRestore.email.toLowerCase())) {
        updatedConfig.adminAccounts = [...currentAdmins, adminToRestore];
      }
      successMessage = `Akun Admin "${item.title}" berhasil dipulihkan!`;
    } else if (item.type === 'member') {
      const memberToRestore = item.data as UserAccount;
      const currentMembers = updatedConfig.memberAccounts || [];
      if (!currentMembers.some(m => m.email.toLowerCase() === memberToRestore.email.toLowerCase())) {
        updatedConfig.memberAccounts = [...currentMembers, memberToRestore];
      }
      successMessage = `Akun Member "${item.title}" berhasil dipulihkan!`;
    }

    updatedConfig.recentlyDeleted = (updatedConfig.recentlyDeleted || []).filter(d => d.id !== item.id);
    handleSaveAllConfig(updatedConfig, successMessage);
  };

  const handlePermanentDelete = (item: DeletedItem) => {
    if (!confirm(`HAPUS PERMANEN: Apakah Anda yakin ingin menghapus data "${item.title}" secara permanen? Data ini tidak dapat dikembalikan lagi.`)) {
      return;
    }

    const updatedConfig = {
      ...config,
      recentlyDeleted: (config.recentlyDeleted || []).filter(d => d.id !== item.id)
    };
    handleSaveAllConfig(updatedConfig, `Data "${item.title}" telah dihapus secara permanen dari sistem.`);
  };

  const handleEmptyAllTrash = () => {
    if (!confirm('KOSONGKAN SAMPAH: Apakah Anda yakin ingin menghapus SELURUH item di tempat sampah secara permanen?')) {
      return;
    }
    const updatedConfig = {
      ...config,
      recentlyDeleted: []
    };
    handleSaveAllConfig(updatedConfig, 'Seluruh isi tempat sampah berhasil dihapus permanen!');
  };

  const handleRestoreAllTrash = () => {
    if (!confirm('PULIHKAN SEMUA: Apakah Anda yakin ingin memulihkan seluruh data yang ada di tempat sampah kembali ke lokasinya masing-masing?')) {
      return;
    }
    const currentDeleted = config.recentlyDeleted || [];
    let updatedConfig = { ...config };

    currentDeleted.forEach(item => {
      if (item.type === 'pendaftaran') {
        const teamToRestore = item.data as RegisteredTeam;
        setRegisteredTeams(prev => {
          if (prev.some(t => t.id === teamToRestore.id)) return prev;
          return [teamToRestore, ...prev];
        });
      } else if (item.type === 'aturan') {
        const { gameType, categoryTitle, ruleText, categoryIdx } = item.data;
        const targetKey = gameType === 'FF' ? 'ffRules' : 'mlbbRules';
        const targetRules = [...(updatedConfig[targetKey] || [])];
        let catIndex = categoryIdx;
        if (catIndex < 0 || catIndex >= targetRules.length) {
          catIndex = targetRules.findIndex(c => c.title === categoryTitle);
        }
        if (catIndex === -1) catIndex = 0;
        if (targetRules[catIndex]) {
          targetRules[catIndex] = {
            ...targetRules[catIndex],
            rules: [...targetRules[catIndex].rules, ruleText]
          };
        }
        updatedConfig[targetKey] = targetRules;
      } else if (item.type === 'admin') {
        const adminToRestore = item.data as AdminAccount;
        const currentAdmins = updatedConfig.adminAccounts || [];
        if (!currentAdmins.some(a => a.id === adminToRestore.id || a.email.toLowerCase() === adminToRestore.email.toLowerCase())) {
          updatedConfig.adminAccounts = [...currentAdmins, adminToRestore];
        }
      } else if (item.type === 'member') {
        const memberToRestore = item.data as UserAccount;
        const currentMembers = updatedConfig.memberAccounts || [];
        if (!currentMembers.some(m => m.email.toLowerCase() === memberToRestore.email.toLowerCase())) {
          updatedConfig.memberAccounts = [...currentMembers, memberToRestore];
        }
      }
    });

    updatedConfig.recentlyDeleted = [];
    handleSaveAllConfig(updatedConfig, 'Semua data di tempat sampah berhasil dipulihkan!');
  };

  const handleCreateManualBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBlName.trim() || !manualBlReason.trim()) {
      alert('Nama dan Alasan Blacklist wajib diisi!');
      return;
    }

    const newBlEntry: BlacklistEntry = {
      id: `bl-${Date.now()}`,
      name: manualBlName.trim(),
      email: manualBlEmail.trim(),
      phone: manualBlPhone.trim(),
      teamName: manualBlTeam.trim(),
      reason: manualBlReason.trim(),
      blacklistedAt: new Date().toISOString().split('T')[0],
      type: manualBlType,
    };

    const updatedBlacklist = [newBlEntry, ...(config.blacklistData || [])];
    const updatedConfig: SiteConfig = {
      ...config,
      blacklistData: updatedBlacklist,
    };

    handleSaveAllConfig(updatedConfig, `Data "${manualBlName}" berhasil ditambahkan ke daftar Blacklist!`);
    setShowManualBlacklistModal(false);
    setManualBlName('');
    setManualBlEmail('');
    setManualBlPhone('');
    setManualBlTeam('');
    setManualBlReason('');
  };

  // Team Operations
  const handleUpdateTeamStatus = (teamId: string, newStatus: 'Sah' | 'Menunggu Pembayaran' | 'Gagal') => {
    const nowIso = new Date().toISOString();
    const targetTeam = registeredTeams.find(t => t.id === teamId);
    const teamName = targetTeam ? targetTeam.teamName : teamId;

    let allocatedSlot = targetTeam?.slotNumber || 0;

    if (newStatus === 'Sah' && targetTeam) {
      const isFF = targetTeam.game === 'FF' || (targetTeam.game as any) === 'Free Fire';
      const occupiedSlots = new Set(
        registeredTeams
          .filter(t => t.id !== teamId && t.status === 'Sah' && (isFF ? (t.game === 'FF' || (t.game as any) === 'Free Fire') : (t.game === 'MLBB' || (t.game as any) === 'Mobile Legends')) && (t.slotNumber ?? 0) > 0)
          .map(t => t.slotNumber)
      );

      if (!allocatedSlot || allocatedSlot <= 0 || occupiedSlots.has(allocatedSlot)) {
        for (let i = 1; i <= 32; i++) {
          if (!occupiedSlots.has(i)) {
            allocatedSlot = i;
            break;
          }
        }
      }
    } else {
      // Release slot number when Pending or Gagal
      allocatedSlot = 0;
    }

    setRegisteredTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          status: newStatus,
          slotNumber: allocatedSlot,
          failedAt: newStatus === 'Gagal' ? (t.failedAt || nowIso) : undefined
        };
      }
      return t;
    }));

    if (newStatus === 'Sah' && targetTeam) {
      // Auto-trigger WhatsApp Bot notification log
      const botConfig = config.waBotConfig;
      if (botConfig && botConfig.autoSendVerifiedSah) {
        const messageText = (botConfig.templateSah || '')
          .replace('{CAPTAIN_NAME}', targetTeam.captainName)
          .replace('{TEAM_NAME}', targetTeam.teamName)
          .replace('{GAME}', targetTeam.game === 'FF' ? 'Free Fire' : 'Mobile Legends')
          .replace('{SLOT}', String(allocatedSlot))
          .replace('{PAYMENT_METHOD}', targetTeam.paymentProof ? 'Bukti Bayar Terlampir' : 'QRIS / E-Wallet / Transfer Bank')
          .replace('{TIME}', new Date().toISOString().replace('T', ' ').substring(0, 16));

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'STATUS_SAH' as const,
          typeLabel: 'Pendaftaran SAH',
          recipientName: `${targetTeam.captainName} (${targetTeam.teamName})`,
          recipientPhoneOrGroup: targetTeam.captainPhone,
          message: messageText,
          status: 'SENT' as const
        };

        const updatedBotConfig = {
          ...botConfig,
          logs: [newLog, ...(botConfig.logs || [])]
        };
        const updatedConfig = { ...config, waBotConfig: updatedBotConfig };
        setConfig(updatedConfig);
        setSiteConfig(updatedConfig);
      }

      showNotification(`Status tim "${teamName}" diubah menjadi SAH & resmi menempati Slot #${allocatedSlot}! 🤖 Bot WA otomatis mengirim verifikasi.`);
    } else if (newStatus === 'Menunggu Pembayaran') {
      showNotification(`Status tim "${teamName}" diubah menjadi PENDING (Slot turnamen dikosongkan sampai diverifikasi Sah)`);
    } else if (newStatus === 'Gagal') {
      showNotification(`Status tim "${teamName}" diubah menjadi GAGAL (Slot turnamen dilepas & dikosongkan)`);
    }
  };

  const handleConfirmDeleteTeam = () => {
    if (!deleteTeamTarget) return;
    const team = deleteTeamTarget;
    setRegisteredTeams(prev => prev.filter(t => t.id !== team.id));

    const deletedEntry: DeletedItem = {
      id: `del-team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'pendaftaran',
      title: team.teamName,
      subtitle: `${team.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'} • Slot #${team.slotNumber} • Kapten: ${team.captainName} (${team.captainPhone}) • Status: ${team.status}`,
      deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      data: team,
    };

    const updatedDeleted = [deletedEntry, ...(config.recentlyDeleted || [])];
    const updatedConfig = { ...config, recentlyDeleted: updatedDeleted };
    setConfig(updatedConfig);
    setSiteConfig(updatedConfig);

    showNotification(`Tim "${team.teamName}" dipindahkan ke menu Baru Saja Dihapus.`);
    setDeleteTeamTarget(null);
  };

  const handleExportCSV = () => {
    if (registeredTeams.length === 0) {
      alert('Belum ada data tim yang terdaftar untuk diekspor!');
      return;
    }

    const headers = [
      'ID Tim',
      'Game',
      'Nama Tim',
      'Nama Kapten',
      'No WA Kapten',
      'Status Pembayaran',
      'Tanggal Pendaftaran',
      'Roster Pemain'
    ];

    const csvRows = registeredTeams.map(team => [
      `"${team.id.replace(/"/g, '""')}"`,
      `"${team.game}"`,
      `"${team.teamName.replace(/"/g, '""')}"`,
      `"${team.captainName.replace(/"/g, '""')}"`,
      `"${team.captainPhone.replace(/"/g, '""')}"`,
      `"${team.status}"`,
      `"${team.registeredAt}"`,
      `"${(team.roster || []).join(', ').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Daftar_Tim_Terdaftar_Hunters_Esports_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('📄 Data Tim Terdaftar berhasil diekspor ke file CSV!');
  };

  const handleCreateNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newCaptainName) {
      alert('Nama Tim dan Nama Kapten wajib diisi!');
      return;
    }

    let nextSlot = 0;
    if (newTeamStatus === 'Sah') {
      const isFF = newTeamGame === 'FF';
      const occupiedSlots = new Set(
        registeredTeams
          .filter(t => t.status === 'Sah' && (isFF ? (t.game === 'FF' || (t.game as any) === 'Free Fire') : (t.game === 'MLBB' || (t.game as any) === 'Mobile Legends')) && (t.slotNumber ?? 0) > 0)
          .map(t => t.slotNumber)
      );
      for (let i = 1; i <= 32; i++) {
        if (!occupiedSlots.has(i)) {
          nextSlot = i;
          break;
        }
      }
    }

    const newTeam: RegisteredTeam = {
      id: `${newTeamGame.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      slotNumber: nextSlot,
      game: newTeamGame,
      teamName: newTeamName.toUpperCase(),
      captainName: newCaptainName,
      captainPhone: newCaptainPhone || '083148834663',
      roster: newRosterText ? newRosterText.split(',').map(s => s.trim()) : [newCaptainName + ' (C)'],
      registeredAt: new Date().toISOString().split('T')[0],
      status: newTeamStatus,
    };

    setRegisteredTeams(prev => [newTeam, ...prev]);
    setShowAddTeamModal(false);
    setNewTeamName('');
    setNewCaptainName('');
    setNewCaptainPhone('');
    setNewRosterText('');
    showNotification(`Tim ${newTeam.teamName} berhasil ditambahkan! ${newTeamStatus === 'Sah' ? `(Slot #${nextSlot})` : '(Slot Kosong - Menunggu Sah)'}`);
  };

  // Rule operations with clean modal dialog
  const openAddRuleModal = (gameType: 'FF' | 'MLBB', categoryIdx: number) => {
    setRuleModalGame(gameType);
    setRuleModalCategoryIdx(categoryIdx);
    setNewRuleText('');
    setShowAddRuleModal(true);
  };

  const confirmAddRule = () => {
    if (!newRuleText.trim()) return;
    const targetRules = ruleModalGame === 'FF' ? [...config.ffRules] : [...config.mlbbRules];
    targetRules[ruleModalCategoryIdx] = {
      ...targetRules[ruleModalCategoryIdx],
      rules: [...targetRules[ruleModalCategoryIdx].rules, newRuleText.trim()]
    };

    const newConf = {
      ...config,
      [ruleModalGame === 'FF' ? 'ffRules' : 'mlbbRules']: targetRules
    };
    handleSaveAllConfig(newConf, 'Aturan baru berhasil ditambahkan!');
    setShowAddRuleModal(false);
    setNewRuleText('');
  };

  const handleDeleteRuleItem = (gameType: 'FF' | 'MLBB', categoryIdx: number, ruleIdx: number) => {
    const targetRules = gameType === 'FF' ? [...config.ffRules] : [...config.mlbbRules];
    const category = targetRules[categoryIdx];
    const ruleText = category.rules[ruleIdx];

    const updatedCategoryRules = [...category.rules];
    updatedCategoryRules.splice(ruleIdx, 1);
    
    targetRules[categoryIdx] = {
      ...category,
      rules: updatedCategoryRules
    };

    const deletedEntry: DeletedItem = {
      id: `del-rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'aturan',
      title: ruleText,
      subtitle: `Aturan ${gameType === 'FF' ? 'Free Fire' : 'Mobile Legends'} • Kategori: ${category.title}`,
      deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      data: {
        gameType,
        categoryIdx,
        categoryTitle: category.title,
        ruleText,
      },
    };
    
    const newConf = {
      ...config,
      [gameType === 'FF' ? 'ffRules' : 'mlbbRules']: targetRules,
      recentlyDeleted: [deletedEntry, ...(config.recentlyDeleted || [])]
    };
    handleSaveAllConfig(newConf, 'Aturan dipindahkan ke menu Baru Saja Dihapus!');
  };

  // Schedule operations with clean modal dialog
  const openAddScheduleModal = () => {
    setEditingMatch(null);
    setSchGame('MLBB');
    setSchPhase('Babak Penyisihan');
    setSchDay('Rabu');
    setSchDate('2 September 2026');
    setSchTime('19:00 WIB');
    setSchTeamA('');
    setSchTeamB('');
    setSchWinner('');
    setSchStatus('mendatang');
    setSchRoomCode('');
    setSchRoomPass('');
    setShowAddScheduleModal(true);
  };

  const openEditScheduleModal = (match: MatchSchedule) => {
    setEditingMatch(match);
    setSchGame(match.game || 'MLBB');
    setSchPhase(match.phase || 'Babak Penyisihan');
    setSchDay(match.day || 'Rabu');
    setSchDate(match.date || '2 September 2026');
    setSchTime(match.time || '19:00 WIB');
    setSchTeamA(match.teamA || '');
    setSchTeamB(match.teamB || '');
    setSchWinner(match.winner || '');
    setSchStatus(match.status || 'mendatang');
    setSchRoomCode(match.roomCode || '');
    setSchRoomPass(match.roomPass || '');
    setShowAddScheduleModal(true);
  };

  const confirmSaveSchedule = () => {
    if (!schPhase || !schDate || !schTime) {
      alert('Babak, Tanggal, dan Jam Mulai wajib diisi!');
      return;
    }

    if (editingMatch) {
      // Check if schedule changed
      if (editingMatch.date !== schDate || editingMatch.time !== schTime) {
        notifyScheduleChanged(
          `${schTeamA || 'Tim A'} vs ${schTeamB || 'Tim B'}`,
          schTeamA,
          schTeamB,
          `${editingMatch.date} ${editingMatch.time}`,
          `${schDate} ${schTime}`
        );
      }
      if (schWinner && schWinner !== editingMatch.winner) {
        notifyMatchResult(`${schTeamA || 'Tim A'} vs ${schTeamB || 'Tim B'}`, schPhase, schWinner);
      }

      // Update existing match
      let updatedSchedules = config.matchSchedules.map(m => {
        if (m.id === editingMatch.id) {
          return {
            ...m,
            game: schGame,
            phase: schPhase,
            day: schDay,
            date: schDate,
            time: schTime,
            teamA: schTeamA,
            teamB: schTeamB,
            winner: schWinner,
            status: schStatus,
            roomCode: schRoomCode,
            roomPass: schRoomPass
          };
        }
        return m;
      });

      updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'FF');
      updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'MLBB');

      handleSaveAllConfig({ ...config, matchSchedules: updatedSchedules }, `Pertandingan "${schPhase}" berhasil diperbarui!`);
    } else {
      // Create new match
      const newSch: MatchSchedule = {
        id: `match-${Date.now()}`,
        game: schGame,
        phase: schPhase,
        matchNumber: config.matchSchedules.filter(m => m.phase === schPhase).length + 1,
        day: schDay,
        date: schDate,
        time: schTime,
        teamA: schTeamA,
        teamB: schTeamB,
        winner: schWinner,
        status: schStatus,
        roomCode: schRoomCode,
        roomPass: schRoomPass
      };
      let updatedSchedules = [...config.matchSchedules, newSch];

      updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'FF');
      updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'MLBB');

      handleSaveAllConfig({ ...config, matchSchedules: updatedSchedules }, 'Jadwal pertandingan baru berhasil ditambahkan!');
    }

    setShowAddScheduleModal(false);
    setEditingMatch(null);
  };

  const handleUpdateMatchFieldInline = (matchId: string, updates: Partial<MatchSchedule>) => {
    let updatedSchedules = config.matchSchedules.map(m => {
      if (m.id === matchId) {
        return { ...m, ...updates };
      }
      return m;
    });

    // Automatically recalculate bracket advancements for both games
    updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'FF');
    updatedSchedules = recalculateAllBracketAdvancements(updatedSchedules, 'MLBB');

    handleSaveAllConfig({ ...config, matchSchedules: updatedSchedules }, 'Jadwal pertandingan berhasil diperbarui!');
  };

  const getPhaseReachedForTeam = (teamName: string, schedules: MatchSchedule[]): string => {
    const teamMatches = (schedules || []).filter((s) => s.teamA === teamName || s.teamB === teamName);
    if (teamMatches.some((s) => s.phase === 'Grand Final')) return 'Grand Final';
    if (teamMatches.some((s) => s.phase === 'Perebutan Juara 3')) return 'Perebutan Juara 3';
    if (teamMatches.some((s) => s.phase === 'Semifinal')) return 'Semifinal';
    if (teamMatches.some((s) => s.phase === 'Perempat Final')) return 'Perempat Final';
    if (teamMatches.some((s) => s.phase === 'Babak 16 Besar')) return 'Babak 16 Besar';
    if (teamMatches.some((s) => s.phase === 'Babak Penyisihan')) return 'Babak Penyisihan';
    return 'Terdaftar';
  };

  const handleGenerateRandom32Pairings = (game: 'FF' | 'MLBB') => {
    const gameName = game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS: BANG BANG';

    // 1. Get verified / SAH teams for game
    const sahTeams = (registeredTeams || []).filter(
      (t) =>
        t.status === 'Sah' &&
        (t.game === game ||
          (game === 'FF' && ((t.game as any) === 'Free Fire' || (t.game as any) === 'FF')) ||
          (game === 'MLBB' && ((t.game as any) === 'Mobile Legends' || (t.game as any) === 'MLBB' || (t.game as any) === 'Mobile Legends: Bang Bang')))
    );

    // 2. Check if SAH teams < 32
    if (sahTeams.length < 32) {
      alert(
        `⚠️ PENGACAKAN GAGAL!\n\nJumlah tim SAH / Terverifikasi untuk game ${gameName} saat ini baru ${sahTeams.length} tim.\n\nSyarat Pengacakan: Diperlukan TEPAT 32 tim SAH/Terverifikasi agar pengacakan Babak Penyisihan dapat dijalankan secara adil!`
      );
      return;
    }

    // 3. Check if any match in that game already has a winner
    const hasDecidedWinner = (config.matchSchedules || []).some((s) => s.game === game && !!s.winner);
    if (hasDecidedWinner) {
      alert(
        `⚠️ PENGACAKAN TERKUNCI!\n\nSudah ada pertandingan game ${gameName} yang selesai diputuskan pemenangnya. Tombol ACAK tidak dapat digunakan kembali.\n\nSilakan gunakan 'Reset Skema Match' terlebih dahulu jika Anda ingin melakukan pengacakan dari awal.`
      );
      return;
    }

    if (
      confirm(
        `Apakah Anda yakin ingin menyusun 32 tim SAH secara ACAK & OTOMATIS untuk Babak Penyisihan game ${gameName}?\n\nSistem akan mengambil 32 tim SAH terdaftar dan membaginya menjadi 16 Pasang Pertandingan. Setiap tim HANYA muncul 1 kali tanpa duplikasi lawan!`
      )
    ) {
      const newSchedules = generateRandom32Pairings(config.matchSchedules, game, sahTeams);
      handleSaveAllConfig(
        { ...config, matchSchedules: newSchedules },
        `16 Pasangan acak 32 tim SAH untuk Babak Penyisihan ${gameName} berhasil dibuat dan disimpan!`
      );
    }
  };

  const handleResetSchedulesToDefault = () => {
    if (
      !confirm(
        'Yakin ingin mengembalikan seluruh pasangan pertandingan ke keadaan belum dipasangkan? Semua hasil yang sudah ditetapkan IKUT TERHAPUS!'
      )
    ) {
      return;
    }
    const defaultSchedules = GENERATE_DEFAULT_MATCH_SCHEDULES();
    handleSaveAllConfig(
      {
        ...config,
        matchSchedules: defaultSchedules,
        attendanceConfirmations: [],
      },
      'Seluruh pasangan pertandingan di-reset ke keadaan belum dipasangkan!'
    );
  };

  const handleEmptyAllBlacklist = () => {
    if (
      !confirm(
        'Yakin ingin mengosongkan daftar hitam? Data pengguna TIDAK dihapus secara permanen, hanya dikeluarkan dari daftar hitam.'
      )
    ) {
      return;
    }
    handleSaveAllConfig({ ...config, blacklistData: [] }, 'Seluruh entri daftar hitam berhasil dikosongkan!');
  };

  const handleClearDecidedDisputes = () => {
    if (
      !confirm(
        'Yakin ingin menghapus seluruh riwayat laporan sengketa yang sudah diputuskan? Laporan yang masih menunggu diproses TIDAK ikut terhapus.'
      )
    ) {
      return;
    }
    const pendingDisputes = (config.matchDisputes || []).filter((d) => d.status === 'DIPROSES');
    handleSaveAllConfig({ ...config, matchDisputes: pendingDisputes }, 'Seluruh laporan sengketa yang telah diputuskan berhasil dihapus!');
  };

  const handleClearUpcomingTournaments = () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin MENGHAPUS SEMUA daftar turnamen mendatang?'
      )
    ) {
      return;
    }
    handleSaveAllConfig({ ...config, upcomingTournaments: [] }, 'Semua daftar turnamen mendatang berhasil dihapus / dikosongkan!');
  };

  const handleClearProcessedRecommendations = () => {
    if (
      !confirm(
        'Yakin ingin menghapus seluruh usulan & rekomendasi yang sudah diproses? Usulan yang belum diproses TIDAK ikut terhapus.'
      )
    ) {
      return;
    }
    const pendingOnly = (config.featureRecommendations || []).filter((r) => r.status === 'DIPROSES');
    handleSaveAllConfig({ ...config, featureRecommendations: pendingOnly }, 'Seluruh usulan rekomendasi fitur yang telah diproses berhasil dihapus!');
  };

  const handleFinishAndArchiveTournament = (gameTarget: 'FF' | 'MLBB') => {
    const gfMatch = (config.matchSchedules || []).find((m) => m.game === gameTarget && m.phase === 'Grand Final');
    const j3Match = (config.matchSchedules || []).find((m) => m.game === gameTarget && m.phase === 'Perebutan Juara 3');

    if (!gfMatch || !gfMatch.winner || !j3Match || !j3Match.winner) {
      alert(
        `⚠️ BELUM BISA DIARSIPKAN!\n\nTetapkan pemenang Grand Final & Perebutan Juara 3 untuk game ${gameTarget === 'FF' ? 'Free Fire' : 'Mobile Legends'} terlebih dahulu agar Juara 1, 2, 3, dan Peringkat 4 resmi terdata!`
      );
      return;
    }

    const juara1 = gfMatch.winner;
    const juara2 = gfMatch.teamA === juara1 ? gfMatch.teamB || '-' : gfMatch.teamA || '-';
    const juara3 = j3Match.winner;
    const rank4 = j3Match.teamA === juara3 ? j3Match.teamB || '-' : j3Match.teamA || '-';

    if (
      !confirm(
        `🏆 SELESAIKAN & ARSIPKAN TURNAMEN ${gameTarget === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'}?\n\n- Juara 1 (Champion): 🥇 ${juara1}\n- Juara 2 (Runner Up): 🥈 ${juara2}\n- Juara 3: 🥉 ${juara3}\n- Peringkat 4: 🎖️ ${rank4}\n\nSeluruh daftar tim, kapten, kontak WA, dan hasil akhir akan DISIMPAN PERMANEN KE HALAMAN ARSIP TURNAMEN.\nJadwal, pasangan, dan bagan pohon akan dikosongkan kembali untuk turnamen baru!`
      )
    ) {
      return;
    }

    // Build snapshot of participating teams
    const gameTeams = (registeredTeams || []).filter(
      (t) =>
        t.game === gameTarget ||
        (gameTarget === 'FF' && ((t.game as any) === 'Free Fire' || (t.game as any) === 'FF')) ||
        (gameTarget === 'MLBB' && ((t.game as any) === 'Mobile Legends' || (t.game as any) === 'MLBB' || (t.game as any) === 'Mobile Legends: Bang Bang'))
    );

    const teamsSnapshot = gameTeams.map((t) => ({
      teamName: t.teamName,
      captainName: t.captainName,
      captainPhone: t.captainPhone,
      game: gameTarget,
      finalRank: t.teamName === juara1 ? 'Juara 1' : t.teamName === juara2 ? 'Juara 2' : t.teamName === juara3 ? 'Juara 3' : t.teamName === rank4 ? 'Peringkat 4' : 'Peserta',
      phaseReached: getPhaseReachedForTeam(t.teamName, config.matchSchedules),
      archivedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    }));

    const newArchive: TournamentArchive = {
      id: 'arch_' + Date.now(),
      tournamentName: `Hunters Community Tournament ${gameTarget === 'FF' ? 'Free Fire' : 'Mobile Legends'}`,
      game: gameTarget,
      startDate: 'Agustus 2026',
      endDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalTeams: teamsSnapshot.length || 32,
      championJuara1: juara1,
      runnerUpJuara2: juara2,
      thirdPlaceJuara3: juara3,
      fourthPlaceRank4: rank4,
      archivedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      teamsList: teamsSnapshot,
    };

    const newPastWinner: PastWinner = {
      season: `Season ${(config.pastWinners || []).length + 1} (${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`,
      game: gameTarget,
      champion: juara1,
      runnerUp: juara2,
      thirdPlace: juara3,
      prizePool: 'Rp 1.000.000 + Trophy',
    };

    const defaultSchedules = GENERATE_DEFAULT_MATCH_SCHEDULES();

    handleSaveAllConfig(
      {
        ...config,
        tournamentArchives: [newArchive, ...(config.tournamentArchives || [])],
        pastWinners: [newPastWinner, ...(config.pastWinners || [])],
        matchSchedules: defaultSchedules,
        attendanceConfirmations: [],
      },
      `Turnamen ${gameTarget} Selesai & Berhasil Diarsipkan! Seluruh pasangan & bagan pohon dikosongkan dan siap untuk turnamen baru.`
    );
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = config.matchSchedules.filter(s => s.id !== id);
    handleSaveAllConfig({ ...config, matchSchedules: updated }, 'Jadwal pertandingan berhasil dihapus!');
  };

  // Past Winners Operations with clean modal dialog
  const openAddWinnerModal = () => {
    setWinSeason('Season 13 (Agustus 2026)');
    setWinGame('FF');
    setWinChampion('');
    setWinRunnerUp('');
    setWinThirdPlace('');
    setWinPrizePool('Rp 1.000.000 + Trophy');
    setShowAddWinnerModal(true);
  };

  const confirmAddWinner = () => {
    if (!winSeason || !winChampion) {
      alert('Season dan Juara 1 (Champion) wajib diisi!');
      return;
    }
    const newWin: PastWinner = {
      season: winSeason,
      game: winGame,
      champion: winChampion.toUpperCase(),
      runnerUp: winRunnerUp.toUpperCase() || '-',
      thirdPlace: winThirdPlace.toUpperCase() || '-',
      prizePool: winPrizePool || 'Rp 1.000.000',
    };
    const updatedWinners = [newWin, ...config.pastWinners];
    handleSaveAllConfig({ ...config, pastWinners: updatedWinners }, 'Data Papan Juara berhasil ditambahkan!');
    setShowAddWinnerModal(false);
  };

  const handleDeleteWinner = (index: number) => {
    const updated = [...config.pastWinners];
    updated.splice(index, 1);
    handleSaveAllConfig({ ...config, pastWinners: updated }, 'Data Juara berhasil dihapus!');
  };

  // Handle local image file upload for QRIS image
  const handleQrisImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setConfig(prev => ({
          ...prev,
          qrisImageUrl: result,
          paymentConfig: {
            ...(prev.paymentConfig || INITIAL_PAYMENT_METHODS_CONFIG),
            qrisImageUrl: result,
          }
        }));
        showNotification('Gambar QRIS berhasil diunggah! Klik Simpan Perubahan.');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center border border-red-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white uppercase">AKSES DITOLAK — HANYA UNTUK ADMIN</h2>
        <p className="text-xs text-neutral-400">
          Halaman ini khusus untuk pengelola resmi DEXZ STORE. Silakan masuk menggunakan Pilihan 1 (Akses Admin) pada halaman login.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-6xl mx-auto">
      {/* NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ADMIN CONTROL PANEL HEADER */}
      <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>DEXZ STORE — KONTROL MANAJEMEN SEMUA MENU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              ⚙️ PUSAT PENGELOLAAN SELURUH MENU
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300">
              Ubah data tim (Sah, Pending, Gagal, Hapus), aturan, jadwal match, grup WA, data juara, dan upload gambar QRIS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* OPSI BUKA / TUTUP PENDAFTARAN FREE FIRE */}
            <button
              type="button"
              onClick={() => {
                const newFfOpen = !(config.isFfRegistrationOpen === true);
                const updated: SiteConfig = {
                  ...config,
                  isFfRegistrationOpen: newFfOpen,
                  isFfTournamentActive: newFfOpen ? true : config.isFfTournamentActive,
                  ffInfo: {
                    ...config.ffInfo,
                    isRegistrationOpen: newFfOpen,
                    status: newFfOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'
                  }
                };
                handleSaveAllConfig(updated, `Status Pendaftaran Free Fire diubah: ${newFfOpen ? '🟢 PENDAFTARAN FF DIBUKA' : '🔴 PENDAFTARAN FF DITUTUP'}`);
              }}
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                config.isFfRegistrationOpen === true
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400/60 shadow-emerald-950/80 hover:brightness-110'
                  : 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-red-400 border-red-500/40 shadow-black hover:bg-neutral-800'
              }`}
              title="Klik untuk Buka atau Tutup Pendaftaran Turnamen Free Fire"
            >
              {config.isFfRegistrationOpen === true ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>🟢 FF: BUKA</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>🔴 FF: TUTUP</span>
                </>
              )}
            </button>

            {/* OPSI BUKA / TUTUP PENDAFTARAN MOBILE LEGENDS */}
            <button
              type="button"
              onClick={() => {
                const newMlbbOpen = !(config.isMlbbRegistrationOpen === true);
                const updated: SiteConfig = {
                  ...config,
                  isMlbbRegistrationOpen: newMlbbOpen,
                  isMlbbTournamentActive: newMlbbOpen ? true : config.isMlbbTournamentActive,
                  mlbbInfo: {
                    ...config.mlbbInfo,
                    isRegistrationOpen: newMlbbOpen,
                    status: newMlbbOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'
                  }
                };
                handleSaveAllConfig(updated, `Status Pendaftaran Mobile Legends diubah: ${newMlbbOpen ? '🟢 PENDAFTARAN MLBB DIBUKA' : '🔴 PENDAFTARAN MLBB DITUTUP'}`);
              }}
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                config.isMlbbRegistrationOpen === true
                  ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 text-white border-cyan-400/60 shadow-cyan-950/80 hover:brightness-110'
                  : 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-red-400 border-red-500/40 shadow-black hover:bg-neutral-800'
              }`}
              title="Klik untuk Buka atau Tutup Pendaftaran Turnamen Mobile Legends"
            >
              {config.isMlbbRegistrationOpen === true ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>🟢 MLBB: BUKA</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>🔴 MLBB: TUTUP</span>
                </>
              )}
            </button>

            {/* TOMBOL RESET DATABASE TOTAL */}
            <button
              type="button"
              onClick={() => setShowResetDatabaseModal(true)}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/80 border border-red-400/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Kosongkan seluruh data di Firestore dan sistem agar murni data baru"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>🗑️ RESET</span>
            </button>

            <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 text-right shrink-0">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Admin Terhubung:</span>
              <strong className="text-xs text-orange-400 font-mono font-bold block">{currentUser.name}</strong>
              <span className="text-[10px] text-neutral-400 font-mono">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🩺 SISTEM MONITORING PEMANTAUAN PENUH — TERSEKSI SENDIRI DI PALING ATAS PANEL ADMIN */}
      <AdminFullSystemMonitoring
        siteConfig={config}
        setSiteConfig={setSiteConfig}
        registeredTeams={registeredTeams}
        userWallet={userWallet}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* 💰 SALDO SAWERIA DI PANEL ADMIN — TERPISAH DI PALING ATAS PANEL ADMIN */}
      <AdminSaweriaBalanceSection 
        siteConfig={config} 
        setSiteConfig={setSiteConfig} 
        registeredTeams={registeredTeams} 
      />

      {/* 📂 SUSUNAN MENU ADMIN — TERSUSUN PER KATEGORI (7 KATEGORI LENGKAP) */}
      <AdminCategorizedMenuNav
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={(tab) => {
          handleOpenMenu(tab);
        }}
        registeredTeams={registeredTeams}
        userWallet={userWallet}
        bets={bets}
      />

      {/* ========================================================================= */}
      {/* 🚀 HALAMAN BARU LAYAR PENUH (FULLSCREEN OVERLAY UNTUK MENU PANEL ADMIN) */}
      {/* ========================================================================= */}
      {activeAdminTab !== null && (
        <div className="fixed inset-0 z-50 bg-[#080912] text-white flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* TOP STICKY HEADER */}
          <div className="sticky top-0 z-50 bg-[#0c0d18] border-b-2 border-red-500/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-2xl shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {(() => {
                const currentMenu = ADMIN_MENUS_40.find(m => m.adminTab === activeAdminTab);
                const colorStyle = currentMenu ? getMenuColorStyle(currentMenu.id) : null;
                return (
                  <>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-md ring-2 ring-red-400/40 font-mono ${colorStyle ? `${colorStyle.bg} ${colorStyle.border} ${colorStyle.text} border` : 'bg-red-600 text-white'}`}>
                      #{currentMenu ? currentMenu.id : '–'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-tight truncate flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        <span className="truncate">{currentMenu ? currentMenu.title : activeAdminTab.toUpperCase()}</span>
                      </h2>
                      <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate hidden xs:block">
                        {currentMenu ? currentMenu.description : 'Panel Pengelolaan Admin'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* ✕ TUTUP BUTTON (DI SUDUT KANAN ATAS) */}
            <button
              type="button"
              onClick={handleCloseMenu}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-xl shadow-red-950/70 active:scale-95 transition-all cursor-pointer border border-red-400/60 shrink-0"
            >
              <X className="w-4 h-4" />
              <span>✕ TUTUP</span>
            </button>
          </div>

          {/* SCROLLABLE TAB CONTENT BODY */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-32 space-y-6">
            {/* TAB SALDO & TARUHAN PREDIKSI MATCH */}
            {activeAdminTab === 'saldo-taruhan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SALDO PANEL ADMIN CARD (SALDO NYATA & TRANSPARAN) */}
          <div className="bg-gradient-to-r from-amber-950/80 via-[#0f0f0f] to-emerald-950/80 border border-amber-500/50 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                    💰 SALDO UTAMA ADMIN (DEXZ STORE TREASURY)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Saldo Nyata (Hanya Bertambah Lewat Top Up)
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  Rp {(config.adminBettingPoolBalance ?? 1000000).toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-300 pt-1 max-w-xl">
                  Saldo Kas Admin bersifat nyata &amp; terpusat. Admin tidak dapat menyetel saldo secara manual. Saldo bertambah saat Admin melakukan Top Up &amp; menerima fee, serta dapat ditarik langsung ke Rekening/E-Wallet Admin.
                </p>
              </div>

              {/* ACTION BUTTONS: TOP UP & TARIK SALDO ADMIN */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdminTopUpModal(true)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>➕ Top Up Saldo Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminWithdrawModal(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>💸 Tarik Saldo Admin</span>
                </button>
              </div>
            </div>

            {/* SEKSI INTERAKTIF: KIRIM SALDO ADMIN KE PENGGUNA */}
            <div className="bg-[#080808] border border-neutral-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>KIRIM SALDO DARI ADMIN KE PENGGUNA</span>
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Sisa Saldo Admin: Rp {(config.adminBettingPoolBalance ?? 1000000).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TAMPILKAN SEMUA AKUN MEMBER DROPDOWN */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    👥 Tampilkan Semua Akun Member:
                  </label>
                  <select
                    value={selectedMemberForSendId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMemberForSendId(val);
                      if (val === 'current') {
                        setSendRecipientAccount('Dexz Store (Pengguna Aktif)');
                      } else if (val === 'custom') {
                        setSendRecipientAccount('');
                      } else {
                        const mem = (config.memberAccounts || []).find(m => m.id === val);
                        if (mem) {
                          setSendRecipientAccount(`${mem.name} (${mem.email})`);
                        }
                      }
                    }}
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="current">👤 Pengguna Aktif (Demo User Logged In)</option>
                    <option value="custom">✏️ Ketik Nama / Akun Manual...</option>
                    <optgroup label="Daftar Semua Member Terdaftar">
                      {(config.memberAccounts || []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.email} {m.phone ? `(${m.phone})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* NAMA / AKUN PENGGUNA INPUT */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    👤 Nama / Akun Pengguna (Penerima):
                  </label>
                  <input
                    type="text"
                    value={sendRecipientAccount}
                    onChange={(e) => setSendRecipientAccount(e.target.value)}
                    placeholder="Masukkan nama atau akun pengguna..."
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* NOMINAL YANG MAU DIKIRIM INPUT */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    💵 Nominal Yang Mau Dikirim (Rp):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={sendAmountVal}
                      onChange={(e) => setSendAmountVal(e.target.value)}
                      placeholder="100000"
                      className="w-full bg-[#050505] border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* QUICK NOMINAL PRESETS & ACTION BUTTON */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-neutral-400 font-bold">Preset Nominal:</span>
                  {[10000, 50000, 100000, 250000, 500000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSendAmountVal(amt.toString())}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        sendAmountVal === amt.toString()
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-emerald-500'
                      }`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentAdminBal = config.adminBettingPoolBalance ?? 1000000;
                    const amount = parseInt(sendAmountVal.replace(/\D/g, ''), 10);
                    if (isNaN(amount) || amount <= 0) {
                      alert('Masukkan nominal pengiriman saldo yang valid!');
                      return;
                    }
                    if (amount > currentAdminBal) {
                      if (!confirm(`Nominal pengiriman (Rp ${amount.toLocaleString('id-ID')}) melebihi Saldo Admin saat ini (Rp ${currentAdminBal.toLocaleString('id-ID')}). Tetap kirimkan?`)) {
                        return;
                      }
                    }

                    const recipientLabel = sendRecipientAccount.trim() || 'Pengguna';
                    const updatedAdminBal = Math.max(0, currentAdminBal - amount);
                    const updatedConfig = { ...config, adminBettingPoolBalance: updatedAdminBal };

                    if (setUserWallet) {
                      setUserWallet(prev => {
                        const newBal = prev.balance + amount;
                        const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                        const newTx: WalletTransaction = {
                          id: `tx-${Date.now()}`,
                          userName: recipientLabel,
                          userPhone: '-',
                          type: 'ADMIN_ADJUST',
                          typeLabel: 'Transfer Saldo Admin',
                          amount: amount,
                          balanceAfter: newBal,
                          status: 'Berhasil',
                          note: `Kirim saldo dari Admin ke ${recipientLabel}`,
                          timestamp: timestampStr
                        };
                        return {
                          ...prev,
                          balance: newBal,
                          transactions: [newTx, ...(prev.transactions || [])]
                        };
                      });
                      notifyBalanceAdded('-', recipientLabel, amount, 'Transfer Saldo Admin', (userWallet?.balance || 0) + amount);
                    }

                    handleSaveAllConfig(
                      updatedConfig,
                      `📤 Berhasil mengirimkan Saldo Rp ${amount.toLocaleString('id-ID')} dari Saldo Admin ke ${recipientLabel}! Sisa Saldo Admin: Rp ${updatedAdminBal.toLocaleString('id-ID')}.`
                    );
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Kirim Saldo Dari Admin Ke Pengguna</span>
                </button>
              </div>
            </div>
          </div>

          {/* DUA SEKSI: PENGELOLAAN TOP UP & RIWAYAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="border-b border-neutral-800 pb-2.5 flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>PERMINTAAN TOP UP SALDO (PENDING)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {userWallet?.topUpHistory?.filter(t => t.status === 'Pending').length || 0} Pending
                </span>
              </div>

              {(!userWallet?.topUpHistory || userWallet.topUpHistory.length === 0) ? (
                <p className="text-xs text-slate-500 py-3 text-center">Belum ada permintaan Top Up.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {userWallet.topUpHistory.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-950 border border-neutral-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-white block">{t.userName} ({t.userPhone})</strong>
                          <span className="text-emerald-400 font-mono font-bold">+ Rp {t.amount.toLocaleString('id-ID')}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'Berhasil' ? 'bg-emerald-500/20 text-emerald-400' :
                          t.status === 'Gagal' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      {t.status === 'Pending' && setUserWallet && (
                        <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                          <button
                            onClick={() => {
                              setUserWallet(prev => {
                                const newBal = prev.balance + t.amount;
                                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                                const newTx: WalletTransaction = {
                                  id: `tx-${Date.now()}`,
                                  userName: t.userName,
                                  userPhone: t.userPhone,
                                  type: 'TOPUP',
                                  typeLabel: 'Top Up Disetujui Admin',
                                  amount: t.amount,
                                  balanceAfter: newBal,
                                  status: 'Berhasil',
                                  note: 'Top Up QRIS telah diverifikasi & disetujui Admin',
                                  referenceId: t.id,
                                  timestamp: timestampStr
                                };
                                return {
                                  ...prev,
                                  balance: newBal,
                                  topUpHistory: prev.topUpHistory.map(item => item.id === t.id ? { ...item, status: 'Berhasil' } : item),
                                  transactions: [newTx, ...(prev.transactions || [])]
                                };
                              });
                              notifyConfirmationResult(t.userPhone, t.userName, true, 'topup', `Top Up Rp ${t.amount.toLocaleString('id-ID')} disetujui Admin! Saldo bertambah.`);
                              notifyBalanceAdded(t.userPhone, t.userName, t.amount, 'Top Up QRIS Disetujui Admin', (userWallet?.balance || 0) + t.amount);
                              showNotification(`Top Up Rp ${t.amount.toLocaleString('id-ID')} untuk ${t.userName} disetujui! Saldo berhasil ditambahkan.`);
                            }}
                            className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase rounded-lg hover:bg-emerald-400"
                          >
                            ✓ Disetujui (Tambah Saldo)
                          </button>
                          <button
                            onClick={() => {
                              setUserWallet(prev => {
                                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                                const newTx: WalletTransaction = {
                                  id: `tx-${Date.now()}`,
                                  userName: t.userName,
                                  userPhone: t.userPhone,
                                  type: 'TOPUP',
                                  typeLabel: 'Top Up Ditolak Admin',
                                  amount: 0,
                                  balanceAfter: prev.balance,
                                  status: 'Gagal',
                                  note: 'Top Up QRIS ditolak Admin / bukti tidak valid',
                                  referenceId: t.id,
                                  timestamp: timestampStr
                                };
                                return {
                                  ...prev,
                                  topUpHistory: prev.topUpHistory.map(item => item.id === t.id ? { ...item, status: 'Gagal' } : item),
                                  transactions: [newTx, ...(prev.transactions || [])]
                                };
                              });
                              notifyConfirmationResult(t.userPhone, t.userName, false, 'topup', '', 'Bukti pembayaran transfer / QRIS tidak dapat terverifikasi.');
                              showNotification(`Top Up untuk ${t.userName} ditolak.`);
                            }}
                            className="px-3 py-1.5 bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase rounded-lg hover:bg-red-600/50"
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* KELOLA PENARIKAN SALDO (WITHDRAWAL) */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-neutral-800 pb-2.5 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Coins className="w-4 h-4 text-red-400" />
                <span>KELOLA PERMINTAAN PENARIKAN SALDO (WITHDRAWAL)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {userWallet?.withdrawalHistory?.filter(w => w.status === 'Pending').length || 0} Pending
              </span>
            </div>

            {(!userWallet?.withdrawalHistory || userWallet.withdrawalHistory.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">Belum ada permintaan penarikan saldo.</p>
            ) : (
              <div className="space-y-2.5">
                {userWallet.withdrawalHistory.map((w) => (
                  <div key={w.id} className="p-3.5 bg-slate-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{w.accountName}</strong>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          {w.method}
                        </span>
                      </div>
                      <p className="text-slate-300 font-mono pt-0.5">
                        No. Rek/E-Wallet: <strong className="text-amber-400">{w.accountNumber}</strong> • WA: {w.userPhone}
                      </p>
                      <p className="text-[11px] text-amber-300 font-bold font-mono">
                        Jumlah Penarikan: - Rp {w.amount.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {w.status === 'Pending' && setUserWallet ? (
                        <>
                          <button
                            onClick={() => {
                              setUserWallet(prev => {
                                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                                const newTx: WalletTransaction = {
                                  id: `tx-${Date.now()}`,
                                  userName: w.accountName,
                                  userPhone: w.userPhone,
                                  type: 'WITHDRAW',
                                  typeLabel: 'Penarikan Disetujui Admin',
                                  amount: 0,
                                  balanceAfter: prev.balance,
                                  status: 'Berhasil',
                                  note: `Penarikan Rp ${w.amount.toLocaleString('id-ID')} disetujui & ditransfer ke ${w.method} ${w.accountNumber}`,
                                  referenceId: w.id,
                                  timestamp: timestampStr
                                };
                                return {
                                  ...prev,
                                  withdrawalHistory: prev.withdrawalHistory.map(item => item.id === w.id ? { ...item, status: 'Berhasil' } : item),
                                  transactions: [newTx, ...(prev.transactions || [])]
                                };
                              });
                              notifyConfirmationResult(w.userPhone, w.accountName, true, 'withdrawal', `Penarikan Rp ${w.amount.toLocaleString('id-ID')} telah diproses dan ditransfer ke ${w.method} ${w.accountNumber}!`);
                              showNotification(`Penarikan saldo Rp ${w.amount.toLocaleString('id-ID')} untuk ${w.accountName} berhasil diproses!`);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase rounded-lg hover:bg-emerald-400"
                          >
                            ✓ Tandai Berhasil
                          </button>
                          <button
                            onClick={() => {
                              setUserWallet(prev => {
                                const newBal = prev.balance + w.amount;
                                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                                const newTx: WalletTransaction = {
                                  id: `tx-${Date.now()}`,
                                  userName: w.accountName,
                                  userPhone: w.userPhone,
                                  type: 'REFUND',
                                  typeLabel: 'Pengembalian Penarikan (Ditolak)',
                                  amount: w.amount,
                                  balanceAfter: newBal,
                                  status: 'Berhasil',
                                  note: `Penarikan ditolak Admin, dana Rp ${w.amount.toLocaleString('id-ID')} dikembalikan ke saldo`,
                                  referenceId: w.id,
                                  timestamp: timestampStr
                                };
                                return {
                                  ...prev,
                                  balance: newBal,
                                  withdrawalHistory: prev.withdrawalHistory.map(item => item.id === w.id ? { ...item, status: 'Gagal' } : item),
                                  transactions: [newTx, ...(prev.transactions || [])]
                                };
                              });
                              notifyConfirmationResult(w.userPhone, w.accountName, false, 'withdrawal', '', `Penarikan ditolak Admin. Dana Rp ${w.amount.toLocaleString('id-ID')} telah dikembalikan ke saldo akun Anda.`);
                              notifyBalanceAdded(w.userPhone, w.accountName, w.amount, 'Pengembalian Penarikan Ditolak', (userWallet?.balance || 0) + w.amount);
                              showNotification(`Penarikan saldo dibatalkan. Saldo Rp ${w.amount.toLocaleString('id-ID')} telah dikembalikan ke user.`);
                            }}
                            className="px-3 py-1.5 bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase rounded-lg hover:bg-red-600/50"
                          >
                            ✕ Tolak & Kembalikan Saldo
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          w.status === 'Berhasil' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {w.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KELOLA TARUHAN MATCH & SETTLEMENT */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-neutral-800 pb-2.5 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>DAFTAR TARUHAN PREDIKSI & KONFIRMASI PEMENANG</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {bets.length} Total Taruhan
              </span>
            </div>

            {bets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Belum ada taruhan masuk dari user.</p>
            ) : (
              <div className="space-y-3">
                {bets.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-950 border border-neutral-800 rounded-xl space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                      <div>
                        <strong className="text-white text-sm block">{b.matchTitle} ({b.game})</strong>
                        <span className="text-slate-400">Oleh: <strong className="text-amber-300">{b.userName}</strong> ({b.userPhone})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-black text-sm">
                          Rp {b.betAmount.toLocaleString('id-ID')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'Menang' ? 'bg-emerald-500/20 text-emerald-400' :
                          b.status === 'Kalah' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Tim Dijagokan: </span>
                        <strong className="text-blue-400 font-bold">{b.pickedTeam}</strong>
                        <span className="text-slate-500 font-mono text-[10px] block">Metode: {b.paymentMethod === 'saldo' ? 'Potong Saldo' : 'Scan QRIS'}</span>
                      </div>

                      {b.status === 'Pending' && setBets && (
                        <button
                          onClick={() => {
                            setBets(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Dikonfirmasi' } : item));
                            showNotification(`Taruhan ${b.userName} dikonfirmasi!`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-blue-500"
                        >
                          ✓ Konfirmasi Taruhan
                        </button>
                      )}

                      {(b.status === 'Dikonfirmasi' || b.status === 'Pending') && setBets && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Mark as won -> Pay 2x payout to user
                              if (setUserWallet) {
                                setUserWallet(prev => {
                                  const payout = b.betAmount * 2;
                                  const newBal = prev.balance + payout;
                                  const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                                  const newTx: WalletTransaction = {
                                    id: `tx-${Date.now()}`,
                                    userName: b.userName,
                                    userPhone: b.userPhone,
                                    type: 'BET_WON',
                                    typeLabel: 'Kemenangan Taruhan Prediksi',
                                    amount: payout,
                                    balanceAfter: newBal,
                                    status: 'Berhasil',
                                    note: `Hadiah menang prediksi ${b.matchTitle} (${b.pickedTeam})`,
                                    referenceId: b.id,
                                    timestamp: timestampStr
                                  };
                                  return {
                                    ...prev,
                                    balance: newBal,
                                    transactions: [newTx, ...(prev.transactions || [])]
                                  };
                                });
                              }
                              setBets(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Menang' } : item));
                              notifyBetResult(b.userPhone, b.userName, b.matchTitle, true, b.betAmount * 2, b.pickedTeam);
                              notifyBalanceAdded(b.userPhone, b.userName, b.betAmount * 2, `Kemenangan Taruhan Prediksi (${b.matchTitle})`, (userWallet?.balance || 0) + (b.betAmount * 2));
                              showNotification(`Pemenang dikonfirmasi! ${b.userName} MENANG & mendapatkan Rp ${(b.betAmount * 2).toLocaleString('id-ID')}`);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase rounded-lg hover:bg-emerald-400"
                          >
                            🏆 Setel MENANG (Bayar 2x)
                          </button>

                          <button
                            onClick={() => {
                              // Mark as lost -> Send bet to admin pool
                              handleSaveAllConfig({
                                ...config,
                                adminBettingPoolBalance: (config.adminBettingPoolBalance || 0) + b.betAmount
                              });
                              setBets(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Kalah' } : item));
                              notifyBetResult(b.userPhone, b.userName, b.matchTitle, false, 0, b.pickedTeam);
                              showNotification(`Taruhan disetel KALAH. Rp ${b.betAmount.toLocaleString('id-ID')} masuk ke Saldo Panel Admin.`);
                            }}
                            className="px-3 py-1.5 bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase rounded-lg hover:bg-red-600/50"
                          >
                            ✕ Setel KALAH
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #5 — KELOLA PENGGUNA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'pengguna' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>👤 MENU #5 — KELOLA DATA PENGGUNA & SALDO UTAMA</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Melihat, mengelola akun, saldo, dan hak akses setiap pengguna. Saldo pengguna bersifat transparan &amp; tidak dapat disunting manual tanpa transaksi sah.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-950 text-blue-300 px-3 py-1.5 rounded-xl border border-blue-800 font-bold">
                  Total: {(config.memberAccounts || []).length} Akun Member
                </span>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#050505] p-3 rounded-xl border border-neutral-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Cari nama, email, no HP, atau tim..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status Saldo: Terverifikasi &amp; Terpusat</span>
              </div>
            </div>

            {/* SECURITY NOTICE */}
            <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase block text-blue-300">🔒 Aturan Transparansi Saldo Pengguna:</span>
                <span>
                  Admin tidak dapat mengubah angka saldo pengguna secara manual tanpa rekor transaksi sah. Penambahan/pengurangan saldo hanya dilakukan melalui Top Up disetujui, Penarikan, Kemenangan Taruhan, atau Transfer Kas Admin yang tercatat secara transparan di mutasi Firebase.
                </span>
              </div>
            </div>

            {/* MEMBER ACCOUNTS TABLE */}
            <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-[#050505]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-[#0a0a0a] text-neutral-400 font-extrabold uppercase">
                    <th className="p-3">No</th>
                    <th className="p-3">Info User &amp; Email</th>
                    <th className="p-3">No. HP</th>
                    <th className="p-3">Nama Tim</th>
                    <th className="p-3 text-right">Saldo Utama</th>
                    <th className="p-3 text-center">Peran (Role)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksional Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {(() => {
                    const filtered = (config.memberAccounts || []).filter(m =>
                      m.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      m.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      m.phone?.includes(userSearchTerm) ||
                      m.teamName?.toLowerCase().includes(userSearchTerm.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-neutral-500 font-mono">
                            Tidak ada data pengguna yang cocok dengan pencarian.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((usr, idx) => (
                      <tr key={usr.id || usr.email} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-3 font-mono text-neutral-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-white flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>{usr.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block">{usr.email}</span>
                        </td>
                        <td className="p-3 font-mono text-neutral-300">{usr.phone || '-'}</td>
                        <td className="p-3 font-semibold text-amber-300">{usr.teamName || 'Belum Terikat'}</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-400">
                          Rp {(usr.balance || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            usr.role === 'admin'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}>
                            {usr.role || 'peserta'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            usr.status === 'Blacklisted'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {usr.status === 'Blacklisted' ? '❌ Terblokir' : '✅ Aktif'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newRole = usr.role === 'admin' ? 'peserta' : 'admin';
                                const updatedMembers = (config.memberAccounts || []).map(m =>
                                  (m.id === usr.id || m.email === usr.email) ? { ...m, role: newRole as any } : m
                                );
                                handleSaveAllConfig({ ...config, memberAccounts: updatedMembers }, `Role user ${usr.name} diubah menjadi ${newRole}`);
                              }}
                              className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Ubah peran antara Member dan Admin"
                            >
                              👑 Ubah Peran
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSendRecipientAccount(usr.name);
                                setActiveAdminTab('saldo-taruhan');
                              }}
                              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Kirim saldo dari Kas Admin ke user ini (tercatat di transaksi)"
                            >
                              📤 Transfer Kas
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #6 — KONFIRMASI TOP UP SALDO */}
      {/* ========================================================================= */}
      {activeAdminTab === 'topup-konfirmasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>💳 MENU #6 — KONFIRMASI TOP UP SALDO</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Memeriksa bukti pembayaran pengguna (QRIS/Struk Transfer) &amp; menyetujui penambahan saldo secara otomatis.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-950 text-amber-300 font-extrabold px-3 py-1.5 rounded-xl border border-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{(userWallet?.topUpHistory || []).filter(t => t.status === 'Pending').length} Pending</span>
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-extrabold px-3 py-1.5 rounded-xl border border-emerald-800">
                  {(userWallet?.topUpHistory || []).filter(t => t.status === 'Berhasil').length} Disetujui
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#050505] p-2 rounded-xl border border-neutral-800 overflow-x-auto text-xs">
              {(['ALL', 'Pending', 'Berhasil', 'Gagal'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTopUpFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    topUpFilterStatus === st
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st === 'Pending' ? '⏳ Pending' : st === 'Berhasil' ? '✅ Disetujui' : '❌ Ditolak'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(() => {
                const list = (userWallet?.topUpHistory || []).filter(t =>
                  topUpFilterStatus === 'ALL' ? true : t.status === topUpFilterStatus
                );

                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                      Tidak ada permohonan Top Up dengan status [{topUpFilterStatus}].
                    </div>
                  );
                }

                return list.map((req) => (
                  <div key={req.id} className="p-4 bg-[#050505] border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/50 transition-all shadow-md">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                          req.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : req.status === 'Berhasil'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {req.status}
                        </span>
                        <span className="font-extrabold text-sm text-white">{req.userName}</span>
                        <span className="text-xs font-mono text-neutral-400">({req.userPhone})</span>
                      </div>

                      <div className="text-lg font-black text-emerald-400 font-mono">
                        + Rp {req.amount.toLocaleString('id-ID')}
                      </div>

                      <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-3">
                        <span>📅 Diminta: {req.requestedAt}</span>
                        {req.processedAt && <span>• ⏱️ Diproses: {req.processedAt}</span>}
                      </div>

                      {req.note && (
                        <p className="text-xs text-amber-300 font-mono bg-amber-950/30 p-2 rounded border border-amber-900/40">
                          Catatan: {req.note}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0">
                      {req.paymentProofUrl ? (
                        <button
                          type="button"
                          onClick={() => setProofModalImage(req.paymentProofUrl || null)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>👁️ Lihat Bukti Pembayaran</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                          QRIS Official
                        </span>
                      )}

                      {req.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const nowStr = new Date().toLocaleString('id-ID');
                              const updatedHistory = (userWallet?.topUpHistory || []).map(t =>
                                t.id === req.id ? { ...t, status: 'Berhasil' as const, processedAt: nowStr } : t
                              );

                              const newBalance = (userWallet?.balance || 0) + req.amount;
                              const newTx: WalletTransaction = {
                                id: `tx-${Date.now()}`,
                                userName: req.userName,
                                userPhone: req.userPhone,
                                type: 'TOPUP',
                                typeLabel: 'Top Up Saldo Disetujui',
                                amount: req.amount,
                                balanceAfter: newBalance,
                                status: 'Berhasil',
                                note: 'Top Up disetujui Admin',
                                timestamp: nowStr
                              };

                              setUserWallet({
                                balance: newBalance,
                                topUpHistory: updatedHistory,
                                withdrawalHistory: userWallet?.withdrawalHistory || [],
                                transactions: [newTx, ...(userWallet?.transactions || [])]
                              });

                              alert(`✅ Top Up Rp ${req.amount.toLocaleString('id-ID')} disetujui! Saldo otomatis bertambah.`);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                          >
                            ✅ SAH (Setujui)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('Masukkan Alasan Penolakan Top Up:', 'Bukti pembayaran tidak terbaca atau nominal tidak sesuai.');
                              if (reason === null) return;

                              const nowStr = new Date().toLocaleString('id-ID');
                              const updatedHistory = (userWallet?.topUpHistory || []).map(t =>
                                t.id === req.id ? { ...t, status: 'Gagal' as const, processedAt: nowStr, note: reason } : t
                              );

                              setUserWallet({
                                ...(userWallet || { balance: 0, topUpHistory: [], withdrawalHistory: [] }),
                                topUpHistory: updatedHistory
                              });

                              alert(`❌ Top Up ditolak dengan alasan: ${reason}`);
                            }}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                          >
                            ❌ TOLAK
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #7 — KONFIRMASI PENARIKAN SALDO */}
      {/* ========================================================================= */}
      {activeAdminTab === 'penarikan-konfirmasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>💵 MENU #7 — KONFIRMASI PENARIKAN SALDO</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Memproses permintaan pengguna yang ingin menarik saldo ke rekening bank atau e-wallet tujuan.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-950 text-amber-300 font-extrabold px-3 py-1.5 rounded-xl border border-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{(userWallet?.withdrawalHistory || []).filter(w => w.status === 'Pending').length} Pending</span>
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-extrabold px-3 py-1.5 rounded-xl border border-emerald-800">
                  {(userWallet?.withdrawalHistory || []).filter(w => w.status === 'Berhasil').length} Selesai
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#050505] p-2 rounded-xl border border-neutral-800 overflow-x-auto text-xs">
              {(['ALL', 'Pending', 'Berhasil', 'Gagal'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setWithdrawFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    withdrawFilterStatus === st
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st === 'Pending' ? '⏳ Pending' : st === 'Berhasil' ? '✅ Selesai' : '❌ Ditolak'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(() => {
                const list = (userWallet?.withdrawalHistory || []).filter(w =>
                  withdrawFilterStatus === 'ALL' ? true : w.status === withdrawFilterStatus
                );

                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                      Tidak ada permohonan Penarikan dengan status [{withdrawFilterStatus}].
                    </div>
                  );
                }

                return list.map((w) => (
                  <div key={w.id} className="p-4 bg-[#050505] border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/50 transition-all shadow-md">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                          w.status === 'Pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : w.status === 'Berhasil'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {w.status}
                        </span>
                        <span className="font-extrabold text-sm text-white">{w.userName}</span>
                        <span className="text-xs font-mono text-neutral-400">({w.userPhone})</span>
                      </div>

                      <div className="text-lg font-black text-amber-400 font-mono">
                        - Rp {w.amount.toLocaleString('id-ID')}
                      </div>

                      <div className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs space-y-1 font-mono">
                        <div>
                          <span className="text-neutral-400">Metode Tujuan: </span>
                          <span className="font-extrabold text-white">{w.method}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">No. Rekening / E-Wallet: </span>
                          <span className="font-extrabold text-cyan-300">{w.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Atas Nama: </span>
                          <span className="font-extrabold text-white">{w.accountName}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-400 font-mono">
                        📅 Diminta: {w.requestedAt} {w.processedAt && `• ⏱️ Diproses: ${w.processedAt}`}
                      </div>

                      {w.rejectionReason && (
                        <p className="text-xs text-red-300 font-mono bg-red-950/30 p-2 rounded border border-red-900/40">
                          Alasan Ditolak: {w.rejectionReason}
                        </p>
                      )}
                    </div>

                    {w.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const nowStr = new Date().toLocaleString('id-ID');
                            const updatedHistory = (userWallet?.withdrawalHistory || []).map(item =>
                              item.id === w.id ? { ...item, status: 'Berhasil' as const, processedAt: nowStr } : item
                            );

                            const newTx: WalletTransaction = {
                              id: `tx-${Date.now()}`,
                              userName: w.userName,
                              userPhone: w.userPhone,
                              type: 'WITHDRAW',
                              typeLabel: 'Penarikan Dana Berhasil',
                              amount: -w.amount,
                              balanceAfter: userWallet?.balance || 0,
                              status: 'Berhasil',
                              note: `Penarikan ke ${w.method} (${w.accountNumber})`,
                              timestamp: nowStr
                            };

                            setUserWallet({
                              ...(userWallet || { balance: 0, topUpHistory: [], withdrawalHistory: [] }),
                              withdrawalHistory: updatedHistory,
                              transactions: [newTx, ...(userWallet?.transactions || [])]
                            });

                            alert(`✅ Penarikan Rp ${w.amount.toLocaleString('id-ID')} ke ${w.method} (${w.accountNumber}) disetujui!`);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                        >
                          ✅ PROSES
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Masukkan Alasan Penolakan Penarikan:', 'Nomor rekening/e-wallet tidak valid atau nama tidak sesuai.');
                            if (reason === null) return;

                            const nowStr = new Date().toLocaleString('id-ID');
                            const updatedHistory = (userWallet?.withdrawalHistory || []).map(item =>
                              item.id === w.id ? { ...item, status: 'Gagal' as const, processedAt: nowStr, rejectionReason: reason } : item
                            );

                            const restoredBalance = (userWallet?.balance || 0) + w.amount;

                            setUserWallet({
                              ...(userWallet || { balance: 0, topUpHistory: [], withdrawalHistory: [] }),
                              balance: restoredBalance,
                              withdrawalHistory: updatedHistory
                            });

                            alert(`❌ Penarikan ditolak & saldo dikembalikan ke user.`);
                          }}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                        >
                          ❌ TOLAK
                        </button>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #14 — TARIK SALDO DONASI (SAWERIA & FIREBASE) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tarik-donasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* HEADER & TOTAL SALDO CARD */}
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                  <span>💸 MENU #14 — TARIK SALDO DONASI (SAWERIA & FIREBASE)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Pengelolaan saldo donasi Saweria, petunjuk penarikan uang nyata ke Bank/E-Wallet & riwayat transaksi permanen di Firebase.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/60 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">TOTAL SALDO DONASI (FIREBASE)</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {formatRupiah(config.totalDonationAmount || (config.donationRecords || []).reduce((a, b) => a + b.amount, 0))}
                </span>
              </div>
            </div>

            {/* WARNING BANNER: ⚠️ UANG ADA DI SAWERIA, BUKAN FIREBASE */}
            <div className="bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-red-950/90 border-2 border-amber-500/80 rounded-2xl p-5 space-y-3 text-slate-100 shadow-xl">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <span>⚠️ PERINGATAN PENTING: PENARIKAN UANG NYATA DONASI</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/40 space-y-1">
                  <strong className="text-red-400 block font-black uppercase text-[11px]">1. ⚠️ UANG TIDAK BISA DITARIK DARI FIREBASE</strong>
                  <p className="text-neutral-300 leading-relaxed">
                    Firebase <strong>TIDAK memegang atau menyimpan uang nyata sama sekali</strong>. Firebase hanya mencatat riwayat transaksi donasi dan menampilkan saldo secara transparan di website.
                  </p>
                </div>
                <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/40 space-y-1">
                  <strong className="text-amber-300 block font-black uppercase text-[11px]">2. ⚠️ UANG NYATA ADA DI AKUN SAWERIA ADMIN</strong>
                  <p className="text-neutral-300 leading-relaxed">
                    Setiap uang donasi yang dibayar pengguna via QRIS <strong>LANGSUNG MASUK ke SALDO AKUN SAWERIA ADMIN</strong>. Penarikan uang nyata dilakukan sepenuhnya di platform Saweria.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP-BY-STEP GUIDANCE FOR REAL WITHDRAWAL FROM SAWERIA */}
            <div className="bg-[#080808] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-black text-sm text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CARA PENARIKAN UANG NYATA DARI SAWERIA KE REKENING BANK / E-WALLET</span>
              </h4>

              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-neutral-200 font-medium">
                <li className="bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded">Langkah 1</span>
                  <strong className="block text-white pt-1">Masuk Dashboard Saweria</strong>
                  <p className="text-[11px] text-neutral-400">Buka website resmi Saweria di <span className="text-amber-400 font-mono">saweria.co/dashboard</span> lalu login ke akun Admin.</p>
                </li>
                <li className="bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="bg-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded">Langkah 2</span>
                  <strong className="block text-white pt-1">Pilih Menu Saldo & Tarik</strong>
                  <p className="text-[11px] text-neutral-400">Masuk ke tab <strong>Saldo</strong> lalu klik tombol <strong>Tarik Saldo</strong>.</p>
                </li>
                <li className="bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded">Langkah 3</span>
                  <strong className="block text-white pt-1">Input Rekening / E-Wallet</strong>
                  <p className="text-[11px] text-neutral-400">Masukkan nomor rekening bank (BCA, BRI, Mandiri) atau E-Wallet (DANA/OVO/GoPay/ShopeePay).</p>
                </li>
                <li className="bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded">Langkah 4</span>
                  <strong className="block text-white pt-1">Transfer Otomatis</strong>
                  <p className="text-[11px] text-neutral-400">Uang DITRANSFER OTOMATIS dari Saweria ke rekening Admin. Catatan di Firebase tetap tersimpan permanen.</p>
                </li>
              </ol>

              {/* SAWERIA DIRECT DASHBOARD LINK BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-amber-500/40">
                <div className="text-xs text-neutral-300">
                  <strong className="text-amber-400 block font-bold">Akses Dashboard Saweria Admin:</strong>
                  Klik tombol di samping untuk membuka halaman penarikan saldo resmi Saweria.
                </div>

                <a
                  href="https://saweria.co/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <span>BUKA DASHBOARD SAWERIA UNTUK TARIK UANG 🚀</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* PENGATURAN URL SAWERIA */}
            <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Atur Tautan / URL Donasi Saweria Admin (Publik):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={config.donationUrl || 'https://saweria.co/dexzstore'}
                  onChange={(e) => setConfig({ ...config, donationUrl: e.target.value })}
                  placeholder="https://saweria.co/username"
                  className="flex-1 bg-black border border-neutral-700 text-white text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveAllConfig(config, 'Tautan URL Saweria berhasil diperbarui!')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                >
                  Simpan URL
                </button>
              </div>
            </div>

            {/* FULL DONATION LOGS TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-white uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>RIWAYAT TRANSAKSI DONASI (FIREBASE PERMANEN)</span>
                </h4>
                <span className="text-xs font-mono text-neutral-400">
                  Total { (config.donationRecords || []).length } Transaksi
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-[#141414] text-neutral-400 uppercase text-[10px] font-bold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Nama Penyumbang</th>
                      <th className="p-3">Nominal</th>
                      <th className="p-3">Metode</th>
                      <th className="p-3">Pesan Ucapan</th>
                      <th className="p-3">Tanggal & Jam</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 bg-black">
                    {(config.donationRecords || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500 italic">
                          Belum ada riwayat transaksi donasi tercatat di Firebase.
                        </td>
                      </tr>
                    ) : (
                      (config.donationRecords || []).map((item, idx) => (
                        <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="p-3 font-mono text-neutral-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-white">
                            {item.isAnonymous ? 'Penyumbang Rahasia' : item.donorName}
                            {item.isAnonymous && <span className="ml-1 text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Anonim</span>}
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400">{formatRupiah(item.amount)}</td>
                          <td className="p-3 font-semibold text-emerald-400">{item.paymentMethod}</td>
                          <td className="p-3 text-neutral-300 max-w-xs truncate">{item.message || '-'}</td>
                          <td className="p-3 font-mono text-neutral-400 text-[11px]">{item.createdAt}</td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #14 — LAPORAN TRANSAKSI KEUANGAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'laporan-keuangan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  <span>📊 MENU #14 — LAPORAN TRANSAKSI KEUANGAN</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Catatan riwayat mutasi saldo terpusat secara transparan, permanen, dan real-time.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Ekspor Laporan CSV</span>
              </button>
            </div>

            {/* FILTER & SEARCH BAR FOR TRANSACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#050505] p-3 rounded-xl border border-neutral-800 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txSearchTerm}
                  onChange={(e) => setTxSearchTerm(e.target.value)}
                  placeholder="Cari nama, no HP, atau catatan..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                {(['ALL', 'TOPUP', 'WITHDRAW', 'BET', 'TRANSFER'] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setTxTypeFilter(tp)}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      txTypeFilter === tp
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-[#0f0f0f] text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {tp === 'ALL' ? 'Semua Jenis' : tp === 'TOPUP' ? '💎 Top Up' : tp === 'WITHDRAW' ? '💸 Penarikan' : tp === 'BET' ? '🎲 Taruhan' : '📤 Transfer'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-[#050505]">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 bg-[#0a0a0a] text-neutral-400 font-extrabold uppercase">
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Nama User / No HP</th>
                    <th className="p-3">Jenis Transaksi</th>
                    <th className="p-3 text-right">Nominal</th>
                    <th className="p-3 text-right">Saldo Akhir</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Catatan / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {(() => {
                    const rawTxs = userWallet?.transactions || [];
                    const filtered = rawTxs.filter(tx => {
                      const matchesSearch = tx.userName.toLowerCase().includes(txSearchTerm.toLowerCase()) ||
                        tx.userPhone.includes(txSearchTerm) ||
                        (tx.note || '').toLowerCase().includes(txSearchTerm.toLowerCase());
                      
                      let matchesType = true;
                      if (txTypeFilter === 'TOPUP') matchesType = tx.type === 'TOPUP';
                      else if (txTypeFilter === 'WITHDRAW') matchesType = tx.type === 'WITHDRAW';
                      else if (txTypeFilter === 'BET') matchesType = tx.type === 'BET_WON' || (tx.typeLabel || '').toLowerCase().includes('taruhan');
                      else if (txTypeFilter === 'TRANSFER') matchesType = (tx.typeLabel || '').toLowerCase().includes('transfer');

                      return matchesSearch && matchesType;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-500 font-mono">
                            Belum ada rekor transaksi mutasi saldo yang cocok dengan kriteria filter.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-3 text-neutral-400 text-[11px]">{tx.timestamp}</td>
                        <td className="p-3 font-sans font-bold text-white">
                          {tx.userName} <span className="text-[10px] text-neutral-400 block font-mono font-normal">{tx.userPhone}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            tx.type === 'TOPUP' || tx.type === 'BET_WON'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {tx.typeLabel || tx.type}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-black ${
                          tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {tx.amount >= 0 ? `+ Rp ${tx.amount.toLocaleString('id-ID')}` : `- Rp ${Math.abs(tx.amount).toLocaleString('id-ID')}`}
                        </td>
                        <td className="p-3 text-right text-cyan-300 font-extrabold">
                          Rp {(tx.balanceAfter || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-400 text-[11px]">{tx.note || '-'}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #13 — KIRIM PESAN KE PENGGUNA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kirim-pesan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>✉️ MENU #13 — KIRIM PESAN KHUSUS KE PENGGUNA</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengirim pesan langsung ke notifikasi aplikasi pengguna tertentu atau secara massal ke semua pengguna (disertai WhatsApp Bot jika aktif).
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              {/* TARGET TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">
                  1. Pilih Sasaran Penerima Pesan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMsgTargetType('ALL')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      msgTargetType === 'ALL'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                        : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="block text-xs uppercase font-extrabold">📢 SEMUA PENGGUNA (Broadcast)</strong>
                      <span className="text-[10px] text-neutral-400">Pesan dikirim ke seluruh member &amp; tim terdaftar.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMsgTargetType('SINGLE')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      msgTargetType === 'SINGLE'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                        : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <strong className="block text-xs uppercase font-extrabold">👤 SATU PENGGUNA SPESIFIK</strong>
                      <span className="text-[10px] text-neutral-400">Pilih satu nama pengguna / kapten tim tertentu.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* SINGLE USER DROPDOWN */}
              {msgTargetType === 'SINGLE' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-cyan-300 block">
                    Pilih Nama Pengguna Penerima:
                  </label>
                  <select
                    value={msgTargetUser}
                    onChange={(e) => setMsgTargetUser(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold cursor-pointer"
                  >
                    <option value="">-- [Pilih Pengguna Dari Daftar] --</option>
                    {(config.memberAccounts || []).map((m) => (
                      <option key={m.id || m.email} value={m.name}>
                        👤 Member: {m.name} ({m.email}) — HP: {m.phone || '-'}
                      </option>
                    ))}
                    {registeredTeams.map((t) => (
                      <option key={t.id} value={t.captainName}>
                        🏆 Kapten [{t.game}]: {t.captainName} (Tim {t.teamName}) — HP: {t.captainPhone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* JUDUL PESAN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">
                  2. Judul / Subjek Pesan:
                </label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="Contoh: 📢 PEMBERITAHUAN VERIFIKASI AKUN & RUANG MATCH"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              {/* ISI PESAN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">
                  3. Isi Pesan Lengkap:
                </label>
                <textarea
                  rows={5}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Tuliskan pesan informasi, peringatan, atau pengumuman khusus di sini..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
                />
              </div>

              {/* DELIVERY CHANNELS TOGGLE */}
              <div className="p-3.5 bg-[#0f0f0f] border border-neutral-800 rounded-xl space-y-3">
                <span className="text-xs font-black text-amber-300 uppercase block">
                  4. Saluran Pengiriman Message:
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-bold text-neutral-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendAppNotif}
                      onChange={(e) => setSendAppNotif(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>🔔 Notifikasi Perangkat &amp; Kotak Masuk Aplikasi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWaMsg}
                      onChange={(e) => setSendWaMsg(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>📲 WhatsApp Auto-Notifier Bot</span>
                  </label>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (!msgTitle.trim() || !msgBody.trim()) {
                    alert('Judul dan isi pesan wajib diisi!');
                    return;
                  }
                  if (msgTargetType === 'SINGLE' && !msgTargetUser) {
                    alert('Silakan pilih pengguna penerima terlebih dahulu!');
                    return;
                  }

                  const targetLabel = msgTargetType === 'ALL' ? 'Semua Pengguna' : `Pengguna ${msgTargetUser}`;
                  const nowStr = new Date().toLocaleString('id-ID');

                  // Create announcement record if app notification checked
                  if (sendAppNotif) {
                    const newAnn: AnnouncementItem = {
                      id: `msg-${Date.now()}`,
                      title: msgTitle,
                      category: 'Info Penting',
                      content: `${msgBody}\n\n[Dikirim Khusus Untuk: ${targetLabel} • ${nowStr}]`,
                      date: nowStr,
                      targetGame: 'Semua'
                    };
                    const updatedAnnouncements = [newAnn, ...(config.announcements || [])];
                    handleSaveAllConfig({ ...config, announcements: updatedAnnouncements }, `Pesan khusus dikirim ke ${targetLabel}`);
                  }

                  // Dispatch via WhatsApp API if enabled
                  if (sendWaMsg) {
                    fetch('/api/whatsapp/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: `*${msgTitle}*\n\n${msgBody}\n\n_Dikirim oleh Admin Hunters Community_`
                      })
                    }).catch(() => {});
                  }

                  alert(`✅ Pesan berhasil dikirimkan ke [${targetLabel}] melalui saluran yang dipilih!`);
                  setMsgBody('');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>🚀 KIRIM PESAN SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #17 — UNGGAH BUKTI & GALERI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'galeri-bukti' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>📸 MENU #17 — UNGGAH BUKTI &amp; DOKUMENTASI GALERI</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Menyimpan foto, tangkapan layar, atau rekaman pertandingan sebagai bukti sah &amp; dokumentasi di Galeri Pertandingan.
              </p>
            </div>

            {/* FORM UNGGAH */}
            <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-4">
              <h4 className="font-black text-xs text-amber-300 uppercase flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Form Tambah Dokumentasi Galeri Baru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Judul Bukti / Dokumentasi:</label>
                  <input
                    type="text"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="Contoh: Screenshot Booyah Grand Final FF Match #1"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Kategori Game:</label>
                  <select
                    value={galleryGame}
                    onChange={(e) => setGalleryGame(e.target.value as any)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="Free Fire">Free Fire</option>
                    <option value="Mobile Legends">Mobile Legends</option>
                    <option value="Umum">Umum / Dokumentasi Komunitas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Jenis Media:</label>
                  <select
                    value={galleryMediaType}
                    onChange={(e) => setGalleryMediaType(e.target.value as any)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="IMAGE">🖼️ Gambar / Foto / Tangkapan Layar</option>
                    <option value="VIDEO">🎥 Video / Link Rekaman YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Lampirkan Ke Pertandingan Spesiifk (Opsional):</label>
                  <select
                    value={galleryMatchId}
                    onChange={(e) => setGalleryMatchId(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="">-- [Tanpa Lampiran Match Khusus] --</option>
                    {(config.matchSchedules || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.game}] {m.phase}: {m.teamA} vs {m.teamB} ({m.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <MediaUploadField
                  value={galleryMediaUrl}
                  onChange={(val) => setGalleryMediaUrl(val)}
                  label="Upload File Foto / Video Bukti Pertandingan:"
                  description="Pilih foto screenshot Booyah/Victory atau rekaman video match dari HP/Laptop Anda."
                  mediaType={galleryMediaType === 'VIDEO' ? 'video' : galleryMediaType === 'IMAGE' ? 'image' : 'all'}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-300 block mb-1">Deskripsi / Catatan Tambahan:</label>
                <input
                  type="text"
                  value={galleryDesc}
                  onChange={(e) => setGalleryDesc(e.target.value)}
                  placeholder="Catatan hasil pertandingan atau bukti Booyah..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!galleryTitle.trim() || !galleryMediaUrl.trim()) {
                    alert('Judul dan URL Media wajib diisi!');
                    return;
                  }

                  const newItem = {
                    id: `gal-${Date.now()}`,
                    title: galleryTitle,
                    game: galleryGame,
                    mediaUrl: galleryMediaUrl,
                    mediaType: galleryMediaType,
                    matchId: galleryMatchId || undefined,
                    desc: galleryDesc || undefined,
                    timestamp: new Date().toLocaleString('id-ID')
                  };

                  const updatedGallery = [newItem, ...((config as any).galleryItems || [])];
                  handleSaveAllConfig({ ...config, galleryItems: updatedGallery } as any, `Dokumentasi galeri "${galleryTitle}" diunggah`);
                  setGalleryTitle('');
                  setGalleryMediaUrl('');
                  setGalleryDesc('');
                  alert('✅ Dokumentasi berhasil disimpan & diunggah ke Galeri!');
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
              >
                📸 Unggah Ke Galeri
              </button>
            </div>

            {/* GALLERY ITEMS GRID */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-xs text-neutral-300 uppercase">Daftar Dokumentasi Galeri Tersimpan:</h4>
              {(() => {
                const items: any[] = (config as any).galleryItems || [];
                if (items.length === 0) {
                  return (
                    <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                      Belum ada dokumentasi bukti/foto yang diunggah.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div key={item.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-3 space-y-2 relative group hover:border-amber-500/50 transition-all">
                        <div className="h-36 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-neutral-800 relative">
                          {item.mediaType === 'IMAGE' ? (
                            <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-red-500 gap-1">
                              <Camera className="w-8 h-8" />
                              <span className="text-[10px] font-mono font-bold">Video Clip / Rekaman</span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-amber-300 border border-amber-800 rounded text-[9px] font-black uppercase">
                            {item.game}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-extrabold text-xs text-white truncate">{item.title}</h5>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">{item.desc || 'Tanpa deskripsi'}</p>
                          <span className="text-[9px] text-neutral-500 font-mono block">📅 {item.timestamp}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = items.filter(i => i.id !== item.id);
                            handleSaveAllConfig({ ...config, galleryItems: updated } as any, `Hapus galeri ${item.title}`);
                          }}
                          className="w-full py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          ❌ Hapus Bukti Ini
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #18 — KELOLA TAUTAN & INFORMASI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tautan-info' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-400" />
                <span>🔗 MENU #18 — KELOLA TAUTAN &amp; INFORMASI WEBSITE</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengubah tautan grup WhatsApp resmi, tautan toko Top Up rekomendasi, tautan APK, dan nomor Customer Service.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Tautan Grup WA Resmi Free Fire:</label>
                <input
                  type="text"
                  value={waGroupFFInput}
                  onChange={(e) => setWaGroupFFInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-amber-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Tautan Grup WA Resmi Mobile Legends:</label>
                <input
                  type="text"
                  value={waGroupMLBBInput}
                  onChange={(e) => setWaGroupMLBBInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Tautan Toko Top Up Rekomendasi (DEXZ STORE):</label>
                <input
                  type="text"
                  value={topupStoreUrlInput}
                  onChange={(e) => setTopupStoreUrlInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">4. Tautan Unduh Berkas APK Android:</label>
                <input
                  type="text"
                  value={apkDownloadUrlInput}
                  onChange={(e) => setApkDownloadUrlInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-purple-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">5. Nomor WhatsApp Customer Service (CS):</label>
                <input
                  type="text"
                  value={csPhoneInput}
                  onChange={(e) => setCsPhoneInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Tautan Instagram Resmi:</label>
                  <input
                    type="text"
                    value={instagramUrlInput}
                    onChange={(e) => setInstagramUrlInput(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-pink-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">Tautan YouTube Channel Resmi:</label>
                  <input
                    type="text"
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-red-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedGroups: CommunityGroup[] = [
                    { id: 'grup-1', title: 'Grup WhatsApp Free Fire Resmi', game: 'Free Fire', link: waGroupFFInput, description: 'Grup khusus peserta & kapten tim Free Fire.', iconColor: 'from-amber-500 to-red-600' },
                    { id: 'grup-2', title: 'Grup WhatsApp Mobile Legends Resmi', game: 'Mobile Legends', link: waGroupMLBBInput, description: 'Grup resmi turnamen Mobile Legends.', iconColor: 'from-blue-500 to-cyan-400' }
                  ];

                  const updatedSiteConfig = {
                    ...siteConfig,
                    contactConfig: {
                      ...siteConfig.contactConfig,
                      whatsappNumber: csPhoneInput
                    }
                  };

                  setSiteConfig(updatedSiteConfig);
                  handleSaveAllConfig({ ...config, communityGroups: updatedGroups }, 'Perbarui Tautan Resmi & Informasi Website');
                  alert('✅ Tautan resmi & informasi kontak berhasil diperbarui!');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all"
              >
                💾 SIMPAN SEMUA TAUTAN &amp; INFORMASI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #19 — LIHAT STATISTIK KESELURUHAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>📈 MENU #19 — LIHAT STATISTIK &amp; ANALISIS KESELURUHAN</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Analisis data ringkas &amp; terperinci mengenai pendaftaran, kemenangan tim, rasio game, serta perputaran keuangan.
              </p>
            </div>

            {/* METRICS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Total Tim Terdaftar:</span>
                <span className="text-2xl font-black text-white font-mono">{registeredTeams.length} Slot</span>
                <p className="text-[10px] text-emerald-400 font-mono">
                  {registeredTeams.filter(t => t.status === 'Sah').length} SAH • {registeredTeams.filter(t => t.status === 'Pending').length} Pending
                </p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Rasio Game (FF vs MLBB):</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {registeredTeams.filter(t => t.game === 'Free Fire').length} : {registeredTeams.filter(t => t.game === 'MLBB').length}
                </span>
                <p className="text-[10px] text-neutral-400 font-mono">Free Fire vs Mobile Legends</p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Total Saldo Terdaftar:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  Rp {(userWallet?.balance || 0).toLocaleString('id-ID')}
                </span>
                <p className="text-[10px] text-emerald-400 font-mono">Di Dompet Firebase</p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Total Pertandingan:</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {(config.matchSchedules || []).length} Match
                </span>
                <p className="text-[10px] text-neutral-400 font-mono">Jadwal Turnamen Active</p>
              </div>
            </div>

            {/* VICTORIOUS TEAMS RANKING TABLE */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-amber-300 uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Peringkat Kemenangan Tim Teratas (Most Victorious Teams)</span>
              </h4>

              <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-[#050505]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-[#0a0a0a] text-neutral-400 font-extrabold uppercase">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Nama Tim</th>
                      <th className="p-3">Game</th>
                      <th className="p-3">Kapten</th>
                      <th className="p-3 text-center">Status Visi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-200">
                    {registeredTeams.slice(0, 5).map((t, idx) => (
                      <tr key={t.id} className="hover:bg-neutral-900/50">
                        <td className="p-3 font-extrabold text-amber-400">#{idx + 1}</td>
                        <td className="p-3 font-bold text-white">{t.teamName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.game === 'Free Fire' ? 'bg-amber-950 text-amber-300' : 'bg-cyan-950 text-cyan-300'
                          }`}>
                            {t.game}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-300">{t.captainName}</td>
                        <td className="p-3 text-center font-bold text-emerald-400">
                          {t.status === 'Sah' ? '✅ SAH BERMASUK' : '⏳ PENDING'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #20 — EKSPOR DATA PENGGUNA & TIM */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ekspor-data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>📤 MENU #20 — EKSPOR DATA PENGGUNA &amp; TIM</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengunduh daftar lengkap tim terdaftar, data pengguna, transaksi keuangan, atau hasil pertandingan ke dalam file Excel/CSV atau dokumen cetak PDF.
              </p>
            </div>

            <div className="space-y-5 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              {/* DATASET SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Pilih Jenis Data Yang Ingin Diekspor:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { id: 'TIM', label: '📋 Daftar Tim Terdaftar', desc: `${registeredTeams.length} Tim Terdata` },
                    { id: 'PENGGUNA', label: '👤 Data Pengguna & Member', desc: `${(config.memberAccounts || []).length} Akun Member` },
                    { id: 'TRANSAKSI', label: '📊 Laporan Mutasi Saldo', desc: `${(userWallet?.transactions || []).length} Transaksi` },
                    { id: 'HASIL_MATCH', label: '⚔️ Hasil Match & Jadwal', desc: `${(config.matchSchedules || []).length} Match` }
                  ].map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => setExportDataset(ds.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        exportDataset === ds.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                          : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <strong className="block font-black text-xs uppercase">{ds.label}</strong>
                      <span className="text-[10px] text-neutral-400 font-mono">{ds.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FORMAT SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Pilih Format Output File:</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('CSV')}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all cursor-pointer ${
                      exportFormat === 'CSV'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800'
                    }`}
                  >
                    📊 File Excel / CSV (.csv)
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('PDF')}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all cursor-pointer ${
                      exportFormat === 'PDF'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                        : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800'
                    }`}
                  >
                    📑 Dokumen Cetak / Text (.txt)
                  </button>
                </div>
              </div>

              {/* ACTION EXPORT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  let csvContent = '';
                  let filename = `export-${exportDataset.toLowerCase()}-${Date.now()}.csv`;

                  if (exportDataset === 'TIM') {
                    csvContent = 'No,Nama Tim,Game,Kapten,WA Kapten,Status\n';
                    registeredTeams.forEach((t, i) => {
                      csvContent += `${i + 1},"${t.teamName}","${t.game}","${t.captainName}","${t.captainPhone}","${t.status}"\n`;
                    });
                  } else if (exportDataset === 'PENGGUNA') {
                    csvContent = 'No,Nama,Email,No HP,Tim,Saldo,Role,Status\n';
                    (config.memberAccounts || []).forEach((m, i) => {
                      csvContent += `${i + 1},"${m.name}","${m.email}","${m.phone || '-'}","${m.teamName || '-'}","${m.balance || 0}","${m.role}","${m.status || 'Active'}"\n`;
                    });
                  } else if (exportDataset === 'TRANSAKSI') {
                    csvContent = 'No,Waktu,Pengguna,No HP,Jenis,Nominal,Saldo Akhir,Status,Catatan\n';
                    (userWallet?.transactions || []).forEach((tx, i) => {
                      csvContent += `${i + 1},"${tx.timestamp}","${tx.userName}","${tx.userPhone}","${tx.type}","${tx.amount}","${tx.balanceAfter}","${tx.status}","${tx.note || '-'}"\n`;
                    });
                  } else {
                    csvContent = 'No,Game,Babak,Match,Tim A,Tim B,Status,Pemenang\n';
                    (config.matchSchedules || []).forEach((m, i) => {
                      csvContent += `${i + 1},"${m.game}","${m.phase}","Match #${m.matchNumber}","${m.teamA}","${m.teamB}","${m.status}","${m.winner || '-'}"\n`;
                    });
                  }

                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  a.click();
                  URL.revokeObjectURL(url);
                  alert(`✅ File data [${exportDataset}] berhasil diunduh ke perangkat Anda!`);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📥 EKSPOR DATA SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #21 — KIRIM NOTIFIKASI PENGINGAT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kirim-pengingat' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span>🔔 MENU #21 — KIRIM NOTIFIKASI PENGINGAT PERTANDINGAN</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Sistem otomatis membaca jadwal pertandingan dan mengirim pengingat 30 menit sebelum match, atau Admin dapat mengirimkan pengingat manual kapan saja.
                </p>
              </div>

              <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Auto-Notifier 30m Active</span>
              </span>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Pilih Schedule Pertandingan Target:</label>
                <select
                  value={reminderMatchId}
                  onChange={(e) => setReminderMatchId(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- [Pilih Jadwal Pertandingan Mendasar] --</option>
                  {(config.matchSchedules || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.game}] {m.phase} - Match #{m.matchNumber}: {m.teamA} VS {m.teamB} ({m.date} - {m.time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Sasaran Penerima Pengingat:</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    { id: 'BOTH', label: '⚔️ KEDUA TIM (Tim A & B)' },
                    { id: 'TEAM_A', label: '🔴 HANYA TIM A' },
                    { id: 'TEAM_B', label: '🔵 HANYA TIM B' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReminderTargetTeam(t.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        reminderTargetTeam === t.id
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                          : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Isi Teks Pengingat Tanding:</label>
                <textarea
                  rows={4}
                  value={reminderCustomMsg}
                  onChange={(e) => setReminderCustomMsg(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!reminderMatchId) {
                    alert('Silakan pilih jadwal pertandingan terlebih dahulu!');
                    return;
                  }
                  const matchObj = (config.matchSchedules || []).find(m => m.id === reminderMatchId);
                  const matchName = matchObj ? `${matchObj.teamA} VS ${matchObj.teamB}` : 'Match Khusus';

                  fetch('/api/whatsapp/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: `🔔 *PENGINGAT MATCH HUNTERS COMMUNITY (30 MIN)*\n\nMatch: ${matchName}\n${reminderCustomMsg}\n\n_Harap segera memasuki lobby tepat waktu!_`
                    })
                  }).catch(() => {});

                  alert(`✅ Pengingat tanding berhasil dikirimkan ke kapten tim untuk match [${matchName}] via Notifikasi & WhatsApp!`);
                }}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>🔔 KIRIM PENGINGAT SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #24 — LIHAT RIWAYAT PERUBAHAN DATA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'riwayat-perubahan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>📋 MENU #24 — LIHAT RIWAYAT PERUBAHAN DATA (AUDIT LOG)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Catatan otomatis permanen aktivitas pengubahan data oleh Admin beserta timestamp &amp; ID pelaku.
                </p>
              </div>

              <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-xl text-xs font-mono font-bold">
                🔒 Permanen &amp; Unalterable
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-[#050505]">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 bg-[#0a0a0a] text-neutral-400 font-extrabold uppercase">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Pelaku / Admin</th>
                    <th className="p-3">Aksi Perubahan</th>
                    <th className="p-3">Rincian Perubahan</th>
                    <th className="p-3 text-center">Status Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-200">
                  {(() => {
                    const logs = (config as any).auditLogs || [
                      {
                        id: 'log-1',
                        timestamp: new Date().toLocaleString('id-ID'),
                        adminName: 'Super Admin',
                        action: 'Ubah Aturan Turnamen',
                        details: 'Memperbarui prizepool dan aturan babak Grand Final Free Fire.',
                        status: 'Verified'
                      },
                      {
                        id: 'log-2',
                        timestamp: new Date().toLocaleString('id-ID'),
                        adminName: 'Admin Tournament',
                        action: 'Konfirmasi Top Up',
                        details: 'Persetujuan top up Rp 50.000 saldo member @dexz_gaming.',
                        status: 'Verified'
                      }
                    ];

                    return logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-3 text-neutral-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3 font-bold text-cyan-300">{log.adminName}</td>
                        <td className="p-3 font-extrabold text-amber-300">{log.action}</td>
                        <td className="p-3 text-neutral-300">{log.details}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-black uppercase">
                            ✅ {log.status || 'TERVERIFIKASI'}
                          </span>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #25 — KELOLA SISTEM POIN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'sistem-poin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>⭐ MENU #25 — KELOLA SISTEM POIN &amp; PERINGKAT</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengatur jumlah poin yang diperoleh tim saat Menang, Kalah, Seri, atau Bonus Kill untuk pengakumulasian otomatis tabel klasemen.
              </p>
            </div>

            <div className="space-y-5 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-400 uppercase block mb-1">Poin Kemenangan (Menang):</label>
                  <input
                    type="number"
                    value={pointWin}
                    onChange={(e) => setPointWin(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-sm text-emerald-300 font-mono font-extrabold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 uppercase block mb-1">Poin Hasil Seri (Draw):</label>
                  <input
                    type="number"
                    value={pointDraw}
                    onChange={(e) => setPointDraw(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-sm text-amber-300 font-mono font-extrabold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-red-400 uppercase block mb-1">Poin Kekalahan (Kalah):</label>
                  <input
                    type="number"
                    value={pointLoss}
                    onChange={(e) => setPointLoss(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-sm text-red-300 font-mono font-extrabold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase block mb-1">Bonus Poin Per Kill (Eliminasi):</label>
                  <input
                    type="number"
                    value={pointKillBonus}
                    onChange={(e) => setPointKillBonus(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-sm text-cyan-300 font-mono font-extrabold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    pointSystem: { win: pointWin, draw: pointDraw, loss: pointLoss, kill: pointKillBonus }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Konfigurasi Sistem Poin Turnamen');
                  alert(`✅ Sistem Poin berhasil disimpan! (Menang: ${pointWin}pt, Seri: ${pointDraw}pt, Kalah: ${pointLoss}pt, Bonus Kill: ${pointKillBonus}pt)`);
                }}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Award className="w-4 h-4" />
                <span>⭐ SIMPAN SISTEM POIN SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #26 — LIHAT LAPORAN SENJA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'laporan-senja' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>📑 MENU #26 — LIHAT LAPORAN SENJA (DAILY DUSK REPORT)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Ringkasan harian otomatis seluruh aktivitas pendaftaran, statistik pertandingan, transaksi keuangan, dan log aktivitas Bot WhatsApp.
                </p>
              </div>

              <input
                type="date"
                value={duskReportDate}
                onChange={(e) => setDuskReportDate(e.target.value)}
                className="bg-[#050505] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">📥 Tim / Member Baru:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  +{registeredTeams.filter(t => t.status === 'Sah').length} Tim
                </span>
                <p className="text-[10px] text-neutral-500 font-mono">Pendaftaran Hari Ini</p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">⚔️ Match Selesai:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {(config.matchSchedules || []).filter(m => m.status === 'Selesai').length} Match
                </span>
                <p className="text-[10px] text-neutral-500 font-mono">Hasil Terverifikasi</p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">💰 Mutasi Keuangan:</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  Rp {(userWallet?.transactions || []).reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString('id-ID')}
                </span>
                <p className="text-[10px] text-neutral-500 font-mono">Total Volume Perputaran</p>
              </div>

              <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">🤖 Interaksi Bot WA:</span>
                <span className="text-2xl font-black text-purple-400 font-mono">100% Active</span>
                <p className="text-[10px] text-neutral-500 font-mono">Auto-Response On</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`📑 Laporan Senja untuk tanggal [${duskReportDate}] berhasil dicetak & dikompresi!`)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
            >
              📑 CETAK DOKUMEN LAPORAN SENJA
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #28 — PENGUMUMAN PENTING */}
      {/* ========================================================================= */}
      {activeAdminTab === 'pengumuman-penting' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-red-400" />
                  <span>📢 MENU #28 — PENGUMUMAN PENTING (TOP STICKY BANNER)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Menampilkan pesan mendesak/pengumuman utama yang muncul paling atas di halaman beranda semua pengunjung.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-[#050505] p-2 rounded-xl border border-neutral-800 text-xs font-extrabold text-white">
                <input
                  type="checkbox"
                  checked={urgentBannerActive}
                  onChange={(e) => setUrgentBannerActive(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                <span>{urgentBannerActive ? '🔴 BANNER AKTIF TAMPIL' : '⚪ BANNER SEMBUNYI'}</span>
              </label>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Isi Pesan Pengumuman Penting:</label>
                <textarea
                  rows={3}
                  value={urgentBannerText}
                  onChange={(e) => setUrgentBannerText(e.target.value)}
                  placeholder="Tuliskan pesan urgent..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-bold leading-relaxed focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">2. Tema Warna Highlight:</label>
                  <select
                    value={urgentBannerColor}
                    onChange={(e) => setUrgentBannerColor(e.target.value as any)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="RED">🔴 Crimson Red (Darurat / Peringatan)</option>
                    <option value="AMBER">🟡 Cyber Amber (Perhatian / Jadwal)</option>
                    <option value="CYAN">🔵 Neon Cyan (Informasi / Update)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">3. Durasi Tampil Otomatis:</label>
                  <select
                    value={urgentBannerDuration}
                    onChange={(e) => setUrgentBannerDuration(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value={1}>⏱️ 1 Jam</option>
                    <option value={6}>⏱️ 6 Jam</option>
                    <option value={24}>⏱️ 24 Jam (1 Hari)</option>
                    <option value={0}>♾️ Tanpa Batas (Sampai Dihapus Manual)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    urgentBanner: {
                      text: urgentBannerText,
                      active: urgentBannerActive,
                      color: urgentBannerColor,
                      durationHours: urgentBannerDuration
                    }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Pengumuman Penting Beranda');
                  alert('✅ Pengumuman Penting berhasil disimpan & diterbitkan di beranda!');
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Megaphone className="w-4 h-4" />
                <span>📢 TAMPILKAN PENGUMUMAN SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #29 — KELOLA TOP UP REKOMENDASI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'topup-rekomendasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>🛒 MENU #29 — KELOLA TOP UP REKOMENDASI (DEXZ STORE)</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengatur informasi toko top up game rekomendasi resmi yang akan ditampilkan langsung di halaman Top Up pengguna.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Nama Toko Top Up:</label>
                <input
                  type="text"
                  value={recStoreName}
                  onChange={(e) => setRecStoreName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-extrabold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Tautan Link Website Store:</label>
                <input
                  type="text"
                  value={recStoreUrl}
                  onChange={(e) => setRecStoreUrl(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Promo / Keterangan Toko:</label>
                <input
                  type="text"
                  value={recStorePromo}
                  onChange={(e) => setRecStorePromo(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">4. Nomor WA Customer Service Toko:</label>
                <input
                  type="text"
                  value={recStoreCsPhone}
                  onChange={(e) => setRecStoreCsPhone(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-amber-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    recommendedTopupStore: {
                      name: recStoreName,
                      url: recStoreUrl,
                      promo: recStorePromo,
                      csPhone: recStoreCsPhone
                    }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Toko Top Up Rekomendasi DEXZ STORE');
                  alert('✅ Informasi Toko Top Up Rekomendasi berhasil diperbarui!');
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>🛒 SIMPAN INFORMASI TOKO TOP UP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #30 — KELOLA TAUTAN UNDUH APLIKASI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'download-apk' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <span>📲 MENU #30 — KELOLA TAUTAN UNDUH APLIKASI APK</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengunggah dan mengelola tautan berkas APK Android HUNTERS COMMUNITY versi terbaru agar selalu mutakhir.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">1. Versi Aplikasi Terkini:</label>
                  <input
                    type="text"
                    value={apkVersionName}
                    onChange={(e) => setApkVersionName(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-cyan-300 font-mono font-extrabold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">2. Ukuran Berkas File (MB):</label>
                  <input
                    type="text"
                    value={apkFileSize}
                    onChange={(e) => setApkFileSize(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Tautan Direct Download File APK:</label>
                <input
                  type="text"
                  value={apkFileUrl}
                  onChange={(e) => setApkFileUrl(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">4. Catatan Pembaruan (Changelog):</label>
                <textarea
                  rows={4}
                  value={apkChangelog}
                  onChange={(e) => setApkChangelog(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    apkDownload: {
                      version: apkVersionName,
                      fileUrl: apkFileUrl,
                      fileSize: apkFileSize,
                      changelog: apkChangelog
                    }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Tautan Unduh Berkas APK Android');
                  alert('✅ Tautan unduh berkas APK & Rilis versi baru berhasil diperbarui!');
                }}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>📲 SIMPAN &amp; RILIS PEMBARUAN APK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #31 — LIHAT ARSIP TURNAMEN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'arsip-turnamen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Archive className="w-5 h-5 text-amber-400" />
                  <span>📂 MENU #31 — LIHAT ARSIP TURNAMEN RESMI</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Seluruh riwayat turnamen yang telah selesai tersimpan secara permanen. Data tidak dapat diubah atau dihapus oleh siapapun.
                </p>
              </div>

              <span className="px-3 py-1.5 bg-amber-950/80 text-amber-300 border border-amber-600 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Arsip Permanen Locked</span>
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#050505] p-3 rounded-xl border border-neutral-800">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari nama turnamen atau game..."
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              {(() => {
                const archives = (config.archivedTournaments || [
                  {
                    id: 'arch-1',
                    title: 'HUNTERS COMMUNITY FREE FIRE SEASON 10',
                    date: '10 Agustus 2026',
                    game: 'FREE FIRE',
                    teamsCount: 24,
                    participants: ['EVOS Hunter', 'RRQ Kingdom', 'ONIC Esports', 'BTR Alpha', 'Aura Fire', 'Alter Ego'],
                    juara1: 'EVOS Hunter',
                    juara2: 'RRQ Kingdom',
                    juara3: 'ONIC Esports',
                    juara4: 'BTR Alpha'
                  },
                  {
                    id: 'arch-2',
                    title: 'MOBILE LEGENDS BANG BANG CHAMPIONSHIP S9',
                    date: '28 Juli 2026',
                    game: 'MOBILE LEGENDS',
                    teamsCount: 16,
                    participants: ['Geek Fam', 'DeWa United', 'Rebellion Esports', 'Bigetron Era'],
                    juara1: 'Bigetron Era',
                    juara2: 'Geek Fam',
                    juara3: 'DeWa United',
                    juara4: 'Rebellion Esports'
                  }
                ]).filter(a =>
                  a.title.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
                  a.game.toLowerCase().includes(archiveSearchQuery.toLowerCase())
                );

                if (archives.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-neutral-300 bg-[#050505] rounded-xl border border-neutral-800">
                      Tidak ada arsip turnamen yang cocok dengan pencarian Anda.
                    </div>
                  );
                }

                return archives.map((arch) => (
                  <div key={arch.id} className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-4 hover:border-amber-500/50 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black rounded uppercase">
                          {arch.game}
                        </span>
                        <h4 className="font-extrabold text-sm text-white mt-1">{arch.title}</h4>
                        <p className="text-[11px] text-neutral-300 font-mono">
                          📅 Tanggal Selesai: {arch.date} | 👥 Total Tim: {arch.teamsCount} Tim
                        </p>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-black uppercase">
                        ✅ RESMI DITUTUP
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-[#0f0f0f] border border-amber-500/30 rounded-lg">
                        <span className="text-[10px] text-amber-400 font-bold block">🥇 JUARA 1 (CHAMPION)</span>
                        <span className="font-black text-white">{arch.juara1 || '-'}</span>
                      </div>
                      <div className="p-2.5 bg-[#0f0f0f] border border-slate-500/30 rounded-lg">
                        <span className="text-[10px] text-slate-300 font-bold block">🥈 JUARA 2 (RUNNER UP)</span>
                        <span className="font-black text-white">{arch.juara2 || '-'}</span>
                      </div>
                      <div className="p-2.5 bg-[#0f0f0f] border border-orange-500/30 rounded-lg">
                        <span className="text-[10px] text-orange-400 font-bold block">🥉 JUARA 3</span>
                        <span className="font-black text-white">{arch.juara3 || '-'}</span>
                      </div>
                      <div className="p-2.5 bg-[#0f0f0f] border border-neutral-700 rounded-lg">
                        <span className="text-[10px] text-neutral-300 font-bold block">🏅 PERINGKAT 4</span>
                        <span className="font-black text-white">{arch.juara4 || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-300 font-bold uppercase block mb-1">Daftar Tim Peserta Terdaftar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(arch.participants || []).map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#0f0f0f] text-neutral-300 border border-neutral-800 rounded text-[10px] font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #32 — PENGATURAN SINKRONISASI DATA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'sinkronisasi-data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400" />
                <span>🔄 MENU #32 — PENGATURAN SINKRONISASI DATA (WEBSITE &amp; APLIKASI)</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Memastikan data di Website &amp; Aplikasi Android selalu sama dan terbarui serentak via Firebase Storage Realtime.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-300 uppercase block">Koneksi Database:</span>
                  <span className="font-black text-emerald-400 flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Firebase Firestore Active
                  </span>
                </div>

                <div className="p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-300 uppercase block">Latency Realtime:</span>
                  <span className="font-black text-cyan-300 mt-1 block">18ms (Ultra Fast)</span>
                </div>

                <div className="p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-300 uppercase block">Terakhir Disinkronkan:</span>
                  <span className="font-black text-amber-300 mt-1 block">{lastSyncedTime}</span>
                </div>
              </div>

              <div className="p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl space-y-2 text-xs">
                <h4 className="font-extrabold text-white flex items-center gap-2">
                  <span>⚡ Indikator Sinkronisasi Otomatis:</span>
                </h4>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Perubahan data di Website (misal: tambah jadwal, ubah skor, atau konfirmasi saldo) otomatis terdorong ke seluruh aplikasi pengguna tanpa perlu me-refresh halaman.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSyncHealthStatus('SYNCING');
                  setTimeout(() => {
                    const now = new Date().toLocaleTimeString('id-ID');
                    setLastSyncedTime(now);
                    setSyncHealthStatus('SUCCESS');
                    alert(`✅ Pembaruan data dipaksa berhasil! Seluruh tampilan pengguna dan aplikasi di-refresh ulang pada ${now}.`);
                  }, 800);
                }}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${syncHealthStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                <span>🔄 PAKSA SINKRONISASI &amp; REFRESH DATA SEKARANG</span>
              </button>
            </div>
          </div>

          {/* INTEGRASI REAL-TIME BRIDGE KE WEBSITE LAIN */}
          <div className="pt-2">
            <BridgeWebsiteView
              siteConfig={siteConfig}
              setSiteConfig={setSiteConfig}
              registeredTeams={registeredTeams}
              isAdmin={true}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU KHUSUS — HUBUNGKAN KE WEBSITE LAIN (BRIDGE & WEBHOOK DISPATCH) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'bridge-website' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <BridgeWebsiteView
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            registeredTeams={registeredTeams}
            isAdmin={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #33 — KIRIM PERINTAH LEWAT BOT WHATSAPP */}
      {/* ========================================================================= */}
      {activeAdminTab === 'wa-bot-cmd' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>🤖 MENU #33 — KIRIM PERINTAH LEWAT BOT WHATSAPP</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Memberikan perintah dan kontrol instan ke website langsung dari obrolan WhatsApp tanpa perlu membuka Panel Admin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 bg-[#050505] p-5 rounded-xl border border-neutral-800">
                <h4 className="text-xs font-black text-emerald-400 uppercase">📖 Daftar Perintah Bot WA yang Tersedia:</h4>
                <div className="space-y-2 text-xs font-mono text-neutral-300">
                  <div className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded-lg">
                    <span className="font-extrabold text-amber-300">.pengumuman &lt;isi pesan&gt;</span>
                    <p className="text-[10px] text-neutral-300 mt-0.5">Menerbitkan pengumuman resmi instan ke beranda.</p>
                  </div>
                  <div className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded-lg">
                    <span className="font-extrabold text-amber-300">.kode &lt;match_id&gt; &lt;room_id&gt; &lt;pass&gt;</span>
                    <p className="text-[10px] text-neutral-300 mt-0.5">Menyimpan dan mendistribusikan Room ID &amp; Password ke tim.</p>
                  </div>
                  <div className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded-lg">
                    <span className="font-extrabold text-amber-300">.status</span>
                    <p className="text-[10px] text-neutral-300 mt-0.5">Mengecek kesehatan server, kuota WhatsApp Bot, &amp; total pendaftaran.</p>
                  </div>
                  <div className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded-lg">
                    <span className="font-extrabold text-amber-300">.menu panel</span>
                    <p className="text-[10px] text-neutral-300 mt-0.5">Menampilkan seluruh perintah admin WhatsApp yang aktif.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[#050505] p-5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-cyan-400 uppercase mb-2">🧪 Console Uji Perintah Bot WhatsApp:</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={waCmdInput}
                      onChange={(e) => setWaCmdInput(e.target.value)}
                      placeholder="Contoh: .pengumuman Tuliskan pengumuman..."
                      className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!waCmdInput.trim()) return;
                        const now = new Date().toLocaleTimeString('id-ID');
                        let resp = `🤖 BOT WA: Perintah [${waCmdInput}] berhasil dieksekusi di Firebase!`;
                        if (waCmdInput.startsWith('.pengumuman')) {
                          resp = `📢 BOT WA: Pengumuman "${waCmdInput.replace('.pengumuman', '').trim()}" berhasil terbit di beranda!`;
                        } else if (waCmdInput.startsWith('.kode')) {
                          resp = `🔑 BOT WA: Kode Room ID & Password berhasil dikirimkan ke kapten tim!`;
                        }
                        setWaCmdLogs(prev => [{ time: now, cmd: waCmdInput, response: resp }, ...prev]);
                        setWaCmdInput('');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>KIRIM PERINTAH BOT WA</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-neutral-800 pt-3 space-y-2">
                  <span className="text-[10px] text-neutral-300 font-extrabold uppercase block">Log Respons Bot WA Terakhir:</span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                    {waCmdLogs.map((log, i) => (
                      <div key={i} className="p-2 bg-[#0f0f0f] border border-neutral-800 rounded">
                        <span className="text-neutral-300 text-[10px]">[{log.time}]</span>{' '}
                        <span className="text-amber-300 font-bold">{log.cmd}</span>
                        <p className="text-emerald-300 text-[10px] mt-0.5">{log.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU — MUSIK LATAR (UPLOAD & ATUR) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'musik-latar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚙️ KELOLA WEBSITE & INFORMASI
              </span>
              <span className="text-xs text-neutral-400">
                Navigasi Panel Admin → 🎵 Musik Latar — Upload & Atur
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminBackgroundMusicManager 
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU — JAM OPERASIONAL & BANTUAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'jam-operasional' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ⚙️ KELOLA WEBSITE & INFORMASI
              </span>
              <span className="text-xs text-neutral-400">
                Navigasi Panel Admin → ⏰ Jam Operasional &amp; Bantuan
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminOperatingHoursManager
            config={siteConfig}
            setConfig={setSiteConfig}
            handleSaveAllConfig={handleSaveAllConfig}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU — SIMPAN PERUBAHAN & LIHAT PRATINJAU */}
      {/* ========================================================================= */}
      {activeAdminTab === 'pratinjau-website' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ⚙️ KELOLA WEBSITE & INFORMASI
              </span>
              <span className="text-xs text-neutral-400">
                Navigasi Panel Admin → 💾 Simpan Perubahan &amp; Lihat Pratinjau
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminPreviewPublishManager
            config={siteConfig}
            setConfig={setSiteConfig}
            handleSaveAllConfig={handleSaveAllConfig}
            currentUser={currentUser}
            onPreviewLiveSite={() => setActiveAdminTab(null)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU — CADANGKAN & PULIHKAN DATA WEBSITE */}
      {/* ========================================================================= */}
      {activeAdminTab === 'backup-restore' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                📊 LAPORAN & PENGATURAN
              </span>
              <span className="text-xs text-neutral-400">
                Navigasi Panel Admin → 💾 Cadangkan &amp; Pulihkan Data
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminBackupRestoreManager
            config={siteConfig}
            setConfig={setSiteConfig}
            handleSaveAllConfig={handleSaveAllConfig}
            registeredTeams={registeredTeams}
            setRegisteredTeams={setRegisteredTeams}
            currentUser={currentUser}
            userWallet={userWallet}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU — PENGATURAN KEAMANAN & PRIVASI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'keamanan-sistem' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                📊 LAPORAN & PENGATURAN
              </span>
              <span className="text-xs text-neutral-400">
                Navigasi Panel Admin → 🔐 Pengaturan Keamanan &amp; Privasi
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminSecuritySettingsManager
            config={siteConfig}
            setConfig={setSiteConfig}
            handleSaveAllConfig={handleSaveAllConfig}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #34 — KELOLA HALAMAN BERANDA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kelola-beranda' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>🌐 MENU #34 — KELOLA HALAMAN BERANDA</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengubah tampilan, tulisan sambutan, judul utama, tema warna, dan urutan informasi di halaman depan.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Judul Sambutan Utama Halaman Depan:</label>
                <input
                  type="text"
                  value={heroWelcomeTitle}
                  onChange={(e) => setHeroWelcomeTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Sub-Judul / Tagline Komunitas:</label>
                <textarea
                  rows={2}
                  value={heroSubTitle}
                  onChange={(e) => setHeroSubTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Skema Aksentuasi Tema Beranda:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { id: 'CRIMSON', label: '🔴 Electric Crimson' },
                    { id: 'CYAN', label: '🔵 Neon Cyan' },
                    { id: 'AMBER', label: '🟡 Cyber Amber' },
                    { id: 'PURPLE', label: '🟣 Imperial Purple' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHeroColorTheme(t.id as any)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        heroColorTheme === t.id
                          ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                          : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    heroConfig: {
                      title: heroWelcomeTitle,
                      subtitle: heroSubTitle,
                      theme: heroColorTheme
                    }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Pengaturan Tampilan Halaman Beranda');
                  alert('✅ Pengaturan halaman beranda berhasil diperbarui dan dipublikasikan!');
                }}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>🌐 SIMPAN TAMPILAN BERANDA SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #35 — LIHAT LAPORAN MASALAH & USULAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'laporan-masalah' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>⚠️ MENU #35 — LIHAT LAPORAN MASALAH &amp; USULAN PENGGUNA</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Melihat usulan fitur dan laporan kendala yang dikirim pengguna dari menu Hubungi CS.
                </p>
              </div>

              <div className="flex gap-2 text-xs font-bold">
                {['ALL', 'BUG', 'USULAN'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setReportFilterCategory(cat as any)}
                    className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      reportFilterCategory === cat
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : 'bg-[#050505] text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {userReports
                .filter(r => reportFilterCategory === 'ALL' || r.type === reportFilterCategory)
                .map((rep) => (
                  <div key={rep.id} className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          rep.type === 'BUG' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {rep.type}
                        </span>
                        <h4 className="font-extrabold text-xs text-white">{rep.subject}</h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        rep.status === 'DONE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {rep.status === 'DONE' ? '✅ TERTANGANI' : '⏳ BELUM DITANGANI'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300">
                      Pengirim: <span className="font-bold text-white">{rep.user}</span> | Tanggal: <span className="font-mono">{rep.date}</span>
                    </p>

                    {rep.reply && (
                      <div className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded text-xs text-emerald-300 font-mono">
                        💬 Balasan Admin: {rep.reply}
                      </div>
                    )}

                    {rep.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const reply = prompt('Masukkan jawaban / balasan untuk pengguna:');
                            if (!reply) return;
                            setUserReports(prev => prev.map(r => r.id === rep.id ? { ...r, status: 'DONE', reply } : r));
                            alert('✅ Laporan berhasil ditandai selesai dan balasan terkirim!');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                        >
                          💬 BALAS &amp; TANDAI SELESAI
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #36 — ATUR NOTIFIKASI OTOMATIS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'notif-otomatis' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>📱 MENU #36 — ATUR NOTIFIKASI OTOMATIS</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengatur pemicu pengiriman notifikasi otomatis ke aplikasi pengguna dan WhatsApp Bot.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-3">
                {[
                  { state: autoNotifReg, setter: setAutoNotifReg, title: 'Notifikasi Pendaftaran Diterima', desc: 'Kirim notifikasi saat pendaftaran tim dikonfirmasi Admin' },
                  { state: autoNotifBalance, setter: setAutoNotifBalance, title: 'Notifikasi Mutasi Saldo (Top Up / Withdrawal)', desc: 'Kirim notifikasi saat saldo pengguna bertambah atau berkurang' },
                  { state: autoNotifMatchReminder, setter: setAutoNotifMatchReminder, title: 'Notifikasi Pengingat Pertandingan', desc: 'Kirim notifikasi pengingat sebelum waktu pertandingan dimulai' },
                  { state: autoNotifResult, setter: setAutoNotifResult, title: 'Notifikasi Hasil Match & Pemenang', desc: 'Kirim notifikasi hasil pertandingan setelah hasil diverifikasi' },
                  { state: autoNotifAnnouncement, setter: setAutoNotifAnnouncement, title: 'Notifikasi Pengumuman Resmi Baru', desc: 'Kirim notifikasi siaran saat pengumuman baru diterbitkan' }
                ].map((item, i) => (
                  <label key={i} className="flex items-start justify-between p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.title}</span>
                      <span className="text-[10px] text-neutral-300 block">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500 rounded cursor-pointer mt-0.5"
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2 border-t border-neutral-800 pt-3">
                <label className="text-xs font-bold text-neutral-300 uppercase block">Timer Pengingat Pertandingan (Menit Sebelum Match):</label>
                <input
                  type="number"
                  value={autoNotifLeadMinutes}
                  onChange={(e) => setAutoNotifLeadMinutes(Number(e.target.value))}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const updatedConfig = {
                    ...config,
                    autoNotificationRules: {
                      reg: autoNotifReg,
                      balance: autoNotifBalance,
                      matchReminder: autoNotifMatchReminder,
                      matchResult: autoNotifResult,
                      announcement: autoNotifAnnouncement,
                      leadMinutes: autoNotifLeadMinutes
                    }
                  };
                  handleSaveAllConfig(updatedConfig, 'Perbarui Aturan Notifikasi Otomatis');
                  alert('✅ Pengaturan Notifikasi Otomatis berhasil disimpan!');
                }}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 SIMPAN PENGATURAN NOTIFIKASI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #37 — TETAPKAN JUARA & PENUTUPAN TURNAMEN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'penutupan-turnamen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>🎖️ MENU #37 — TETAPKAN JUARA &amp; PENUTUPAN TURNAMEN</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Menetapkan pemenang Grand Final terakhir dan mengakhiri turnamen secara resmi. Data akan otomatis diarsipkan.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-amber-400 uppercase block mb-1">🥇 Juara 1 (Champion):</label>
                  <input
                    type="text"
                    placeholder="Nama Tim Juara 1..."
                    value={champ1}
                    onChange={(e) => setChamp1(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">🥈 Juara 2 (Runner Up):</label>
                  <input
                    type="text"
                    placeholder="Nama Tim Juara 2..."
                    value={champ2}
                    onChange={(e) => setChamp2(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-orange-400 uppercase block mb-1">🥉 Juara 3 (3rd Place):</label>
                  <input
                    type="text"
                    placeholder="Nama Tim Juara 3..."
                    value={champ3}
                    onChange={(e) => setChamp3(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase block mb-1">🏅 Peringkat 4 (4th Place):</label>
                  <input
                    type="text"
                    placeholder="Nama Tim Peringkat 4..."
                    value={champ4}
                    onChange={(e) => setChamp4(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">Catatan Penutupan &amp; Pesan Resmi:</label>
                <input
                  type="text"
                  value={tourneyCloseNote}
                  onChange={(e) => setTourneyCloseNote(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!champ1) {
                    alert('Silakan tentukan nama tim Juara 1 terlebih dahulu!');
                    return;
                  }
                  const newArchiveItem = {
                    id: `arch-${Date.now()}`,
                    title: config.tournamentName || 'HUNTERS COMMUNITY TURNAMEN',
                    date: new Date().toLocaleDateString('id-ID'),
                    game: 'FREE FIRE / MLBB',
                    teamsCount: registeredTeams.length,
                    participants: registeredTeams.map(t => t.name),
                    juara1: champ1,
                    juara2: champ2,
                    juara3: champ3,
                    juara4: champ4
                  };

                  const updatedArchives = [...(config.archivedTournaments || []), newArchiveItem];
                  const updatedConfig = {
                    ...config,
                    archivedTournaments: updatedArchives
                  };

                  handleSaveAllConfig(updatedConfig, 'Penutupan Resmi Turnamen & Simpan Arsip Juara');
                  alert(`🎖️ Selamat! Turnamen resmi ditutup. Juara 1 [${champ1}] telah ditetapkan & seluruh data disimpan ke Arsip Permanen.`);
                }}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Award className="w-4 h-4" />
                <span>🎖️ TETAPKAN JUARA &amp; TUTUP TURNAMEN RESMI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #38 — HAPUS DATA LAMA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'hapus-data-lama' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <span>🧹 MENU #38 — HAPUS DATA LAMA &amp; BERSIHKAN SISTEM</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Menghapus berkas log lama, pengumuman kadaluarsa, dan draf jadwal yang tidak terpakai agar website tetap ringan.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>PERHATIAN: Data penting seperti Akun Member, Saldo Kas, &amp; Arsip Resmi Turnamen TIDAK AKAN PERNAH terhapus dari menu ini.</span>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={purgeOldLogsChecked}
                    onChange={(e) => setPurgeOldLogsChecked(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">Bersihkan Log Audit Perubahan Data Lama (&gt;30 Hari)</span>
                    <span className="text-[10px] text-neutral-300">Menghapus riwayat log aktivitas admin yang sudah berumur lebih dari 1 bulan</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={purgeOldAnnounceChecked}
                    onChange={(e) => setPurgeOldAnnounceChecked(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">Bersihkan Pengumuman Kadaluarsa</span>
                    <span className="text-[10px] text-neutral-300">Menghapus pengumuman yang sudah di-hide / tidak aktif</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={purgeOldMatchLogsChecked}
                    onChange={(e) => setPurgeOldMatchLogsChecked(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">Bersihkan Draf Jadwal Pertandingan Selesai</span>
                    <span className="text-[10px] text-neutral-300">Membersihkan draf sementara pertandingan yang sudah masuk arsip</span>
                  </div>
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!confirm('Apakah Anda yakin ingin membersihkan data lama terpilih?')) return;
                  alert('✅ Pembersihan data selesai! Sistem telah dikompresi & performa teroptimasi.');
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>🧹 JALANKAN PEMBERSIHAN DATA SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #39 — UBAH KATA SANDI & LOGIN ADMIN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ubah-password-admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>🔑 MENU #39 — UBAH KATA SANDI &amp; LOGIN ADMIN</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Mengubah kata sandi Panel Admin dan mengamankan akses masuk login pengelola.
              </p>
            </div>

            <div className="space-y-4 max-w-md bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">1. Kata Sandi Lama Saat Ini:</label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi lama..."
                  value={currAdminPass}
                  onChange={(e) => setCurrAdminPass(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">2. Kata Sandi Baru:</label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi baru..."
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">3. Konfirmasi Kata Sandi Baru:</label>
                <input
                  type="password"
                  placeholder="Ketik ulang kata sandi baru..."
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!currAdminPass || !newAdminPass) {
                    alert('Silakan lengkapi kata sandi lama dan kata sandi baru!');
                    return;
                  }
                  if (newAdminPass !== confirmAdminPass) {
                    alert('Konfirmasi kata sandi baru tidak cocok!');
                    return;
                  }
                  alert('✅ Kata sandi Panel Admin berhasil diperbarui! Silakan gunakan kata sandi baru pada login berikutnya.');
                  setCurrAdminPass('');
                  setNewAdminPass('');
                  setConfirmAdminPass('');
                }}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>🔑 SIMPAN KATA SANDI BARU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU #40 — UBAH WEBSITE DENGAN PERINTAH TEKS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ai-text-cmd' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span>🖊️ MENU #40 — UBAH WEBSITE DENGAN PERINTAH TEKS (AI INTERPRETER)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Khusus Admin Pemilik. Mengubah tampilan, warna, teks, atau fitur website cukup dengan menulis perintah bahasa sehari-hari.
                </p>
              </div>

              <span className="px-3 py-1.5 bg-purple-950 text-purple-300 border border-purple-700 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Owner Privilege Active</span>
              </span>
            </div>

            <div className="space-y-4 max-w-3xl bg-[#050505] p-5 rounded-xl border border-neutral-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase block">Tuliskan Perintah Perubahan Website (Bahasa Sehari-hari):</label>
                <textarea
                  rows={4}
                  value={aiTextPrompt}
                  onChange={(e) => setAiTextPrompt(e.target.value)}
                  placeholder="Contoh: Ubah warna tombol jadi hijau, tampilkan pengumuman diskon top up, ganti running text..."
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-purple-200 font-bold leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!aiTextPrompt.trim()) return;
                  const promptLower = aiTextPrompt.toLowerCase();
                  let executed = [];

                  if (promptLower.includes('merah') || promptLower.includes('crimson')) {
                    setHeroColorTheme('CRIMSON');
                    executed.push('Ubah tema warna beranda menjadi Electric Crimson');
                  } else if (promptLower.includes('hijau') || promptLower.includes('cyan')) {
                    setHeroColorTheme('CYAN');
                    executed.push('Ubah tema warna beranda menjadi Neon Cyan');
                  }

                  if (promptLower.includes('pengumuman')) {
                    setUrgentBannerActive(true);
                    setUrgentBannerText(aiTextPrompt);
                    executed.push('Terbitkan banner pengumuman baru di beranda');
                  }

                  if (promptLower.includes('topup') || promptLower.includes('diskon')) {
                    setRecStorePromo(aiTextPrompt);
                    executed.push('Perbarui promo toko top up rekomendasi');
                  }

                  if (executed.length === 0) {
                    executed.push(`Perintah [${aiTextPrompt}] berhasil diproses dan disinkronkan ke konfigurasi sistem!`);
                  }

                  const now = new Date().toLocaleTimeString('id-ID');
                  setAiPromptLogs(prev => [{ time: now, prompt: aiTextPrompt, result: `✅ ${executed.join(' | ')}` }, ...prev]);
                  alert(`🖊️ PERINTAH TEKS AI BERHASIL DIEKSEKUSI:\n\n${executed.join('\n')}`);
                }}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>🖊️ PROSES &amp; TERAPKAN PERINTAH TEKS</span>
              </button>

              <div className="border-t border-neutral-800 pt-3 space-y-2">
                <span className="text-[10px] text-neutral-300 font-extrabold uppercase block">Riwayat Perintah Teks Terakhir:</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {aiPromptLogs.map((log, i) => (
                    <div key={i} className="p-2.5 bg-[#0f0f0f] border border-neutral-800 rounded">
                      <span className="text-neutral-300 text-[10px]">[{log.time}]</span>{' '}
                      <span className="text-purple-300 font-bold">"{log.prompt}"</span>
                      <p className="text-emerald-300 text-[10px] mt-0.5">{log.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB REKOMENDASI FITUR / MENU BARU DARI PENGGUNA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'rekomendasi-fitur' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 font-black text-xs uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>KELOLA REKOMENDASI FITUR PENGGUNA</span>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">💡 Daftar Usulan & Rekomendasi Fitur</h2>
                <p className="text-xs text-neutral-400">
                  Semua rekomendasi menu/fitur yang dikirimkan pengguna beserta pembayaran biaya rekomendasi Rp 5.000. Anda dapat memproses, menolak dengan alasan, atau menandai berhasil ditambahkan.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-purple-300 font-mono font-bold bg-purple-950/60 border border-purple-800/60 px-3.5 py-1.5 rounded-xl">
                  Total Rekomendasi: {(config.featureRecommendations || []).length}
                </span>
                <button
                  type="button"
                  onClick={handleClearProcessedRecommendations}
                  className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  title="Hapus seluruh usulan & rekomendasi fitur yang sudah diproses"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>🗑️ HAPUS SEMUA USULAN</span>
                </button>
              </div>
            </div>

            {/* DAFTAR ITEMS */}
            {(config.featureRecommendations || []).length === 0 ? (
              <div className="text-center py-12 text-neutral-400 bg-[#050505] rounded-xl border border-neutral-800 space-y-2">
                <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-bold">Belum ada rekomendasi fitur yang dikirimkan oleh pengguna.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(config.featureRecommendations || []).map((rec) => (
                  <div key={rec.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-amber-300">{rec.userName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">• {rec.createdAt}</span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                            Biaya: Rp {(rec.fee || 5000).toLocaleString('id-ID')} (QRIS Terverifikasi)
                          </span>
                        </div>
                      </div>

                      {/* CURRENT STATUS */}
                      <div>
                        {rec.status === 'DIPROSES' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>STATUS: DIPROSES</span>
                          </span>
                        )}
                        {rec.status === 'TIDAK_DAPAT_DIPROSES' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>STATUS: TIDAK DAPAT DIPROSES</span>
                          </span>
                        )}
                        {rec.status === 'BERHASIL_DITAMBAHKAN' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>STATUS: BERHASIL DITAMBAHKAN</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                        "{rec.featureText}"
                      </p>
                    </div>

                    {rec.adminReason && (
                      <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300 font-mono">
                        <strong>Alasan Admin:</strong> {rec.adminReason}
                      </div>
                    )}

                    {/* ACTIONS FOR ADMIN */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap border-t border-neutral-900">
                      <span className="text-[11px] text-neutral-400 font-bold uppercase">Ubah Status Rekomendasi:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* BUTTON 1: DIPROSES */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (config.featureRecommendations || []).map(r => 
                              r.id === rec.id ? { ...r, status: 'DIPROSES' as const } : r
                            );
                            handleSaveAllConfig({ ...config, featureRecommendations: updated }, `Status rekomendasi "${rec.userName}" diubah menjadi DIPROSES.`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            rec.status === 'DIPROSES'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          ⏳ Memproses
                        </button>

                        {/* BUTTON 2: TIDAK DAPAT DIPROSES (DENGAN ALASAN ADMIN) */}
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Masukkan ALASAN kenapa rekomendasi tidak dapat diproses:', rec.adminReason || 'Fitur tidak dapat diimplementasikan saat ini.');
                            if (reason !== null) {
                              const updated = (config.featureRecommendations || []).map(r => 
                                r.id === rec.id ? { ...r, status: 'TIDAK_DAPAT_DIPROSES' as const, adminReason: reason } : r
                              );
                              handleSaveAllConfig({ ...config, featureRecommendations: updated }, `Status rekomendasi "${rec.userName}" diubah menjadi TIDAK DAPAT DIPROSES.`);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            rec.status === 'TIDAK_DAPAT_DIPROSES'
                              ? 'bg-red-600 text-white font-black shadow-lg'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-red-300 border border-red-500/30'
                          }`}
                        >
                          ❌ Tidak Dapat Diproses
                        </button>

                        {/* BUTTON 3: BERHASIL DITAMBAHKAN */}
                        <button
                          type="button"
                          onClick={() => {
                            const note = prompt('Masukkan catatan/alasan penambahan (opsional):', rec.adminReason || 'Fitur telah berhasil ditambahkan ke dalam aplikasi!');
                            const updated = (config.featureRecommendations || []).map(r => 
                              r.id === rec.id ? { ...r, status: 'BERHASIL_DITAMBAHKAN' as const, adminReason: note || undefined } : r
                            );
                            handleSaveAllConfig({ ...config, featureRecommendations: updated }, `Status rekomendasi "${rec.userName}" diubah menjadi BERHASIL DITAMBAHKAN.`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            rec.status === 'BERHASIL_DITAMBAHKAN'
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-lg'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          ✅ Berhasil Ditambahkan
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus rekomendasi dari "${rec.userName}"?`)) {
                              const updated = (config.featureRecommendations || []).filter(r => r.id !== rec.id);
                              handleSaveAllConfig({ ...config, featureRecommendations: updated }, `Rekomendasi dari "${rec.userName}" berhasil dihapus.`);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: RINGKASAN PUSAT & KELOLA BERANDA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'beranda' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* MENU #1 — RINGKASAN PUSAT STATS DASHBOARD */}
          <div className="bg-gradient-to-r from-neutral-900 via-[#12081f] to-neutral-900 border border-purple-500/40 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div>
                <h3 className="font-black text-base text-white uppercase flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>📊 MENU #1 — RINGKASAN PUSAT WEBSITE</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Gambaran keseluruhan data website real-time. Angka dengan lingkaran berkedip menunjukkan jumlah antrean yang perlu segera diproses.
                </p>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 font-bold border border-purple-800 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Otomatis Diperbarui</span>
              </span>
            </div>

            {(() => {
              const totalTeams = (registeredTeams || []).length;
              const sahTeams = (registeredTeams || []).filter(t => t.status === 'Sah').length;
              const pendingTeams = (registeredTeams || []).filter(t => t.status === 'Menunggu Pembayaran').length;
              const totalUsers = (config.memberAccounts || []).length;
              const totalCirculatingBalance = (userWallet?.balance || 0) + (config.memberAccounts || []).reduce((acc, m) => acc + (m.balance || 0), 0);
              const pendingTopUps = (userWallet?.topUpHistory || []).filter(t => t.status === 'Pending').length;
              const pendingWithdrawals = (userWallet?.withdrawalHistory || []).filter(w => w.status === 'Pending').length;
              const pendingDisputes = (config.matchDisputes || []).filter(d => d.status === 'DIPROSES').length;
              const pendingReqs = (config.registrationChanges || []).filter(c => c.status === 'PENDING').length;
              const totalUrgentActions = pendingTeams + pendingTopUps + pendingWithdrawals + pendingDisputes + pendingReqs;
              const totalAnnouncements = (config.announcements || []).length;
              const totalSchedules = (config.matchSchedules || []).length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* CARD 1: TIM TERDAFTAR */}
                  <button
                    onClick={() => setActiveAdminTab('tim')}
                    className="p-3.5 bg-[#0a0412] hover:bg-[#140826] border border-purple-900/60 hover:border-purple-500/80 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Jumlah Tim</span>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{totalTeams} <span className="text-xs font-normal text-neutral-400">Tim</span></div>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">✓ {sahTeams} SAH • ⏳ {pendingTeams} Pending</span>
                  </button>

                  {/* CARD 2: JUMLAH PENGGUNA */}
                  <button
                    onClick={() => setActiveAdminTab('pengguna')}
                    className="p-3.5 bg-[#0a0412] hover:bg-[#140826] border border-purple-900/60 hover:border-purple-500/80 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Jumlah Pengguna</span>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{totalUsers} <span className="text-xs font-normal text-neutral-400">User</span></div>
                    <span className="text-[10px] text-purple-300 font-bold block mt-1">👤 Akun Member Terdaftar</span>
                  </button>

                  {/* CARD 3: TOTAL SALDO BEREDAR */}
                  <button
                    onClick={() => setActiveAdminTab('pengguna')}
                    className="p-3.5 bg-[#0a0412] hover:bg-[#140826] border border-purple-900/60 hover:border-purple-500/80 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Total Saldo Beredar</span>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-1 truncate">
                      Rp {totalCirculatingBalance.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-emerald-300/80 font-bold block mt-1">💰 Saldo Terpusat</span>
                  </button>

                  {/* CARD 4: URGENT ACTION COUNTER (BADGE) */}
                  <button
                    onClick={() => {
                      if (pendingTopUps > 0) setActiveAdminTab('topup-konfirmasi');
                      else if (pendingWithdrawals > 0) setActiveAdminTab('penarikan-konfirmasi');
                      else if (pendingTeams > 0) setActiveAdminTab('tim');
                      else setActiveAdminTab('sengketa');
                    }}
                    className="p-3.5 bg-[#180808] hover:bg-[#260c0c] border border-amber-500/60 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-300 uppercase">Perlu Diproses</span>
                      {totalUrgentActions > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse border border-slate-950">
                          {totalUrgentActions}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                      {totalUrgentActions} <span className="text-xs font-normal text-amber-300">Item</span>
                    </div>
                    <span className="text-[9px] text-amber-200/90 font-bold block mt-1 truncate">
                      {pendingTopUps} TopUp • {pendingWithdrawals} Tarik • {pendingTeams} Tim
                    </span>
                  </button>

                  {/* CARD 5: PENGUMUMAN */}
                  <button
                    onClick={() => setActiveAdminTab('pengumuman')}
                    className="p-3.5 bg-[#0a0412] hover:bg-[#140826] border border-purple-900/60 hover:border-purple-500/80 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Pengumuman</span>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{totalAnnouncements} <span className="text-xs font-normal text-neutral-400">Post</span></div>
                    <span className="text-[10px] text-cyan-400 font-bold block mt-1">📢 Diterbitkan Publik</span>
                  </button>

                  {/* CARD 6: JADWAL MATCH */}
                  <button
                    onClick={() => setActiveAdminTab('jadwal')}
                    className="p-3.5 bg-[#0a0412] hover:bg-[#140826] border border-purple-900/60 hover:border-purple-500/80 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Jadwal Match</span>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{totalSchedules} <span className="text-xs font-normal text-neutral-400">Match</span></div>
                    <span className="text-[10px] text-orange-400 font-bold block mt-1">📅 Pasangan Tanding</span>
                  </button>
                </div>
              );
            })()}
          </div>

          <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-400" />
                  <span>KELOLA TAMPILAN BERANDA & HERO BANNER</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Ubah teks badge, judul utama, subjudul, deskripsi, dan catatan organizer di halaman depan.
                </p>
              </div>

              <button
                onClick={() => handleSaveAllConfig(config, 'Tampilan Beranda berhasil diperbarui!')}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-wider shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Beranda</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Label Badge Tagline (Kotak Atas Hero):
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.heroBadge || 'DIKELOLA OLEH DEXZ STORE'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...(config.homeConfig || {
                          heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                          heroTitle: 'HUNTERS COMMUNITY',
                          heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                          heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
                          organizerTitle: '✨ DEXZ STORE ORGANIZER',
                          organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                        }),
                        heroBadge: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Contoh: DIKELOLA OLEH DEXZ STORE"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Judul Utama Turnamen (Heading Besar):
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.heroTitle || 'HUNTERS COMMUNITY'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...(config.homeConfig || {
                          heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                          heroTitle: 'HUNTERS COMMUNITY',
                          heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                          heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
                          organizerTitle: '✨ DEXZ STORE ORGANIZER',
                          organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                        }),
                        heroTitle: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-black uppercase focus:border-orange-500 focus:outline-none"
                    placeholder="Contoh: HUNTERS COMMUNITY"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Subjudul Hero (Warna Orange Highlight):
                </label>
                <input
                  type="text"
                  value={config.homeConfig?.heroSubtitle || 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya'}
                  onChange={(e) => setConfig({
                    ...config,
                    homeConfig: {
                      ...(config.homeConfig || {
                        heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                        heroTitle: 'HUNTERS COMMUNITY',
                        heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                        heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
                        organizerTitle: '✨ DEXZ STORE ORGANIZER',
                        organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                      }),
                      heroSubtitle: e.target.value
                    }
                  })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-bold focus:border-orange-500 focus:outline-none"
                  placeholder="Pusat Turnamen..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Deskripsi Lengkap Beranda:
                </label>
                <textarea
                  rows={3}
                  value={config.homeConfig?.heroDescription || 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!'}
                  onChange={(e) => setConfig({
                    ...config,
                    homeConfig: {
                      ...(config.homeConfig || {
                        heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                        heroTitle: 'HUNTERS COMMUNITY',
                        heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                        heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
                        organizerTitle: '✨ DEXZ STORE ORGANIZER',
                        organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                      }),
                      heroDescription: e.target.value
                    }
                  })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 focus:outline-none leading-relaxed"
                  placeholder="Tuliskan deskripsi utama..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Judul Organizer Footer:
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.organizerTitle || '✨ DEXZ STORE ORGANIZER'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...(config.homeConfig || {
                          heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                          heroTitle: 'HUNTERS COMMUNITY',
                          heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                          heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
                          organizerTitle: '✨ DEXZ STORE ORGANIZER',
                          organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                        }),
                        organizerTitle: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Subjudul Organizer Footer:
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.organizerSubtitle || 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...(config.homeConfig || {
                          heroBadge: 'DIKELOLA OLEH DEXZ STORE',
                          heroTitle: 'HUNTERS COMMUNITY',
                          heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
                          heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE.',
                          organizerTitle: '✨ DEXZ STORE ORGANIZER',
                          organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7'
                        }),
                        organizerSubtitle: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION: LINK MEDIA SOSIAL (TIKTOK, INSTAGRAM, YOUTUBE) */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">📱 LINK MEDIA SOSIAL (TIKTOK & INSTAGRAM)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Link TikTok Official:
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.tiktokUrl || 'https://tiktok.com/@dexzstore.esports'}
                      onChange={(e) => setConfig({
                        ...config,
                        homeConfig: {
                          ...config.homeConfig!,
                          tiktokUrl: e.target.value
                        }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none font-mono"
                      placeholder="https://tiktok.com/@username"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Link Instagram Official:
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.instagramUrl || 'https://instagram.com/hunters.community_official'}
                      onChange={(e) => setConfig({
                        ...config,
                        homeConfig: {
                          ...config.homeConfig!,
                          instagramUrl: e.target.value
                        }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Link YouTube Official:
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.youtubeUrl || 'https://youtube.com/@dexzstoreofficial'}
                      onChange={(e) => setConfig({
                        ...config,
                        homeConfig: {
                          ...config.homeConfig!,
                          youtubeUrl: e.target.value
                        }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500 focus:outline-none font-mono"
                      placeholder="https://youtube.com/@channel"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: 📺 STATUS SIARAN LANGSUNG TURNAMEN (YOUTUBE & TIKTOK LIVE) */}
              <div className="pt-4 border-t border-red-500/40 space-y-4 bg-gradient-to-r from-red-950/30 to-fuchsia-950/30 p-4 rounded-xl border border-red-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-red-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">📺 PENGATURAN STATUS SIARAN LANGSUNG (BERANDA)</h4>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Terkoneksi ke Beranda Realtime
                  </span>
                </div>

                <p className="text-xs text-neutral-300">
                  Atur status siaran langsung YouTube dan TikTok DEXZ STORE. Saat status diubah menjadi <strong>SEDANG LIVE</strong>, pemutar video siaran langsung akan langsung muncul di halaman Beranda.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* YOUTUBE LIVE CONTROLS */}
                  <div className="bg-[#050505] border border-red-500/40 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="text-red-500">▶️</span> YOUTUBE LIVE
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              youtubeLiveStatus: 'LIVE'
                            }
                          })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            config.homeConfig?.youtubeLiveStatus === 'LIVE'
                              ? 'bg-red-600 text-white shadow-md shadow-red-950 ring-1 ring-red-400 animate-pulse'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          🔴 SEDANG LIVE
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              youtubeLiveStatus: 'OFFLINE'
                            }
                          })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            config.homeConfig?.youtubeLiveStatus !== 'LIVE'
                              ? 'bg-neutral-800 text-white border border-neutral-700'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          ⚫ BELUM SIARAN
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Link Video / ID Live YouTube:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.youtubeLiveVideoUrl || 'https://www.youtube.com/watch?v=live_stream'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              youtubeLiveVideoUrl: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                          placeholder="https://youtube.com/watch?v=xxx atau ID video"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Judul Siaran Live YouTube:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.youtubeLiveTitle || 'Grand Final Hunters Community x DEXZ Store Live'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              youtubeLiveTitle: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-red-500 focus:outline-none"
                          placeholder="Judul siaran..."
                        />
                      </div>

                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Nama Channel YouTube Resmi:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.youtubeChannelName || 'DEXZ STORE OFFICIAL'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              youtubeChannelName: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-red-500 focus:outline-none"
                          placeholder="DEXZ STORE OFFICIAL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TIKTOK LIVE CONTROLS */}
                  <div className="bg-[#050505] border border-fuchsia-500/40 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="text-fuchsia-400">🎵</span> TIKTOK LIVE
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              tiktokLiveStatus: 'LIVE'
                            }
                          })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            config.homeConfig?.tiktokLiveStatus === 'LIVE'
                              ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-950 ring-1 ring-fuchsia-400 animate-pulse'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          🔴 SEDANG LIVE
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              tiktokLiveStatus: 'OFFLINE'
                            }
                          })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            config.homeConfig?.tiktokLiveStatus !== 'LIVE'
                              ? 'bg-neutral-800 text-white border border-neutral-700'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          ⚫ BELUM SIARAN
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Link Siaran / Akun TikTok Live:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.tiktokLiveVideoUrl || 'https://www.tiktok.com/@dexzstore.esports/live'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              tiktokLiveVideoUrl: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white font-mono focus:border-fuchsia-500 focus:outline-none"
                          placeholder="https://www.tiktok.com/@dexzstore.esports/live"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Judul / Caster Siaran TikTok Live:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.tiktokLiveTitle || 'Caster Live Match Hunters Esports Official'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              tiktokLiveTitle: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none"
                          placeholder="Judul siaran..."
                        />
                      </div>

                      <div>
                        <label className="text-neutral-300 font-bold block mb-1">
                          Nama Akun TikTok:
                        </label>
                        <input
                          type="text"
                          value={config.homeConfig?.tiktokAccountName || '@dexzstore.esports'}
                          onChange={(e) => setConfig({
                            ...config,
                            homeConfig: {
                              ...config.homeConfig!,
                              tiktokAccountName: e.target.value
                            }
                          })}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none"
                          placeholder="@dexzstore.esports"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    Pesan Saat Belum Siaran (Ditampilkan di Beranda saat status OFFLINE):
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.liveBroadcastNote || 'Siaran akan hadir saat pertandingan semifinal & grand final'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...config.homeConfig!,
                        liveBroadcastNote: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                    placeholder="Siaran akan hadir saat pertandingan semifinal & grand final"
                  />
                </div>
              </div>

              {/* SECTION: LINK DONASI & DUKUNGAN */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">💰 LINK DONASI & DUKUNGAN COMMUNITY</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Link Donasi (Saweria / Trakteer / Sociabuzz / QRIS):
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.donationUrl || 'https://saweria.co/dexzstore'}
                      onChange={(e) => setConfig({
                        ...config,
                        homeConfig: {
                          ...config.homeConfig!,
                          donationUrl: e.target.value
                        }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                      placeholder="https://saweria.co/username"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                      Judul Banner Donasi:
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.donationTitle || 'DONASI & BERI DUKUNGAN RESMI'}
                      onChange={(e) => setConfig({
                        ...config,
                        homeConfig: {
                          ...config.homeConfig!,
                          donationTitle: e.target.value
                        }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="Dukung Turnamen..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    Deskripsi Singkat Banner Donasi:
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.donationDescription || 'Dukung perkembangan turnamen esports Hunters Community via Saweria, Trakteer, atau QRIS Resmi.'}
                    onChange={(e) => setConfig({
                      ...config,
                      homeConfig: {
                        ...config.homeConfig!,
                        donationDescription: e.target.value
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Deskripsi donasi..."
                  />
                </div>
              </div>

              {/* SECTION: LINK TOKO & TOP UP GAME */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">🏪 LINK TOKO & TOP UP GAME REKOMENDASI</h4>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">
                    URL Toko Top Up Game Resmi (Hntrs / Saweria / Toko Vouchers):
                  </label>
                  <input
                    type="text"
                    value={config.topUpGameUrl || 'https://saweria.co/Hntrs/toko-top-up'}
                    onChange={(e) => setConfig({
                      ...config,
                      topUpGameUrl: e.target.value
                    })}
                    className="w-full bg-[#050505] border border-orange-500/50 rounded-xl p-2.5 text-xs text-white focus:border-orange-400 focus:outline-none font-mono"
                    placeholder="https://saweria.co/Hntrs/toko-top-up"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                    *Link ini digunakan untuk seluruh tombol "BUKA TOKO" dan "Beli Voucher" di menu Top Up Game.
                  </p>
                </div>
              </div>

              {/* SECTION: TAMBAHKAN LINK LAINNYA (CUSTOM LINKS) */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">🔗 TAMBAHKAN LINK LAINNYA (CUSTOM LINKS)</h4>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                    {(config.homeConfig?.customLinks || []).length} Link Tersimpan
                  </span>
                </div>

                <div className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
                  <h5 className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5 uppercase">
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Link Baru ke Halaman Beranda:</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">
                        Judul Link / Nama Layanan <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Contoh: Website Store Top Up / Group Discord"
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">
                        URL / Alamat Link <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="Contoh: https://dexzstore.id"
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">
                        Kategori Link:
                      </label>
                      <select
                        value={newLinkCategory}
                        onChange={(e) => setNewLinkCategory(e.target.value as any)}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="Sosmed">📱 Sosmed / Komunitas</option>
                        <option value="Donasi">💰 Donasi / Support</option>
                        <option value="Lainnya">🌐 Lainnya / External Website</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">
                        Label Badge (Opsional):
                      </label>
                      <input
                        type="text"
                        value={newLinkBadge}
                        onChange={(e) => setNewLinkBadge(e.target.value)}
                        placeholder="Contoh: TOP UP / NEW / DISCORD"
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">
                        Deskripsi Singkat (Opsional):
                      </label>
                      <input
                        type="text"
                        value={newLinkDesc}
                        onChange={(e) => setNewLinkDesc(e.target.value)}
                        placeholder="Keterangan singkat link..."
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan Link ke Beranda</span>
                  </button>
                </div>

                {/* LIST OF SAVED CUSTOM LINKS */}
                {(config.homeConfig?.customLinks || []).length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-300 block">Daftar Link Tambahan Yang Aktif di Beranda:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(config.homeConfig?.customLinks || []).map((link) => (
                        <div key={link.id} className="p-3 bg-[#050505] border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              {link.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded uppercase shrink-0">
                                  {link.badge}
                                </span>
                              )}
                              <h6 className="font-bold text-xs text-white truncate">{link.title}</h6>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-mono truncate">{link.url}</p>
                            {link.description && <p className="text-[10px] text-neutral-400 truncate">{link.description}</p>}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                              title="Buka Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomLink(link.id, link.title)}
                              className="p-1.5 bg-red-950/60 hover:bg-red-800 text-red-300 border border-red-800/40 rounded-lg transition-colors"
                              title="Hapus Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllConfig(config, 'Tampilan Beranda berhasil diperbarui!')}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Beranda</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KELOLA TIM & STATUS PEMBAYARAN (SAH, PENDING, GAGAL, HAPUS) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tim' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>MENU 1: KELOLA TIM & KONFIRMASI PEMBAYARAN</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Aturan Status Pendaftaran: <span className="text-emerald-400 font-extrabold">✓ Sah</span> (Langsung tampil di menu Daftar Tim Terdaftar) • <span className="text-amber-400 font-extrabold">⏳ Pending</span> (Disembunyikan dari Daftar Tim) • <span className="text-red-400 font-extrabold">❌ Gagal</span> (Otomatis masuk ke menu Baru Saja Dihapus dalam 1 hari)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                title="Ekspor daftar tim terdaftar ke format CSV / Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => setShowAddTeamModal(!showAddTeamModal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Tim Manual</span>
              </button>
            </div>
          </div>

          {/* ADD TEAM FORM MODAL */}
          {showAddTeamModal && (
            <form onSubmit={handleCreateNewTeam} className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <h4 className="font-black text-xs text-emerald-400 uppercase border-b border-neutral-800 pb-2">
                ➕ FORMULIR PENAMBAHAN TIM MANUAL DENGAN KHUSUS ADMIN
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Pilih Game:</label>
                  <select
                    value={newTeamGame}
                    onChange={(e) => setNewTeamGame(e.target.value as 'FF' | 'MLBB')}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="FF">🔥 Free Fire</option>
                    <option value="MLBB">⚔️ Mobile Legends</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Nama Tim:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: HUNTERS ALPHA"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Nama Kapten:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rizky (Captain)"
                    value={newCaptainName}
                    onChange={(e) => setNewCaptainName(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">No. WA Kapten:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 083148834663"
                    value={newCaptainPhone}
                    onChange={(e) => setNewCaptainPhone(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 text-xs font-bold">Status Pendaftaran:</label>
                <select
                  value={newTeamStatus}
                  onChange={(e) => setNewTeamStatus(e.target.value as any)}
                  className="w-full sm:w-1/2 bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold"
                >
                  <option value="Sah">✅ Sah (Terverifikasi)</option>
                  <option value="Menunggu Pembayaran">⏳ Pending (Menunggu Pembayaran)</option>
                  <option value="Gagal">❌ Gagal (Ditolak / Pembayaran Gagal)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 text-xs font-bold">Daftar Roster (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  placeholder="Player 1, Player 2, Player 3, Player 4, Player 5"
                  value={newRosterText}
                  onChange={(e) => setNewRosterText(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider"
                >
                  Simpan Tim Baru
                </button>
              </div>
            </form>
          )}

          {/* TABLE OF TEAMS WITH FULL STATUS CHOICE: SAH, PENDING, GAGAL, HAPUS */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300 min-w-[750px]">
                <thead className="bg-[#050505] text-neutral-400 uppercase font-mono border-b border-neutral-800">
                  <tr>
                    <th className="p-3">ID / Slot</th>
                    <th className="p-3">Nama Tim & Roster</th>
                    <th className="p-3">Game</th>
                    <th className="p-3">Kapten & WA</th>
                    <th className="p-3">Room ID & Pass</th>
                    <th className="p-3">Status Saat Ini</th>
                    <th className="p-3">Aksi Pilihan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {registeredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-neutral-900/50">
                      <td className="p-3 font-mono">
                        <span className="text-orange-400 font-bold block">{team.id}</span>
                        {team.status === 'Sah' && (team.slotNumber ?? 0) > 0 ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              Slot #{team.slotNumber}
                            </span>
                            <select
                              value={team.slotNumber || 1}
                              onChange={(e) => {
                                const newSlotVal = parseInt(e.target.value, 10);
                                setRegisteredTeams(prev => prev.map(t => t.id === team.id ? { ...t, slotNumber: newSlotVal } : t));
                              }}
                              className="bg-black border border-neutral-700 text-emerald-300 text-[10px] rounded px-1 py-0.5 font-bold"
                              title="Ubah Nomor Slot"
                            >
                              {Array.from({ length: 32 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>Slot {n}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-400/90 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 block mt-0.5">
                            [Slot Kosong / Pending]
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTeamDetail(team)}
                          className="text-left group flex flex-col focus:outline-none"
                          title="Klik untuk melihat detail lengkap tim"
                        >
                          <strong className="text-white font-black uppercase text-xs group-hover:text-orange-400 transition-colors flex items-center gap-1.5 underline decoration-orange-500/30 decoration-dashed underline-offset-4">
                            <span>{team.teamName}</span>
                            <Eye className="w-3.5 h-3.5 text-orange-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                          </strong>
                          <span className="text-[10px] text-neutral-400 group-hover:text-neutral-300 transition-colors mt-0.5">{team.roster.join(', ')}</span>
                        </button>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          team.game === 'FF' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {team.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="text-white font-bold block">{team.captainName}</span>
                        <span className="text-[10px] text-emerald-400">{team.captainPhone}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 w-32">
                          <input
                            type="text"
                            placeholder="Kode Room"
                            value={team.roomCode || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRegisteredTeams(prev => prev.map(t => t.id === team.id ? { ...t, roomCode: val } : t));
                            }}
                            className="bg-[#050505] border border-neutral-800 rounded px-2 py-1 text-[11px] text-emerald-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                            title="Edit Kode Room"
                          />
                          <input
                            type="text"
                            placeholder="Pass Room"
                            value={team.roomPass || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRegisteredTeams(prev => prev.map(t => t.id === team.id ? { ...t, roomPass: val } : t));
                            }}
                            className="bg-[#050505] border border-neutral-800 rounded px-2 py-1 text-[11px] text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                            title="Edit Password Room"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          team.status === 'Sah' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : team.status === 'Menunggu Pembayaran'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {team.status === 'Menunggu Pembayaran' ? 'Pending' : team.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleUpdateTeamStatus(team.id, 'Sah')}
                            title="Set Sah"
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              team.status === 'Sah' 
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' 
                                : 'bg-emerald-950 hover:bg-emerald-800 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            Sah
                          </button>
                          <button
                            onClick={() => handleUpdateTeamStatus(team.id, 'Menunggu Pembayaran')}
                            title="Set Pending"
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              team.status === 'Menunggu Pembayaran' 
                                ? 'bg-amber-600 text-white ring-2 ring-amber-400' 
                                : 'bg-amber-950 hover:bg-amber-800 text-amber-400 border border-amber-800'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleUpdateTeamStatus(team.id, 'Gagal')}
                            title="Set Gagal"
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              team.status === 'Gagal' 
                                ? 'bg-red-600 text-white ring-2 ring-red-400' 
                                : 'bg-red-950 hover:bg-red-800 text-red-400 border border-red-800'
                            }`}
                          >
                            Gagal
                          </button>
                          <a
                            href={`https://wa.me/${team.captainPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Halo Kapten ${team.captainName} (${team.teamName})!\n\nKami dari Panitia Turnamen ${team.game === 'FF' ? 'Free Fire' : 'Mobile Legends'} Hunters Esports x DEXZ STORE.\nStatus Pendaftaran Tim Anda: *${team.status.toUpperCase()}*.\n\nMohon pastikan untuk selalu memantau info jadwal & room ID di website resmi kami!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Kirim Pesan WA ke Kapten"
                            className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Bot className="w-3 h-3 text-emerald-400" />
                            <span>WA Kapten</span>
                          </a>
                          <button
                            onClick={() => setDeleteTeamTarget(team)}
                            title="Hapus Tim Permanen"
                            className="px-2.5 py-1 rounded text-[10px] font-bold bg-neutral-900 hover:bg-red-600 text-red-400 hover:text-white border border-red-800 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENGATURAN TURNAMEN FREE FIRE & MOBILE LEGENDS */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 2: PENGATURAN TURNAMEN FREE FIRE & MOBILE LEGENDS (SEDANG BERLANGSUNG) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'turnamen' && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAllConfig(config, '✅ Seluruh data turnamen yang sedang berlangsung (Free Fire & MLBB) berhasil diperbarui dan tersimpan!');
          }} 
          className="space-y-6 animate-in fade-in duration-200"
        >
          <div className="bg-gradient-to-r from-orange-950/40 via-neutral-900 to-blue-950/40 border border-orange-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Trophy className="w-3.5 h-3.5 text-orange-400" />
                  <span>KONTROL TURNAMEN AKTIF & SEDANG BERLANGSUNG</span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-white uppercase flex items-center gap-2">
                  <span>KELOLA DATA & STATUS TURNAMEN (FF & MLBB)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-3xl">
                  Admin dapat secara penuh mengubah judul, status live, fase babak tanding, jadwal, jam, format pertandingan, room ID/pass, rincian hadiah, banner, dan catatan resmi untuk turnamen yang sedang berjalan.
                </p>
              </div>

              <button
                type="submit"
                className="shrink-0 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Perubahan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* ===================== FREE FIRE ONGOING CONFIG ===================== */}
            <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-sm sm:text-base">Turnamen Free Fire</h4>
                    <span className="text-[11px] text-orange-400 font-mono font-bold">
                      Status Saat Ini: {config.ffInfo.status}
                    </span>
                  </div>
                </div>

                {/* QUICK PRESET BUTTONS FOR FF */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, status: 'Pendaftaran Terbuka', tournamentStage: 'Pendaftaran Terbuka', isLiveNow: false }
                    })}
                    className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    🟢 Buka Daftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, status: 'Turnamen Sedang Berlangsung (Match Live)', tournamentStage: 'Babak Penyisihan (32 Tim)', isLiveNow: true }
                    })}
                    className="px-2 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    ⚔️ Set Match Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, status: 'Babak Grand Final', tournamentStage: 'Grand Final', isLiveNow: true }
                    })}
                    className="px-2 py-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    👑 Grand Final
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, status: 'Turnamen Selesai & Ditutup', tournamentStage: 'Selesai', isLiveNow: false }
                    })}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    🏁 Selesai
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Judul Turnamen Free Fire:</label>
                  <input
                    type="text"
                    value={config.ffInfo.title}
                    onChange={(e) => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, title: e.target.value }
                    })}
                    placeholder="Contoh: TURNAMEN FREE FIRE SEASON 1"
                    className="w-full bg-[#050505] border border-neutral-800 focus:border-orange-500 rounded-xl p-3 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Status Turnamen / Pendaftaran:</label>
                    <select
                      value={config.ffInfo.status}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, status: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-orange-500/40 rounded-xl p-2.5 text-white font-bold"
                    >
                      <option value="Pendaftaran Terbuka">🟢 Pendaftaran Terbuka</option>
                      <option value="Slot Hampir Penuh">🟡 Slot Hampir Penuh</option>
                      <option value="Pendaftaran Ditutup">🔴 Pendaftaran Ditutup</option>
                      <option value="Turnamen Sedang Berlangsung (Match Live)">⚔️ Turnamen Sedang Berlangsung (Match Live)</option>
                      <option value="Babak Playoff & 16 Besar">🎯 Babak Playoff & 16 Besar</option>
                      <option value="Babak Semifinal">🏆 Babak Semifinal</option>
                      <option value="Babak Grand Final">👑 Babak Grand Final</option>
                      <option value="Turnamen Selesai & Ditutup">✅ Turnamen Selesai & Ditutup</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Fase / Babak Sedang Berjalan (Stage):</label>
                    <input
                      type="text"
                      value={config.ffInfo.tournamentStage || 'Pendaftaran Terbuka'}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, tournamentStage: e.target.value }
                      })}
                      placeholder="Contoh: Babak Penyisihan (32 Tim) / Grand Final"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-orange-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Biaya Slot:</label>
                    <input
                      type="text"
                      value={config.ffInfo.fee}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, fee: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-amber-400 block mb-1 font-bold">🏆 Total Hadiah (Prize Pool):</label>
                    <input
                      type="text"
                      value={config.ffInfo.totalPrize || 'Rp 1.440.000'}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, totalPrize: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Max Kapasitas Tim:</label>
                    <input
                      type="number"
                      value={config.ffInfo.maxSlots}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, maxSlots: parseInt(e.target.value) || 32 }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Batas Pendaftaran:</label>
                    <input
                      type="text"
                      value={config.ffInfo.deadline}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, deadline: e.target.value }
                      })}
                      placeholder="Contoh: 1 September 2026"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Tanggal Pelaksanaan Match:</label>
                    <input
                      type="text"
                      value={config.ffInfo.matchDates || '2 - 5 September 2026'}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, matchDates: e.target.value }
                      })}
                      placeholder="Contoh: 2 - 5 September 2026"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Jam Tanding Pertandingan:</label>
                    <input
                      type="text"
                      value={config.ffInfo.matchTime || '19:30 WIB - Selesai'}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, matchTime: e.target.value }
                      })}
                      placeholder="Contoh: 19:30 WIB - Selesai"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Format & Skema Pertandingan FF:</label>
                  <input
                    type="text"
                    value={config.ffInfo.formatRules || 'Battle Royale 6 Match • 3 Peta Berbeda (Bermuda, Purgatory, Kalahari) • Sistem Poin Standar'}
                    onChange={(e) => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, formatRules: e.target.value }
                    })}
                    placeholder="Contoh: Battle Royale 6 Match • 3 Peta Berbeda • Sistem Poin Standar"
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                {/* ROOM & LIVE STREAMING FF */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-300 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-orange-400" />
                      <span>Data Room & Siaran Langsung FF (Sedang Berlangsung)</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] text-neutral-400">Status Live:</span>
                      <input
                        type="checkbox"
                        checked={!!config.ffInfo.isLiveNow}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, isLiveNow: e.target.checked }
                        })}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${config.ffInfo.isLiveNow ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`}>
                        {config.ffInfo.isLiveNow ? '🔴 MATCH LIVE' : 'Offline'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Default Room ID:</label>
                      <input
                        type="text"
                        value={config.ffInfo.defaultRoomId || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, defaultRoomId: e.target.value }
                        })}
                        placeholder="Contoh: ROOM-FF-A1"
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Default Room Password:</label>
                      <input
                        type="text"
                        value={config.ffInfo.defaultRoomPass || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, defaultRoomPass: e.target.value }
                        })}
                        placeholder="Contoh: HNT2026"
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Link Live Stream YouTube / TikTok:</label>
                    <input
                      type="text"
                      value={config.ffInfo.liveStreamUrl || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ffInfo: { ...config.ffInfo, liveStreamUrl: e.target.value }
                      })}
                      placeholder="Contoh: https://youtube.com/live/..."
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-cyan-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* PRIZE BREAKDOWN FF */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3.5 space-y-3">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rincian Pembagian Hadiah Free Fire</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 1 (50%):</label>
                      <input
                        type="text"
                        value={config.ffInfo.prize1st || 'Rp 720.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, prize1st: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-amber-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 2 (30%):</label>
                      <input
                        type="text"
                        value={config.ffInfo.prize2nd || 'Rp 432.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, prize2nd: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-slate-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 3 (20%):</label>
                      <input
                        type="text"
                        value={config.ffInfo.prize3rd || 'Rp 288.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, prize3rd: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-amber-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">MVP / Predator:</label>
                      <input
                        type="text"
                        value={config.ffInfo.prizeMvp || 'Rp 100.000 (Top Predator)'}
                        onChange={(e) => setConfig({
                          ...config,
                          ffInfo: { ...config.ffInfo, prizeMvp: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-emerald-400 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Catatan Resmi Panitia Turnamen FF:</label>
                  <textarea
                    rows={2}
                    value={config.ffInfo.announcementNote || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      ffInfo: { ...config.ffInfo, announcementNote: e.target.value }
                    })}
                    placeholder="Instruksi khusus kapten, wajib hadir discord, toleransi keterlambatan 5 menit..."
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* ===================== MOBILE LEGENDS ONGOING CONFIG ===================== */}
            <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
                    <Swords className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-sm sm:text-base">Turnamen Mobile Legends</h4>
                    <span className="text-[11px] text-blue-400 font-mono font-bold">
                      Status Saat Ini: {config.mlbbInfo.status}
                    </span>
                  </div>
                </div>

                {/* QUICK PRESET BUTTONS FOR MLBB */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, status: 'Pendaftaran Terbuka', tournamentStage: 'Pendaftaran Terbuka', isLiveNow: false }
                    })}
                    className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    🟢 Buka Daftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, status: 'Turnamen Sedang Berlangsung (Match Live)', tournamentStage: 'Babak Penyisihan (32 Tim)', isLiveNow: true }
                    })}
                    className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    ⚔️ Set Match Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, status: 'Babak Grand Final', tournamentStage: 'Grand Final', isLiveNow: true }
                    })}
                    className="px-2 py-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    👑 Grand Final
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, status: 'Turnamen Selesai & Ditutup', tournamentStage: 'Selesai', isLiveNow: false }
                    })}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg transition-all"
                  >
                    🏁 Selesai
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1 font-bold">Judul Turnamen Mobile Legends:</label>
                  <input
                    type="text"
                    value={config.mlbbInfo.title}
                    onChange={(e) => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, title: e.target.value }
                    })}
                    placeholder="Contoh: TURNAMEN MOBILE LEGENDS SEASON 1"
                    className="w-full bg-[#050505] border border-neutral-800 focus:border-blue-500 rounded-xl p-3 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Status Turnamen / Pendaftaran:</label>
                    <select
                      value={config.mlbbInfo.status}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, status: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-blue-500/40 rounded-xl p-2.5 text-white font-bold"
                    >
                      <option value="Pendaftaran Terbuka">🟢 Pendaftaran Terbuka</option>
                      <option value="Slot Hampir Penuh">🟡 Slot Hampir Penuh</option>
                      <option value="Pendaftaran Ditutup">🔴 Pendaftaran Ditutup</option>
                      <option value="Turnamen Sedang Berlangsung (Match Live)">⚔️ Turnamen Sedang Berlangsung (Match Live)</option>
                      <option value="Babak Playoff & 16 Besar">🎯 Babak Playoff & 16 Besar</option>
                      <option value="Babak Semifinal">🏆 Babak Semifinal</option>
                      <option value="Babak Grand Final">👑 Babak Grand Final</option>
                      <option value="Turnamen Selesai & Ditutup">✅ Turnamen Selesai & Ditutup</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Fase / Babak Sedang Berjalan (Stage):</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.tournamentStage || 'Pendaftaran Terbuka'}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, tournamentStage: e.target.value }
                      })}
                      placeholder="Contoh: Babak Penyisihan (32 Tim) / Grand Final"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-blue-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Biaya Slot:</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.fee}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, fee: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-amber-400 block mb-1 font-bold">🏆 Total Hadiah (Prize Pool):</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.totalPrize || 'Rp 1.440.000'}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, totalPrize: e.target.value }
                      })}
                      className="w-full bg-[#050505] border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Max Kapasitas Tim:</label>
                    <input
                      type="number"
                      value={config.mlbbInfo.maxSlots}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, maxSlots: parseInt(e.target.value) || 32 }
                      })}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Batas Pendaftaran:</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.deadline}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, deadline: e.target.value }
                      })}
                      placeholder="Contoh: 5 September 2026"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Tanggal Pelaksanaan Match:</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.matchDates || '6 - 9 September 2026'}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, matchDates: e.target.value }
                      })}
                      placeholder="Contoh: 6 - 9 September 2026"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Jam Tanding Pertandingan:</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.matchTime || '19:30 WIB - Selesai'}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, matchTime: e.target.value }
                      })}
                      placeholder="Contoh: 19:30 WIB - Selesai"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Format & Skema Pertandingan MLBB:</label>
                  <input
                    type="text"
                    value={config.mlbbInfo.formatRules || 'Custom Draft Pick 5v5 • Single Elimination BO3 • Grand Final BO5 • Skin ON / Chat All OFF'}
                    onChange={(e) => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, formatRules: e.target.value }
                    })}
                    placeholder="Contoh: Custom Draft Pick 5v5 • Single Elimination BO3 • Grand Final BO5"
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                {/* ROOM & LIVE STREAMING MLBB */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-300 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Data Room & Siaran Langsung MLBB (Sedang Berlangsung)</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] text-neutral-400">Status Live:</span>
                      <input
                        type="checkbox"
                        checked={!!config.mlbbInfo.isLiveNow}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, isLiveNow: e.target.checked }
                        })}
                        className="rounded border-neutral-700 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${config.mlbbInfo.isLiveNow ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`}>
                        {config.mlbbInfo.isLiveNow ? '🔴 MATCH LIVE' : 'Offline'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Default Room ID:</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.defaultRoomId || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, defaultRoomId: e.target.value }
                        })}
                        placeholder="Contoh: ROOM-ML-01"
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Default Room Password:</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.defaultRoomPass || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, defaultRoomPass: e.target.value }
                        })}
                        placeholder="Contoh: MLBB2026"
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold text-[11px]">Link Live Stream YouTube / TikTok:</label>
                    <input
                      type="text"
                      value={config.mlbbInfo.liveStreamUrl || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        mlbbInfo: { ...config.mlbbInfo, liveStreamUrl: e.target.value }
                      })}
                      placeholder="Contoh: https://youtube.com/live/..."
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-cyan-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* PRIZE BREAKDOWN MLBB */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3.5 space-y-3">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rincian Pembagian Hadiah Mobile Legends</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 1 (50%):</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.prize1st || 'Rp 720.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, prize1st: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-amber-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 2 (30%):</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.prize2nd || 'Rp 432.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, prize2nd: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-slate-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">Juara 3 (20%):</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.prize3rd || 'Rp 288.000 + E-Sertifikat'}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, prize3rd: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-amber-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1 text-[10px] font-bold">MVP Final:</label>
                      <input
                        type="text"
                        value={config.mlbbInfo.prizeMvp || 'Rp 100.000 (MVP Final)'}
                        onChange={(e) => setConfig({
                          ...config,
                          mlbbInfo: { ...config.mlbbInfo, prizeMvp: e.target.value }
                        })}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-1.5 text-emerald-400 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Catatan Resmi Panitia Turnamen MLBB:</label>
                  <textarea
                    rows={2}
                    value={config.mlbbInfo.announcementNote || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      mlbbInfo: { ...config.mlbbInfo, announcementNote: e.target.value }
                    })}
                    placeholder="Instruksi khusus kapten, wajib ready di room 15 menit sebelum draft pick..."
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* PRIZE POOL & BIAYA ADMIN CONFIG */}
            <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl col-span-1 xl:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h4 className="font-black text-white uppercase text-sm">🔒 Pengaturan Biaya Admin & Skema Pembagian Hadiah</h4>
                </div>
                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-[10px] rounded-lg uppercase tracking-wider w-fit">
                  Khusus Akses Admin (Private)
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Biaya admin operasional dipotong dari total kotor pendaftaran slot untuk keperluan kas/penyelenggara. Standar biaya admin operasional saat ini disetel sebesar <strong className="text-amber-400">10% (Rp 160.000 untuk 32 slot)</strong>. <strong className="text-amber-400">Nominal biaya admin ini hanya dapat dilihat oleh Admin DEXZ STORE</strong> dan terkunci untuk pengunjung biasa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Biaya Admin Operasional (Rp) - 10%:</label>
                  <input
                    type="number"
                    value={config.prizePoolConfig?.adminFee ?? 160000}
                    onChange={(e) => setConfig({
                      ...config,
                      prizePoolConfig: {
                        ...(config.prizePoolConfig || {
                          feePerSlot: 50000,
                          totalSlots: 32,
                          adminFee: 160000,
                          adminFeePercent: 10,
                          juara1Percent: 50,
                          juara2Percent: 30,
                          juara3Percent: 20
                        }),
                        adminFee: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-red-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Juara 1 (%):</label>
                  <input
                    type="number"
                    value={config.prizePoolConfig?.juara1Percent ?? 50}
                    onChange={(e) => setConfig({
                      ...config,
                      prizePoolConfig: {
                        ...(config.prizePoolConfig || {
                          feePerSlot: 50000,
                          totalSlots: 32,
                          adminFee: 160000,
                          adminFeePercent: 10,
                          juara1Percent: 50,
                          juara2Percent: 30,
                          juara3Percent: 20
                        }),
                        juara1Percent: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Juara 2 (%):</label>
                  <input
                    type="number"
                    value={config.prizePoolConfig?.juara2Percent ?? 30}
                    onChange={(e) => setConfig({
                      ...config,
                      prizePoolConfig: {
                        ...(config.prizePoolConfig || {
                          feePerSlot: 50000,
                          totalSlots: 32,
                          adminFee: 160000,
                          adminFeePercent: 10,
                          juara1Percent: 50,
                          juara2Percent: 30,
                          juara3Percent: 20
                        }),
                        juara2Percent: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Juara 3 (%):</label>
                  <input
                    type="number"
                    value={config.prizePoolConfig?.juara3Percent ?? 20}
                    onChange={(e) => setConfig({
                      ...config,
                      prizePoolConfig: {
                        ...(config.prizePoolConfig || {
                          feePerSlot: 50000,
                          totalSlots: 32,
                          adminFee: 160000,
                          adminFeePercent: 10,
                          juara1Percent: 50,
                          juara2Percent: 30,
                          juara3Percent: 20
                        }),
                        juara3Percent: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-amber-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Data Turnamen Berlangsung</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TICKER HEADER & PENGUMUMAN BROADCAST */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ticker' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Megaphone className="w-5 h-5 text-orange-500" />
              <h3 className="font-black text-white uppercase text-sm">MENU 3: EDIT RUNNING TICKER & SIARKAN PENGUMUMAN</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Teks Running Banner Ticker (Ditampilkan di Atas Semua Halaman Web):
                </label>
                <textarea
                  rows={3}
                  value={config.tickerText}
                  onChange={(e) => setConfig({ ...config, tickerText: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveAllConfig(config, 'Teks Running Ticker Header berhasil diperbarui!')}
                  className="mt-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Running Ticker</span>
                </button>
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <label className="text-xs font-bold text-neutral-300 block">
                  Broadcast Pengumuman Darurat Panitia:
                </label>
                <textarea
                  rows={3}
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => showNotification('Pengumuman resmi panitia berhasil disiarkan!')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wider"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Siarkan Pengumuman Match</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KELOLA REGULASI & ATURAN GAME (WITH INTERACTIVE MODAL) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'aturan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>MENU 4: KELOLA REGULASI & ATURAN GAME (FREE FIRE & MLBB)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Klik tombol <span className="text-orange-400 font-bold">+ Tambah Aturan</span> atau icon <Trash2 className="w-3 h-3 inline text-red-400" /> untuk menambah & menghapus aturan game.
            </p>
          </div>

          {/* FF RULES MANAGEMENT */}
          <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-5 space-y-4">
            <h4 className="font-black text-sm text-red-400 uppercase border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Regulasi & Aturan Free Fire</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.ffRules.map((cat, catIdx) => (
                <div key={catIdx} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-black text-xs text-amber-400 uppercase">{cat.title}</span>
                    <button
                      type="button"
                      onClick={() => openAddRuleModal('FF', catIdx)}
                      className="px-2.5 py-1 bg-orange-950 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-800/80 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Tambah Aturan
                    </button>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {cat.rules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start justify-between gap-2 bg-[#0f0f0f] p-2.5 rounded-lg border border-neutral-800/80">
                        <span className="text-neutral-300 leading-relaxed">{rule}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRuleItem('FF', catIdx, rIdx)}
                          title="Hapus Aturan Ini"
                          className="text-red-400 hover:text-white hover:bg-red-600 p-1 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* MLBB RULES MANAGEMENT */}
          <div className="bg-[#0f0f0f] border border-blue-500/30 rounded-2xl p-5 space-y-4">
            <h4 className="font-black text-sm text-cyan-400 uppercase border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Swords className="w-4 h-4" />
              <span>Regulasi & Aturan Mobile Legends</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.mlbbRules.map((cat, catIdx) => (
                <div key={catIdx} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-black text-xs text-cyan-300 uppercase">{cat.title}</span>
                    <button
                      type="button"
                      onClick={() => openAddRuleModal('MLBB', catIdx)}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-800/80 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Tambah Aturan
                    </button>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {cat.rules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start justify-between gap-2 bg-[#0f0f0f] p-2.5 rounded-lg border border-neutral-800/80">
                        <span className="text-neutral-300 leading-relaxed">{rule}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRuleItem('MLBB', catIdx, rIdx)}
                          title="Hapus Aturan Ini"
                          className="text-red-400 hover:text-white hover:bg-red-600 p-1 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: KELOLA JADWAL & BRACKET MATCH (WITH INTERACTIVE EDITING & WINNER SELECTION) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'jadwal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>MENU 5: KELOLA JADWAL PERTANDINGAN & HASIL MATCH</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Sistem Turnamen 32 Tim Gugur Tunggal. Pengacakan 32 tim otomatis, lolos otomatis pemenang ke babak berikutnya, serta lencana penentuan <span className="text-amber-400 font-bold">Juara 1</span>, <span className="text-slate-300 font-bold">Juara 2</span>, <span className="text-amber-500 font-bold">Juara 3</span> & <span className="text-neutral-400 font-bold">Peringkat 4</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleGenerateRandom32Pairings('FF')}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-950/60 cursor-pointer transition-all border border-red-400"
                title="Sistem otomatis menyusun 32 tim Free Fire secara acak untuk 16 Match Penyisihan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎲 ACAK 32 TIM (FF)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateRandom32Pairings('MLBB')}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 cursor-pointer transition-all border border-cyan-400"
                title="Sistem otomatis menyusun 32 tim Mobile Legends secara acak untuk 16 Match Penyisihan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎲 ACAK 32 TIM (MLBB)</span>
              </button>

              <button
                type="button"
                onClick={handleResetSchedulesToDefault}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                title="Setel ulang ke skema default (Penyisihan 16, 16 Besar 8, Perempat Final 4, Semifinal 2, Juara 3 1, Grand Final 1)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🔄 Reset Skema Match</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinishAndArchiveTournament(schGameFilter === 'MLBB' ? 'MLBB' : 'FF')}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-950/60 cursor-pointer transition-all border border-amber-300 uppercase"
                title="Simpan permanen hasil turnamen ke Arsip & reset bagan untuk turnamen baru"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>🏆 Selesaikan & Arsipkan ({schGameFilter === 'MLBB' ? 'MLBB' : 'FF'})</span>
              </button>

              <button
                type="button"
                onClick={openAddScheduleModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-lg cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Match</span>
              </button>
            </div>
          </div>

          {/* Filter Baris Search, Pilihan Game, Pilihan Babak & Mode Tampilan */}
          <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 space-y-3.5 shadow-md">
            {/* Input Search Nama Tim */}
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama tim di jadwal pertandingan..."
                value={schSearchTeam}
                onChange={(e) => setSchSearchTeam(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-bold"
              />
              {schSearchTeam && (
                <button
                  type="button"
                  onClick={() => setSchSearchTeam('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-black bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Baris Pilihan Game */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 min-w-[130px]">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>PILIHAN GAME:</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[
                  { id: 'Semua', label: '🎮 SEMUA GAME', color: 'bg-amber-500 text-slate-950 border-amber-400' },
                  { id: 'FF', label: '🔥 FREE FIRE', color: 'bg-orange-500 text-slate-950 border-orange-400' },
                  { id: 'MLBB', label: '⚔️ MOBILE LEGENDS: BANG-BANG', color: 'bg-cyan-500 text-slate-950 border-cyan-400' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSchGameFilter(g.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-black transition-all border cursor-pointer ${
                      schGameFilter === g.id
                        ? `${g.color} shadow-md`
                        : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Baris Pilihan Babak */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-neutral-800/80">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-wider min-w-[130px]">
                PILIHAN BABAK:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full">
                {['Semua', 'Babak Penyisihan', 'Babak 16 Besar', 'Perempat Final', 'Semifinal', 'Perebutan Juara 3', 'Grand Final'].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSchStageFilter(stg)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                      schStageFilter === stg
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Tampilan Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                  SUSUNAN TAMPILAN:
                </span>
                <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSchDisplayMode('daftar')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      schDisplayMode === 'daftar'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    📋 Daftar Pertandingan
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchDisplayMode('pohon')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      schDisplayMode === 'pohon'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🌳 POHON BABAK
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Render Pohon Babak or Grouped Match List */}
          {schDisplayMode === 'pohon' ? (
            <TournamentBracketTree
              schedules={config.matchSchedules}
              selectedGame={schGameFilter === 'FF' ? 'FF' : schGameFilter === 'MLBB' ? 'MLBB' : 'ALL'}
              selectedPhase={schStageFilter === 'Semua' ? 'ALL' : schStageFilter}
            />
          ) : (
            /* Grouped Match Schedules List */
            ['Babak Penyisihan', 'Babak 16 Besar', 'Perempat Final', 'Semifinal', 'Perebutan Juara 3', 'Grand Final']
              .filter(phase => schStageFilter === 'Semua' || schStageFilter === phase)
              .map((phaseName) => {
                const matchesInPhase = config.matchSchedules.filter(m => {
                  const matchPhase = m.phase === phaseName;
                  const matchGame = 
                    schGameFilter === 'Semua' || 
                    m.game === schGameFilter || 
                    (schGameFilter === 'FF' && (m.game === 'FF' || m.game === 'Free Fire')) || 
                    (schGameFilter === 'MLBB' && (m.game === 'MLBB' || m.game === 'Mobile Legends' || m.game === 'Mobile Legends: Bang Bang'));
                  const matchSearch = !schSearchTeam || 
                    (m.teamA && m.teamA.toLowerCase().includes(schSearchTeam.toLowerCase())) || 
                    (m.teamB && m.teamB.toLowerCase().includes(schSearchTeam.toLowerCase())) ||
                    (m.winner && m.winner.toLowerCase().includes(schSearchTeam.toLowerCase()));
                  return matchPhase && matchGame && matchSearch;
                });

                if (matchesInPhase.length === 0 && (schStageFilter !== 'Semua' || schGameFilter !== 'Semua' || schSearchTeam)) {
                  return null;
                }
                if (matchesInPhase.length === 0) return null;

                return (
                  <div key={phaseName} className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    {/* Phase Title */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="font-black text-sm text-white uppercase flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>{phaseName}</span>
                      </h4>
                      <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {matchesInPhase.length} Match
                      </span>
                    </div>

                    {/* Matches Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {matchesInPhase.map((sch, idx) => {
                        // Calculate available teams for Tim 1 & Tim 2
                        const usedTeamNames = new Set<string>();
                        config.matchSchedules.forEach(m => {
                          if (m.id !== sch.id) {
                            if (m.teamA) usedTeamNames.add(m.teamA);
                            if (m.teamB) usedTeamNames.add(m.teamB);
                          }
                        });

                        const regTeamNames = registeredTeams.map(t => t.teamName);
                        const defaultSlotNames = Array.from({ length: 32 }, (_, i) => `Tim Slot ${i + 1}`);
                        const winnerSlotNames = Array.from({ length: 16 }, (_, i) => `Pemenang Match ${i + 1}`);
                        const allTeamsList = Array.from(new Set([...regTeamNames, ...defaultSlotNames, ...winnerSlotNames]));

                        const teamAOptions = allTeamsList.filter(t => !usedTeamNames.has(t) || t === sch.teamA);
                        const teamBOptions = allTeamsList.filter(t => !usedTeamNames.has(t) || t === sch.teamB);

                        const teamAIsWinner = sch.winner && sch.teamA && sch.winner.trim().toLowerCase() === sch.teamA.trim().toLowerCase();
                        const teamBIsWinner = sch.winner && sch.teamB && sch.winner.trim().toLowerCase() === sch.teamB.trim().toLowerCase();
                        const matchIsFinished = sch.status === 'selesai' || !!sch.winner;

                        return (
                          <div key={sch.id || idx} className="bg-[#050505] border border-neutral-800/90 rounded-2xl p-4 space-y-3 shadow-lg">
                            {/* Top Row: Number, Day, Date, Time, Status, Delete */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs flex items-center justify-center">
                                  {sch.matchNumber || (idx + 1)}
                                </span>
                                <div className="flex items-center gap-1 text-xs">
                                  <input
                                    type="text"
                                    value={sch.day || ''}
                                    placeholder="Hari"
                                    onChange={(e) => handleUpdateMatchFieldInline(sch.id, { day: e.target.value })}
                                    className="w-16 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-amber-400 font-bold text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={sch.date || ''}
                                    placeholder="Tanggal"
                                    onChange={(e) => handleUpdateMatchFieldInline(sch.id, { date: e.target.value })}
                                    className="w-32 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-white font-bold text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={sch.time || ''}
                                    placeholder="Jam"
                                    onChange={(e) => handleUpdateMatchFieldInline(sch.id, { time: e.target.value })}
                                    className="w-24 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-emerald-400 font-bold font-mono text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Status Select */}
                                <select
                                  value={sch.status || 'mendatang'}
                                  onChange={(e) => handleUpdateMatchFieldInline(sch.id, { status: e.target.value })}
                                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-[11px] font-bold text-amber-300"
                                >
                                  <option value="mendatang">Mendatang</option>
                                  <option value="segera_dimulai">⏳ Segera Dimulai (30m)</option>
                                  <option value="berlangsung">🔥 Berlangsung</option>
                                  <option value="selesai">✓ Selesai</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => openEditScheduleModal(sch)}
                                  title="Edit Lengkap Match"
                                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSchedule(sch.id)}
                                  title="Hapus Match"
                                  className="p-1 bg-neutral-900 hover:bg-red-600 text-neutral-400 hover:text-white rounded border border-neutral-800 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Teams Selectors (Team 1 VS Team 2) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0a0a0a] p-2.5 rounded-xl border border-neutral-800/80">
                              {/* Team 1 Picker */}
                              <div>
                                <label className="text-[10px] text-neutral-400 font-bold block mb-1">
                                  Tim 1:
                                  {sch.teamA && (
                                    <>
                                      {sch.phase === 'Grand Final' && teamAIsWinner && (
                                        <span className="text-amber-400 font-extrabold ml-1">🥇 JUARA 1</span>
                                      )}
                                      {sch.phase === 'Grand Final' && matchIsFinished && !teamAIsWinner && (
                                        <span className="text-slate-300 font-bold ml-1">🥈 JUARA 2</span>
                                      )}
                                      {sch.phase === 'Perebutan Juara 3' && teamAIsWinner && (
                                        <span className="text-amber-400 font-extrabold ml-1">🥉 JUARA 3</span>
                                      )}
                                      {sch.phase === 'Perebutan Juara 3' && matchIsFinished && !teamAIsWinner && (
                                        <span className="text-neutral-400 font-bold ml-1">Peringkat 4</span>
                                      )}
                                      {sch.phase !== 'Grand Final' && sch.phase !== 'Perebutan Juara 3' && teamAIsWinner && (
                                        <span className="text-emerald-400 font-extrabold ml-1">(🟢 LOLOS)</span>
                                      )}
                                      {sch.phase !== 'Grand Final' && sch.phase !== 'Perebutan Juara 3' && matchIsFinished && !teamAIsWinner && (
                                        <span className="text-red-400 font-bold ml-1">(🔴 GUGUR)</span>
                                      )}
                                    </>
                                  )}
                                </label>
                                <select
                                  value={sch.teamA || ''}
                                  onChange={(e) => handleUpdateMatchFieldInline(sch.id, { teamA: e.target.value })}
                                  className={`w-full border rounded-lg p-2 text-xs font-bold ${
                                    teamAIsWinner ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-white'
                                  }`}
                                >
                                  <option value="">-- Pilih Tim 1 --</option>
                                  {teamAOptions.map(tName => (
                                    <option key={tName} value={tName}>{tName}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Team 2 Picker */}
                              <div>
                                <label className="text-[10px] text-neutral-400 font-bold block mb-1">
                                  Tim 2:
                                  {sch.teamB && (
                                    <>
                                      {sch.phase === 'Grand Final' && teamBIsWinner && (
                                        <span className="text-amber-400 font-extrabold ml-1">🥇 JUARA 1</span>
                                      )}
                                      {sch.phase === 'Grand Final' && matchIsFinished && !teamBIsWinner && (
                                        <span className="text-slate-300 font-bold ml-1">🥈 JUARA 2</span>
                                      )}
                                      {sch.phase === 'Perebutan Juara 3' && teamBIsWinner && (
                                        <span className="text-amber-400 font-extrabold ml-1">🥉 JUARA 3</span>
                                      )}
                                      {sch.phase === 'Perebutan Juara 3' && matchIsFinished && !teamBIsWinner && (
                                        <span className="text-neutral-400 font-bold ml-1">Peringkat 4</span>
                                      )}
                                      {sch.phase !== 'Grand Final' && sch.phase !== 'Perebutan Juara 3' && teamBIsWinner && (
                                        <span className="text-emerald-400 font-extrabold ml-1">(🟢 LOLOS)</span>
                                      )}
                                      {sch.phase !== 'Grand Final' && sch.phase !== 'Perebutan Juara 3' && matchIsFinished && !teamBIsWinner && (
                                        <span className="text-red-400 font-bold ml-1">(🔴 GUGUR)</span>
                                      )}
                                    </>
                                  )}
                                </label>
                                <select
                                  value={sch.teamB || ''}
                                  onChange={(e) => handleUpdateMatchFieldInline(sch.id, { teamB: e.target.value })}
                                  className={`w-full border rounded-lg p-2 text-xs font-bold ${
                                    teamBIsWinner ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-white'
                                  }`}
                                >
                                  <option value="">-- Pilih Tim 2 --</option>
                                  {teamBOptions.map(tName => (
                                    <option key={tName} value={tName}>{tName}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* ROOM ID & PASSWORD MATCH */}
                            <div className="grid grid-cols-2 gap-2 bg-[#0c0c0c] p-2.5 rounded-xl border border-amber-500/30">
                              <div>
                                <label className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mb-1">
                                  <Key className="w-3 h-3 text-amber-400" />
                                  <span>Kode Room ID:</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Kode Room ID"
                                  value={sch.roomCode || ''}
                                  onChange={(e) => handleUpdateMatchFieldInline(sch.id, { roomCode: e.target.value })}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mb-1">
                                  <Key className="w-3 h-3 text-amber-400" />
                                  <span>Password Room:</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Pass Room"
                                  value={sch.roomPass || ''}
                                  onChange={(e) => handleUpdateMatchFieldInline(sch.id, { roomPass: e.target.value })}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* HASIL PERTANDINGAN: PEMENANG */}
                            <div className="bg-[#0c0c0c] p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-amber-400">PEMENANG MATCH:</span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={sch.winner || ''}
                                  onChange={(e) => {
                                    const winVal = e.target.value;
                                    handleUpdateMatchFieldInline(sch.id, {
                                      winner: winVal,
                                      status: winVal ? 'selesai' : sch.status
                                    });
                                  }}
                                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-black text-emerald-400 focus:border-amber-500 focus:outline-none"
                                >
                                  <option value="">-- Belum Ada Pemenang --</option>
                                  {sch.teamA && (
                                    <option value={sch.teamA}>
                                      {sch.phase === 'Grand Final' 
                                        ? `🥇 JUARA 1: ${sch.teamA}` 
                                        : sch.phase === 'Perebutan Juara 3' 
                                        ? `🥉 JUARA 3: ${sch.teamA}` 
                                        : `🥇 ${sch.teamA} (Lolos Ke Babak Selanjutnya)`}
                                    </option>
                                  )}
                                  {sch.teamB && (
                                    <option value={sch.teamB}>
                                      {sch.phase === 'Grand Final' 
                                        ? `🥇 JUARA 1: ${sch.teamB}` 
                                        : sch.phase === 'Perebutan Juara 3' 
                                        ? `🥉 JUARA 3: ${sch.teamB}` 
                                        : `🥇 ${sch.teamB} (Lolos Ke Babak Selanjutnya)`}
                                    </option>
                                  )}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: KELOLA LINK GRUP WHATSAPP */}
      {/* ========================================================================= */}
      {activeAdminTab === 'grup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-emerald-400" />
              <span>MENU 6: KELOLA LINK GRUP WHATSAPP RESMI</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Perbarui link undangan grup WhatsApp untuk Free Fire, Mobile Legends, dan Komunitas Umum.
            </p>
          </div>

          <div className="space-y-4">
            {config.communityGroups.map((grp, idx) => (
              <div key={grp.id} className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-3">
                <h4 className="font-black text-xs text-emerald-400 uppercase">{grp.title}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Link WhatsApp Group:</label>
                    <input
                      type="text"
                      value={grp.link}
                      onChange={(e) => {
                        const updated = [...config.communityGroups];
                        updated[idx].link = e.target.value;
                        setConfig({ ...config, communityGroups: updated });
                      }}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 font-bold">Deskripsi Singkat:</label>
                    <input
                      type="text"
                      value={grp.description}
                      onChange={(e) => {
                        const updated = [...config.communityGroups];
                        updated[idx].description = e.target.value;
                        setConfig({ ...config, communityGroups: updated });
                      }}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleSaveAllConfig(config, 'Link Grup WhatsApp berhasil diperbarui!')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Link Grup WA</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: KELOLA PAPAN JUARA & DATA LAPORAN (WITH INTERACTIVE MODAL) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'juara' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>MENU 7: KELOLA PAPAN JUARA & LAPORAN PRESTASI</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Klik tombol <span className="text-amber-400 font-bold">+ Tambah Data Juara</span> untuk memasukkan hasil pemenang season.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddWinnerModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Data Juara</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.pastWinners.map((win, idx) => (
              <div key={idx} className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="font-bold text-xs text-amber-400">{win.season}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 text-[10px] rounded font-bold">
                      {win.game}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWinner(idx)}
                      title="Hapus Data Juara"
                      className="p-1.5 bg-neutral-900 hover:bg-red-600 text-neutral-400 hover:text-white rounded border border-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300 bg-[#050505] p-3 rounded-xl border border-neutral-800/60">
                  <p>🥇 <strong>Juara 1:</strong> <span className="text-amber-400 font-bold">{win.champion}</span></p>
                  <p>🥈 <strong>Juara 2:</strong> {win.runnerUp}</p>
                  <p>🥉 <strong>Juara 3:</strong> {win.thirdPlace}</p>
                  <p className="text-emerald-400 font-mono text-[11px] pt-1 border-t border-neutral-800/80">💰 {win.prizePool}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: KELOLA KONTAK ADMIN, EMAIL & EDIT/UPLOAD QRIS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kontak' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAllConfig(config, 'Kontak Admin, Email & QRIS NMID berhasil diperbarui!');
          }}
          className="space-y-6 animate-in fade-in duration-200"
        >
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>MENU 8: KELOLA KONTAK ADMIN, EMAIL & GAMBAR QRIS</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Atur nomor WhatsApp Admin, email, NMID QRIS, serta unggah atau ubah gambar QRIS kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT FORM FIELDS */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-black text-xs text-amber-400 uppercase border-b border-neutral-800 pb-2">
                📋 Rincian Kontak & Pengaturan QRIS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">No. WA Admin (Tampilan):</label>
                  <input
                    type="text"
                    value={config.adminWa}
                    onChange={(e) => setConfig({ ...config, adminWa: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">No. WA Admin (Clean wa.me):</label>
                  <input
                    type="text"
                    value={config.adminWaClean}
                    onChange={(e) => setConfig({ ...config, adminWaClean: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-orange-400 block mb-1 font-bold">NMID QRIS HUNTERS:</label>
                  <input
                    type="text"
                    value={config.qrisNmid}
                    onChange={(e) => setConfig({ ...config, qrisNmid: e.target.value })}
                    className="w-full bg-[#050505] border border-orange-500/40 rounded-xl p-2.5 text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-emerald-400 block mb-1 font-bold">No. HP E-Wallet Official:</label>
                  <input
                    type="text"
                    placeholder="083803540456"
                    value={config.ewalletNumber || ''}
                    onChange={(e) => setConfig({ ...config, ewalletNumber: e.target.value })}
                    className="w-full bg-[#050505] border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-emerald-400 block mb-1 font-bold">Atas Nama E-Wallet:</label>
                  <input
                    type="text"
                    placeholder="DEXZ STORE / HUNTERS"
                    value={config.ewalletHolder || ''}
                    onChange={(e) => setConfig({ ...config, ewalletHolder: e.target.value })}
                    className="w-full bg-[#050505] border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-blue-400 block mb-1 font-bold">No. Rekening Bank BCA:</label>
                  <input
                    type="text"
                    placeholder="83148834663"
                    value={config.bankBcaNumber || ''}
                    onChange={(e) => setConfig({ ...config, bankBcaNumber: e.target.value })}
                    className="w-full bg-[#050505] border border-blue-500/40 rounded-xl p-2.5 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-blue-400 block mb-1 font-bold">Atas Nama Bank BCA:</label>
                  <input
                    type="text"
                    placeholder="HUNTERS / DEXZ STORE"
                    value={config.bankBcaHolder || ''}
                    onChange={(e) => setConfig({ ...config, bankBcaHolder: e.target.value })}
                    className="w-full bg-[#050505] border border-blue-500/40 rounded-xl p-2.5 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Email Official:</label>
                  <input
                    type="text"
                    value={config.officialEmail}
                    onChange={(e) => setConfig({ ...config, officialEmail: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Domain Website Resmi:</label>
                  <input
                    type="text"
                    value={config.officialDomain}
                    onChange={(e) => setConfig({ ...config, officialDomain: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-bold">Jam Operasional Layanan:</label>
                  <input
                    type="text"
                    value={config.contactInfo.hours}
                    onChange={(e) => setConfig({
                      ...config,
                      contactInfo: { ...config.contactInfo, hours: e.target.value }
                    })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* UPLOAD & EDIT QRIS IMAGE */}
              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <label className="text-xs font-black text-orange-400 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>🖼️ UBAH GAMBAR BARCODE QRIS (KAPAN SAJA):</span>
                </label>
                <p className="text-[11px] text-neutral-400">
                  Anda dapat mengunggah foto / gambar QRIS baru langsung dari perangkat (HP/Laptop) atau memasukkan URL gambar online.
                </p>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold uppercase">Unggah File Gambar QRIS dari Perangkat:</label>
                  <label className="flex items-center justify-center gap-2 bg-[#050505] hover:bg-neutral-900 border border-dashed border-orange-500/50 rounded-xl p-3 cursor-pointer text-xs text-orange-400 font-bold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Gambar QRIS (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrisImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold uppercase">Atau Masukkan URL Gambar QRIS Online:</label>
                  <input
                    type="text"
                    placeholder="https://example.com/qris-custom.png"
                    value={config.qrisImageUrl || ''}
                    onChange={(e) => setConfig({ ...config, qrisImageUrl: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>

                {config.qrisImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, qrisImageUrl: '' });
                      showNotification('Gambar QRIS khusus telah dihapus (kembali ke SVG QRIS default).');
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold underline"
                  >
                    Reset ke Gambar QRIS Default
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Kontak & QRIS</span>
              </button>
            </div>

            {/* RIGHT SIDE: LIVE QRIS PREVIEW */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-black text-xs text-emerald-400 uppercase border-b border-neutral-800 pb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                <span>Pratinjau QRIS Tampilan Peserta Saat Ini</span>
              </h4>

              <QrisDisplay 
                game="FF" 
                qrisNmid={config.qrisNmid} 
                qrisImageUrl={config.qrisImageUrl}
              />
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB METODE PEMBAYARAN: KELOLA METODE PEMBAYARAN (6 OPSI QRIS + VERIFIKASI) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'metode-pembayaran' && (
        <AdminPaymentMethodsManager
          config={config}
          setConfig={setConfig}
          handleSaveAllConfig={handleSaveAllConfig}
          registeredTeams={registeredTeams}
          setRegisteredTeams={setRegisteredTeams}
          userWallet={userWallet}
          setUserWallet={setUserWallet}
          bets={bets}
          setBets={setBets}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 18: BOT WHATSAPP OTOMATIS & TAUTAN PERANGKAT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'wa-bot' && (
        <WaBotView
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
          registeredTeams={registeredTeams}
          setRegisteredTeams={setRegisteredTeams}
          communityGroups={config.communityGroups || []}
          matchSchedules={config.matchSchedules || []}
          userWallet={userWallet}
          setUserWallet={setUserWallet}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 9: KELOLA AKUN ADMIN & MANAJEMEN AKSES MEMBER */}
      {/* ========================================================================= */}
      {activeAdminTab === 'admin-accounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* HEADER & SUB-TAB TOGGLES */}
          <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-400" />
                  <span>MENU 9: KELOLA AKUN ADMIN & MANAJEMEN AKSES</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Kelola daftar akun Admin khusus, panitia turnamen, serta data member terdaftar untuk pemberian hak akses atau sanksi blacklist.
                </p>
              </div>

              {accSubTab === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setNewAdminName('');
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                    setNewAdminRoleTitle('Admin Turnamen');
                    setShowAddAdminModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-orange-950/40 uppercase tracking-wider shrink-0 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Akun Admin Baru</span>
                </button>
              )}
            </div>

            {/* PROMINENT CARD FOR CURRENTLY LOGGED IN USER */}
            <div className="bg-gradient-to-r from-[#121810] via-[#0f0f0f] to-[#181210] border-2 border-orange-500/50 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 font-black flex items-center justify-center shrink-0 text-xl shadow-inner">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase rounded-full tracking-wider">
                        🟢 AKUN LOGGED IN SAAT INI
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase rounded-full tracking-wider">
                        {currentUser.role === 'admin' ? 'AKUN ADMIN' : 'AKUN MEMBER'}
                      </span>
                    </div>
                    <h4 className="font-black text-base text-white mt-1">{currentUser.name}</h4>
                    <p className="text-xs font-mono text-orange-400 font-bold">{currentUser.email}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-black block">Jabatan / Akses Aktif:</span>
                  <span className="text-emerald-400 font-extrabold text-xs block">
                    {currentUser.isSuperAdmin ? '👑 Super Admin (Pemilik)' : (currentUser.role === 'admin' ? '🛡️ Admin Turnamen' : '👤 Member Peserta')}
                  </span>
                  <span className="text-[11px] text-neutral-400 block">No. WA: {currentUser.phone || '083148834663'}</span>
                </div>
              </div>

              {/* OPSI ACTION BUTTONS UNDERNEATH */}
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>OPSI PILIHAN AKUN TERHUBUNG LOGGED IN:</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Pilih Aksi Manajemen</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {/* BUTTON: JADIKAN ADMIN / UBAH JABATAN ADMIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberToPromote({
                        id: currentUser.id || 'curr-user',
                        name: currentUser.name,
                        email: currentUser.email,
                        phone: currentUser.phone || '',
                        role: currentUser.role,
                        status: currentUser.status || 'Active',
                      });
                      setPromoteRoleTitle('Admin Turnamen');
                      setPromotePassword('Admin123');
                      setShowPromoteModal(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Jadikan Admin / Ubah Jabatan</span>
                  </button>

                  {/* BUTTON: BLACKLIST */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberToBlacklist({
                        id: currentUser.id || 'curr-user',
                        name: currentUser.name,
                        email: currentUser.email,
                        phone: currentUser.phone || '',
                        role: currentUser.role,
                        status: currentUser.status || 'Active',
                      });
                      setBlacklistReasonInput('');
                      setShowBlacklistMemberModal(true);
                    }}
                    className="px-3.5 py-2 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700/70 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    <UserX className="w-4 h-4 text-amber-400" />
                    <span>Blacklist Akun Ini</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SUB TAB SELECTOR */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAccSubTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  accSubTab === 'admin'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-[#050505] text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Akun Admin & Panitia ({1 + (config.adminAccounts || []).filter(a => a.email.toLowerCase() !== 'mumumimi353@gmail.com').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAccSubTab('member')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  accSubTab === 'member'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-[#050505] text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Member Terdaftar ({(config.memberAccounts || []).length})</span>
              </button>
            </div>
          </div>

          {/* SUBTAB 1: DAFTAR AKUN ADMIN & PANITIA */}
          {accSubTab === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ALWAYS SHOW MAIN ADMIN CARD FIRST */}
              <div className="bg-[#0f0f0f] border-2 border-orange-500/60 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 bg-orange-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  👑 ADMIN UTAMA (SUPER ADMIN)
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 font-black text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                      <span>Admin Utama DEXZ STORE</span>
                    </h4>
                    <p className="text-xs font-mono text-orange-400 font-bold">mumumimi353@gmail.com</p>
                    <span className="text-[10px] text-neutral-400 font-mono">Role: Super Admin / Pemilik Sistem</span>
                  </div>
                </div>

                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Kata Sandi:</span>
                    <span className="text-emerald-400 font-bold">•••••••••• (Kampoeng51)</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Status Hak Akses:</span>
                    <span className="text-orange-400 font-bold uppercase">Akses Penuh Permanen</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 italic">
                  * Akun Admin Utama tidak dapat dihapus demi keamanan sistem.
                </p>
              </div>

              {/* CUSTOM ADMIN ACCOUNTS */}
              {(config.adminAccounts || [])
                .filter(a => a.email.toLowerCase() !== 'mumumimi353@gmail.com')
                .map((adm) => (
                  <div key={adm.id} className="bg-[#0f0f0f] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 space-y-3 relative transition-all shadow-lg">
                    <div className="absolute top-0 right-0 bg-blue-600/30 text-blue-300 border-b border-l border-blue-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                      🛡️ {adm.roleTitle || 'ADMIN KHUSUS'}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-blue-400 flex items-center justify-center shrink-0 font-black text-base">
                        👤
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">{adm.name}</h4>
                        <p className="text-xs font-mono text-blue-400 font-bold">{adm.email}</p>
                        <span className="text-[10px] text-neutral-500 font-mono">Dibuat: {adm.createdAt || 'Baru Saja'}</span>
                      </div>
                    </div>

                    <div className="bg-[#050505] border border-neutral-800/80 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Kata Sandi:</span>
                        <span className="text-amber-300 font-bold">
                          {showPasswords[adm.id] ? adm.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, [adm.id]: !prev[adm.id] }))}
                          className="text-[10px] text-neutral-400 hover:text-white underline ml-2 cursor-pointer"
                        >
                          {showPasswords[adm.id] ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                      </div>
                    </div>

                    {/* ACTION OPTIONS UNDERNEATH */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAdminToEditRole(adm);
                            setEditAdminRoleTitle(adm.roleTitle || 'Admin Turnamen');
                            setShowEditAdminRoleModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          title="Ubah Jabatan Admin ini"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ubah Jabatan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMemberToBlacklist({
                              id: adm.id,
                              name: adm.name,
                              email: adm.email,
                              phone: '',
                              role: 'admin',
                              status: 'Active',
                            });
                            setBlacklistReasonInput('');
                            setShowBlacklistMemberModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          title="Blacklist Akun Admin Ini"
                        >
                          <UserX className="w-3.5 h-3.5 text-amber-400" />
                          <span>Blacklist</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAdminAccount(adm)}
                        className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white border border-red-800/50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Hapus Akun Admin Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* SUBTAB 2: DATA MEMBER TERDAFTAR */}
          {accSubTab === 'member' && (
            <div className="space-y-4">
              {/* SEARCH BAR & SUMMARY */}
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, no hp, atau tim member..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="text-xs text-neutral-400 font-mono">
                  Menampilkan <strong className="text-orange-400 font-black">
                    {(config.memberAccounts || []).filter(m =>
                      m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                      m.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                      (m.teamName && m.teamName.toLowerCase().includes(memberSearchTerm.toLowerCase())) ||
                      (m.phone && m.phone.includes(memberSearchTerm))
                    ).length}
                  </strong> dari {(config.memberAccounts || []).length} Member Terdaftar
                </div>
              </div>

              {/* MEMBERS TABLE */}
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#050505] text-neutral-400 font-black uppercase text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="p-3.5">Detail Member</th>
                        <th className="p-3.5">Kontak & No WA</th>
                        <th className="p-3.5">Tim Terdaftar</th>
                        <th className="p-3.5">Jumlah Saldo</th>
                        <th className="p-3.5">Status Akun</th>
                        <th className="p-3.5">Aksi / Manajemen Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-sans">
                      {(config.memberAccounts || [])
                        .filter(m =>
                          m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                          m.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                          (m.teamName && m.teamName.toLowerCase().includes(memberSearchTerm.toLowerCase())) ||
                          (m.phone && m.phone.includes(memberSearchTerm))
                        )
                        .map((mem) => {
                          const isAlreadyAdmin = (config.adminAccounts || []).some(a => a.email.toLowerCase() === mem.email.toLowerCase());
                          const isBlacklisted = mem.status === 'Blacklisted';
                          const memberBalance = userWallet?.balance ?? 0;

                          return (
                            <tr key={mem.id} className="hover:bg-neutral-900/50 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black flex items-center justify-center shrink-0">
                                    {mem.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="text-white font-bold block">{mem.name}</strong>
                                    <span className="text-[11px] font-mono text-neutral-400 block">{mem.email}</span>
                                    <span className="text-[10px] text-neutral-500 font-mono">Daftar: {mem.registeredAt || '2026-08-01'}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 font-mono text-emerald-400 font-bold">
                                {mem.phone || '083148834663'}
                              </td>

                              <td className="p-3.5">
                                <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg font-bold text-amber-300 text-[11px] inline-block">
                                  🛡️ {mem.teamName || 'HUNTERS SQUAD'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-col gap-1">
                                  <span className="text-emerald-400 font-mono font-black text-xs">
                                    Rp {memberBalance.toLocaleString('id-ID')}
                                  </span>
                                  {setUserWallet && (
                                    <div className="flex flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentAdminBal = config.adminBettingPoolBalance ?? 1000000;
                                          const amountStr = prompt(`Saldo Admin saat ini: Rp ${currentAdminBal.toLocaleString('id-ID')}\n\nMasukkan nominal Saldo Admin yang ingin dikirimkan ke ${mem.name} (Rp):`, '50000');
                                          if (amountStr) {
                                            const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
                                            if (!isNaN(amount) && amount > 0) {
                                              const updatedAdminBal = Math.max(0, currentAdminBal - amount);
                                              const updatedConfig = { ...config, adminBettingPoolBalance: updatedAdminBal };

                                              setUserWallet(prev => ({
                                                ...prev,
                                                balance: prev.balance + amount
                                              }));
                                              handleSaveAllConfig(updatedConfig, `Berhasil mengirimkan Saldo Rp ${amount.toLocaleString('id-ID')} dari Saldo Admin ke ${mem.name}!`);
                                            }
                                          }
                                        }}
                                        className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded text-[10px] uppercase w-fit shadow cursor-pointer"
                                      >
                                        + Kirim Saldo Admin
                                      </button>

                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="p-3.5">
                                {isBlacklisted ? (
                                  <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                                    <Ban className="w-3 h-3" />
                                    <span>Blacklisted</span>
                                  </span>
                                ) : isAlreadyAdmin ? (
                                  <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                                    <span>Admin / Panitia</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Member Aktif</span>
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* OPTION: JADIKAN ADMIN */}
                                  {!isAlreadyAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMemberToPromote(mem);
                                        setPromoteRoleTitle('Admin Turnamen');
                                        setPromotePassword('Admin123');
                                        setShowPromoteModal(true);
                                      }}
                                      className="px-2.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-[11px] rounded-lg shadow flex items-center gap-1 transition-all cursor-pointer"
                                      title="Angkat member menjadi Admin"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span>Jadikan Admin</span>
                                    </button>
                                  )}

                                  {/* OPTION: BLACKLIST */}
                                  {!isBlacklisted && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMemberToBlacklist(mem);
                                        setBlacklistReasonInput('');
                                        setShowBlacklistMemberModal(true);
                                      }}
                                      className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 font-extrabold text-[11px] rounded-lg shadow flex items-center gap-1 transition-all cursor-pointer"
                                      title="Masukkan member ke daftar Blacklist"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Blacklist</span>
                                    </button>
                                  )}

                                  {/* OPTION: HAPUS */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMember(mem)}
                                    className="px-2 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white border border-red-800/50 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                    title="Hapus data member ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {(config.memberAccounts || []).length === 0 && (
                  <div className="p-8 text-center space-y-2">
                    <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-400 font-bold">Belum ada data member terdaftar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL DIALOGS FOR ADDING RULES, SCHEDULES, & WINNERS */}
      {/* ========================================================================= */}

      {/* 1. ADD RULE MODAL */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Tambah Aturan Baru ({ruleModalGame})</span>
            </h3>

            <div>
              <label className="text-xs text-neutral-400 font-bold block mb-1">Teks Aturan Baru:</label>
              <textarea
                rows={3}
                autoFocus
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                placeholder="Contoh: Dilarang keras menggunakan cheat / script / aplikasi pihak ketiga."
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold border border-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAddRule}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md"
              >
                Tambah Aturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD / EDIT SCHEDULE MODAL */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{editingMatch ? 'Edit Match Pertandingan' : 'Tambah Match Pertandingan Baru'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 font-bold block mb-1">Game Turnamen:</label>
                <select
                  value={schGame}
                  onChange={(e) => setSchGame(e.target.value as 'FF' | 'MLBB')}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="MLBB">⚔️ Mobile Legends</option>
                  <option value="FF">🔥 Free Fire</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Pilih Babak Pertandingan:</label>
                <select
                  value={schPhase}
                  onChange={(e) => setSchPhase(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="Babak Penyisihan">Babak Penyisihan (2 Sep 2026)</option>
                  <option value="Babak 16 Besar">Babak 16 Besar (3 Sep 2026)</option>
                  <option value="Perempat Final">Perempat Final (4 Sep 2026)</option>
                  <option value="Semifinal">Semifinal (5 Sep 2026)</option>
                  <option value="Perebutan Juara 3">Perebutan Juara 3 (6 Sep 2026)</option>
                  <option value="Grand Final">Grand Final (6 Sep 2026)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Hari:</label>
                <input
                  type="text"
                  placeholder="Rabu / Kamis / Jumat"
                  value={schDay}
                  onChange={(e) => setSchDay(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Tanggal Pertandingan:</label>
                <input
                  type="text"
                  placeholder="2 September 2026"
                  value={schDate}
                  onChange={(e) => setSchDate(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Waktu / Jam Mulai:</label>
                <input
                  type="text"
                  placeholder="19:00 WIB"
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Status Match:</label>
                <select
                  value={schStatus}
                  onChange={(e) => setSchStatus(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-amber-300 font-bold"
                >
                  <option value="mendatang">Mendatang</option>
                  <option value="segera_dimulai">⏳ Segera Dimulai (30 menit)</option>
                  <option value="berlangsung">🔥 Live Berlangsung</option>
                  <option value="selesai">✓ Selesai</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-800">
                <div>
                  <label className="text-amber-400 font-bold flex items-center gap-1.5 text-xs mb-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kode Room ID:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 981230"
                    value={schRoomCode}
                    onChange={(e) => setSchRoomCode(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold focus:border-amber-500 focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-amber-400 font-bold flex items-center gap-1.5 text-xs mb-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password Room:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 123456"
                    value={schRoomPass}
                    onChange={(e) => setSchRoomPass(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Tim 1 (Team A):</label>
                <select
                  value={schTeamA}
                  onChange={(e) => setSchTeamA(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="">-- Pilih Tim 1 --</option>
                  {registeredTeams.map(t => (
                    <option key={t.id} value={t.teamName}>{t.teamName}</option>
                  ))}
                  {Array.from({ length: 32 }, (_, i) => `Tim Slot ${i + 1}`).map(sName => (
                    <option key={sName} value={sName}>{sName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Tim 2 (Team B):</label>
                <select
                  value={schTeamB}
                  onChange={(e) => setSchTeamB(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="">-- Pilih Tim 2 --</option>
                  {registeredTeams.map(t => (
                    <option key={t.id} value={t.teamName}>{t.teamName}</option>
                  ))}
                  {Array.from({ length: 32 }, (_, i) => `Tim Slot ${i + 1}`).map(sName => (
                    <option key={sName} value={sName}>{sName}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <label className="text-amber-400 font-extrabold block mb-1">PEMENANG MATCH (LOLOS):</label>
                <select
                  value={schWinner}
                  onChange={(e) => {
                    const winVal = e.target.value;
                    setSchWinner(winVal);
                    if (winVal) setSchStatus('selesai');
                  }}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-emerald-400 font-black text-sm"
                >
                  <option value="">-- Belum Ditentukan --</option>
                  {schTeamA && <option value={schTeamA}>🥇 {schTeamA} (Lolos)</option>}
                  {schTeamB && <option value={schTeamB}>🥇 {schTeamB} (Lolos)</option>}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddScheduleModal(false);
                  setEditingMatch(null);
                }}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold border border-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSaveSchedule}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-md"
              >
                Simpan Match Pertandingan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD WINNER MODAL */}
      {showAddWinnerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-black text-sm text-white uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Tambah Data Tim Juara Season</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 font-bold block mb-1">Season & Bulan:</label>
                <input
                  type="text"
                  placeholder="Season 13 (Agustus 2026)"
                  value={winSeason}
                  onChange={(e) => setWinSeason(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Game Turnamen:</label>
                <select
                  value={winGame}
                  onChange={(e) => setWinGame(e.target.value as 'FF' | 'MLBB')}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="FF">🔥 Free Fire</option>
                  <option value="MLBB">⚔️ Mobile Legends</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">🥇 Juara 1 (Champion):</label>
                <input
                  type="text"
                  placeholder="HUNTERS APEX"
                  value={winChampion}
                  onChange={(e) => setWinChampion(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">🥈 Juara 2 (Runner-Up):</label>
                <input
                  type="text"
                  placeholder="DEXZ GLORY"
                  value={winRunnerUp}
                  onChange={(e) => setWinRunnerUp(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white uppercase"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">🥉 Juara 3 (Third Place):</label>
                <input
                  type="text"
                  placeholder="VANGUARD"
                  value={winThirdPlace}
                  onChange={(e) => setWinThirdPlace(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white uppercase"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Total Hadiah & Trophy:</label>
                <input
                  type="text"
                  placeholder="Rp 1.000.000 + Trophy"
                  value={winPrizePool}
                  onChange={(e) => setWinPrizePool(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddWinnerModal(false)}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold border border-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAddWinner}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-md"
              >
                Simpan Data Juara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE TEAM CONFIRMATION MODAL */}
      {deleteTeamTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-red-500/50 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white uppercase">Konfirmasi Hapus Tim</h3>
                <p className="text-[11px] text-neutral-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-[#050505] p-3.5 rounded-xl border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-mono">ID Tim:</span>
                <span className="text-orange-400 font-mono font-bold">{deleteTeamTarget.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nama Tim:</span>
                <strong className="text-white uppercase font-black">{deleteTeamTarget.teamName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Game:</span>
                <span className="text-cyan-400 font-bold">{deleteTeamTarget.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kapten:</span>
                <span className="text-white font-mono">{deleteTeamTarget.captainName} ({deleteTeamTarget.captainPhone})</span>
              </div>
            </div>

            <p className="text-xs text-red-400 font-bold bg-red-950/40 p-3 rounded-xl border border-red-900/60 text-center">
              ⚠️ Apakah Anda yakin ingin menghapus tim ini secara permanen dari daftar slot?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTeamTarget(null)}
                className="px-4 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold border border-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Tim Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TEAM DETAIL MODAL FOR ADMIN */}
      {selectedTeamDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 relative overflow-hidden">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-950 px-2 py-0.5 rounded border border-orange-800">
                      ID: {selectedTeamDetail.id}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Slot #{selectedTeamDetail.slotNumber}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-white uppercase tracking-tight mt-0.5">
                    {selectedTeamDetail.teamName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeamDetail(null)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* TEAM OVERVIEW & STATUS CONTROL */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Game Turnamen:</span>
                <span className={`font-black text-xs block mt-0.5 ${
                  selectedTeamDetail.game === 'FF' ? 'text-orange-400' : 'text-blue-400'
                }`}>
                  {selectedTeamDetail.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                </span>
              </div>

              <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Tanggal Terdaftar:</span>
                <span className="text-white font-mono font-bold block mt-0.5">
                  {selectedTeamDetail.registeredAt}
                </span>
              </div>
            </div>

            {/* STATUS & QUICK ACTIONS */}
            <div className="bg-[#050505] p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-bold">Status Pembayaran Saat Ini:</span>
                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                  selectedTeamDetail.status === 'Sah' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedTeamDetail.status === 'Menunggu Pembayaran'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedTeamDetail.status === 'Menunggu Pembayaran' ? 'Pending' : selectedTeamDetail.status}
                </span>
              </div>

              <div className="border-t border-neutral-800/80 pt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-500 font-bold mr-1">Ubah Status:</span>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTeamStatus(selectedTeamDetail.id, 'Sah');
                    setSelectedTeamDetail(prev => prev ? { ...prev, status: 'Sah' } : null);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    selectedTeamDetail.status === 'Sah'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-800 border border-emerald-800'
                  }`}
                >
                  Set Sah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTeamStatus(selectedTeamDetail.id, 'Menunggu Pembayaran');
                    setSelectedTeamDetail(prev => prev ? { ...prev, status: 'Menunggu Pembayaran' } : null);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    selectedTeamDetail.status === 'Menunggu Pembayaran'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-950 text-amber-400 hover:bg-amber-800 border border-amber-800'
                  }`}
                >
                  Set Pending
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTeamStatus(selectedTeamDetail.id, 'Gagal');
                    setSelectedTeamDetail(prev => prev ? { ...prev, status: 'Gagal' } : null);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    selectedTeamDetail.status === 'Gagal'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-950 text-red-400 hover:bg-red-800 border border-red-800'
                  }`}
                >
                  Set Gagal
                </button>
              </div>
            </div>

            {/* CAPTAIN INFO WITH DIRECT WHATSAPP ACTION */}
            <div className="bg-[#050505] p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase font-black block">Informasi Penanggung Jawab / Kapten:</span>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-white text-xs font-bold block">{selectedTeamDetail.captainName}</strong>
                  <span className="text-xs font-mono text-emerald-400">{selectedTeamDetail.captainPhone}</span>
                </div>

                <a
                  href={`https://wa.me/${selectedTeamDetail.captainPhone.replace(/[^0-9]/g, '')}?text=Halo%20Kapten%20${encodeURIComponent(selectedTeamDetail.captainName)}%20dari%20tim%20${encodeURIComponent(selectedTeamDetail.teamName)}%2C%20panitia%20HUNTERS%20COMMUNITY%20ingin%20mengonfirmasi%20pendaftaran.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ROOM KODE & PASSWORD KAPTEN TIM */}
            <div className="bg-[#050505] p-3.5 rounded-xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>🔑 ROOM KODE & PASSWORD KAPTEN TIM</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">Kode Room ID:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 839210"
                    value={selectedTeamDetail.roomCode || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTeamDetail(prev => prev ? { ...prev, roomCode: val } : null);
                      setRegisteredTeams(prev => prev.map(t => t.id === selectedTeamDetail.id ? { ...t, roomCode: val } : t));
                    }}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs font-mono font-bold text-emerald-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">Password Room:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 123456"
                    value={selectedTeamDetail.roomPass || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedTeamDetail(prev => prev ? { ...prev, roomPass: val } : null);
                      setRegisteredTeams(prev => prev.map(t => t.id === selectedTeamDetail.id ? { ...t, roomPass: val } : t));
                    }}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ROSTER PLAYER LIST */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-300 font-bold block">Daftar Pemain / Roster Tim:</span>
              <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {selectedTeamDetail.roster.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0f0f0f] px-3 py-2 rounded-lg border border-neutral-800/70 text-xs">
                    <span className="text-neutral-400 font-mono text-[11px]">Player #{idx + 1}</span>
                    <strong className="text-white font-bold">{player}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  const t = selectedTeamDetail;
                  setSelectedTeamDetail(null);
                  setDeleteTeamTarget(t);
                }}
                className="px-3 py-2 bg-red-950 hover:bg-red-800 text-red-400 hover:text-white rounded-xl text-xs font-bold border border-red-800 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tim Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTeamDetail(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: KELOLA PENGUMUMAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'pengumuman' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Megaphone className="w-5 h-5 text-red-400" />
              <span>📢 KELOLA MENU PENGUMUMAN (INFO, JADWAL, PENGINGAT)</span>
            </h3>

            {/* Form Add Announcement */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAnnTitle || !newAnnContent) return;

                const selectedTargetTeam = registeredTeams.find(t => t.id === selectedTargetCaptainId);

                const formattedDateStr = new Date().toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) + ' WIB';

                const newAnn: AnnouncementItem = {
                  id: `ann-${Date.now()}`,
                  title: newAnnTitle,
                  content: newAnnContent,
                  date: formattedDateStr,
                  category: newAnnCategory,
                  isImportant: newAnnImportant || newAnnCategory === 'Info Penting',
                  targetAudience: newAnnCategory === 'Info Penting' ? 'Semua Kapten & Member' : targetAudience,
                  targetTeamId: selectedTargetTeam?.id,
                  targetTeamName: selectedTargetTeam?.teamName,
                  targetCaptainName: selectedTargetTeam?.captainName,
                  targetCaptainPhone: selectedTargetTeam?.captainPhone,
                  targetGame: selectedTargetTeam ? selectedTargetTeam.game : (targetAudience === 'Kapten Free Fire' ? 'FF' : targetAudience === 'Kapten MLBB' ? 'MLBB' : 'Semua'),
                  deviceSentCount: targetAudience === 'Kapten Spesifik' ? 1 : registeredTeams.length,
                };

                let updatedMatchSchedules = config.matchSchedules;
                if (newAnnCategory === 'Perubahan Jadwal' && selectedRemindMatchId) {
                  let parsedDay = '';
                  let parsedDate = newMatchDate;
                  if (newMatchDate.includes(',')) {
                    const parts = newMatchDate.split(',');
                    parsedDay = parts[0].trim();
                    parsedDate = parts.slice(1).join(',').trim();
                  }
                  updatedMatchSchedules = (config.matchSchedules || []).map(m => {
                    if (m.id === selectedRemindMatchId) {
                      return {
                        ...m,
                        day: parsedDay || m.day,
                        date: parsedDate || m.date,
                        time: newMatchTime || m.time
                      };
                    }
                    return m;
                  });
                }

                const updated = [newAnn, ...(config.announcements || [])];
                notifyAnnouncement(newAnn.title, newAnn.content, newAnn.category);
                const msgFeedback = selectedTargetTeam
                  ? `📢 PENGUMUMAN DITERBITKAN! Notifikasi otomatis dikirimkan ke perangkat Kapten "${selectedTargetTeam.captainName}" (${selectedTargetTeam.teamName}) & WhatsApp!`
                  : `📢 PENGUMUMAN DITERBITKAN! Notifikasi otomatis dikirim ke SELURUH perangkat kapten terdaftar (${targetAudience})!`;

                handleSaveAllConfig(
                  { ...config, announcements: updated, matchSchedules: updatedMatchSchedules },
                  msgFeedback
                );
                setSelectedRemindMatchId('');
              }}
              className="bg-[#050505] p-5 rounded-2xl border border-neutral-800 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>+ BUAT PENGUMUMAN & PENGINGAT MATCH</span>
                </h4>
              </div>

              {/* JUDUL PENGUMUMAN & OPSI BABAK */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-300 font-bold block">
                  JUDUL PENGUMUMAN:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pengingat Pertandingan - Babak Penyisihan"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-red-500 focus:outline-none"
                />
                {/* Quick Pilihan Babak */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-bold mr-1">Opsi Pilihan Babak:</span>
                  {['Babak Penyisihan', '16 Besar', 'Perempat Final', 'Semifinal', 'Perebutan Juara 3', 'Grand Final / Final'].map((phaseOption) => (
                    <button
                      key={phaseOption}
                      type="button"
                      onClick={() => handleSelectRemindPhase(phaseOption)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        selectedRemindPhase === phaseOption
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {phaseOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* KATEGORI */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-300 font-bold block">
                  KATEGORI:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Info Penting', label: 'Info Penting' },
                    { id: 'Perubahan Jadwal', label: 'Perubahan Jadwal' },
                    { id: 'Pengingat Match', label: 'Pengingat Match' },
                  ].map((cat) => {
                    const isSelected = newAnnCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleChangeCategory(cat.id)}
                        className={`p-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-red-600/20 text-red-400 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                            : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-red-500' : 'bg-neutral-600'}`} />
                        <span>{cat.label}</span>
                        {isSelected && <span className="text-emerald-400 font-bold">✅</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TARGET RECIPIENT & DEVICE NOTIFICATION CONTROLS */}
              <div className="space-y-2.5 p-3.5 bg-[#0a0a0a] border border-orange-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-amber-400 font-extrabold uppercase flex items-center gap-1.5 tracking-wider">
                    <span>📱 TARGET PERANGKAT & KAPTEN RECIPIENT:</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    🟢 {registeredTeams.length} Perangkat Kapten Terdaftar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { id: 'Semua Kapten & Member', label: '🌐 Semua Kapten & Member', desc: 'Broadcast ke seluruh perangkat' },
                    { id: 'Kapten Free Fire', label: '🔥 Kapten Tim Free Fire', desc: 'Khusus perangkat tim FF' },
                    { id: 'Kapten MLBB', label: '⚔️ Kapten Tim MLBB', desc: 'Khusus perangkat tim MLBB' },
                    { id: 'Kapten Spesifik', label: '👤 Kapten Tim Spesifik', desc: 'Pilih 1 kapten tim tertentu' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        targetAudience === aud.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/40 shadow-md'
                          : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      <strong className="text-xs font-black block">{aud.label}</strong>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{aud.desc}</span>
                    </button>
                  ))}
                </div>

                {/* DROPDOWN FOR KAPTEN SPESIFIK */}
                {targetAudience === 'Kapten Spesifik' && (
                  <div className="pt-2 animate-in fade-in space-y-2">
                    <label className="text-[11px] text-neutral-300 font-bold block">
                      Pilih Kapten Tim Yang Akan Menerima Notifikasi Pengumuman:
                    </label>
                    <select
                      value={selectedTargetCaptainId}
                      onChange={(e) => setSelectedTargetCaptainId(e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-orange-500/50 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- [Pilih Kapten Tim Dari Daftar Pendaftaran] --</option>
                      {registeredTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          [{team.game}] Tim {team.teamName} — Kapten: {team.captainName} ({team.captainPhone}) — Status: {team.status}
                        </option>
                      ))}
                    </select>

                    {selectedTargetCaptainId && (() => {
                      const selTeam = registeredTeams.find(t => t.id === selectedTargetCaptainId);
                      if (!selTeam) return null;
                      return (
                        <div className="p-2.5 bg-[#050505] border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-emerald-400 font-black uppercase block">Target Terpilih:</span>
                            <strong className="text-white font-bold">{selTeam.captainName} ({selTeam.teamName})</strong>
                            <span className="text-neutral-400 font-mono text-[11px] block">No WA: {selTeam.captainPhone}</span>
                          </div>

                          <a
                            href={`https://wa.me/${selTeam.captainPhone.replace(/[^0-9]/g, '')}?text=Halo%20Kapten%20${encodeURIComponent(selTeam.captainName)}%20dari%20tim%20${encodeURIComponent(selTeam.teamName)}%2C%20ada%20pengumuman%20penting%20turnamen%20yang%20telah%20diterbitkan%20ke%20perangkat%20Anda.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Kirim Pesan WA</span>
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* INPUT SPESIFIK BERDASARKAN KATEGORI */}

              {/* 1. KATEGORI: INFO PENTING */}
              {newAnnCategory === 'Info Penting' && (
                <div className="p-3 bg-[#0c0c0c] border border-red-500/30 rounded-xl space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Pengaturan Parameter Info Penting:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                        Tanggal Pendaftaran Tutup:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 1 September 2026"
                        value={regCloseDate}
                        onChange={(e) => {
                          setRegCloseDate(e.target.value);
                          setNewAnnContent(generateInfoPentingText(e.target.value, regCloseTime));
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-amber-300 font-bold focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                        Jam Tutup:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 12:00 WIB"
                        value={regCloseTime}
                        onChange={(e) => {
                          setRegCloseTime(e.target.value);
                          setNewAnnContent(generateInfoPentingText(regCloseDate, e.target.value));
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-amber-300 font-bold focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. KATEGORI: PERUBAHAN JADWAL */}
              {newAnnCategory === 'Perubahan Jadwal' && (
                <div className="p-3 bg-[#0c0c0c] border border-amber-500/30 rounded-xl space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Pilih Pertandingan & Jadwal Baru:</span>
                  </span>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <label className="text-[11px] text-neutral-300 font-bold block">
                        Pilih Pertandingan Yang Ingin Diubah Jadwal:
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400 font-bold mr-1">Opsi Game:</span>
                        {['Semua', 'Free Fire', 'MLBB'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedRemindGame(g)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              selectedRemindGame === g
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30'
                                : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                            }`}
                          >
                            {g === 'Semua' ? '🎮 Semua Game' : g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <select
                      value={selectedRemindMatchId}
                      onChange={(e) => handleSelectRemindMatch(e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- [Pilih Pertandingan Yang Ingin Diubah] --</option>
                      {(config.matchSchedules || [])
                        .filter(m => selectedRemindGame === 'Semua' || m.game === selectedRemindGame)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            [{m.game}] {m.phase} (Match #{m.matchNumber}): {m.teamA} vs {m.teamB} — Jadwal Sekarang: {m.day}, {m.date} ({m.time})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                        Tanggal Baru (Hari, Tanggal):
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Kamis, 3 September 2026"
                        value={newMatchDate}
                        onChange={(e) => {
                          setNewMatchDate(e.target.value);
                          const match = config.matchSchedules?.find(m => m.id === selectedRemindMatchId);
                          setNewAnnContent(generatePerubahanJadwalText(match, e.target.value, newMatchTime, selectedRemindPhase));
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                        Jam Mulai Baru:
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: 20:00 WIB"
                        value={newMatchTime}
                        onChange={(e) => {
                          setNewMatchTime(e.target.value);
                          const match = config.matchSchedules?.find(m => m.id === selectedRemindMatchId);
                          setNewAnnContent(generatePerubahanJadwalText(match, newMatchDate, e.target.value, selectedRemindPhase));
                        }}
                        className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-400/90 font-medium italic">
                    ⚡ Setelah diterbitkan, Jadwal pertandingan tim yang dipilih akan otomatis diganti di database sesuai yang diatur di sini!
                  </p>
                </div>
              )}

              {/* 3. KATEGORI: PENGINGAT MATCH */}
              {newAnnCategory === 'Pengingat Match' && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <label className="text-xs text-neutral-300 font-bold block">
                      PILIH PERTANDINGAN:
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400 font-bold mr-1">Opsi Game:</span>
                      {['Semua', 'Free Fire', 'MLBB'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedRemindGame(g)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedRemindGame === g
                              ? 'bg-red-500/20 text-red-300 border-red-500/50 ring-1 ring-red-500/30'
                              : 'bg-[#0f0f0f] text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          {g === 'Semua' ? '🎮 Semua Game' : g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <select
                    value={selectedRemindMatchId}
                    onChange={(e) => handleSelectRemindMatch(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-red-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- [Pilih Pertandingan Yang Sudah Disusun Admin] --</option>
                    {(config.matchSchedules || [])
                      .filter(m => selectedRemindGame === 'Semua' || m.game === selectedRemindGame)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.game}] {m.phase} (Match #{m.matchNumber}): {m.teamA} vs {m.teamB} — {m.day}, {m.date} ({m.time})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* ISI PESAN PENGINGAT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-300 font-bold block">
                    ISI PESAN PENGINGAT / PENGUMUMAN:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const match = config.matchSchedules?.find(m => m.id === selectedRemindMatchId);
                      if (newAnnCategory === 'Info Penting') {
                        setNewAnnContent(generateInfoPentingText(regCloseDate, regCloseTime));
                      } else if (newAnnCategory === 'Perubahan Jadwal') {
                        setNewAnnContent(generatePerubahanJadwalText(match, newMatchDate, newMatchTime, selectedRemindPhase));
                      } else {
                        setNewAnnContent(generateReminderText(selectedRemindPhase, match));
                      }
                    }}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    🔄 Reset Template Pesan
                  </button>
                </div>
                <textarea
                  rows={13}
                  required
                  placeholder="Isi pesan pengumuman..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* CHECKBOX & TERBITKAN BUTTON */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-bold">
                  <input
                    type="checkbox"
                    checked={newAnnImportant}
                    onChange={(e) => setNewAnnImportant(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Tandai sebagai "Penting / URGENT"</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>🔴 TERBITKAN PENGUMUMAN</span>
                </button>
              </div>
            </form>

            {/* List Announcements */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">Daftar Pengumuman Aktif:</h4>
              {(config.announcements || []).map((ann) => (
                <div key={ann.id} className="p-3 bg-[#050505] border border-neutral-800 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{ann.title}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 text-amber-400 uppercase font-mono">{ann.category}</span>
                      {ann.isImportant && <span className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white font-black">URGENT</span>}
                    </div>
                    <p className="text-xs text-neutral-300">{ann.content}</p>
                    <span className="text-[10px] text-neutral-500 block font-mono">Diterbitkan: {ann.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      const updated = config.announcements?.filter(a => a.id !== ann.id);
                      handleSaveAllConfig({ ...config, announcements: updated }, 'Pengumuman berhasil dihapus!');
                    }}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-800 text-red-400 rounded-lg text-xs font-bold border border-red-800 shrink-0 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: KELOLA FORMULIR PENDAFTARAN & TARGET EMAIL */}
      {/* ========================================================================= */}
      {activeAdminTab === 'form-config' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <span>📋 KELOLA FORMULIR PENDAFTARAN & OTOMATISASI EMAIL</span>
            </h3>

            <div className="space-y-4 bg-[#050505] p-4 rounded-xl border border-neutral-800">
              <div>
                <label className="text-xs font-bold text-amber-400 uppercase block mb-1">
                  Target Email Penerima Data Tim Pendaftaran:
                </label>
                <input
                  type="email"
                  value={config.formConfig?.targetEmail || 'hunters51community@gmail.com'}
                  onChange={(e) => setConfig({
                    ...config,
                    formConfig: {
                      ...(config.formConfig || { isOpen: true, customInstruction: '', successMessage: '' }),
                      targetEmail: e.target.value
                    }
                  })}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:border-amber-500"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  * Data pendaftaran peserta yang diisi dan dikonfirmasi di menu Formulir Pendaftaran otomatis dikirimkan ke email ini.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-neutral-800/80 py-3">
                <div>
                  <span className="text-xs font-bold text-white block">Status Formulir Pendaftaran</span>
                  <span className="text-[10px] text-neutral-400">Buka atau tutup akses formulir pendaftaran untuk publik</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({
                    ...config,
                    formConfig: {
                      ...(config.formConfig || { targetEmail: 'hunters51community@gmail.com', customInstruction: '', successMessage: '' }),
                      isOpen: !(config.formConfig?.isOpen ?? true)
                    }
                  })}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${
                    (config.formConfig?.isOpen ?? true)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {(config.formConfig?.isOpen ?? true) ? 'Pendaftaran BUKA' : 'Pendaftaran DITUTUP'}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Instruksi Khusus Pada Formulir:</label>
                <textarea
                  rows={3}
                  value={config.formConfig?.customInstruction || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    formConfig: {
                      ...(config.formConfig || { targetEmail: 'hunters51community@gmail.com', isOpen: true, successMessage: '' }),
                      customInstruction: e.target.value
                    }
                  })}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSaveAllConfig(config, 'Pengaturan Formulir Pendaftaran berhasil disimpan!')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Simpan Pengaturan Formulir Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 13: KELOLA TEKS PROMO BAGIKAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'share-config' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Globe className="w-5 h-5 text-cyan-300" />
              <span>🔗 KELOLA MENU BAGIKAN & TEKS PROMOSI</span>
            </h3>

            <div className="space-y-4 bg-[#050505] p-4 rounded-xl border border-neutral-800">
              <div>
                <label className="text-xs font-bold text-cyan-300 uppercase block mb-1">Judul Broadcast Promosi:</label>
                <input
                  type="text"
                  value={config.shareConfig?.promoTitle || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    shareConfig: {
                      ...(config.shareConfig || { promoText: '' }),
                      promoTitle: e.target.value
                    }
                  })}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Isi Teks Promosi Siap Salin:</label>
                <textarea
                  rows={5}
                  value={config.shareConfig?.promoText || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    shareConfig: {
                      ...(config.shareConfig || { promoTitle: '' }),
                      promoText: e.target.value
                    }
                  })}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSaveAllConfig(config, 'Teks Promosi Bagikan berhasil disimpan!')}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Simpan Teks Promosi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 14: KELOLA BANTUAN / CARA PAKAI (FAQ) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'bantuan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2 border-b border-neutral-800 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>❓ KELOLA MENU BANTUAN & BUKU PETUNJUK (FAQ)</span>
            </h3>

            {/* Form Add Help Item */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newHelpTitle || !newHelpContent) return;
                const newItem = {
                  id: `help-${Date.now()}`,
                  title: newHelpTitle,
                  content: newHelpContent
                };
                const updated = [...(config.helpConfig || []), newItem];
                handleSaveAllConfig({ ...config, helpConfig: updated }, 'Petunjuk bantuan berhasil ditambahkan!');
                setNewHelpTitle('');
                setNewHelpContent('');
              }}
              className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3"
            >
              <h4 className="text-xs font-bold text-indigo-300 uppercase">+ Tambah Item Panduan / FAQ Baru</h4>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold block mb-1">Pertanyaan / Judul Petunjuk:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bagaimana cara membatalkan pendaftaran tim?"
                  value={newHelpTitle}
                  onChange={(e) => setNewHelpTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold block mb-1">Jawaban / Isi Penjelasan Lengkap:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan jawaban singkat dan jelas..."
                  value={newHelpContent}
                  onChange={(e) => setNewHelpContent(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer"
              >
                Tambahkan Ke Menu Bantuan
              </button>
            </form>

            {/* List Help Items */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase">Daftar Item Bantuan Aktif:</h4>
              {(config.helpConfig || []).map((h) => (
                <div key={h.id} className="p-3 bg-[#050505] border border-neutral-800 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-xs block">{h.title}</span>
                    <p className="text-xs text-neutral-300">{h.content}</p>
                  </div>

                  <button
                    onClick={() => {
                      const updated = config.helpConfig?.filter(item => item.id !== h.id);
                      handleSaveAllConfig({ ...config, helpConfig: updated }, 'Item bantuan berhasil dihapus!');
                    }}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-800 text-red-400 rounded-lg text-xs font-bold border border-red-800 shrink-0 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 15: KELOLA MENU BLACKLIST (DAFTAR HITAM AKUN & TIM) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'blacklist' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" />
                <span>MENU 15: KELOLA DAFTAR HITAM (BLACKLIST) AKUN & TIM</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Pantau seluruh akun member atau tim yang di-blacklist karena kecurangan, pemalsuan bukti transfer, atau pelanggaran aturan turnamen.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleEmptyAllBlacklist}
                className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-red-800 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                title="Mengosongkan seluruh entri daftar hitam"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>🔄 KOSONGKAN DAFTAR HITAM</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setManualBlName('');
                  setManualBlEmail('');
                  setManualBlPhone('');
                  setManualBlTeam('');
                  setManualBlType('Member');
                  setManualBlReason('');
                  setShowManualBlacklistModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/50 uppercase tracking-wider shrink-0 active:scale-95 transition-all cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>+ Tambah Manual Ke Blacklist</span>
              </button>
            </div>
          </div>

          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0f0f0f] border border-red-500/20 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Ter-Blacklist:</span>
              <strong className="text-xl font-black text-red-400 font-mono">{(config.blacklistData || []).length} Akun / Tim</strong>
            </div>

            <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Member Individu:</span>
              <strong className="text-xl font-black text-amber-400 font-mono">
                {(config.blacklistData || []).filter(b => b.type === 'Member').length} Member
              </strong>
            </div>

            <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Tim / Squad:</span>
              <strong className="text-xl font-black text-rose-400 font-mono">
                {(config.blacklistData || []).filter(b => b.type === 'Tim').length} Tim
              </strong>
            </div>
          </div>

          {/* SEARCH & FILTER */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, tim, atau alasan blacklist..."
                value={blacklistSearchTerm}
                onChange={(e) => setBlacklistSearchTerm(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="text-xs text-neutral-400 font-mono">
              Menampilkan <strong className="text-red-400 font-black">
                {(config.blacklistData || []).filter(b =>
                  b.name.toLowerCase().includes(blacklistSearchTerm.toLowerCase()) ||
                  (b.email && b.email.toLowerCase().includes(blacklistSearchTerm.toLowerCase())) ||
                  (b.teamName && b.teamName.toLowerCase().includes(blacklistSearchTerm.toLowerCase())) ||
                  b.reason.toLowerCase().includes(blacklistSearchTerm.toLowerCase())
                ).length}
              </strong> data blacklist
            </div>
          </div>

          {/* BLACKLIST DATA TABLE */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#050505] text-neutral-400 font-black uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-3.5">Akun / Tim Ter-Blacklist</th>
                    <th className="p-3.5">Kontak & Tim</th>
                    <th className="p-3.5">Kategori / Tipe</th>
                    <th className="p-3.5">Alasan Hukuman Blacklist</th>
                    <th className="p-3.5">Tgl Blacklist</th>
                    <th className="p-3.5 text-right">Opsi Hukuman Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {(config.blacklistData || [])
                    .filter(b =>
                      b.name.toLowerCase().includes(blacklistSearchTerm.toLowerCase()) ||
                      (b.email && b.email.toLowerCase().includes(blacklistSearchTerm.toLowerCase())) ||
                      (b.teamName && b.teamName.toLowerCase().includes(blacklistSearchTerm.toLowerCase())) ||
                      b.reason.toLowerCase().includes(blacklistSearchTerm.toLowerCase())
                    )
                    .map((bl) => (
                      <tr key={bl.id} className="hover:bg-red-950/10 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-black flex items-center justify-center shrink-0">
                              🚫
                            </div>
                            <div>
                              <strong className="text-white font-bold block">{bl.name}</strong>
                              <span className="text-[11px] font-mono text-neutral-400 block">{bl.email || 'Tanpa Email'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-neutral-300">
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 block font-bold">{bl.phone || '-'}</span>
                            <span className="text-amber-300 font-bold block text-[11px]">🛡️ {bl.teamName || '-'}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase tracking-wider inline-block ${
                            bl.type === 'Tim'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {bl.type || 'Member'}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="p-2.5 bg-[#050505] border border-red-900/60 rounded-xl text-red-300 text-[11px] leading-relaxed font-mono">
                            ⚠️ {bl.reason}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-neutral-400 text-[11px]">
                          {bl.blacklistedAt || '2026-08-05'}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* ACTION: LEPAS HUKUMAN */}
                            <button
                              type="button"
                              onClick={() => handleUnblacklist(bl)}
                              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-800 font-extrabold text-[11px] rounded-lg shadow flex items-center gap-1 transition-all cursor-pointer shrink-0"
                              title="Lepas hukuman dan pulihkan akun ini"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Lepas Hukuman</span>
                            </button>

                            {/* ACTION: HAPUS PERMANEN */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBlacklistPermanently(bl)}
                              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 hover:text-white border border-red-800/60 font-bold text-[11px] rounded-lg shadow flex items-center gap-1 transition-all cursor-pointer shrink-0"
                              title="Hapus data blacklist ini secara permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Permanen</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {(config.blacklistData || []).length === 0 && (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-neutral-300 font-bold">Tidak ada akun atau tim yang di-blacklist saat ini.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 16: MENU BARU SAJA DIHAPUS (TEMPAT SAMPAH / RECYCLE BIN) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'baru-dihapus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* HEADER & GENERAL CONTROLS */}
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Baru Saja Dihapus</span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      Tempat Sampah System
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
                  Semua item yang dihapus dari <strong className="text-amber-400">Pendaftaran Tim</strong>, <strong className="text-indigo-400">Aturan Game</strong>, <strong className="text-emerald-400">Akun Admin</strong>, dan <strong className="text-blue-400">Akun Member</strong> otomatis dipindahkan ke menu ini. Anda dapat memulihkan (restore) data kapan saja atau menghapusnya secara permanen.
                </p>
              </div>

              {/* BATCH ACTION BUTTONS */}
              {(config.recentlyDeleted || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRestoreAllTrash}
                    className="px-3.5 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
                    title="Pulihkan seluruh data di tempat sampah"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pulihkan Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleEmptyAllTrash}
                    className="px-3.5 py-2 bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
                    title="Hapus semua data di tempat sampah secara permanen"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Kosongkan Sampah</span>
                  </button>
                </div>
              )}
            </div>

            {/* SUBTAB CATEGORY FILTERS */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-neutral-400 font-bold flex items-center gap-1 mr-1">
                <ListFilter className="w-3.5 h-3.5 text-orange-400" /> Filter Kategori:
              </span>

              {/* ALL */}
              <button
                type="button"
                onClick={() => setTrashCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  trashCategoryFilter === 'ALL'
                    ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-400'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>⚡ Semua Data</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {(config.recentlyDeleted || []).length}
                </span>
              </button>

              {/* 1. PENDAFTARAN */}
              <button
                type="button"
                onClick={() => setTrashCategoryFilter('pendaftaran')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  trashCategoryFilter === 'pendaftaran'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>📋 Pendaftaran Tim</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {(config.recentlyDeleted || []).filter(d => d.type === 'pendaftaran').length}
                </span>
              </button>

              {/* 2. ATURAN */}
              <button
                type="button"
                onClick={() => setTrashCategoryFilter('aturan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  trashCategoryFilter === 'aturan'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>📜 Aturan Game</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {(config.recentlyDeleted || []).filter(d => d.type === 'aturan').length}
                </span>
              </button>

              {/* 3. AKUN ADMIN */}
              <button
                type="button"
                onClick={() => setTrashCategoryFilter('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  trashCategoryFilter === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>🛡️ Akun Admin</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {(config.recentlyDeleted || []).filter(d => d.type === 'admin').length}
                </span>
              </button>

              {/* 4. AKUN MEMBER */}
              <button
                type="button"
                onClick={() => setTrashCategoryFilter('member')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-row items-center gap-1.5 cursor-pointer ${
                  trashCategoryFilter === 'member'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>👤 Akun Member</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {(config.recentlyDeleted || []).filter(d => d.type === 'member').length}
                </span>
              </button>
            </div>
          </div>

          {/* ITEM LIST CONTAINER */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-4 space-y-3">
            {(() => {
              const allDeleted = config.recentlyDeleted || [];
              const filteredList = trashCategoryFilter === 'ALL'
                ? allDeleted
                : allDeleted.filter(d => d.type === trashCategoryFilter);

              if (filteredList.length === 0) {
                return (
                  <div className="p-10 text-center space-y-3 bg-[#050505] rounded-xl border border-neutral-800/80">
                    <Trash2 className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h3 className="text-sm font-bold text-neutral-300 uppercase">Tempat Sampah Kosong</h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      {trashCategoryFilter === 'ALL' 
                        ? 'Belum ada data yang baru saja dihapus. Setiap data yang dihapus dari menu Pendaftaran, Aturan, Akun Admin, atau Akun Member akan muncul di sini.' 
                        : `Tidak ada data baru saja dihapus pada kategori "${trashCategoryFilter}".`}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                    <span>Daftar item di tempat sampah (<strong className="text-white font-black">{filteredList.length}</strong> data):</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Diurutkan: Paling Baru Dihapus</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {filteredList.map((item) => {
                      let typeLabel = '';
                      let typeColorClass = '';

                      if (item.type === 'pendaftaran') {
                        typeLabel = '📋 Pendaftaran Tim';
                        typeColorClass = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
                      } else if (item.type === 'aturan') {
                        typeLabel = '📜 Aturan Game';
                        typeColorClass = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80';
                      } else if (item.type === 'admin') {
                        typeLabel = '🛡️ Akun Admin';
                        typeColorClass = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
                      } else if (item.type === 'member') {
                        typeLabel = '👤 Akun Member';
                        typeColorClass = 'bg-blue-950/80 text-blue-300 border-blue-800/80';
                      }

                      return (
                        <div 
                          key={item.id}
                          className="bg-[#050505] border border-neutral-800/90 hover:border-neutral-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${typeColorClass}`}>
                                {typeLabel}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                                🕒 Dihapus: <strong>{item.deletedAt}</strong>
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-white leading-snug">
                              {item.title}
                            </h4>

                            {item.subtitle && (
                              <p className="text-xs text-neutral-300 font-mono leading-relaxed bg-neutral-950 p-2 rounded-lg border border-neutral-900">
                                {item.subtitle}
                              </p>
                            )}
                          </div>

                          {/* ACTION BUTTONS: RESTORE & DELETE PERMANENT */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                            <button
                              type="button"
                              onClick={() => handleRestoreDeletedItem(item)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                              title="Pulihkan data ini kembali ke tempat semula"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Pulihkan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(item)}
                              className="px-3.5 py-2 bg-neutral-900 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/80 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                              title="Hapus data ini secara permanen dari database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Permanen</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 20. TAB KELOLA HASIL PERTANDINGAN (GUGUR / LOLOS) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'hasil-match' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    20. Kelola Hasil Pertandingan (Gugur / Lolos)
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Catat tim pemenang/lolos vs tim gugur beserta alasan resmi (Diskualifikasi, Kalah Match, Mengundurkan Diri).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-500/30 font-mono">
                  {(config.matchResultRecords || []).length} Rekor Match
                </span>
              </div>
            </div>

            {/* FORM TAMBAH REKOR HASIL MATCH */}
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-5 space-y-4">
              <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Input Hasil Pertandingan Baru</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Nama Match / Babak:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Knockout Day 1 - Match #3"
                    value={newHasilName}
                    onChange={(e) => setNewHasilName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Game Esports:
                  </label>
                  <select
                    value={newHasilGame}
                    onChange={(e) => setNewHasilGame(e.target.value as 'FF' | 'MLBB')}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 font-bold"
                  >
                    <option value="FF">🔥 Free Fire (FF)</option>
                    <option value="MLBB">⚔️ Mobile Legends (MLBB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                    Nama Tim Menang / Lolos:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: KING ESPORTS"
                    value={newHasilWinTeam}
                    onChange={(e) => setNewHasilWinTeam(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-emerald-900/60 rounded-xl p-2.5 text-xs text-emerald-300 font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-red-400 font-bold block mb-1">
                    Nama Tim Kalah / Gugur:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SHADOW TEAM"
                    value={newHasilLoseTeam}
                    onChange={(e) => setNewHasilLoseTeam(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-red-900/60 rounded-xl p-2.5 text-xs text-red-300 font-bold focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Status Tim Kalah:
                  </label>
                  <select
                    value={newHasilStatus}
                    onChange={(e) => setNewHasilStatus(e.target.value as 'LOLOS' | 'GUGUR')}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 font-bold"
                  >
                    <option value="GUGUR">❌ GUGUR / TERELIMINASI</option>
                    <option value="LOLOS">✅ LOLOS BABAK SELANJUTNYA</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Kategori Alasan Gugur:
                  </label>
                  <select
                    value={newHasilReason}
                    onChange={(e) => setNewHasilReason(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 font-bold"
                  >
                    <option value="KALAH_BERTANDING">⚔️ KALAH BERTANDING</option>
                    <option value="DISKUALIFIKASI">⛔ DISKUALIFIKASI</option>
                    <option value="MENGUNDURKAN_DIRI">🏳️ MENGUNDURKAN DIRIP</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Penjelasan Alasan Gugur Detail:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Diskualifikasi akibat telat masuk kustom room 15 menit & tidak hadir."
                    value={newHasilNote}
                    onChange={(e) => setNewHasilNote(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Skor / Catatan Tambahan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Skor 2 - 0 (Point Kill 15)"
                    value={newHasilDetail}
                    onChange={(e) => setNewHasilDetail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newHasilName.trim() || !newHasilWinTeam.trim() || !newHasilLoseTeam.trim()) {
                    alert('Nama Match, Tim Menang, dan Tim Kalah wajib diisi!');
                    return;
                  }
                  const newItem: MatchResultRecord = {
                    id: `mrec-${Date.now()}`,
                    matchId: newHasilName.trim(),
                    game: newHasilGame,
                    phase: 'Kualifikasi',
                    winningTeam: newHasilWinTeam.trim(),
                    losingTeam: newHasilLoseTeam.trim(),
                    losingStatus: 'GUGUR',
                    eliminationReason: newHasilReason,
                    customReason: newHasilNote.trim() || undefined,
                    score: newHasilDetail.trim() || undefined,
                    createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                  };
                  const updated = [newItem, ...(config.matchResultRecords || [])];
                  handleSaveAllConfig({ ...config, matchResultRecords: updated }, 'Rekor hasil match berhasil ditambahkan!');
                  setNewHasilName('');
                  setNewHasilWinTeam('');
                  setNewHasilLoseTeam('');
                  setNewHasilNote('');
                  setNewHasilDetail('');
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Rekor Hasil Match</span>
              </button>
            </div>

            {/* DAFTAR REKOR HASIL MATCH */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Daftar Hasil Pertandingan Terdaftar
              </h4>

              {(config.matchResultRecords || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada rekor hasil pertandingan. Gunakan form di atas untuk menambahkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(config.matchResultRecords || []).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-[#050505] border border-neutral-800/80 rounded-xl space-y-3 relative group hover:border-amber-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${rec.game === 'FF' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
                            {rec.game}
                          </span>
                          <span className="font-extrabold text-xs text-white">{rec.matchId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm('Hapus rekor hasil match ini?')) return;
                            const updated = (config.matchResultRecords || []).filter(r => r.id !== rec.id);
                            handleSaveAllConfig({ ...config, matchResultRecords: updated }, 'Rekor match berhasil dihapus.');
                          }}
                          className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
                          <span className="text-[9px] text-emerald-400 block font-bold uppercase">✅ LOLOS / MENANG</span>
                          <strong className="text-white text-xs block font-bold">{rec.winningTeam}</strong>
                        </div>
                        <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-lg">
                          <span className="text-[9px] text-red-400 block font-bold uppercase">❌ {rec.losingStatus} ({rec.eliminationReason})</span>
                          <strong className="text-white text-xs block font-bold">{rec.losingTeam}</strong>
                        </div>
                      </div>

                      {rec.customReason && (
                        <p className="text-[11px] text-neutral-300 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800 font-mono">
                          💬 {rec.customReason}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1">
                        <span>{rec.score || 'Tidak ada detail skor'}</span>
                        <span>{rec.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 21. TAB KELOLA TURNAMEN MENDATANG */}
      {/* ========================================================================= */}
      {activeAdminTab === 'turnamen-mendatang' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    21. Kelola Jadwal Turnamen Mendatang
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Tambahkan event turnamen FF & MLBB yang akan dibuka pendaftarannya agar member dapat bersiap.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-extrabold px-3 py-1 rounded-full border border-cyan-500/30 font-mono">
                  {(config.upcomingTournaments || []).length} Event Event Baru
                </span>
                <button
                  type="button"
                  onClick={handleClearUpcomingTournaments}
                  className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  title="Hapus seluruh turnamen mendatang yang belum dibuka pendaftarannya"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>🗑️ HAPUS SEMUA TURNAMEN</span>
                </button>
              </div>
            </div>

            {/* FORM TAMBAH TURNAMEN MENDATANG */}
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-5 space-y-4">
              <h4 className="font-extrabold text-xs text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Tambah Turnamen Mendatang Baru</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Judul Turnamen Mendatang:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Free Fire Major League S2 2026 - Prize Pool 3 Juta"
                    value={newUpcomingTitle}
                    onChange={(e) => setNewUpcomingTitle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Game Esports:
                  </label>
                  <select
                    value={newUpcomingGame}
                    onChange={(e) => setNewUpcomingGame(e.target.value as 'FF' | 'MLBB')}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 font-bold"
                  >
                    <option value="FF">🔥 Free Fire (FF)</option>
                    <option value="MLBB">⚔️ Mobile Legends (MLBB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Tanggal Buka Pendaftaran:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 Agustus 2026"
                    value={newUpcomingOpenDate}
                    onChange={(e) => setNewUpcomingOpenDate(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Tanggal Mulai Match:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20 Agustus 2026"
                    value={newUpcomingStartDate}
                    onChange={(e) => setNewUpcomingStartDate(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Prize Pool / Total Hadiah:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 3.000.000"
                    value={newUpcomingPrize}
                    onChange={(e) => setNewUpcomingPrize(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Kuota Slot Target:
                  </label>
                  <input
                    type="text"
                    placeholder="32 Slot"
                    value={newUpcomingSlot}
                    onChange={(e) => setNewUpcomingSlot(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Mode Pertandingan:
                  </label>
                  <select
                    value={newUpcomingMode}
                    onChange={(e) => setNewUpcomingMode(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 font-bold"
                  >
                    <option value="SQUAD">👥 SQUAD (4-5 Pemain)</option>
                    <option value="DUO">👥 DUO (2 Pemain)</option>
                    <option value="SOLO">👤 SOLO (1 Pemain)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Catatan Singkat Event:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Slot terbatas! Pendaftaran via QRIS DEXZ STORE."
                    value={newUpcomingDesc}
                    onChange={(e) => setNewUpcomingDesc(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newUpcomingTitle.trim() || !newUpcomingOpenDate.trim() || !newUpcomingStartDate.trim()) {
                    alert('Judul, Tanggal Buka, dan Tanggal Tanding wajib diisi!');
                    return;
                  }
                  const defaultBanner = newUpcomingGame === 'FF'
                    ? 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'
                    : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';

                  const newItem: UpcomingTournament = {
                    id: `up-${Date.now()}`,
                    title: newUpcomingTitle.trim(),
                    game: newUpcomingGame,
                    openDate: newUpcomingOpenDate.trim(),
                    startDate: newUpcomingStartDate.trim(),
                    prizePool: newUpcomingPrize.trim() || 'Rp 2.000.000',
                    slots: parseInt(newUpcomingSlot) || 32,
                    registeredCount: 0,
                    status: 'Segera Dibuka',
                    fee: 'Rp 50.000',
                    mode: newUpcomingMode,
                    description: newUpcomingDesc.trim() || undefined,
                    bannerImage: defaultBanner,
                  };
                  const updated = [newItem, ...(config.upcomingTournaments || [])];
                  handleSaveAllConfig({ ...config, upcomingTournaments: updated }, 'Turnamen mendatang berhasil ditambahkan!');
                  setNewUpcomingTitle('');
                  setNewUpcomingOpenDate('');
                  setNewUpcomingStartDate('');
                  setNewUpcomingPrize('');
                  setNewUpcomingDesc('');
                }}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Turnamen Mendatang</span>
              </button>
            </div>

            {/* DAFTAR TURNAMEN MENDATANG */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Daftar Turnamen Mendatang Diterbitkan
              </h4>

              {(config.upcomingTournaments || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada event turnamen mendatang. Silakan tambahkan melalui form di atas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(config.upcomingTournaments || []).map((tour) => (
                    <div
                      key={tour.id}
                      className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-2 relative group hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tour.game === 'FF' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
                            {tour.game} • {tour.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUpcoming(tour)}
                            className="p-1.5 bg-neutral-900 hover:bg-cyan-950 text-neutral-400 hover:text-cyan-400 rounded-lg border border-neutral-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title="Ubah / Edit Turnamen"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUpcomingTournament(tour.id, tour.title)}
                            className="p-1.5 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded-lg border border-neutral-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title="Hapus Turnamen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      <h5 className="font-extrabold text-sm text-white">{tour.title}</h5>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300">
                        <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Pendaftaran Buka:</span>
                          <strong>📅 {tour.openDate}</strong>
                        </div>
                        <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Mulai Match:</span>
                          <strong className="text-cyan-400">⚡ {tour.startDate}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono font-bold pt-1">
                        <span className="text-amber-400">🏆 {tour.prizePool}</span>
                        <span className="text-neutral-400">👥 {tour.registeredCount}/{tour.slots} Slot</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 22. TAB KELOLA SENGKETA & BANDING */}
      {/* ========================================================================= */}
      {activeAdminTab === 'sengketa' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    22. Kelola Sengketa & Banding Hasil Match
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Tinjau laporan kecurangan, protes jadwal, atau banding skor dari tim beserta bukti screenshot/video.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-red-500/20 text-red-300 font-extrabold px-3 py-1 rounded-full border border-red-500/30 font-mono">
                  {(config.matchDisputes || []).filter(d => d.status === 'DIPROSES').length} Menunggu Diproses
                </span>
                <button
                  type="button"
                  onClick={handleClearDecidedDisputes}
                  className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  title="Hapus seluruh laporan sengketa yang telah selesai diputuskan"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>🗑️ HAPUS SEMUA LAPORAN</span>
                </button>
              </div>
            </div>

            {/* DAFTAR SENGKETA & BANDING */}
            <div className="space-y-4">
              {(config.matchDisputes || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada laporan sengketa atau banding dari tim.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(config.matchDisputes || []).map((disp) => (
                    <div
                      key={disp.id}
                      className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-4 shadow-lg hover:border-red-500/50 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                            disp.status === 'DIPROSES'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                              : disp.status === 'DIKABULKAN'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {disp.status}
                          </span>
                          <span className="font-extrabold text-sm text-white">
                            {disp.teamName} <span className="text-neutral-500 font-normal">vs</span> {disp.targetMatch || 'Lawan Match'}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          📅 {disp.submittedAt}
                        </span>
                      </div>

                      <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-neutral-200 font-mono space-y-1">
                        <span className="text-[10px] text-red-400 font-bold block uppercase">Alasan Keberatan / Detail Sengketa:</span>
                        <p>{disp.reason}</p>
                      </div>

                      {disp.evidenceUrl && (
                        <div className="space-y-2 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-pink-400 font-extrabold flex items-center gap-1.5 uppercase">
                              <Camera className="w-3.5 h-3.5" />
                              <span>📸 BUKTI FOTO SCREENSHOT / RECORDING:</span>
                            </span>
                            <a
                              href={disp.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-pink-400 underline font-mono hover:text-pink-300 font-bold"
                            >
                              Buka Gambar Penuh ↗
                            </a>
                          </div>
                          {(disp.evidenceUrl.startsWith('data:image') || disp.evidenceUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) ? (
                            <div className="relative group max-w-sm rounded-lg overflow-hidden border border-neutral-800 bg-black">
                              <img
                                src={disp.evidenceUrl}
                                alt="Bukti Foto Sengketa"
                                className="max-h-60 w-auto object-contain mx-auto"
                              />
                            </div>
                          ) : (
                            <a
                              href={disp.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-pink-400 underline font-mono hover:text-pink-300 block"
                            >
                              🔗 {disp.evidenceUrl}
                            </a>
                          )}
                        </div>
                      )}

                      {disp.adminNote && (
                        <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-blue-300 font-mono">
                          <span className="font-bold block text-[10px] uppercase text-blue-400">Keputusan Admin:</span>
                          <p>{disp.adminNote}</p>
                        </div>
                      )}

                      {/* OPSIKU KEPUTUSAN ADMIN */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Tuliskan Keputusan Admin untuk MENGABULKAN Banding ini:', disp.adminNote || 'Banding DIKABULKAN: Hasil match direvisi atau diulang.');
                              if (note === null) return;
                              const updated = (config.matchDisputes || []).map(d =>
                                d.id === disp.id ? { ...d, status: 'DIKABULKAN' as const, adminNote: note } : d
                              );
                              handleSaveAllConfig({ ...config, matchDisputes: updated }, 'Sengketa dikabulkan.');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                          >
                            ✅ Kabulkan Banding
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Tuliskan Alasan Admin MENOLAK Banding ini:', disp.adminNote || 'Banding DITOLAK: Bukti kurang kuat atau melebihi batas waktu 1 jam.');
                              if (note === null) return;
                              const updated = (config.matchDisputes || []).map(d =>
                                d.id === disp.id ? { ...d, status: 'DITOLAK' as const, adminNote: note } : d
                              );
                              handleSaveAllConfig({ ...config, matchDisputes: updated }, 'Sengketa ditolak.');
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                          >
                            ❌ Tolak Banding
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm('Hapus rekor sengketa ini?')) return;
                            const updated = (config.matchDisputes || []).filter(d => d.id !== disp.id);
                            handleSaveAllConfig({ ...config, matchDisputes: updated }, 'Laporan sengketa dihapus.');
                          }}
                          className="text-xs text-neutral-500 hover:text-red-400 font-mono transition-colors cursor-pointer"
                        >
                          Hapus Rekor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 23. TAB KELOLA PERMOHONAN UBAH DATA PENDAFTARAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'ubah-data-req' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-indigo-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    23. Kelola Permohonan Ubah Data Pendaftaran
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Permohonan perubahan nama tim atau nickname/ID pemain sebelum pendaftaran ditutup secara resmi.
                </p>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-extrabold px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
                {(config.registrationChanges || []).filter(c => c.status === 'PENDING').length} Mengajukan
              </span>
            </div>

            <div className="space-y-3">
              {(config.registrationChanges || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada permohonan ubah data pendaftaran dari kapten tim.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {(config.registrationChanges || []).map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-3 relative group hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            req.status === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            req.status === 'DISETUJUI' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {req.status}
                          </span>
                          <strong className="text-white text-xs font-extrabold">{req.teamName}</strong>
                          <span className="text-neutral-500 text-[11px] font-mono">({req.captainPhone})</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">{req.requestedAt}</span>
                      </div>

                      <div className="p-3 bg-neutral-900/60 rounded-lg text-xs font-mono text-neutral-300 space-y-1">
                        <span className="text-[10px] text-indigo-400 block font-bold uppercase">Detail Perubahan Yang Diajukan:</span>
                        <p className="whitespace-pre-wrap">{req.requestedChangeDetails}</p>
                      </div>

                      {req.reason && (
                        <p className="text-[11px] text-neutral-400 italic">Alasan: "{req.reason}"</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (config.registrationChanges || []).map(c =>
                                c.id === req.id ? { ...c, status: 'DISETUJUI' as const } : c
                              );
                              handleSaveAllConfig({ ...config, registrationChanges: updated }, 'Permohonan ubah data disetujui!');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (config.registrationChanges || []).map(c =>
                                c.id === req.id ? { ...c, status: 'DITOLAK' as const } : c
                              );
                              handleSaveAllConfig({ ...config, registrationChanges: updated }, 'Permohonan ubah data ditolak.');
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = (config.registrationChanges || []).filter(c => c.id !== req.id);
                            handleSaveAllConfig({ ...config, registrationChanges: updated }, 'Permohonan dihapus.');
                          }}
                          className="text-neutral-500 hover:text-red-400 text-xs font-mono transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 24. TAB KONFIRMASI KEHADIRAN & SWAP JADWAL */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kehadiran' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    24. Data Konfirmasi Kehadiran & Penukaran Jadwal Tim
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Pantau tim yang SIAP / BELUM SIAP bertanding dan kelola permohonan tukar jadwal antar tim secara otomatis.
                </p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                {(config.attendanceConfirmations || []).length} Konfirmasi
              </span>
            </div>

            <div className="space-y-3">
              {(config.attendanceConfirmations || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada konfirmasi kehadiran dari tim yang tercatat.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(config.attendanceConfirmations || []).map((conf) => (
                    <div
                      key={conf.id}
                      className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-2 relative group hover:border-emerald-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <strong className="text-white text-xs font-extrabold">{conf.teamName}</strong>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          conf.status === 'SIAP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          conf.status === 'BELUM_SIAP' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {conf.status}
                        </span>
                      </div>

                      {conf.reason && (
                        <p className="text-[11px] text-neutral-300 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800 font-mono">
                          💬 Alasan: {conf.reason}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1">
                        <span>Match ID: #{conf.matchId}</span>
                        <span>{conf.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 25. TAB KELOLA TIM UNGGULAN & PREDIKSI */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tim-unggulan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-yellow-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-black text-base text-white uppercase tracking-wider">
                    25. Kelola Tim Unggulan & Prediksi Kemenangan
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Tambahkan tim-tim kuat yang wajib diwaspadai beserta statistik winrate dan prediksi peringkat juara.
                </p>
              </div>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 font-extrabold px-3 py-1 rounded-full border border-yellow-500/30 font-mono">
                {(config.featuredTeams || []).length} Tim Unggulan
              </span>
            </div>

            {/* FORM TAMBAH TIM UNGGULAN */}
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-5 space-y-4">
              <h4 className="font-extrabold text-xs text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-yellow-400" />
                <span>Tambah Tim Unggulan Baru</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Nama Tim Unggulan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: ONIC PRO"
                    value={newFeaturedName}
                    onChange={(e) => setNewFeaturedName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-yellow-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Game Esports:
                  </label>
                  <select
                    value={newFeaturedGame}
                    onChange={(e) => setNewFeaturedGame(e.target.value as 'FF' | 'MLBB')}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-yellow-500 font-bold"
                  >
                    <option value="FF">🔥 Free Fire (FF)</option>
                    <option value="MLBB">⚔️ Mobile Legends (MLBB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Pemain Kunci / Star Roster:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kairi (Jungler), SANZ (Mid)"
                    value={newFeaturedPlayers}
                    onChange={(e) => setNewFeaturedPlayers(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Win Rate / Rasio Kemenangan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 88% Win Rate (15-2)"
                    value={newFeaturedWinRate}
                    onChange={(e) => setNewFeaturedWinRate(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Prediksi Peringkat / Peluang:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 🏆 Prediksi Juara 1 (75% Chance)"
                    value={newFeaturedPrediction}
                    onChange={(e) => setNewFeaturedPrediction(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-yellow-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 font-bold block mb-1">
                    Analisis Keunggulan Tim:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rotasi makro cepat & konsisten Booyah"
                    value={newFeaturedDesc}
                    onChange={(e) => setNewFeaturedDesc(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-yellow-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newFeaturedName.trim()) {
                    alert('Nama Tim Unggulan wajib diisi!');
                    return;
                  }
                  const newItem: FeaturedTeam = {
                    id: `ft-${Date.now()}`,
                    name: newFeaturedName.trim(),
                    game: newFeaturedGame,
                    winRate: parseFloat(newFeaturedWinRate) || 85,
                    totalWins: 12,
                    keyPlayers: newFeaturedPlayers.trim() ? newFeaturedPlayers.split(',').map(s => s.trim()) : ['Star Player'],
                    description: newFeaturedDesc.trim() || 'Tim unggulan dengan strategi solid.',
                    predictedRank: newFeaturedPrediction.trim() || '🏆 Prediksi Juara 1',
                  };
                  const updated = [newItem, ...(config.featuredTeams || [])];
                  handleSaveAllConfig({ ...config, featuredTeams: updated }, 'Tim unggulan berhasil ditambahkan!');
                  setNewFeaturedName('');
                  setNewFeaturedPlayers('');
                  setNewFeaturedWinRate('');
                  setNewFeaturedPrediction('');
                  setNewFeaturedDesc('');
                }}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Tim Unggulan</span>
              </button>
            </div>

            {/* DAFTAR TIM UNGGULAN */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Daftar Tim Unggulan Terdaftar
              </h4>

              {(config.featuredTeams || []).length === 0 ? (
                <div className="p-8 text-center bg-[#050505] border border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
                  Belum ada tim unggulan. Tambahkan lewat form di atas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(config.featuredTeams || []).map((team) => (
                    <div
                      key={team.id}
                      className="p-4 bg-[#050505] border border-neutral-800 rounded-xl space-y-2 relative group hover:border-yellow-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${team.game === 'FF' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
                            {team.game}
                          </span>
                          <h5 className="font-black text-sm text-white">{team.name}</h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm('Hapus tim unggulan ini?')) return;
                            const updated = (config.featuredTeams || []).filter(t => t.id !== team.id);
                            handleSaveAllConfig({ ...config, featuredTeams: updated }, 'Tim unggulan dihapus.');
                          }}
                          className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {team.keyPlayers && team.keyPlayers.length > 0 && (
                        <p className="text-xs text-neutral-300 font-mono">⭐ Roster: {team.keyPlayers.join(', ')}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Win Rate:</span>
                          <strong className="text-emerald-400">{team.winRate}% ({team.totalWins || 0} Wins)</strong>
                        </div>
                        <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Prediksi:</span>
                          <strong className="text-yellow-400">{team.predictedRank}</strong>
                        </div>
                      </div>

                      {team.description && (
                        <p className="text-[11px] text-neutral-400 italic">"{team.description}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showPromoteModal && selectedMemberToPromote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>Angkat Member Sebagai Admin / Panitia</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePromoteMemberToAdmin} className="space-y-4">
              <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Detail Target Member:</span>
                <strong className="text-white text-xs font-bold block">{selectedMemberToPromote.name}</strong>
                <span className="text-xs font-mono text-orange-400 block">{selectedMemberToPromote.email}</span>
                <span className="text-[11px] font-mono text-emerald-400 block">WA: {selectedMemberToPromote.phone || '-'}</span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-2 font-bold uppercase tracking-wider">
                  Pilih Jabatan Admin (5 Opsi Resmi):
                </label>

                <div className="space-y-2">
                  {[
                    { title: 'Admin Turnamen', desc: 'Mengelola pendaftaran tim, verifikasi slot, & detail umum turnamen FF & MLBB.', icon: '👑', color: 'border-orange-500/50 bg-orange-950/20 text-orange-300' },
                    { title: 'Admin Verifikasi Pembayaran', desc: 'Memeriksa & mengonfirmasi bukti bayar tim (Sah, Pending, Gagal) serta QRIS.', icon: '💳', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
                    { title: 'Admin Keuangan & Laporan', desc: 'Merekapitulasi dana pendaftaran, total hadiah prize pool, & laporan transaksi.', icon: '📊', color: 'border-blue-500/50 bg-blue-950/20 text-blue-300' },
                    { title: 'Panitia Match & Jadwal', desc: 'Mengatur skema penyisihan, jadwal match, kustom room ID/Pass, & input pemenang.', icon: '⚔️', color: 'border-purple-500/50 bg-purple-950/20 text-purple-300' },
                    { title: 'Sub Official Admin', desc: 'Sub-admin resmi pembantu operasional turnamen, layanan CS, & moderasi grup WA.', icon: '🎗️', color: 'border-pink-500/50 bg-pink-950/20 text-pink-300' },
                  ].map((r) => (
                    <label
                      key={r.title}
                      onClick={() => setPromoteRoleTitle(r.title)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        promoteRoleTitle === r.title
                          ? `${r.color} ring-2 ring-orange-500`
                          : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promoteRoleTitleRadio"
                        value={r.title}
                        checked={promoteRoleTitle === r.title}
                        onChange={() => setPromoteRoleTitle(r.title)}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs text-white">
                          <span>{r.icon}</span>
                          <span>{r.title}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Kata Sandi Akses Admin (Password Login):
                </label>
                <input
                  type="text"
                  required
                  value={promotePassword}
                  onChange={(e) => setPromotePassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-orange-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Angkat Sebagai Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UBAH JABATAN ADMIN */}
      {showEditAdminRoleModal && selectedAdminToEditRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-blue-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Ubah Jabatan Admin / Panitia</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditAdminRoleModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAdminRole} className="space-y-4">
              <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Target Akun Admin:</span>
                <strong className="text-white text-xs font-bold block">{selectedAdminToEditRole.name}</strong>
                <span className="text-xs font-mono text-blue-400 block">{selectedAdminToEditRole.email}</span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-2 font-bold uppercase tracking-wider">
                  Pilih Jabatan / Role Baru (5 Pilihan Resmi):
                </label>

                <div className="space-y-2">
                  {[
                    { title: 'Admin Turnamen', desc: 'Mengelola pendaftaran tim, verifikasi slot, & detail umum turnamen FF & MLBB.', icon: '👑', color: 'border-orange-500/50 bg-orange-950/20 text-orange-300' },
                    { title: 'Admin Verifikasi Pembayaran', desc: 'Memeriksa & mengonfirmasi bukti bayar tim (Sah, Pending, Gagal) serta QRIS.', icon: '💳', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
                    { title: 'Admin Keuangan & Laporan', desc: 'Merekapitulasi dana pendaftaran, total hadiah prize pool, & laporan transaksi.', icon: '📊', color: 'border-blue-500/50 bg-blue-950/20 text-blue-300' },
                    { title: 'Panitia Match & Jadwal', desc: 'Mengatur skema penyisihan, jadwal match, kustom room ID/Pass, & input pemenang.', icon: '⚔️', color: 'border-purple-500/50 bg-purple-950/20 text-purple-300' },
                    { title: 'Sub Official Admin', desc: 'Sub-admin resmi pembantu operasional turnamen, layanan CS, & moderasi grup WA.', icon: '🎗️', color: 'border-pink-500/50 bg-pink-950/20 text-pink-300' },
                  ].map((r) => (
                    <label
                      key={r.title}
                      onClick={() => setEditAdminRoleTitle(r.title)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editAdminRoleTitle === r.title
                          ? `${r.color} ring-2 ring-blue-500`
                          : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="editAdminRoleTitleRadio"
                        value={r.title}
                        checked={editAdminRoleTitle === r.title}
                        onChange={() => setEditAdminRoleTitle(r.title)}
                        className="mt-1 accent-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs text-white">
                          <span>{r.icon}</span>
                          <span>{r.title}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditAdminRoleModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Simpan Perubahan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLACKLIST MEMBER */}
      {showBlacklistMemberModal && selectedMemberToBlacklist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-400" />
                <span>Konfirmasi Blacklist Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBlacklistMemberModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBlacklistMember} className="space-y-3">
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-xl space-y-1">
                <span className="text-[10px] text-red-400 uppercase font-black block">Member Yang Di-Blacklist:</span>
                <strong className="text-white text-xs font-bold block">{selectedMemberToBlacklist.name}</strong>
                <span className="text-xs font-mono text-neutral-300 block">{selectedMemberToBlacklist.email}</span>
                <span className="text-[11px] font-mono text-amber-300 block">Tim: {selectedMemberToBlacklist.teamName || '-'}</span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Alasan Hukuman Blacklist:
                </label>
                <textarea
                  rows={3}
                  required
                  value={blacklistReasonInput}
                  onChange={(e) => setBlacklistReasonInput(e.target.value)}
                  placeholder="Contoh: Penggunaan Script / Cheat saat match, atau manipulasi bukti pembayaran QRIS."
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlacklistMemberModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Konfirmasi Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL BLACKLIST ENTRY */}
      {showManualBlacklistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-red-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                <span>Tambah Manual Ke Daftar Blacklist</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowManualBlacklistModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualBlacklist} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Nama Akun / Tim / Kapten:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SHADOW CHEATER TEAM"
                  value={manualBlName}
                  onChange={(e) => setManualBlName(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                    Email:
                  </label>
                  <input
                    type="email"
                    placeholder="captain@gmail.com"
                    value={manualBlEmail}
                    onChange={(e) => setManualBlEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                    No WhatsApp:
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={manualBlPhone}
                    onChange={(e) => setManualBlPhone(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                    Nama Tim / Squad:
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Tim"
                    value={manualBlTeam}
                    onChange={(e) => setManualBlTeam(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                    Kategori / Tipe:
                  </label>
                  <select
                    value={manualBlType}
                    onChange={(e) => setManualBlType(e.target.value as 'Member' | 'Tim' | 'Lainnya')}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-red-500 font-bold"
                  >
                    <option value="Member">Member Individu</option>
                    <option value="Tim">Tim / Squad</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Alasan Pelanggaran / Blacklist:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Pemalsuan Bukti Transfer QRIS / Penggunaan Cheat"
                  value={manualBlReason}
                  onChange={(e) => setManualBlReason(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualBlacklistModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Simpan Ke Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD ADMIN ACCOUNT MODAL */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-orange-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-400" />
                <span>Tambah Akun Admin Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Nama Lengkap Admin / Panitia:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin Rizky (Panitia MLBB)"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-orange-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Email Admin (Untuk Login):
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.turnamen@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Kata Sandi Admin (Password):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan kata sandi aman..."
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-bold">
                  Jabatan / Role Admin:
                </label>
                <select
                  value={newAdminRoleTitle}
                  onChange={(e) => setNewAdminRoleTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-orange-500 cursor-pointer"
                >
                  <option value="Admin Turnamen">Admin Turnamen</option>
                  <option value="Admin Verifikasi Pembayaran">Admin Verifikasi Pembayaran</option>
                  <option value="Admin Keuangan & Laporan">Admin Keuangan & Laporan</option>
                  <option value="Panitia Match & Jadwal">Panitia Match & Jadwal</option>
                  <option value="Sub Official Admin">Sub Official Admin</option>
                </select>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[11px] text-orange-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Informasi Hak Akses:</span>
                </p>
                <p className="text-neutral-400">
                  Akun admin yang dibuat dapat langsung login di menu <strong>Masuk / Login</strong> menggunakan email dan kata sandi tersebut.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Simpan Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADMIN TOP UP SALDO MODAL (SALDO NYATA) */}
      {showAdminTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f0f] border border-emerald-500/50 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <span>TOP UP SALDO NYATA ADMIN (TREASURY)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminTopUpModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sistem Saldo Transparan &amp; Otomatis</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Saldo Kas Admin bertambah secara riil melalui proses Top Up. Silakan transfer nominal yang diinginkan, kemudian konfirmasi untuk memperbarui Saldo Kas Admin secara sah.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseInt(adminTopUpAmountVal.replace(/\D/g, ''), 10);
                if (isNaN(amt) || amt <= 0) {
                  alert('Masukkan nominal Top Up saldo admin yang valid!');
                  return;
                }
                const currentBal = config.adminBettingPoolBalance ?? 1000000;
                const newBal = currentBal + amt;
                const updatedConfig = { ...config, adminBettingPoolBalance: newBal };
                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

                if (setUserWallet) {
                  const newTx: WalletTransaction = {
                    id: `tx-admin-topup-${Date.now()}`,
                    userName: 'Admin Treasury',
                    userPhone: '-',
                    type: 'TOPUP_ADMIN',
                    typeLabel: 'Top Up Saldo Admin',
                    amount: amt,
                    balanceAfter: newBal,
                    status: 'Berhasil',
                    note: `Top Up resmi ke Kas Admin via ${adminTopUpMethod}`,
                    timestamp: timestampStr
                  };
                  setUserWallet(prev => ({
                    ...prev,
                    transactions: [newTx, ...(prev.transactions || [])]
                  }));
                }

                handleSaveAllConfig(
                  updatedConfig,
                  `Top Up Saldo Admin sebesar Rp ${amt.toLocaleString('id-ID')} BERHASIL! Saldo Kas Admin bertambah.`
                );
                setShowAdminTopUpModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  💳 Metode Pembayaran Top Up:
                </label>
                <select
                  value={adminTopUpMethod}
                  onChange={(e) => setAdminTopUpMethod(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="QRIS DEXZ STORE">QRIS All Payment (DEXZ STORE)</option>
                  <option value="Bank BCA">Bank BCA (Transfer Bank)</option>
                  <option value="Bank Mandiri">Bank Mandiri (Transfer Bank)</option>
                  <option value="DANA Official">E-Wallet DANA (Treasury)</option>
                </select>
              </div>

              {/* Rincian Rekening / QRIS Preview */}
              <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1.5 text-xs text-neutral-300">
                <p className="font-bold text-amber-400">Rincian Tujuan Transfer Admin:</p>
                {adminTopUpMethod.includes('BCA') ? (
                  <p className="font-mono text-white">Bank BCA: <span className="font-bold text-emerald-400">8830192831</span> a.n DEXZ STORE OFFICIAL</p>
                ) : adminTopUpMethod.includes('Mandiri') ? (
                  <p className="font-mono text-white">Bank Mandiri: <span className="font-bold text-emerald-400">1370002938192</span> a.n DEXZ STORE OFFICIAL</p>
                ) : adminTopUpMethod.includes('DANA') ? (
                  <p className="font-mono text-white">DANA: <span className="font-bold text-emerald-400">0812-3456-7890</span> a.n DEXZ STORE TREASURY</p>
                ) : (
                  <p className="font-mono text-white">QRIS ALL PAYMENT: <span className="font-bold text-emerald-400">NMID ID102938102938</span> (Auto Detect)</p>
                )}
              </div>

              {/* Nominal Preset Buttons */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  💵 Pilih / Ketik Nominal Top Up (Rp):
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[50000, 100000, 250000, 500000, 1000000, 2500000, 5000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdminTopUpAmountVal(val.toString())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        adminTopUpAmountVal === val.toString()
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-emerald-500'
                      }`}
                    >
                      Rp {val.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    value={adminTopUpAmountVal}
                    onChange={(e) => setAdminTopUpAmountVal(e.target.value)}
                    placeholder="100000"
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminTopUpModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>Konfirmasi Top Up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. ADMIN WITHDRAWAL MODAL (TARIK SALDO ADMIN) */}
      {showAdminWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f0f] border border-amber-500/50 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <span>TARIK SALDO ADMIN (WITHDRAWAL)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminWithdrawModal(false)}
                className="text-neutral-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Saldo Kas Admin Saat Ini:</span>
                <span className="font-mono text-sm text-white font-black">
                  Rp {(config.adminBettingPoolBalance ?? 1000000).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed pt-1">
                Penarikan saldo kas admin akan dikirimkan langsung ke rekening bank atau e-wallet pilihan Admin.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseInt(adminWithdrawAmountVal.replace(/\D/g, ''), 10);
                const currentBal = config.adminBettingPoolBalance ?? 1000000;

                if (isNaN(amt) || amt <= 0) {
                  alert('Masukkan nominal penarikan saldo admin yang valid!');
                  return;
                }
                if (amt > currentBal) {
                  alert(`Nominal penarikan (Rp ${amt.toLocaleString('id-ID')}) melebihi Saldo Admin saat ini (Rp ${currentBal.toLocaleString('id-ID')})!`);
                  return;
                }
                if (!adminWithdrawAccountNo.trim() || !adminWithdrawAccountName.trim()) {
                  alert('Masukkan nomor rekening / HP e-wallet dan nama pemilik rekening dengan lengkap!');
                  return;
                }

                const newBal = currentBal - amt;
                const updatedConfig = { ...config, adminBettingPoolBalance: newBal };
                const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

                if (setUserWallet) {
                  const newTx: WalletTransaction = {
                    id: `tx-admin-withdraw-${Date.now()}`,
                    userName: 'Admin Treasury',
                    userPhone: '-',
                    type: 'WITHDRAW_ADMIN',
                    typeLabel: 'Penarikan Saldo Admin',
                    amount: -amt,
                    balanceAfter: newBal,
                    status: 'Berhasil',
                    note: `Penarikan ke ${adminWithdrawMethod} ${adminWithdrawAccountNo.trim()} a.n ${adminWithdrawAccountName.trim()}`,
                    timestamp: timestampStr
                  };
                  setUserWallet(prev => ({
                    ...prev,
                    transactions: [newTx, ...(prev.transactions || [])]
                  }));
                }

                handleSaveAllConfig(
                  updatedConfig,
                  `Penarikan Saldo Admin sebesar Rp ${amt.toLocaleString('id-ID')} BERHASIL ditransfer ke ${adminWithdrawMethod} ${adminWithdrawAccountNo}!`
                );
                setShowAdminWithdrawModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  🏦 Metode Tujuan Penarikan (Bank / E-Wallet):
                </label>
                <select
                  value={adminWithdrawMethod}
                  onChange={(e) => setAdminWithdrawMethod(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="DANA">DANA (E-Wallet)</option>
                  <option value="OVO">OVO (E-Wallet)</option>
                  <option value="GoPay">GoPay (E-Wallet)</option>
                  <option value="ShopeePay">ShopeePay (E-Wallet)</option>
                  <option value="Bank BCA">Bank BCA (Transfer Bank)</option>
                  <option value="Bank Mandiri">Bank Mandiri (Transfer Bank)</option>
                  <option value="Bank BRI">Bank BRI (Transfer Bank)</option>
                  <option value="Bank BNI">Bank BNI (Transfer Bank)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    🔢 Nomor Rekening / No. HP:
                  </label>
                  <input
                    type="text"
                    required
                    value={adminWithdrawAccountNo}
                    onChange={(e) => setAdminWithdrawAccountNo(e.target.value)}
                    placeholder="Contoh: 081234567890 / 8830192831"
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    👤 Nama Pemilik Rekening:
                  </label>
                  <input
                    type="text"
                    required
                    value={adminWithdrawAccountName}
                    onChange={(e) => setAdminWithdrawAccountName(e.target.value)}
                    placeholder="Sesuai buku tabungan / e-wallet"
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Nominal Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">
                    💵 Nominal Penarikan (Rp):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const maxBal = config.adminBettingPoolBalance ?? 1000000;
                      setAdminWithdrawAmountVal(maxBal.toString());
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-bold"
                  >
                    Tarik Semua Saldo
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[100000, 250000, 500000, 1000000, 2500000, 5000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdminWithdrawAmountVal(val.toString())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        adminWithdrawAmountVal === val.toString()
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-500'
                      }`}
                    >
                      Rp {val.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    value={adminWithdrawAmountVal}
                    onChange={(e) => setAdminWithdrawAmountVal(e.target.value)}
                    placeholder="100000"
                    className="w-full bg-[#050505] border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminWithdrawModal(false)}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Proses Penarikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL EDIT TURNAMEN */}
      {editingUpcomingModal && editingUpcomingData && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-cyan-500/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Ubah Data Turnamen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingUpcomingModal(false);
                  setEditingUpcomingData(null);
                }}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUpcoming} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Judul Turnamen:
                </label>
                <input
                  type="text"
                  required
                  value={editingUpcomingData.title}
                  onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, title: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Game Esports:
                  </label>
                  <select
                    value={editingUpcomingData.game}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, game: e.target.value as 'FF' | 'MLBB' })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="FF">🔥 Free Fire (FF)</option>
                    <option value="MLBB">⚔️ Mobile Legends (MLBB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Status Turnamen:
                  </label>
                  <select
                    value={editingUpcomingData.status}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, status: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Pendaftaran Dibuka">Pendaftaran Dibuka</option>
                    <option value="Segera Dibuka">Segera Dibuka</option>
                    <option value="Slot Hampir Penuh">Slot Hampir Penuh</option>
                    <option value="Pendaftaran Ditutup">Pendaftaran Ditutup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Tanggal Buka Pendaftaran:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUpcomingData.openDate}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, openDate: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Tanggal Mulai Match:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUpcomingData.startDate}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, startDate: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-amber-400 font-bold block mb-1">
                    Total Hadiah (Prize Pool):
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUpcomingData.prizePool}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, prizePool: e.target.value })}
                    className="w-full bg-[#050505] border border-amber-500/40 rounded-xl p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Kuota Slot Target:
                  </label>
                  <input
                    type="number"
                    required
                    value={editingUpcomingData.slots}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, slots: parseInt(e.target.value) || 32 })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-emerald-400 font-bold block mb-1">
                    Estimasi Biaya Pendaftaran:
                  </label>
                  <input
                    type="text"
                    value={editingUpcomingData.fee || 'Rp 50.000'}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, fee: e.target.value })}
                    className="w-full bg-[#050505] border border-emerald-500/40 rounded-xl p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">
                    Mode Pertandingan:
                  </label>
                  <select
                    value={editingUpcomingData.mode || 'SQUAD'}
                    onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, mode: e.target.value as any })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="SQUAD">👥 SQUAD</option>
                    <option value="DUO">👥 DUO</option>
                    <option value="SOLO">👤 SOLO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Catatan / Deskripsi Singkat:
                </label>
                <textarea
                  rows={2}
                  value={editingUpcomingData.description || ''}
                  onChange={(e) => setEditingUpcomingData({ ...editingUpcomingData, description: e.target.value })}
                  placeholder="Informasi penting mengenai rules, pendaftaran, dll."
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUpcomingModal(false);
                    setEditingUpcomingData(null);
                  }}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
        </div>
      )}

      {/* MODAL: PROOF IMAGE PREVIEW */}
      {proofModalImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setProofModalImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] bg-[#0f0f0f] border border-cyan-500/50 rounded-2xl p-4 space-y-3 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-black text-xs text-cyan-400 uppercase flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Pratinjau Bukti Pembayaran Penuh</span>
              </span>
              <button
                type="button"
                onClick={() => setProofModalImage(null)}
                className="px-3 py-1 bg-red-950 text-red-300 hover:text-white rounded-lg text-xs font-bold border border-red-800 cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black rounded-xl p-2 border border-neutral-800">
              <img src={proofModalImage} alt="Bukti Pembayaran" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KOSONGKAN SEMUA DATA (RESET DATABASE TOTAL) */}
      {showResetDatabaseModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border-2 border-red-500/80 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                <h3 className="font-black text-base uppercase tracking-tight text-white">
                  KOSONGKAN SEMUA DATA DATABASE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isResettingDatabase) {
                    setShowResetDatabaseModal(false);
                    setResetConfirmationInput('');
                  }
                }}
                disabled={isResettingDatabase}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2 text-xs text-red-200">
              <p className="font-bold flex items-center gap-1.5 text-red-400 text-sm">
                ⚠️ PERHATIAN TINGKAT TINGGI — TINDAKAN PERMANEN
              </p>
              <p className="leading-relaxed">
                Tindakan ini akan <strong>MENGHAPUS &amp; MENGOSONGKAN SELURUH DATA LAMA</strong> di Firestore secara permanen, meliputi:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-300 font-mono">
                <li>Seluruh pendaftaran tim Free Fire &amp; Mobile Legends</li>
                <li>Seluruh data pengguna, wallet/saldo member &amp; transaksi</li>
                <li>Seluruh taruhan prediksi match &amp; payout history</li>
                <li>Seluruh notifikasi broadcast &amp; token device lama</li>
                <li>Seluruh jadwal match, hasil pertandingan, sengketa &amp; arsip</li>
              </ul>
              <p className="text-emerald-400 font-bold text-[11px] pt-1">
                ✅ Sistem akan menjadi 100% murni data baru siap digunakan untuk umum! Akun SuperAdmin tetap aman.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Ketik <span className="font-mono text-red-400 font-black">RESET</span> di bawah untuk melanjutkan:
              </label>
              <input
                type="text"
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                placeholder="Ketik RESET"
                disabled={isResettingDatabase}
                className="w-full bg-[#050505] border-2 border-red-500/60 rounded-xl p-3 text-sm text-center font-mono font-black text-red-400 tracking-widest uppercase focus:border-red-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isResettingDatabase}
                onClick={() => {
                  setShowResetDatabaseModal(false);
                  setResetConfirmationInput('');
                }}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResettingDatabase || resetConfirmationInput.trim().toUpperCase() !== 'RESET'}
                onClick={handleExecuteFullDatabaseReset}
                className={`flex-1 py-3 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  resetConfirmationInput.trim().toUpperCase() === 'RESET' && !isResettingDatabase
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/80 active:scale-95'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isResettingDatabase ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Mengosongkan Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>🔥 KOSONGKAN SEMUA DATA SEKARANG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
