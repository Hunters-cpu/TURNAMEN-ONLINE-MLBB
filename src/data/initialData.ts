import { RegisteredTeam, RuleCategory, CommunityGroup, MatchSchedule, TransactionRecord, PastWinner, SiteConfig, AdminAccount, HomeConfig, PrizePoolConfig, AnnouncementItem, RegistrationFormConfig, ShareConfig, HelpItem, UserAccount, BlacklistEntry, PaymentMethodsConfig, WaBotConfig, TournamentInfo, BackgroundMusicConfig, OperatingHoursConfig, SecuritySettingsConfig, WebsiteIdentityConfig, WebsiteBridgeConfig } from '../types';

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [];

export const INITIAL_BACKGROUND_MUSIC_CONFIG: BackgroundMusicConfig = {
  isEnabled: true,
  activeTrackId: 'track-default-1',
  defaultVolume: 50,
  autoPlayOnLoad: true,
  loop: true,
  hideVideo: true,
  showTitle: true,
  widgetPosition: 'bottom-right',
  tracks: [
    {
      id: 'track-default-1',
      title: 'Hunters Esports Anthem — Official Full Song',
      url: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
      sourceType: 'upload',
      fileName: 'hunters-esports-anthem-full.mp3',
      fileSize: '7.8 MB',
      fileType: 'audio/mpeg',
      duration: '05:26',
      uploadedBy: 'Admin DEXZ STORE',
      uploadedAt: '2026-08-10 10:00'
    },
    {
      id: 'track-default-yt',
      title: 'Free Fire World Series (FFWS) Official Theme — YouTube',
      url: 'https://youtu.be/kJQP7kiw5Fk',
      sourceType: 'youtube',
      originalUrl: 'https://youtu.be/kJQP7kiw5Fk',
      embedUrl: 'https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?enablejsapi=1&origin=',
      youtubeVideoId: 'kJQP7kiw5Fk',
      thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      duration: '05:26',
      hideVideo: true,
      uploadedBy: 'Admin DEXZ STORE',
      uploadedAt: '2026-08-12 11:20'
    },
    {
      id: 'track-default-spotify',
      title: 'Gaming Beats & Esports Energy — Spotify Track',
      url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      sourceType: 'spotify',
      originalUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      embedUrl: 'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0',
      spotifyType: 'track',
      spotifyId: '4cOdK2wGLETKBW3PvgPWqT',
      duration: '03:15',
      uploadedBy: 'Admin DEXZ STORE',
      uploadedAt: '2026-08-13 16:40'
    },
    {
      id: 'track-default-2',
      title: 'Cyberpunk Arena — Battle Royale Beat',
      url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      sourceType: 'upload',
      fileName: 'cyberpunk-arena-beat.mp3',
      fileSize: '4.1 MB',
      fileType: 'audio/mpeg',
      duration: '02:45',
      uploadedBy: 'Admin DEXZ STORE',
      uploadedAt: '2026-08-12 14:30'
    }
  ]
};

export const INITIAL_FORM_CONFIG: RegistrationFormConfig = {
  isFormOpen: true,
  targetEmail: 'hunters51community@gmail.com',
  customInstructions: 'Silakan isi data tim dengan teliti. Setelah konfirmasi pendaftaran, data formulir pendaftaran akan dikirimkan secara otomatis ke email panitia hunters51community@gmail.com serta tersimpan di sistem.',
  successMessage: 'Pendaftaran Berhasil! Data tim Anda telah dikirimkan ke email panitia (hunters51community@gmail.com) & tersimpan di database.'
};

export const INITIAL_SHARE_CONFIG: ShareConfig = {
  promoTitle: '🔥 SEGERA DAFTAR TURNAMEN HUNTERS COMMUNITY x DEXZ STORE!',
  promoText: 'Ayo daftarkan tim Free Fire & Mobile Legends terbaikmu di Turnamen Resmi Hunters Community! Total slot 32 tim per game, total prize pool transparan, dan hadiah ratusan ribu rupiah. Klik link untuk mendaftar:'
};

