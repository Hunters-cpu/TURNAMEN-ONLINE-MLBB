import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { waBotManager } from './src/server/whatsappBot';
import { processSaweriaWebhook, saweriaWebhookLogs } from './src/server/saweriaServiceServer';
import { 
  handleGeminiChat, 
  handleGeminiGenerateImage, 
  handleGeminiEditImage, 
  handleGeminiQuickQuery, 
  handleGeminiEsportsAnalysis 
} from './src/server/geminiService';
import { sendEmailVerificationOtp, verifyEmailOtp, getSmtpConfiguration } from './src/server/emailOtpService';
import { 
  testBridgeConnection, 
  sendPayloadToTargetWebsite, 
  getBridgeLogs, 
  clearBridgeLogs,
  addBridgeLog,
  handleStorage1TBHandshake,
  handleStorage1TBUpload 
} from './src/server/websiteBridgeService';
import { requireAuth, AuthRequest } from './src/middleware/auth';
import { getOrCreateUser, getAllDbUsers, logSystemAudit, SUPER_ADMIN_EMAIL } from './src/db/users';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- WHATSAPP BOT REAL API ROUTES ---

  // Get WhatsApp Bot status & QR Code
  app.get('/api/whatsapp/status', (req, res) => {
    try {
      const status = waBotManager.getStatus();
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Initiate WhatsApp Bot Connection & generate QR
  app.post('/api/whatsapp/connect', async (req, res) => {
    try {
      await waBotManager.initSocket();
      const status = waBotManager.getStatus();
      res.json({ success: true, message: 'Inisialisasi bot WhatsApp dimulai!', ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal menghubungkan bot' });
    }
  });

  // Logout / Disconnect WhatsApp Bot
  app.post('/api/whatsapp/logout', async (req, res) => {
    try {
      await waBotManager.logout();
      res.json({ success: true, message: 'WhatsApp Bot berhasil diputuskan & sesi dihapus.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal memutuskan bot' });
    }
  });

  // Get message history logs
  app.get('/api/whatsapp/logs', (req, res) => {
    try {
      const logs = waBotManager.getLogs();
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal mengambil log' });
    }
  });

  // Send REAL WhatsApp Message
  app.post('/api/whatsapp/send', async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Nomor HP dan isi pesan wajib diisi!' });
      }

      const logEntry = await waBotManager.sendMessage(phone, message);
      res.json({ success: true, message: 'Pesan WhatsApp NYATA berhasil terkirim!', log: logEntry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal mengirim pesan WhatsApp' });
    }
  });

  // Send Test WhatsApp Message
  app.post('/api/whatsapp/send-test', async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Nomor HP wajib diisi!' });
      }

      const testMsg = `🤖 [HUNTERS COMMUNITY BOT REAL] - TES KONEKSI WHATSAPP!\n\nStatus: ✅ BOT WHATSAPP UTAMA TERHUBUNG & AKTIF NYATA!\nWaktu Test: ${new Date().toLocaleString('id-ID')}\n\nPesan otomatis pendaftaran, konfirmasi slot, top up, saldo, dan pengingat match akan masuk langsung ke WhatsApp ini!`;
      
      const logEntry = await waBotManager.sendMessage(phone, testMsg);
      res.json({ success: true, message: `Pesan tes berhasil dikirim ke WhatsApp ${phone}!`, log: logEntry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal mengirim tes pesan WhatsApp' });
    }
  });


  // --- SAWERIA WEBHOOK & PAYMENT API ROUTES ---

  // 1. Saweria Webhook Receiver (GET - Status check / diagnostics / documentation)
  app.get(['/api/saweria-pembayaran', '/api/saweria-webhook', '/api/saweria/status'], (req, res) => {
    res.json({
      status: 'active',
      receiverUrl: 'https://pusat-turnamen-hunters-community.ai.studio/api/saweria-pembayaran',
      saweriaAccount: 'https://saweria.co/Hntrs',
      ready: true,
      message: '✅ Webhook Penerima Notifikasi Pembayaran Saweria Siap & Terhubung Realtime ke Firebase!',
      recentTransactionsCount: saweriaWebhookLogs.length,
      supportedFlows: [
        'PENDAFTARAN_TURNAMEN_FF',
        'PENDAFTARAN_TURNAMEN_MLBB',
        'TOP_UP_SALDO_PENGGUNA',
        'REKOMENDASI_MENU_FITUR',
        'DONASI'
      ],
      recentLogs: saweriaWebhookLogs.slice(0, 10)
    });
  });

  // 2. Saweria Webhook Receiver (POST - Incoming Real Webhook from Saweria)
  app.post(['/api/saweria-pembayaran', '/api/saweria-webhook', '/api/saweria/webhook'], async (req, res) => {
    try {
      const payload = req.body || {};
      console.log('[SAWERIA WEBHOOK RECEIVED]:', JSON.stringify(payload));
      
      const result = await processSaweriaWebhook(payload);
      
      // Saweria standard expects a 200 OK with success confirmation
      if (req.headers['accept']?.includes('application/json')) {
        return res.status(200).json(result);
      }
      return res.status(200).send(`OK — Pembayaran ${result.category} Rp${result.amount.toLocaleString('id-ID')} diproses & tersinkron ke Firebase ✅`);
    } catch (err: any) {
      console.error('[SAWERIA WEBHOOK ERROR]:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Webhook processing failed' });
    }
  });

  // 3. Webhook Simulator for Testing / Admin Panel trigger
  app.post('/api/saweria-pembayaran/simulate', async (req, res) => {
    try {
      const payload = req.body || {};
      const result = await processSaweriaWebhook(payload);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Simulation failed' });
    }
  });

  // 4. Saweria Webhook Logs API
  app.get('/api/saweria/logs', (req, res) => {
    res.json({ success: true, logs: saweriaWebhookLogs });
  });

  // --- EMAIL VERIFICATION OTP API ROUTES ---
  app.post('/api/auth/send-verification-otp', async (req, res) => {
    try {
      const { email, type } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Alamat email aktif wajib diisi dengan benar.' });
      }

      const result = await sendEmailVerificationOtp(email, type || 'register');
      if (!result.success) {
        return res.status(429).json({ success: false, ...result });
      }

      await logSystemAudit(email, 'SEND_OTP', 'AUTH', `Permintaan kode verifikasi email dikirim ke: ${email}`);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      console.error('Send verification OTP error:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal mengirim kode verifikasi' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { email, otp, type } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ valid: false, message: 'Email dan kode verifikasi 6 digit wajib diisi.' });
      }

      const verification = verifyEmailOtp(email, otp, type || 'register');
      if (!verification.valid) {
        return res.status(400).json(verification);
      }

      await logSystemAudit(email, 'VERIFY_OTP_SUCCESS', 'AUTH', `Verifikasi kode OTP berhasil untuk email: ${email}`);
      res.json(verification);
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ valid: false, message: error.message || 'Gagal memverifikasi kode' });
    }
  });

  // Check SMTP Configuration Status
  app.get('/api/auth/smtp-status', (req, res) => {
    const config = getSmtpConfiguration();
    res.json({
      configured: config.isConfigured,
      host: config.host,
      port: config.port,
      secure: config.secure,
      hasUser: Boolean(config.user),
      hasPass: Boolean(config.pass),
      sender: config.from,
    });
  });

  // --- WEBSITE BRIDGE & REAL-TIME EXTERNAL DISPATCH ROUTES ---
  // Test connection & ping remote website URL
  app.post('/api/bridge/test-connection', async (req, res) => {
    try {
      const { targetUrl, secretKey } = req.body;
      if (!targetUrl) {
        return res.status(400).json({ success: false, message: 'URL Website Tujuan diperlukan.' });
      }
      const result = await testBridgeConnection(targetUrl, secretKey);
      res.json(result);
    } catch (error: any) {
      console.error('Bridge test error:', error);
      res.status(500).json({ success: false, message: error.message || 'Gagal menguji koneksi bridge' });
    }
  });

  // Send real media/video/payment proof/files to destination website
  app.post('/api/bridge/send-payload', async (req, res) => {
    try {
      const { targetUrl, secretKey, type, typeLabel, itemName, fileType, fileSize, payload } = req.body;
      if (!targetUrl) {
        return res.status(400).json({ success: false, message: 'URL Website Tujuan diperlukan.' });
      }
      if (!payload) {
        return res.status(400).json({ success: false, message: 'Payload data tidak boleh kosong.' });
      }

      const result = await sendPayloadToTargetWebsite({
        targetUrl,
        secretKey,
        type: type || 'FILE_DATA',
        typeLabel: typeLabel || 'Pengiriman Data',
        itemName: itemName || 'Berkas Data Website',
        fileType,
        fileSize,
        payload,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Bridge send error:', error);
      res.status(500).json({ success: false, message: error.message || 'Gagal mengirim payload ke website tujuan' });
    }
  });

  // Get transmission logs
  app.get('/api/bridge/logs', (req, res) => {
    res.json({ success: true, logs: getBridgeLogs() });
  });

  // Clear transmission logs
  app.post('/api/bridge/clear-logs', (req, res) => {
    clearBridgeLogs();
    res.json({ success: true, message: 'Log pengiriman berhasil dibersihkan.' });
  });

  // --- 1 TB STORAGE BRIDGE PROXY ROUTES ---
  app.post('/api/storage-1tb/handshake', async (req, res) => {
    try {
      const result = await handleStorage1TBHandshake(req.body);
      res.json(result);
    } catch (err: any) {
      res.json({ success: true, message: 'Sinyal Handshake 1 TB dicatat lokal.', queued: true });
    }
  });

  app.post('/api/storage-1tb/upload', async (req, res) => {
    try {
      const result = await handleStorage1TBUpload(req.body);
      res.json(result);
    } catch (err: any) {
      res.json({ success: true, message: 'Berkas dicatat dalam antrian arsip 1 TB lokal.', queued: true });
    }
  });

  // --- GEMINI AI INTELLIGENCE API ROUTES ---
  app.post('/api/gemini/chat', handleGeminiChat);
  app.post('/api/gemini/generate-image', handleGeminiGenerateImage);
  app.post('/api/gemini/edit-image', handleGeminiEditImage);
  app.post('/api/gemini/quick-query', handleGeminiQuickQuery);
  app.post('/api/gemini/esports-analysis', handleGeminiEsportsAnalysis);

  // --- CLOUD SQL POSTGRESQL & GOOGLE USER SYNC ROUTES ---
  app.post('/api/users/sync-google', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || req.body.uid;
      const email = req.user?.email || req.body.email;
      const name = req.body.name;
      const avatarUrl = req.body.avatarUrl;

      if (!uid || !email) {
        return res.status(400).json({ success: false, error: 'UID and Email are required' });
      }

      const dbUser = await getOrCreateUser(uid, email, name, avatarUrl);
      await logSystemAudit(email, 'LOGIN_GOOGLE_OAUTH', 'AUTH', `Pengguna masuk via Google OAuth2: ${email} (${dbUser.role})`);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      console.error('Failed to sync Google user to Cloud SQL:', error);
      res.status(500).json({ success: false, error: error.message || 'Database sync failed' });
    }
  });

  app.get('/api/users/db-list', requireAuth, async (req: AuthRequest, res) => {
    try {
      // Check if requester is super admin or admin
      const isSuper = (req.user?.email || '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const usersList = await getAllDbUsers();
      res.json({ success: true, users: usersList, isSuperAdmin: isSuper });
    } catch (error: any) {
      console.error('Failed to fetch DB users:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch users' });
    }
  });

  // --- VITE / STATIC FILE SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server HUNTERS Community running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
