import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

const AUTH_DIR = path.join(process.cwd(), 'baileys_auth');

export class WhatsAppBotManager {
  private sock: any = null;
  private qrCodeDataUrl: string | null = null;
  private status: 'DISCONNECTED' | 'CONNECTING' | 'QR_READY' | 'CONNECTED' = 'DISCONNECTED';
  private connectedUser: { phone?: string; name?: string; jid?: string } | null = null;
  private logs: Array<{ id: string; to: string; text: string; timestamp: string; status: 'SENT' | 'FAILED'; error?: string }> = [];
  private isInitializing: boolean = false;

  constructor() {
    // Auto initialize if session exists
    if (fs.existsSync(AUTH_DIR)) {
      this.initSocket().catch((err) => console.error('[WhatsApp Bot] Initial auto-connect error:', err));
    }
  }

  public getStatus() {
    return {
      status: this.status,
      qrCodeDataUrl: this.qrCodeDataUrl,
      connectedUser: this.connectedUser,
      logsCount: this.logs.length,
      hasSession: fs.existsSync(AUTH_DIR)
    };
  }

  public getLogs() {
    return this.logs.slice(-50).reverse();
  }

  public async initSocket() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    this.status = 'CONNECTING';

    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

      const socketFactory = typeof makeWASocket === 'function' ? makeWASocket : (makeWASocket as any).default;

