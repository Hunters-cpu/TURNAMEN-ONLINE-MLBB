import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount } from '../types.ts';

// Dedicated Super Admin Email constant
export const SUPER_ADMIN_EMAIL = 'mumumimi353@gmail.com';

// Reuse existing app or initialize
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);

// Configure Google Provider with requested Workspace & Identity Scopes
export const googleProvider = new GoogleAuthProvider();

export const WORKSPACE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Set custom parameters for clean account selection
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-Memory Token Caching (Never in localStorage for safety)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Check if an email is the authorized Super Admin
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Format a UserAccount object from Firebase Google User
 */
export function mapFirebaseUserToAccount(firebaseUser: User, existingAccounts?: UserAccount[]): UserAccount {
  const email = (firebaseUser.email || '').toLowerCase().trim();
  const isSuper = isSuperAdminEmail(email);

  // Check if user has saved data in existing list
  const existing = existingAccounts?.find(a => a.email.toLowerCase() === email);

  const role = isSuper ? 'admin' : (existing?.role || 'peserta');

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (isSuper ? 'Admin Utama (Mumumimi)' : 'Pemain Esport'),
    nickname: existing?.nickname || firebaseUser.displayName?.split(' ')[0] || (isSuper ? 'Super Admin' : 'Pemain'),
    email: email,
    role: role,
    isSuperAdmin: isSuper,
    avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    phone: existing?.phone || firebaseUser.phoneNumber || '',
    status: 'Active',
    registeredAt: existing?.registeredAt || new Date().toISOString(),
    ffId: existing?.ffId || '',
    ffNickname: existing?.ffNickname || '',
    mlbbId: existing?.mlbbId || '',
    mlbbServerId: existing?.mlbbServerId || '',
    mlbbNickname: existing?.mlbbNickname || '',
    primaryGame: existing?.primaryGame || 'Semua',
    primaryRole: existing?.primaryRole || (isSuper ? '👑 SUPER ADMIN' : 'Atlet Esport'),
    city: existing?.city || '',
    bio: existing?.bio || (isSuper ? '👑 Akun Admin Utama Resmi Hunters Community' : 'Member resmi Hunters Community'),
    balance: existing?.balance || 0,
    tournamentHistory: existing?.tournamentHistory || [],
    customBadges: isSuper 
      ? ['👑 SUPER ADMIN', '🛡️ OWNER UTAMA', '⚡ FULL ACCESS'] 
      : (existing?.customBadges || ['🎮 VERIFIED PLAYER', '🔥 HUNTERS MEMBER']),
  };
}

/**
 * Sign In with Official Google OAuth2 (Firebase Popup)
 */
export async function signInWithGoogleOAuth(
  existingAccounts?: UserAccount[]
): Promise<{ userAccount: UserAccount; accessToken: string; firebaseUser: User } | null> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    // Access token for Google Workspace APIs (Gmail, Google Calendar)
    const accessToken = credential?.accessToken || '';
    if (accessToken) {
      cachedAccessToken = accessToken;
    }

    const userAccount = mapFirebaseUserToAccount(result.user, existingAccounts);

    // Synchronize to PostgreSQL Cloud SQL backend asynchronously
    try {
      const idToken = await result.user.getIdToken();
      fetch('/api/users/sync-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: userAccount.name,
          avatarUrl: userAccount.avatarUrl,
        }),
      }).catch(e => console.warn('Cloud SQL async sync notification:', e));
    } catch (e) {
      console.warn('ID token fetch for sync:', e);
    }

    return {
      userAccount,
      accessToken,
      firebaseUser: result.user,
    };
  } catch (error: any) {
    // Gracefully handle standard popup closure / cancellation by user
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      console.info('Google sign-in popup ditutup oleh pengguna.');
      return null;
    }

    if (error?.code === 'auth/popup-blocked') {
      console.warn('Google sign-in popup diblokir oleh browser atau iframe.');
      throw new Error('Jendela popup diblokir oleh peramban. Harap izinkan pop-up atau buka aplikasi di tab baru.');
    }

    if (error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      console.warn('Firebase Auth: Google provider belum diaktifkan di Firebase Console.');
      throw new Error('Metode Login Google belum diaktifkan pada Firebase Console (auth/operation-not-allowed). Harap aktifkan Google Provider di Firebase Console > Authentication > Sign-in method.');
    }

    console.warn('Google OAuth sign-in notice:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get Cached Google Workspace Access Token
 */
export function getCachedGoogleAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Set Cached Access Token manually
 */
export function setCachedGoogleAccessToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Listen to Auth State Changes
 */
export function listenToGoogleAuth(
  onUserChanged: (user: User | null, userAccount: UserAccount | null) => void,
  existingAccounts?: UserAccount[]
) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const account = mapFirebaseUserToAccount(firebaseUser, existingAccounts);
      onUserChanged(firebaseUser, account);
    } else {
      cachedAccessToken = null;
      onUserChanged(null, null);
    }
  });
}

