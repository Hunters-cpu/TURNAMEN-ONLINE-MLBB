import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { waBotManager } from './whatsappBot';

// 1. Initialize Firebase Firestore for Server-side Operations
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const serverDb = getFirestore(app);

/**
 * Clean data for Firestore by removing undefined values recursively
 */
export function sanitizeForFirestoreServer<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return typeof data === 'function' ? (null as any) : data;
  }
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined && typeof item !== 'function')
      .map((item) => sanitizeForFirestoreServer(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined && typeof value !== 'function') {
      cleanObj[key] = sanitizeForFirestoreServer(value);
    }
  }
  return cleanObj as T;
}

// Collections
export const TEAMS_COLLECTION = 'teams';
export const SITE_DATA_COLLECTION = 'siteData';
export const CONFIG_DOC = 'config';
export const PENGGUNA_COLLECTION = 'PENGGUNA';
export const NOTIFICATIONS_COLLECTION = 'notifications';

export interface SaweriaWebhookPayload {
  version?: string;
  created_at?: string;
  id?: string;
  type?: string;
  amount_raw?: number | string;
  amount?: number | string;
  nominal?: number | string;
  gross_amount?: number | string;
  value?: number | string;
  cut?: number | string;
  donator_name?: string;
  donator?: string;
  name?: string;
  payerName?: string;
  donator_email?: string;
  email?: string;
  message?: string;
  pesan?: string;
  note?: string;
  status?: string;
  payment_status?: string;
  referenceId?: string;
  ref_id?: string;
  teamId?: string;
  userPhone?: string;
  userName?: string;
  userKey?: string;
  game?: 'FF' | 'MLBB';
}

export interface WebhookLogItem {
  id: string;
  receivedAt: string;
  amount: number;
  donator: string;
  message: string;
  category: 'PENDAFTARAN_FF' | 'PENDAFTARAN_MLBB' | 'TOP_UP_SALDO' | 'REKOMENDASI_FITUR' | 'DONASI' | 'LAINNYA';
  status: 'BERHASIL' | 'GAGAL' | 'DIPROSES';
  referenceId?: string;
  details?: string;
  firestoreUpdated: boolean;
  whatsappNotified: boolean;
  rawPayload: any;
}

// In-memory memory log for quick dashboard inspections (max 100 items)
export const saweriaWebhookLogs: WebhookLogItem[] = [];

/**
 * Format IDR currency
 */
export function formatRupiahServer(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
}

/**
 * Helper to clean user key
 */
