import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Save, 
  AlertTriangle, 
  Key, 
  EyeOff, 
  Timer, 
  ShieldAlert, 
  CheckCircle2, 
  Server,
  UserX,
  FileCheck
} from 'lucide-react';
import { SiteConfig, SecuritySettingsConfig, AdminAccount } from '../../types';
import { INITIAL_SECURITY_SETTINGS_CONFIG } from '../../data/initialData';

interface AdminSecuritySettingsManagerProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  handleSaveAllConfig: (newConfig: SiteConfig, message?: string) => void;
  currentUser?: AdminAccount | null;
}

export const AdminSecuritySettingsManager: React.FC<AdminSecuritySettingsManagerProps> = ({
  config,
  setConfig,
  handleSaveAllConfig,
  currentUser
}) => {
  const currentSec = config.securitySettings || INITIAL_SECURITY_SETTINGS_CONFIG;

  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(currentSec.autoLogoutMinutes || 30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(currentSec.maxLoginAttempts || 5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(currentSec.lockoutDurationMinutes || 15);
  const [requireEmailVerification, setRequireEmailVerification] = useState(currentSec.requireEmailVerification ?? false);
  const [maskPhoneNumbersInPublic, setMaskPhoneNumbersInPublic] = useState(currentSec.maskPhoneNumbersInPublic ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(currentSec.maintenanceMode ?? false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    currentSec.maintenanceMessage || 'Website HUNTERS COMMUNITY sedang dalam pemeliharaan sistem rutin. Silakan kembali beberapa saat lagi!'
  );
  const [enableAuditLogging, setEnableAuditLogging] = useState(currentSec.enableAuditLogging ?? true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const updatedSec: SecuritySettingsConfig = {
      autoLogoutMinutes,
      maxLoginAttempts,
      lockoutDurationMinutes,
      requireEmailVerification,
      maskPhoneNumbersInPublic,
      maintenanceMode,
      maintenanceMessage,
      enableAuditLogging,
      allowedAdminIps: currentSec.allowedAdminIps || []
    };

    const newConfig: SiteConfig = {
      ...config,
      securitySettings: updatedSec
    };

    setConfig(newConfig);
    handleSaveAllConfig(newConfig, 'Memperbarui Pengaturan Keamanan & Privasi Sistem');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER CARD */}
      <div className="bg-[#0f0f0f] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                KATEGORI 7 — MENU 4
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                Khusus Admin Utama 🔒
              </span>
            </div>
            <h3 className="font-black text-lg text-white uppercase flex items-center gap-2 mt-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>🔐 Pengaturan Keamanan &amp; Privasi Panel Admin</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Konfigurasi auto-logout inaktivitas, pembatasan percobaan login salah 5x, sensor nomor WhatsApp di tabel publik, mode pemeliharaan, dan enkripsi Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Firestore Rules Active</span>
            </span>
          </div>
        </div>

        {/* 4 CORE SECURITY BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. AUTO LOGOUT & TIMEOUT */}
          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <label className="text-xs font-black text-cyan-400 uppercase flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              <span>1. Auto-Logout Saat Inaktif:</span>
            </label>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Otomatis mengeluarkan sesi Admin jika tidak ada aktivitas mouse / klik dalam durasi yang ditentukan demi keamanan.
            </p>
            <select
              value={autoLogoutMinutes}
              onChange={(e) => setAutoLogoutMinutes(Number(e.target.value))}
              className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value={15}>⏱️ 15 Menit (Sangat Ketat)</option>
              <option value={30}>⏱️ 30 Menit (Direkomendasikan)</option>
              <option value={60}>⏱️ 1 Jam (Standar)</option>
              <option value={120}>⏱️ 2 Jam (Santai)</option>
              <option value={0}>♾️ Nonaktifkan Auto-Logout</option>
            </select>
          </div>

          {/* 2. LOGIN ATTEMPTS LIMIT */}
          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <label className="text-xs font-black text-amber-400 uppercase flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>2. Batasi Percobaan Login Salah:</span>
            </label>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Mencegah serangan brute-force dengan mengunci IP / akun selama periode tertentu jika salah memasukkan kata sandi.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">Maksimal Salah:</span>
                <select
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value={3}>3 Kali Percobaan</option>
                  <option value={5}>5 Kali Percobaan</option>
                  <option value={10}>10 Kali Percobaan</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">Durasi Kunci (Lockout):</span>
                <select
                  value={lockoutDurationMinutes}
                  onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value={15}>15 Menit</option>
                  <option value={30}>30 Menit</option>
                  <option value={60}>60 Menit</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. MASKING PHONE NUMBERS */}
          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <label className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span>3. Sensor Nomor WhatsApp Pengguna (Privasi):</span>
            </label>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Menyamarkan nomor WhatsApp pendaftar pada halaman publik (misal: 0831****4663) agar terhindar dari spammer &amp; pihak ketiga.
            </p>
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f0f0f] border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={maskPhoneNumbersInPublic}
                onChange={(e) => setMaskPhoneNumbersInPublic(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-800 text-emerald-500 focus:ring-emerald-500 bg-neutral-900"
              />
              <span className="text-xs font-bold text-white">
                {maskPhoneNumbersInPublic ? '✅ Sensor Nomor HP Aktif (Aman)' : '⚪ Tampilkan Nomor Lengkap'}
              </span>
            </label>
          </div>

          {/* 4. AUDIT LOGGING */}
          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <label className="text-xs font-black text-purple-400 uppercase flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>4. Log Aktivitas &amp; Audit Permanen:</span>
            </label>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Mencatat setiap tindakan admin (ubah skor, hapus tim, konfirmasi saldo) secara permanen ke collection audit Firestore.
            </p>
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f0f0f] border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAuditLogging}
                onChange={(e) => setEnableAuditLogging(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-800 text-purple-500 focus:ring-purple-500 bg-neutral-900"
              />
              <span className="text-xs font-bold text-white">
                {enableAuditLogging ? '✅ Audit Logging Aktif (Direkomendasikan)' : '⚪ Audit Logging Nonaktif'}
              </span>
            </label>
          </div>
        </div>

        {/* MAINTENANCE MODE TOGGLE */}
        <div className="p-5 bg-red-950/20 border-2 border-red-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Mode Pemeliharaan Website (Maintenance Mode)</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded border-red-800 text-red-600 focus:ring-red-500 bg-neutral-900"
              />
              <span className="text-xs font-black text-red-400 uppercase">
                {maintenanceMode ? '🔴 MAINTENANCE AKTIF' : '⚪ WEBSITE NORMAL'}
              </span>
            </label>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Jika diaktifkan, pengunjung umum akan melihat layar pemeliharaan sementara Panel Admin tetap dapat diakses oleh Super Admin.
          </p>

          {maintenanceMode && (
            <textarea
              rows={2}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Tuliskan pesan pemeliharaan..."
              className="w-full bg-[#050505] border border-red-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          )}
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-2">
          {saveSuccess && (
            <div className="mb-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✅ Pengaturan Keamanan &amp; Privasi berhasil disimpan dan diterapkan ke sistem!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>💾 SIMPAN PENGATURAN KEAMANAN &amp; PRIVASI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
