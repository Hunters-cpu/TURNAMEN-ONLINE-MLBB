export type TabType = 
  | 'beranda'
  | 'semua-turnamen'
  | 'ff'
  | 'mlbb'
  | 'total-hadiah'
  | 'pengumuman'
  | 'riwayat'
  | 'status-pembayaran'
  | 'form-pendaftaran'
  | 'pengaturan-umum'
  | 'bantuan'
  | 'arsip'
  | 'bagikan'
  | 'cara-daftar'
  | 'aturan'
  | 'tim'
  | 'info-match'
  | 'grup'
  | 'laporan'
  | 'kontak'
  | 'login'
  | 'profil'
  | 'prediksi'
  | 'saldo'
  | 'admin'
  | 'topup-game'
  | 'unduh-apk'
  | 'donasi'
  | 'gemini-ai'
  | 'workspace-google'
  | 'bridge-website';

export interface ConnectionTarget {
  id: string;
  destinationName: string; // Nama Situs Tujuan
  destinationUrl: string; // Alamat Lengkap Situs URL
  masterKey: string; // Kunci Sambungan UTAMA (Exact matching)
  allowedTypes: {
    photos: boolean;
    videos: boolean;
    documents: boolean;
    all: boolean;
  };
  maxFileSizeMb: number; // Max size per file, default 500 MB
  status: 'MENUNGGU_PERSETUJUAN' | 'TERHUBUNG_AKTIF' | 'DITOLAK_TIDAK_SAH' | 'TERPUTUS';
  keyValidationStatus: 'COCOK_SAH' | 'TIDAK_COCOK' | 'DITOLAK';
  createdAt: string;
  createdAtTimestamp: number;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  lastDispatchedAt?: string;
  lastDispatchedFileName?: string;
  totalDispatchedCount: number;
  successfulDispatchedCount: number;
  notes?: string;
}

export interface AutoDispatchRecord {
  id: string;
  timestamp: string;
  timestampMs: number;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  category: 'Foto' | 'Video' | 'Dokumen' | 'Semua';
  sourceOrigin: string; // e.g. "https://hunters-esports.com" / "Turnamen Hunters Community"
  targetDestinationId: string;
  targetDestinationName: string;
  targetUrl: string;
  status: 'TERKIRIM' | 'GAGAL' | 'DITUNDA_BELUM_DISETUJUI' | 'DITOLAK_UKURAN' | 'DITOLAK_JENIS';
  statusMessage: string;
  latencyMs?: number;
  details?: string;
}

export interface AutoDispatchSystemConfig {
  targets: ConnectionTarget[];
  dispatchHistory: AutoDispatchRecord[];
  isAutoFanOutActive: boolean;
  defaultMaxSizeMb: number;
}

export interface WebsiteBridgeLog {
  id: string;
  timestamp: string;
  type: 'TEST_CONNECTION' | 'FOTO_MEDIA' | 'VIDEO' | 'BUKTI_PEMBAYARAN' | 'FILE_DATA' | 'AUTO_DISPATCH';
  typeLabel: string;
  targetUrl: string;
  itemName: string;
  fileType?: string;
  fileSize?: string;
  status: 'BERHASIL' | 'GAGAL' | 'PENDING';
  httpStatus?: number;
  responseMessage?: string;
  latencyMs?: number;
  payloadSummary?: string;
}

export interface WebsiteBridgeConfig {
  isEnabled: boolean;
  targetWebsiteUrl: string; // e.g. "https://website-tujuan.com/api/webhook" or "https://receiver-app.com"
  bridgeName?: string; // e.g. "Website Cabang & Webhook Hub"
  secretKey?: string; // Optional API key / Authorization token sent in headers
  isConnected: boolean;
  lastConnectedAt?: string;
  lastPingStatus?: 'ONLINE' | 'OFFLINE' | 'IDLE';
  lastPingLatency?: number;
  
  // Auto-sync flags (Real automatic dispatch when events occur)
  autoSendPaymentProof: boolean; // Otomatis kirim bukti transfer & pembayaran baru
  autoSendPhotosMedia: boolean;  // Otomatis kirim foto banner, avatar, dokumentasi
  autoSendVideos: boolean;       // Otomatis kirim video rekaman / link video
  autoSendFilesData: boolean;    // Otomatis kirim data tim, backup JSON, & berkas
  
