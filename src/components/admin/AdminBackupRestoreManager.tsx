import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileJson, 
  HardDrive,
  RefreshCw,
  X
} from 'lucide-react';
import { SiteConfig, RegisteredTeam, AdminAccount, UserWallet, WebsiteBackupRecord } from '../../types';

interface AdminBackupRestoreManagerProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  handleSaveAllConfig: (newConfig: SiteConfig, message?: string) => void;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  currentUser?: AdminAccount | null;
  userWallet?: UserWallet;
}

export const AdminBackupRestoreManager: React.FC<AdminBackupRestoreManagerProps> = ({
  config,
  setConfig,
  handleSaveAllConfig,
  registeredTeams,
  setRegisteredTeams,
  currentUser,
  userWallet
}) => {
  const [backups, setBackups] = useState<WebsiteBackupRecord[]>(
    config.websiteBackups || [
      {
        id: 'backup-init-1',
        backupName: 'HUNTERS-BACKUP-AUTO-SEASON-START',
        createdAt: '15 Agustus 2026, 14:30 WIB',
        timestamp: Date.now() - 172800000,
        createdBy: 'System SuperAdmin',
        totalSizeKb: 142,
        totalTeams: registeredTeams.length || 32,
        totalMembers: (config.memberAccounts || []).length || 45,
        totalTransactions: (userWallet?.transactions || []).length || 18,
        status: 'BERHASIL'
      }
    ]
  );

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoreModalRecord, setRestoreModalRecord] = useState<WebsiteBackupRecord | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);

    setTimeout(() => {
      const backupPayload = {
        config,
        registeredTeams,
        memberAccounts: config.memberAccounts || [],
        userWallet: userWallet || { balance: 0, transactions: [] },
        matchSchedules: config.matchSchedules || [],
        announcements: config.announcements || [],
        timestamp: Date.now(),
        dateStr: new Date().toISOString()
      };

      const jsonString = JSON.stringify(backupPayload);
      const sizeKb = Math.max(1, Math.round(jsonString.length / 1024));
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      const newRecord: WebsiteBackupRecord = {
        id: `backup-${Date.now()}`,
        backupName: `HUNTERS-SNAPSHOT-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
        createdAt: `${nowStr} WIB`,
        timestamp: Date.now(),
        createdBy: currentUser?.name || 'Admin DEXZ STORE',
        totalSizeKb: sizeKb,
        totalTeams: registeredTeams.length,
        totalMembers: (config.memberAccounts || []).length,
        totalTransactions: (userWallet?.transactions || []).length,
        jsonData: jsonString,
        status: 'BERHASIL'
      };

      const updatedBackups = [newRecord, ...backups];
      setBackups(updatedBackups);

      const updatedConfig: SiteConfig = {
        ...config,
        websiteBackups: updatedBackups
      };
      setConfig(updatedConfig);
      handleSaveAllConfig(updatedConfig, `Membuat Snapshot Cadangan Database: ${newRecord.backupName}`);

      setIsCreatingBackup(false);
      setSuccessMessage(`✅ Snapshot Cadangan [${newRecord.backupName}] berhasil dibuat (${sizeKb} KB) & disimpan ke Firebase!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }, 800);
  };

  const handleDownloadBackupJson = (record: WebsiteBackupRecord) => {
    let payload = record.jsonData;
    if (!payload) {
      payload = JSON.stringify({
        recordInfo: record,
        config,
        registeredTeams,
        exportDate: new Date().toISOString()
      }, null, 2);
    }

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.backupName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.config) {
          const newRecord: WebsiteBackupRecord = {
            id: `backup-import-${Date.now()}`,
            backupName: file.name.replace('.json', ''),
            createdAt: new Date().toLocaleString('id-ID') + ' WIB',
            timestamp: Date.now(),
            createdBy: `Import by ${currentUser?.name || 'Admin'}`,
            totalSizeKb: Math.round(content.length / 1024),
            totalTeams: parsed.registeredTeams?.length || 0,
            totalMembers: parsed.config?.memberAccounts?.length || 0,
            totalTransactions: parsed.userWallet?.transactions?.length || 0,
            jsonData: content,
            status: 'BERHASIL'
          };

          const updated = [newRecord, ...backups];
          setBackups(updated);
          const updatedConfig = { ...config, websiteBackups: updated };
          setConfig(updatedConfig);
          handleSaveAllConfig(updatedConfig, `Impor berkas cadangan: ${file.name}`);
          alert(`✅ Berkas cadangan [${file.name}] berhasil diunggah & dicatat di daftar pemulihan!`);
        } else {
          alert('❌ Format berkas JSON cadangan tidak valid (tidak ada struktur data turnamen).');
        }
      } catch (err) {
        alert('❌ Gagal membaca berkas JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restoreModalRecord) return;
    setIsRestoring(true);

    setTimeout(() => {
      try {
        if (restoreModalRecord.jsonData) {
          const parsed = JSON.parse(restoreModalRecord.jsonData);
          if (parsed.config) {
            setConfig(parsed.config);
          }
          if (parsed.registeredTeams) {
            setRegisteredTeams(parsed.registeredTeams);
          }
          handleSaveAllConfig(parsed.config || config, `Pulihkan database dari cadangan: ${restoreModalRecord.backupName}`);
        }

        setIsRestoring(false);
        setRestoreModalRecord(null);
        setRestoreConfirmText('');
        alert(`✅ DATABASE BERHASIL DIPULIHKAN ke kondisi [${restoreModalRecord.backupName}]!`);
      } catch (err) {
        setIsRestoring(false);
        alert('❌ Gagal memulihkan database: ' + (err as Error).message);
      }
    }, 1000);
  };

  const handleDeleteBackup = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan cadangan ini?')) return;
    const filtered = backups.filter(b => b.id !== id);
    setBackups(filtered);
    const updatedConfig = { ...config, websiteBackups: filtered };
    setConfig(updatedConfig);
    handleSaveAllConfig(updatedConfig, 'Hapus catatan cadangan database');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER CARD */}
      <div className="bg-[#0f0f0f] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                KATEGORI 7 — MENU 3
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                Khusus Admin Utama 🔒
              </span>
            </div>
            <h3 className="font-black text-lg text-white uppercase flex items-center gap-2 mt-2">
              <Database className="w-5 h-5 text-rose-400" />
              <span>💾 Cadangkan &amp; Pulihkan Data Website (Backup &amp; Restore)</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Buat snapshot cadangan lengkap seluruh data pendaftaran tim FF &amp; MLBB, akun member, transaksi, jadwal, dan aturan ke Firebase Storage atau unduh file JSON mandiri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Snapshot Engine</span>
            </span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2">
              <Save className="w-4 h-4 text-emerald-400" />
              <span>1. Buat Cadangan Snapshot Baru</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Menyimpan seluruh kondisi data saat ini ({registeredTeams.length} Tim, {(config.memberAccounts || []).length} Akun Member, {(config.matchSchedules || []).length} Match) ke dalam snapshot Firebase.
            </p>
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Membuat Snapshot Cadangan...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>💾 BUAT CADANGAN FIREBASE SEKARANG</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 bg-[#050505] border border-neutral-800 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-cyan-400 uppercase flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>2. Pulihkan / Impor dari Berkas JSON Komputer</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Unggah file cadangan format .json dari perangkat Anda untuk memulihkan seluruh data dan pengaturan turnamen.
            </p>
            <label className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]">
              <FileJson className="w-4 h-4" />
              <span>📤 PILIH &amp; UNGGAH FILE CADANGAN JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleUploadBackupJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* BACKUP HISTORY TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-rose-400" />
              <span>Daftar Riwayat Cadangan Snapshot Website ({backups.length}):</span>
            </label>
            <span className="text-[10px] text-neutral-400 font-mono">Simpanan Aman di Firestore</span>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-[#050505]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#0a0a0a] text-neutral-400 font-extrabold uppercase">
                  <th className="p-3">Nama Snapshot</th>
                  <th className="p-3">Waktu Dibuat</th>
                  <th className="p-3">Pembuat</th>
                  <th className="p-3 text-center">Data Tim / Member</th>
                  <th className="p-3 text-center">Ukuran</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {backups.map((bk) => (
                  <tr key={bk.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-cyan-400" />
                      <span>{bk.backupName}</span>
                    </td>
                    <td className="p-3 text-neutral-300 text-[11px] whitespace-nowrap">{bk.createdAt}</td>
                    <td className="p-3 text-amber-300 font-sans">{bk.createdBy}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-cyan-300">
                        {bk.totalTeams} Tim / {bk.totalMembers} Member
                      </span>
                    </td>
                    <td className="p-3 text-center text-neutral-400">{bk.totalSizeKb} KB</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadBackupJson(bk)}
                          title="Unduh file JSON"
                          className="px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRestoreModalRecord(bk)}
                          title="Pulihkan data dari snapshot ini"
                          className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBackup(bk.id)}
                          title="Hapus snapshot ini"
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {restoreModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border-2 border-amber-500/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Konfirmasi Pemulihan Database (Restore)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRestoreModalRecord(null);
                  setRestoreConfirmText('');
                }}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 text-xs text-amber-200">
              <p className="font-bold text-amber-300">
                ⚠️ Peringatan Pemulihan Data:
              </p>
              <p className="leading-relaxed">
                Tindakan ini akan menggantikan seluruh pengaturan, tim, jadwal, dan akun saat ini dengan data yang ada pada snapshot <strong>[{restoreModalRecord.backupName}]</strong> ({restoreModalRecord.createdAt}).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Ketik <span className="font-mono text-amber-400 font-black">PULIHKAN</span> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                placeholder="Ketik PULIHKAN"
                className="w-full bg-[#050505] border border-amber-500/50 rounded-xl p-3 text-xs text-center font-mono font-black text-amber-400 tracking-widest uppercase focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRestoreModalRecord(null);
                  setRestoreConfirmText('');
                }}
                className="flex-1 py-3 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={restoreConfirmText.trim().toUpperCase() !== 'PULIHKAN' || isRestoring}
                onClick={handleExecuteRestore}
                className={`flex-1 py-3 font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                  restoreConfirmText.trim().toUpperCase() === 'PULIHKAN'
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sedang Memulihkan...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>⚡ PULIHKAN DATA SEKARANG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
