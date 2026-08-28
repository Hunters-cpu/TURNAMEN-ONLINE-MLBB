import React, { useState } from 'react';
import { 
  Clock, 
  Save, 
  Sun, 
  Moon, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  PhoneCall, 
  Calendar,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { SiteConfig, OperatingHoursConfig, AdminAccount } from '../../types';
import { INITIAL_OPERATING_HOURS_CONFIG } from '../../data/initialData';

interface AdminOperatingHoursManagerProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  handleSaveAllConfig: (newConfig: SiteConfig, message?: string) => void;
  currentUser?: AdminAccount | null;
}

export const AdminOperatingHoursManager: React.FC<AdminOperatingHoursManagerProps> = ({
  config,
  setConfig,
  handleSaveAllConfig,
  currentUser
}) => {
  const currentHours: OperatingHoursConfig = config.operatingHours || INITIAL_OPERATING_HOURS_CONFIG;

  const [openTime, setOpenTime] = useState(currentHours.openTime || '08:00');
  const [closeTime, setCloseTime] = useState(currentHours.closeTime || '22:00');
  const [timezone, setTimezone] = useState(currentHours.timezone || 'WIB');
  const [workDays, setWorkDays] = useState(currentHours.workDays || 'Setiap Hari (Senin – Minggu)');
  const [adminStatus, setAdminStatus] = useState<'ONLINE' | 'BUSY' | 'OFFLINE'>(currentHours.adminStatus || 'ONLINE');
  const [autoReplyOutOfHours, setAutoReplyOutOfHours] = useState(currentHours.autoReplyOutOfHours ?? true);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState(currentHours.outOfHoursMessage || '');
  const [holidayMode, setHolidayMode] = useState(currentHours.holidayMode ?? false);
  const [holidayMessage, setHolidayMessage] = useState(currentHours.holidayMessage || '');
  const [emergencyContactWa, setEmergencyContactWa] = useState(currentHours.emergencyContactWa || '6283148834663');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const updatedOperatingHours: OperatingHoursConfig = {
      openTime,
      closeTime,
      timezone,
      workDays,
      adminStatus,
      autoReplyOutOfHours,
      outOfHoursMessage,
      holidayMode,
      holidayMessage,
      emergencyContactWa
    };

    const newConfig: SiteConfig = {
      ...config,
      operatingHours: updatedOperatingHours
    };

    setConfig(newConfig);
    handleSaveAllConfig(newConfig, `Memperbarui Jam Operasional & Status Bantuan (${adminStatus})`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER CARD */}
      <div className="bg-[#0f0f0f] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                KATEGORI 6 — MENU 4
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                Realtime Synchronized
              </span>
            </div>
            <h3 className="font-black text-lg text-white uppercase flex items-center gap-2 mt-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>⏰ Jam Operasional &amp; Informasi Bantuan Panitia</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Atur jam kerja panitia turnamen (08.00–22.00 WIB), pesan balasan otomatis luar jam operasional, status kesiapan admin, dan kontak darurat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase flex items-center gap-2 ${
              adminStatus === 'ONLINE' 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' 
                : adminStatus === 'BUSY'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                : 'bg-red-950/80 text-red-300 border-red-500'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                adminStatus === 'ONLINE' ? 'bg-emerald-400 animate-ping' : adminStatus === 'BUSY' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
              }`} />
              <span>Status: {adminStatus}</span>
            </span>
          </div>
        </div>

        {/* STATUS SELECTOR PILLS */}
        <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3">
          <label className="text-xs font-bold text-neutral-300 uppercase block flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>1. Status Aktif Admin Saat Ini (Tampil di Widget Bantuan Pengguna):</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setAdminStatus('ONLINE')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                adminStatus === 'ONLINE'
                  ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-[1.01]'
                  : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
              <div className="text-left">
                <strong className="block text-xs font-black uppercase text-emerald-400">🟢 ONLINE (Siap Melayani)</strong>
                <span className="text-[10px] text-neutral-400">Admin siap melayani chat &amp; verifikasi cepat</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminStatus('BUSY')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                adminStatus === 'BUSY'
                  ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg shadow-amber-950/50 scale-[1.01]'
                  : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
              <div className="text-left">
                <strong className="block text-xs font-black uppercase text-amber-400">🟡 SIBUK (Sedang Match)</strong>
                <span className="text-[10px] text-neutral-400">Fokus memimpin room pertandingan turnamen</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminStatus('OFFLINE')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                adminStatus === 'OFFLINE'
                  ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950/50 scale-[1.01]'
                  : 'bg-[#0f0f0f] border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-md shadow-red-400/50" />
              <div className="text-left">
                <strong className="block text-xs font-black uppercase text-red-400">🔴 OFFLINE (Luar Jam Kerja)</strong>
                <span className="text-[10px] text-neutral-400">Pesan akan dibalas saat jam kerja berikutnya</span>
              </div>
            </button>
          </div>
        </div>

        {/* SETTING HOURS & TIMEZONE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase block flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>2. Jam Buka &amp; Tutup Layanan:</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold block mb-1">Jam Buka:</span>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono font-black focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 font-bold block mb-1">Jam Tutup:</span>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono font-black focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold block mb-1">Zona Waktu:</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="WIB">WIB (Waktu Indonesia Barat)</option>
                  <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
                  <option value="WIT">WIT (Waktu Indonesia Timur)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 font-bold block mb-1">Hari Kerja:</span>
                <input
                  type="text"
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                  placeholder="Setiap Hari (Senin – Minggu)"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3">
            <label className="text-xs font-bold text-neutral-300 uppercase block flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>3. Kontak Darurat WhatsApp Panitia:</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={emergencyContactWa}
                onChange={(e) => setEmergencyContactWa(e.target.value)}
                placeholder="6283148834663"
                className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-2.5 text-xs text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Nomor ini akan menjadi tujuan tombol "Hubungi Panitia Darurat" jika ada sengketa atau kendala match kritis.
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={holidayMode}
                  onChange={(e) => setHolidayMode(e.target.checked)}
                  className="rounded border-neutral-800 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-neutral-900"
                />
                <span className="text-xs font-black text-amber-400 uppercase">🏖️ Aktifkan Mode Libur Turnamen</span>
              </label>
              {holidayMode && (
                <input
                  type="text"
                  value={holidayMessage}
                  onChange={(e) => setHolidayMessage(e.target.value)}
                  placeholder="Pemberitahuan libur / off match..."
                  className="mt-2 w-full bg-[#0f0f0f] border border-amber-500/50 rounded-xl p-2 text-xs text-amber-300 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* AUTO REPLY OUT OF HOURS */}
        <div className="bg-[#050505] p-4 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>4. Pesan Otomatis Luar Jam Operasional:</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplyOutOfHours}
                onChange={(e) => setAutoReplyOutOfHours(e.target.checked)}
                className="rounded border-neutral-800 text-purple-500 focus:ring-purple-500 w-4 h-4 bg-neutral-900"
              />
              <span className="text-xs font-bold text-purple-300">Aktifkan Pesan Otomatis</span>
            </label>
          </div>

          <textarea
            rows={3}
            value={outOfHoursMessage}
            onChange={(e) => setOutOfHoursMessage(e.target.value)}
            placeholder="Tuliskan pesan balasan otomatis..."
            className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 leading-relaxed focus:border-purple-500 focus:outline-none font-sans"
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-2">
          {saveSuccess && (
            <div className="mb-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✅ Pengaturan Jam Operasional &amp; Status Bantuan berhasil disimpan dan disinkronkan ke Firebase!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>💾 SIMPAN PENGATURAN JAM OPERASIONAL &amp; STATUS BANTUAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