  // Custom headers / format
  payloadFormat: 'JSON_FULL' | 'MULTIPART_COMPATIBLE' | 'WEBHOOK_STANDARD';
  
  // Activity history
  logs: WebsiteBridgeLog[];
}

export interface DonationRecord {
  id: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  message?: string;
  paymentMethod: 'Saweria QRIS';
  status: 'BERHASIL' | 'GAGAL' | 'MENUNGGU_VERIFIKASI';
  createdAt: string;
  timestamp: number;
}

export type UserRole = 'guest' | 'peserta' | 'admin';

export interface WalletTransaction {
  id: string;
  userName: string;
  userPhone: string;
  type: 'TOPUP' | 'WITHDRAW' | 'BET_PLACED' | 'BET_WON' | 'BET_LOST' | 'ADMIN_ADJUST' | 'REFUND' | 'TOPUP_ADMIN' | 'WITHDRAW_ADMIN';
  typeLabel: string;
  amount: number; // positive or negative
  balanceAfter: number;
  status: 'Pending' | 'Berhasil' | 'Gagal';
  note?: string;
  referenceId?: string;
  timestamp: string;
}

export interface UserWallet {
  balance: number; // SALDO UTAMA TERPUSAT (SATU PUSAT DATA BERSAMA)
  topUpHistory: TopUpRequest[];
  withdrawalHistory: WithdrawalRequest[];
  transactions?: WalletTransaction[];
}

export interface TopUpRequest {
  id: string;
  userId?: string;
  userName: string;
  userPhone: string;
  amount: number;
  paymentProofUrl?: string;
  status: 'Pending' | 'Berhasil' | 'Gagal';
  requestedAt: string;
  processedAt?: string;
  note?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId?: string;
  userName: string;
  userPhone: string;
  amount: number;
  method: string; // e.g. "BCA", "BRI", "Mandiri", "BNI", "DANA", "OPO", "GoPay", "ShopeePay", "QRIS"
  accountNumber: string;
  accountName: string;
  status: 'Pending' | 'Berhasil' | 'Gagal';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface MatchPredictionBet {
  id: string;
  matchId: string;
  matchTitle: string; // e.g. "Team A vs Team B"
  game: 'FF' | 'MLBB';
  userName: string;
  userPhone: string;
  pickedTeam: string; // Team chosen
  betAmount: number;
  paymentMethod: 'saldo' | 'qris';
  paymentProofUrl?: string;
  status: 'Pending' | 'Dikonfirmasi' | 'Menang' | 'Kalah' | 'Dibatalkan';
  placedAt: string;
  potentialPayout: number;
  settledAt?: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  os: string;
  browser: string;
  screenRes: string;
  userAgent: string;
  lastLogin: string;
  isNotificationEnabled: boolean;
  notificationPermission: 'granted' | 'denied' | 'default';
}

export interface PlayerTournamentRecord {
  id: string;
  tournamentId?: string;
  tournamentTitle: string;
  game: 'FF' | 'MLBB';
  teamName: string;
  roleInTeam?: string; // 'Kapten' | 'Rusher' | 'Sniper' | 'Jungler' | 'Roamer' | etc.
  slotNumber?: number;
  date: string;
  status: 'Sah' | 'Menunggu Pembayaran' | 'Selesai' | 'Gagal';
  achievement?: string; // 'Juara 1 🏆' | 'Juara 2 🥈' | 'Juara 3 🥉' | 'Top 4' | 'Top 8' | 'Partisipan'
  kills?: number;
  matchScore?: string;
  certificateUrl?: string;
  notes?: string;
}

export interface UserAccount {
  id?: string;
  name: string;
  username?: string;
  nickname?: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  googleId?: string;
  isSuperAdmin?: boolean;
  status?: 'Active' | 'Blacklisted';
  teamName?: string;
  registeredAt?: string;
  deviceInfo?: DeviceInfo;
  failedAttempts?: number;
  isLocked?: boolean;
  lockUntil?: string;
  resetCode?: string;
  userKey?: string;
  // Gamer Profile Fields
  bio?: string;
  ffId?: string;
  ffNickname?: string;
  mlbbId?: string;
  mlbbServerId?: string;
  mlbbNickname?: string;
  primaryGame?: 'FF' | 'MLBB' | 'Semua';
  primaryRole?: string;
  city?: string;
  instagram?: string;
  balance?: number;
  customBadges?: string[];
  tournamentHistory?: PlayerTournamentRecord[];
}

export interface BlacklistEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  teamName?: string;
  reason: string;
  blacklistedAt: string;
  type: 'Member' | 'Tim' | 'Lainnya';
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  isSuperAdmin?: boolean;
  roleTitle?: string;
  createdAt: string;
}

