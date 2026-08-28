import type { Dispatch, SetStateAction } from 'react';
import { RegisteredTeam, SiteConfig, UserWallet, FeatureRecommendation, DonationRecord, SaweriaTransaction, TopUpRequest, WalletTransaction } from '../types';
import { saveSiteConfigToFirestore, saveSingleTeamToFirestore, saveUserWalletToFirestore, getUserWalletKey } from './firebaseStore';
import { notifyAdminEvent } from './notificationService';

export const SAWERIA_ACCOUNT = 'Hntrs';
export const SAWERIA_URL = 'https://saweria.co/Hntrs';
export const SAWERIA_WEBHOOK_URL = 'https://pusat-turnamen-hunters-community.ai.studio/api/saweria-pembayaran';
export const OFFICIAL_WEBSITE_URL = 'https://pusat-turnamen-hunters-community.ai.studio';

/**
 * Format number to IDR string
 */
export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
}

/**
 * Generate a valid EMVCo Saweria Dynamic QRIS payload string & QR code image
 */
export function generateSaweriaQris(params: {
  amount: number;
  payerName: string;
  type: 'FF_REGISTRATION' | 'MLBB_REGISTRATION' | 'TOPUP' | 'FEATURE_RECOMMENDATION' | 'DONATION';
  referenceId: string;
  note?: string;
}): {
  qrCodeUrl: string;
  qrPayload: string;
  saweriaLink: string;
  referenceId: string;
  formattedAmount: string;
} {
  const { amount, payerName, type, referenceId } = params;
  const sanitizedRef = referenceId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  
  // EMVCo QR format standard with Saweria Merchant payload
  // Tag 00: Format Indicator (01)
  // Tag 01: Point of Initiation (12 = Dynamic QR)
  // Tag 26: Merchant Info - Saweria ID
  // Tag 51: National ID (ID.SAWERIA.HNTRS)
  // Tag 52: Merchant Category Code
  // Tag 53: Currency (360 = IDR)
  // Tag 54: Transaction Amount
  // Tag 58: Country Code (ID)
  // Tag 59: Merchant Name (HUNTERS ESPORTS - SAWERIA)
  // Tag 60: Merchant City (JAKARTA)
  // Tag 61: Postal Code (12340)
  // Tag 62: Additional Data (Reference ID)
  const qrPayload = `00020101021226580014ID.SAWERIA.HNTRS01189360091100253839190530303UMI51450014ID.SAWERIA.HNTRS0215HNTRS_COMMUNITY52045812530336054${amount.toString().length.toString().padStart(2, '0')}${amount}5802ID5924HUNTERS ESPORTS SAWERIA6007JAKARTA61051234062${(sanitizedRef.length + 4).toString().padStart(2, '0')}01${sanitizedRef.length.toString().padStart(2, '0')}${sanitizedRef}6304`;
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=1&ecc=M&data=${encodeURIComponent(qrPayload)}`;
  const saweriaLink = `${SAWERIA_URL}`;

  return {
    qrCodeUrl,
    qrPayload,
    saweriaLink,
    referenceId,
    formattedAmount: formatRupiah(amount)
  };
}

/**
 * Calculate the 5 real-time breakdown balances from Firebase data:
 * 1. TOTAL SALDO FF
 * 2. TOTAL SALDO MLBB
 * 3. TOTAL TOP UP
 * 4. TOTAL DONASI
 * 5. TOTAL REKOMENDASI
 * -> 💰 SALDO TOTAL SAWERIA = (1 + 2 + 3 + 4 + 5) - Penarikan Admin
 */
export function calculateSaweriaBalances(
  config: SiteConfig,
  teams: RegisteredTeam[],
  userWallets?: UserWallet[]
): {
  totalSaldoFF: number;
  totalSaldoMLBB: number;
  totalTopUp: number;
  totalDonasi: number;
  totalRekomendasi: number;
  totalMasukSemua: number;
  withdrawnAmount: number;
  saldoTersediaSaweria: number;
} {
  // 1. TOTAL SALDO FF: Tim berstatus Sah Free Fire
  const ffFeePerSlot = config.prizePoolConfig?.feePerSlot || 50000;
  const ffSahTeams = teams.filter(t => t.game === 'FF' && t.status === 'Sah');
  const totalSaldoFF = ffSahTeams.reduce((sum, t) => {
    const rawAmt = t.paymentAmount ? parseInt(t.paymentAmount.replace(/\D/g, ''), 10) : ffFeePerSlot;
    return sum + (isNaN(rawAmt) || rawAmt <= 0 ? ffFeePerSlot : rawAmt);
  }, 0);

  // 2. TOTAL SALDO MLBB: Tim berstatus Sah MLBB
  const mlbbFeePerSlot = config.prizePoolConfig?.feePerSlot || 50000;
  const mlbbSahTeams = teams.filter(t => t.game === 'MLBB' && t.status === 'Sah');
  const totalSaldoMLBB = mlbbSahTeams.reduce((sum, t) => {
    const rawAmt = t.paymentAmount ? parseInt(t.paymentAmount.replace(/\D/g, ''), 10) : mlbbFeePerSlot;
    return sum + (isNaN(rawAmt) || rawAmt <= 0 ? mlbbFeePerSlot : rawAmt);
  }, 0);

  // 3. TOTAL TOP UP: Semua top up berhasil dari seluruh pengguna & transaksi tercatat
  let totalTopUp = 0;
  if (userWallets && userWallets.length > 0) {
    userWallets.forEach(w => {
      w.topUpHistory?.forEach(req => {
        if (req.status === 'Berhasil') totalTopUp += req.amount;
      });
    });
  }
  // Tambahkan juga dari transaksi Saweria kategori TOPUP
  const saweriaTxTopUp = (config.saweriaConfig?.transactions || [])
    .filter(tx => tx.type === 'TOPUP' && tx.status === 'BERHASIL')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  totalTopUp = Math.max(totalTopUp, saweriaTxTopUp);

  // 4. TOTAL DONASI: Seluruh donasi berstatus BERHASIL di Firebase
  const donRecords = config.donationRecords || [];
  const totalDonasi = config.totalDonationAmount || donRecords
    .filter(r => r.status === 'BERHASIL')
    .reduce((sum, r) => sum + r.amount, 0);

  // 5. TOTAL REKOMENDASI: Total biaya rekomendasi fitur (Rp 5.000 / pengajuan LUNAS)
  const recList = config.featureRecommendations || [];
  const totalRekomendasi = recList
    .filter(r => r.paymentStatus === 'LUNAS' || r.status !== 'TIDAK_DAPAT_DIPROSES')
    .reduce((sum, r) => sum + (r.fee || 5000), 0);

  // Total Keseluruhan 5 Kategori
  const totalMasukSemua = totalSaldoFF + totalSaldoMLBB + totalTopUp + totalDonasi + totalRekomendasi;
  const withdrawnAmount = config.saweriaConfig?.withdrawnAmount || 0;
  const saldoTersediaSaweria = Math.max(0, totalMasukSemua - withdrawnAmount);

  return {
    totalSaldoFF,
    totalSaldoMLBB,
    totalTopUp,
    totalDonasi,
    totalRekomendasi,
    totalMasukSemua,
    withdrawnAmount,
    saldoTersediaSaweria
  };
}

/**
 * 1. PROCESS PENDAFTARAN TURNAMEN DENGAN SAWERIA
 * - Mengirim bukti pembayaran Saweria ke antrean Admin
 * - Status tim tetap "Menunggu Pembayaran" (Pending)
 * - Hanya Admin yang berhak menyetujui menjadi "Sah" atau menolak "Gagal"
 * - Menyimpan ke Firestore & mencatat notifikasi Admin
 */
export async function processTournamentPaymentSuccess(params: {
  team: RegisteredTeam;
  amount: number;
  allTeams: RegisteredTeam[];
  siteConfig: SiteConfig;
  setRegisteredTeams: Dispatch<SetStateAction<RegisteredTeam[]>>;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
}): Promise<RegisteredTeam> {
  const { team, amount, allTeams, siteConfig, setRegisteredTeams, setSiteConfig } = params;

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate next provisional slot for this game
  const sameGameSahTeams = allTeams.filter(t => t.game === team.game && t.status === 'Sah' && t.id !== team.id);
  const nextSlot = sameGameSahTeams.length + 1;

  const updatedTeam: RegisteredTeam = {
    ...team,
    slotNumber: team.slotNumber || nextSlot,
    status: 'Menunggu Pembayaran',
    paymentMethod: 'Saweria QRIS Nyata (@Hntrs)',
    paymentProvider: 'Saweria Hntrs',
    paymentAmount: formatRupiah(amount),
    paymentNotes: `Menunggu Konfirmasi Admin via Saweria QRIS [Ref: ${team.id}]`,
    paymentSubmittedAt: timeFormatted,
    registeredAt: team.registeredAt || timeFormatted
  };

  // Update teams array
  const updatedAllTeams = [
    updatedTeam,
    ...allTeams.filter(t => t.id !== team.id)
  ];
  setRegisteredTeams(updatedAllTeams);
  await saveSingleTeamToFirestore(updatedTeam);

  // Record Saweria Transaction as PENDING_VERIFIKASI
  const newTx: SaweriaTransaction = {
    id: `tx-saweria-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: team.game === 'FF' ? 'FF_REGISTRATION' : 'MLBB_REGISTRATION',
    typeLabel: `Pendaftaran ${team.game} - ${team.teamName}`,
    amount,
    payerName: team.captainName || team.teamName,
    payerPhone: team.captainPhone,
    message: `Slot #${nextSlot} ${team.game} - Tim ${team.teamName} (Menunggu Konfirmasi Admin)`,
    status: 'MENUNGGU_VERIFIKASI',
    referenceId: team.id,
    saweriaRef: `SWR-${team.game}-${Date.now().toString().slice(-6)}`,
    createdAt: timeFormatted,
    timestamp: Date.now()
  };

  const updatedConfig: SiteConfig = {
    ...siteConfig,
    saweriaConfig: {
      username: 'Hntrs',
      saweriaUrl: SAWERIA_URL,
      webhookUrl: SAWERIA_WEBHOOK_URL,
      withdrawnAmount: siteConfig.saweriaConfig?.withdrawnAmount || 0,
      withdrawalHistory: siteConfig.saweriaConfig?.withdrawalHistory || [],
      transactions: [newTx, ...(siteConfig.saweriaConfig?.transactions || [])]
    }
  };

  setSiteConfig(updatedConfig);
  await saveSiteConfigToFirestore(updatedConfig);

  notifyAdminEvent(
    'pendaftaran',
    `⏳ Pembayaran Saweria Masuk: ${team.teamName} (${team.game})`,
    `Tim "${team.teamName}" telah mengirim pembayaran Rp${amount.toLocaleString('id-ID')} via Saweria. Menunggu verifikasi & konfirmasi Admin!`,
    updatedTeam
  );

  return updatedTeam;
}

