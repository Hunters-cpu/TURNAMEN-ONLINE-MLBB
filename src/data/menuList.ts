export interface MenuItem {
  id: number;
  title: string;
  description: string;
  category: string;
  tab: string;
  subTab?: string;
  icon: string;
  badge?: string;
}

export const PUBLIC_USER_MENUS_40: MenuItem[] = [
  {
    id: 1,
    title: "HALAMAN BERANDA",
    description: "Halaman pembuka utama dengan sambutan resmi, pengumuman terbaru, turnamen berjalan, jumlah tim mendaftar, & pengingat match.",
    category: "Utama",
    tab: "beranda",
    icon: "Home",
    badge: "Utama"
  },
  {
    id: 2,
    title: "PENGUMUMAN RESMI",
    description: "Melihat semua pemberitahuan resmi yang diterbitkan Admin dari yang terbaru di paling atas.",
    category: "Informasi",
    tab: "pengumuman",
    icon: "Megaphone",
    badge: "Resmi"
  },
  {
    id: 3,
    title: "DAFTAR MENJADI PESERTA",
    description: "Formulir pendaftaran tim turnamen FF & MLBB langsung masuk daftar tunggu Admin.",
    category: "Turnamen",
    tab: "form-pendaftaran",
    icon: "FileSpreadsheet",
    badge: "Daftar"
  },
  {
    id: 4,
    title: "DAFTAR TIM TERDAFTAR",
    description: "Daftar lengkap tim berstatus SAH yang sudah disetujui Admin difilter game FF atau MLBB.",
    category: "Turnamen",
    tab: "tim",
    icon: "Users",
    badge: "Tim Sah"
  },
  {
    id: 5,
    title: "DAFTAR TURNAMEN FF",
    description: "Informasi lengkap turnamen Free Fire: tanggal, biaya pendaftaran, total hadiah, syarat, & sisa slot.",
    category: "Turnamen",
    tab: "ff",
    icon: "Flame",
    badge: "FF"
  },
  {
    id: 6,
    title: "DAFTAR TURNAMEN MLBB",
    description: "Informasi lengkap turnamen Mobile Legends: rincian slot, biaya, tanggal pendaftaran, & hadiah.",
    category: "Turnamen",
    tab: "mlbb",
    icon: "Swords",
    badge: "MLBB"
  },
  {
    id: 7,
    title: "CARI JADWAL TIM",
    description: "Cari jadwal pertandingan instan cukup dengan mengetikkan nama tim Anda.",
    category: "Match",
    tab: "info-match",
    subTab: "cari-jadwal",
    icon: "Search",
    badge: "Cari Match"
  },
  {
    id: 8,
    title: "JADWAL & HASIL PERTANDINGAN",
    description: "Melihat seluruh daftar pertandingan, jam bertanding, filter babak, dan hasil akhir.",
    category: "Match",
    tab: "info-match",
    subTab: "jadwal",
    icon: "Calendar",
    badge: "Jadwal"
  },
  {
    id: 9,
    title: "KONFIRMASI KEHADIRAN",
    description: "Konfirmasi SIAP / BELUM SIAP bertanding kapten tim dan pengajuan tukar jadwal lawan.",
    category: "Match",
    tab: "info-match",
    subTab: "kehadiran",
    icon: "UserCheck",
    badge: "Absen"
  },
  {
    id: 10,
    title: "BAGAN POHON SUSUNAN BABAK",
    description: "Alur pasangan pertandingan visual dari Penyisihan, 16 Besar, Semifinal hingga Grand Final.",
    category: "Match",
    tab: "info-match",
    subTab: "bracket",
    icon: "GitMerge",
    badge: "Bagan"
  },
  {
    id: 11,
    title: "SALDO ANDA",
    description: "Melihat jumlah saldo milik sendiri secara pribadi. Saldo terpisah dan aman per pengguna.",
    category: "Keuangan",
    tab: "saldo",
    subTab: "pribadi",
    icon: "Wallet",
    badge: "Saldo"
  },
  {
    id: 12,
    title: "TOP UP SALDO",
    description: "Tambah saldo akun dengan membayar lewat QRIS atau E-Wallet dan unggah bukti bayar.",
    category: "Keuangan",
    tab: "saldo",
    subTab: "topup",
    icon: "CreditCard",
    badge: "Top Up"
  },
  {
    id: 13,
    title: "PENARIKAN SALDO",
    description: "Meminta pencairan saldo akun ke rekening bank atau E-Wallet sendiri.",
    category: "Keuangan",
    tab: "saldo",
    subTab: "withdrawal",
    icon: "ArrowUpRight",
    badge: "Withdraw"
  },
  {
    id: 14,
    title: "RIWAYAT TRANSAKSI",
    description: "Catatan lengkap mutasi saldo: Top Up, Taruhan Menang/Kalah, Penarikan, & Kiriman.",
    category: "Keuangan",
    tab: "saldo",
    subTab: "mutasi",
    icon: "History",
    badge: "Mutasi"
  },
  {
    id: 15,
    title: "PASANG TARUHAN",
    description: "Menebak tim pemenang pertandingan dan memasang saldo sebagai taruhan secara realtime.",
    category: "Keuangan",
    tab: "prediksi",
    subTab: "pasang",
    icon: "Target",
    badge: "Taruhan"
  },
  {
    id: 16,
    title: "RIWAYAT TARUHAN",
    description: "Melihat semua daftar taruhan yang pernah dipasang beserta hasil MENANG atau KALAH.",
    category: "Keuangan",
    tab: "prediksi",
    subTab: "riwayat",
    icon: "TrendingUp",
    badge: "Hasil Betting"
  },
  {
    id: 17,
    title: "HASIL PERTANDINGAN & PERINGKAT",
    description: "Daftar pemenang match selesai dan tabel klasemen peringkat tim berdasarkan poin.",
    category: "Match",
    tab: "info-match",
    subTab: "hasil",
    icon: "Trophy",
    badge: "Klasemen"
  },
  {
    id: 18,
    title: "ARSIP TURNAMEN LALU",
    description: "Riwayat turnamen lama yang telah berakhir beserta daftar tim dan Juara 1-4 secara permanen.",
    category: "Informasi",
    tab: "arsip",
    icon: "Archive",
    badge: "Arsip"
  },
  {
    id: 19,
    title: "HUBUNGI CS / BANTUAN",
    description: "Kirim pertanyaan & dijawab otomatis oleh AI Assistant CS tanpa perlu menunggu Admin.",
    category: "Bantuan",
    tab: "bantuan",
    icon: "MessageSquare",
    badge: "AI CS"
  },
  {
    id: 20,
    title: "LAPORAN SENGKETA & BANDING",
    description: "Formulir pengajuan keberatan / sengketa hasil pertandingan beserta lampiran bukti foto/video.",
    category: "Bantuan",
    tab: "info-match",
    subTab: "sengketa",
    icon: "ShieldAlert",
    badge: "Sengketa"
  },
  {
    id: 21,
    title: "GALERI & BUKTI PERTANDINGAN",
    description: "Melihat foto, tangkapan layar, atau rekaman pertandingan yang diunggah Admin.",
    category: "Informasi",
    tab: "info-match",
    subTab: "galeri",
    icon: "ImageIcon",
    badge: "Galeri"
  },
  {
    id: 22,
    title: "KODE RUANG PERTANDINGAN",
    description: "Melihat kode ruang dan sandi untuk masuk ke dalam pertandingan.",
    category: "Match",
    tab: "info-match",
    subTab: "kodearuang",
    icon: "Key",
    badge: "Room Code"
  },
  {
    id: 23,
    title: "USULAN & MASUKAN",
    description: "Mengirim saran, ide fitur baru, atau masukan untuk perbaikan website.",
    category: "Bantuan",
    tab: "bantuan",
    subTab: "usulan",
    icon: "MessageSquare",
    badge: "Usulan"
  },
  {
    id: 24,
    title: "BAGIKAN JADWAL",
    description: "Menyalin jadwal pertandingan siap dikirim ke teman atau grup WhatsApp.",
    category: "Fitur",
    tab: "bagikan",
    icon: "Share2",
    badge: "Bagikan"
  },
  {
    id: 25,
    title: "KODE QR JADWAL TIM",
    description: "Menampilkan kode QR yang berisi informasi jadwal tim.",
    category: "Match",
    tab: "info-match",
    subTab: "qr-jadwal",
    icon: "QrCode",
    badge: "QR Code"
  },
  {
    id: 26,
    title: "UNDUH DAFTAR TIM",
    description: "Mengunduh daftar lengkap tim peserta sebagai file PDF atau Excel.",
    category: "Turnamen",
    tab: "tim",
    subTab: "unduh-tim",
    icon: "Download",
    badge: "Unduh Tim"
  },
  {
    id: 27,
    title: "TOP UP GAME REKOMENDASI",
    description: "Membuka toko resmi rekomendasi untuk membeli Diamond/Item FF & MLBB.",
    category: "Keuangan",
    tab: "topup-game",
    icon: "ShoppingCart",
    badge: "Top Up Game"
  },
  {
    id: 28,
    title: "PENGATURAN NOTIFIKASI",
    description: "Mengatur apa saja yang boleh dikirim sebagai notifikasi ke HP.",
    category: "Pengaturan",
    tab: "pengaturan-umum",
    subTab: "notifikasi",
    icon: "Bell",
    badge: "Notifikasi"
  },
  {
    id: 29,
    title: "PENGATURAN AKUN",
    description: "Melihat dan mengubah informasi akun milik sendiri.",
    category: "Akun",
    tab: "login",
    subTab: "profil",
    icon: "User",
    badge: "Akun"
  },
  {
    id: 30,
    title: "UNDUH APLIKASI",
    description: "Mengunduh file APK agar bisa dipasang dan dibuka sebagai aplikasi di HP.",
    category: "Aplikasi",
    tab: "unduh-apk",
    icon: "Smartphone",
    badge: "APK Android"
  },
  {
    id: 31,
    title: "STATISTIK PERTANDINGAN",
    description: "Melihat data umum pertandingan: tim paling sering menang, hero terpopuler, & winrate.",
    category: "Match",
    tab: "info-match",
    subTab: "statistik",
    icon: "BarChart3",
    badge: "Statistik"
  },
  {
    id: 32,
    title: "TIM UNGGULAN & PREDIKSI",
    description: "Melihat tim yang dianggap kuat dan perkiraan siapa yang akan menang.",
    category: "Match",
    tab: "prediksi",
    subTab: "unggulan",
    icon: "Star",
    badge: "Unggulan"
  },
  {
    id: 33,
    title: "SISTEM POIN",
    description: "Melihat berapa poin yang dimiliki tim dan urutan peringkat berdasarkan poin.",
    category: "Match",
    tab: "info-match",
    subTab: "sistem-poin",
    icon: "Award",
    badge: "Poin"
  },
  {
    id: 34,
    title: "UBAH DATA PENDAFTARAN",
    description: "Memperbaiki nama tim atau data pendaftaran sebelum disahkan Admin.",
    category: "Turnamen",
    tab: "info-match",
    subTab: "ubah-data",
    icon: "Edit3",
    badge: "Ubah Data"
  },
  {
    id: 35,
    title: "PUSAT KECERDASAN GEMINI AI",
    description: "Chatbot strategi turnamen, live patch search, generator logo 1K-4K & analisis taktis High Thinking.",
    category: "AI & Fitur",
    tab: "gemini-ai",
    icon: "Bot",
    badge: "Gemini AI"
  },
  {
    id: 36,
    title: "KALENDER TURNAMEN",
    description: "Melihat jadwal pertandingan dalam tampilan kalender bulanan.",
    category: "Match",
    tab: "info-match",
    subTab: "kalender",
    icon: "Calendar",
    badge: "Kalender"
  },
  {
    id: 37,
    title: "DONASI / BERI DUKUNGAN",
    description: "Beri dukungan donasi turnamen via Saweria QRIS otomatis terhubung ke Firebase & tampil di Top Penyumbang.",
    category: "Keuangan",
    tab: "donasi",
    icon: "Heart",
    badge: "Saweria QRIS"
  },
  {
    id: 38,
    title: "TATA TERTIB & ATURAN",
    description: "Membaca seluruh aturan resmi turnamen, sanksi, dan ketentuan.",
    category: "Informasi",
    tab: "aturan",
    icon: "FileText",
    badge: "Aturan"
  },
  {
    id: 39,
    title: "KEAMANAN & PRIVASI",
    description: "Melihat informasi perlindungan data pribadi pengguna.",
    category: "Informasi",
    tab: "pengaturan-umum",
    subTab: "keamanan",
    icon: "Lock",
    badge: "Privasi"
  },
  {
    id: 40,
    title: "KELUAR DARI AKUN",
    description: "Mengakhiri sesi login dan mengamankan akun dari pengguna lain.",
    category: "Akun",
    tab: "login",
    subTab: "logout",
    icon: "LogIn",
    badge: "Keluar"
  }
];