export interface RegisteredTeam {
  id: string;
  slotNumber: number;
  game: 'FF' | 'MLBB';
  teamName: string;
  captainName: string;
  captainPhone: string;
  roster: string[];
  members?: string[];
  registeredAt: string;
  status: 'Sah' | 'Menunggu Pembayaran' | 'Gagal';
  roomCode?: string;
  roomPass?: string;
  customPassword?: string;
  captainPin?: string;
  failedAt?: string;
  paymentMethod?: string;
  paymentProvider?: string;
  paymentProofUrl?: string;
  paymentSenderName?: string;
  paymentAmount?: string;
  paymentNotes?: string;
  paymentSubmittedAt?: string;
}

export interface TournamentInfo {
  game: 'FF' | 'MLBB';
  title: string;
  fee: string;
  maxSlots: number;
  deadline: string;
  status: string;
  bannerImage: string;
  totalPrize?: string;
  tournamentStage?: string;
  matchDates?: string;
  matchTime?: string;
  formatRules?: string;
  defaultRoomId?: string;
  defaultRoomPass?: string;
  liveStreamUrl?: string;
  prize1st?: string;
  prize2nd?: string;
  prize3rd?: string;
  prizeMvp?: string;
  announcementNote?: string;
  organizerContact?: string;
  isLiveNow?: boolean;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
}

export interface RuleCategory {
  title: string;
  icon: string;
  rules: string[];
  type?: 'positive' | 'negative' | 'neutral';
}

export interface CommunityGroup {
  id: string;
  title?: string;
  name?: string;
  game: string;
  link: string;
  description: string;
  iconColor?: string;
  memberCount?: string;
}

export interface MatchSchedule {
  id: string;
  game: 'FF' | 'MLBB';
  phase: string; // 'Babak Penyisihan' | 'Babak 16 Besar' | 'Perempat Final' | 'Semifinal' | 'Perebutan Juara 3' | 'Grand Final'
  matchNumber: number;
  day?: string; // e.g. "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
  date: string; // e.g. "2 September 2026"
  time: string; // e.g. "19:00 WIB"
  teamA?: string;
  teamB?: string;
  winner?: string; // Team name of winner
  roomCode?: string;
  roomPass?: string;
  status: 'selesai' | 'berlangsung' | 'segera_dimulai' | 'mendatang' | string;
  scoreA?: number;
  scoreB?: number;
  roomId?: string;
  roomPassword?: string;
  youtubeStreamUrl?: string;
  bracketRound?: number;
  bracketSlotIndex?: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  teamName: string;
  game: string;
  amount: number;
  method: string;
  status: 'Terverifikasi' | 'Proses';
}

export interface ContactInfo {
  address: string;
  hours: string;
  instagram: string;
  tiktok: string;
}

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  category?: 'Sosmed' | 'Donasi' | 'Lainnya' | string;
  description?: string;
  badge?: string;
}

export interface HomeConfig {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  organizerTitle: string;
  organizerSubtitle: string;
  // Social media & donation links
  tiktokUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  donationUrl?: string;
  donationTitle?: string;
  donationDescription?: string;
  // Custom links list
  customLinks?: CustomLink[];

  // 📺 LIVE STREAM SYSTEM (YOUTUBE & TIKTOK LIVE)
  youtubeLiveStatus?: 'LIVE' | 'OFFLINE';
  youtubeLiveVideoUrl?: string;
  youtubeLiveTitle?: string;
  youtubeChannelName?: string;
  youtubeChannelUrl?: string;

  tiktokLiveStatus?: 'LIVE' | 'OFFLINE';
  tiktokLiveVideoUrl?: string;
  tiktokLiveTitle?: string;
  tiktokAccountName?: string;
  tiktokAccountUrl?: string;

  liveBroadcastNote?: string;
  liveAutoMonitorEnabled?: boolean;
}