export const INITIAL_HELP_CONFIG: HelpItem[] = [
  {
    id: 'help-1',
    title: '1. Bagaimana Cara Mendaftar Turnamen?',
    content: 'Pilih menu "Formulir Pendaftaran" atau tombol "Daftar Tim", pilih game (Free Fire / Mobile Legends), isi nama tim, nama kapten, nomor WhatsApp aktif, dan daftar roster pemain. Tekan Kirim Pendaftaran.'
  },
  {
    id: 'help-2',
    title: '2. Ke Mana Harus Melakukan Pembayaran Biaya Slot?',
    content: 'Pembayaran dapat dilakukan melalui Scan QRIS Semua E-Wallet/Bank atau Transfer BCA / E-Wallet yang tertera di halaman pendaftaran & menu Pembayaran.'
  },
  {
    id: 'help-3',
    title: '3. Bagaimana Cara Mengetahui Status Pembayaran & Slot Tim?',
    content: 'Buka menu "Status Pembayaran" atau "Tim & Slot". Cari nama tim Anda. Jika berstatus "SAH", berarti slot tim Anda telah terkunci 100%.'
  },
  {
    id: 'help-4',
    title: '4. Di Mana Melihat Room ID & Password Match?',
    content: 'Room ID & Password akan dibagikan di menu "Info Pertandingan & Jadwal" serta di Broadcast Grup WhatsApp Resmi paling lambat 15 menit sebelum match.'
  }
];
import ffBanner from '../assets/images/ff_tournament_banner_1785977776668.jpg';
import mlbbBanner from '../assets/images/mlbb_tournament_banner_1785977790579.jpg';

export const ADMIN_WA = '+62 831 4883 4663';
export const ADMIN_WA_CLEAN = '6283148834663';
export const OFFICIAL_EWALLET_NUMBER = '083803540456';
export const OFFICIAL_BANK_BCA = '83148834663';
export const OFFICIAL_EMAIL = 'hunters51community@gmail.com';
export const OFFICIAL_DOMAIN = 'hunters.biz.id';

export const TOURNAMENT_FF_INFO: TournamentInfo = {
  game: 'FF',
  title: 'TURNAMEN FREE FIRE',
  fee: 'Rp50.000/Tim',
  maxSlots: 32,
  deadline: '1 September 2026',
  status: 'Pendaftaran Ditutup',
  bannerImage: ffBanner,
  totalPrize: 'Rp 1.440.000',
  tournamentStage: 'Belum Dimulai',
  matchDates: '2 - 5 September 2026',
  matchTime: '19:30 WIB - Selesai',
  formatRules: 'Battle Royale 6 Match • 3 Peta Berbeda (Bermuda, Purgatory, Kalahari) • Sistem Poin Standar',
  prize1st: 'Rp 720.000 + E-Sertifikat',
  prize2nd: 'Rp 432.000 + E-Sertifikat',
  prize3rd: 'Rp 288.000 + E-Sertifikat',
  prizeMvp: 'Rp 100.000 (Top Predator)',
  isLiveNow: false,
};

export const TOURNAMENT_MLBB_INFO: TournamentInfo = {
  game: 'MLBB',
  title: 'TURNAMEN MOBILE LEGENDS',
  fee: 'Rp50.000/Tim',
  maxSlots: 32,
  deadline: '5 September 2026',
  status: 'Pendaftaran Ditutup',
  bannerImage: mlbbBanner,
  totalPrize: 'Rp 1.440.000',
  tournamentStage: 'Belum Dimulai',
  matchDates: '6 - 9 September 2026',
  matchTime: '19:30 WIB - Selesai',
  formatRules: 'Custom Draft Pick 5v5 • Single Elimination BO3 • Grand Final BO5 • Skin ON / Chat All OFF',
  prize1st: 'Rp 720.000 + E-Sertifikat',
  prize2nd: 'Rp 432.000 + E-Sertifikat',
  prize3rd: 'Rp 288.000 + E-Sertifikat',
  prizeMvp: 'Rp 100.000 (MVP Final)',
  isLiveNow: false,
};

export const INITIAL_FF_TEAMS: RegisteredTeam[] = [];

export const INITIAL_MLBB_TEAMS: RegisteredTeam[] = [];