export const ADMIN_MENUS_40 = [
  { id: 1, title: "RINGKASAN PUSAT", adminTab: "beranda", description: "Statistik umum tim, pengguna, saldo, pendaftaran pending, & antrean transaksi." },
  { id: 2, title: "KELOLA DAFTAR TIM", adminTab: "tim", description: "Konfirmasi slot tim (SAH / DITOLAK), edit data tim, hapus, dan unduh berkas." },
  { id: 3, title: "KELOLA JADWAL PERTANDINGAN", adminTab: "jadwal", description: "Tambah jadwal baru, tentukan pemenang, ubah status match, & input room code." },
  { id: 4, title: "TERBITKAN PENGUMUMAN", adminTab: "pengumuman", description: "Tulis dan terbitkan pengumuman resmi dengan notifikasi push otomatis ke HP." },
  { id: 5, title: "KELOLA PENGGUNA", adminTab: "pengguna", description: "Daftar semua pengguna, email, HP, nama tim, saldo, riwayat aktivitas, role & hak akses khusus." },
  { id: 6, title: "KONFIRMASI TOP UP SALDO", adminTab: "topup-konfirmasi", description: "Periksa bukti transfer/QRIS, konfirmasi SAH untuk menambah saldo otomatis, atau TOLAK." },
  { id: 7, title: "KONFIRMASI PENARIKAN SALDO", adminTab: "penarikan-konfirmasi", description: "Proses penarikan saldo pengguna ke rekening/e-wallet, potong saldo otomatis, atau TOLAK." },
  { id: 8, title: "TINJAU SENGKETA & BANDING", adminTab: "sengketa", description: "Periksa laporan sengketa kecurangan, lihat bukti foto/video, & putuskan hasil." },
  { id: 9, title: "ATUR METODE PEMBAYARAN", adminTab: "metode-pembayaran", description: "Atur gambar QRIS, nomor DANA, OVO, GoPay, ShopeePay, LinkAja & Bank." },
  { id: 10, title: "PENGATURAN UMUM WEBSITE", adminTab: "form-config", description: "Buka/tutup pendaftaran, ubah biaya slot FF/MLBB, & ubah tanggal countdown." },
  { id: 11, title: "PULIHKAN / HAPUS DATA", adminTab: "baru-dihapus", description: "Sampah data tim, jadwal, & pengumuman yang dihapus untuk dipulihkan/permanen." },
  { id: 12, title: "PENGATURAN BOT WHATSAPP", adminTab: "wa-bot", description: "Status penautan Bot WhatsApp, QR code pairing, & perintah balasan WA." },
  { id: 13, title: "KIRIM PESAN KE PENGGUNA", adminTab: "kirim-pesan", description: "Kirim pesan khusus personal/massal langsung ke notifikasi perangkat pengguna." },
  { id: 14, title: "TARIK SALDO DONASI", adminTab: "tarik-donasi", description: "Melihat total saldo donasi Saweria, petunjuk penarikan uang nyata dari Saweria ke Bank/E-Wallet & riwayat permanen Firebase." },
  { id: 15, title: "KELOLA AKUN ADMIN", adminTab: "admin-accounts", description: "Tambah Admin baru, atur password, atur hak akses, atau hapus Admin lain." },
  { id: 16, title: "KELOLA ATURAN TURNAMEN", adminTab: "aturan", description: "Ubah aturan main, syarat pendaftaran, sanksi, & ketentuan per babak." },
  { id: 17, title: "UNGGAH BUKTI & GALERI", adminTab: "galeri-bukti", description: "Unggah dokumentasi foto/video pertandingan ke halaman Galeri publik." },
  { id: 18, title: "KELOLA TAUTAN & INFORMASI", adminTab: "tautan-info", description: "Ubah tautan grup WA, link topup rekomendasi, link APK & nomor CS." },
  { id: 19, title: "LIHAT STATISTIK KESELURUHAN", adminTab: "statistik", description: "Analisis harian pendaftaran, rasio kemenangan team, & perputaran saldo." },
  { id: 20, title: "EKSPOR DATA PENGGUNA & TIM", adminTab: "ekspor-data", description: "Unduh seluruh data tim terdaftar & pengguna ke format Excel / CSV." },
  { id: 21, title: "KIRIM NOTIFIKASI PENGINGAT", adminTab: "kirim-pengingat", description: "Kirim pengingat tanding otomatis ke kapten tim 30 menit sebelum match." },
  { id: 22, title: "KELUARKAN / BLOKIR PENGGUNA", adminTab: "blacklist", description: "Daftar pemblokiran akun/nomor WA pengguna nakal dari sistem." },
  { id: 23, title: "UBAH DATA PENGGUNA & TIM", adminTab: "ubah-data-req", description: "Setujui/ubah data nama tim, nomor WA, & roster pemain sesuai pengajuan." },
  { id: 24, title: "LIHAT RIWAYAT PERUBAHAN DATA", adminTab: "riwayat-perubahan", description: "Log audit perubahan data oleh Admin beserta timestamp & ID pelaku." },
  { id: 25, title: "KELOLA SISTEM POIN & PERINGKAT", adminTab: "sistem-poin", description: "Atur poin menang, kalah, & seri untuk akumulasi otomatis klasemen." },
  { id: 26, title: "LIHAT LAPORAN SENJA", adminTab: "laporan-senja", description: "Ringkasan harian pendaftaran, match selesai, mutasi saldo, & WA bot." },
  { id: 27, title: "ATUR TURNAMEN MENDATANG", adminTab: "turnamen-mendatang", description: "Menambahkan, menghapus, dan mengubah turnamen mendatang beserta hadiah, slot, tanggal & rules." },
  { id: 28, title: "PENGUMUMAN PENTING", adminTab: "pengumuman-penting", description: "Tampilkan pengumuman menonjol di bagian paling atas beranda." },
  { id: 29, title: "KELOLA TOP UP REKOMENDASI", adminTab: "topup-rekomendasi", description: "Atur tautan & informasi toko Top Up Game rekomendasi DEXZ STORE." },
  { id: 30, title: "KELOLA TAUTAN UNDUH APLIKASI", adminTab: "download-apk", description: "Unggah & perbarui berkas APK Android HUNTERS COMMUNITY versi terbaru." },
  { id: 31, title: "LIHAT ARSIP TURNAMEN", adminTab: "arsip-turnamen", description: "Melihat seluruh riwayat turnamen yang sudah selesai secara permanen." },
  { id: 32, title: "HUBUNGKAN KE WEBSITE LAIN", adminTab: "sinkronisasi-data", description: "Cukup masukkan URL website tujuan, sistem otomatis menghubungkan & mengirim foto, video, bukti pembayaran, dan file secara nyata." },
  { id: 33, title: "KIRIM PERINTAH LEWAT BOT WHATSAPP", adminTab: "wa-bot-cmd", description: "Berikan perintah ke website langsung dari WhatsApp tanpa membuka Panel Admin." },
  { id: 34, title: "KELOLA HALAMAN BERANDA", adminTab: "kelola-beranda", description: "Mengubah tampilan, tulisan, & informasi yang muncul di halaman depan." },
  { id: 35, title: "LIHAT LAPORAN MASALAH & USULAN", adminTab: "laporan-masalah", description: "Melihat usulan fitur dan laporan masalah yang dikirim pengguna." },
  { id: 36, title: "ATUR NOTIFIKASI OTOMATIS", adminTab: "notif-otomatis", description: "Mengatur kapan saja notifikasi otomatis dikirim ke pengguna." },
  { id: 37, title: "TETAPKAN JUARA & PENUTUPAN TURNAMEN", adminTab: "penutupan-turnamen", description: "Tetapkan pemenang terakhir (Juara 1-4) dan akhiri turnamen secara resmi." },
  { id: 38, title: "HAPUS DATA LAMA", adminTab: "hapus-data-lama", description: "Menghapus data yang sudah tidak dipakai lagi agar sistem tetap ringan." },
  { id: 39, title: "UBAH KATA SANDI & LOGIN ADMIN", adminTab: "ubah-password-admin", description: "Mengubah kata sandi Panel Admin dan mengamankan akses masuk." },
  { id: 40, title: "UBAH WEBSITE DENGAN PERINTAH TEKS", adminTab: "ai-text-cmd", description: "Ubah tampilan atau fitur website cukup dengan menulis perintah bahasa sehari-hari." }
];