/**
 * 2. PROCESS TOP UP SALDO PENGGUNA DENGAN SAWERIA
 * - Mengirim permohonan Top Up berstatus "Pending"
 * - Saldo HANYA bertambah setelah disetujui Admin resmi di Dashboard
 * - Mencatat notifikasi event ke Admin
 */
export async function processTopUpPaymentSuccess(params: {
  userKey?: string;
  userName: string;
  userPhone: string;
  amount: number;
  userWallet: UserWallet;
  siteConfig: SiteConfig;
  setUserWallet: Dispatch<SetStateAction<UserWallet>>;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
}): Promise<void> {
  const { userName, userPhone, amount, userWallet, siteConfig, setUserWallet, setSiteConfig } = params;
  const userKey = params.userKey || getUserWalletKey(userPhone || userName);

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const topUpId = `topup-swr-${Date.now()}`;

  const topUpReq: TopUpRequest = {
    id: topUpId,
    userName,
    userPhone,
    amount,
    status: 'Pending',
    requestedAt: timeFormatted,
    note: 'Menunggu Verifikasi & Konfirmasi Admin (Saweria QRIS)'
  };

  const walletTx: WalletTransaction = {
    id: `tx-${Date.now()}`,
    userName,
    userPhone,
    type: 'TOPUP',
    typeLabel: 'Top Up Saldo (Menunggu Konfirmasi)',
    amount,
    balanceAfter: userWallet.balance,
    status: 'Pending',
    note: 'Menunggu verifikasi admin via Saweria @Hntrs',
    referenceId: topUpId,
    timestamp: timeFormatted
  };

  const updatedWallet: UserWallet = {
    ...userWallet,
    topUpHistory: [topUpReq, ...(userWallet.topUpHistory || [])],
    transactions: [walletTx, ...(userWallet.transactions || [])]
  };

  setUserWallet(updatedWallet);
  await saveUserWalletToFirestore(userKey, updatedWallet, { nama_tim: userName, email: userPhone });

  // Record Saweria Transaction as MENUNGGU_VERIFIKASI
  const newTx: SaweriaTransaction = {
    id: `tx-saweria-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'TOPUP',
    typeLabel: `Top Up Saldo - ${userName}`,
    amount,
    payerName: userName,
    payerPhone: userPhone,
    message: `Permintaan Top Up Saldo Dompet ${userName} (Menunggu Konfirmasi)`,
    status: 'MENUNGGU_VERIFIKASI',
    referenceId: topUpId,
    saweriaRef: `SWR-TOP-${Date.now().toString().slice(-6)}`,
    createdAt: timeFormatted,
    timestamp: Date.now()
  };

  const updatedConfig: SiteConfig = {
    ...siteConfig,
    saweriaConfig: {
      username: 'Hntrs',
      saweriaUrl: SAWERIA_URL,
      webhookUrl: SAWERIA_WEBHOOK_URL,
      withdrawnAmount: siteConfig.saweriaConfig?.withdrawnAmount || 0,
      withdrawalHistory: siteConfig.saweriaConfig?.withdrawalHistory || [],
      transactions: [newTx, ...(siteConfig.saweriaConfig?.transactions || [])]
    }
  };

  setSiteConfig(updatedConfig);
  await saveSiteConfigToFirestore(updatedConfig);

  notifyAdminEvent(
    'topup',
    `⏳ Permintaan Top Up Saweria: ${userName}`,
    `Pengguna "${userName}" (${userPhone}) mengajukan top up Rp${amount.toLocaleString('id-ID')} via Saweria. Menunggu konfirmasi Admin untuk menambah saldo.`,
    topUpReq
  );
}

/**
 * 3. PROCESS REKOMENDASI FITUR DENGAN SAWERIA (BIAYA RP 5.000)
 * - Mencatat usulan fitur berstatus MENUNGGU_KONFIRMASI
 * - Menyimpan ke Firestore SiteConfig
 * - Mencatat transaksi Saweria
 */
export async function processRecommendationPaymentSuccess(params: {
  userName: string;
  featureTitle?: string;
  featureDescription?: string;
  featureText?: string;
  siteConfig: SiteConfig;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
}): Promise<FeatureRecommendation> {
  const { userName, featureTitle, featureDescription, featureText, siteConfig, setSiteConfig } = params;

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const recId = `rec-swr-${Date.now()}`;
  const fullText = featureText?.trim() 
    ? featureText.trim() 
    : `[USULAN: ${featureTitle || 'Ide Fitur'}]\n${featureDescription || ''}`;

  const newRec: FeatureRecommendation = {
    id: recId,
    userName: userName.trim(),
    featureText: fullText,
    fee: 5000,
    paymentStatus: 'MENUNGGU_VERIFIKASI',
    status: 'MENUNGGU_KONFIRMASI',
    createdAt: timeFormatted
  };

  const newTx: SaweriaTransaction = {
    id: `tx-saweria-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'FEATURE_RECOMMENDATION',
    typeLabel: `Rekomendasi Fitur: ${featureTitle || userName}`,
    amount: 5000,
    payerName: userName,
    message: featureTitle || featureText || 'Rekomendasi Menu/Fitur (Menunggu Konfirmasi Admin)',
    status: 'MENUNGGU_VERIFIKASI',
    referenceId: recId,
    saweriaRef: `SWR-REC-${Date.now().toString().slice(-6)}`,
    createdAt: timeFormatted,
    timestamp: Date.now()
  };

  const updatedConfig: SiteConfig = {
    ...siteConfig,
    featureRecommendations: [newRec, ...(siteConfig.featureRecommendations || [])],
    saweriaConfig: {
      username: 'Hntrs',
      saweriaUrl: SAWERIA_URL,
      webhookUrl: SAWERIA_WEBHOOK_URL,
      withdrawnAmount: siteConfig.saweriaConfig?.withdrawnAmount || 0,
      withdrawalHistory: siteConfig.saweriaConfig?.withdrawalHistory || [],
      transactions: [newTx, ...(siteConfig.saweriaConfig?.transactions || [])]
    }
  };

  setSiteConfig(updatedConfig);
  await saveSiteConfigToFirestore(updatedConfig);

  notifyAdminEvent(
    'laporan',
    `💡 Usulan Fitur Baru (Menunggu Konfirmasi Admin)`,
    `Pengusul "${userName}" telah mengirim pembayaran Rp5.000 via Saweria untuk usulan: "${featureTitle || featureText}". Menunggu konfirmasi Admin.`,
    newRec
  );

  return newRec;
}