export function getUserKeyServer(userPhoneOrEmailOrId?: string): string {
  if (!userPhoneOrEmailOrId || userPhoneOrEmailOrId === 'guest') return 'guest_default';
  return userPhoneOrEmailOrId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

/**
 * Main Webhook Processing Engine for Saweria
 */
export async function processSaweriaWebhook(payload: SaweriaWebhookPayload): Promise<{
  success: boolean;
  message: string;
  category: string;
  amount: number;
  donator: string;
  firestoreUpdated: boolean;
  whatsappNotified: boolean;
  details?: any;
}> {
  // 1. Extract and normalize fields
  const rawAmount = payload.amount_raw || payload.amount || payload.nominal || payload.gross_amount || payload.value || 0;
  const amount = typeof rawAmount === 'string' ? parseInt(rawAmount.replace(/\D/g, ''), 10) || 0 : Number(rawAmount) || 0;
  
  const donator = String(payload.donator_name || payload.donator || payload.name || payload.payerName || 'Penyumbang Saweria').trim();
  const donatorEmail = String(payload.donator_email || payload.email || '').trim();
  const message = String(payload.message || payload.pesan || payload.note || '').trim();
  const rawStatus = String(payload.status || payload.payment_status || 'BERHASIL').toUpperCase();
  const isSuccess = rawStatus === 'BERHASIL' || rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === 'SETTLED' || rawStatus === 'OK' || rawStatus === '200';
  
  const referenceId = String(payload.referenceId || payload.ref_id || payload.teamId || '').trim();
  const userPhone = String(payload.userPhone || '').trim();
  const userName = String(payload.userName || donator).trim();
  const customUserKey = String(payload.userKey || '').trim();
  const explicitType = String(payload.type || '').toUpperCase();

  const now = new Date();
  const formattedTime = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!isSuccess) {
    const failedLog: WebhookLogItem = {
      id: `swr-log-${Date.now()}`,
      receivedAt: formattedTime,
      amount,
      donator,
      message,
      category: 'LAINNYA',
      status: 'GAGAL',
      referenceId,
      details: 'Pembayaran berstatus gagal / dibatalkan di Saweria',
      firestoreUpdated: false,
      whatsappNotified: false,
      rawPayload: payload
    };
    saweriaWebhookLogs.unshift(failedLog);
    if (saweriaWebhookLogs.length > 100) saweriaWebhookLogs.pop();

    return {
      success: false,
      message: 'Pembayaran tidak berstatus sukses (Gagal / Pending)',
      category: 'LAINNYA',
      amount,
      donator,
      firestoreUpdated: false,
      whatsappNotified: false
    };
  }

  // 2. Identify transaction category & intent
  // A. Check for Tournament Team Registration
  const isFFByKeyword = message.toUpperCase().includes('FF') || explicitType.includes('FF') || payload.game === 'FF';
  const isMLBBByKeyword = message.toUpperCase().includes('MLBB') || message.toUpperCase().includes('MOBILE LEGENDS') || explicitType.includes('MLBB') || payload.game === 'MLBB';
  const hasTeamKeyword = message.toUpperCase().includes('TIM:') || message.toUpperCase().includes('TEAM:') || message.toUpperCase().includes('SLOT:') || message.toUpperCase().includes('DAFTAR:') || referenceId.startsWith('team-') || referenceId.startsWith('reg-');

  // B. Check for User Wallet Top Up
  const isTopUpByKeyword = explicitType === 'TOPUP' || explicitType.includes('TOP_UP') || message.toUpperCase().includes('TOPUP') || message.toUpperCase().includes('TOP UP') || message.toUpperCase().includes('SALDO') || message.toUpperCase().includes('DEPOSIT') || referenceId.startsWith('topup-');

  // C. Check for Feature Recommendation
  const isRecommendationByKeyword = explicitType === 'FEATURE_RECOMMENDATION' || message.toUpperCase().includes('REKOMENDASI') || message.toUpperCase().includes('USULAN') || message.toUpperCase().includes('FITUR') || referenceId.startsWith('rec-');

  let category: WebhookLogItem['category'] = 'DONASI';
  let firestoreUpdated = false;
  let whatsappNotified = false;
  let detailsInfo: any = {};

  try {
    // -----------------------------------------------------------------------
    // FLOW 1: PENDAFTARAN TIM TURNAMEN (FREE FIRE / MOBILE LEGENDS)
    // -----------------------------------------------------------------------
    if ((isFFByKeyword || isMLBBByKeyword || hasTeamKeyword) && !isTopUpByKeyword && !isRecommendationByKeyword) {
      const gameTarget: 'FF' | 'MLBB' = isMLBBByKeyword ? 'MLBB' : 'FF';
      category = gameTarget === 'FF' ? 'PENDAFTARAN_FF' : 'PENDAFTARAN_MLBB';

      // Find matching team in Firestore
      const teamsColRef = collection(serverDb, TEAMS_COLLECTION);
      const teamsSnapshot = await getDocs(teamsColRef);
      const allTeams: any[] = [];
      teamsSnapshot.forEach((docSnap) => {
        allTeams.push({ ...docSnap.data(), id: docSnap.id });
      });

      // Try matching by referenceId, teamId, team name, or captain phone/name
      let matchedTeam = allTeams.find(t => 
        (referenceId && t.id === referenceId) ||
        (referenceId && t.id.toLowerCase() === referenceId.toLowerCase()) ||
        (message && t.id && message.includes(t.id)) ||
        (donator && t.teamName && t.teamName.toLowerCase().trim() === donator.toLowerCase().trim()) ||
        (donator && t.captainName && t.captainName.toLowerCase().trim() === donator.toLowerCase().trim()) ||
        (userPhone && t.captainPhone && t.captainPhone.replace(/\D/g, '') === userPhone.replace(/\D/g, ''))
      );

      // If no exact match found, find any pending team in that game that matches closest or create/assign
      if (!matchedTeam) {
        matchedTeam = allTeams.find(t => t.game === gameTarget && t.status !== 'Sah');
      }

      if (matchedTeam) {
        // Calculate next slot number for this game
        const sameGameSahTeams = allTeams.filter(t => t.game === matchedTeam.game && t.status === 'Sah' && t.id !== matchedTeam.id);
        const nextSlot = sameGameSahTeams.length + 1;

        const updatedTeamData = {
          ...matchedTeam,
          slotNumber: nextSlot,
          status: 'Sah',
          paymentMethod: 'Saweria QRIS Realtime',
          paymentProvider: 'Saweria Hntrs',
          paymentAmount: formatRupiahServer(amount),
          paymentNotes: `Lunas Otomatis via Webhook Saweria [ID: ${payload.id || Date.now()}]`,
          paymentSubmittedAt: formattedTime,
          registeredAt: matchedTeam.registeredAt || formattedTime
        };

        // Update team in Firestore
        await setDoc(doc(serverDb, TEAMS_COLLECTION, matchedTeam.id), sanitizeForFirestoreServer(updatedTeamData), { merge: true });
        firestoreUpdated = true;
        detailsInfo = { teamId: matchedTeam.id, teamName: matchedTeam.teamName, slotNumber: nextSlot, game: matchedTeam.game };

        // Send WhatsApp Notification to Captain if bot is connected
        const captainPhone = matchedTeam.captainPhone || userPhone;
        if (captainPhone) {
          try {
            const waMsg = `🎉 *PEMBAYARAN SAWERIA BERHASIL DIKONFIRMASI!* 🎮\n\nHalo Kapten *${matchedTeam.captainName || matchedTeam.teamName}*,\n\nPembayaran pendaftaran turnamen *${matchedTeam.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}* sebesar *${formatRupiahServer(amount)}* telah DITERIMA dan DIVERIFIKASI secara OTOMATIS via Saweria.\n\n📋 *Rincian Status:* \n• Tim: *${matchedTeam.teamName}*\n• Status: ✅ *SAH & RESMI (Slot #${nextSlot})*\n• Metode: Saweria QRIS Real-Time\n• Waktu: ${formattedTime}\n\nSilakan cek bagan & jadwal match di website resmi: https://pusat-turnamen-hunters-community.ai.studio\n\n_Hunters Community — Dikelola oleh DEXZ STORE_`;
            await waBotManager.sendMessage(captainPhone, waMsg);
            whatsappNotified = true;
          } catch (waErr) {
            console.warn('[Saweria Webhook] WhatsApp message warning (bot might be offline):', waErr);
          }
        }
      } else {
        // No specific team matched, record as general tournament registration entry
        detailsInfo = { note: 'Pendaftaran turnamen diterima tanpa ID tim spesifik' };
      }
    } 
    // -----------------------------------------------------------------------
    // FLOW 2: TOP UP SALDO PENGGUNA (PENGGUNA COLLECTION)
    // -----------------------------------------------------------------------
    else if (isTopUpByKeyword && !isRecommendationByKeyword) {
      category = 'TOP_UP_SALDO';

      // Extract phone number or user key from payload, donator, or message
      let extractedPhone = userPhone;
      if (!extractedPhone) {
        const phoneMatch = message.match(/(?:08|628|\+628)[0-9]{8,13}/) || donator.match(/(?:08|628|\+628)[0-9]{8,13}/);
        if (phoneMatch) extractedPhone = phoneMatch[0];
      }

      const cleanUserKey = customUserKey || (extractedPhone ? getUserKeyServer(extractedPhone) : getUserKeyServer(donatorEmail || donator || 'guest_default'));
      const userDocRef = doc(serverDb, PENGGUNA_COLLECTION, cleanUserKey);
      const userDocSnap = await getDoc(userDocRef);

      let currentBalance = 0;
      let existingHistory: any[] = [];
      let existingTx: any[] = [];
      let existingProfileName = userName || donator;
      let existingEmail = donatorEmail || '';

      if (userDocSnap.exists()) {
        const uData = userDocSnap.data() as any;
        currentBalance = typeof uData.saldo_tersedia === 'number' ? uData.saldo_tersedia : (typeof uData.balance === 'number' ? uData.balance : 0);
        existingHistory = Array.isArray(uData.topUpHistory) ? uData.topUpHistory : [];
        existingTx = Array.isArray(uData.riwayat_transaksi) ? uData.riwayat_transaksi : (Array.isArray(uData.transactions) ? uData.transactions : []);
        if (uData.nama_tim) existingProfileName = uData.nama_tim;
        if (uData.email) existingEmail = uData.email;
      }

      const newBalance = currentBalance + amount;
      const topUpId = `topup-swr-${Date.now()}`;

      const newTopUpRecord = {
        id: topUpId,
        userName: existingProfileName,
        userPhone: extractedPhone || existingEmail || cleanUserKey,
        amount,
        status: 'Berhasil',
        requestedAt: formattedTime,
        processedAt: formattedTime,
        note: `Lunas Otomatis via Webhook Saweria [ID: ${payload.id || Date.now()}]`
      };

      const newWalletTx = {
        id: `tx-${Date.now()}`,
        userName: existingProfileName,
        userPhone: extractedPhone || existingEmail || cleanUserKey,
        type: 'TOPUP',
        typeLabel: 'Top Up Saldo via Saweria Webhook',
        amount,
        balanceAfter: newBalance,
        status: 'Berhasil',
        note: 'Pembayaran Diterima via Saweria Hntrs',
        referenceId: topUpId,
        timestamp: formattedTime
      };

      await setDoc(userDocRef, sanitizeForFirestoreServer({
        nama_tim: existingProfileName,
        email: existingEmail || (cleanUserKey.includes('_') ? cleanUserKey : `${cleanUserKey}@hunters.community`),
        saldo_tersedia: newBalance,
        saldo_ditahan: 0,
        riwayat_transaksi: [newWalletTx, ...existingTx],
        topUpHistory: [newTopUpRecord, ...existingHistory],
        userKey: cleanUserKey,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      firestoreUpdated = true;
      detailsInfo = { userKey: cleanUserKey, previousBalance: currentBalance, newBalance, topUpId };

      // Send WhatsApp Notification for Top Up
      if (extractedPhone) {
        try {
          const waMsg = `💎 *TOP UP SALDO SAWERIA BERHASIL!* 💰\n\nHalo *${existingProfileName}*,\n\nTop up saldo sebesar *${formatRupiahServer(amount)}* telah DITERIMA dan DITAMBAHKAN ke dompet akun Anda secara otomatis via Saweria.\n\n📊 *Rincian Dompet:* \n• Saldo Bertambah: +${formatRupiahServer(amount)}\n• Total Saldo Sekarang: *${formatRupiahServer(newBalance)}*\n• Waktu: ${formattedTime}\n\nSaldo siap digunakan untuk pendaftaran turnamen & fitur lainnya di https://pusat-turnamen-hunters-community.ai.studio\n\n_Hunters Community — DEXZ STORE_`;
          await waBotManager.sendMessage(extractedPhone, waMsg);
          whatsappNotified = true;
        } catch (waErr) {
          console.warn('[Saweria Webhook] WhatsApp topup warning:', waErr);
        }
      }
    }
    // -----------------------------------------------------------------------
    // FLOW 3: REKOMENDASI MENU / FITUR BARU (RP 5.000)
    // -----------------------------------------------------------------------
    else if (isRecommendationByKeyword) {
      category = 'REKOMENDASI_FITUR';

      const configDocRef = doc(serverDb, SITE_DATA_COLLECTION, CONFIG_DOC);
      const configSnap = await getDoc(configDocRef);
      const currentConfig = configSnap.exists() ? (configSnap.data() as any) : {};

      const recId = `rec-swr-${Date.now()}`;
      const newRec = {
        id: recId,
        userName: donator,
        featureText: message || 'Rekomendasi Menu/Fitur Baru',
        fee: amount || 5000,
        paymentStatus: 'LUNAS',
        status: 'DIPROSES',
        createdAt: formattedTime
      };

      const existingRecs = Array.isArray(currentConfig.featureRecommendations) ? currentConfig.featureRecommendations : [];
      await setDoc(configDocRef, sanitizeForFirestoreServer({
        ...currentConfig,
        featureRecommendations: [newRec, ...existingRecs]
      }), { merge: true });

      firestoreUpdated = true;
      detailsInfo = { recommendationId: recId, userName: donator, message };
    }
    // -----------------------------------------------------------------------
    // FLOW 4: DONASI UMUM / DUKUNGAN TURNAMEN
    // -----------------------------------------------------------------------
    else {
      category = 'DONASI';

      const configDocRef = doc(serverDb, SITE_DATA_COLLECTION, CONFIG_DOC);
      const configSnap = await getDoc(configDocRef);
      const currentConfig = configSnap.exists() ? (configSnap.data() as any) : {};

      const donId = `don-swr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const isAnon = donator.toLowerCase().includes('rahasia') || donator.toLowerCase().includes('anon');

      const newDonation = {
        id: donId,
        donorName: isAnon ? 'Penyumbang Rahasia' : donator,
        isAnonymous: isAnon,
        amount,
        message: message || '',
        paymentMethod: 'Saweria QRIS',
        status: 'BERHASIL',
        createdAt: formattedTime,
        timestamp: Date.now()
      };

      const existingDonations = Array.isArray(currentConfig.donationRecords) ? currentConfig.donationRecords : [];
      const currentTotal = typeof currentConfig.totalDonationAmount === 'number' ? currentConfig.totalDonationAmount : 0;

      await setDoc(configDocRef, sanitizeForFirestoreServer({
        ...currentConfig,
        donationRecords: [newDonation, ...existingDonations],
        totalDonationAmount: currentTotal + amount
      }), { merge: true });

      firestoreUpdated = true;
      detailsInfo = { donationId: donId, donorName: donator, amount };
    }

    // -----------------------------------------------------------------------
    // COMMON STEP: RECORD SAWERIA TRANSACTION & IN-APP NOTIFICATION
    // -----------------------------------------------------------------------
    const configDocRef = doc(serverDb, SITE_DATA_COLLECTION, CONFIG_DOC);
    const configSnap = await getDoc(configDocRef);
    const cfgData = configSnap.exists() ? (configSnap.data() as any) : {};

    const newSaweriaTx = {
      id: `tx-saweria-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: category === 'PENDAFTARAN_FF' ? 'FF_REGISTRATION' : (category === 'PENDAFTARAN_MLBB' ? 'MLBB_REGISTRATION' : (category === 'TOP_UP_SALDO' ? 'TOPUP' : (category === 'REKOMENDASI_FITUR' ? 'FEATURE_RECOMMENDATION' : 'DONATION'))),
      typeLabel: `${category.replace(/_/g, ' ')} - ${donator}`,
      amount,
      payerName: donator,
      payerPhone: userPhone || '',
      message: message || category,
      status: 'BERHASIL',
      referenceId: referenceId || payload.id || `swr-${Date.now()}`,
      saweriaRef: payload.id || `SWR-${Date.now().toString().slice(-6)}`,
      createdAt: formattedTime,
      timestamp: Date.now()
    };

    const existingSaweriaCfg = cfgData.saweriaConfig || {};
    const existingTxs = Array.isArray(existingSaweriaCfg.transactions) ? existingSaweriaCfg.transactions : [];

    await setDoc(configDocRef, sanitizeForFirestoreServer({
      ...cfgData,
      saweriaConfig: {
        username: 'Hntrs',
        saweriaUrl: 'https://saweria.co/Hntrs',
        webhookUrl: 'https://pusat-turnamen-hunters-community.ai.studio/api/saweria-pembayaran',
        withdrawnAmount: existingSaweriaCfg.withdrawnAmount || 0,
        withdrawalHistory: existingSaweriaCfg.withdrawalHistory || [],
        transactions: [newSaweriaTx, ...existingTxs],
        lastWebhookPing: formattedTime
      }
    }), { merge: true });

    // Send Real-time App Notification to Firestore
    const notifId = `notif-swr-${Date.now()}`;
    const appNotif = {
      id: notifId,
      category: 'ADMIN_ALERT',
      type: category === 'PENDAFTARAN_FF' || category === 'PENDAFTARAN_MLBB' ? 'pendaftaran' : (category === 'TOP_UP_SALDO' ? 'topup' : 'laporan'),
      title: `⚡ Webhook Saweria: ${category.replace(/_/g, ' ')} (${formatRupiahServer(amount)})`,
      message: `Pembayaran ${formatRupiahServer(amount)} dari "${donator}" telah diverifikasi otomatis via webhook Saweria.`,
      createdAt: formattedTime,
      read: false,
      readBy: [],
      targetAudience: 'all',
      extraData: { amount, donator, category, message, referenceId }
    };

    await setDoc(doc(serverDb, NOTIFICATIONS_COLLECTION, notifId), sanitizeForFirestoreServer(appNotif));

  } catch (err: any) {
    console.error('[Saweria Webhook Handler Error]:', err);
    detailsInfo = { error: err?.message || 'Firestore write error' };
  }

  // 3. Log event into in-memory storage
  const logItem: WebhookLogItem = {
    id: `swr-log-${Date.now()}`,
    receivedAt: formattedTime,
    amount,
    donator,
    message,
    category,
    status: 'BERHASIL',
    referenceId,
    details: JSON.stringify(detailsInfo),
    firestoreUpdated,
    whatsappNotified,
    rawPayload: payload
  };
  saweriaWebhookLogs.unshift(logItem);
  if (saweriaWebhookLogs.length > 100) saweriaWebhookLogs.pop();

  return {
    success: true,
    message: `Pembayaran Saweria Rp${amount.toLocaleString('id-ID')} dari "${donator}" berhasil diproses dan sinkron ke Firebase!`,
    category,
    amount,
    donator,
    firestoreUpdated,
    whatsappNotified,
    details: detailsInfo
  };
}