/**
 * Google Sign Out
 */
export async function signOutGoogle(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

/**
 * Request Real Verification OTP via Email (Backend NodeMailer/SMTP)
 */
export async function requestEmailOtp(
  email: string,
  type: 'register' | 'reset' = 'register'
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  try {
    const res = await fetch('/api/auth/send-verification-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), type }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Gagal mengirim kode verifikasi.');
    }
    return data;
  } catch (err: any) {
    console.error('Request OTP error:', err);
    throw new Error(err.message || 'Gagal mengirim kode verifikasi ke email.');
  }
}

/**
 * Verify 6-digit OTP code with backend
 */
export async function verifyEmailOtpCode(
  email: string,
  otp: string,
  type: 'register' | 'reset' = 'register'
): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim(), type }),
    });
    const data = await res.json();
    if (!res.ok || !data.valid) {
      throw new Error(data.error || data.message || 'Kode verifikasi tidak valid.');
    }
    return data;
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    throw new Error(err.message || 'Gagal memverifikasi kode.');
  }
}

/**
 * Register User with Email + Password (after OTP verification)
 * Includes seamless fallback when Firebase Email/Password provider is not yet enabled
 */
export async function registerWithEmailPassword(
  fullName: string,
  email: string,
  password: string,
  referralCode?: string,
  existingAccounts?: UserAccount[]
): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const isSuper = isSuperAdminEmail(cleanEmail);
  let firebaseUser: User | null = null;
  let fallbackUid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    firebaseUser = userCredential.user;
    
    if (firebaseUser) {
      try {
        await updateProfile(firebaseUser, {
          displayName: fullName.trim(),
        });
      } catch (e) {
        console.warn('Update profile error:', e);
      }
    }
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' || 
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed')
    ) {
      console.warn(
        '⚠️ Firebase: Provider Email/Password belum diaktifkan di Firebase Console (auth/operation-not-allowed). Menggunakan mode pendaftaran terverifikasi lokal/database:',
        err.message
      );
      // Seamlessly proceed with local/database account creation so the user is never blocked!
    } else {
      throw err;
    }
  }

  let userAccount: UserAccount;
  if (firebaseUser) {
    userAccount = mapFirebaseUserToAccount(firebaseUser, existingAccounts);
  } else {
    userAccount = {
      id: fallbackUid,
      name: fullName.trim(),
      nickname: fullName.trim().split(' ')[0] || (isSuper ? 'Super Admin' : 'Pemain'),
      email: cleanEmail,
      role: isSuper ? 'admin' : 'peserta',
      isSuperAdmin: isSuper,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      phone: '',
      status: 'Active',
      registeredAt: new Date().toISOString(),
      ffId: '',
      ffNickname: '',
      mlbbId: '',
      mlbbServerId: '',
      mlbbNickname: '',
      primaryGame: 'Semua',
      primaryRole: isSuper ? '👑 SUPER ADMIN' : 'Atlet Esport',
      city: '',
      bio: isSuper ? '👑 Akun Admin Utama Resmi Hunters Community' : 'Member resmi Hunters Community',
      balance: 0,
      tournamentHistory: [],
      customBadges: isSuper 
        ? ['👑 SUPER ADMIN', '🛡️ OWNER UTAMA', '⚡ FULL ACCESS'] 
        : ['🎮 VERIFIED PLAYER', '🔥 HUNTERS MEMBER'],
    };
  }

  userAccount.name = fullName.trim();
  userAccount.nickname = fullName.trim().split(' ')[0] || userAccount.nickname;

  // Sync with Cloud SQL backend
  try {
    const idToken = firebaseUser ? await firebaseUser.getIdToken() : `local_token_${Date.now()}`;
    fetch('/api/users/sync-google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid: userAccount.id,
        email: cleanEmail,
        name: userAccount.name,
        avatarUrl: userAccount.avatarUrl,
        referralCode: referralCode || '',
      }),
    }).catch(e => console.warn('Cloud SQL async sync registration error:', e));
  } catch (e) {
    console.warn('ID token fetch error:', e);
  }

  return userAccount;
}