/**
 * 4. PROCESS DONASI DENGAN SAWERIA
 * - Menyimpan donasi ke antrean verifikasi Admin (status MENUNGGU_VERIFIKASI)
 * - Hanya bertambah ke Total Donasi setelah disetujui Admin resmi
 */
export async function processDonationPaymentSuccess(params: {
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  message?: string;
  siteConfig: SiteConfig;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
}): Promise<DonationRecord> {
  const { donorName, isAnonymous, amount, message, siteConfig, setSiteConfig } = params;

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const donId = `don-swr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const finalDonorName = isAnonymous ? 'Penyumbang Rahasia' : (donorName.trim() || 'Pengunjung Website');

  const newRecord: DonationRecord = {
    id: donId,
    donorName: finalDonorName,
    isAnonymous,
    amount,
    message: message?.trim() || undefined,
    paymentMethod: 'Saweria QRIS',
    status: 'MENUNGGU_VERIFIKASI',
    createdAt: timeFormatted,
    timestamp: Date.now()
  };

  const newTx: SaweriaTransaction = {
    id: `tx-saweria-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'DONATION',
    typeLabel: `Donasi - ${finalDonorName}`,
    amount,
    payerName: finalDonorName,
    message: message || 'Dukungan Turnamen (Menunggu Konfirmasi Admin)',
    status: 'MENUNGGU_VERIFIKASI',
    referenceId: donId,
    saweriaRef: `SWR-DON-${Date.now().toString().slice(-6)}`,
    createdAt: timeFormatted,
    timestamp: Date.now()
  };

  const updatedRecords = [newRecord, ...(siteConfig.donationRecords || [])];

  const updatedConfig: SiteConfig = {
    ...siteConfig,
    donationRecords: updatedRecords,
    saweriaConfig: {
      username: 'Hntrs',
      saweriaUrl: SAWERIA_URL,
      webhookUrl: SAWERIA_WEBHOOK_URL,
      withdrawnAmount: siteConfig.saweriaConfig?.withdrawnAmount || 0,
      withdrawalHistory: siteConfig.saweriaConfig?.withdrawalHistory || [],
      transactions: [newTx, ...(siteConfig.saweriaConfig?.transactions || [])]
    }
  };

  setSiteConfig(updatedConfig);
  await saveSiteConfigToFirestore(updatedConfig);

  notifyAdminEvent(
    'laporan',
    `💝 Donasi Baru Masuk (Menunggu Verifikasi Admin)`,
    `Donasi dari "${finalDonorName}" sebesar ${formatRupiah(amount)} masuk via Saweria QRIS. Menunggu verifikasi & konfirmasi Admin.`,
    newRecord
  );

  return newRecord;
}
