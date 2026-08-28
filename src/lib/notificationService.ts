import { AppNotification, NotificationCategory, TabType } from '../types';
import { sendNotificationToFirestore } from './firebaseStore';
import { playNotificationSound } from '../utils/deviceDetector';
import { ADMIN_WA_CLEAN } from '../data/initialData';

// Helper function to send REAL WhatsApp Message via Express Backend Server
export async function sendRealWhatsAppMessage(phone: string | undefined, message: string) {
  if (!phone) return null;
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[WhatsApp Bot API] Dispatch notification error:', err);
    return null;
  }
}

// Trigger native Web Browser Notification if permitted
export function triggerNativeDeviceNotification(title: string, body: string, actionTab?: TabType) {
  // Play sound
  playNotificationSound();

  // Vibrate on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {
      // ignore
    }
  }

  // Native Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `hunters-notif-${Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        if (actionTab && (window as any).setActiveAppTab) {
          (window as any).setActiveAppTab(actionTab);
        }
        notif.close();
      };
    } catch (err) {
      console.log('Native notification trigger prevented by environment/browser:', err);
    }
  }
}

// 1. Notifikasi ke Admin Panel (Pendaftaran Baru, Top Up, Penarikan, Laporan)
export async function notifyAdminEvent(
  itemType: 'pendaftaran' | 'topup' | 'withdrawal' | 'laporan',
  title: string,
  message: string,
  data?: any
) {
  const notif: AppNotification = {
    id: `notif-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'ADMIN_ALERT',
    title: `🔔 [ADMIN] ${title}`,
    message,
    targetRole: 'admin',
    targetItemType: itemType,
    actionTab: 'admin',
    data,
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);
}

// 2. Notifikasi Pengumuman ke Pengguna
export async function notifyAnnouncement(
  title: string,
  content: string,
  category: string,
  targetPhone?: string
) {
  const notif: AppNotification = {
    id: `notif-ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'ANNOUNCEMENT',
    title: `📢 PENGUMUMAN RESMI: ${title}`,
    message: `${content.substring(0, 120)}${content.length > 120 ? '...' : ''}`,
    targetRole: 'all',
    actionTab: 'pengumuman',
    data: { category },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `📢 *PENGUMUMAN RESMI HUNTERS COMMUNITY*\n\n📌 *${title}*\nKategori: ${category}\n\n${content}\n\nSalam,\nPanitia Turnamen DEXZ STORE x Hunters Community`;
  sendRealWhatsAppMessage(targetPhone || ADMIN_WA_CLEAN, waMsg);
}

// 3. Notifikasi Pertandingan Segera Dimulai (30 Menit Sebelum Match)
export async function notifyMatchStarting(
  matchId: string,
  matchTitle: string,
  phase: string,
  time: string,
  teamA?: string,
  teamB?: string,
  targetPhone?: string
) {
  const teamText = teamA && teamB ? `${teamA} vs ${teamB}` : matchTitle;
  const notif: AppNotification = {
    id: `notif-matchstart-${matchId}-${Date.now()}`,
    category: 'MATCH_STARTING',
    title: `⚔️ PERTANDINGAN SEGERA DIMULAI (30 MIN)`,
    message: `${teamText} (${phase}) akan dimulai pukul ${time}. Kapten & Roster harap segera melakukan konfirmasi SIAP/BELUM SIAP!`,
    targetRole: 'all',
    targetMatchId: matchId,
    actionTab: 'info-match',
    data: { matchId, phase, time, teamA, teamB },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `⚔️ *PENGINGAT MATCH SEGERA DIMULAI*\n\nMatch: *${teamText}*\nFase: *${phase}*\nWaktu: *${time} WIB*\n\nHarap seluruh Kapten & Roster bersiap di Room ID 15 menit sebelum waktu tanding!`;
  sendRealWhatsAppMessage(targetPhone || ADMIN_WA_CLEAN, waMsg);
}

// 4. Notifikasi Hasil Konfirmasi (Pendaftaran, Top Up, Penarikan, Laporan)
export async function notifyConfirmationResult(
  targetPhone: string | undefined,
  teamOrUserName: string,
  isApproved: boolean,
  itemType: 'pendaftaran' | 'topup' | 'withdrawal' | 'laporan',
  briefDetails: string,
  rejectionReason?: string
) {
  const icon = isApproved ? '✅' : '❌';
  const typeLabelMap = {
    pendaftaran: 'Pendaftaran Tim',
    topup: 'Pengajuan Top Up Saldo',
    withdrawal: 'Pengajuan Penarikan Saldo',
    laporan: 'Laporan / Permohonan',
  };
  const typeLabel = typeLabelMap[itemType] || 'Pengajuan';

  let title = `${icon} HASIL KONFIRMASI: ${typeLabel} ${isApproved ? 'DISETUJUI' : 'DITOLAK'}`;
  let message = isApproved
    ? `${typeLabel} untuk "${teamOrUserName}" telah DISETUJUI & DIPROSES. ${briefDetails}`
    : `${typeLabel} untuk "${teamOrUserName}" DITOLAK. Alasan: ${rejectionReason || 'Data tidak sesuai / belum memenuhi kriteria.'}`;

  const actionTabMap: Record<string, TabType> = {
    pendaftaran: 'tim',
    topup: 'saldo',
    withdrawal: 'saldo',
    laporan: 'laporan',
  };

  const notif: AppNotification = {
    id: `notif-conf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'CONFIRMATION_RESULT',
    title,
    message,
    targetRole: 'user',
    targetPhone: targetPhone?.trim(),
    targetItemType: itemType,
    actionTab: actionTabMap[itemType] || 'beranda',
    data: { isApproved, rejectionReason },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message to User
  const waMsg = `🤖 *[HUNTERS COMMUNITY BOT]*\n\n${title}\n\nStatus: *${isApproved ? 'DISETUJUI (SAH)' : 'DITOLAK'}*\nNama: ${teamOrUserName}\n\n${message}\n\nCek detail lengkapnya di Website Hunters Community!`;
  sendRealWhatsAppMessage(targetPhone, waMsg);
}

// 5. Notifikasi Perubahan Jadwal
export async function notifyScheduleChanged(
  matchTitle: string,
  teamA: string,
  teamB: string,
  oldSchedule: string,
  newSchedule: string,
  targetPhone?: string
) {
  const notif: AppNotification = {
    id: `notif-schchange-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'SCHEDULE_CHANGED',
    title: `📅 PERUBAHAN JADWAL PERTANDINGAN`,
    message: `Jadwal ${matchTitle} (${teamA} vs ${teamB}) BERUBAH! Jadwal Lama: ${oldSchedule} ➔ Jadwal Baru: ${newSchedule}. Harap perhatikan waktu bertanding!`,
    targetRole: 'all',
    actionTab: 'info-match',
    data: { matchTitle, teamA, teamB, oldSchedule, newSchedule },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `📅 *PERUBAHAN JADWAL MATCH*\n\nMatch: *${matchTitle}* (${teamA} vs ${teamB})\nJadwal Lama: ~${oldSchedule}~\nJadwal Baru: *${newSchedule} WIB*\n\nHarap menyesuaikan waktu bertanding dengan roster tim Anda.`;
  sendRealWhatsAppMessage(targetPhone || ADMIN_WA_CLEAN, waMsg);
}

// 6. Notifikasi Permintaan Penukaran Jadwal
export async function notifyScheduleSwapRequest(
  requestingTeam: string,
  targetTeam: string,
  targetPhone: string | undefined,
  proposedTime: string,
  matchTitle: string
) {
  const notif: AppNotification = {
    id: `notif-swap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'SCHEDULE_SWAP_REQUEST',
    title: `🔄 PERMINTAAN TUKAR JADWAL`,
    message: `Tim "${requestingTeam}" mengajukan penukaran jadwal pertandingan (${matchTitle}) ke waktu: ${proposedTime}. Silakan buka halaman jadwal untuk konfirmasi SETUJU / TIDAK SETUJU.`,
    targetRole: 'user',
    targetPhone: targetPhone?.trim(),
    targetTeamName: targetTeam,
    actionTab: 'info-match',
    data: { requestingTeam, targetTeam, proposedTime },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `🔄 *PERMINTAAN TUKAR JADWAL MATCH*\n\nTim *${requestingTeam}* meminta tukar jadwal (${matchTitle}) dengan tim Anda (*${targetTeam}*).\nWaktu yang diajukan: *${proposedTime}*\n\nSilakan konfirmasi di website Hunters Community!`;
  sendRealWhatsAppMessage(targetPhone, waMsg);
}

// 7. Notifikasi Saldo Berhasil Masuk
export async function notifyBalanceAdded(
  targetPhone: string | undefined,
  userName: string,
  amount: number,
  sourceDescription: string,
  newBalance: number
) {
  const formattedAmt = `Rp ${amount.toLocaleString('id-ID')}`;
  const formattedBal = `Rp ${newBalance.toLocaleString('id-ID')}`;

  const notif: AppNotification = {
    id: `notif-baladd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'BALANCE_ADDED',
    title: `💰 SALDO BERTAMBAH +${formattedAmt}`,
    message: `Selamat ${userName}! Saldo Anda sebesar ${formattedAmt} telah berhasil masuk (${sourceDescription}). Total Saldo Utama Anda saat ini: ${formattedBal}.`,
    targetRole: 'user',
    targetPhone: targetPhone?.trim(),
    actionTab: 'saldo',
    data: { amount, newBalance, sourceDescription },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `💰 *SALDO IN-APP BERTAMBAH*\n\nHalo *${userName}*,\nSaldo akun Anda bertambah sebesar *${formattedAmt}*!\nKeterangan: ${sourceDescription}\n\nTotal Saldo Saat Ini: *${formattedBal}*\n\nTerima kasih telah bertransaksi di DEXZ STORE x Hunters Community!`;
  sendRealWhatsAppMessage(targetPhone, waMsg);
}

// 8. Notifikasi Pengingat Pendaftaran Akan Ditutup (1 Jam Sebelum Tutup)
export async function notifyRegistrationClosing(
  game: 'FF' | 'MLBB' | 'Semua',
  closingTimeStr: string
) {
  const gameName = game === 'FF' ? 'Free Fire' : game === 'MLBB' ? 'Mobile Legends' : 'Turnamen';
  const notif: AppNotification = {
    id: `notif-regclose-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'REGISTRATION_CLOSING',
    title: `⏰ PENDAFTARAN ${gameName.toUpperCase()} SEGERA DITUTUP (1 JAM)!`,
    message: `Pendaftaran slot turnamen ${gameName} akan ditutup pada ${closingTimeStr}! Segera kumpulkan roster & amankan slot tim Anda sebelum pendaftaran ditutup!`,
    targetRole: 'all',
    actionTab: 'form-pendaftaran',
    data: { game, closingTimeStr },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `⏰ *PENDAFTARAN ${gameName.toUpperCase()} SEGERA DITUTUP*\n\nPendaftaran slot ${gameName} akan ditutup pada *${closingTimeStr} WIB*.\nSegera amankan slot tim Anda sebelum penuh & ditutup!`;
  sendRealWhatsAppMessage(ADMIN_WA_CLEAN, waMsg);
}

// 9. Notifikasi Hasil Pertandingan
export async function notifyMatchResult(
  matchTitle: string,
  phase: string,
  winningTeam: string,
  score?: string
) {
  const scoreText = score ? ` (Skor: ${score})` : '';
  const notif: AppNotification = {
    id: `notif-matchres-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'MATCH_RESULT',
    title: `🏆 HASIL PERTANDINGAN: ${winningTeam} MENANG!`,
    message: `Pertandingan ${matchTitle} (${phase}) telah selesai! Tim Pemenang: 👑 ${winningTeam}${scoreText}.`,
    targetRole: 'all',
    actionTab: 'info-match',
    data: { matchTitle, phase, winningTeam, score },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message
  const waMsg = `🏆 *HASIL PERTANDINGAN RESMI*\n\nMatch: *${matchTitle}* (${phase})\nPemenang: 👑 *${winningTeam}*${scoreText}\n\nSelamat kepada tim pemenang!`;
  sendRealWhatsAppMessage(ADMIN_WA_CLEAN, waMsg);
}

// 10. Notifikasi Hasil Taruhan / Prediksi
export async function notifyBetResult(
  userPhone: string | undefined,
  userName: string,
  matchTitle: string,
  isWon: boolean,
  payoutAmount: number,
  pickedTeam: string
) {
  const formattedPayout = `Rp ${payoutAmount.toLocaleString('id-ID')}`;
  const title = isWon
    ? `🎉 TARUHAN MENANG: +${formattedPayout}!`
    : `❌ TARUHAN BELUM BERHASIL`;

  const message = isWon
    ? `Selamat ${userName}! Taruhan Anda pada ${matchTitle} (Tim Pilihan: ${pickedTeam}) MENANG! Saldo hadiah sebesar ${formattedPayout} telah ditambahkan ke akun Anda otomatis.`
    : `Sayang sekali ${userName}, taruhan Anda pada ${matchTitle} (Tim Pilihan: ${pickedTeam}) belum berhasil kali ini. Tetap semangat untuk match berikutnya!`;

  const notif: AppNotification = {
    id: `notif-betres-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: 'BET_RESULT',
    title,
    message,
    targetRole: 'user',
    targetPhone: userPhone?.trim(),
    actionTab: 'prediksi',
    data: { isWon, payoutAmount, pickedTeam, matchTitle },
    createdAt: new Date().toISOString(),
  };

  await sendNotificationToFirestore(notif);

  // Send REAL WhatsApp Message to User
  const waMsg = `🤖 *[HUNTERS COMMUNITY BOT - PREDIKSI]*\n\n${title}\n\nHalo *${userName}*,\n${message}\n\nCek saldo & riwayat prediksi Anda di website Hunters Community!`;
  sendRealWhatsAppMessage(userPhone, waMsg);
}

