import { TabType } from '../types';

export interface UserMenuCategory {
  id: string;
  categoryNumber: number;
  title: string;
  iconName: string;
  badge: string;
  themeColor: {
    badgeBg: string;
    badgeText: string;
    border: string;
    gradient: string;
    iconBg: string;
    iconText: string;
  };
  items: UserMenuItem[];
}

export interface UserMenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  tab: TabType;
  subTab?: string;
  badge?: string;
  isExternal?: boolean;
  externalUrl?: string;
  action?: 'logout' | 'register-ff' | 'register-mlbb';
}

export const USER_CATEGORIZED_MENUS: UserMenuCategory[] = [
  {
    id: 'cat-user-1',
    categoryNumber: 1,
    title: 'UTAMA & INFORMASI',
    iconName: 'Home',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      border: 'border-purple-500/40',
      gradient: 'from-purple-900/60 to-indigo-950/60',
      iconBg: 'bg-purple-600/20',
      iconText: 'text-purple-400'
    },
    items: [
      {
        id: 'u-1-1',
        title: 'Beranda',
        subtitle: 'Halaman utama, sambutan resmi & ringkasan turnamen',
        iconName: 'Home',
        tab: 'beranda',
        badge: 'Utama'
      },
      {
        id: 'u-1-2',
        title: 'Daftar Semua Turnamen',
        subtitle: 'Pilihan turnamen Free Fire & Mobile Legends aktif',
        iconName: 'Trophy',
        tab: 'semua-turnamen',
        badge: 'Turnamen'
      },
      {
        id: 'u-1-3',
        title: 'Jadwal Pertandingan',
        subtitle: 'Jadwal tanding lengkap, jam tanding & lawan',
        iconName: 'Calendar',
        tab: 'info-match',
        subTab: 'jadwal',
        badge: 'Jadwal'
      },
      {
        id: 'u-1-4',
        title: 'Bagan & Susunan Babak',
        subtitle: 'Bagan visual babak penyisihan hingga Grand Final',
        iconName: 'GitMerge',
        tab: 'info-match',
        subTab: 'bracket',
        badge: 'Bagan'
      },
      {
        id: 'u-1-5',
        title: 'Pengumuman & Berita',
        subtitle: 'Pemberitahuan resmi terbaru dari panitia turnamen',
        iconName: 'Megaphone',
        tab: 'pengumuman',
        badge: 'Resmi'
      },
      {
        id: 'u-1-6',
        title: 'Galeri & Bukti Pertandingan',
        subtitle: 'Dokumentasi foto, sertifikat juara & video match',
        iconName: 'Image',
        tab: 'info-match',
        subTab: 'galeri',
        badge: 'Galeri'
      }
    ]
  },
  {
    id: 'cat-user-2',
    categoryNumber: 2,
    title: 'PENDAFTARAN & TIM',
    iconName: 'Users',
    badge: '5 Menu',
    themeColor: {
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      border: 'border-orange-500/40',
      gradient: 'from-orange-950/60 to-red-950/60',
      iconBg: 'bg-orange-600/20',
      iconText: 'text-orange-400'
    },
    items: [
      {
        id: 'u-2-1',
        title: 'Daftar Turnamen Free Fire',
        subtitle: 'Formulir pendaftaran slot turnamen Free Fire',
        iconName: 'Flame',
        tab: 'form-pendaftaran',
        action: 'register-ff',
        badge: 'FF Slot'
      },
      {
        id: 'u-2-2',
        title: 'Daftar Turnamen Mobile Legends',
        subtitle: 'Formulir pendaftaran slot turnamen Mobile Legends',
        iconName: 'Swords',
        tab: 'form-pendaftaran',
        action: 'register-mlbb',
        badge: 'MLBB Slot'
      },
      {
        id: 'u-2-3',
        title: 'Turnamen Mendatang',
        subtitle: 'Jadwal & rincian turnamen musim berikutnya',
        iconName: 'Sparkles',
        tab: 'info-match',
        subTab: 'mendatang',
        badge: 'Next Season'
      },
      {
        id: 'u-2-4',
        title: 'Profil Tim & Anggota',
        subtitle: 'Daftar tim terdaftar & status slot verifikasi sah',
        iconName: 'Users',
        tab: 'tim',
        badge: 'Tim Sah'
      },
      {
        id: 'u-2-5',
        title: 'Konfirmasi Kehadiran',
        subtitle: 'Konfirmasi SIAP tanding kapten tim & tukar jadwal',
        iconName: 'UserCheck',
        tab: 'info-match',
        subTab: 'kehadiran',
        badge: 'Absensi'
      }
    ]
  },
  {
    id: 'cat-user-3',
    categoryNumber: 3,
    title: 'SALDO & PEMBAYARAN',
    iconName: 'Coins',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      border: 'border-emerald-500/40',
      gradient: 'from-emerald-950/60 to-teal-950/60',
      iconBg: 'bg-emerald-600/20',
      iconText: 'text-emerald-400'
    },
    items: [
      {
        id: 'u-3-1',
        title: 'Saldo Saya',
        subtitle: 'Cek saldo akun, total deposit, dan mutasi saldo',
        iconName: 'Wallet',
        tab: 'saldo',
        subTab: 'pribadi',
        badge: 'Saldo'
      },
      {
        id: 'u-3-2',
        title: 'Top Up Saldo',
        subtitle: 'Isi ulang saldo akun via QRIS All Payment & E-Wallet',
        iconName: 'CreditCard',
        tab: 'saldo',
        subTab: 'topup',
        badge: 'Top Up'
      },
      {
        id: 'u-3-3',
        title: 'Penarikan Saldo',
        subtitle: 'Cairkan saldo hadiah & kemenangan ke rekening / E-Wallet',
        iconName: 'ArrowUpRight',
        tab: 'saldo',
        subTab: 'withdrawal',
        badge: 'Withdraw'
      },
      {
        id: 'u-3-4',
        title: 'Riwayat Transaksi',
        subtitle: 'Catatan seluruh transaksi, mutasi, & verifikasi',
        iconName: 'History',
        tab: 'saldo',
        subTab: 'mutasi',
        badge: 'Riwayat'
      },
      {
        id: 'u-3-5',
        title: 'Pasang Taruhan',
        subtitle: 'Prediksi tim pemenang match & pasang taruhan realtime',
        iconName: 'Target',
        tab: 'prediksi',
        badge: 'Prediksi'
      },
      {
        id: 'u-3-6',
        title: 'Donasi / Dukungan Kami',
        subtitle: 'Dukung komunitas via Saweria QRIS All Payment',
        iconName: 'Heart',
        tab: 'donasi',
        badge: 'Saweria'
      }
    ]
  },
  {
    id: 'cat-user-4',
    categoryNumber: 4,
    title: 'AKUN & LAYANAN',
    iconName: 'ShieldCheck',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      border: 'border-blue-500/40',
      gradient: 'from-blue-950/60 to-slate-950/60',
      iconBg: 'bg-blue-600/20',
      iconText: 'text-blue-400'
    },
    items: [
      {
        id: 'u-4-1',
        title: 'Profil Pemain & Game ID',
        subtitle: 'Kelola foto profil, nickname, ID Free Fire & MLBB, dan riwayat turnamen',
        iconName: 'User',
        tab: 'profil',
        badge: 'Profil'
      },
      {
        id: 'u-4-2',
        title: 'Kirim Rekomendasi / Fitur Baru',
        subtitle: 'Usulkan penambahan menu & fitur baru ke panitia',
        iconName: 'Lightbulb',
        tab: 'bantuan',
        subTab: 'rekomendasi',
        badge: 'Usulan'
      },
      {
        id: 'u-4-3',
        title: 'Bantuan & Panduan',
        subtitle: 'Petunjuk lengkap cara daftar, bayar, & kontak CS',
        iconName: 'HelpCircle',
        tab: 'bantuan',
        badge: 'Bantuan'
      },
      {
        id: 'u-4-musik',
        title: 'Musik Latar (Hanya Putar/Henti/Volume)',
        subtitle: 'Putar, hentikan & atur kenyamanan volume musik website',
        iconName: 'Music',
        tab: 'pengaturan-umum',
        subTab: 'musik',
        badge: 'Audio'
      },
      {
        id: 'u-4-4',
        title: 'Pengaturan Akun',
        subtitle: 'Pengaturan preferensi tampilan, tema & keamanan',
        iconName: 'Settings',
        tab: 'pengaturan-umum',
        badge: 'Setting'
      },
      {
        id: 'u-4-5',
        title: 'Keluar / Logout',
        subtitle: 'Keluar dari sesi akun dengan aman',
        iconName: 'LogOut',
        tab: 'login',
        action: 'logout',
        badge: 'Keluar'
      }
    ]
  }
];