export const FF_RULES: RuleCategory[] = [
  {
    title: 'UMUM',
    icon: 'ShieldCheck',
    type: 'positive',
    rules: [
      'Hormati panitia, lawan & sesama peserta',
      'Tepat waktu: terlambat = diskualifikasi',
      'Keputusan panitia mutlak & tidak diganggu gugat',
    ],
  },
  {
    title: 'AKUN & PERANGKAT',
    icon: 'Smartphone',
    type: 'positive',
    rules: [
      'Akun asli milik sendiri, tidak ada pelarangan (banned)',
      'Main di perangkat sendiri, koneksi internet stabil',
      'Dilarang ganti nama/ikon tim saat turnamen berlangsung',
    ],
  },
  {
    title: 'LARANGAN KERAS',
    icon: 'Ban',
    type: 'negative',
    rules: [
      '❌ Cheat, mod, skrip, aplikasi pihak ketiga, alat bantu apa pun',
      '❌ Bug peta, tembus tembok, atap, bawah kolong',
      '❌ Kerja sama antar tim (teaming), senggol-bacok, penembakan teman',
      '❌ Senjata/bundle terlarang, karakter terlarang, hewan peliharaan terlarang',
      '❌ Jeda (RM) berlebihan: maksimal 5x, tidak boleh jika sudah terkena damage',
      '❌ Rekaman/screenshot tanpa izin panitia',
    ],
  },
  {
    title: 'KARAKTER & ITEM DIPERBOLEHKAN',
    icon: 'CheckCircle2',
    type: 'positive',
    rules: [
      'Karakter: Alok, Hayato, Kelly, Caroline saja',
      'Hewan: Falco saja – dilarang yang lain',
      'Skill & item standar sesuai aturan panitia',
      'Dilarang sepatu lompat/terbang',
    ],
  },
  {
    title: 'SISTEM PERTANDINGAN',
    icon: 'Trophy',
    type: 'neutral',
    rules: [
      'Peta: Besar / Mode Seperti Rank',
      'Zona: 11/22 = Tidak ada zona; 33/44 = Boleh zona',
      'Damage USP dilarang, kecuali lawan AFK',
      'Tidak ada poin tambahan – langsung gugur',
    ],
  },
];

export const MLBB_RULES: RuleCategory[] = [
  {
    title: '📋 INFORMASI PERTANDINGAN',
    icon: 'Swords',
    type: 'neutral',
    rules: [
      'Format: 5 vs 5 — Kustom Mode',
      'Peta: Land of Dawn',
      'Sistem: Langsung Gugur / Grup sesuai jadwal',
      'Waktu Mulai: Sesuai jadwal yang ditetapkan',
      'Masuk Ruang: 10–15 menit sebelum jam mulai',
    ],
  },
  {
    title: '✅ SEBELUM PERTANDINGAN',
    icon: 'ShieldCheck',
    type: 'positive',
    rules: [
      'Kapten wajib masuk ruang sesuai undangan',
      'Kode Ruang & Kata Sandi dikirim di grup resmi',
      'Siapkan akun & koneksi internet yang stabil',
      'Nama dalam permainan disarankan sesuai nama tim',
      'Pemeriksaan akun bisa dilakukan panitia kapan saja',
    ],
  },
  {
    title: '🎮 SAAT PERTANDINGAN',
    icon: 'Gamepad2',
    type: 'positive',
    rules: [
      'Pertandingan dimulai segera setelah kedua tim siap',
      'Pemilihan Hero & Emblem sesuai giliran',
      'Dilarang menunda-nunda pemilihan Hero',
      'Jika terputus koneksi di awal pertandingan → ulangi sekali',
      'Jika terjadi gangguan saat pertandingan berlangsung → hasil tetap sah sesuai kondisi saat itu',
      'Tidak ada pengulangan kecuali disetujui panitia',
    ],
  },
  {
    title: '⚠️ LARANGAN KERAS',
    icon: 'AlertTriangle',
    type: 'negative',
    rules: [
      '❌ Dilarang menggunakan program pendukung, cheat, modifikasi',
      '❌ Dilarang menghina, memaki, menyebarkan kebencian di dalam maupun luar permainan',
      '❌ Dilarang memprotes keterlambatan, jaringan, atau masalah perangkat',
      '❌ Dilarang sengaja keluar dari pertandingan sebelum selesai',
      '❌ Dilarang bekerjasama/bermain curang dengan tim lawan',
      '❌ Dilarang mengganti pemain tanpa lapor & izin panitia',
    ],
  },
  {
    title: '📊 HASIL & KETENTUAN',
    icon: 'Trophy',
    type: 'positive',
    rules: [
      'Tim yang menang wajib kirim tangkapan layar hasil pertandingan ke panitia',
      'Hasil pertandingan sah setelah dikonfirmasi panitia',
      'Keputusan panitia bersifat MUTLAK dan tidak dapat diganggu gugat',
      'Tim yang tidak hadir dalam waktu 5 menit setelah jam mulai = KALAH',
    ],
  },
  {
    title: '📝 RINGKASAN',
    icon: 'CheckCircle2',
    type: 'neutral',
    rules: [
      'Siap tepat waktu • Bermain jujur • Hormati lawan & panitia • Hasil mutlak dari panitia',
      '— HUNTERS COMMUNITY • DEXZ STORE',
    ],
  },
];

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'grp-ff',
    title: 'MASUK GRUP TURNAMEN FF',
    game: 'Free Fire',
    link: 'https://chat.whatsapp.com/LSwfHMPmbbNIOsBUzNYwi4',
    description: 'Grup khusus peserta & kapten tim Free Fire. Pembagian Room ID, Pass & jadwal match FF.',
    iconColor: 'from-amber-500 to-red-600',
  },
  {
    id: 'grp-mlbb',
    title: 'MASUK GRUP TURNAMEN MLBB',
    game: 'Mobile Legends',
    link: 'https://chat.whatsapp.com/F5gLtMN4lZ3Ki9SPEa7s7k',
    description: 'Grup resmi turnamen Mobile Legends Bang Bang. Koordinasi room kustom & verifikasi tim.',
    iconColor: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'grp-umum',
    title: 'MASUK GRUP INFORMASI UMUM',
    game: 'Hunters Community',
    link: 'https://chat.whatsapp.com/Gi1ByCCTtCr9izwzfmQZlV',
    description: 'Komunitas umum Hunters x DEXZ STORE. Info event mendatang, giveaway & mabar komunitas.',
    iconColor: 'from-emerald-500 to-teal-400',
  },
];