export interface PrizePoolConfig {
  feePerSlot: number; // Biaya pendaftaran per slot (misal: 50000)
  totalSlots: number; // Jumlah slot (misal: 32)
  adminFee: number; // Biaya admin yang dipotong (misal: 160000 = 10%)
  adminFeePercent?: number; // Persentase biaya admin (misal: 10%)
  juara1Percent: number; // 50 (%)
  juara2Percent: number; // 30 (%)
  juara3Percent: number; // 20 (%)
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Info Penting' | 'Perubahan Jadwal' | 'Pengingat' | 'Umum' | string;
  isImportant?: boolean;
  isUrgent?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | string;
  targetAudience?: 'Semua Kapten & Member' | 'Kapten Free Fire' | 'Kapten MLBB' | 'Kapten Spesifik' | string;
  targetTeamId?: string;
  targetTeamName?: string;
  targetCaptainName?: string;
  targetCaptainPhone?: string;
  targetGame?: 'FF' | 'MLBB' | 'Semua' | string;
  deviceSentCount?: number;
}

export interface RegistrationFormConfig {
  isFormOpen: boolean;
  targetEmail: string;
  customInstructions: string;
  successMessage: string;
}

export interface ShareConfig {
  promoTitle: string;
  promoText: string;
}

export interface HelpItem {
  id: string;
  title: string;
  content: string;
}

export type DeletedItemType = 'pendaftaran' | 'aturan' | 'admin' | 'member';

export interface DeletedItem {
  id: string;
  type: DeletedItemType;
  title: string;
  subtitle?: string;
  deletedAt: string;
  data: any;
}

export interface EwalletProvider {
  id: string;
  name: string;
  number: string;
  holder: string;
  enabled: boolean;
  appLink: string;
}

export interface BankProvider {
  id: string;
  name: string;
  code: string;
  number: string;
  holder: string;
  enabled: boolean;
  appLink: string;
}

export interface AdminAuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  category: 'FF_REGISTRATION' | 'MLBB_REGISTRATION' | 'UPCOMING_TOURNAMENT' | 'FEATURE_RECOMMENDATION' | 'TOPUP' | 'BET_UNPAID' | 'WITHDRAWAL' | 'ATTENDANCE' | 'DISPUTE' | 'GENERAL';
  categoryLabel: string;
  itemId: string;
  itemTitle: string;
  previousStatus: string;
  newStatus: string;
  rejectionReason?: string;
  adminNotes?: string;
  timestamp: string;
  createdAt: number;
}

export interface CustomPaymentType {
  id: string;
  name: string;
  description?: string;
  amount: number;
  qrisImageUrl?: string;
  isEnabled: boolean;
  category?: string;
  createdAt: string;
}

