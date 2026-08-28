import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RegisteredTeam, SiteConfig, MatchPredictionBet, UserWallet, AppNotification, WalletTransaction, TopUpRequest, WithdrawalRequest } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const db = getFirestore(app);

// Collections & Document references
export const TEAMS_COLLECTION = 'teams';
export const SITE_DATA_COLLECTION = 'siteData';
export const CONFIG_DOC = 'config';
export const BETS_DOC = 'bets';
export const WALLETS_DOC = 'wallets';

/**
 * Recursively removes all `undefined` values and functions from objects and arrays.
 * Firestore strictly rejects documents containing `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
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
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined && typeof value !== 'function') {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

// Subscribe to Teams Realtime Updates
export function subscribeToTeams(
  onUpdate: (teams: RegisteredTeam[]) => void,
  initialFallbackTeams: RegisteredTeam[]
) {
  const colRef = collection(db, TEAMS_COLLECTION);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialFallbackTeams.length > 0) {
      // Seed Firestore if empty
      for (const team of initialFallbackTeams) {
        await setDoc(doc(db, TEAMS_COLLECTION, team.id), sanitizeForFirestore(team));
      }
      onUpdate(initialFallbackTeams);
    } else {
      const teams: RegisteredTeam[] = [];
      snapshot.forEach((docSnap) => {
        teams.push(docSnap.data() as RegisteredTeam);
      });
      // Sort teams: status Sah first, then by registration time
      teams.sort((a, b) => {
        return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
      });
      onUpdate(teams);
    }
  }, (error) => {
    console.error('Error listening to teams snapshot:', error);
  });
}

// Sync all teams to Firestore (creates/updates and cleans up deleted teams)
export async function syncTeamsToFirestore(newTeams: RegisteredTeam[]) {
  try {
    const colRef = collection(db, TEAMS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const existingIds = new Set(snapshot.docs.map(d => d.id));
    const newIds = new Set(newTeams.map(t => t.id));

    // Delete teams removed from array
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        await deleteDoc(doc(db, TEAMS_COLLECTION, id));
      }
    }

    // Upsert teams
    for (const team of newTeams) {
      await setDoc(doc(db, TEAMS_COLLECTION, team.id), sanitizeForFirestore(team));
    }
  } catch (err) {
    console.error('Failed to sync teams to Firestore:', err);
  }
}

// Save single team
export async function saveSingleTeamToFirestore(team: RegisteredTeam) {
  try {
    await setDoc(doc(db, TEAMS_COLLECTION, team.id), sanitizeForFirestore(team));
  } catch (err) {
    console.error('Failed to save single team to Firestore:', err);
  }
}

// Delete single team
export async function deleteTeamFromFirestore(teamId: string) {
  try {
    await deleteDoc(doc(db, TEAMS_COLLECTION, teamId));
  } catch (err) {
    console.error('Failed to delete team from Firestore:', err);
  }
}

// Subscribe to SiteConfig Realtime Updates
export function subscribeToSiteConfig(
  onUpdate: (config: SiteConfig) => void,
  initialFallbackConfig: SiteConfig
) {
  const docRef = doc(db, SITE_DATA_COLLECTION, CONFIG_DOC);
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      await setDoc(docRef, sanitizeForFirestore(initialFallbackConfig));
      onUpdate(initialFallbackConfig);
    } else {
      const data = docSnap.data() as SiteConfig;
      onUpdate(data);
    }
  }, (error) => {
    console.error('Error listening to siteConfig snapshot:', error);
  });
}

// Save SiteConfig
export async function saveSiteConfigToFirestore(config: SiteConfig) {
  try {
    const docRef = doc(db, SITE_DATA_COLLECTION, CONFIG_DOC);
    const cleanConfig = sanitizeForFirestore(config);
    await setDoc(docRef, cleanConfig);
  } catch (err) {
    console.error('Failed to save siteConfig to Firestore:', err);
  }
}

// Subscribe to Prediction Bets
export function subscribeToBets(
  onUpdate: (bets: MatchPredictionBet[]) => void
) {
  const docRef = doc(db, SITE_DATA_COLLECTION, BETS_DOC);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate(data.bets || []);
    } else {
      onUpdate([]);
    }
  }, (error) => {
    console.error('Error listening to bets snapshot:', error);
  });
}

export async function saveBetsToFirestore(bets: MatchPredictionBet[]) {
  try {
    const docRef = doc(db, SITE_DATA_COLLECTION, BETS_DOC);
    await setDoc(docRef, sanitizeForFirestore({ bets }));
  } catch (err) {
    console.error('Failed to save bets to Firestore:', err);
  }
}

// Collection for Per-User Isolated Wallets & Profiles (PENGGUNA)
export const PENGGUNA_COLLECTION = 'PENGGUNA';
export const USER_WALLETS_COLLECTION = 'PENGGUNA';

export function getUserWalletKey(userPhoneOrEmailOrId?: string): string {
  if (!userPhoneOrEmailOrId || userPhoneOrEmailOrId === 'guest') return 'guest_default';
  return userPhoneOrEmailOrId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export interface PenggunaDoc {
  nama_tim?: string;
  email?: string;
  saldo_tersedia: number;
  saldo_ditahan: number;
  riwayat_transaksi: WalletTransaction[];
  topUpHistory?: TopUpRequest[];
  withdrawalHistory?: WithdrawalRequest[];
  userKey?: string;
  updatedAt?: string;
}

// Subscribe to a specific User's Document in PENGGUNA collection
export function subscribeToUserWallet(
  userKey: string,
  onUpdate: (wallet: UserWallet) => void,
  initialWallet?: UserWallet
) {
  const cleanKey = getUserWalletKey(userKey);
  const docRef = doc(db, PENGGUNA_COLLECTION, cleanKey);
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      const defaultDoc: PenggunaDoc = {
        nama_tim: initialWallet?.topUpHistory?.[0]?.userName || '',
        email: cleanKey.includes('_') ? cleanKey : `${cleanKey}@hunters.community`,
        saldo_tersedia: 0, // OTOMATIS SALDO AWAL Rp0 (NOL)
        saldo_ditahan: 0,
        riwayat_transaksi: [],
        topUpHistory: [],
        withdrawalHistory: [],
        userKey: cleanKey,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, sanitizeForFirestore(defaultDoc));
      onUpdate({
        balance: 0,
        topUpHistory: [],
        withdrawalHistory: [],
        transactions: []
      });
    } else {
      const data = docSnap.data() as any;
      const saldoTersedia = typeof data.saldo_tersedia === 'number' ? data.saldo_tersedia : (typeof data.balance === 'number' ? data.balance : 0);
      const saldoDitahan = typeof data.saldo_ditahan === 'number' ? data.saldo_ditahan : 0;
      const riwayat = Array.isArray(data.riwayat_transaksi) ? data.riwayat_transaksi : (Array.isArray(data.transactions) ? data.transactions : []);

      const formatted: UserWallet = {
        balance: saldoTersedia,
        topUpHistory: data.topUpHistory || [],
        withdrawalHistory: data.withdrawalHistory || [],
        transactions: riwayat,
      };
      onUpdate(formatted);
    }
  }, (error) => {
    console.error(`Error listening to user PENGGUNA doc (${cleanKey}):`, error);
  });
}

// Save a specific User's Wallet & Transation Data to PENGGUNA Collection in Firestore
export async function saveUserWalletToFirestore(userKey: string, wallet: UserWallet, extraProfileData?: { nama_tim?: string; email?: string }) {
  try {
    const cleanKey = getUserWalletKey(userKey);
    const docRef = doc(db, PENGGUNA_COLLECTION, cleanKey);

    const payload: PenggunaDoc = {
      nama_tim: extraProfileData?.nama_tim || wallet.topUpHistory?.[0]?.userName || '',
      email: extraProfileData?.email || (cleanKey.includes('_') ? cleanKey : `${cleanKey}@hunters.community`),
      saldo_tersedia: typeof wallet.balance === 'number' ? wallet.balance : 0,
      saldo_ditahan: 0,
      riwayat_transaksi: wallet.transactions || [],
      topUpHistory: wallet.topUpHistory || [],
      withdrawalHistory: wallet.withdrawalHistory || [],
      userKey: cleanKey,
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, sanitizeForFirestore(payload), { merge: true });
  } catch (err) {
    console.error(`Failed to save user PENGGUNA doc (${userKey}):`, err);
  }
}

// Subscribe to ALL user documents in PENGGUNA (For Admin View)
export function subscribeToAllUserWallets(
  onUpdate: (walletsMap: Record<string, UserWallet>) => void
) {
  const colRef = collection(db, PENGGUNA_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const map: Record<string, UserWallet> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const saldoTersedia = typeof data.saldo_tersedia === 'number' ? data.saldo_tersedia : (typeof data.balance === 'number' ? data.balance : 0);
      const riwayat = Array.isArray(data.riwayat_transaksi) ? data.riwayat_transaksi : (Array.isArray(data.transactions) ? data.transactions : []);

      map[docSnap.id] = {
        balance: saldoTersedia,
        topUpHistory: data.topUpHistory || [],
        withdrawalHistory: data.withdrawalHistory || [],
        transactions: riwayat,
      };
    });
    onUpdate(map);
  }, (error) => {
    console.error('Error listening to all PENGGUNA docs snapshot:', error);
  });
}

// Backward-compatible fallback helpers
export function subscribeToWallets(
  onUpdate: (wallet: UserWallet) => void,
  initialWallet: UserWallet,
  userKey: string = 'guest_default'
) {
  return subscribeToUserWallet(userKey, onUpdate, initialWallet);
}

export async function saveWalletToFirestore(wallet: UserWallet, userKey: string = 'guest_default') {
  return saveUserWalletToFirestore(userKey, wallet);
}

// Collection for Notifications & Device Tokens
export const NOTIFICATIONS_COLLECTION = 'notifications';
export const REGISTERED_DEVICES_COLLECTION = 'registered_devices';

// Register or update device token in Firestore
export async function registerDeviceInFirestore(deviceData: {
  deviceId: string;
  userPhone?: string;
  userName?: string;
  platform?: string;
  permissionGranted?: boolean;
  lastActive?: string;
}) {
  try {
    const docRef = doc(db, REGISTERED_DEVICES_COLLECTION, deviceData.deviceId);
    const payload = {
      deviceId: deviceData.deviceId || '',
      userPhone: deviceData.userPhone || '',
      userName: deviceData.userName || '',
      platform: deviceData.platform || 'Web Desktop App',
      permissionGranted: Boolean(deviceData.permissionGranted),
      lastActive: deviceData.lastActive || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, sanitizeForFirestore(payload), { merge: true });
  } catch (err) {
    console.error('Failed to register device token in Firestore:', err);
  }
}

// Subscribe to Realtime Notifications from Firestore
export function subscribeToNotifications(
  onUpdate: (notifications: AppNotification[]) => void
) {
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const notifs: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      notifs.push(docSnap.data() as AppNotification);
    });
    // Sort descending by createdAt
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(notifs);
  }, (error) => {
    console.error('Error listening to notifications snapshot:', error);
  });
}

// Send a single notification to Firestore
export async function sendNotificationToFirestore(notification: AppNotification) {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
    await setDoc(docRef, sanitizeForFirestore(notification));
  } catch (err) {
    console.error('Failed to send notification to Firestore:', err);
  }
}

// Mark notification read
export async function markNotificationReadInFirestore(notificationId: string, currentReadBy: string[], readerId: string) {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    const updatedReadBy = Array.from(new Set([...currentReadBy, readerId]));
    await setDoc(docRef, sanitizeForFirestore({ readBy: updatedReadBy }), { merge: true });
  } catch (err) {
    console.error('Failed to mark notification read in Firestore:', err);
  }
}

// ============================================================================
// RESET / KOSONGKAN SEMUA DATA DATABASE (MURNI DATA BARU)
// ============================================================================
export async function resetAllFirestoreData(cleanConfig: SiteConfig): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Delete all teams
    const teamsSnap = await getDocs(collection(db, TEAMS_COLLECTION));
    for (const teamDoc of teamsSnap.docs) {
      await deleteDoc(doc(db, TEAMS_COLLECTION, teamDoc.id));
    }

    // 2. Delete all notifications
    const notifsSnap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
    for (const notifDoc of notifsSnap.docs) {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notifDoc.id));
    }

    // 3. Delete all registered devices
    const devicesSnap = await getDocs(collection(db, REGISTERED_DEVICES_COLLECTION));
    for (const deviceDoc of devicesSnap.docs) {
      await deleteDoc(doc(db, REGISTERED_DEVICES_COLLECTION, deviceDoc.id));
    }

    // 4. Delete all PENGGUNA (user wallets & transactions)
    const penggunaSnap = await getDocs(collection(db, PENGGUNA_COLLECTION));
    for (const pDoc of penggunaSnap.docs) {
      await deleteDoc(doc(db, PENGGUNA_COLLECTION, pDoc.id));
    }

    // 5. Reset bets document to empty array
    const betsRef = doc(db, SITE_DATA_COLLECTION, BETS_DOC);
    await setDoc(betsRef, { bets: [] });

    // 6. Reset config document to clean initial state
    const configRef = doc(db, SITE_DATA_COLLECTION, CONFIG_DOC);
    await setDoc(configRef, sanitizeForFirestore(cleanConfig));

    return {
      success: true,
      message: 'Semua data di database berhasil dikosongkan! Sistem murni data baru tanpa data lama.'
    };
  } catch (err: any) {
    console.error('Failed to reset all Firestore data:', err);
    return {
      success: false,
      message: `Gagal mereset database: ${err?.message || 'Unknown error'}`
    };
  }
}
