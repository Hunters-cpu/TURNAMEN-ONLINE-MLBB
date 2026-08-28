import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Settings2,
  FileText,
  Image as ImageIcon,
  Video,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  Copy,
  Check,
  Server,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Layers,
  Activity,
  Radio,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import {
  ConnectionTarget,
  AutoDispatchRecord,
  SiteConfig,
  RegisteredTeam
} from '../../types';
import {
  AUTHENTIC_RECEIVER_REGISTRY,
  AuthenticReceiverSite,
  validateMasterConnectionKey,
  loadConnectionTargets,
  saveConnectionTargets,
  loadDispatchHistory,
  saveDispatchHistory,
  executeAutoDispatchToFileTargets,
  DispatchFilePayload
} from '../../lib/autoDispatchBridge';

interface AdminAutoDispatchBridgeManagerProps {
  siteConfig: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams?: RegisteredTeam[];
  isAdmin?: boolean;
}

export const AdminAutoDispatchBridgeManager: React.FC<AdminAutoDispatchBridgeManagerProps> = ({
  siteConfig,
  setSiteConfig,
  registeredTeams = [],
  isAdmin = false
}) => {
  // Navigation inside this module
  const [activeTab, setActiveTab] = useState<'pengirim' | 'uji-kirim' | 'riwayat' | 'kunci-penerima'>('pengirim');

  // Targets & History state (Loaded from localStorage; pure empty by default)
  const [targets, setTargets] = useState<ConnectionTarget[]>([]);
  const [history, setHistory] = useState<AutoDispatchRecord[]>([]);

  // Form State: ➕ KIRIM PERMINTAAN SAMBUNGAN BARU
  const [formDestName, setFormDestName] = useState<string>('');
  const [formDestUrl, setFormDestUrl] = useState<string>('');
  const [formMasterKey, setFormMasterKey] = useState<string>('');
  const [formAllowedPhotos, setFormAllowedPhotos] = useState<boolean>(true);
  const [formAllowedVideos, setFormAllowedVideos] = useState<boolean>(true);
  const [formAllowedDocs, setFormAllowedDocs] = useState<boolean>(true);
  const [formAllowedAll, setFormAllowedAll] = useState<boolean>(true);
  const [formMaxSizeMb, setFormMaxSizeMb] = useState<number>(500);

  // Form Feedback
  const [formErrorMsg, setFormErrorMsg] = useState<string>('');
  const [formSuccessMsg, setFormSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Interactive Live Dispatch Simulator
  const [simFileCategory, setSimFileCategory] = useState<'Foto' | 'Video' | 'Dokumen' | 'Semua'>('Foto');
  const [simFileName, setSimFileName] = useState<string>('Foto_Kegiatan_Turnamen_Hunters.jpg');
  const [simFileSizeMb, setSimFileSizeMb] = useState<number>(12.5);
  const [isDispatchingLive, setIsDispatchingLive] = useState<boolean>(false);
  const [liveProgressMap, setLiveProgressMap] = useState<Record<string, { percent: number; statusText: string }>>({});
  const [liveDispatchSummary, setLiveDispatchSummary] = useState<string>('');

  // Receiver Simulation (Owner Approval Portal)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('Kunci sambungan kadaluarsa atau kuota bandwidth penuh');
  const [selectedRejectTargetId, setSelectedRejectTargetId] = useState<string | null>(null);

  // Edit target modal state
  const [editingTarget, setEditingTarget] = useState<ConnectionTarget | null>(null);

  // Load targets & history on initial mount
  useEffect(() => {
    const loadedTargets = loadConnectionTargets();
    const loadedHistory = loadDispatchHistory();
    setTargets(loadedTargets);
    setHistory(loadedHistory);
  }, []);

  // Save changes helper
  const updateTargetsAndPersist = (newTargets: ConnectionTarget[]) => {
    setTargets(newTargets);
    saveConnectionTargets(newTargets);
  };

  const updateHistoryAndPersist = (newHistory: AutoDispatchRecord[]) => {
    setHistory(newHistory);
    saveDispatchHistory(newHistory);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: FORM PERMINTAAN SAMBUNGAN BARU
  // --------------------------------------------------------------------------
  const handleResetForm = () => {
    setFormDestName('');
    setFormDestUrl('');
    setFormMasterKey('');
    setFormAllowedPhotos(true);
    setFormAllowedVideos(true);
    setFormAllowedDocs(true);
    setFormAllowedAll(true);
    setFormMaxSizeMb(500);
    setFormErrorMsg('');
    setFormSuccessMsg('');
  };

  const handleSendConnectionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');
    setFormSuccessMsg('');

    if (!formDestName.trim()) {
      setFormErrorMsg('❌ Nama Situs Tujuan wajib diisi.');
      return;
    }
    if (!formDestUrl.trim()) {
      setFormErrorMsg('❌ Alamat Lengkap Situs URL wajib diisi.');
      return;
    }
    if (!formMasterKey.trim()) {
      setFormErrorMsg('❌ Kunci Sambungan Utama wajib diisi — salin persis dari situs penerima.');
      return;
    }

    // Cek duplikasi URL
    const existing = targets.find(t => t.destinationUrl.trim().toLowerCase() === formDestUrl.trim().toLowerCase());
    if (existing) {
      setFormErrorMsg(`⚠️ Situs tujuan dengan URL ini sudah ada di daftar status: ${existing.destinationName} (${existing.status})`);
      return;
    }

    setIsSubmitting(true);

    // 1. Uji kecocokan kunci SAMA PERSIS
    const matchResult = validateMasterConnectionKey(formDestUrl, formMasterKey, formDestName);

    if (!matchResult.isMatch) {
      setIsSubmitting(false);
      setFormErrorMsg(matchResult.message);
      return;
    }

    // 2. Kunci Sah & Cocok → Buat status MENUNGGU PERSETUJUAN
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newTarget: ConnectionTarget = {
      id: 'target-' + Date.now(),
      destinationName: formDestName.trim(),
      destinationUrl: formDestUrl.trim(),
      masterKey: formMasterKey.trim(),
      allowedTypes: {
        photos: formAllowedPhotos || formAllowedAll,
        videos: formAllowedVideos || formAllowedAll,
        documents: formAllowedDocs || formAllowedAll,
        all: formAllowedAll
      },
      maxFileSizeMb: Number(formMaxSizeMb) || 500,
      status: 'MENUNGGU_PERSETUJUAN',
      keyValidationStatus: 'COCOK_SAH',
      createdAt: `${formattedDate} ${formattedTime}`,
      createdAtTimestamp: Date.now(),
      totalDispatchedCount: 0,
      successfulDispatchedCount: 0,
      notes: `Permintaan sambungan dikirim. Kunci sah cocok dengan ${matchResult.matchedReceiver?.name || 'Situs Penerima'}. Menunggu persetujuan pemilik tujuan.`
    };

    const updated = [newTarget, ...targets];
    updateTargetsAndPersist(updated);

    setIsSubmitting(false);
    setFormSuccessMsg(`🟡 Permintaan terkirim — Kunci Sah ✅ Menunggu Pemilik Tujuan (${formDestName}) menyetujui sambungan.`);
    
    // Reset form fields
    setFormDestName('');
    setFormDestUrl('');
    setFormMasterKey('');
  };

  // --------------------------------------------------------------------------
  // HANDLERS: PENGELOLAAN STATUS SAMBUNGAN
  // --------------------------------------------------------------------------
  const handleCheckStatusNow = (targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    if (target.status === 'MENUNGGU_PERSETUJUAN') {
      alert(`⏳ Status Sambungan: [MENUNGGU PERSETUJUAN]\n\nSitus: ${target.destinationName}\nURL: ${target.destinationUrl}\nPemeriksaan Kunci: ✅ COCOK SAH\n\nMenunggu persetujuan dari Admin/Pemilik situs tujuan. Anda juga dapat menggunakan tab "Kunci & Simulasi Penerima" untuk menyetujui permintaan ini.`);
    } else if (target.status === 'TERHUBUNG_AKTIF') {
      alert(`🟢 Status Sambungan: [TERHUBUNG & AKTIF ✅]\n\nSitus: ${target.destinationName}\nURL: ${target.destinationUrl}\nStatus: Berkas baru mengalir secara otomatis tanpa klik tambahan.`);
    } else if (target.status === 'DITOLAK_TIDAK_SAH') {
      alert(`⚫ Status Sambungan: [DITOLAK / TIDAK SAH]\n\nAlasan: ${target.rejectionReason || 'Ditolak oleh pemilik tujuan'}\nSilakan periksa kunci sambungan atau ajukan ulang.`);
    }
  };

  const handleCancelRequest = (targetId: string) => {
    if (confirm('Batalkan permintaan sambungan ini?')) {
      const updated = targets.filter(t => t.id !== targetId);
      updateTargetsAndPersist(updated);
    }
  };

  const handleDisconnect = (targetId: string) => {
    if (confirm('Putuskan sambungan ini? Berkas BARU tidak akan dikirim otomatis lagi. Semua berkas yang SUDAH TERKIRIM tetap tersimpan aman di kedua belah pihak.')) {
      const updated = targets.map(t => {
        if (t.id === targetId) {
          return {
            ...t,
            status: 'TERPUTUS' as const,
            notes: 'Sambungan diputuskan oleh Pengirim. Berkas baru tidak dikirim.'
          };
        }
        return t;
      });
      updateTargetsAndPersist(updated);
    }
  };

  const handleReconnect = (targetId: string) => {
    const updated = targets.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          status: 'TERHUBUNG_AKTIF' as const,
          notes: 'Sambungan diaktifkan kembali.'
        };
      }
      return t;
    });
    updateTargetsAndPersist(updated);
  };

  const handleDeleteTarget = (targetId: string) => {
    if (confirm('Hapus tujuan sambungan ini dari daftar?')) {
      const updated = targets.filter(t => t.id !== targetId);
      updateTargetsAndPersist(updated);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: SIMULASI PERSETUJUAN DARI SISI PENERIMA (RECEIVER PORTAL)
  // --------------------------------------------------------------------------
  const handleApproveFromReceiverSide = (targetId: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const updated = targets.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          status: 'TERHUBUNG_AKTIF' as const,
          approvedAt: `${formattedDate} ${formattedTime}`,
          notes: `Disetujui oleh Pemilik Tujuan pada ${formattedDate} ${formattedTime}. Berkas baru mengalir otomatis.`
        };
      }
      return t;
    });

    updateTargetsAndPersist(updated);
    alert('✅ Sambungan Berhasil Disetujui!\n\nStatus kini berubah menjadi "🟢 TERHUBUNG & AKTIF ✅". Mulai sekarang, setiap berkas baru yang diunggah akan otomatis terkirim tanpa klik tambahan!');
  };

  const handleRejectFromReceiverSide = (targetId: string) => {
    const reason = rejectionReasonInput.trim() || 'Kunci ditolak atau sambungan tidak diizinkan oleh pemilik tujuan.';
    const updated = targets.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          status: 'DITOLAK_TIDAK_SAH' as const,
          rejectionReason: reason,
          rejectedAt: new Date().toLocaleTimeString('id-ID')
        };
      }
      return t;
    });

    updateTargetsAndPersist(updated);
    setSelectedRejectTargetId(null);
    alert(`❌ Permintaan Sambungan Ditolak:\n"${reason}"`);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: SIMULASI UJI UNGGAH & AUTO-DISPATCH LIVE
  // --------------------------------------------------------------------------
  const handleRunLiveUploadTest = async () => {
    if (targets.length === 0) {
      alert('⚠️ Belum ada tujuan sambungan. Tambahkan tujuan terlebih dahulu di formulir pengirim.');
      return;
    }

    setIsDispatchingLive(true);
    setLiveProgressMap({});
    setLiveDispatchSummary('');

    const filePayload: DispatchFilePayload = {
      fileName: simFileName || 'Berkas_Dokumentasi_Turnamen.dat',
      category: simFileCategory,
      fileSizeBytes: Math.round((simFileSizeMb || 1) * 1024 * 1024),
      fileSizeFormatted: `${simFileSizeMb} MB`,
      sourceOrigin: typeof window !== 'undefined' ? window.location.hostname : 'Turnamen Hunters Community'
    };

    // Jalankan fan-out pengiriman
    const report = await executeAutoDispatchToFileTargets(
      filePayload,
      targets,
      (targetId, percent, statusText) => {
        setLiveProgressMap(prev => ({
          ...prev,
          [targetId]: { percent, statusText }
        }));
      }
    );

    // Catat ke riwayat pengiriman
    const newRecords: AutoDispatchRecord[] = report.results.map((res, idx) => ({
      id: 'disp-' + Date.now() + '-' + idx,
      timestamp: report.timestamp,
      timestampMs: Date.now(),
      fileName: filePayload.fileName,
      fileSize: filePayload.fileSizeFormatted || '10 MB',
      fileSizeBytes: filePayload.fileSizeBytes,
      category: filePayload.category,
      sourceOrigin: typeof window !== 'undefined' ? window.location.hostname : 'Hunters Community Hub',
      targetDestinationId: res.targetId,
      targetDestinationName: res.targetName,
      targetUrl: targets.find(t => t.id === res.targetId)?.destinationUrl || '',
      status: res.status,
      statusMessage: res.message,
      latencyMs: res.latencyMs
    }));

    const updatedHistory = [...newRecords, ...history];
    updateHistoryAndPersist(updatedHistory);

    // Update target stats
    const updatedTargets = targets.map(t => {
      const targetResult = report.results.find(r => r.targetId === t.id);
      if (targetResult && targetResult.status === 'TERKIRIM') {
        return {
          ...t,
          lastDispatchedAt: report.timestamp,
          lastDispatchedFileName: filePayload.fileName,
          totalDispatchedCount: (t.totalDispatchedCount || 0) + 1,
          successfulDispatchedCount: (t.successfulDispatchedCount || 0) + 1
        };
      }
      return t;
    });
    updateTargetsAndPersist(updatedTargets);

    setIsDispatchingLive(false);
    setLiveDispatchSummary(
      `Selesai — Berkas tersimpan lokal di situs ini! Terkirim ke ${report.successCount} tujuan aktif, ${report.pendingCount} ditunda (menunggu persetujuan), ${report.rejectedCount} ditolak aturan.`
    );
  };

  const handleClearHistory = () => {
    if (confirm('Bersihkan seluruh riwayat pengiriman otomatis?')) {
      updateHistoryAndPersist([]);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Quick autofill from authentic registry
  const handleAutofillFromRegistry = (receiver: AuthenticReceiverSite) => {
    setFormDestName(receiver.name);
    setFormDestUrl(receiver.url);
    setFormMasterKey(receiver.masterKey);
    setFormMaxSizeMb(receiver.maxAllowedSizeMb);
    setFormAllowedAll(true);
    setFormAllowedPhotos(true);
    setFormAllowedVideos(true);
    setFormAllowedDocs(true);
    setActiveTab('pengirim');
    setFormErrorMsg('');
    setFormSuccessMsg('📋 Formulir terisi dengan data resmi Penerima. Kunci Sambungan disalin persis.');
  };

  // Summary counts
  const activeTargetsCount = targets.filter(t => t.status === 'TERHUBUNG_AKTIF').length;
  const pendingTargetsCount = targets.filter(t => t.status === 'MENUNGGU_PERSETUJUAN').length;

  return (
    <div className="w-full space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. HEADER UTAMA SISTEM PENGIRIMAN */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                SISTEM PENGIRIMAN & SAMBUNGAN OTOMATIS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase">
                <Lock className="w-3 h-3" />
                KHUSUS ADMIN UTAMA
              </span>
              {activeTargetsCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase">
                  <CheckCircle2 className="w-3 h-3" />
                  {activeTargetsCount} Sambungan Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[11px] font-bold">
                  ⚠️ Belum ada sambungan sah
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0 animate-pulse" />
              <span>HUBUNGAN KE SITUS LAIN — PENGIRIM & PEMBAGI DATA</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
              Tempel alamat URL lengkap dan <b>Kunci Sambungan UTAMA</b> yang disalin persis dari situs Penerima. Begitu disetujui Pemilik Tujuan, setiap berkas baru yang diunggah akan <b>otomatis terkirim sendiri tanpa perlu klik tombol konfirmasi apa-apa</b>.
            </p>
          </div>

          {/* Status Alert Bar */}
          <div className="shrink-0 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 min-w-[240px]">
            <div className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Status Sistem Pengirim:</div>
            {activeTargetsCount > 0 ? (
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>🟢 {activeTargetsCount} Situs Terhubung & Aktif</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-amber-400/90 leading-snug">
                ⚠️ Belum ada sambungan sah — berkas hanya tersimpan aman di situs ini saja
              </div>
            )}
            <div className="text-[10px] text-neutral-400 pt-0.5">
              {pendingTargetsCount > 0 && `⏳ ${pendingTargetsCount} tujuan menunggu persetujuan`}
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pengirim')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pengirim'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Minta Sambungan & Daftar Tujuan ({targets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uji-kirim')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'uji-kirim'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Uji Unggah & Kirim Otomatis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Pengiriman ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kunci-penerima')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ml-auto ${
              activeTab === 'kunci-penerima'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-800/40'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>🔑 Kunci & Simulasi Penerima ({AUTHENTIC_RECEIVER_REGISTRY.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB PENGIRIM: FORM MINTA SAMBUNGAN BARU & DAFTAR TUJUAN */}
      {/* ========================================================================= */}
      {activeTab === 'pengirim' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* A. FORM PERMINTAAN SAMBUNGAN BARU */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                  ➕
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    KIRIM PERMINTAAN SAMBUNGAN BARU — ISI SEMUA WAJIB
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sistem akan mencocokkan Kunci Sambungan secara otomatis dengan otoritas situs Penerima.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('kunci-penerima')}
                className="text-xs text-purple-400 hover:text-purple-300 underline font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Key className="w-3 h-3" />
                <span>Lihat Kunci Asli Situs Penerima</span>
              </button>
            </div>

            {/* Form Error or Success Feedback */}
            {formErrorMsg && (
              <div className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500/60 text-red-300 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-lg shadow-red-950/40 animate-in fade-in">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{formErrorMsg}</div>
                  <div className="text-[11px] font-normal text-red-300/80">
                    Periksa kembali huruf besar/kecil, tanda hubung (-), dan titik (.) agar sama persis dengan yang tertera pada situs penerima.
                  </div>
                </div>
              </div>
            )}

            {formSuccessMsg && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-500/60 text-amber-200 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-lg shadow-amber-950/40 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{formSuccessMsg}</div>
                  <div className="text-[11px] font-normal text-amber-300/80">
                    Status saat ini: <b>MENUNGGU PERSETUJUAN</b>. Berkas baru belum akan dikirim sampai Pemilik Tujuan menekan persetujuan.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendConnectionRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Nama Situs Tujuan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                    Nama Situs Tujuan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Penyimpanan-1TB Cloud / Server-Cloud Master"
                    value={formDestName}
                    onChange={(e) => setFormDestName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:outline-none text-white text-xs sm:text-sm font-medium placeholder-neutral-600 transition-all"
                  />
                </div>

                {/* 2. Alamat Lengkap Situs URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                    Alamat Lengkap Situs URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://storage-1tb.hunters-esports.id/api/receiver"
                    value={formDestUrl}
                    onChange={(e) => setFormDestUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:outline-none text-white text-xs sm:text-sm font-medium placeholder-neutral-600 transition-all"
                  />
                </div>
              </div>

              {/* 3. Kunci Sambungan UTAMA */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    🔑 Kunci Sambungan Utama <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal lowercase">
                    (wajib persis huruf besar/kecil & tanda)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tempel Kunci Sambungan Utama (Contoh: KEY-1TB-STORAGE-HUNTERS-2026.ID)"
                  value={formMasterKey}
                  onChange={(e) => setFormMasterKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/40 focus:outline-none text-amber-300 font-mono text-xs sm:text-sm font-bold placeholder-neutral-700 tracking-wide transition-all"
                />

                {/* Strict Warning Box as mandated by User Rules */}
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠️ PERATURAN PENTING KUNCI SAMBUNGAN:</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed pl-5">
                    SALIN PERSIS dari halaman Sambungan situs TUJUAN — SEMUA huruf besar/kecil, tanda hubung (-), garis miring (/) & titik (.) <b>HARUS SAMA PERSIS</b>; beda satu karakter = ditolak otomatis!
                  </p>
                </div>
              </div>

              {/* 4. Pengaturan Berkas yang Diizinkan & Batas Ukuran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Checkbox Jenis Berkas */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                    Izinkan Kirim Otomatis:
                  </label>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="inline-flex items-center gap-1.5 text-neutral-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAllowedPhotos}
                        onChange={(e) => setFormAllowedPhotos(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Foto</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-neutral-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAllowedVideos}
                        onChange={(e) => setFormAllowedVideos(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Video</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-neutral-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAllowedDocs}
                        onChange={(e) => setFormAllowedDocs(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Dokumen</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-amber-400 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAllowedAll}
                        onChange={(e) => {
                          setFormAllowedAll(e.target.checked);
                          if (e.target.checked) {
                            setFormAllowedPhotos(true);
                            setFormAllowedVideos(true);
                            setFormAllowedDocs(true);
                          }
                        }}
                        className="rounded accent-amber-500"
                      />
                      <span>Semua Berkas</span>
                    </label>
                  </div>
                </div>

                {/* Batas Ukuran Berkas */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                    Batas Ukuran Tiap Berkas:
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={formMaxSizeMb}
                      onChange={(e) => setFormMaxSizeMb(Number(e.target.value))}
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value={100}>100 MB</option>
                      <option value={250}>250 MB</option>
                      <option value={500}>500 MB (Standar Rekomendasi)</option>
                      <option value={1000}>1000 MB (1 GB)</option>
                    </select>
                    <span className="text-xs text-neutral-400">maksimal per berkas</span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'MEMERIKSA KUNCI...' : '📤 KIRIM PERMINTAAN SAMBUNGAN'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>📋 KOSONGKAN SEMUA</span>
                </button>
              </div>
            </form>
          </div>

          {/* B. DAFTAR TUJUAN & STATUS SAMBUNGAN SAYA */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black">
                  📋
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    DAFTAR TUJUAN & STATUS SAMBUNGAN SAYA
                  </h3>
                  <div className="text-xs text-neutral-400">
                    Total {targets.length} tujuan terdaftar
                  </div>
                </div>
              </div>
            </div>

            {/* EMPTY STATE (KONDISI AWAL SEBELUM TERHUBUNG MURNI KOSONG) */}
            {targets.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl shadow-inner">
                  📭
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">
                    BELUM ADA TUJUAN TERHUBUNG
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Belum ada sambungan. Tambah tujuan & tempel Kunci Sambungan yang diberikan situs tujuan pada formulir di atas.
                  </p>
                </div>

                {/* Status Legend Guide */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-left max-w-lg mx-auto space-y-2 text-xs">
                  <div className="font-bold text-neutral-300 text-[11px] uppercase tracking-wider">
                    Setelah dikirim & diperiksa:
                  </div>
                  <div className="space-y-1 text-neutral-400">
                    <div className="flex items-center gap-2 text-amber-300">
                      <span>🟡</span>
                      <span><b>MENUNGGU PERSETUJUAN</b> — kunci sudah cocok, menunggu pemilik tujuan</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span>⚫</span>
                      <span><b>DITOLAK / TIDAK SAH</b> — kunci salah atau pemilik tolak permintaan</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300">
                      <span>🟢</span>
                      <span><b>TERHUBUNG & AKTIF ✅</b> — disetujui, berkas mengalir otomatis</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kunci-penerima')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/50 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Lihat Daftar Contoh Kunci Sah Penerima</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TARGETS LIST */
              <div className="space-y-4">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                      target.status === 'TERHUBUNG_AKTIF'
                        ? 'bg-neutral-950 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                        : target.status === 'MENUNGGU_PERSETUJUAN'
                        ? 'bg-neutral-950 border-amber-500/40 shadow-lg shadow-amber-950/20'
                        : target.status === 'DITOLAK_TIDAK_SAH'
                        ? 'bg-neutral-950 border-red-500/30'
                        : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    {/* Top row: Name, Status Badge, and Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                          target.status === 'TERHUBUNG_AKTIF'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : target.status === 'MENUNGGU_PERSETUJUAN'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {target.status === 'TERHUBUNG_AKTIF' ? '🟢' : target.status === 'MENUNGGU_PERSETUJUAN' ? '🟡' : '⚫'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-white">
                              {target.destinationName}
                            </h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                              {target.destinationUrl}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            Terdaftar: {target.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {target.status === 'TERHUBUNG_AKTIF' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            TERHUBUNG & AKTIF ✅
                          </span>
                        )}
                        {target.status === 'MENUNGGU_PERSETUJUAN' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            MENUNGGU PERSETUJUAN
                          </span>
                        )}
                        {target.status === 'DITOLAK_TIDAK_SAH' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" />
                            DITOLAK / TIDAK SAH
                          </span>
                        )}
                        {target.status === 'TERPUTUS' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-black uppercase tracking-wider">
                            SAMBUNGAN TERPUTUS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle details: Kunci validation, Allowed types, Last dispatch */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-1.5">
                      {target.status === 'MENUNGGU_PERSETUJUAN' && (
                        <div className="text-amber-300 font-medium flex items-center gap-2">
                          <span>⏳ Dikirim: {target.createdAt}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Pemeriksaan Kunci: ✅ COCOK SAH</span>
                        </div>
                      )}

                      {target.status === 'TERHUBUNG_AKTIF' && (
                        <>
                          <div className="text-emerald-300 font-bold">
                            🟢 TERHUBUNG & AKTIF sejak {target.approvedAt || target.createdAt} ✅
                          </div>
                          <div className="text-neutral-300">
                            ↳ Terakhir dikirim: <b className="text-white">{target.lastDispatchedFileName || 'Belum ada berkas baru diunggah'}</b> {target.lastDispatchedAt ? `✅ (${target.lastDispatchedAt})` : ''}
                          </div>
                          <div className="text-neutral-400 text-[11px]">
                            ↳ Jenis diizinkan: {target.allowedTypes.all ? 'Foto, Video, Dokumen, Semua' : [target.allowedTypes.photos && 'Foto', target.allowedTypes.videos && 'Video', target.allowedTypes.documents && 'Dokumen'].filter(Boolean).join(', ')} • Batas: {target.maxFileSizeMb} MB • Total Terkirim: {target.totalDispatchedCount || 0} berkas
                          </div>
                        </>
                      )}

                      {target.status === 'DITOLAK_TIDAK_SAH' && (
                        <div className="text-red-300 font-medium">
                          ⚠️ Permintaan Sambungan DITOLAK — hubungi Pemilik Tujuan untuk alasannya: <i>"{target.rejectionReason || 'Kunci ditolak'}"</i>
                        </div>
                      )}

                      {target.status === 'TERPUTUS' && (
                        <div className="text-neutral-400">
                          🔗 Sambungan terputus. Berkas baru tidak dikirim ke situs ini.
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Per Target Status as defined by User */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {target.status === 'MENUNGGU_PERSETUJUAN' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCheckStatusNow(target.id)}
                            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            <span>🔄 CEK STATUS SEKARANG</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveFromReceiverSide(target.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                            title="Simulasi Persetujuan oleh Pemilik Tujuan"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✅ SETUJUI (SIMULASI PENERIMA)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelRequest(target.id)}
                            className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>🗑️ BATALKAN PERMINTAAN</span>
                          </button>
                        </>
                      )}

                      {target.status === 'TERHUBUNG_AKTIF' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveTab('uji-kirim')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>📤 UJI KIRIM BERKAS</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDisconnect(target.id)}
                            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>🔗 PUTUSKAN SAMBUNGAN</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTarget(target.id)}
                            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-red-950 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </>
                      )}

                      {(target.status === 'DITOLAK_TIDAK_SAH' || target.status === 'TERPUTUS') && (
                        <>
                          {target.status === 'TERPUTUS' ? (
                            <button
                              type="button"
                              onClick={() => handleReconnect(target.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>⚡ HUBUNGKAN KEMBALI</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setFormDestName(target.destinationName);
                                setFormDestUrl(target.destinationUrl);
                                setFormMasterKey(target.masterKey);
                                handleDeleteTarget(target.id);
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>🔄 AJUKAN ULANG</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTarget(target.id)}
                            className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>🗑️ HAPUS</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB UJI UNGGAH & AUTO-FANOUT DISPATCH LIVE */}
      {/* ========================================================================= */}
      {activeTab === 'uji-kirim' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                  📤
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    SAAT MENGUNGGAH & SIMPAN BERKAS — OTOMATIS BERJALAN SENDIRI
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Berkas langsung tersimpan aman di situs ini & otomatis menyebar serentak ke semua sambungan aktif.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300">Jenis Berkas</label>
                <select
                  value={simFileCategory}
                  onChange={(e) => setSimFileCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Foto">Foto (JPG / PNG)</option>
                  <option value="Video">Video (MP4 / WebM)</option>
                  <option value="Dokumen">Dokumen (PDF / JSON / DOC)</option>
                  <option value="Semua">Semua / Backup Komplit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300">Nama Berkas</label>
                <input
                  type="text"
                  value={simFileName}
                  onChange={(e) => setSimFileName(e.target.value)}
                  placeholder="Contoh: Bukti_Transfer_Kapten_Aura.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300">Ukuran Berkas (MB)</label>
                <input
                  type="number"
                  value={simFileSizeMb}
                  onChange={(e) => setSimFileSizeMb(Number(e.target.value))}
                  min={0.1}
                  max={2000}
                  step={0.5}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Dispatch Action Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunLiveUploadTest}
                disabled={isDispatchingLive || targets.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-5 h-5" />
                <span>
                  {isDispatchingLive
                    ? 'MENYIMPAN & MENYEBARKAN KE SEMUA SAMBUNGAN...'
                    : '📤 SIMULASIKAN SIMPAN & KIRIM BERKAS SEKARANG'}
                </span>
              </button>
            </div>

            {/* LIVE FAN-OUT VISUALIZATION PIPELINE (Exact Box Pattern from prompt) */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Hasil Jalur Pengiriman Serentak:</span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {targets.length} Target Terpantau
                </span>
              </div>

              {targets.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Belum ada tujuan sambungan. Tambahkan tujuan terlebih dahulu di tab <b>Minta Sambungan</b>.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✅ Tersimpan di situs ini! Menyebar ke sambungan aktif…</span>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-neutral-800">
                    {targets.map((t, idx) => {
                      const isLast = idx === targets.length - 1;
                      const progressInfo = liveProgressMap[t.id];

                      return (
                        <div key={t.id} className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-neutral-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <span>{isLast ? '└→' : '├→'}</span>
                              <span className="text-white">{t.destinationName}</span>
                            </span>

                            <span>
                              {t.status === 'TERHUBUNG_AKTIF' ? (
                                <span className="text-emerald-400 font-bold">
                                  {progressInfo ? progressInfo.statusText : '████████████ 100 % ✅ TERKIRIM'}
                                </span>
                              ) : t.status === 'MENUNGGU_PERSETUJUAN' ? (
                                <span className="text-amber-400 font-bold">
                                  ⏳ Belum disetujui → ditunda sementara
                                </span>
                              ) : (
                                <span className="text-neutral-500">
                                  ⚫ Tidak aktif → dilewati
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Progress bar visual for active connection */}
                          {t.status === 'TERHUBUNG_AKTIF' && (
                            <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                                style={{ width: `${progressInfo ? progressInfo.percent : 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-neutral-400 text-[11px] italic">
                    Selesai — TIDAK PERLU tombol "Kirim" atau konfirmasi tambahan!
                  </div>
                </div>
              )}

              {liveDispatchSummary && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs font-bold">
                  {liveDispatchSummary}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB RIWAYAT PENGIRIMAN OTOMATIS */}
      {/* ========================================================================= */}
      {activeTab === 'riwayat' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black">
                  📜
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    RIWAYAT PENGIRIMAN OTOMATIS
                  </h3>
                  <div className="text-xs text-neutral-400">
                    Total {history.length} catatan pengiriman berkas
                  </div>
                </div>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-950 border border-neutral-700 hover:border-red-800 text-neutral-300 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Riwayat</span>
                </button>
              )}
            </div>

            {/* EMPTY STATE (KONDISI AWAL SEBELUM TERHUBUNG MURNI KOSONG) */}
            {history.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl shadow-inner">
                  📭
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">
                    BELUM ADA BERKAS YANG DIKIRIM
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Setelah sambungan sah & berkas diunggah: nama, ukuran, asal, tujuan dikirim & hasil berhasil/gagal akan muncul otomatis di sini.
                  </p>
                </div>
              </div>
            ) : (
              /* HISTORY LIST TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Nama Berkas</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Tujuan Pengiriman</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-neutral-950/50 transition-colors">
                        <td className="py-3 px-3 text-neutral-400 whitespace-nowrap font-mono">
                          {record.timestamp}
                        </td>
                        <td className="py-3 px-3 font-bold text-white max-w-[200px] truncate">
                          {record.fileName}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                            {record.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300 font-mono">
                          {record.fileSize}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-amber-300">{record.targetDestinationName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[150px]">{record.targetUrl}</div>
                        </td>
                        <td className="py-3 px-3">
                          {record.status === 'TERKIRIM' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              BERHASIL ({record.latencyMs || 45}ms)
                            </span>
                          ) : record.status === 'DITUNDA_BELUM_DISETUJUI' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                              <Clock className="w-3 h-3" />
                              DITUNDA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[11px]">
                              <XCircle className="w-3 h-3" />
                              {record.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB KUNCI & SIMULASI PENERIMA (RECEIVER VAULT & PORTAL PERSETUJUAN) */}
      {/* ========================================================================= */}
      {activeTab === 'kunci-penerima' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* A. DIREKTORI KUNCI RESMI DARI SITUS PENERIMA */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-purple-800/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black">
                  🔑
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    DIREKTORI KUNCI SAH SITUS PENERIMA (HANYA DIBUAT OLEH PENERIMA)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sisi Pengirim tidak bisa membuat kunci sendiri — gunakan daftar kunci resmi berikut untuk menghubungkan ke sistem.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUTHENTIC_RECEIVER_REGISTRY.map((receiver) => (
                <div
                  key={receiver.id}
                  className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>{receiver.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          Resmi
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                        {receiver.description}
                      </p>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-neutral-500 uppercase font-black">Alamat URL Penerima:</div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300 break-all select-all">
                      {receiver.url}
                    </div>
                  </div>

                  {/* Master Key */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-amber-400 uppercase font-black flex items-center justify-between">
                      <span>🔑 Kunci Sambungan Utama Asli:</span>
                      <span className="text-neutral-500 font-normal lowercase">(salin persis)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs font-black text-amber-300 break-all flex items-center justify-between gap-2">
                      <span className="select-all">{receiver.masterKey}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(receiver.masterKey, receiver.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black shrink-0 transition-all cursor-pointer flex items-center gap-1"
                      >
                        {copiedKeyId === receiver.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Kunci</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Details and Quick Autofill */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                    <div>Maks: <b className="text-white">{receiver.maxAllowedSizeMb} MB</b></div>
                    <button
                      type="button"
                      onClick={() => handleAutofillFromRegistry(receiver)}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Tempel Otomatis ke Formulir ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. SIMULASI PORTAL PERSETUJUAN PEMILIK TUJUAN (RECEIVER PORTAL) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-emerald-800/40 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                🛡️
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  SIMULASI PERSETUJUAN PEMILIK TUJUAN (SISI PENERIMA)
                </h3>
                <p className="text-xs text-neutral-400">
                  Sebagai Admin Utama, Anda dapat bertindak sebagai Pemilik Tujuan untuk menguji alur <b>Setujui</b> atau <b>Tolak</b> permintaan sambungan yang masuk.
                </p>
              </div>
            </div>

            {pendingTargetsCount === 0 ? (
              <div className="p-6 rounded-2xl bg-neutral-950 text-center text-xs text-neutral-400">
                Tidak ada permintaan sambungan yang berstatus <b>MENUNGGU PERSETUJUAN</b> saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {targets.filter(t => t.status === 'MENUNGGU_PERSETUJUAN').map(target => (
                  <div
                    key={target.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-white">
                          Permintaan Masuk dari: <span className="text-amber-400">{target.destinationName}</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          URL: {target.destinationUrl} • Kunci: <code className="text-amber-300 font-mono">{target.masterKey}</code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveFromReceiverSide(target.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-950/40"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✅ SETUJUI SAMBUNGAN</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectFromReceiverSide(target.id)}
                          className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>❌ TOLAK</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