export interface CustomPaymentTransaction {
  id: string;
  paymentTypeId: string;
  paymentTypeName: string;
  amount: number;
  userName: string;
  userPhone: string;
  paymentProofUrl?: string;
  note?: string;
  status: 'Menunggu Konfirmasi' | 'Sah' | 'Ditolak';
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PaymentMethodsConfig {
  qrisEnabled: boolean;
  qrisNmid: string;
  qrisHolder: string;
  qrisImageUrl?: string;

  // 6 Core Dedicated Payment QRIS & Nominal Settings
  feeFf: number;
  qrisFfImageUrl?: string;

  feeMlbb: number;
  qrisMlbbImageUrl?: string;

  feeUpcoming: number;
  qrisUpcomingImageUrl?: string;

  feeRecommendation: number;
  qrisRecommendationImageUrl?: string;

  minBetAmount: number;
  maxBetAmount: number;
  qrisBetImageUrl?: string;

  customPaymentTypes?: CustomPaymentType[];
  customPaymentTransactions?: CustomPaymentTransaction[];

  // Additional Payment Settings
  minTopUpAmount: number;
  qrisTopupImageUrl?: string;
  qrisDonationImageUrl?: string;

  ewalletEnabled: boolean;
  ewalletProviders: EwalletProvider[];

  bankEnabled: boolean;
  bankProviders: BankProvider[];
}

export interface WaBotLog {
  id: string;
  timestamp: string;
  type: 'INFO_GRUP' | 'PERUBAHAN_JADWAL' | 'PENGINGAT_MATCH' | 'STATUS_SAH';
  typeLabel: string;
  recipientName: string;
  recipientPhoneOrGroup: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
}

export interface WaBotConfig {
  isConnected: boolean;
  botPhoneNumber: string;
  botName: string;
  connectedSince?: string;
  batteryLevel?: number;
  autoSendVerifiedSah: boolean;
  templateSah: string;
  templateJadwal: string;
  templateMatch: string;
  templateInfo: string;
  logs: WaBotLog[];
}

export interface AttendanceConfirmation {
  id: string;
  matchId: string;
  teamName: string;
  status: 'SIAP' | 'BELUM_SIAP';
  reason?: string;
  swapRequestedWith?: string;
  swapStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  hasChosen: boolean;
  createdAt: string;
}

export interface MatchResultRecord {
  id: string;
  matchId: string;
  game: 'FF' | 'MLBB';
  phase: string;
  winningTeam: string;
  losingTeam: string;
  losingStatus: 'GUGUR';
  eliminationReason: 'DISKUALIFIKASI' | 'KALAH_BERTANDING' | 'MENGUNDURKAN_DIRI';
  customReason?: string;
  score?: string;
  createdAt: string;
}

export interface RegistrationChangeRequest {
  id: string;
  teamName: string;
  game: 'FF' | 'MLBB';
  captainPhone: string;
  changeType: 'NAMA_TIM' | 'SUSUNAN_PEMAIN' | 'KONTAK' | string;
  oldData: string;
  newData: string;
  status: 'PENDING' | 'DISETUJUI' | 'DITOLAK';
  adminNote?: string;
  createdAt: string;
}

export interface MatchDispute {
  id: string;
  matchId: string;
  game: 'FF' | 'MLBB';
  reporterTeam: string;
  opponentTeam: string;
  issueDescription: string;
  evidenceUrl?: string;
  status: 'DIPROSES' | 'DIKABULKAN' | 'DITOLAK';
  adminNotes?: string;
  createdAt: string;
}

export interface FeaturedTeam {
  id: string;
  name: string;
  game: 'FF' | 'MLBB';
  winRate: number;
  totalWins: number;
  keyPlayers: string[];
  description: string;
  predictedRank: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format e.g. "2026-09-02" or "2 September 2026"
  time?: string; // e.g. "19:00 WIB"
  game?: 'FF' | 'MLBB' | 'Semua' | string;
  type: 'JADWAL_MATCH' | 'TURNAMEN_MENDATANG' | 'PENDAFTARAN_DIBUKA' | 'PENDAFTARAN_DITUTUP' | 'ACARA_LAIN' | string;
  description?: string;
  badgeColor?: string;
}

export interface UpcomingTournament {
  id: string;
  title: string;
  game: 'FF' | 'MLBB';
  openDate: string;
  startDate: string;
  closeDate?: string;
  prizePool: string;
  slots: number;
  registeredCount: number;
  status: 'Pendaftaran Dibuka' | 'Segera Dibuka' | 'Slot Hampir Penuh' | 'Pendaftaran Ditutup' | string;
  isRegistrationOpen?: boolean;
  fee?: string;
  mode?: 'SQUAD' | 'DUO' | 'SOLO' | string;
  description?: string;
  bannerImage?: string;
}

export interface FeatureRecommendation {
  id: string;
  userName: string;
  featureText: string;
  fee: number;
  paymentStatus: 'LUNAS' | 'MENUNGGU_VERIFIKASI';
  status: 'MENUNGGU_KONFIRMASI' | 'DIPROSES' | 'TIDAK_DAPAT_DIPROSES' | 'BERHASIL_DITAMBAHKAN' | 'DITOLAK';
  adminReason?: string;
  createdAt: string;
}

export interface ArchivedTeamInfo {
  teamName: string;
  captainName?: string;
  captainPhone?: string;
  game?: string;
  finalRank?: string;
  phaseReached?: string;
  archivedAt?: string;
}

export interface TournamentArchive {
  id: string;
  tournamentName: string;
  game: 'FF' | 'MLBB' | 'Semua' | string;
  startDate: string;
  endDate: string;
  totalTeams: number;
  championJuara1?: string;
  runnerUpJuara2?: string;
  thirdPlaceJuara3?: string;
  fourthPlaceRank4?: string;
  archivedAt: string;
  teamsList: ArchivedTeamInfo[];
}

export interface SaweriaTransaction {
  id: string;
  type: 'FF_REGISTRATION' | 'MLBB_REGISTRATION' | 'TOPUP' | 'FEATURE_RECOMMENDATION' | 'DONATION';
  typeLabel: string;
  amount: number;
  payerName: string;
  payerPhone?: string;
  message?: string;
  status: 'BERHASIL' | 'GAGAL' | 'PENDING' | 'MENUNGGU_VERIFIKASI';
  referenceId?: string;
  saweriaRef?: string;
  createdAt: string;
  timestamp: number;
}

export interface SaweriaWithdrawalRecord {
  id: string;
  amount: number;
  targetMethod: string; // 'BCA' | 'BRI' | 'DANA' | 'GOPAY' etc
  accountNumber: string;
  accountName: string;
  withdrawnAt: string;
  timestamp: number;
  status: 'BERHASIL';
  note?: string;
}

export interface SaweriaConfig {
  username: string; // 'Hntrs'
  saweriaUrl: string; // 'https://saweria.co/Hntrs'
  webhookUrl: string; // 'https://pusat-turnamen-hunters-community.ai.studio/api/saweria-pembayaran'
  withdrawnAmount: number;
  withdrawalHistory?: SaweriaWithdrawalRecord[];
  transactions?: SaweriaTransaction[];
  lastWebhookPing?: string;
}

export type MusicSourceType = 'upload' | 'youtube' | 'spotify' | 'soundcloud' | 'direct_link';

export type MusicWidgetPosition = 'bottom-right' | 'top-right' | 'hidden';

export interface BackgroundMusicTrack {
  id: string;
  title: string;
  url: string; // base64 data URL, streaming audio URL, or external link
  sourceType: MusicSourceType;
  originalUrl?: string;
  embedUrl?: string;
  youtubeVideoId?: string;
  spotifyType?: 'track' | 'album' | 'playlist' | 'artist';
  spotifyId?: string;
  artist?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  duration?: string; // e.g. "03:45"
  hideVideo?: boolean; // For YouTube: Audio only mode
  uploadedBy?: string;
  uploadedAt: string;
}

export interface BackgroundMusicConfig {
  isEnabled: boolean;
  activeTrackId?: string;
  tracks: BackgroundMusicTrack[];
  defaultVolume: number; // 0 to 100 (percentage)
  autoPlayOnLoad: boolean; // whether to attempt autoplay on initial page load
  loop: boolean;
  hideVideo?: boolean; // Audio only / hide video for YouTube
  showTitle?: boolean; // show track title below widget
  widgetPosition?: MusicWidgetPosition; // 'bottom-right' | 'top-right' | 'hidden'
}

export interface OperatingHoursConfig {
  openTime: string; // e.g. "08:00"
  closeTime: string; // e.g. "22:00"
  timezone: string; // e.g. "WIB"
  workDays: string; // e.g. "Setiap Hari (Senin - Minggu)"
  adminStatus: 'ONLINE' | 'BUSY' | 'OFFLINE';
  autoReplyOutOfHours: boolean;
  outOfHoursMessage: string;
  holidayMode: boolean;
  holidayMessage: string;
  emergencyContactWa: string;
}

export interface SecuritySettingsConfig {
  autoLogoutMinutes: number; // 15, 30, 60, 0 (disabled)
  maxLoginAttempts: number; // 3, 5, 10
  lockoutDurationMinutes: number; // 15
  requireEmailVerification: boolean;
  maskPhoneNumbersInPublic: boolean; // 0831****4663
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableAuditLogging: boolean;
  allowedAdminIps?: string[];
}

export interface WebsiteIdentityConfig {
  siteName: string; // "HUNTERS COMMUNITY"
  siteTitle: string; // "Pusat Turnamen Esports Free Fire & Mobile Legends"
  siteDescription: string;
  logoUrl?: string;
  bannerBgUrl?: string;
  themeColor: 'cyan' | 'purple' | 'amber' | 'emerald' | 'crimson';
  footerText: string; // "Dikelola oleh DEXZ STORE — © 2026 HUNTERS COMMUNITY. All rights reserved."
  metaKeywords?: string;
}

export interface WebsiteBackupRecord {
  id: string;
  backupName: string;
  createdAt: string;
  timestamp: number;
  createdBy: string;
  totalSizeKb: number;
  totalTeams: number;
  totalMembers: number;
  totalTransactions: number;
  jsonData?: string;
  status: 'BERHASIL' | 'GAGAL';
}

export interface SiteConfig {
  tickerText: string;
  adminWa: string;
  adminWaClean: string;
  officialEmail: string;
  officialDomain: string;
  topUpGameUrl?: string;
  donationUrl?: string;
  donationRecords?: DonationRecord[];
  totalDonationAmount?: number;
  qrisNmid: string;
  qrisImageUrl?: string;
  ewalletNumber?: string;
  ewalletHolder?: string;
  bankBcaNumber?: string;
  bankBcaHolder?: string;
  paymentConfig?: PaymentMethodsConfig;
  waBotConfig?: WaBotConfig;
  homeConfig?: HomeConfig;
  prizePoolConfig?: PrizePoolConfig;
  announcements?: AnnouncementItem[];
  formConfig?: RegistrationFormConfig;
  shareConfig?: ShareConfig;
  helpConfig?: HelpItem[];
  featureRecommendations?: FeatureRecommendation[];
  attendanceConfirmations?: AttendanceConfirmation[];
  matchResults?: MatchResultRecord[];
  registrationChanges?: RegistrationChangeRequest[];
  matchDisputes?: MatchDispute[];
  featuredTeams?: FeaturedTeam[];
  upcomingTournaments?: UpcomingTournament[];
  calendarEvents?: CalendarEvent[];
  tournamentArchives?: TournamentArchive[];
  backgroundMusic?: BackgroundMusicConfig;
  operatingHours?: OperatingHoursConfig;
  securitySettings?: SecuritySettingsConfig;
  websiteIdentity?: WebsiteIdentityConfig;
  websiteBackups?: WebsiteBackupRecord[];
  bridgeConfig?: WebsiteBridgeConfig;
  autoDispatchConfig?: AutoDispatchSystemConfig;
  isFfTournamentActive?: boolean;
  isMlbbTournamentActive?: boolean;
  isFfRegistrationOpen?: boolean;
  isMlbbRegistrationOpen?: boolean;
  ffInfo: TournamentInfo;
  mlbbInfo: TournamentInfo;
  ffRules: RuleCategory[];
  mlbbRules: RuleCategory[];
  communityGroups: CommunityGroup[];
  matchSchedules: MatchSchedule[];
  pastWinners: PastWinner[];
  contactInfo: ContactInfo;
  adminBettingPoolBalance?: number;
  adminAccounts?: AdminAccount[];
  memberAccounts?: UserAccount[];
  blacklistData?: BlacklistEntry[];
  recentlyDeleted?: DeletedItem[];
  saweriaConfig?: SaweriaConfig;
  adminAuditLogs?: AdminAuditLog[];
}

export type NotificationCategory =
  | 'ADMIN_ALERT'           // 1. Notifikasi ke Admin (pendaftaran, topup, withdrawal, laporan)
  | 'ANNOUNCEMENT'          // 2. Notifikasi Pengumuman ke Pengguna
  | 'MATCH_STARTING'        // 3. Notifikasi Pertandingan Segera Dimulai (30 min)
  | 'CONFIRMATION_RESULT'   // 4. Notifikasi Hasil Konfirmasi (pendaftaran, topup, withdrawal, laporan)
  | 'SCHEDULE_CHANGED'      // 5. Notifikasi Perubahan Jadwal
  | 'SCHEDULE_SWAP_REQUEST' // 6. Notifikasi Permintaan Penukaran Jadwal
  | 'BALANCE_ADDED'         // 7. Notifikasi Saldo Berhasil Masuk
  | 'REGISTRATION_CLOSING'  // 8. Notifikasi Pengingat Pendaftaran Akan Ditutup (1 hr)
  | 'MATCH_RESULT'          // 9. Notifikasi Hasil Pertandingan
  | 'BET_RESULT';           // 10. Notifikasi Hasil Taruhan / Prediksi

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  targetRole?: 'admin' | 'all' | 'user';
  targetPhone?: string;      // Phone number of recipient user/captain
  targetTeamName?: string;   // Target team name
  targetMatchId?: string;    // Target match ID
  targetItemType?: 'pendaftaran' | 'topup' | 'withdrawal' | 'laporan' | 'jadwal' | 'prediksi' | 'pengumuman';
  actionTab?: TabType;       // Tab to open on click
  actionSubTab?: string;
  data?: any;                // Extra metadata
  createdAt: string;
  readBy?: string[];         // Array of user phones/deviceIds who read this notification
}

export interface PastWinner {
  id?: string;
  season: string;
  game: 'FF' | 'MLBB';
  champion?: string;
  runnerUp?: string;
  thirdPlace?: string;
  prizePool?: string;
  date?: string;
  firstPlace?: string;
  secondPlace?: string;
  mvp?: string;
  prizeTotal?: string;
}