// Helper to generate structured tournament schedule matches
export const GENERATE_DEFAULT_MATCH_SCHEDULES = (): MatchSchedule[] => {
  return [];
};

export const MATCH_SCHEDULES: MatchSchedule[] = [];

export const FINANCIAL_TRANSACTIONS: TransactionRecord[] = [];

export const PAST_WINNERS: PastWinner[] = [];

export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'admin-main-1',
    name: 'Admin Utama DEXZ STORE',
    email: 'mumumimi353@gmail.com',
    password: 'Kampoeng51',
    isSuperAdmin: true,
    roleTitle: 'Admin Utama / Super Admin',
    createdAt: '2026-08-01',
  },
];

export const INITIAL_MEMBER_ACCOUNTS: UserAccount[] = [];

export const INITIAL_BLACKLIST_DATA: BlacklistEntry[] = [];

export const INITIAL_PRIZE_POOL_CONFIG: PrizePoolConfig = {
  feePerSlot: 50000,
  totalSlots: 32,
  adminFee: 160000, // 10% dari total kotor Rp 1.600.000
  adminFeePercent: 10,
  juara1Percent: 50,
  juara2Percent: 30,
  juara3Percent: 20,
};

export const INITIAL_HOME_CONFIG: HomeConfig = {
  heroBadge: 'DIKELOLA OLEH DEXZ STORE',
  heroTitle: 'HUNTERS COMMUNITY',
  heroSubtitle: 'Pusat Turnamen Free Fire & Mobile Legends • Resmi, Aman & Terpercaya',
  heroDescription: 'Satu-satunya wadah kompetitif esports terdepan yang dikelola profesional oleh DEXZ STORE. Total slot 32 tim per game, fair play terjamin, dan sistem kustom room terbaik!',
  organizerTitle: '✨ DEXZ STORE ORGANIZER',
  organizerSubtitle: 'Penyelenggara Turnamen Resmi • Terpercaya • Siap Melayani 24/7',
  tiktokUrl: 'https://tiktok.com/@dexzstore.esports',
  instagramUrl: 'https://instagram.com/hunters.community_official',
  youtubeUrl: 'https://youtube.com/@dexzstoreofficial',
  donationUrl: 'https://saweria.co/Hntrs',
  donationTitle: 'DONASI & BERI DUKUNGAN RESMI',
  donationDescription: 'Dukung perkembangan turnamen esports Hunters Community via Saweria, Trakteer, atau QRIS Resmi.',
  // 📺 LIVE STREAM SYSTEM (DEXZ STORE OFFICIAL)
  youtubeLiveStatus: 'OFFLINE',
  youtubeLiveVideoUrl: 'https://www.youtube.com/watch?v=live_stream',
  youtubeLiveTitle: 'Grand Final Hunters Community x DEXZ Store Live',
  youtubeChannelName: 'DEXZ STORE OFFICIAL',
  youtubeChannelUrl: 'https://youtube.com/@dexzstoreofficial',
  tiktokLiveStatus: 'OFFLINE',
  tiktokLiveVideoUrl: 'https://www.tiktok.com/@dexzstore.esports/live',
  tiktokLiveTitle: 'Caster Live Match Hunters Esports',
  tiktokAccountName: '@dexzstore.esports',
  tiktokAccountUrl: 'https://tiktok.com/@dexzstore.esports',
  liveBroadcastNote: 'Siaran akan hadir saat pertandingan semifinal & grand final',
  liveAutoMonitorEnabled: true,
  customLinks: []
};

