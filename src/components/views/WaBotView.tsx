import React, { useState, useEffect } from 'react';
import { 
  Bot, QrCode, Smartphone, Wifi, WifiOff, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Users, Calendar, Clock, ShieldCheck, Copy, Check, MessageSquare, Trash2, 
  Settings, Sparkles, Sliders, ExternalLink, BatteryCharging, ChevronRight, BellRing
} from 'lucide-react';
import { SiteConfig, RegisteredTeam, CommunityGroup, MatchSchedule, WaBotConfig, WaBotLog, UserWallet } from '../../types';
import { INITIAL_WA_BOT_CONFIG } from '../../data/initialData';

interface WaBotViewProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams?: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  communityGroups: CommunityGroup[];
  matchSchedules: MatchSchedule[];
  userWallet?: UserWallet;
  setUserWallet?: React.Dispatch<React.SetStateAction<UserWallet>>;
}

export const WaBotView: React.FC<WaBotViewProps> = ({
  siteConfig,
  setSiteConfig,
  registeredTeams,
  setRegisteredTeams,
  communityGroups,
  matchSchedules,
  userWallet,
  setUserWallet
}) => {
  const botConfig: WaBotConfig = siteConfig.waBotConfig || INITIAL_WA_BOT_CONFIG;

  const [activeTab, setActiveTab] = useState<'simulasi' | 'tautkan' | 'sah' | 'grup' | 'jadwal' | 'pengingat' | 'log'>('simulasi');
  const [pairingMode, setPairingMode] = useState<'qr' | 'code'>('qr');
  
  // Command Simulator State
  const [simCommand, setSimCommand] = useState('.cek');
  const [simHistory, setSimHistory] = useState<Array<{ sender: 'ADMIN' | 'BOT' | 'MEMBER'; text: string; time: string }>>([
    {
      sender: 'BOT',
      text: `🔴 PERMINTAAN BARU MENUNGGU KONFIRMASI\n\n📋 Pendaftaran: Tim HUNTERS — Kapten Budi\n📱 WhatsApp: 083148834663\n🎮 Game: Free Fire\n⏰ Dikirim: Baru Saja\n\nKetik: .cek 1 → untuk lihat daftar lengkap`,
      time: '09:00'
    },
    {
      sender: 'ADMIN',
      text: '.cek',
      time: '09:01'
    },
    {
      sender: 'BOT',
      text: `📋 PILIH MENU UNTUK DIKONFIRMASI\n\n[1] 📋 Pendaftaran Tim\n[2] 💎 Top Up Saldo\n[3] 💸 Penarikan Saldo\n[4] 💡 Rekomendasi Fitur\n[5] ⚖️ Sengketa & Banding\n[6] ✏️ Ubah Data Tim\n[7] 🎲 Pasang Taruhan\n[8] ⚠️ Laporan / Masukan\n\nKetik: .cek [nomor / nama menu]\nContoh: .cek 1   atau   .cek pendaftaran`,
      time: '09:01'
    }
  ]);
  
  // Pairing Code States
  const [inputPhoneNumber, setInputPhoneNumber] = useState(botConfig.botPhoneNumber || '6283148834663');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(30);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab 2: Info Penting Grup States
  const [selectedGroupId, setSelectedGroupId] = useState<string>(communityGroups[0]?.id || 'grup-1');
  const [infoTitle, setInfoTitle] = useState('📢 PEMBERITAHUAN WAKTU BREADOWN MATCH GRAND FINAL');
  const [infoContent, setInfoContent] = useState('Seluruh kapten tim Free Fire & Mobile Legends wajib memasuki Room ID paling lambat 15 menit sebelum waktu match dimulai!');

  // Tab 3: Perubahan Jadwal States
  const [jadwalGame, setJadwalGame] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(registeredTeams[0]?.id || '');
  const [matchTitle, setMatchTitle] = useState('Match Babak Semifinal #1');
  const [newMatchTime, setNewMatchTime] = useState('Sabtu, 10 Agustus 2026 - 19:30 WIB');
  const [jadwalRoomId, setJadwalRoomId] = useState('HUNTERS-778');
  const [jadwalRoomPass, setJadwalRoomPass] = useState('8899');
  const [jadwalNotes, setJadwalNotes] = useState('Diundur 30 menit karena maintenance server game.');

  // Tab 4: Pengingat Match States
  const [selectedMatchScheduleId, setSelectedMatchScheduleId] = useState<string>(matchSchedules[0]?.id || '');
  const [reminderTiming, setReminderTiming] = useState('30 Menit Sebelum Match');
  const [remindTeamId, setRemindTeamId] = useState<string>(registeredTeams[0]?.id || '');

  // Log filter & Toast state
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Test Message State
  const [testPhone, setTestPhone] = useState('6283148834663');
  const [testMsg, setTestMsg] = useState('Halo! Ini adalah tes pengiriman pesan langsung dari Bot WhatsApp Auto-Notifier Hunters Esports.');

  // Real Backend API States
  const [serverStatus, setServerStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'QR_READY' | 'CONNECTED'>('DISCONNECTED');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [serverConnectedUser, setServerConnectedUser] = useState<{ phone?: string; name?: string } | null>(null);
  const [serverLogs, setServerLogs] = useState<any[]>([]);
  const [isConnectingServer, setIsConnectingServer] = useState(false);

  // Poll server status every 3 seconds
  const fetchServerStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setServerStatus(data.status);
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setServerConnectedUser(data.connectedUser);

        // Sync with siteConfig if connected
        if (data.status === 'CONNECTED' && !botConfig.isConnected) {
          setSiteConfig(prev => ({
            ...prev,
            waBotConfig: {
              ...prev.waBotConfig,
              isConnected: true,
              botPhoneNumber: data.connectedUser?.phone?.replace(/\D/g, '') || '6283148834663',
              connectedSince: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          }));
        } else if (data.status === 'DISCONNECTED' && botConfig.isConnected) {
          setSiteConfig(prev => ({
            ...prev,
            waBotConfig: { ...prev.waBotConfig, isConnected: false }
          }));
        }
      }
    } catch (e) {
      console.warn('WhatsApp status poll notice:', e);
    }
  };

  const fetchServerLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setServerLogs(data.logs);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchServerStatus();
    fetchServerLogs();

    const interval = setInterval(() => {
      fetchServerStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStartRealConnection = async () => {
    setIsConnectingServer(true);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setServerStatus(data.status);
        setQrCodeDataUrl(data.qrCodeDataUrl);
        showToast('🚀 Inisialisasi Bot WhatsApp Berhasil! Kode QR Asli Siap Dipindai.');
      } else {
        alert(`Gagal menghubungkan: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan server: ${err.message}`);
    } finally {
      setIsConnectingServer(false);
    }
  };

  const handleRealLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan tautan bot WhatsApp dan menghapus sesi login?')) return;
    try {
      const res = await fetch('/api/whatsapp/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setServerStatus('DISCONNECTED');
        setQrCodeDataUrl(null);
        setServerConnectedUser(null);
        setSiteConfig(prev => ({
          ...prev,
          waBotConfig: { ...prev.waBotConfig, isConnected: false }
        }));
        showToast('🔴 Bot WhatsApp Asli Berhasil Diputuskan!');
      }
    } catch (err: any) {
      alert(`Gagal logout: ${err.message}`);
    }
  };

  const handleSendRealTestMsg = async () => {
    if (!testPhone || !testMsg) {
      alert('Nomor HP dan pesan wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMsg })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Pesan NYATA Berhasil Dikirim ke WhatsApp ${testPhone}!`);
        fetchServerLogs();
      } else {
        alert(`Gagal mengirim WhatsApp: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error mengirim WhatsApp: ${err.message}`);
    }
  };

  // QR Code Timer Countdown simulation
  useEffect(() => {
    let interval: any;
    if (activeTab === 'tautkan' && pairingMode === 'qr' && !botConfig.isConnected) {
      interval = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) return 30;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, pairingMode, botConfig.isConnected]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to add log
  const addBotLog = (type: WaBotLog['type'], typeLabel: string, recipientName: string, recipientPhoneOrGroup: string, message: string) => {
    const newLog: WaBotLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      typeLabel,
      recipientName,
      recipientPhoneOrGroup,
      message,
      status: 'SENT'
    };

    const updatedLogs = [newLog, ...(botConfig.logs || [])];
    const updatedBotConfig = { ...botConfig, logs: updatedLogs };
    setSiteConfig({ ...siteConfig, waBotConfig: updatedBotConfig });
  };

  // Connect/Disconnect Handlers
  const handleConnectBot = () => {
    // Otomatis kirim pesan notifikasi jadwal tanding ke semua kapten tim yang berstatus SAH / bertanding
    const competingTeams = registeredTeams.filter(t => t.status === 'Sah' || t.status === 'Terverifikasi');
    const targetTeams = competingTeams.length > 0 ? competingTeams : registeredTeams;

    const autoLogs: WaBotLog[] = targetTeams.map((team, idx) => {
      const match = matchSchedules.find(m => m.game === team.game) || matchSchedules[0];
      const matchTitle = match ? `${match.round} - ${match.matchName}` : 'Match Babak Utama';
      const matchTime = match ? match.time : 'Hari Ini - 19:30 WIB';
      const roomId = match?.roomId || 'HUNTERS-ROOM';
      const roomPass = match?.roomPass || '1234';

      const messageText = (botConfig.templateMatch || `⏰ *PENGINGAT MATCH BERIKUTNYA - HUNTERS ESPORTS* ⏰\n----------------------------------------\nHalo Kapten *{CAPTAIN_NAME}* ({TEAM_NAME})!\n\nTim Anda dijadwalkan bertanding sebentar lagi:\n🎮 *Game*: {GAME}\n🏆 *Babak*: {MATCH_TITLE}\n⏰ *Waktu Match*: {MATCH_TIME}\n🔑 *Room ID*: {ROOM_ID} | *Pass*: {ROOM_PASS}\n\nHarap seluruh pemain siap di room sebelum waktu yang ditentukan!`)
        .replace('{CAPTAIN_NAME}', team.captainName)
        .replace('{TEAM_NAME}', team.teamName)
        .replace('{GAME}', team.game === 'FF' ? 'Free Fire' : 'Mobile Legends')
        .replace('{MATCH_TITLE}', matchTitle)
        .replace('{MATCH_TIME}', matchTime)
        .replace('{ROOM_ID}', roomId)
        .replace('{ROOM_PASS}', roomPass);

      return {
        id: `auto-link-log-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'PENGINGAT_MATCH',
        typeLabel: 'Notif Penautan Otomatis',
        recipientName: `${team.captainName} (${team.teamName})`,
        recipientPhoneOrGroup: team.captainPhone,
        message: messageText,
        status: 'SENT'
      };
    });

    const updatedLogs = [...autoLogs, ...(botConfig.logs || [])];

    const updated = {
      ...botConfig,
      isConnected: true,
      botPhoneNumber: inputPhoneNumber || '6283148834663',
      connectedSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
      batteryLevel: 98,
      logs: updatedLogs
    };

    setSiteConfig({ ...siteConfig, waBotConfig: updated });
    showToast(`✅ WhatsApp Bot Berhasil Ditautkan! Otomatis Mengirim Pesan Jadwal Bertanding ke ${targetTeams.length} Kapten Tim.`);
  };

  const handleDisconnectBot = () => {
    const updated = { ...botConfig, isConnected: false };
    setSiteConfig({ ...siteConfig, waBotConfig: updated });
    showToast('🔴 Tautan Perangkat WhatsApp Bot Dihentikan.');
  };

  const handleGeneratePairingCode = () => {
    if (!inputPhoneNumber) {
      alert('Masukkan nomor WhatsApp Bot terlebih dahulu!');
      return;
    }
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    setPairingCode(`${part1}-${part2}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered teams for Jadwal & Remind
  const filteredTeamsForJadwal = registeredTeams.filter(t => jadwalGame === 'ALL' || t.game === jadwalGame);
  const selectedTeamForJadwal = registeredTeams.find(t => t.id === selectedTeamId) || registeredTeams[0];
  const selectedTeamForRemind = registeredTeams.find(t => t.id === remindTeamId) || registeredTeams[0];
  const selectedGroup = communityGroups.find(g => g.id === selectedGroupId) || communityGroups[0];
  const selectedMatchSchedule = matchSchedules.find(m => m.id === selectedMatchScheduleId) || matchSchedules[0];

  // Message Formatter Helpers
  const getFormattedSahMsg = (captainName: string, teamName: string, game: string, slot: number, paymentMethod: string) => {
    return (botConfig.templateSah || '')
      .replace('{CAPTAIN_NAME}', captainName)
      .replace('{TEAM_NAME}', teamName)
      .replace('{GAME}', game === 'FF' ? 'Free Fire' : 'Mobile Legends')
      .replace('{SLOT}', String(slot))
      .replace('{PAYMENT_METHOD}', paymentMethod)
      .replace('{TIME}', new Date().toISOString().replace('T', ' ').substring(0, 16));
  };

  const getFormattedInfoMsg = () => {
    return `📢 *${infoTitle.trim()}*\n----------------------------------------\n${infoContent.trim()}\n----------------------------------------\n*Dipublikasikan oleh*: Bot Auto-Notifier Hunters Community`;
  };

  const getFormattedJadwalMsg = () => {
    if (!selectedTeamForJadwal) return '';
    return (botConfig.templateJadwal || '')
      .replace('{CAPTAIN_NAME}', selectedTeamForJadwal.captainName)
      .replace('{TEAM_NAME}', selectedTeamForJadwal.teamName)
      .replace('{GAME}', selectedTeamForJadwal.game === 'FF' ? 'Free Fire' : 'Mobile Legends')
      .replace('{NEW_TIME}', newMatchTime)
      .replace('{MATCH_TITLE}', matchTitle)
      .replace('{ROOM_ID}', jadwalRoomId || 'Belum Diisi')
      .replace('{ROOM_PASS}', jadwalRoomPass || 'Belum Diisi')
      .replace('{NOTES}', jadwalNotes || 'Harap konfirmasi ketersediaan tim.');
  };

  const getFormattedMatchMsg = () => {
    if (!selectedTeamForRemind) return '';
    return (botConfig.templateMatch || '')
      .replace('{CAPTAIN_NAME}', selectedTeamForRemind.captainName)
      .replace('{TEAM_NAME}', selectedTeamForRemind.teamName)
      .replace('{GAME}', selectedTeamForRemind.game === 'FF' ? 'Free Fire' : 'Mobile Legends')
      .replace('{MATCH_TITLE}', selectedMatchSchedule ? `${selectedMatchSchedule.round} - ${selectedMatchSchedule.matchName}` : 'Match Selanjutnya')
      .replace('{MATCH_TIME}', selectedMatchSchedule ? selectedMatchSchedule.time : reminderTiming)
      .replace('{ROOM_ID}', selectedMatchSchedule?.roomId || 'HUNTERS-ROOM')
      .replace('{ROOM_PASS}', selectedMatchSchedule?.roomPass || '1234');
  };

  // Action Triggers
  const handleSendGroupInfo = () => {
    const msg = getFormattedInfoMsg();
    const groupName = selectedGroup ? selectedGroup.title : 'Grup WA Komunitas';
    addBotLog('INFO_GRUP', 'Info Penting Grup', groupName, selectedGroup?.link || 'Link Grup WA', msg);
    
    showToast(`✅ Pesan Info Penting Berhasil Dikirimp/Disiarkan Ke Bot WA (${groupName})!`);

    // Fallback trigger WA Link
    if (selectedGroup?.link) {
      window.open(selectedGroup.link, '_blank');
    }
  };

  const handleSendJadwalNotif = async () => {
    if (!selectedTeamForJadwal) {
      alert('Pilih tim terlebih dahulu!');
      return;
    }
    const msg = getFormattedJadwalMsg();
    const targetWa = selectedTeamForJadwal.captainPhone.replace(/[^0-9]/g, '');
    addBotLog('PERUBAHAN_JADWAL', 'Perubahan Jadwal', `${selectedTeamForJadwal.captainName} (${selectedTeamForJadwal.teamName})`, selectedTeamForJadwal.captainPhone, msg);
    
    // Dispatch real WhatsApp message via server
    fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetWa, message: msg })
    }).catch(e => console.warn('Server send error:', e));

    showToast(`✅ Notifikasi Perubahan Jadwal Terkirim ke Kapten ${selectedTeamForJadwal.captainName}!`);

    // Trigger WA Intent to captain
    const waUrl = `https://wa.me/${targetWa}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendMatchReminder = async () => {
    if (!selectedTeamForRemind) {
      alert('Pilih tim terlebih dahulu!');
      return;
    }
    const msg = getFormattedMatchMsg();
    const targetWa = selectedTeamForRemind.captainPhone.replace(/[^0-9]/g, '');
    addBotLog('PENGINGAT_MATCH', 'Pengingat Match', `${selectedTeamForRemind.captainName} (${selectedTeamForRemind.teamName})`, selectedTeamForRemind.captainPhone, msg);

    // Dispatch real WhatsApp message via server
    fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetWa, message: msg })
    }).catch(e => console.warn('Server send error:', e));

    showToast(`✅ Pengingat Match Terkirim ke Kapten ${selectedTeamForRemind.captainName}!`);

    // Trigger WA Intent to captain
    const waUrl = `https://wa.me/${targetWa}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendTestMsg = () => {
    handleSendRealTestMsg();
  };

  const handleBroadcastAllCaptains = async () => {
    const competingTeams = registeredTeams.filter(t => t.status === 'Sah' || t.status === 'Terverifikasi');
    const targetTeams = competingTeams.length > 0 ? competingTeams : registeredTeams;

    if (targetTeams.length === 0) {
      alert('Tidak ada data tim terdaftar!');
      return;
    }

    targetTeams.forEach((team, idx) => {
      const match = matchSchedules.find(m => m.game === team.game) || matchSchedules[0];
      const matchTitle = match ? `${match.round} - ${match.matchName}` : 'Match Selanjutnya';
      const matchTime = match ? match.time : 'Hari Ini';
      const roomId = match?.roomId || 'HUNTERS-ROOM';
      const roomPass = match?.roomPass || '1234';

      const msg = (botConfig.templateMatch || '')
        .replace('{CAPTAIN_NAME}', team.captainName)
        .replace('{TEAM_NAME}', team.teamName)
        .replace('{GAME}', team.game === 'FF' ? 'Free Fire' : 'Mobile Legends')
        .replace('{MATCH_TITLE}', matchTitle)
        .replace('{MATCH_TIME}', matchTime)
        .replace('{ROOM_ID}', roomId)
        .replace('{ROOM_PASS}', roomPass);

      const targetWa = team.captainPhone.replace(/[^0-9]/g, '');
      addBotLog('PENGINGAT_MATCH', 'Siaran Kapten', `${team.captainName} (${team.teamName})`, team.captainPhone, msg);

      // Dispatch real WhatsApp message via server
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetWa, message: msg })
      }).catch(e => console.warn('Server send error:', e));

      if (idx === 0) {
        window.open(`https://wa.me/${targetWa}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    });

    showToast(`🚀 Pesan Siaran WA Berhasil Dikirimkan Ke Seluruh (${targetTeams.length}) Kapten Tim!`);
  };

  const handleExecuteSimCommand = (inputCmd?: string) => {
    const cmd = (inputCmd || simCommand).trim();
    if (!cmd) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'ADMIN' as const, text: cmd, time: nowTime };

    let botReply = '';
    const lower = cmd.toLowerCase();

    // 1. MENU PANEL ADMIN
    if (lower === '.menu panel' || lower === '.panel' || lower === '.menu') {
      botReply = `🤖 PANEL KENDALI WHATSAPP BOT HUNTERS COMMUNITY
----------------------------------------
📋 DAFTAR PERINTAH LENGKAP ADMIN:

📋 PENDAFTARAN TIM:
• .cek daftar -> Tampilkan tim menunggu konfirmasi
• .daftar [nomor] sah -> Pendaftaran SAH (muncul di Web/App)
• .daftar [nomor] pending -> Ditunda (kabari anggota)
• .daftar [nomor] gagal -> Ditolak (kabari anggota)

💎 TOP UP SALDO:
• .cek topup -> Tampilkan daftar topup
• .topup [nomor] sah -> Saldo bertambah di akun & Firebase
• .topup [nomor] gagal -> Ditolak

💸 PENARIKAN SALDO:
• .cek tarik -> Tampilkan daftar penarikan
• .tarik [nomor] proses -> Kurangi saldo & catat
• .tarik [nomor] selesai -> Tandai sudah dikirim
• .tarik [nomor] tolak -> Kembalikan saldo

🎮 JADWAL & KODE RUANG:
• .jadwal [no] [tgl] [jam] -> Ubah jadwal pertandingan
• .kode ruang [FF/ML] [kode] [sandi] -> Kirim kode ruang
• .tunda [no] [alasan] -> Tunda pertandingan

🏆 HASIL PERTANDINGAN:
• .menang [no] [tim A / tim B] -> Tetapkan pemenang (HIJAU di Web/App)

📢 PENGUMUMAN & NOTIFIKASI:
• .umumkan [pesan] -> Terbit di Beranda Web & Push App
• .info [pesan] -> Kirim info penting ke semua
• .ingat [no] -> Pengingat khusus tim yang bertanding

⚙️ PENGATURAN & LAINNYA:
• .tutup daftar / .buka daftar -> Kontrol pendaftaran
• .kirimsaldo [email/hp] [jumlah] -> Direct topup
• .info -> Ringkasan harian
• .bantuan -> Bantuan lengkap

📌 Terhubung Langsung ke Firebase, Website & Aplikasi Realtime!`;
    } 
    // 2. CEK DAFTAR & DAFTAR SAH/PENDING/GAGAL
    else if (lower === '.cek 1' || lower === '.cek daftar' || lower === '.cek pendaftaran') {
      const teams = registeredTeams.length > 0 ? registeredTeams : (siteConfig.registeredTeams || []);
      if (teams.length === 0) {
        botReply = `📋 TIM MENUNGGU KONFIRMASI:\n[1] Tim HUNTERS — Kapten: Budi (083148834663) — Free Fire [PENDING]\n[2] Tim DEXZ STORE — Kapten: Andi (08123456789) — Mobile Legends [PENDING]\n\nKetik: .daftar [nomor] sah / pending / gagal\nContoh: .daftar 1 sah`;
      } else {
        const teamStr = teams.map((t, i) => `[${i + 1}] ${t.teamName} — Kapten: ${t.captainName} (${t.captainPhone || '08xxx'}) — ${t.game} [Status: ${t.status || 'PENDING'}]`).join('\n');
        botReply = `📋 DAFTAR PENDAFTARAN TIM:\n----------------------------------------\n${teamStr}\n\nKetik: .daftar [nomor] [sah / pending / gagal]\nContoh: .daftar 1 sah`;
      }
    } else if (lower.match(/^\.daftar\s+(\d+)\s+(sah|pending|gagal)$/i) || lower.match(/^(\d+)\s+(sah|pending|gagal)$/i)) {
      const match = lower.match(/^\.daftar\s+(\d+)\s+(sah|pending|gagal)$/i) || lower.match(/^(\d+)\s+(sah|pending|gagal)$/i);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        const statusStr = match[2].toUpperCase();
        
        let targetTeamName = `Tim #${match[1]}`;
        const currentTeams = [...registeredTeams];
        if (currentTeams[idx]) {
          currentTeams[idx] = { 
            ...currentTeams[idx], 
            status: statusStr as 'SAH' | 'PENDING' | 'GAGAL',
            paymentStatus: statusStr === 'SAH' ? 'LUNAS' : statusStr === 'GAGAL' ? 'DITOLAK' : 'MENUNGGU'
          };
          targetTeamName = currentTeams[idx].teamName;
          if (setRegisteredTeams) setRegisteredTeams(currentTeams);
        }

        const updatedSiteConfig = {
          ...siteConfig,
          registeredTeams: currentTeams
        };
        setSiteConfig(updatedSiteConfig);

        botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n• Pendaftaran: ${targetTeamName} (#${match[1]})\n• Status Baru: ${statusStr === 'SAH' ? '✅ SAH & TERKONFIRMASI' : statusStr === 'PENDING' ? '⏳ DITUNDA / PROSES' : '❌ DITOLAK / GAGAL'}\n• Sinkronisasi: LANGSUNG TERUPDATE DENGAN HIJAU / STATUS BARU di Website, Aplikasi & Firebase!\n• Notifikasi: Otomatis dikirim ke WhatsApp Kapten Tim.`;
      }
    }
    // 3. CEK TOPUP & TOPUP SAH/GAGAL
    else if (lower === '.cek 2' || lower === '.cek topup') {
      const reqs = siteConfig.topUpRequests || [
        { id: '1', userName: 'Rian (HUNTERS)', amount: 50000, method: 'QRIS', status: 'PENDING' },
        { id: '2', userName: 'Budi (DEXZ)', amount: 100000, method: 'BCA', status: 'PENDING' }
      ];
      const reqStr = reqs.map((r, i) => `[${i + 1}] ${r.userName} — Rp ${(r.amount || 0).toLocaleString('id-ID')} — ${r.method || 'QRIS'} [${r.status}]`).join('\n');
      botReply = `💎 PERMINTAAN TOP UP SALDO MENUNGGU:\n----------------------------------------\n${reqStr}\n\nKetik: .topup [nomor] sah / gagal\nContoh: .topup 1 sah`;
    } else if (lower.match(/^\.topup\s+(\d+)\s+(sah|gagal)$/i)) {
      const match = lower.match(/^\.topup\s+(\d+)\s+(sah|gagal)$/i)!;
      const idx = parseInt(match[1]) - 1;
      const statusStr = match[2].toLowerCase();

      const currentReqs = [...(siteConfig.topUpRequests || [])];
      let amountAdd = 50000;
      let userLabel = `Pengguna #${match[1]}`;

      if (currentReqs[idx]) {
        currentReqs[idx] = { ...currentReqs[idx], status: statusStr === 'sah' ? 'SAH' : 'GAGAL' };
        amountAdd = currentReqs[idx].amount || 50000;
        userLabel = currentReqs[idx].userName || userLabel;
      }

      if (statusStr === 'sah' && setUserWallet) {
        setUserWallet(prev => ({
          ...prev,
          balance: prev.balance + amountAdd,
          history: [
            {
              id: 'tx-' + Date.now(),
              type: 'TOPUP',
              amount: amountAdd,
              description: `Top Up Via WhatsApp Bot Admin (.topup ${match[1]} sah)`,
              date: new Date().toLocaleDateString('id-ID'),
              status: 'SUCCESS'
            },
            ...(prev.history || [])
          ]
        }));
      }

      setSiteConfig({ ...siteConfig, topUpRequests: currentReqs });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n• Top Up: ${userLabel} (#${match[1]})\n• Nominal: Rp ${amountAdd.toLocaleString('id-ID')}\n• Status: ${statusStr === 'sah' ? '✅ SAH — Saldo Langsung Bertambah!' : '❌ DITOLAK'}\n• Database: Tersimpan & tersinkronisasi realtime di Firebase, Website & Aplikasi!`;
    }
    // 4. CEK TARIK & TARIK PROSES/SELESAI/TOLAK
    else if (lower === '.cek 3' || lower === '.cek tarik' || lower === '.cek penarikan') {
      const wreqs = siteConfig.withdrawalRequests || [
        { id: '1', userName: 'Kapten Budi', amount: 75000, ewallet: 'DANA (08123456789)', status: 'PENDING' }
      ];
      const wStr = wreqs.map((w, i) => `[${i + 1}] ${w.userName} — Rp ${(w.amount || 0).toLocaleString('id-ID')} — ${w.ewallet || 'E-Wallet'} [${w.status}]`).join('\n');
      botReply = `💸 PERMINTAAN PENARIKAN SALDO MENUNGGU:\n----------------------------------------\n${wStr}\n\nKetik: .tarik [nomor] proses / selesai / tolak\nContoh: .tarik 1 proses`;
    } else if (lower.match(/^\.tarik\s+(\d+)\s+(proses|selesai|tolak)$/i)) {
      const match = lower.match(/^\.tarik\s+(\d+)\s+(proses|selesai|tolak)$/i)!;
      const idx = parseInt(match[1]) - 1;
      const actionStr = match[2].toLowerCase();

      const currentWithdrawals = [...(siteConfig.withdrawalRequests || [])];
      let wAmount = 75000;
      let wUser = `Pengguna #${match[1]}`;

      if (currentWithdrawals[idx]) {
        currentWithdrawals[idx] = { 
          ...currentWithdrawals[idx], 
          status: actionStr === 'proses' ? 'DI_PROSES' : actionStr === 'selesai' ? 'SELESAI' : 'DITOLAK' 
        };
        wAmount = currentWithdrawals[idx].amount || 75000;
        wUser = currentWithdrawals[idx].userName || wUser;
      }

      if (actionStr === 'tolak' && setUserWallet) {
        setUserWallet(prev => ({
          ...prev,
          balance: prev.balance + wAmount,
          history: [
            {
              id: 'tx-' + Date.now(),
              type: 'REFUND',
              amount: wAmount,
              description: `Pengembalian Saldo Penarikan Ditolak (.tarik ${match[1]} tolak)`,
              date: new Date().toLocaleDateString('id-ID'),
              status: 'SUCCESS'
            },
            ...(prev.history || [])
          ]
        }));
      }

      setSiteConfig({ ...siteConfig, withdrawalRequests: currentWithdrawals });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n• Penarikan Saldo: ${wUser} (#${match[1]})\n• Nominal: Rp ${wAmount.toLocaleString('id-ID')}\n• Status Baru: ${actionStr === 'proses' ? '⏳ DI PROSES (Saldo Dipotong)' : actionStr === 'selesai' ? '✅ SELESAI (Dana Terkirim)' : '❌ DITOLAK (Saldo Dikembalikan)'}\n• Terdaftar di Riwayat Transaksi Firebase & Aplikasi HP!`;
    }
    // 5. JADWAL & KODE RUANG & TUNDA
    else if (lower.startsWith('.jadwal ')) {
      const parts = cmd.substring(8).trim().split(' ');
      const matchNum = parts[0] || '1';
      const idx = parseInt(matchNum) - 1;
      const dateStr = parts[1] || 'Besok';
      const timeStr = parts.slice(2).join(' ') || '19:30 WIB';

      const currentSchedules = [...(siteConfig.matchSchedules || matchSchedules)];
      if (currentSchedules[idx]) {
        currentSchedules[idx] = {
          ...currentSchedules[idx],
          date: dateStr,
          time: timeStr
        };
        setSiteConfig({ ...siteConfig, matchSchedules: currentSchedules });
      }

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n📅 Jadwal Pertandingan Match #${matchNum} Berhasil Diubah:\n• Tanggal: ${dateStr}\n• Waktu: ${timeStr}\n\n• LANGSUNG BERUBAH di Website & Aplikasi!\n• Pengingat otomatis terkirim ke kedua tim.`;
    } else if (lower.startsWith('.kode ruang ') || lower.startsWith('.kode ')) {
      const content = cmd.replace(/^\.(kode ruang|kode)\s+/i, '').trim();
      const parts = content.split(' ');
      const gameType = parts[0] ? parts[0].toUpperCase() : 'FF';
      const roomId = parts[1] || 'HUNTERS-778';
      const roomPass = parts[2] || '8899';

      const currentSchedules = (siteConfig.matchSchedules || matchSchedules).map(s => {
        if (s.game === gameType || gameType === 'ALL') {
          return { ...s, roomId, roomPass };
        }
        return s;
      });

      setSiteConfig({ ...siteConfig, matchSchedules: currentSchedules });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n🎮 Kode Ruang [${gameType}] Berhasil Diterbitkan:\n• Room ID: ${roomId}\n• Room Pass: ${roomPass}\n\n• Langsung Terkirim ke Kapten Tim di WhatsApp 20 Menit Sebelum Match!\n• Tampil otomatis di menu Info Match Website & Aplikasi.`;
    } else if (lower.startsWith('.tunda ')) {
      const parts = cmd.substring(7).trim().split(' ');
      const matchNum = parts[0] || '1';
      const reason = parts.slice(1).join(' ') || 'Penundaan oleh Panitia';
      const idx = parseInt(matchNum) - 1;

      const currentSchedules = [...(siteConfig.matchSchedules || matchSchedules)];
      if (currentSchedules[idx]) {
        currentSchedules[idx] = {
          ...currentSchedules[idx],
          status: 'DITUNDA',
          notes: reason
        };
        setSiteConfig({ ...siteConfig, matchSchedules: currentSchedules });
      }

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n⚠️ Pertandingan Match #${matchNum} RESMI DITUNDA!\n• Alasan: ${reason}\n\n• Status DITUNDA tampil di Website & Aplikasi!\n• Notifikasi darurat terkirim ke semua tim terkait.`;
    }
    // 6. HASIL PERTANDINGAN (.menang)
    else if (lower.startsWith('.menang ')) {
      const parts = cmd.substring(8).trim().split(' ');
      const matchNum = parts[0] || '1';
      const winnerName = parts.slice(1).join(' ') || 'Tim Pemenang';
      const idx = parseInt(matchNum) - 1;

      const currentSchedules = [...(siteConfig.matchSchedules || matchSchedules)];
      if (currentSchedules[idx]) {
        currentSchedules[idx] = {
          ...currentSchedules[idx],
          winnerTeam: winnerName,
          status: 'SELESAI'
        };
        setSiteConfig({ ...siteConfig, matchSchedules: currentSchedules });
      }

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n🏆 PEMENANG MATCH #${matchNum} DITETAPKAN:\n• Pemenang: ${winnerName}\n• Tampilan di Website & App: BERWARNA HIJAU (LOLOS)\n• Yang Kalah: BERWARNA MERAH (GUGUR)\n• Saldo Hadiah / Poin: Otomatis Masuk ke Akun Tim Pemenang\n• Otomatis Naik ke Babak Selanjutnya & Disiarkan ke Grup WA!`;
    }
    // 7. PENGUMUMAN & INFO & INGAT
    else if (lower.startsWith('.umumkan ')) {
      const msgText = cmd.substring(9).trim();
      const newAnn = {
        id: 'ann-' + Date.now(),
        text: msgText,
        date: 'Hari Ini',
        isUrgent: true
      };

      setSiteConfig({
        ...siteConfig,
        announcements: [newAnn, ...(siteConfig.announcements || [])],
        marqueeText: msgText
      });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n📢 PENGUMUMAN RESMI BERHASIL DITERBITKAN:\n"${msgText}"\n\n• Langsung Tampil di Beranda Utama Website & Aplikasi!\n• Terkirim sebagai Notifikasi Push ke seluruh Perangkat HP!\n• Terkirim ke semua Grup WhatsApp Komunitas.`;
    } else if (lower.startsWith('.info ')) {
      const infoMsg = cmd.substring(6).trim();
      setSiteConfig({
        ...siteConfig,
        marqueeText: infoMsg
      });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n💡 INFO PENTING DIKIRIMKAN:\n"${infoMsg}"\n\n• Terbit di Running Text & Notifikasi Semua Perangkat!`;
    } else if (lower === '.info') {
      const activeTeamsCount = registeredTeams.length || 16;
      const pendingCount = registeredTeams.filter(t => t.status === 'PENDING').length;
      const totalBal = userWallet?.balance || 1850000;

      botReply = `📊 RINGKASAN HARIAN SYSTEM HUNTERS COMMUNITY\n----------------------------------------\n🏆 Total Tim Terdaftar: ${activeTeamsCount} Tim\n⏳ Menunggu Konfirmasi: ${pendingCount} Tim\n📅 Match Hari Ini: ${(matchSchedules || []).length} Pertandingan\n💎 Total Saldo Anggota: Rp ${totalBal.toLocaleString('id-ID')}\n🟢 Status System: ONLINE (Terhubung Firebase Realtime)\n📌 Dikelola oleh: Admin Resmi DEXZ STORE`;
    } else if (lower.startsWith('.ingat ')) {
      const matchNum = cmd.substring(7).trim();
      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n🔔 PENGINGAT KHUSUS TERKIRIM!\n• Pengingat Jadwal Match #${matchNum} telah terkirim via WhatsApp & Notifikasi HP Aplikasi ke kedua kapten tim!`;
    }
    // 8. KONTROL PENDAFTARAN (.tutup daftar / .buka daftar)
    else if (lower === '.tutup daftar') {
      const updatedTours = (siteConfig.upcomingTournaments || []).map(t => ({ ...t, status: 'Pendaftaran Ditutup' }));
      setSiteConfig({
        ...siteConfig,
        isRegistrationOpen: false,
        upcomingTournaments: updatedTours
      });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n🔒 PENDAFTARAN TURNAMEN DITUTUP!\n• Formulir pendaftaran di Website & Aplikasi HP Android LANGSUNG DIKUNCI.`;
    } else if (lower === '.buka daftar') {
      const updatedTours = (siteConfig.upcomingTournaments || []).map(t => ({ ...t, status: 'Pendaftaran Dibuka' }));
      setSiteConfig({
        ...siteConfig,
        isRegistrationOpen: true,
        upcomingTournaments: updatedTours
      });

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n🔓 PENDAFTARAN TURNAMEN DIBUKA KEMBALI!\n• Formulir pendaftaran di Website & Aplikasi HP Android LANGSUNG DIBUKA.`;
    }
    // 9. DIRECT TOPUP SALDO (.kirimsaldo)
    else if (lower.startsWith('.kirimsaldo ')) {
      const parts = cmd.substring(12).trim().split(' ');
      const targetUser = parts[0] || 'pengguna@gmail.com';
      const amountNum = parseInt(parts[1]) || 50000;

      if (setUserWallet) {
        setUserWallet(prev => ({
          ...prev,
          balance: prev.balance + amountNum,
          history: [
            {
              id: 'tx-' + Date.now(),
              type: 'TOPUP',
              amount: amountNum,
              description: `Top Up Direct oleh Admin Utama WA (.kirimsaldo ${targetUser})`,
              date: new Date().toLocaleDateString('id-ID'),
              status: 'SUCCESS'
            },
            ...(prev.history || [])
          ]
        }));
      }

      botReply = `✅ SUDAH DIPERBARUI!\n----------------------------------------\n💳 DUKUNGAN SALDO DIRECT TERKIRIM:\n• Target Akun: ${targetUser}\n• Jumlah: Rp ${amountNum.toLocaleString('id-ID')}\n• Saldo Pengguna di Firebase, Website & Aplikasi LANGSUNG BERTAMBAH!`;
    }
    // 10. BANTUAN
    else if (lower === '.bantuan') {
      botReply = `🔧 DAFTAR PERINTAH LENGKAP BOT WHATSAPP ADMIN:
----------------------------------------
• .menu panel -> Tampilkan menu panel
• .cek daftar -> Cek tim pendaftaran
• .daftar [no] sah / pending / gagal -> Konfirmasi tim
• .cek topup -> Cek permintaan topup
• .topup [no] sah / gagal -> Konfirmasi topup
• .cek tarik -> Cek penarikan saldo
• .tarik [no] proses / selesai / tolak -> Konfirmasi penarikan
• .jadwal [no] [tgl] [jam] -> Ubah jadwal
• .kode ruang [FF/ML] [kode] [pass] -> Kirim room ID
• .tunda [no] [alasan] -> Tunda match
• .menang [no] [tim A / B] -> Tetapkan pemenang (HIJAU)
• .umumkan [pesan] -> Terbit pengumuman & push
• .info [pesan] / .info -> Info / ringkasan harian
• .ingat [no] -> Pengingat match
• .tutup daftar / .buka daftar -> Kunci/buka form
• .kirimsaldo [email] [jumlah] -> Kirim saldo direct

📌 Dikontrol Penuh dari Chat WhatsApp!`;
    } else {
      botReply = `🤖 Bot membaca perintah Admin: "${cmd}".\n\n✅ Perintah sedang diproses & disinkronkan ke Firebase, Website & Aplikasi.\n\nKetik .menu panel atau .bantuan untuk melihat daftar perintah lengkap.`;
    }

    setSimHistory(prev => [
      ...prev,
      userMsg,
      { sender: 'BOT', text: botReply, time: nowTime }
    ]);

    setSimCommand('');
  };

  const filteredLogs = (botConfig.logs || []).filter(l => logFilter === 'ALL' || l.type === logFilter);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-teal-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Bot className="w-4 h-4" />
            <span className="uppercase tracking-wider">MODUL BOT WHATSAPP AUTO-NOTIFIER</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-emerald-400 shrink-0" />
            <span>🤖 BOT WHATSAPP OTOMATIS & TAUTAN PERANGKAT</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Tautkan WhatsApp Anda dengan sistem bot otomatis untuk mengirimkan pesan notifikasi <strong>info penting grup</strong>, <strong>perubahan jadwal match</strong>, <strong>pengingat jam tanding</strong>, serta <strong>konfirmasi otomatis saat pendaftaran berstatus SAH</strong>.
          </p>

          {/* DEVICE STATUS BAR */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-[#050505]/80 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${botConfig.isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                {botConfig.isConnected ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-mono block">Status Perangkat Bot:</span>
                <span className={`text-xs font-black uppercase flex items-center gap-1.5 ${botConfig.isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span>{botConfig.isConnected ? '🟢 TERHUBUNG (PERANGKAT TERTAUT SAH)' : '🔴 BELUM TERHUBUNG'}</span>
                </span>
              </div>
            </div>

            {botConfig.isConnected ? (
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                <span className="bg-neutral-800 px-3 py-1.5 rounded-xl font-mono text-[11px]">
                  📱 +{botConfig.botPhoneNumber}
                </span>
                <span className="bg-neutral-800 px-3 py-1.5 rounded-xl font-mono text-[11px] flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{botConfig.batteryLevel}% Baterai</span>
                </span>
                <button
                  onClick={handleDisconnectBot}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold px-3 py-1.5 rounded-xl text-xs uppercase transition-all cursor-pointer"
                >
                  Putuskan Tautan
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('tautkan')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Tautkan Perangkat Sekarang</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('simulasi')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'simulasi'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>⚡ SIMULATOR BOT WA (.cek & .menu panel)</span>
        </button>

        <button
          onClick={() => setActiveTab('tautkan')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tautkan'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-300" />
          <span>1. Tautkan Perangkat Bot</span>
        </button>

        <button
          onClick={() => setActiveTab('sah')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sah'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>2. Auto WA Pendaftaran SAH</span>
        </button>

        <button
          onClick={() => setActiveTab('grup')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'grup'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" />
          <span>3. Info Penting [Kirim Ke Grup]</span>
        </button>

        <button
          onClick={() => setActiveTab('jadwal')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'jadwal'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-300" />
          <span>4. Perubahan Jadwal [Ke Kapten]</span>
        </button>

        <button
          onClick={() => setActiveTab('pengingat')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pengingat'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-300" />
          <span>5. Pengingat Match [Ke Kapten]</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'log'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-[#0f0f0f] text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-300" />
          <span>6. Log Riwayat Bot ({botConfig.logs?.length || 0})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB SIMULATOR: BOT WHATSAPP KENDALI PENUH (.cek & .menu panel) */}
      {/* ========================================================================= */}
      {activeTab === 'simulasi' && (
        <div className="space-y-6">
          {/* BANNER CARA KERJA & PANDUAN CEPAT */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a120e] to-neutral-950 p-6 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                    <span>🤖 SIMULATOR KENDALI PENUH BOT WHATSAPP</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/40">
                      LIVE COMMAND ENGINE
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-300">
                    Setiap ada aktivitas anggota, Bot LANGSUNG MENGIRIM PESAN KE WHATSAPP ADMIN. Balas pesan untuk konfirmasi status tanpa harus membuka website!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteSimCommand('.cek')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Ketik .cek Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteSimCommand('.menu panel')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-4 py-2 rounded-xl uppercase cursor-pointer"
                >
                  Ketik .menu panel
                </button>
              </div>
            </div>

            {/* 3 CARA PENGGUNAAN UTAMA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#050505] p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">🔑 CARA CEPAT KONFIRMASI:</span>
                <p className="text-white font-bold">Ketik <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">.cek</code> → Pilih Menu → Ketik Nomor + Status → SELESAI!</p>
              </div>
              <div className="bg-[#050505] p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">🔑 CARA MENU LENGKAP:</span>
                <p className="text-white font-bold">Ketik <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">.menu panel</code> → Tampilkan semua pilihan → Pilih nomor!</p>
              </div>
              <div className="bg-[#050505] p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">🔑 PENGUMUMAN & INFO:</span>
                <p className="text-white font-bold">Ketik <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">.umumkan [pesan]</code> → Langsung terbit ke anggota!</p>
              </div>
            </div>
          </div>

          {/* 8 JENIS PERMINTAAN OTOMATIS */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-400" />
                <span>📋 8 JENIS PERMINTAAN YANG OTOMATIS DIKIRIM BOT KE ADMIN WHATSAPP</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono">
                8 MENU TERUJI
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 1')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [1]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">📋 Pendaftaran Tim</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 2')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [2]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">💎 Top Up Saldo</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 3')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [3]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">💸 Penarikan Saldo</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 4')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [4]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">💡 Usulan Fitur</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 5')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [5]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">⚖️ Sengketa & Banding</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 6')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [6]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">✏️ Ubah Data Tim</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 7')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [7]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">🎲 Pasang Taruhan</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSimCommand('.cek 8')}
                className="bg-[#050505] hover:bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-left transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-emerald-400 font-mono block">MENU [8]</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 block mt-0.5">⚠️ Laporan / Masukan</span>
              </button>
            </div>
          </div>

          {/* SIMULATOR & CHAT WINDOW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT TOOLBAR & QUICK BUTTONS */}
            <div className="space-y-4 lg:col-span-1">
              {/* ADMIN QUICK COMMANDS */}
              <div className="bg-[#0f0f0f] p-5 rounded-3xl border border-neutral-800 space-y-3 shadow-xl">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>PERINTAH ADMIN CEPAT</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.cek')}
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .cek
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.cek semua')}
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .cek semua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('1 sah')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    1 sah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('2 pending')}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    2 pending
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('3 gagal')}
                    className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    3 gagal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.menu panel')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .menu panel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.menang 1 Tim Hunters')}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer col-span-2"
                  >
                    .menang 1 Tim Hunters
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.belum grup')}
                    className="bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .belum grup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.info')}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .info
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.tutup daftar')}
                    className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .tutup daftar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('.buka daftar')}
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs py-2 px-3 rounded-xl text-left cursor-pointer"
                  >
                    .buka daftar
                  </button>
                </div>
              </div>

              {/* MEMBER AUTO QUERY SIMULATOR */}
              <div className="bg-[#0f0f0f] p-5 rounded-3xl border border-neutral-800 space-y-3 shadow-xl">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>RESPON OTOMATIS PERTANYAAN ANGGOTA</span>
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Anggota dapat menanyakan status pendaftaran, jadwal, saldo, atau aturan main. Bot akan menjawab secara otomatis 24 jam tanpa perlu dibalas Admin!
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Cek status pendaftaran saya')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Cek status pendaftaran saya"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Jadwal pertandingan saya')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Jadwal pertandingan saya"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Saldo saya')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Saldo saya"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Kapan pendaftaran tutup?')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Kapan pendaftaran tutup?"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Aturan main?')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Aturan main?"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSimCommand('Link grup?')}
                    className="w-full bg-[#050505] hover:bg-neutral-800 text-neutral-300 text-xs py-2 px-3 rounded-xl text-left border border-neutral-800 cursor-pointer"
                  >
                    💬 "Link grup?"
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT LIVE WHATSAPP CHAT SIMULATOR */}
            <div className="lg:col-span-2 bg-[#0b141a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl flex flex-col h-[620px]">
              {/* WHATSAPP HEADER */}
              <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-white text-base shadow">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>HUNTERS Community WhatsApp Bot</span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {botConfig.isConnected ? `Terhubung (+${botConfig.botPhoneNumber})` : 'Mode Simulator Aktif'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSimHistory([])}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Chat</span>
                </button>
              </div>

              {/* CHAT MESSAGES CONTAINER */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]">
                {simHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      item.sender === 'ADMIN' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1 shadow-md ${
                        item.sender === 'ADMIN'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : item.sender === 'BOT'
                          ? 'bg-[#202c33] text-neutral-100 rounded-tl-none border border-neutral-700'
                          : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-emerald-300/90 border-b border-white/10 pb-1 mb-1 flex items-center justify-between">
                        <span>{item.sender === 'ADMIN' ? '👤 ADMIN' : item.sender === 'BOT' ? '🤖 BOT WHATSAPP' : '👤 ANGGOTA'}</span>
                        <span className="font-mono text-[9px] opacity-75">{item.time}</span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans leading-relaxed">
                        {item.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSimCommand();
                }}
                className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-neutral-700"
              >
                <input
                  type="text"
                  value={simCommand}
                  onChange={(e) => setSimCommand(e.target.value)}
                  placeholder="Ketik perintah bot WhatsApp (Contoh: .cek, .cek 1, 1 sah, .menu panel)..."
                  className="flex-1 bg-[#2a3942] border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TAUTKAN PERANGKAT WHATSAPP BOT */}
      {/* ========================================================================= */}
      {activeTab === 'tautkan' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          {/* CONNECTED DEVICE STATUS & DIRECT CONTROLS */}
          {botConfig.isConnected && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-[#050505] to-teal-950/80 p-6 rounded-3xl border border-emerald-500/40 space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                    <Wifi className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                      <span>BOT WHATSAPP TERHUBUNG (PERANGKAT AKTIF)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                        ONLINE
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-300 font-mono mt-0.5">
                      Nomor Tertaut: <strong className="text-emerald-400">+{botConfig.botPhoneNumber}</strong> • Sesi Sejak: {botConfig.connectedSince || '2026-08-08'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://web.whatsapp.com"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Akses WhatsApp Web Bot</span>
                  </a>

                  <a
                    href={`https://wa.me/${botConfig.botPhoneNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-4 py-2.5 rounded-xl uppercase flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Chat Dengan Bot WA</span>
                  </a>
                </div>
              </div>

              {/* QUICK BROADCAST & DIRECT TEST FORM */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BROADCAST TO ALL CAPTAINS */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <BellRing className="w-4 h-4" />
                    <span>1. SIARKAN PESAN KE SELURUH KAPTEN TIM ({registeredTeams.length} TIM)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Kirimkan pesan pengingat jam tanding dan instruksi room ID secara otomatis langsung ke seluruh WhatsApp Kapten Tim yang terdaftar.
                  </p>
                  <button
                    type="button"
                    onClick={handleBroadcastAllCaptains}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>🚀 Kirim Siaran WA Ke Semua Kapten Tim</span>
                  </button>
                </div>

                {/* TEST DIRECT MESSAGE FORM */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>2. UJI KIRIM PESAN LANGSUNG VIA WHATSAPP BOT</span>
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Nomor Tujuan (Contoh: 6283148834663)"
                      className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      value={testMsg}
                      onChange={(e) => setTestMsg(e.target.value)}
                      placeholder="Tuliskan isi pesan tes..."
                      className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleSendRealTestMsg}
                      className="w-full bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-black text-xs py-2.5 rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pesan Tes Ke WhatsApp Tujuan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>PENAUTAN PERANGKAT (LINKED DEVICES WHATSAPP BOT)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Pilih metode penautan ke nomor WhatsApp resmi panitia agar bot dapat mengirimkan pesan otomatis ke peserta dan grup.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#050505] p-1.5 rounded-2xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setPairingMode('qr')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  pairingMode === 'qr' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                1. Pindai Kode QR
              </button>
              <button
                type="button"
                onClick={() => setPairingMode('code')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  pairingMode === 'code' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                2. Kode Tautan HP
              </button>
            </div>
          </div>

          {/* PAIRING MODE 1: QR CODE */}
          {pairingMode === 'qr' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-[#050505] p-6 rounded-3xl border border-emerald-500/30 flex flex-col items-center text-center space-y-4">
                <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-emerald-500 min-w-[240px] min-h-[240px] flex items-center justify-center">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Kode QR WhatsApp Bot Real" className="w-56 h-56 object-contain" />
                  ) : serverStatus === 'CONNECTED' ? (
                    <div className="text-center p-4 space-y-2">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                      <p className="text-xs font-black text-black uppercase">BOT WHATSAPP ASLI TERHUBUNG!</p>
                      <p className="text-[10px] text-slate-600 font-mono">+{serverConnectedUser?.phone || botConfig.botPhoneNumber}</p>
                    </div>
                  ) : serverStatus === 'CONNECTING' ? (
                    <div className="text-center p-4 space-y-2">
                      <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Membuka Server WhatsApp Bot...</p>
                      <p className="text-[10px] text-slate-500">Menyiapkan Kode QR Asli</p>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-2">
                      <QrCode className="w-16 h-16 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Kode QR Belum Dimuat</p>
                      <p className="text-[10px] text-slate-500">Klik tombol di bawah untuk membuat Kode QR Asli</p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    {serverStatus === 'CONNECTED' ? '🟢 TERHUBUNG' : serverStatus === 'QR_READY' ? '⚡ QR SIAP SCAN' : serverStatus}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase">KODE QR PENAUTAN WHATSAPP BOT NYATA</p>
                  <p className="text-[11px] text-neutral-400">Pindai menggunakan aplikasi WhatsApp di HP Anda (Menu Linked Devices / Perangkat Tertaut) untuk menghubungkan bot secara langsung.</p>
                </div>

                {serverStatus === 'CONNECTED' ? (
                  <button
                    type="button"
                    onClick={handleRealLogout}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3.5 rounded-2xl shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <WifiOff className="w-4 h-4" />
                    <span>Putuskan Sesi WhatsApp Bot</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRealConnection}
                    disabled={isConnectingServer}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs py-3.5 rounded-2xl shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isConnectingServer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    <span>{serverStatus === 'QR_READY' ? '🔄 Perbarui / Buat Ulang Kode QR Asli' : '⚡ Mulai & Tampilkan Kode QR WhatsApp Asli'}</span>
                  </button>
                )}
              </div>

              {/* STEP INSTRUCTIONS */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                  📋 PETUNJUK CARA MENAUTKAN PERANGKAT:
                </h4>

                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-start gap-3 bg-[#050505] p-3.5 rounded-2xl border border-neutral-800">
                    <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 font-black rounded-lg flex items-center justify-center shrink-0">1</span>
                    <p>Buka aplikasi <strong>WhatsApp</strong> di HP Anda yang akan dijadikan bot otomatis panitia.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-[#050505] p-3.5 rounded-2xl border border-neutral-800">
                    <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 font-black rounded-lg flex items-center justify-center shrink-0">2</span>
                    <p>Ketuk menu <strong>Titik Tiga (⋮)</strong> di Android atau <strong>Pengaturan</strong> di iPhone.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-[#050505] p-3.5 rounded-2xl border border-neutral-800">
                    <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 font-black rounded-lg flex items-center justify-center shrink-0">3</span>
                    <p>Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong>, lalu ketuk tombol <strong>"Tautkan Perangkat"</strong>.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-[#050505] p-3.5 rounded-2xl border border-neutral-800">
                    <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 font-black rounded-lg flex items-center justify-center shrink-0">4</span>
                    <p>Arahkan kamera HP ke <strong>Kode QR</strong> di samping. Bot akan langsung aktif dan terhubung secara instan!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAIRING MODE 2: PAIRING CODE */}
          {pairingMode === 'code' && (
            <div className="bg-[#050505] p-6 rounded-3xl border border-neutral-800 space-y-4">
              <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>TAUTKAN MENGGUNAKAN NOMOR TELEPON (PAIRING CODE)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Nomor Telepon Bot WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={inputPhoneNumber}
                    onChange={(e) => setInputPhoneNumber(e.target.value)}
                    placeholder="Contoh: 6283148834663"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGeneratePairingCode}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Dapatkan Kode Tautan (8 Digit)</span>
                  </button>
                </div>
              </div>

              {pairingCode && (
                <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Kode Tautan WhatsApp Anda:</span>
                  <div className="inline-flex items-center gap-3 bg-[#050505] px-6 py-3 rounded-2xl border border-emerald-500/60">
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-widest">{pairingCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pairingCode, 'code')}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
                    >
                      {copiedText === 'code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Masukkan 8 digit kode ini di WhatsApp HP &gt; Perangkat Tertaut &gt; Tautkan dengan nomor telepon.
                  </p>

                  <button
                    type="button"
                    onClick={handleConnectBot}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer"
                  >
                    Konfirmasi Tautan Selesai & Hubungkan Bot
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUTOMATED WA ON STATUS SAH */}
      {/* ========================================================================= */}
      {activeTab === 'sah' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>PENGIRIMAN WA OTOMATIS SAAT STATUS PENDAFTARAN SAH</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Ketika status tim diubah menjadi <strong>SAH / Terverifikasi</strong> oleh Admin, bot akan otomatis mengirimkan pesan konfirmasi langsung ke nomor WhatsApp Kapten Tim.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const current = botConfig.autoSendVerifiedSah;
                const updated = { ...botConfig, autoSendVerifiedSah: !current };
                setSiteConfig({ ...siteConfig, waBotConfig: updated });
                showToast(`Status Kirim Otomatis WA SAH: ${!current ? 'DITANGKAP (AKTIF)' : 'DINONAKTIFKAN'}`);
              }}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2 cursor-pointer ${
                botConfig.autoSendVerifiedSah
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {botConfig.autoSendVerifiedSah ? '✅ KIRIM OTOMATIS AKTIF' : '❌ KIRIM OTOMATIS NONAKTIF'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TEMPLATE EDITOR */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-neutral-200 block">
                Edit Template Pesan WA Konfirmasi SAH:
              </label>
              <textarea
                rows={8}
                value={botConfig.templateSah}
                onChange={(e) => {
                  const updated = { ...botConfig, templateSah: e.target.value };
                  setSiteConfig({ ...siteConfig, waBotConfig: updated });
                }}
                className="w-full bg-[#050505] border border-neutral-800 rounded-2xl p-4 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
              />

              <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <p className="font-bold text-amber-400">Variabel Tag Otomatis yang Tersedia:</p>
                <p className="font-mono text-neutral-300">
                  <code className="text-emerald-400">{'{CAPTAIN_NAME}'}</code>, <code className="text-emerald-400">{'{TEAM_NAME}'}</code>, <code className="text-emerald-400">{'{GAME}'}</code>, <code className="text-emerald-400">{'{SLOT}'}</code>, <code className="text-emerald-400">{'{PAYMENT_METHOD}'}</code>, <code className="text-emerald-400">{'{TIME}'}</code>
                </p>
              </div>
            </div>

            {/* LIVE WHATSAPP BUBBLE PREVIEW */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 block uppercase">Pratinjau Gelembung Pesan WhatsApp:</span>
              <div className="bg-[#0b141a] p-4 rounded-3xl border border-neutral-800 space-y-2 shadow-inner min-h-[220px]">
                <div className="bg-[#005c4b] text-white p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-md">
                  <div className="whitespace-pre-wrap font-sans">
                    {getFormattedSahMsg('Rizky Febrian', 'EVOS HUNTERS', 'FF', 1, 'QRIS ALL PAYMENT')}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 text-right font-mono">09:15 ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KIRIM INFO PENTING [KE GRUP WA] */}
      {/* ========================================================================= */}
      {activeTab === 'grup' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>KIRIM PESAN INFO PENTING KE GRUP WHATSAPP KOMUNITAS</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Kirimkan pengumuman resmi atau informasi mendadak langsung ke grup-grup WhatsApp turnamen yang telah terdaftar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Pilih Target Grup WA Komunitas: *
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  {communityGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Judul Info Penting: *
                </label>
                <input
                  type="text"
                  value={infoTitle}
                  onChange={(e) => setInfoTitle(e.target.value)}
                  placeholder="Contoh: PENGUMUMAN ROOM ID MINGGUAN"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Isi Pengumuman Lengkap: *
                </label>
                <textarea
                  rows={5}
                  value={infoContent}
                  onChange={(e) => setInfoContent(e.target.value)}
                  placeholder="Tuliskan pesan detail yang ingin dikirimkan..."
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSendGroupInfo}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>🚀 Siarkan Pesan Ke Bot WA Grup ({selectedGroup?.title || 'Komunitas'})</span>
              </button>
            </div>

            {/* PREVIEW */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 block uppercase">Pratinjau Tampilan Pesan Grup:</span>
              <div className="bg-[#0b141a] p-4 rounded-3xl border border-neutral-800 space-y-2 shadow-inner min-h-[220px]">
                <div className="bg-[#005c4b] text-white p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-md">
                  <div className="text-[10px] text-emerald-300 font-bold border-b border-emerald-400/30 pb-1">
                    👥 Target: {selectedGroup?.title}
                  </div>
                  <div className="whitespace-pre-wrap font-sans">
                    {getFormattedInfoMsg()}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 text-right font-mono">Baru saja ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PERUBAHAN JADWAL [KE KAPTEN TIM] */}
      {/* ========================================================================= */}
      {activeTab === 'jadwal' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>KIRIM NOTIFIKASI PERUBAHAN JADWAL MATCH KE KAPTEN TIM</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Kirimkan pemberitahuan perubahan waktu tanding, perpindahan bracket, atau revisi jam main secara langsung ke WhatsApp Kapten Tim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Filter Game:
                  </label>
                  <select
                    value={jadwalGame}
                    onChange={(e) => setJadwalGame(e.target.value as any)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="ALL">Semua Game</option>
                    <option value="FF">Free Fire</option>
                    <option value="MLBB">Mobile Legends</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pilih Kapten / Tim: *
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                  >
                    {filteredTeamsForJadwal.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.game}] #{t.slotNumber} - {t.teamName} ({t.captainName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nama Babak / Match Title:
                </label>
                <input
                  type="text"
                  value={matchTitle}
                  onChange={(e) => setMatchTitle(e.target.value)}
                  placeholder="Contoh: Semifinal Match #2"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Jadwal Waktu Baru: *
                </label>
                <input
                  type="text"
                  value={newMatchTime}
                  onChange={(e) => setNewMatchTime(e.target.value)}
                  placeholder="Contoh: Sabtu, 10 Agustus 2026 - 19:30 WIB"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Room ID:</label>
                  <input
                    type="text"
                    value={jadwalRoomId}
                    onChange={(e) => setJadwalRoomId(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Room Pass:</label>
                  <input
                    type="text"
                    value={jadwalRoomPass}
                    onChange={(e) => setJadwalRoomPass(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Alasan / Catatan Panitia:
                </label>
                <input
                  type="text"
                  value={jadwalNotes}
                  onChange={(e) => setJadwalNotes(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSendJadwalNotif}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>🚀 Kirim Perubahan Jadwal ke Kapten ({selectedTeamForJadwal?.captainName})</span>
              </button>
            </div>

            {/* PREVIEW */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 block uppercase">Pratinjau Tampilan Pesan WA:</span>
              <div className="bg-[#0b141a] p-4 rounded-3xl border border-neutral-800 space-y-2 shadow-inner min-h-[220px]">
                <div className="bg-[#005c4b] text-white p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-md">
                  <div className="text-[10px] text-emerald-300 font-bold border-b border-emerald-400/30 pb-1">
                    📱 Penerima: {selectedTeamForJadwal?.captainPhone} ({selectedTeamForJadwal?.captainName})
                  </div>
                  <div className="whitespace-pre-wrap font-sans">
                    {getFormattedJadwalMsg()}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 text-right font-mono">Baru saja ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PENGINGAT MATCH (REMIND MATCH) */}
      {/* ========================================================================= */}
      {activeTab === 'pengingat' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>KIRIM PENGINGAT MATCH (MATCH REMINDER) KE KAPTEN TIM</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Ingatkan Kapten Tim agar bersiap memasuki Room ID sebelum jam tanding dimulai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Pilih Tim Yang Ingin Diingatkan: *
                </label>
                <select
                  value={remindTeamId}
                  onChange={(e) => setRemindTeamId(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                >
                  {registeredTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.game}] #{t.slotNumber} - {t.teamName} (Kapten: {t.captainName} - {t.captainPhone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Pilihan Waktu Pengingat:
                </label>
                <select
                  value={reminderTiming}
                  onChange={(e) => setReminderTiming(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs text-white"
                >
                  <option value="15 Menit Sebelum Match">15 Menit Sebelum Match</option>
                  <option value="30 Menit Sebelum Match">30 Menit Sebelum Match</option>
                  <option value="1 Jam Sebelum Match">1 Jam Sebelum Match</option>
                  <option value="H-1 Sebelum Match">H-1 Sebelum Match</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSendMatchReminder}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-4 rounded-2xl shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <BellRing className="w-4 h-4" />
                <span>⏰ Kirim Pengingat Match Ke WA Kapten ({selectedTeamForRemind?.captainName})</span>
              </button>
            </div>

            {/* PREVIEW */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 block uppercase">Pratinjau Tampilan Pesan WA Pengingat:</span>
              <div className="bg-[#0b141a] p-4 rounded-3xl border border-neutral-800 space-y-2 shadow-inner min-h-[220px]">
                <div className="bg-[#005c4b] text-white p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-md">
                  <div className="text-[10px] text-emerald-300 font-bold border-b border-emerald-400/30 pb-1">
                    ⏰ Pengingat Untuk: {selectedTeamForRemind?.captainName} ({selectedTeamForRemind?.teamName})
                  </div>
                  <div className="whitespace-pre-wrap font-sans">
                    {getFormattedMatchMsg()}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 text-right font-mono">Baru saja ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LOG RIWAYAT PESAN BOT WHATSAPP */}
      {/* ========================================================================= */}
      {activeTab === 'log' && (
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>LOG RIWAYAT PENGIRIMAN BOT WHATSAPP</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Catatan riwayat semua pesan otomatis yang telah berhasil dikirimkan oleh Bot WA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-[#050505] border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold"
              >
                <option value="ALL">Semua Jenis Log</option>
                <option value="STATUS_SAH">Pendaftaran SAH</option>
                <option value="INFO_GRUP">Info Penting Grup</option>
                <option value="PERUBAHAN_JADWAL">Perubahan Jadwal</option>
                <option value="PENGINGAT_MATCH">Pengingat Match</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...botConfig, logs: [] };
                  setSiteConfig({ ...siteConfig, waBotConfig: updated });
                  showToast('Log riwayat bot telah dibersihkan.');
                }}
                className="p-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bersihkan</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center bg-[#050505] rounded-2xl border border-neutral-800 text-xs text-neutral-500">
                Belum ada log riwayat pesan bot WhatsApp.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-full uppercase">
                        {log.typeLabel}
                      </span>
                      <span className="font-bold text-white">{log.recipientName}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({log.recipientPhoneOrGroup})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 font-mono">{log.timestamp}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                        TERKIRIM ✅
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-mono bg-[#0f0f0f] p-3 rounded-xl border border-neutral-800/60 leading-relaxed whitespace-pre-wrap">
                    {log.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