export interface AdminMenuCategory {
  id: string;
  categoryNumber: number;
  title: string;
  iconName: string;
  badge: string;
  themeColor: {
    badgeBg: string;
    badgeText: string;
    border: string;
    gradient: string;
    iconBg: string;
    iconText: string;
  };
  items: AdminMenuItem[];
}

export interface AdminMenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  adminTab: string | null;
  subAction?: string;
  badge?: string;
  subItems?: string[];
  filterParam?: Record<string, any>;
}

export const ADMIN_CATEGORIZED_MENUS: AdminMenuCategory[] = [
  {
    id: 'cat-admin-1',
    categoryNumber: 1,
    title: 'RINGKASAN & PENGUMUMAN',
    iconName: 'BarChart2',
    badge: '5 Menu',
    themeColor: {
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      border: 'border-purple-500/40',
      gradient: 'from-purple-950/60 to-indigo-950/60',
      iconBg: 'bg-purple-600/20',
      iconText: 'text-purple-400'
    },
    items: [
      {
        id: 'adm-1-1',
        title: 'Ringkasan / Dashboard',
        subtitle: 'Statistik pendaftaran, total saldo, match aktif & status server',
        iconName: 'LayoutDashboard',
        adminTab: 'beranda',
        badge: 'Overview'
      },
      {
        id: 'adm-1-turnamen',
        title: 'Ubah Data Turnamen Berlangsung',
        subtitle: 'Edit info FF & MLBB, status, fase babak, jadwal, hadiah & room',
        iconName: 'Trophy',
        adminTab: 'turnamen',
        badge: 'Turnamen Aktif'
      },
      {
        id: 'adm-1-2',
        title: 'Kelola Pengumuman',
        subtitle: 'Terbitkan berita, broadcast pengumuman & notifikasi push',
        iconName: 'Megaphone',
        adminTab: 'pengumuman',
        badge: 'Siaran'
      },
      {
        id: 'adm-1-3',
        title: 'Kelola Kalender Turnamen',
        subtitle: 'Atur tanggal turnamen, buka/tutup pendaftaran, dan agenda kalender',
        iconName: 'Calendar',
        adminTab: 'jadwal',
        badge: 'Kalender'
      },
      {
        id: 'adm-1-4',
        title: 'Statistik & Data Website',
        subtitle: 'Analisis perputaran transaksi, pengunjung & performa sistem',
        iconName: 'TrendingUp',
        adminTab: 'statistik',
        badge: 'Analitik'
      }
    ]
  },
  {
    id: 'cat-admin-2',
    categoryNumber: 2,
    title: 'PENDAFTARAN & TIM',
    iconName: 'Users',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      border: 'border-orange-500/40',
      gradient: 'from-orange-950/60 to-red-950/60',
      iconBg: 'bg-orange-600/20',
      iconText: 'text-orange-400'
    },
    items: [
      {
        id: 'adm-2-1',
        title: 'Pendaftaran Free Fire (Menunggu Konfirmasi)',
        subtitle: 'Verifikasi berkas, pembayaran & nomor slot pendaftar FF',
        iconName: 'Flame',
        adminTab: 'tim',
        filterParam: { game: 'FF', status: 'Pending' },
        badge: 'FF Pending'
      },
      {
        id: 'adm-2-2',
        title: 'Pendaftaran Mobile Legends (Menunggu Konfirmasi)',
        subtitle: 'Verifikasi berkas, pembayaran & nomor slot pendaftar MLBB',
        iconName: 'Swords',
        adminTab: 'tim',
        filterParam: { game: 'MLBB', status: 'Pending' },
        badge: 'MLBB Pending'
      },
      {
        id: 'adm-2-3',
        title: 'Atur Turnamen Mendatang (Tambah, Ubah, Hapus)',
        subtitle: 'Menambahkan, menghapus, dan mengubah turnamen mendatang beserta hadiah & slot',
        iconName: 'Sparkles',
        adminTab: 'turnamen-mendatang',
        badge: 'Turnamen Mendatang'
      },
      {
        id: 'adm-2-4',
        title: 'Daftar Tim Terdaftar & Sah',
        subtitle: 'Kelola seluruh tim berstatus SAH yang siap bertanding',
        iconName: 'CheckCircle2',
        adminTab: 'tim',
        filterParam: { status: 'Sah' },
        badge: 'Tim Sah'
      },
      {
        id: 'adm-2-5',
        title: 'Daftar Tim Ditolak / Dihapus',
        subtitle: 'Data pendaftaran yang ditolak atau dipindahkan ke sampah',
        iconName: 'XCircle',
        adminTab: 'baru-dihapus',
        badge: 'Sampah'
      },
      {
        id: 'adm-2-6',
        title: 'Cari Data Tim & Ekspor',
        subtitle: 'Pencarian cepat tim, edit roster, atau unduh format Excel',
        iconName: 'Search',
        adminTab: 'ekspor-data',
        badge: 'Ekspor'
      }
    ]
  },
  {
    id: 'cat-admin-3',
    categoryNumber: 3,
    title: 'JADWAL & PERTANDINGAN',
    iconName: 'Calendar',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300',
      border: 'border-cyan-500/40',
      gradient: 'from-cyan-950/60 to-blue-950/60',
      iconBg: 'bg-cyan-600/20',
      iconText: 'text-cyan-400'
    },
    items: [
      {
        id: 'adm-3-1',
        title: 'Buat & Kelola Jadwal',
        subtitle: 'Tambah match, atur room ID / password & jam bertanding',
        iconName: 'Calendar',
        adminTab: 'jadwal',
        badge: 'Jadwal'
      },
      {
        id: 'adm-3-2',
        title: 'Acak Susunan Tim (32 Tim)',
        subtitle: 'Generate otomatis undian bracket pertandingan 32 slot tim',
        iconName: 'Shuffle',
        adminTab: 'jadwal',
        subAction: 'acak-32',
        badge: 'Acak 32'
      },
      {
        id: 'adm-3-3',
        title: 'Bagan Pohon Susunan Babak',
        subtitle: 'Visualisasi alur bagan turnamen hingga Juara 1',
        iconName: 'GitMerge',
        adminTab: 'jadwal',
        subAction: 'bracket-tree',
        badge: 'Bagan'
      },
      {
        id: 'adm-3-4',
        title: 'Masukkan Skor & Hasil Pertandingan',
        subtitle: 'Input skor pemenang, MVP, dan tentukan tim yang lolos',
        iconName: 'Edit3',
        adminTab: 'hasil-match',
        badge: 'Input Skor'
      },
      {
        id: 'adm-3-5',
        title: 'Konfirmasi Kehadiran Tim',
        subtitle: 'Pantau status absensi kapten & persetujuan tukar jadwal',
        iconName: 'UserCheck',
        adminTab: 'kehadiran',
        badge: 'Kehadiran'
      },
      {
        id: 'adm-3-6',
        title: 'Galeri & Bukti Pertandingan',
        subtitle: 'Unggah tangkapan layar hasil match & foto penyerahan hadiah',
        iconName: 'Image',
        adminTab: 'galeri-bukti',
        badge: 'Galeri'
      }
    ]
  },
  {
    id: 'cat-admin-4',
    categoryNumber: 4,
    title: 'PEMBAYARAN & SALDO',
    iconName: 'CreditCard',
    badge: '6 Sub-Menu',
    themeColor: {
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      border: 'border-emerald-500/40',
      gradient: 'from-emerald-950/60 to-teal-950/60',
      iconBg: 'bg-emerald-600/20',
      iconText: 'text-emerald-400'
    },
    items: [
      {
        id: 'adm-4-1',
        title: 'Metode Pembayaran & QRIS (6 Opsi Terpisah)',
        subtitle: 'Kelola barcode QRIS & biaya: FF, MLBB, Upcoming, Rekomendasi, Taruhan, Tambahan',
        iconName: 'QrCode',
        adminTab: 'metode-pembayaran',
        badge: '6 QRIS Opsi',
        subItems: [
          '🎮 Pendaftaran FF → Upload QRIS + Atur Nominal',
          '📱 Pendaftaran MLBB → Upload QRIS + Atur Nominal',
          '📅 Turnamen Mendatang → Upload QRIS + Atur Nominal',
          '💡 Rekomendasi Fitur → Upload QRIS + Atur Nominal',
          '🎯 Pasang Taruhan → Upload QRIS + Atur Nominal',
          '➕ Pembayaran Tambahan → Upload QRIS + Atur Nominal'
        ]
      },
      {
        id: 'adm-4-2',
        title: 'Top Up Saldo — Menunggu Konfirmasi',
        subtitle: 'Verifikasi bukti transfer & setujui penambahan saldo otomatis',
        iconName: 'ArrowDownLeft',
        adminTab: 'topup-konfirmasi',
        badge: 'Top Up'
      },
      {
        id: 'adm-4-3',
        title: 'Penarikan Saldo — Menunggu Konfirmasi',
        subtitle: 'Pencairan saldo kemenangan member ke rekening / E-Wallet',
        iconName: 'ArrowUpRight',
        adminTab: 'penarikan-konfirmasi',
        badge: 'Withdraw'
      },
      {
        id: 'adm-4-4',
        title: 'Kelola Saldo Pengguna (Tambah / Kurangi Manual)',
        subtitle: 'Koreksi saldo member secara langsung dengan catatan mutasi',
        iconName: 'Wallet',
        adminTab: 'saldo-taruhan',
        badge: 'Saldo Member'
      },
      {
        id: 'adm-4-5',
        title: 'Riwayat Semua Transaksi',
        subtitle: 'Log audit seluruh mutasi, top up, penarikan & taruhan',
        iconName: 'History',
        adminTab: 'saldo-taruhan',
        badge: 'Audit Log'
      },
      {
        id: 'adm-4-6',
        title: 'Laporan Keuangan',
        subtitle: 'Rekapitulasi pemasukan pendaftaran, donasi Saweria & payout',
        iconName: 'FileSpreadsheet',
        adminTab: 'laporan-keuangan',
        badge: 'Laporan'
      }
    ]
  },
  {
    id: 'cat-admin-5',
    categoryNumber: 5,
    title: 'TARUHAN & HASIL',
    iconName: 'Target',
    badge: '3 Menu',
    themeColor: {
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      border: 'border-amber-500/40',
      gradient: 'from-amber-950/60 to-yellow-950/60',
      iconBg: 'bg-amber-600/20',
      iconText: 'text-amber-400'
    },
    items: [
      {
        id: 'adm-5-1',
        title: 'Taruhan Menunggu Konfirmasi',
        subtitle: 'Verifikasi bukti transfer taruhan QRIS (jika saldo tidak cukup)',
        iconName: 'Clock',
        adminTab: 'saldo-taruhan',
        badge: 'Verif Bet'
      },
      {
        id: 'adm-5-2',
        title: 'Riwayat Taruhan & Hasil',
        subtitle: 'Daftar tebakan pengguna yang sedang berjalan dan selesai',
        iconName: 'BarChart2',
        adminTab: 'saldo-taruhan',
        badge: 'Riwayat Bet'
      },
      {
        id: 'adm-5-3',
        title: 'Pembayaran Kemenangan Taruhan',
        subtitle: 'Distribusi otomatis hadiah saldo kemenangan tebak skor/match',
        iconName: 'Coins',
        adminTab: 'saldo-taruhan',
        badge: 'Payout'
      }
    ]
  },
  {
    id: 'cat-admin-6',
    categoryNumber: 6,
    title: 'KELOLA WEBSITE & INFORMASI',
    iconName: 'Globe',
    badge: '6 Menu',
    themeColor: {
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      border: 'border-blue-500/40',
      gradient: 'from-blue-950/60 to-indigo-950/60',
      iconBg: 'bg-blue-600/20',
      iconText: 'text-blue-400'
    },
    items: [
      {
        id: 'adm-6-1',
        title: 'Identitas & Tampilan Website',
        subtitle: 'Ubah nama website, judul, logo, banner latar, tema warna & tulisan footer',
        iconName: 'LayoutTemplate',
        adminTab: 'kelola-beranda',
        badge: 'Identitas',
        subItems: [
          '🏷️ Ubah nama: HUNTERS COMMUNITY',
          '🖼️ Upload Logo Utama & Banner Beranda',
          '🎨 Tema warna utama & Footer DEXZ STORE'
        ]
      },
      {
        id: 'adm-6-2',
        title: 'Tautan Media Sosial & Kontak',
        subtitle: 'Kelola link YouTube, TikTok, Instagram, Discord, WA Admin & info kontak',
        iconName: 'Share2',
        adminTab: 'tautan-info',
        badge: 'Sosmed & Kontak',
        subItems: [
          '📺 YouTube, TikTok, Instagram, Discord',
          '💬 WhatsApp Admin (+62 831-4883-4663)',
          '📧 Email & Alamat resmi panitia'
        ]
      },
      {
        id: 'adm-6-3',
        title: 'Halaman Statis — Tentang Kami & Syarat',
        subtitle: 'Tentang Kami, Syarat & Ketentuan, Kebijakan Privasi, & Cara Pembayaran',
        iconName: 'FileText',
        adminTab: 'aturan',
        badge: 'Halaman Statis',
        subItems: [
          '📖 Tentang Kami (Visi Misi & Pendiri)',
          '⚖️ Syarat & Ketentuan Turnamen',
          '🛡️ Kebijakan Privasi & Cara Pembayaran'
        ]
      },
      {
        id: 'adm-6-4',
        title: 'Jam Operasional & Informasi Bantuan',
        subtitle: 'Atur jam kerja (08.00–22.00 WIB), pesan otomatis luar jam kerja & status online',
        iconName: 'Clock',
        adminTab: 'jam-operasional',
        badge: 'Jam Kerja',
        subItems: [
          '⏰ Jam Operasional: 08.00 – 22.00 WIB',
          '🏖️ Atur Hari Libur & Pesan Otomatis',
          '🟢 Status Admin: Online / Sibuk / Offline'
        ]
      },
      {
        id: 'adm-6-5',
        title: 'Pengaturan Musik Latar Website',
        subtitle: 'Tempel link lagu, putar otomatis saat buka web, & atur volume default',
        iconName: 'Music',
        adminTab: 'musik-latar',
        badge: 'Musik Latar',
        subItems: [
          '🎵 Link audio YouTube / Spotify / Direct URL',
          '▶️ Putar Otomatis saat website dibuka',
          '🔊 Atur Volume Default & Lokasi Pemutaran'
        ]
      },
      {
        id: 'adm-6-6',
        title: 'Simpan Perubahan & Lihat Pratinjau',
        subtitle: 'Simpan semua perubahan, tombol Lihat Pratinjau, Publikasikan & riwayat versi',
        iconName: 'Save',
        adminTab: 'pratinjau-website',
        badge: 'Pratinjau & Rilis',
        subItems: [
          '💾 Simpan Semua Perubahan Kategori 6',
          '👁️ Tombol Lihat Pratinjau Langsung',
          '✅ Publikasikan ke Semua Pengguna'
        ]
      }
    ]
  },
  {
    id: 'cat-admin-7',
    categoryNumber: 7,
    title: 'LAPORAN & PENGATURAN',
    iconName: 'ShieldAlert',
    badge: '7 Menu (Khusus Admin Utama 🔒)',
    themeColor: {
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300',
      border: 'border-rose-500/40',
      gradient: 'from-rose-950/60 to-purple-950/60',
      iconBg: 'bg-rose-600/20',
      iconText: 'text-rose-400'
    },
    items: [
      {
        id: 'adm-7-1',
        title: 'Laporan Lengkap & Statistik Website',
        subtitle: 'Total user terdaftar, user aktif, pendaftaran FF & MLBB, pendapatan, grafik & ekspor',
        iconName: 'TrendingUp',
        adminTab: 'statistik',
        badge: 'Laporan & Statistik',
        subItems: [
          '👥 Total & Aktif User Hari Ini',
          '💰 Total Pendapatan & Match Selesai',
          '📥 Unduh Laporan PDF, Excel, CSV'
        ]
      },
      {
        id: 'adm-7-2',
        title: 'Kelola Admin Tambahan & Izin Akses',
        subtitle: 'Tambah akun admin baru, atur hak akses per menu (Lihat/Ubah/Blokir) & ganti sandi',
        iconName: 'Users',
        adminTab: 'admin-accounts',
        badge: 'Izin Akses Admin',
        subItems: [
          '➕ Tambah Admin Baru (Email + Password)',
          '🔐 Izin Per Menu (Keuangan / Jadwal / Tim)',
          '👑 Admin Utama Akses Penuh Mutlak'
        ]
      },
      {
        id: 'adm-7-3',
        title: 'Cadangkan & Pulihkan Data Website',
        subtitle: 'Buat snapshot cadangan ke Firebase/JSON, pulihkan data tanggal tertentu & unduh file',
        iconName: 'Database',
        adminTab: 'backup-restore',
        badge: 'Backup & Restore',
        subItems: [
          '💾 Buat Cadangan Baru ke Firebase',
          '📅 Daftar Cadangan & Pulihkan Data',
          '📥 Unduh Cadangan JSON ke Perangkat'
        ]
      },
      {
        id: 'adm-7-4',
        title: 'Pengaturan Keamanan & Privasi',
        subtitle: 'Auto logout inaktif, limit percobaan login 5x, verifikasi email, enkripsi & sensor HP',
        iconName: 'Lock',
        adminTab: 'keamanan-sistem',
        badge: 'Keamanan Sistem',
        subItems: [
          '⏱️ Auto Logout (15m / 30m / 1 jam)',
          '🚫 Batasi Percobaan Login (5x Salah)',
          '🛡️ Enkripsi Data & Sensor No. HP'
        ]
      },
      {
        id: 'adm-7-5',
        title: 'Log Aktivitas — Riwayat Semua Perubahan',
        subtitle: 'Catatan SIAPA, KAPAN, & APA yang diubah di Panel Admin secara permanen untuk audit',
        iconName: 'FileClock',
        adminTab: 'riwayat-perubahan',
        badge: 'Audit Log',
        subItems: [
          '📝 Log detail: Nama, Waktu, Menu, & Aksi',
          '🔍 Filter Admin, Tanggal, & Jenis Aksi',
          '📜 Arsip Permanen (Anti-Hapus Audit)'
        ]
      },
      {
        id: 'adm-7-6',
        title: 'Pengaturan Sistem & Hubungan Firebase',
        subtitle: 'Status koneksi Firebase, batasi user online, bersihkan data lama & cek sinkronisasi',
        iconName: 'Cpu',
        adminTab: 'sinkronisasi-data',
        badge: 'Koneksi Firebase',
        subItems: [
          '🟢 Status Hubungan Firestore Realtime',
          '⚡ Pengaturan Latensi & Batas User Online',
          '🧹 Bersihkan Arsip & Data Lama'
        ]
      },
      {
        id: 'adm-7-7',
        title: 'Sistem Pengiriman — Minta Sambungan & Kirim Otomatis',
        subtitle: 'Tempel alamat lengkap + Kunci Sah Penerima, persetujuan Pemilik Utama & berkas baru terkirim otomatis',
        iconName: 'Share2',
        adminTab: 'sinkronisasi-data',
        badge: 'Kirim Otomatis 🚀',
        subItems: [
          '🎯 Salin KUNCI SAH dari halaman Penerima',
          '⏳ Status MENUNGGU PERSETUJUAN Pemilik Tujuan',
          '⚡ Berkas baru otomatis terkirim tanpa klik tambahan'
        ]
      }
    ]
  }
];