export const INITIAL_PAYMENT_METHODS_CONFIG: PaymentMethodsConfig = {
  qrisEnabled: true,
  qrisNmid: 'ID1025383919053',
  qrisHolder: 'DEXZ STORE / HUNTERS',
  qrisImageUrl: '',

  // 6 Core Options Default Fees & QRIS Barcode URLs
  feeFf: 50000,
  qrisFfImageUrl: '',

  feeMlbb: 50000,
  qrisMlbbImageUrl: '',

  feeUpcoming: 50000,
  qrisUpcomingImageUrl: '',

  feeRecommendation: 5000,
  qrisRecommendationImageUrl: '',

  minBetAmount: 1000,
  maxBetAmount: 1000000,
  qrisBetImageUrl: '',

  customPaymentTypes: [],
  customPaymentTransactions: [],

  // Additional Payment Settings
  minTopUpAmount: 10000,
  qrisTopupImageUrl: '',
  qrisDonationImageUrl: '',

  ewalletEnabled: true,
  ewalletProviders: [
    { id: 'ovo', name: 'OVO', number: OFFICIAL_EWALLET_NUMBER, holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'ovo://' },
    { id: 'dana', name: 'DANA', number: OFFICIAL_EWALLET_NUMBER, holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'dana://' },
    { id: 'gopay', name: 'GoPay (Gojek)', number: OFFICIAL_EWALLET_NUMBER, holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'gopay://' },
    { id: 'shopeepay', name: 'ShopeePay', number: OFFICIAL_EWALLET_NUMBER, holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'shopeepay://' },
    { id: 'linkaja', name: 'LinkAja', number: OFFICIAL_EWALLET_NUMBER, holder: 'DEXZ STORE / HUNTERS', enabled: true, appLink: 'linkaja://' },
  ],

  bankEnabled: true,
  bankProviders: [
    { id: 'bca', name: 'Bank BCA', code: '014', number: OFFICIAL_BANK_BCA, holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bca://' },
    { id: 'mandiri', name: 'Bank Mandiri (Livin)', code: '008', number: '1230008314883', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'mandiri.livin://' },
    { id: 'bri', name: 'Bank BRI (BRImo)', code: '002', number: '012301083148831', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'brimo://' },
    { id: 'bni', name: 'Bank BNI Mobile', code: '009', number: '0831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bnimobile://' },
    { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', code: '451', number: '7831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'bsimobile://' },
    { id: 'jago', name: 'Bank Jago', code: '542', number: '108314883466', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'jago://' },
    { id: 'seabank', name: 'SeaBank', code: '535', number: '901831488346', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'seabank://' },
    { id: 'blu', name: 'blu by BCA Digital', code: '501', number: OFFICIAL_EWALLET_NUMBER, holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'blu://' },
    { id: 'permata', name: 'Bank Permata', code: '013', number: '8528083148834663', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'permatamobile://' },
    { id: 'danamon', name: 'Bank Danamon', code: '011', number: '003612345678', holder: 'HUNTERS / DEXZ STORE', enabled: true, appLink: 'danamon://' },
  ]
};

export const INITIAL_WA_BOT_CONFIG: WaBotConfig = {
  isConnected: true,
  botPhoneNumber: '6283148834663',
  botName: 'HUNTERS BOT AUTO-NOTIFIER v2.5',
  connectedSince: '2026-08-08 08:00',
  batteryLevel: 98,
  autoSendVerifiedSah: true,
  templateSah: `🔥 *VERIFIKASI PENDAFTARAN SAH - HUNTERS ESPORTS* 🔥\n----------------------------------------\nHalo Kapten *{CAPTAIN_NAME}* ({TEAM_NAME})!\n\nSelamat! Pendaftaran tim Anda untuk game *{GAME}* di Slot *#{SLOT}* telah *VERIFIKASI & BERSTATUS SAH*!\n\n📌 *Metode Bayar*: {PAYMENT_METHOD}\n📌 *Waktu Verifikasi*: {TIME}\n\nSilakan cek jadwal tanding & instruksi room ID di website resmi kami! Terima kasih dan selamat bertanding! 🏆`,
  templateJadwal: `📢 *PEMBERITAHUAN PERUBAHAN JADWAL MATCH* 📢\n----------------------------------------\nHalo Kapten *{CAPTAIN_NAME}* ({TEAM_NAME})!\n\nAda perubahan jadwal pertandingan untuk tim Anda:\n🎮 *Game*: {GAME}\n📅 *Jadwal Baru*: {NEW_TIME}\n⚔️ *Lawan / Bracket*: {MATCH_TITLE}\n🔑 *Room ID*: {ROOM_ID} | *Pass*: {ROOM_PASS}\n\n*Catatan Panitia*: {NOTES}\nMohon bersiap 15 menit sebelum match dimulai!`,
  templateMatch: `⏰ *PENGINGAT MATCH BERIKUTNYA - HUNTERS ESPORTS* ⏰\n----------------------------------------\nHalo Kapten *{CAPTAIN_NAME}* ({TEAM_NAME})!\n\nTim Anda dijadwalkan bertanding sebentar lagi:\n🎮 *Game*: {GAME}\n🏆 *Babak*: {MATCH_TITLE}\n⏰ *Waktu Match*: {MATCH_TIME}\n🔑 *Room ID*: {ROOM_ID} | *Pass*: {ROOM_PASS}\n\nHarap seluruh pemain siap di room sebelum waktu yang ditentukan!`,
  templateInfo: `📢 *INFO PENTING TURNAMEN HUNTERS ESPORTS* 📢\n----------------------------------------\n{INFO_CONTENT}\n\n----------------------------------------\nHarap seluruh tim memperhatikan pengumuman ini! Terima kasih.`,
  logs: []
};

export const INITIAL_OPERATING_HOURS_CONFIG: OperatingHoursConfig = {
  openTime: '08:00',
  closeTime: '22:00',
  timezone: 'WIB',
  workDays: 'Setiap Hari (Senin – Minggu)',
  adminStatus: 'ONLINE',
  autoReplyOutOfHours: true,
  outOfHoursMessage: 'Terima kasih telah menghubungi Panitia HUNTERS COMMUNITY. Saat ini layanan chat berada di luar jam operasional (08.00 - 22.00 WIB). Pesan Anda akan kami balas segera setelah jam kerja dimulai.',
  holidayMode: false,
  holidayMessage: 'Layanan turnamen sedang dalam masa libur nasional / pemeliharaan panitia.',
  emergencyContactWa: '6283148834663'
};

export const INITIAL_SECURITY_SETTINGS_CONFIG: SecuritySettingsConfig = {
  autoLogoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  requireEmailVerification: false,
  maskPhoneNumbersInPublic: true,
  maintenanceMode: false,
  maintenanceMessage: 'Website HUNTERS COMMUNITY sedang dalam pemeliharaan sistem rutin. Silakan kembali beberapa saat lagi!',
  enableAuditLogging: true,
  allowedAdminIps: []
};

export const INITIAL_WEBSITE_IDENTITY_CONFIG: WebsiteIdentityConfig = {
  siteName: 'HUNTERS COMMUNITY',
  siteTitle: 'Turnamen Esports Free Fire & Mobile Legends Resmi',
  siteDescription: 'Platform resmi turnamen game Free Fire & Mobile Legends Bang Bang berhadiah jutaan rupiah dikelola oleh DEXZ STORE.',
  logoUrl: '',
  bannerBgUrl: '',
  themeColor: 'cyan',
  footerText: 'Dikelola oleh DEXZ STORE — © 2026 HUNTERS COMMUNITY. All rights reserved.',
  metaKeywords: 'turnamen free fire, turnamen mobile legends, esports indonesia, hunters community, dexz store'
};

export const INITIAL_WEBSITE_BRIDGE_CONFIG: WebsiteBridgeConfig = {
  isEnabled: true,
  targetWebsiteUrl: '',
  bridgeName: 'Website Tujuan Utama / Webhook Receiver',
  secretKey: '',
  isConnected: false,
  lastPingStatus: 'IDLE',
  autoSendPaymentProof: true,
  autoSendPhotosMedia: true,
  autoSendVideos: true,
  autoSendFilesData: true,
  payloadFormat: 'JSON_FULL',
  logs: []
};

export const INITIAL_SITE_CONFIG: SiteConfig = {
  tickerText: '⚠️ ATURAN UMUM: Dilarang keras menggunakan Cheat/Third-party apps • Hormati Panitia & Lawan • Keputusan Panitia Mutlak • Pembayaran sah = Terdaftar Sah',
  adminWa: ADMIN_WA,
  adminWaClean: ADMIN_WA_CLEAN,
  officialEmail: OFFICIAL_EMAIL,
  officialDomain: OFFICIAL_DOMAIN,
  qrisNmid: 'ID1025383919053',
  qrisImageUrl: '',
  ewalletNumber: OFFICIAL_EWALLET_NUMBER,
  ewalletHolder: 'DEXZ STORE / HUNTERS',
  bankBcaNumber: OFFICIAL_BANK_BCA,
  bankBcaHolder: 'HUNTERS / DEXZ STORE',
  adminBettingPoolBalance: 0,
  paymentConfig: INITIAL_PAYMENT_METHODS_CONFIG,
  waBotConfig: INITIAL_WA_BOT_CONFIG,
  homeConfig: INITIAL_HOME_CONFIG,
  prizePoolConfig: INITIAL_PRIZE_POOL_CONFIG,
  announcements: INITIAL_ANNOUNCEMENTS,
  formConfig: INITIAL_FORM_CONFIG,
  shareConfig: INITIAL_SHARE_CONFIG,
  helpConfig: INITIAL_HELP_CONFIG,
  operatingHours: INITIAL_OPERATING_HOURS_CONFIG,
  securitySettings: INITIAL_SECURITY_SETTINGS_CONFIG,
  websiteIdentity: INITIAL_WEBSITE_IDENTITY_CONFIG,
  bridgeConfig: INITIAL_WEBSITE_BRIDGE_CONFIG,
  websiteBackups: [],
  featureRecommendations: [],
  attendanceConfirmations: [],
  matchResults: [],
  registrationChanges: [],
  matchDisputes: [],
  featuredTeams: [],
  upcomingTournaments: [],
  calendarEvents: [],
  isFfTournamentActive: false,
  isMlbbTournamentActive: false,
  isFfRegistrationOpen: false,
  isMlbbRegistrationOpen: false,
  topUpGameUrl: 'https://saweria.co/Hntrs/toko-top-up',
  donationUrl: 'https://saweria.co/dexzstore',
  totalDonationAmount: 0,
  donationRecords: [],
  ffInfo: TOURNAMENT_FF_INFO,
  mlbbInfo: TOURNAMENT_MLBB_INFO,
  ffRules: FF_RULES,
  mlbbRules: MLBB_RULES,
  communityGroups: COMMUNITY_GROUPS,
  matchSchedules: MATCH_SCHEDULES,
  pastWinners: PAST_WINNERS,
  contactInfo: {
    address: 'HQ Hunters Community x DEXZ STORE Esports Arena, Jakarta, Indonesia',
    hours: '24 Jam Non-Stop (Setiap Hari)',
    instagram: '@hunters.community_official',
    tiktok: '@dexzstore.esports',
  },
  adminAccounts: INITIAL_ADMIN_ACCOUNTS,
  memberAccounts: INITIAL_MEMBER_ACCOUNTS,
  blacklistData: INITIAL_BLACKLIST_DATA,
  recentlyDeleted: [],
  tournamentArchives: [],
  adminAuditLogs: [],
  backgroundMusic: INITIAL_BACKGROUND_MUSIC_CONFIG,
};