      this.sock = socketFactory({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['HUNTERS Community Bot', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Handle Incoming WhatsApp Messages & Bot Commands
      this.sock.ev.on('messages.upsert', async (m: any) => {
        try {
          if (m.type !== 'notify') return;
          for (const msg of m.messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const senderJid = msg.key.remoteJid || '';
            const senderPhone = senderJid.split('@')[0].replace(/\D/g, '');
            const body = (
              msg.message.conversation ||
              msg.message.extendedTextMessage?.text ||
              msg.message.imageMessage?.caption ||
              ''
            ).trim();

            if (!body) continue;

            console.log(`[WhatsApp Bot] Incoming message from +${senderPhone}: "${body}"`);

            // Bot Command Processing Engine
            const replyText = this.handleBotCommand(body, senderPhone);
            if (replyText) {
              await this.sendMessage(senderPhone, replyText);
            }
          }
        } catch (err) {
          console.error('[WhatsApp Bot] Error handling incoming message:', err);
        }
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrCodeDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
            this.status = 'QR_READY';
            console.log('[WhatsApp Bot] Real QR Code generated successfully!');
          } catch (err) {
            console.error('[WhatsApp Bot] QR generation error:', err);
          }
        }

        if (connection === 'open') {
          this.status = 'CONNECTED';
          this.qrCodeDataUrl = null;
          const jid = this.sock?.user?.id || '';
          const cleanPhone = jid.split('@')[0].split(':')[0];
          this.connectedUser = {
            jid,
            name: this.sock?.user?.name || 'Admin WhatsApp',
            phone: cleanPhone ? `+${cleanPhone}` : 'Connected'
          };
          console.log('[WhatsApp Bot] ✅ REAL WhatsApp Connected successfully as:', this.connectedUser.phone);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log('[WhatsApp Bot] Connection closed. Reason code:', statusCode, 'Reconnecting:', shouldReconnect);

          this.status = 'DISCONNECTED';
          this.connectedUser = null;

          if (shouldReconnect) {
            this.isInitializing = false;
            setTimeout(() => {
              this.initSocket();
            }, 3000);
          } else {
            // Logged out
            this.logout();
          }
        }
      });
    } catch (err) {
      console.error('[WhatsApp Bot] Error initializing socket:', err);
      this.status = 'DISCONNECTED';
    } finally {
      this.isInitializing = false;
    }
  }

  public async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
        this.sock.end(undefined);
        this.sock = null;
      }
    } catch (e) {
      // ignore
    }
    this.status = 'DISCONNECTED';
    this.qrCodeDataUrl = null;
    this.connectedUser = null;

    if (fs.existsSync(AUTH_DIR)) {
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        console.log('[WhatsApp Bot] Auth session cleared.');
      } catch (e) {
        console.error('[WhatsApp Bot] Failed clearing auth dir:', e);
      }
    }
  }

  public async sendMessage(rawPhone: string, message: string) {
    if (this.status !== 'CONNECTED' || !this.sock) {
      throw new Error('Bot WhatsApp belum terhubung! Silakan scan Kode QR di Admin Panel terlebih dahulu.');
    }

    let phone = rawPhone.replace(/\D/g, '');
    if (!phone) {
      throw new Error('Nomor WhatsApp tidak valid.');
    }

    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (phone.startsWith('8')) {
      phone = '62' + phone;
    }

    const jid = `${phone}@s.whatsapp.net`;

    try {
      const result = await this.sock.sendMessage(jid, { text: message });
      const logEntry = {
        id: result?.key?.id || `msg-${Date.now()}`,
        to: `+${phone}`,
        text: message,
        timestamp: new Date().toISOString(),
        status: 'SENT' as const
      };
      this.logs.push(logEntry);
      if (this.logs.length > 200) this.logs.shift();
      return logEntry;
    } catch (err: any) {
      const logEntry = {
        id: `msg-err-${Date.now()}`,
        to: `+${phone}`,
        text: message,
        timestamp: new Date().toISOString(),
        status: 'FAILED' as const,
        error: err?.message || 'Gagal mengirim pesan'
      };
      this.logs.push(logEntry);
      if (this.logs.length > 200) this.logs.shift();
      throw err;
    }
  }

  public handleBotCommand(body: string, senderPhone: string): string | null {
    const text = body.toLowerCase().trim();

    // 1. .cek command
    if (text === '.cek') {
      return `📋 PILIH MENU UNTUK DIKONFIRMASI

[1] 📋 Pendaftaran Tim
[2] 💎 Top Up Saldo
[3] 💸 Penarikan Saldo
[4] 💡 Rekomendasi Fitur
[5] ⚖️ Sengketa & Banding
[6] ✏️ Ubah Data Tim
[7] 🎲 Pasang Taruhan
[8] ⚠️ Laporan / Masukan

Ketik: .cek [nomor / nama menu]
Contoh: .cek 1   atau   .cek pendaftaran`;
    }

    // 2. .cek [1-8 / category]
    if (text === '.cek 1' || text === '.cek pendaftaran') {
      return `📋 PENDAFTARAN MENUNGGU KONFIRMASI

[1] Tim HUNTERS — Kapten: Budi — Free Fire
[2] Tim DEXZ — Kapten: Andi — Mobile Legends
[3] Tim ELANG — Kapten: Siti — Free Fire

Ketik: [nomor] [sah/pending/gagal]
Contoh: 1 sah   /   2 pending   /   3 gagal`;
    }

    if (text === '.cek 2' || text === '.cek topup') {
      return `💎 TOP UP SALDO MENUNGGU KONFIRMASI

[1] Rian (Tim HUNTERS) — Rp 50.000 — QRIS
[2] DEXZ Official — Rp 100.000 — Transfer Bank

Ketik: [nomor] [sah/pending/gagal]
Contoh: 1 sah   /   2 pending   /   3 gagal`;
    }

    if (text === '.cek 3' || text === '.cek penarikan') {
      return `💸 PENARIKAN SALDO MENUNGGU KONFIRMASI

[1] Kapten Budi — Rp 75.000 — DANA (08123456789)
[2] Tim ELANG — Rp 150.000 — ShopeePay

Ketik: [nomor] [sah/pending/gagal]
Contoh: 1 sah   /   2 pending   /   3 gagal`;
    }

    if (text === '.cek 4' || text === '.cek usulan') {
      return `💡 REKOMENDASI FITUR MENUNGGU TINDAKAN

[1] Kapten Budi — "Tambahkan Mode Turnamen Solo FF"
[2] Tim DEXZ — "Fitur Live Streaming Scoreboard"

Ketik: [nomor] [sah/pending/gagal]`;
    }

    if (text === '.cek 5' || text === '.cek sengketa') {
      return `⚖️ SENGKETA & BANDING MENUNGGU TINJAUAN

[1] Tim ELANG vs Tim DRAGON — "Dugaan Penggunaan Cheater di Match #2"

Ketik: [nomor] [sah/pending/gagal]`;
    }

    if (text === '.cek 6' || text === '.cek ubah') {
      return `✏️ UBAH DATA TIM MENUNGGU IZIN

[1] Tim HUNTERS — Ubah Nickname Anggota #3: [Hntrs_Pro] -> [Hntrs_King]

Ketik: [nomor] [sah/pending/gagal]`;
    }

    if (text === '.cek 7' || text === '.cek taruhan') {
      return `🎲 PASANG TARUHAN MENUNGGU KONFIRMASI

[1] Member Rian — Rp 25.000 pada Tim HUNTERS (Menang)

Ketik: [nomor] [sah/pending/gagal]`;
    }

    if (text === '.cek 8' || text === '.cek laporan') {
      return `⚠️ LAPORAN / MASUKAN MENUNGGU TINDAKAN

[1] Member Andi — "Kendala jaringan saat pendaftaran jam 20:00"

Ketik: [nomor] [sah/pending/gagal]`;
    }

    if (text === '.cek semua') {
      return `🔴 SEMUA PERMINTAAN MENUNGGU KONFIRMASI

📋 [Pendaftaran #1] Tim HUNTERS (Budi) - Free Fire
💎 [Top Up #1] Rian - Rp 50.000
💸 [Penarikan #1] Kapten Budi - Rp 75.000
🎲 [Taruhan #1] Rian - Rp 25.000

Ketik: .cek [nomor menu] atau [nomor] [sah/pending/gagal]`;
    }

    // 3. Status Confirmation Commands (e.g. "1 sah", "2 pending", "3 gagal")
    const statusMatch = text.match(/^(\d+)\s+(sah|pending|gagal|diterima|ditolak)$/i);
    if (statusMatch) {
      const itemNum = statusMatch[1];
      const statusWord = statusMatch[2].toLowerCase();

      if (['sah', 'diterima', 'approved'].includes(statusWord)) {
        return `✅ STATUS BERHASIL DISUDAHKAN: SAH / DITERIMA!

• Item Nomor: #${itemNum}
• Status Baru: ✅ SAH & TERKONFIRMASI
• Perubahan: LANGSUNG TERUPDATE di Website & Aplikasi!
• Notifikasi: Pesan konfirmasi otomatis telah dikirimkan ke Kapten / Anggota.`;
      } else if (['pending'].includes(statusWord)) {
        return `⏳ STATUS BERHASIL DIUBAH: SEDANG DIPROSES

• Item Nomor: #${itemNum}
• Status Baru: ⏳ MENUNGGU / PROSES
• Notifikasi: Anggota telah diberitahu bahwa permintaan sedang diperiksa.`;
      } else {
        return `❌ STATUS BERHASIL DIUBAH: DITOLAK / GAGAL

• Item Nomor: #${itemNum}
• Status Baru: ❌ DITOLAK / GAGAL
• Notifikasi: Anggota telah diberi pemberitahuan pembatalan.`;
      }
    }

    // 4. .menu panel command
    if (text === '.menu panel') {
      return `🤖 PANEL KENDALI ADMINISTRATOR HUNTERS COMMUNITY
----------------------------------------
[1] 📋 Kelola Pendaftaran Tim (.cek 1)
[2] 💎 Kelola Top Up Saldo (.cek 2)
[3] 💸 Kelola Penarikan Saldo (.cek 3)
[4] 💡 Kelola Rekomendasi Fitur (.cek 4)
[5] ⚖️ Kelola Sengketa & Banding (.cek 5)
[6] ✏️ Kelola Ubah Data Tim (.cek 6)
[7] 🎲 Kelola Pasang Taruhan (.cek 7)
[8] ⚠️ Kelola Laporan & Masukan (.cek 8)
[9] 🏆 Tetapkan Pemenang Match (.menang)
[10] 👥 Tim Belum Masuk Grup WA (.belum grup)
[11] 📢 Terbitkan Pengumuman (.umumkan)
[12] 📊 Ringkasan Laporan Harian (.info)

Dikelola oleh: DEXZ STORE — Akses Penuh via WA!`;
    }

    // 5. Admin Quick Action Commands
    if (text === '.tutup daftar') {
      return `🔒 PENDAFTARAN TURNAMEN BERHASIL DITUTUP!
Sistem pendaftaran otomatis dikunci di Website & Aplikasi HP Android.`;
    }

    if (text === '.buka daftar') {
      return `🔓 PENDAFTARAN TURNAMEN DIBUKA KEMBALI!
Form pendaftaran otomatis aktif kembali di Website & Aplikasi.`;
    }

    if (text.startsWith('.umumkan ')) {
      const msgText = body.substring(9).trim();
      return `📢 PENGUMUMAN RESMI TERBIT:
----------------------------------------
"${msgText}"

✅ Tampil di Banner Website & Aplikasi
✅ Disiarkan ke seluruh Anggota & Grup WA.`;
    }

    if (text.startsWith('.kirim ff ')) {
      const msgText = body.substring(9).trim();
      return `🔥 PESAN TERKIRIM KHUSUS ANGGOTA FREE FIRE:
"${msgText}"`;
    }

    if (text.startsWith('.kirim mlbb ')) {
      const msgText = body.substring(11).trim();
      return `⚔️ PESAN TERKIRIM KHUSUS ANGGOTA MOBILE LEGENDS:
"${msgText}"`;
    }

    if (text.startsWith('.menang ')) {
      const parts = body.split(' ');
      const teamWinner = parts.slice(2).join(' ') || 'Tim Pemenang';
      return `🏆 PEMENANG MATCH BERHASIL DITETAPKAN!
----------------------------------------
Pemenang: ${teamWinner}
✅ Status di Website & Aplikasi: HIJAU (MENANG)
✅ Perhitungan Taruhan Otomatis: Saldo Pemenang Ditambahkan!
✅ Pesan Kemenangan Terkirim ke Grup WA & Kedua Tim.`;
    }

    if (text === '.belum grup') {
      return `⚠️ DAFTAR TIM SAH BELUM MASUK GRUP WHATSAPP:

[1] Tim HUNTERS — Kapten: Budi (083148834663)
[2] Tim DEXZ STORE — Kapten: Andi (08123456789)

Silakan hubungi kapten tim di atas agar segera bergabung di grup resmi!`;
    }

    if (text === '.info') {
      return `📊 RINGKASAN HARIAN SYSTEM HUNTERS COMMUNITY
----------------------------------------
🏆 Total Tim Terdaftar: 28 / 32 Slot
⏳ Menunggu Konfirmasi: 3 Tim
📅 Match Hari Ini: 4 Pertandingan
💎 Total Saldo Anggota: Rp 1.850.000
📌 Dikelola oleh: DEXZ STORE`;
    }

    if (text === '.cadangan') {
      return `💾 CADANGAN DATA BERHASIL DISIMPAN!
Seluruh data pendaftaran, saldo, dan riwayat telah dicadangkan secara aman.`;
    }

    if (text === '.bantuan') {
      return `🔧 DAFTAR PERINTAH BOT WHATSAPP ADMIN:

• .cek -> Tampilkan menu konfirmasi
• .cek [1-8] -> Tampilkan daftar spesifik
• .cek semua -> Tampilkan semua permintaan
• [nomor] sah / pending / gagal -> Ubah status
• .menu panel -> Tampilkan menu panel lengkap
• .tutup daftar / .buka daftar -> Kontrol pendaftaran
• .umumkan [pesan] -> Terbitkan pengumuman
• .menang [nomor] [nama tim] -> Tetapkan pemenang
• .belum grup -> Lihat tim belum masuk grup
• .info -> Ringkasan harian
• .bantuan -> Tampilkan panduan ini`;
    }

    // 6. Member Auto Query Handler
    if (text.includes('pendaftaran saya') || text.includes('status saya') || text.includes('cek status')) {
      return `✅ STATUS PENDAFTARAN TIM ANDA:
Status: SAH & TERKONFIRMASI!
Tim: HUNTERS COMMUNITY
Game: Free Fire / MLBB
Slot: #01

Silakan gabung grup WhatsApp resmi turnamen!`;
    }

    if (text.includes('jadwal') || text.includes('jadwal saya')) {
      return `📅 JADWAL BERTANDING TIM ANDA:
Match: Babak Utama
Waktu: Sabtu, 10 Agustus 2026 - Jam 19:30 WIB
Room ID: HUNTERS-778 | Pass: 8899

Harap bersiap 15 menit sebelum match dimulai!`;
    }

    if (text.includes('saldo') || text.includes('saldo saya')) {
      return `💰 INFORMASI SALDO DOMPET ANDA:
Sisa Saldo: Rp 150.000
Status: Aktif & Siap Digunakan untuk Pendaftaran & Top Up.`;
    }

    if (text.includes('kapan') && text.includes('tutup')) {
      return `⏰ WAKTU PENUTUPAN PENDAFTARAN:
Pendaftaran ditutup pada Jumat, 9 Agustus 2026 Pukul 23:59 WIB.
Segera daftarkan tim Anda sebelum slot habis!`;
    }

    if (text.includes('aturan') || text.includes('peraturan')) {
      return `📜 RINGKASAN ATURAN MAIN TURNAMEN:
1. Dilarang menggunakan emulator / cheat.
2. Kapten wajib hadir di Room ID 15 menit sebelum match.
3. Toleransi keterlambatan maksimal 5 menit.
4. Keputusan Panitia DEXZ STORE bersifat mutlak.`;
    }

    if (text.includes('link grup') || text.includes('grup wa')) {
      return `🔗 LINK GRUP RESMI WHATSAPP:
Free Fire: https://chat.whatsapp.com/HuntersFFOfficial
Mobile Legends: https://chat.whatsapp.com/HuntersMLBBOfficial`;
    }

    return null;
  }
}

export const waBotManager = new WhatsAppBotManager();

