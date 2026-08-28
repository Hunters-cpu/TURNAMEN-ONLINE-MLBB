import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  Mail, 
  User, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Crown, 
  Lock, 
  Eye, 
  EyeOff, 
  Send, 
  KeyRound, 
  UserPlus, 
  ArrowRight, 
  Shield, 
  HelpCircle, 
  Clock, 
  Gift
} from 'lucide-react';
import { TabType, UserAccount, SiteConfig } from '../../types';
import { 
  signInWithGoogleOAuth, 
  signOutGoogle, 
  SUPER_ADMIN_EMAIL, 
  isSuperAdminEmail, 
  requestEmailOtp, 
  verifyEmailOtpCode, 
  registerWithEmailPassword, 
  loginWithEmailPassword, 
  sendPasswordReset 
} from '../../lib/googleAuth';

interface LoginViewProps {
  currentUser: UserAccount | null;
  onLogin: (account: UserAccount) => void;
  onLogout: () => void;
  setActiveTab: (tab: TabType) => void;
  siteConfig?: SiteConfig;
}

export const LoginView: React.FC<LoginViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  setActiveTab,
  siteConfig
}) => {
  // Method & Mode state
  const [activeMode, setActiveMode] = useState<'masuk' | 'daftar'>('masuk');
  
  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // OTP Countdown & Status
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Handle Official Google OAuth2 Sign In
  const handleGoogleOAuthLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result = await signInWithGoogleOAuth(siteConfig?.memberAccounts);
      if (!result) {
        setIsLoading(false);
        return;
      }

      const { userAccount } = result;
      onLogin(userAccount);
      localStorage.setItem('hunters_community_user', JSON.stringify(userAccount));

      if (userAccount.isSuperAdmin || isSuperAdminEmail(userAccount.email)) {
        setSuccessMessage(
          `👑 SELAMAT DATANG ADMIN UTAMA! Akun ${userAccount.email} otomatis diverifikasi dengan hak akses penuh sistem.`
        );
        setTimeout(() => {
          setActiveTab('admin');
        }, 1500);
      } else {
        setSuccessMessage(
          `✅ Selamat datang, ${userAccount.name}! Akun pemain Anda berhasil terhubung via Google OAuth2.`
        );
        setTimeout(() => {
          setActiveTab('beranda');
        }, 1500);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Jendela pop-up login diblokir oleh peramban. Silakan izinkan pop-up atau buka aplikasi di tab browser baru.');
      } else if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setErrorMessage('⚠️ Provider Google OAuth belum diaktifkan di Firebase Console (auth/operation-not-allowed). Harap aktifkan Google Sign-in di Firebase Console > Authentication > Sign-in method.');
      } else {
        setErrorMessage(err.message || 'Gagal menghubungkan akun Google. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sending Real Email OTP
  const handleSendVerificationOtp = async () => {
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Harap masukkan alamat email aktif yang valid terlebih dahulu.');
      return;
    }

    try {
      setIsSendingOtp(true);
      setErrorMessage(null);
      setOtpNotice(null);

      const result = await requestEmailOtp(cleanEmail, 'register');
      setOtpSentSuccess(true);
      setOtpCountdown(60); // 60s cooldown
      setOtpNotice(
        `Kode verifikasi 6 digit telah dikirim ke ${cleanEmail}. Cek Kotak Masuk, Spam, atau Promosi. Berlaku 15 menit.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || '❌ Gagal mengirim. Cek koneksi atau coba lagi.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Email + Password Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Nama Lengkap wajib diisi.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Alamat email aktif wajib diisi.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Kata sandi harus minimal 8 karakter (kombinasi huruf & angka).');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Harap ketik ulang dengan sama persis.');
      return;
    }
    if (!regOtp || regOtp.trim().length !== 6) {
      setErrorMessage('Harap masukkan kode verifikasi 6 digit yang telah dikirim ke email Anda.');
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Verify OTP with backend
      await verifyEmailOtpCode(cleanEmail, regOtp.trim(), 'register');

      // Step 2: Register with Firebase Auth
      const userAccount = await registerWithEmailPassword(
        cleanName,
        cleanEmail,
        regPassword,
        regReferral.trim(),
        siteConfig?.memberAccounts
      );

      onLogin(userAccount);
      localStorage.setItem('hunters_community_user', JSON.stringify(userAccount));

      if (userAccount.isSuperAdmin || isSuperAdminEmail(cleanEmail)) {
        setSuccessMessage(
          `👑 SELAMAT DATANG ADMIN UTAMA! Pendaftaran akun ${cleanEmail} berhasil dan hak akses Admin Utama langsung diaktifkan.`
        );
        setTimeout(() => {
          setActiveTab('admin');
        }, 1500);
      } else {
        setSuccessMessage(
          `✅ Pendaftaran berhasil! Selamat datang, ${userAccount.name}. Akun kamu telah aktif & terverifikasi.`
        );
        setTimeout(() => {
          setActiveTab('beranda');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMessage('Alamat email ini sudah terdaftar sebelumnya. Silakan beralih ke tab "Masuk Akun".');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMessage('Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi angka.');
      } else if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setErrorMessage('⚠️ Pendaftaran Firebase Email/Password belum diaktifkan di Firebase Console (auth/operation-not-allowed). Sistem otomatis mengaktifkan mode fallback login atau silakan gunakan tombol "Hubungkan Akun Google".');
      } else {
        setErrorMessage(err.message || 'Gagal menyelesaikan pendaftaran akun.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email + Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Harap masukkan alamat email Anda.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Harap masukkan kata sandi akun.');
      return;
    }

    try {
      setIsLoading(true);
      const userAccount = await loginWithEmailPassword(
        cleanEmail,
        loginPassword,
        siteConfig?.memberAccounts
      );

      onLogin(userAccount);
      if (rememberMe) {
        localStorage.setItem('hunters_community_user', JSON.stringify(userAccount));
      } else {
        sessionStorage.setItem('hunters_community_user', JSON.stringify(userAccount));
      }

      if (userAccount.isSuperAdmin || isSuperAdminEmail(cleanEmail)) {
        setSuccessMessage(
          `👑 SELAMAT DATANG ADMIN UTAMA! Login akun ${cleanEmail} berhasil dengan izin penuh sistem.`
        );
        setTimeout(() => {
          setActiveTab('admin');
        }, 1500);
      } else {
        setSuccessMessage(`✅ Berhasil masuk! Selamat datang kembali, ${userAccount.name}.`);
        setTimeout(() => {
          setActiveTab('beranda');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        setErrorMessage('Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      } else if (err?.code === 'auth/wrong-password') {
        setErrorMessage('Kata sandi salah. Gunakan tautan "Lupa Kata Sandi?" jika Anda lupa kata sandi.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan gagal. Akses diblokir sementara demi keamanan. Coba lagi beberapa saat lagi.');
      } else if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setErrorMessage('⚠️ Metode masuk ini belum diaktifkan di Firebase Console (auth/operation-not-allowed). Sistem otomatis mengaktifkan mode fallback login atau silakan gunakan Google OAuth2.');
      } else {
        setErrorMessage(err.message || 'Gagal masuk akun. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotStatus('Harap masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsSendingForgot(true);
      setForgotStatus(null);
      await sendPasswordReset(cleanEmail);
      setForgotStatus(`✅ Tautan / kode OTP reset kata sandi telah dikirim ke ${cleanEmail}. Periksa Kotak Masuk atau Spam Anda.`);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setForgotStatus(`✅ Kode OTP reset kata sandi telah dikirim ke ${cleanEmail} via server SMTP.`);
      } else {
        setForgotStatus(`❌ Gagal: ${err.message || 'Email tidak ditemukan atau terjadi kesalahan.'}`);
      }
    } finally {
      setIsSendingForgot(false);
    }
  };

  // Handle Logout
  const handleLogoutConfirm = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      try {
        await signOutGoogle();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
      localStorage.removeItem('hunters_community_user');
      sessionStorage.removeItem('hunters_community_user');
      onLogout();
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  const isCurrentSuperAdmin = currentUser && (currentUser.isSuperAdmin || isSuperAdminEmail(currentUser.email));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* HEADER BANNER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Autentikasi Ganda Resmi</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
          Pusat Akun & Akses Sistem
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 max-w-2xl mx-auto">
          Pilih metode masuk yang Anda inginkan: masuk instan dengan <b>Google OAuth2</b> atau daftar dengan <b>Email & Kata Sandi</b> dengan verifikasi kode OTP nyata ke kotak masuk Anda.
        </p>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs md:text-sm flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs md:text-sm flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 1: USER IS ALREADY LOGGED IN                       */}
      {/* ======================================================== */}
      {currentUser ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {isCurrentSuperAdmin && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          )}

          {/* User Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`}
                alt={currentUser.name}
                className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-xl ${
                  isCurrentSuperAdmin ? 'border-amber-500 shadow-amber-500/20' : 'border-neutral-700'
                }`}
                referrerPolicy="no-referrer"
              />
              {isCurrentSuperAdmin && (
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-black shadow-lg">
                  <Crown className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white">
                  {currentUser.name}
                </h2>
                {isCurrentSuperAdmin ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    ADMIN UTAMA (SUPER ADMIN)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                    🎮 PEMAIN / ANGGOTA RESMI
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{currentUser.email}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Status: Terverifikasi Aktif
                </span>
                {currentUser.balance !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-amber-400 text-[10px] font-bold border border-neutral-700">
                    Saldo: Rp {(currentUser.balance || 0).toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Super Admin Notice if applicable */}
          {isCurrentSuperAdmin && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Hak Akses Penuh Admin Utama Aktif</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Akun ini terdeteksi otomatis sebagai <b>Admin Utama</b> untuk email <code>{SUPER_ADMIN_EMAIL}</code>. Anda memiliki akses penuh tak terbatas untuk mengelola turnamen, persetujuan tim, transaksi saldo, audit log, serta integrasi Google Workspace.
              </p>
            </div>
          )}

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {isCurrentSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-amber-500/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4" />
                  <span>Buka Panel Admin</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Profil & Game ID</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('semua-turnamen')}
              className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Daftar Turnamen</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={handleLogoutConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* STATE 2: NOT LOGGED IN - 2 METHODS ARCHITECTURE          */
        /* ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT / MAIN COLUMN: AUTHENTICATION INTERFACE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* -------------------------------------------------------- */}
            {/* 🔐 CARA 1: GOOGLE OAUTH2 (TANPA SANDI DI WEBSITE)        */}
            {/* -------------------------------------------------------- */}
            <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-6 md:p-7 shadow-2xl space-y-5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Cara 1: Login via Google OAuth2</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Rekomendasi Instan
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Masuk aman langsung di akun resmi Google tanpa perlu kata sandi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Google OAuth2 Button */}
              <div>
                <button
                  type="button"
                  id="btn-google-oauth-login-main"
                  onClick={handleGoogleOAuthLogin}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm md:text-base flex items-center justify-center gap-3.5 shadow-xl hover:shadow-2xl cursor-pointer transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-300"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="tracking-wide">
                    {isLoading ? 'Menghubungkan ke Google...' : '🔗 Hubungkan Akun Google'}
                  </span>
                </button>
              </div>

              {/* Security Mandate Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">
                  ⚠️ <b>Keamanan Terjamin:</b> Kata sandi Anda <b>TIDAK pernah diketahui</b> oleh website ini. Semua proses login dan otorisasi dilakukan di halaman resmi Google (accounts.google.com).
                </span>
              </div>
            </div>

            {/* SEPARATOR DIVIDER */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-800 w-full" />
              <span className="bg-neutral-950 px-4 text-xs font-black uppercase tracking-wider text-neutral-500 shrink-0">
                ATAU MASUK DENGAN EMAIL & SANDI
              </span>
              <div className="border-t border-neutral-800 w-full" />
            </div>

            {/* -------------------------------------------------------- */}
            {/* 📧 CARA 2: EMAIL + KATA SANDI + VERIFIKASI EMAIL NYATA  */}
            {/* -------------------------------------------------------- */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Cara 2: Email & Kata Sandi
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Gunakan alamat email pribadi dengan verifikasi OTP 6 digit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Masuk vs Daftar Baru */}
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <button
                  type="button"
                  id="tab-btn-masuk-email"
                  onClick={() => {
                    setActiveMode('masuk');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeMode === 'masuk'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-daftar-email"
                  onClick={() => {
                    setActiveMode('daftar');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeMode === 'daftar'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Baru + Verifikasi</span>
                </button>
              </div>

              {/* ======================================================== */}
              {/* SUB-FORM A: MASUK AKUN TERDAFTAR                         */}
              {/* ======================================================== */}
              {activeMode === 'masuk' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Alamat Email</span>
                    </label>
                    <input
                      type="email"
                      id="input-login-email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kata Sandi</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        id="input-login-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors"
                      />
                      <button
                        type="button"
                        id="btn-toggle-login-password"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        title={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="checkbox-remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    <label htmlFor="checkbox-remember-me" className="text-xs text-neutral-300 cursor-pointer select-none">
                      Ingat Saya di perangkat ini
                    </label>
                  </div>

                  {/* Submit Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-submit-login-email"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Memproses Masuk...' : 'Masuk Akun'}</span>
                    </button>
                  </div>

                  {/* Switch to Register link */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-neutral-400">
                      Belum punya akun?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveMode('daftar')}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Daftar di sini
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* ======================================================== */
                /* SUB-FORM B: DAFTAR BARU + VERIFIKASI EMAIL NYATA         */
                /* ======================================================== */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nama Lengkap <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="text"
                      id="input-reg-fullname"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Contoh: Rian Pratama"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Email & Send OTP Row */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Alamat Email Aktif <span className="text-rose-400">*</span></span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        id="input-reg-email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="email.aktif@gmail.com"
                        required
                        className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors"
                      />
                      <button
                        type="button"
                        id="btn-send-verification-otp"
                        onClick={handleSendVerificationOtp}
                        disabled={isSendingOtp || otpCountdown > 0 || !regEmail}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                          otpCountdown > 0
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
                            : otpSentSuccess
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSendingOtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>⏳ Sedang Mengirim...</span>
                          </>
                        ) : otpCountdown > 0 ? (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Kirim Ulang ({otpCountdown}s)</span>
                          </>
                        ) : otpSentSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✅ Terkirim</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>📤 Kirim Kode Verifikasi</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Notification after sending */}
                    {otpNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1 animate-fade-in">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{otpNotice}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400/90 pl-5">
                          💡 <b>Petunjuk:</b> Cek folder <i>Spam</i>, <i>Promosi</i>, atau <i>Sosial</i> jika tidak terlihat di Kotak Masuk utama.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 6 Digit OTP Verification Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kode Verifikasi Email (6 Digit) <span className="text-rose-400">*</span></span>
                      </span>
                      <span className="text-[11px] text-neutral-500">Salin dari email Anda</span>
                    </label>
                    <input
                      type="text"
                      id="input-reg-otp"
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 849201"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-amber-500/40 focus:border-amber-500 text-amber-300 placeholder-neutral-600 text-base md:text-lg font-mono tracking-widest text-center font-black outline-none transition-colors"
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Buat Kata Sandi <span className="text-rose-400">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          id="input-reg-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 8 karakter"
                          required
                          className="w-full px-4 py-3 pr-11 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors"
                        />
                        <button
                          type="button"
                          id="btn-toggle-reg-password"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          title={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Konfirmasi Kata Sandi <span className="text-rose-400">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          id="input-reg-confirm-password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Ketik ulang kata sandi"
                          required
                          className={`w-full px-4 py-3 pr-11 rounded-xl bg-neutral-950 border text-white placeholder-neutral-600 text-xs md:text-sm outline-none transition-colors ${
                            regConfirmPassword && regPassword !== regConfirmPassword
                              ? 'border-rose-500'
                              : regConfirmPassword && regPassword === regConfirmPassword
                              ? 'border-emerald-500'
                              : 'border-neutral-800 focus:border-amber-500'
                          }`}
                        />
                        <button
                          type="button"
                          id="btn-toggle-reg-confirm-password"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          aria-label={showRegConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          title={showRegConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kode Referral (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      id="input-reg-referral"
                      value={regReferral}
                      onChange={(e) => setRegReferral(e.target.value.toUpperCase())}
                      placeholder="Contoh: HUNTERS2026"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-xs font-mono uppercase outline-none transition-colors"
                    />
                  </div>

                  {/* Submit Register Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-submit-register"
                      disabled={
                        isLoading || 
                        !regFullName || 
                        !regEmail || 
                        regPassword.length < 8 || 
                        regPassword !== regConfirmPassword || 
                        regOtp.length !== 6
                      }
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Mendaftarkan Akun...' : '✅ Daftar'}</span>
                    </button>
                  </div>

                  {/* Switch back to login */}
                  <div className="text-center pt-1">
                    <p className="text-xs text-neutral-400">
                      Sudah punya akun?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveMode('masuk')}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Masuk di sini
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SECURITY & INFORMATION */}
          <div className="lg:col-span-4 space-y-4">
            {/* Email Verification Protocol Guarantee Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Verifikasi Email Nyata
              </h4>
              <ul className="space-y-2 text-[11px] text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Kode OTP dikirim langsung ke kotak masuk email Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Kode <b>TIDAK PERNAH</b> ditampilkan di halaman website.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Berlaku 15 menit. Maksimal 3 kali salah percobaan.</span>
                </li>
              </ul>
            </div>

            {/* Quick Support / Safety Notice */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 space-y-2 text-xs text-neutral-400">
              <div className="font-bold text-neutral-200 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Privasi & Keamanan Terjaga</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                Sistem menggunakan otentikasi terenkripsi SSL 256-bit dan otorisasi Google OAuth2 resmi untuk melindungi akun serta riwayat pendaftaran turnamen Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LUPA KATA SANDI                                   */}
      {/* ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Reset Kata Sandi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStatus(null);
                }}
                className="text-neutral-500 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Masukkan alamat email akun Anda. Kami akan mengirimkan tautan resmi untuk mengatur ulang kata sandi Anda.
            </p>

            {forgotStatus && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-medium">
                {forgotStatus}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Alamat Email Terdaftar</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white text-xs md:text-sm outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotStatus(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingForgot || !forgotEmail}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSendingForgot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Tautan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