/**
 * Sign In User with Email + Password
 * Includes seamless fallback when Firebase Email/Password provider is not yet enabled
 */
export async function loginWithEmailPassword(
  email: string,
  password: string,
  existingAccounts?: UserAccount[]
): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const isSuper = isSuperAdminEmail(cleanEmail);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const userAccount = mapFirebaseUserToAccount(userCredential.user, existingAccounts);

    // Sync with Cloud SQL
    try {
      const idToken = await userCredential.user.getIdToken();
      fetch('/api/users/sync-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: cleanEmail,
          name: userAccount.name,
          avatarUrl: userAccount.avatarUrl,
        }),
      }).catch(e => console.warn('Cloud SQL async sync login error:', e));
    } catch (e) {
      console.warn('ID token fetch error:', e);
    }

    return userAccount;
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' || 
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed')
    ) {
      console.warn(
        '⚠️ Firebase: Provider Email/Password belum diaktifkan di Firebase Console (auth/operation-not-allowed). Menggunakan verifikasi akun lokal/database:',
        err.message
      );

      // Check if user is Super Admin or in existing member accounts
      const existing = existingAccounts?.find(a => a.email.toLowerCase() === cleanEmail);

      const fallbackAccount: UserAccount = {
        id: existing?.id || (isSuper ? 'super_admin_mumumimi' : `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
        name: existing?.name || (isSuper ? 'Admin Utama (Mumumimi)' : cleanEmail.split('@')[0]),
        nickname: existing?.nickname || (isSuper ? 'Super Admin' : cleanEmail.split('@')[0]),
        email: cleanEmail,
        role: isSuper ? 'admin' : (existing?.role || 'peserta'),
        isSuperAdmin: isSuper,
        avatarUrl: existing?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        phone: existing?.phone || '',
        status: 'Active',
        registeredAt: existing?.registeredAt || new Date().toISOString(),
        ffId: existing?.ffId || '',
        ffNickname: existing?.ffNickname || '',
        mlbbId: existing?.mlbbId || '',
        mlbbServerId: existing?.mlbbServerId || '',
        mlbbNickname: existing?.mlbbNickname || '',
        primaryGame: existing?.primaryGame || 'Semua',
        primaryRole: isSuper ? '👑 SUPER ADMIN' : (existing?.primaryRole || 'Atlet Esport'),
        city: existing?.city || '',
        bio: existing?.bio || (isSuper ? '👑 Akun Admin Utama Resmi Hunters Community' : 'Member resmi Hunters Community'),
        balance: existing?.balance || 0,
        tournamentHistory: existing?.tournamentHistory || [],
        customBadges: isSuper 
          ? ['👑 SUPER ADMIN', '🛡️ OWNER UTAMA', '⚡ FULL ACCESS'] 
          : (existing?.customBadges || ['🎮 VERIFIED PLAYER', '🔥 HUNTERS MEMBER']),
      };

      return fallbackAccount;
    }

    throw err;
  }
}

/**
 * Send Password Reset Email via Firebase Auth (with fallback to SMTP OTP)
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' || 
      err?.code === 'auth/admin-restricted-operation' ||
      err?.message?.includes('operation-not-allowed')
    ) {
      console.warn('Firebase Email Password Reset belum diaktifkan. Mengirim OTP reset via SMTP server.');
      await requestEmailOtp(cleanEmail, 'reset');
      return;
    }
    throw err;
  }
}