export interface MenuColorStyle {
  bg: string;
  border: string;
  text: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  accentBg?: string;
  hoverBorder?: string;
}

const MENU_COLOR_PALETTES: MenuColorStyle[] = [
  // 1: Royal Purple (Kat 1: Ringkasan & Utama) - Ringkasan Pusat
  { bg: 'bg-purple-950/80', border: 'border-purple-500/70', text: 'text-purple-300', glow: 'shadow-purple-900/50', badgeBg: 'bg-purple-600', badgeText: 'text-white', gradient: 'from-purple-600 via-indigo-700 to-slate-950', accentBg: 'bg-purple-500/15', hoverBorder: 'hover:border-purple-400' },
  // 2: Sunset Orange (Kat 2: Pendaftaran & Tim) - Kelola Daftar Tim
  { bg: 'bg-orange-950/80', border: 'border-orange-500/70', text: 'text-orange-300', glow: 'shadow-orange-900/50', badgeBg: 'bg-orange-600', badgeText: 'text-white', gradient: 'from-orange-500 via-amber-600 to-red-900', accentBg: 'bg-orange-500/15', hoverBorder: 'hover:border-orange-400' },
  // 3: Cyber Cyan (Kat 3: Match & Turnamen) - Kelola Jadwal Pertandingan
  { bg: 'bg-cyan-950/80', border: 'border-cyan-500/70', text: 'text-cyan-300', glow: 'shadow-cyan-900/50', badgeBg: 'bg-cyan-500', badgeText: 'text-slate-950', gradient: 'from-cyan-500 via-blue-600 to-indigo-900', accentBg: 'bg-cyan-500/15', hoverBorder: 'hover:border-cyan-400' },
  // 4: Electric Violet (Kat 1: Ringkasan & Utama) - Terbitkan Pengumuman
  { bg: 'bg-violet-950/80', border: 'border-violet-500/70', text: 'text-violet-300', glow: 'shadow-violet-900/50', badgeBg: 'bg-violet-600', badgeText: 'text-white', gradient: 'from-violet-600 via-purple-700 to-black', accentBg: 'bg-violet-500/15', hoverBorder: 'hover:border-violet-400' },
  // 5: Imperial Gold (Kat 5: Pengguna & Akun) - Kelola Pengguna
  { bg: 'bg-yellow-950/80', border: 'border-yellow-500/70', text: 'text-yellow-300', glow: 'shadow-yellow-900/50', badgeBg: 'bg-yellow-500', badgeText: 'text-slate-950', gradient: 'from-yellow-400 via-amber-500 to-orange-700', accentBg: 'bg-yellow-500/15', hoverBorder: 'hover:border-yellow-400' },
  // 6: Mint Emerald (Kat 4: Keuangan & Saldo) - Konfirmasi Top Up Saldo
  { bg: 'bg-emerald-950/80', border: 'border-emerald-500/70', text: 'text-emerald-300', glow: 'shadow-emerald-900/50', badgeBg: 'bg-emerald-600', badgeText: 'text-white', gradient: 'from-emerald-600 via-teal-700 to-slate-900', accentBg: 'bg-emerald-500/15', hoverBorder: 'hover:border-emerald-400' },
  // 7: Vivid Jade Teal (Kat 4: Keuangan & Saldo) - Konfirmasi Penarikan Saldo
  { bg: 'bg-teal-950/80', border: 'border-teal-500/70', text: 'text-teal-300', glow: 'shadow-teal-900/50', badgeBg: 'bg-teal-600', badgeText: 'text-white', gradient: 'from-teal-600 via-cyan-700 to-slate-900', accentBg: 'bg-teal-500/15', hoverBorder: 'hover:border-teal-400' },
  // 8: Sky Azure (Kat 3: Match & Turnamen) - Tinjau Sengketa & Banding
  { bg: 'bg-sky-950/80', border: 'border-sky-500/70', text: 'text-sky-300', glow: 'shadow-sky-900/50', badgeBg: 'bg-sky-500', badgeText: 'text-slate-950', gradient: 'from-sky-500 via-blue-600 to-indigo-950', accentBg: 'bg-sky-500/15', hoverBorder: 'hover:border-sky-400' },
  // 9: Neon Green Emerald (Kat 4: Keuangan & Saldo) - Atur Metode Pembayaran (6 QRIS)
  { bg: 'bg-emerald-950/80', border: 'border-emerald-400/70', text: 'text-emerald-300', glow: 'shadow-emerald-900/50', badgeBg: 'bg-emerald-500', badgeText: 'text-slate-950', gradient: 'from-emerald-500 via-teal-600 to-slate-900', accentBg: 'bg-emerald-500/15', hoverBorder: 'hover:border-emerald-300' },
  // 10: Electric Rose (Kat 7: Sistem & Pengaturan) - Pengaturan Umum Website
  { bg: 'bg-rose-950/80', border: 'border-rose-500/70', text: 'text-rose-300', glow: 'shadow-rose-900/50', badgeBg: 'bg-rose-600', badgeText: 'text-white', gradient: 'from-rose-600 via-red-700 to-slate-950', accentBg: 'bg-rose-500/15', hoverBorder: 'hover:border-rose-400' },
  // 11: Ruby Crimson (Kat 7: Sistem & Pengaturan) - Pulihkan / Hapus Data
  { bg: 'bg-red-950/80', border: 'border-red-500/70', text: 'text-red-300', glow: 'shadow-red-900/50', badgeBg: 'bg-red-600', badgeText: 'text-white', gradient: 'from-red-600 via-red-700 to-red-900', accentBg: 'bg-red-500/15', hoverBorder: 'hover:border-red-400' },
  // 12: WhatsApp Green (Kat 6: Bot WA & AI) - Pengaturan Bot WhatsApp
  { bg: 'bg-green-950/80', border: 'border-green-500/70', text: 'text-green-300', glow: 'shadow-green-900/50', badgeBg: 'bg-green-600', badgeText: 'text-white', gradient: 'from-green-600 via-emerald-700 to-slate-950', accentBg: 'bg-green-500/15', hoverBorder: 'hover:border-green-400' },
  // 13: Sunflower Yellow (Kat 5: Pengguna & Akun) - Kirim Pesan ke Pengguna
  { bg: 'bg-yellow-950/80', border: 'border-yellow-400/70', text: 'text-yellow-200', glow: 'shadow-yellow-900/50', badgeBg: 'bg-yellow-400', badgeText: 'text-slate-950', gradient: 'from-yellow-400 via-amber-500 to-orange-700', accentBg: 'bg-yellow-400/15', hoverBorder: 'hover:border-yellow-300' },
  // 14: Seafoam Jade (Kat 4: Keuangan & Saldo) - Tarik Saldo Donasi / Saweria
  { bg: 'bg-teal-950/80', border: 'border-teal-400/70', text: 'text-teal-200', glow: 'shadow-teal-900/50', badgeBg: 'bg-teal-500', badgeText: 'text-slate-950', gradient: 'from-teal-500 via-emerald-600 to-cyan-950', accentBg: 'bg-teal-500/15', hoverBorder: 'hover:border-teal-300' },
  // 15: Honey Amber (Kat 5: Pengguna & Akun) - Kelola Akun Admin
  { bg: 'bg-amber-950/80', border: 'border-amber-500/70', text: 'text-amber-300', glow: 'shadow-amber-900/50', badgeBg: 'bg-amber-500', badgeText: 'text-slate-950', gradient: 'from-amber-500 via-yellow-600 to-stone-900', accentBg: 'bg-amber-500/15', hoverBorder: 'hover:border-amber-400' },
  // 16: Cobalt Blue (Kat 3: Match & Turnamen) - Kelola Aturan Turnamen
  { bg: 'bg-blue-950/90', border: 'border-blue-500/70', text: 'text-blue-300', glow: 'shadow-blue-900/50', badgeBg: 'bg-blue-600', badgeText: 'text-white', gradient: 'from-blue-600 via-indigo-700 to-slate-950', accentBg: 'bg-blue-500/15', hoverBorder: 'hover:border-blue-400' },
  // 17: Coral Blush (Kat 7: Sistem & Pengaturan) - Unggah Bukti & Galeri
  { bg: 'bg-rose-950/80', border: 'border-rose-400/70', text: 'text-rose-200', glow: 'shadow-rose-900/50', badgeBg: 'bg-rose-500', badgeText: 'text-white', gradient: 'from-rose-500 via-pink-600 to-purple-950', accentBg: 'bg-rose-500/15', hoverBorder: 'hover:border-rose-300' },
  // 18: Golden Apricot (Kat 2: Pendaftaran & Tim) - Kelola Tautan & Informasi
  { bg: 'bg-amber-950/80', border: 'border-amber-400/70', text: 'text-amber-300', glow: 'shadow-amber-900/50', badgeBg: 'bg-amber-500', badgeText: 'text-slate-950', gradient: 'from-amber-500 via-orange-600 to-red-700', accentBg: 'bg-amber-500/15', hoverBorder: 'hover:border-amber-300' },
  // 19: Deep Indigo (Kat 1: Ringkasan & Utama) - Lihat Statistik Keseluruhan
  { bg: 'bg-indigo-950/90', border: 'border-indigo-400/70', text: 'text-indigo-200', glow: 'shadow-indigo-900/50', badgeBg: 'bg-indigo-600', badgeText: 'text-white', gradient: 'from-indigo-600 via-purple-700 to-black', accentBg: 'bg-indigo-500/15', hoverBorder: 'hover:border-indigo-300' },
  // 20: Coral Ember (Kat 2: Pendaftaran & Tim) - Ekspor Data Pengguna & Tim
  { bg: 'bg-orange-950/90', border: 'border-orange-400/70', text: 'text-orange-300', glow: 'shadow-orange-900/50', badgeBg: 'bg-orange-600', badgeText: 'text-white', gradient: 'from-orange-500 via-red-600 to-purple-900', accentBg: 'bg-orange-500/15', hoverBorder: 'hover:border-orange-300' },
  // 21: Arctic Cyan (Kat 3: Match & Turnamen) - Kirim Notifikasi Pengingat
  { bg: 'bg-cyan-950/90', border: 'border-cyan-400/70', text: 'text-cyan-200', glow: 'shadow-cyan-900/50', badgeBg: 'bg-cyan-400', badgeText: 'text-slate-950', gradient: 'from-cyan-400 via-blue-500 to-indigo-900', accentBg: 'bg-cyan-400/15', hoverBorder: 'hover:border-cyan-300' },
  // 22: Deep Goldenrod (Kat 5: Pengguna & Akun) - Keluarkan / Blokir Pengguna
  { bg: 'bg-amber-950/90', border: 'border-amber-600/80', text: 'text-amber-300', glow: 'shadow-amber-950/70', badgeBg: 'bg-amber-700', badgeText: 'text-white', gradient: 'from-amber-700 via-yellow-800 to-black', accentBg: 'bg-amber-600/15', hoverBorder: 'hover:border-amber-500' },
  // 23: Warm Amber (Kat 2: Pendaftaran & Tim) - Ubah Data Pengguna & Tim
  { bg: 'bg-amber-950/90', border: 'border-amber-500/70', text: 'text-amber-300', glow: 'shadow-amber-900/50', badgeBg: 'bg-amber-600', badgeText: 'text-white', gradient: 'from-amber-600 via-yellow-700 to-stone-900', accentBg: 'bg-amber-600/15', hoverBorder: 'hover:border-amber-400' },
  // 24: Scarlet Rose (Kat 7: Sistem & Pengaturan) - Lihat Riwayat Perubahan Data
  { bg: 'bg-rose-950/90', border: 'border-rose-400/70', text: 'text-rose-200', glow: 'shadow-rose-900/50', badgeBg: 'bg-rose-500', badgeText: 'text-white', gradient: 'from-rose-500 via-red-600 to-neutral-900', accentBg: 'bg-rose-500/15', hoverBorder: 'hover:border-rose-300' },
  // 25: Ice Blue (Kat 3: Match & Turnamen) - Kelola Sistem Poin & Peringkat
  { bg: 'bg-sky-950/90', border: 'border-sky-400/80', text: 'text-sky-200', glow: 'shadow-sky-900/60', badgeBg: 'bg-sky-400', badgeText: 'text-slate-950', gradient: 'from-sky-400 via-cyan-500 to-blue-800', accentBg: 'bg-sky-400/15', hoverBorder: 'hover:border-sky-300' },
  // 26: Bright Mint (Kat 4: Keuangan & Saldo) - Lihat Laporan Keuangan & Senja
  { bg: 'bg-emerald-950/80', border: 'border-emerald-400/70', text: 'text-emerald-200', glow: 'shadow-emerald-900/50', badgeBg: 'bg-emerald-500', badgeText: 'text-slate-950', gradient: 'from-emerald-400 via-teal-500 to-cyan-900', accentBg: 'bg-emerald-400/15', hoverBorder: 'hover:border-emerald-300' },
  // 27: Red Orange (Kat 2: Pendaftaran & Tim) - Buat Jadwal & Slot Tim
  { bg: 'bg-orange-950/90', border: 'border-orange-500/80', text: 'text-orange-300', glow: 'shadow-orange-900/60', badgeBg: 'bg-orange-500', badgeText: 'text-slate-950', gradient: 'from-orange-500 via-amber-600 to-red-800', accentBg: 'bg-orange-500/15', hoverBorder: 'hover:border-orange-400' },
  // 28: Neon Magenta (Kat 1: Ringkasan & Utama) - Pengumuman Penting & Broadcast
  { bg: 'bg-fuchsia-950/90', border: 'border-fuchsia-400/80', text: 'text-fuchsia-200', glow: 'shadow-fuchsia-900/60', badgeBg: 'bg-fuchsia-600', badgeText: 'text-white', gradient: 'from-fuchsia-600 via-pink-600 to-purple-900', accentBg: 'bg-fuchsia-500/15', hoverBorder: 'hover:border-fuchsia-300' },
  // 29: Electric Turquoise (Kat 4: Keuangan & Saldo) - Kelola Top Up Rekomendasi
  { bg: 'bg-teal-950/90', border: 'border-teal-400/80', text: 'text-teal-200', glow: 'shadow-teal-900/50', badgeBg: 'bg-teal-400', badgeText: 'text-slate-950', gradient: 'from-teal-400 via-cyan-500 to-blue-800', accentBg: 'bg-teal-400/15', hoverBorder: 'hover:border-teal-300' },
  // 30: Deep Crimson (Kat 7: Sistem & Pengaturan) - Kelola Tautan Unduh Aplikasi
  { bg: 'bg-rose-950/90', border: 'border-rose-500/80', text: 'text-rose-300', glow: 'shadow-rose-900/50', badgeBg: 'bg-rose-600', badgeText: 'text-white', gradient: 'from-rose-600 via-red-700 to-slate-900', accentBg: 'bg-rose-500/15', hoverBorder: 'hover:border-rose-400' },
  // 31: Steel Azure (Kat 3: Match & Turnamen) - Lihat Arsip Turnamen
  { bg: 'bg-blue-950/90', border: 'border-blue-400/70', text: 'text-blue-200', glow: 'shadow-blue-900/50', badgeBg: 'bg-blue-500', badgeText: 'text-white', gradient: 'from-blue-500 via-indigo-600 to-slate-950', accentBg: 'bg-blue-500/15', hoverBorder: 'hover:border-blue-300' },
  // 32: Hot Rose (Kat 7: Sistem & Pengaturan) - Pengaturan Sinkronisasi Data
  { bg: 'bg-rose-950/90', border: 'border-rose-300/80', text: 'text-rose-100', glow: 'shadow-rose-900/60', badgeBg: 'bg-rose-400', badgeText: 'text-slate-950', gradient: 'from-rose-400 via-pink-500 to-red-800', accentBg: 'bg-rose-300/15', hoverBorder: 'hover:border-rose-200' },
  // 33: Neon Lime (Kat 6: Bot WA & AI) - Kirim Perintah Lewat Bot WA
  { bg: 'bg-lime-950/90', border: 'border-lime-400/80', text: 'text-lime-200', glow: 'shadow-lime-900/60', badgeBg: 'bg-lime-500', badgeText: 'text-slate-950', gradient: 'from-lime-400 via-green-500 to-emerald-800', accentBg: 'bg-lime-400/15', hoverBorder: 'hover:border-lime-300' },
  // 34: Lavender Slate (Kat 1: Ringkasan & Utama) - Kelola Halaman Beranda
  { bg: 'bg-purple-950/90', border: 'border-purple-400/80', text: 'text-purple-200', glow: 'shadow-purple-900/60', badgeBg: 'bg-purple-600', badgeText: 'text-white', gradient: 'from-purple-600 via-fuchsia-700 to-slate-950', accentBg: 'bg-purple-500/15', hoverBorder: 'hover:border-purple-300' },
  // 35: Wine Magenta (Kat 7: Sistem & Pengaturan) - Lihat Laporan Masalah & Usulan
  { bg: 'bg-rose-950/90', border: 'border-rose-500/80', text: 'text-rose-300', glow: 'shadow-rose-900/60', badgeBg: 'bg-rose-600', badgeText: 'text-white', gradient: 'from-rose-600 via-purple-700 to-black', accentBg: 'bg-rose-500/15', hoverBorder: 'hover:border-rose-400' },
  // 36: Spring Green (Kat 6: Bot WA & AI) - Atur Notifikasi Otomatis
  { bg: 'bg-green-950/90', border: 'border-green-400/80', text: 'text-green-200', glow: 'shadow-green-900/60', badgeBg: 'bg-green-500', badgeText: 'text-slate-950', gradient: 'from-green-400 via-emerald-500 to-teal-800', accentBg: 'bg-green-400/15', hoverBorder: 'hover:border-green-300' },
  // 37: Electric Aqua (Kat 3: Match & Turnamen) - Tetapkan Juara & Penutupan Turnamen
  { bg: 'bg-cyan-950/95', border: 'border-cyan-300/90', text: 'text-cyan-200', glow: 'shadow-cyan-900/70', badgeBg: 'bg-cyan-300', badgeText: 'text-slate-950', gradient: 'from-cyan-300 via-teal-400 to-blue-700', accentBg: 'bg-cyan-300/15', hoverBorder: 'hover:border-cyan-200' },
  // 38: Blood Red (Kat 7: Sistem & Pengaturan) - Hapus Data Lama & Log Bersih
  { bg: 'bg-red-950/95', border: 'border-red-600/90', text: 'text-red-200', glow: 'shadow-red-950/70', badgeBg: 'bg-red-700', badgeText: 'text-white', gradient: 'from-red-700 via-rose-800 to-neutral-950', accentBg: 'bg-red-600/15', hoverBorder: 'hover:border-red-500' },
  // 39: Bright Canary (Kat 5: Pengguna & Akun) - Ubah Kata Sandi & Login Admin
  { bg: 'bg-yellow-950/95', border: 'border-yellow-400/80', text: 'text-yellow-100', glow: 'shadow-yellow-900/60', badgeBg: 'bg-yellow-400', badgeText: 'text-slate-950', gradient: 'from-yellow-400 via-amber-500 to-orange-700', accentBg: 'bg-yellow-400/15', hoverBorder: 'hover:border-yellow-300' },
  // 40: Cyber Lime Glow (Kat 6: Bot WA & AI) - Ubah Website Dengan Perintah Teks / AI
  { bg: 'bg-lime-950/90', border: 'border-lime-400/80', text: 'text-lime-200', glow: 'shadow-lime-900/70', badgeBg: 'bg-gradient-to-r from-lime-400 to-emerald-400', badgeText: 'text-slate-950', gradient: 'from-lime-400 via-emerald-500 to-teal-600', accentBg: 'bg-lime-400/15', hoverBorder: 'hover:border-lime-300' }
];

export function getMenuColorStyle(id: number): MenuColorStyle {
  const index = (Math.abs(id) - 1) % MENU_COLOR_PALETTES.length;
  return MENU_COLOR_PALETTES[index];
}

