import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Link, 
  Unlink, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  CreditCard, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Settings, 
  Activity, 
  Clock, 
  Upload, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Code, 
  Eye, 
  Check, 
  Sparkles,
  Server,
  ArrowRight,
  Sliders,
  Database,
  Lock,
  ShieldAlert,
  Key,
  LogIn,
  ArrowLeft,
  Shield,
  Radio,
  Share2
} from 'lucide-react';
import { SiteConfig, RegisteredTeam, WebsiteBridgeConfig, WebsiteBridgeLog } from '../../types';
import { AdminAutoDispatchBridgeManager } from '../admin/AdminAutoDispatchBridgeManager';
import { 
  testTargetWebsiteConnection, 
  sendPayloadToDestinationWebsite, 
  fetchBridgeLogs, 
  clearBackendBridgeLogs 
} from '../../lib/websiteBridgeClient';
import {
  CENTRALIZED_STORAGE_CONFIG,
  sendCentralizedHandshake,
  uploadToCentralizedStorage
} from '../../lib/storageBridge1TB';

interface BridgeWebsiteViewProps {
  siteConfig: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams?: RegisteredTeam[];
  isAdmin?: boolean;
  setActiveTab?: (tab: any) => void;
}

export const BridgeWebsiteView: React.FC<BridgeWebsiteViewProps> = ({
  siteConfig,
  setSiteConfig,
  registeredTeams = [],
  isAdmin = false,
  setActiveTab,
}) => {
  // Local Bridge Config State initialized from siteConfig
  const currentBridge: WebsiteBridgeConfig = siteConfig.bridgeConfig || {
    isEnabled: true,
    targetWebsiteUrl: '',
    bridgeName: 'Website Tujuan Utama / Webhook Receiver',
    secretKey: '',
    isConnected: false,
    lastPingStatus: 'IDLE',
    autoSendPaymentProof: true,
    autoSendPhotosMedia: true,
    autoSendVideos: true,
    autoSendFilesData: true,
    payloadFormat: 'JSON_FULL',
    logs: [],
  };

  const [viewMode, setViewMode] = useState<'sistem-otomatis' | 'manual-webhook'>('sistem-otomatis');
  const [targetUrl, setTargetUrl] = useState<string>(currentBridge.targetWebsiteUrl || '');
  const [bridgeName, setBridgeName] = useState<string>(currentBridge.bridgeName || 'Website Tujuan Utama / Webhook Receiver');
  const [secretKey, setSecretKey] = useState<string>(currentBridge.secretKey || '');
  const [isEnabled, setIsEnabled] = useState<boolean>(currentBridge.isEnabled ?? true);
  
  // Auto-sync toggles
  const [autoPayment, setAutoPayment] = useState<boolean>(currentBridge.autoSendPaymentProof ?? true);
  const [autoPhotos, setAutoPhotos] = useState<boolean>(currentBridge.autoSendPhotosMedia ?? true);
  const [autoVideos, setAutoVideos] = useState<boolean>(currentBridge.autoSendVideos ?? true);
  const [autoFiles, setAutoFiles] = useState<boolean>(currentBridge.autoSendFilesData ?? true);

  // Status & testing states
  const [isConnected, setIsConnected] = useState<boolean>(currentBridge.isConnected ?? false);
  const [pingStatus, setPingStatus] = useState<'IDLE' | 'ONLINE' | 'OFFLINE'>(currentBridge.lastPingStatus || 'IDLE');
  const [pingLatency, setPingLatency] = useState<number | undefined>(currentBridge.lastPingLatency);
  const [lastConnectedAt, setLastConnectedAt] = useState<string | undefined>(currentBridge.lastConnectedAt);

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; httpStatus?: number } | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Transmission tab
  const [activeConsoleTab, setActiveConsoleTab] = useState<'foto' | 'video' | 'bukti' | 'file' | 'custom'>('bukti');

  // Logs state
  const [logs, setLogs] = useState<WebsiteBridgeLog[]>(currentBridge.logs || []);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Manual Dispatch States
  // 1. Photo Dispatch
  const [photoTitle, setPhotoTitle] = useState<string>('Banner Turnamen Hunters Community');
  const [photoUrl, setPhotoUrl] = useState<string>(siteConfig.websiteIdentity?.bannerBgUrl || siteConfig.qrisImageUrl || '');
  const [photoBase64, setPhotoBase64] = useState<string>('');

  // 2. Video Dispatch
  const [videoTitle, setVideoTitle] = useState<string>('Highlight Grand Final Match Free Fire');
  const [videoUrl, setVideoUrl] = useState<string>('https://youtu.be/kJQP7kiw5Fk');
  const [videoNotes, setVideoNotes] = useState<string>('Rekaman cuplikan kemenangan squad final');

  // 3. Payment Proof Dispatch
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);
  const [customPayerName, setCustomPayerName] = useState<string>('Kapten Tim Aura Esports');
  const [customPayerPhone, setCustomPayerPhone] = useState<string>('081234567890');
  const [customAmount, setCustomAmount] = useState<number>(50000);
  const [customPaymentType, setCustomPaymentType] = useState<string>('Biaya Pendaftaran Slot FF');
  const [paymentProofImage, setPaymentProofImage] = useState<string>(siteConfig.qrisImageUrl || '');

  // 4. File Dispatch
  const [selectedFileType, setSelectedFileType] = useState<'TEAMS_JSON' | 'FULL_BACKUP' | 'CUSTOM_FILE'>('TEAMS_JSON');
  const [customFileName, setCustomFileName] = useState<string>('data_turnamen_esports.json');
  const [customFileContent, setCustomFileContent] = useState<string>('');

  // 5. Custom Payload Dispatch
  const [customJsonPayload, setCustomJsonPayload] = useState<string>(
    JSON.stringify({
      message: 'Halo dari Hunters Community Hub!',
      tournament: 'FF & MLBB Season 2026',
      totalTeams: registeredTeams.length,
      timestamp: new Date().toISOString()
    }, null, 2)
  );

  // Sending indicator
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Load logs on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const serverLogs = await fetchBridgeLogs();
      if (serverLogs && serverLogs.length > 0) {
        setLogs(serverLogs);
      }
    } catch (e) {
      console.warn('Failed to load bridge logs', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Test Connection / Handshake
  const handleTestConnection = async () => {
    if (!targetUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Website Tujuan terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testTargetWebsiteConnection(targetUrl, secretKey);
    setIsTesting(false);
    setTestResult({
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
      httpStatus: result.httpStatus,
    });

    if (result.success) {
      setIsConnected(true);
      setPingStatus('ONLINE');
      setPingLatency(result.latencyMs);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastConnectedAt(timeStr);

      // Auto update siteConfig
      if (setSiteConfig) {
        setSiteConfig((prev) => ({
          ...prev,
          bridgeConfig: {
            ...(prev.bridgeConfig || currentBridge),
            targetWebsiteUrl: targetUrl.trim(),
            bridgeName,
            secretKey,
            isEnabled,
            isConnected: true,
            lastPingStatus: 'ONLINE',
            lastPingLatency: result.latencyMs,
            lastConnectedAt: timeStr,
            autoSendPaymentProof: autoPayment,
            autoSendPhotosMedia: autoPhotos,
            autoSendVideos: autoVideos,
            autoSendFilesData: autoFiles,
          }
        }));
      }
    } else {
      setPingStatus('OFFLINE');
    }

    // Refresh logs
    loadLogs();
  };

  // Save Settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    const updatedBridgeConfig: WebsiteBridgeConfig = {
      isEnabled,
      targetWebsiteUrl: targetUrl.trim(),
      bridgeName: bridgeName.trim(),
      secretKey: secretKey.trim(),
      isConnected: isConnected && Boolean(targetUrl.trim()),
      lastConnectedAt,
      lastPingStatus: pingStatus,
      lastPingLatency: pingLatency,
      autoSendPaymentProof: autoPayment,
      autoSendPhotosMedia: autoPhotos,
      autoSendVideos: autoVideos,
      autoSendFilesData: autoFiles,
      payloadFormat: 'JSON_FULL',
      logs,
    };

    if (setSiteConfig) {
      setSiteConfig((prev) => ({
        ...prev,
        bridgeConfig: updatedBridgeConfig,
      }));
    }

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessMsg('Konfigurasi Website Bridge berhasil disimpan!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }, 400);
  };

  // Manual Photo Dispatch
  const handleSendPhoto = async () => {
    if (!targetUrl.trim()) {
      alert('Silakan masukkan URL Website Tujuan dan klik Hubungkan terlebih dahulu.');
      return;
    }
    setIsDispatching(true);
    setDispatchResult(null);

    const payload = {
      title: photoTitle,
      imageUrl: photoUrl,
      imageDataBase64: photoBase64 || undefined,
      uploadedAt: new Date().toISOString(),
      source: 'HUNTERS_COMMUNITY_MEDIA_GALLERY',
    };

    const res = await sendPayloadToDestinationWebsite({
      targetUrl,
      secretKey,
      type: 'FOTO_MEDIA',
      typeLabel: 'Pengiriman Foto & Media',
      itemName: photoTitle,
      fileType: 'image/jpeg',
      fileSize: photoBase64 ? `${Math.round(photoBase64.length / 1024)} KB` : 'URL Link',
      payload,
    });

    setIsDispatching(false);
    setDispatchResult({
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    loadLogs();
  };

  // Manual Video Dispatch
  const handleSendVideo = async () => {
    if (!targetUrl.trim()) {
      alert('Silakan masukkan URL Website Tujuan dan klik Hubungkan terlebih dahulu.');
      return;
    }
    setIsDispatching(true);
    setDispatchResult(null);

    const payload = {
      title: videoTitle,
      videoUrl: videoUrl,
      notes: videoNotes,
      platform: videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'YouTube' : 'Direct Streaming',
      uploadedAt: new Date().toISOString(),
    };

    const res = await sendPayloadToDestinationWebsite({
      targetUrl,
      secretKey,
      type: 'VIDEO',
      typeLabel: 'Pengiriman Video & Cuplikan',
      itemName: videoTitle,
      fileType: 'video/mp4',
      fileSize: 'Streaming Link',
      payload,
    });

    setIsDispatching(false);
    setDispatchResult({
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    loadLogs();
  };

  // Manual Payment Proof Dispatch
  const handleSendPaymentProof = async () => {
    if (!targetUrl.trim()) {
      alert('Silakan masukkan URL Website Tujuan dan klik Hubungkan terlebih dahulu.');
      return;
    }
    setIsDispatching(true);
    setDispatchResult(null);

    // Selected team or custom
    let payerInfo = {
      payerName: customPayerName,
      payerPhone: customPayerPhone,
      amount: customAmount,
      type: customPaymentType,
      proofImage: paymentProofImage,
      teamName: customPayerName,
      game: 'FF / MLBB',
      status: 'MENUNGGU_VERIFIKASI / SAH',
    };

    if (registeredTeams.length > 0 && selectedTeamIndex < registeredTeams.length) {
      const team = registeredTeams[selectedTeamIndex];
      payerInfo = {
        payerName: team.captainName || team.name,
        payerPhone: team.captainPhone || customPayerPhone,
        amount: team.game === 'FF' ? (siteConfig.paymentConfig?.feeFf || 50000) : (siteConfig.paymentConfig?.feeMlbb || 50000),
        type: `Pendaftaran Turnamen ${team.game}`,
        proofImage: team.paymentProof || paymentProofImage,
        teamName: team.name,
        game: team.game,
        status: team.status,
      };
    }

    const payload = {
      transactionId: 'TRX-BRIDGE-' + Date.now(),
      ...payerInfo,
      transmittedAt: new Date().toISOString(),
      sourceSystem: 'HUNTERS_COMMUNITY_PAYMENT_GATEWAY',
    };

    const res = await sendPayloadToDestinationWebsite({
      targetUrl,
      secretKey,
      type: 'BUKTI_PEMBAYARAN',
      typeLabel: 'Pengiriman Bukti Pembayaran / Transfer',
      itemName: `Bukti Bayar: ${payerInfo.teamName} (Rp ${payerInfo.amount.toLocaleString('id-ID')})`,
      fileType: 'image/payment-proof',
      fileSize: 'Structured Transaction + Media',
      payload,
    });

    setIsDispatching(false);
    setDispatchResult({
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    loadLogs();
  };

  // Manual File / Database Dispatch
  const handleSendFile = async () => {
    if (!targetUrl.trim()) {
      alert('Silakan masukkan URL Website Tujuan dan klik Hubungkan terlebih dahulu.');
      return;
    }
    setIsDispatching(true);
    setDispatchResult(null);

    let filePayload: any = {};
    let fileName = customFileName;

    if (selectedFileType === 'TEAMS_JSON') {
      fileName = `daftar_tim_terdaftar_${new Date().toISOString().split('T')[0]}.json`;
      filePayload = {
        totalTeams: registeredTeams.length,
        exportedAt: new Date().toISOString(),
        teams: registeredTeams,
      };
    } else if (selectedFileType === 'FULL_BACKUP') {
      fileName = `backup_hunters_community_full_${Date.now()}.json`;
      filePayload = {
        exportedAt: new Date().toISOString(),
        siteConfig,
        registeredTeams,
      };
    } else {
      try {
        filePayload = JSON.parse(customFileContent || '{}');
      } catch {
        filePayload = { content: customFileContent };
      }
    }

    const res = await sendPayloadToDestinationWebsite({
      targetUrl,
      secretKey,
      type: 'FILE_DATA',
      typeLabel: 'Pengiriman Berkas & Database',
      itemName: `File: ${fileName}`,
      fileType: 'application/json',
      fileSize: `${Math.round(JSON.stringify(filePayload).length / 1024)} KB`,
      payload: filePayload,
    });

    setIsDispatching(false);
    setDispatchResult({
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    loadLogs();
  };

  // Manual Custom JSON Dispatch
  const handleSendCustomJson = async () => {
    if (!targetUrl.trim()) {
      alert('Silakan masukkan URL Website Tujuan dan klik Hubungkan terlebih dahulu.');
      return;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(customJsonPayload);
    } catch (e: any) {
      alert('Format JSON tidak valid: ' + e.message);
      return;
    }

    setIsDispatching(true);
    setDispatchResult(null);

    const res = await sendPayloadToDestinationWebsite({
      targetUrl,
      secretKey,
      type: 'FILE_DATA',
      typeLabel: 'Pengiriman Custom Payload',
      itemName: 'Custom Payload JSON',
      fileType: 'application/json',
      fileSize: `${Math.round(customJsonPayload.length / 1024)} KB`,
      payload: parsed,
    });

    setIsDispatching(false);
    setDispatchResult({
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    loadLogs();
  };

  // Handle Image Upload for Photo Dispatch
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotoBase64(base64);
        setPhotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear all logs
  const handleClearLogs = async () => {
    if (window.confirm('Bersihkan semua riwayat log pengiriman?')) {
      await clearBackendBridgeLogs();
      setLogs([]);
    }
  };

  // 1 TB Centralized Cloud Storage Bridge Handlers
  const [isTesting1TB, setIsTesting1TB] = useState<boolean>(false);
  const [isUploading1TB, setIsUploading1TB] = useState<boolean>(false);
  const [result1TB, setResult1TB] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleTest1TBHandshake = async () => {
    setIsTesting1TB(true);
    setResult1TB(null);
    try {
      const res = await sendCentralizedHandshake();
      setIsTesting1TB(false);
      setResult1TB({
        success: true,
        message: 'Sinyal Handshake terkirim ke Server Penyimpanan Terpusat 1 TB!',
        data: res,
      });
      loadLogs();
    } catch (err: any) {
      setIsTesting1TB(false);
      setResult1TB({
        success: false,
        message: `Gagal Handshake 1 TB: ${err?.message || err}`,
      });
    }
  };

  const handleUploadSample1TB = async () => {
    setIsUploading1TB(true);
    setResult1TB(null);
    try {
      const res = await uploadToCentralizedStorage(
        {
          name: `sample-esports-archive-${Date.now()}.json`,
          size: JSON.stringify(registeredTeams).length || 2048,
          type: 'application/json',
        },
        {
          category: 'document',
          description: `Pengujian arsip data ${registeredTeams.length} tim pendaftar ke repositori 1 TB`,
        }
      );
      setIsUploading1TB(false);
      setResult1TB({
        success: true,
        message: 'Berkas berhasil diarsipkan ke Repositori Penyimpanan Terpusat 1 TB!',
        data: res,
      });
      loadLogs();
    } catch (err: any) {
      setIsUploading1TB(false);
      setResult1TB({
        success: false,
        message: `Gagal Arsip 1 TB: ${err?.message || err}`,
      });
    }
  };

  const handleApply1TBPreset = () => {
    setTargetUrl(CENTRALIZED_STORAGE_CONFIG.endpoint);
    setBridgeName('Penyimpanan Terpusat 1 TB (StorageBridge)');
    setSecretKey(CENTRALIZED_STORAGE_CONFIG.apiKey);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- ACCESS CONTROL: STRICTLY FOR ADMIN & SUPER ADMIN ---
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Locked Badge */}
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mb-6 shadow-lg shadow-red-950/50 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest mb-3">
              <Lock className="w-3.5 h-3.5" />
              AKSES KHUSUS ADMINISTRATOR
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              HUBUNGKAN KE WEBSITE LAIN
            </h1>
            <p className="text-sm text-neutral-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Modul integrasi webhook real-time, pengaturan target domain eksternal, kunci otorisasi API (Secret Key), dan sinkronisasi repositori 1 TB diproteksi secara ketat dan <b>hanya dapat diakses oleh Admin atau Super Admin</b> turnamen.
            </p>

            {/* Feature Security List */}
            <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  🔗
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Target Webhook & URL</div>
                  <div className="text-[11px] text-neutral-400">Konfigurasi endpoint bridge dan tes ping latensi.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  🔑
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Secret Key Otorisasi</div>
                  <div className="text-[11px] text-neutral-400">Token enkripsi data kirim & otentikasi server.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  ☁️
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Repositori Cloud 1 TB</div>
                  <div className="text-[11px] text-neutral-400">Penyimpanan terpusat StorageBridge media & bukti.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  📤
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Kirim Berkas & Media</div>
                  <div className="text-[11px] text-neutral-400">Transmisi data pendaftar & bukti transfer.</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {setActiveTab && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50 active:scale-95 transition-all"
                  >
                    <Key className="w-4 h-4" />
                    <span>Masuk ke Panel Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer border border-neutral-700 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white pb-20 pt-4 md:pt-6 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* --- TOP HERO HEADER --- */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-6 md:p-8 mb-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                INTEGRASI WEBSITE & PENGIRIMAN NYATA
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                AKSES ADMIN AKTIF
              </div>
              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Globe className="w-8 h-8 md:w-10 md:h-10 text-amber-400 shrink-0" />
              <span>HUBUNGKAN KE WEBSITE LAIN</span>
            </h1>
            <p className="mt-2 text-neutral-400 text-sm md:text-base max-w-3xl leading-relaxed">
              Cukup masukkan <b>URL Website Tujuan</b>. Sistem secara otomatis menghubungkan website ini dan melakukan <b>pengiriman data, foto, video, bukti transfer pembayaran, dan berkas secara nyata (Real HTTP Webhook Dispatch)</b> ke server target secara langsung.
            </p>
          </div>

          {/* Realtime Status Indicator Card */}
          <div className="shrink-0 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[240px] shadow-lg">
            <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center justify-between">
              <span>Status Koneksi</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected && pingStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected && pingStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                isConnected && pingStatus === 'ONLINE' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
              }`}>
                {isConnected && pingStatus === 'ONLINE' ? <Link className="w-5 h-5" /> : <Unlink className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-base font-extrabold">
                  {isConnected && pingStatus === 'ONLINE' ? 'TERHUBUNG & AKTIF' : 'BELUM TERHUBUNG'}
                </div>
                <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  {pingLatency !== undefined && (
                    <span className="text-emerald-400 font-mono font-semibold">{pingLatency} ms</span>
                  )}
                  <span>•</span>
                  <span className="truncate max-w-[140px]">{targetUrl ? new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).hostname : 'URL Kosong'}</span>
                </div>
              </div>
            </div>

            {lastConnectedAt && (
              <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Terakhir terhubung: {lastConnectedAt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- NOTIFICATION BANNERS --- */}
      {saveSuccessMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* --- MODE NAVIGATION BAR: AUTO DISPATCH VS MANUAL WEBHOOK --- */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setViewMode('sistem-otomatis')}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            viewMode === 'sistem-otomatis'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-neutral-950 shadow-lg shadow-amber-500/20'
              : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>SISTEM SAMBUNGAN & PENGIRIMAN OTOMATIS</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
            viewMode === 'sistem-otomatis' ? 'bg-black/20 text-neutral-950' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            Kunci Sah & Fan-out
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('manual-webhook')}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            viewMode === 'manual-webhook'
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0" />
          <span>KONSOL MANUAL & WEBHOOK DISPATCHER</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
            viewMode === 'manual-webhook' ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
          }`}>
            Direct URL
          </span>
        </button>
      </div>

      {viewMode === 'sistem-otomatis' ? (
        <AdminAutoDispatchBridgeManager
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
          registeredTeams={registeredTeams}
          isAdmin={isAdmin}
        />
      ) : (
        <>
      {testResult && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-4 animate-fadeIn ${
          testResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
            <div>
              <div className="text-sm font-bold">{testResult.message}</div>
              {testResult.latencyMs !== undefined && (
                <div className="text-xs opacity-80 mt-0.5 font-mono">
                  Waktu respon HTTP: {testResult.latencyMs} ms {testResult.httpStatus ? `(Status: ${testResult.httpStatus})` : ''}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setTestResult(null)}
            className="text-xs underline cursor-pointer hover:opacity-80 shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* --- GRID 2 KOLOM: KONFIGURASI URL & AUTO-SYNC --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* KOLOM KIRI: FORMULIR INPUT URL & HANDSHAKE (7 Kolom) */}
        <div className="lg:col-span-7 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 sm:p-7 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Pengaturan URL Website Tujuan</span>
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-neutral-400 cursor-pointer flex items-center gap-2">
                  <span>Aktifkan Bridge</span>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Input URL Tujuan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  URL Website Tujuan (Webhook / Receiver Endpoint) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="input-bridge-target-url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://website-tujuan.com/api/sync atau https://webhook.site/..."
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Mendukung endpoint REST API, Webhook (Discord/Slack/Zapier), server custom Express/PHP/Django, atau portal turnamen mitra.
                </p>
              </div>

              {/* Input Nama Koneksi / Bridge Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Nama Label Koneksi (Opsional)
                </label>
                <input
                  type="text"
                  value={bridgeName}
                  onChange={(e) => setBridgeName(e.target.value)}
                  placeholder="Website Server Cabang #1"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Input Kunci Rahasia / Bearer Token */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Kunci Rahasia / Token Otorisasi API (Opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Bearer token / API Secret Key pengirim..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Jika diisi, request akan menyertakan header <code>Authorization: Bearer [token]</code> dan <code>X-Bridge-Key: [token]</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              id="btn-test-bridge-connection"
              onClick={handleTestConnection}
              disabled={isTesting || !targetUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Hubungkan Otomatis & Uji Koneksi'}</span>
            </button>

            <button
              type="button"
              id="btn-save-bridge-settings"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer border border-neutral-700 transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: ATURAN PENGIRIMAN OTOMATIS (5 Kolom) */}
        <div className="lg:col-span-5 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 sm:p-7 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Opsi Pengiriman Otomatis (Auto-Sync)</span>
            </h2>
            <p className="text-xs text-neutral-400 mb-5">
              Ketika terhubung, website ini akan mengirimkan data secara otomatis ke website tujuan saat terjadi aktivitas:
            </p>

            <div className="space-y-3.5">
              {/* 1. Bukti Pembayaran */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Bukti Pembayaran & Transfer</div>
                    <div className="text-[11px] text-neutral-400">Pendaftaran FF/MLBB, Topup Saldo & Donasi</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPayment}
                  onChange={(e) => setAutoPayment(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 2. Foto & Media */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Foto, Banner & Media</div>
                    <div className="text-[11px] text-neutral-400">Upload banner turnamen, foto tim, & dokumentasi</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPhotos}
                  onChange={(e) => setAutoPhotos(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 3. Video Match */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Video & Cuplikan Pertandingan</div>
                    <div className="text-[11px] text-neutral-400">Rekaman live match, highlight & panduan</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoVideos}
                  onChange={(e) => setAutoVideos(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 4. Berkas & Database */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">File Data & Backup Database</div>
                    <div className="text-[11px] text-neutral-400">Data pendaftaran tim, laporan & backup JSON</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoFiles}
                  onChange={(e) => setAutoFiles(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Pengiriman dilakukan secara nyata melalui HTTP POST langsung ke URL tujuan tanpa perantara pihak ketiga.</span>
          </div>
        </div>
      </div>

      {/* --- INTEGRASI PENYIMPANAN TERPUSAT 1 TB (STORAGE BRIDGE) --- */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-neutral-900/90 to-neutral-900/80 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2.5">
              <Server className="w-3.5 h-3.5" />
              PENYIMPANAN TERPUSAT 1 TB AKTIF
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>Repositori Penyimpanan Terpusat 1 TB (StorageBridge)</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-3xl leading-relaxed">
              Skrip sinkronisasi <code>window.StorageBridge</code> telah terpasang di seluruh sistem. Setiap berkas, foto bukti transfer, dan pendaftaran otomatis terhubung ke repositori terpusat <span className="font-mono text-cyan-300 font-semibold">{CENTRALIZED_STORAGE_CONFIG.sourceDomain}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleApply1TBPreset}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              title="Salin URL & API Key 1 TB ke formulir bridge di atas"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Gunakan Sebagai URL Tujuan</span>
            </button>

            <button
              type="button"
              onClick={handleTest1TBHandshake}
              disabled={isTesting1TB}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting1TB ? 'animate-spin' : ''}`} />
              <span>{isTesting1TB ? 'Mengirim Sinyal...' : 'Kirim Sinyal Handshake 1 TB'}</span>
            </button>

            <button
              type="button"
              onClick={handleUploadSample1TB}
              disabled={isUploading1TB}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className={`w-3.5 h-3.5 ${isUploading1TB ? 'animate-bounce' : ''}`} />
              <span>{isUploading1TB ? 'Mengunggah...' : 'Uji Arsip 1 TB'}</span>
            </button>
          </div>
        </div>

        {/* 1 TB Info & Parameter Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <div className="text-neutral-500 font-semibold text-[11px] uppercase tracking-wider mb-1">Target Endpoint</div>
            <div className="font-mono text-cyan-400 truncate text-[11px]" title={CENTRALIZED_STORAGE_CONFIG.endpoint}>
              {CENTRALIZED_STORAGE_CONFIG.endpoint}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <div className="text-neutral-500 font-semibold text-[11px] uppercase tracking-wider mb-1">API Key Terotorisasi</div>
            <div className="font-mono text-amber-400 truncate text-[11px]">
              {CENTRALIZED_STORAGE_CONFIG.apiKey.slice(0, 8)}••••••••••
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <div className="text-neutral-500 font-semibold text-[11px] uppercase tracking-wider mb-1">Domain Asal / Source Name</div>
            <div className="font-medium text-white truncate text-[11px]">
              {CENTRALIZED_STORAGE_CONFIG.sourceName}
            </div>
          </div>
        </div>

        {/* 1 TB Test Result Notification */}
        {result1TB && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between gap-4 animate-fadeIn ${
            result1TB.success 
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {result1TB.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-cyan-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
              <div className="text-xs sm:text-sm font-bold">{result1TB.message}</div>
            </div>
            <button 
              onClick={() => setResult1TB(null)}
              className="text-xs underline cursor-pointer hover:opacity-80 shrink-0"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* --- KONSOL PENGIRIMAN NYATA (REAL LIVE TRANSMISSION CONSOLE) --- */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl backdrop-blur-md">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Send className="w-6 h-6 text-amber-400" />
              <span>KONSOL PENGIRIMAN NYATA KE WEBSITE TUJUAN</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Pilih jenis konten di bawah untuk mengirim data langsung ke URL: <span className="text-amber-400 font-mono">{targetUrl || '(URL Belum Diatur)'}</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button
              onClick={() => { setActiveConsoleTab('bukti'); setDispatchResult(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'bukti' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bukti Pembayaran</span>
            </button>

            <button
              onClick={() => { setActiveConsoleTab('foto'); setDispatchResult(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'foto' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto & Media</span>
            </button>

            <button
              onClick={() => { setActiveConsoleTab('video'); setDispatchResult(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'video' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>

            <button
              onClick={() => { setActiveConsoleTab('file'); setDispatchResult(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'file' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Data</span>
            </button>

            <button
              onClick={() => { setActiveConsoleTab('custom'); setDispatchResult(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'custom' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Custom JSON</span>
            </button>
          </div>
        </div>

        {/* Transmission Notification Feedback */}
        {dispatchResult && (
          <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between gap-4 animate-fadeIn ${
            dispatchResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {dispatchResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
              <div>
                <div className="text-sm font-bold">{dispatchResult.message}</div>
                {dispatchResult.latencyMs !== undefined && (
                  <div className="text-xs opacity-80 mt-0.5 font-mono">
                    Latensi pengiriman: {dispatchResult.latencyMs} ms
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setDispatchResult(null)}
              className="text-xs underline cursor-pointer hover:opacity-80 shrink-0"
            >
              Tutup
            </button>
          </div>
        )}

        {/* TAB 1: KIRIM BUKTI PEMBAYARAN */}
        {activeConsoleTab === 'bukti' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Pilih Bukti Pembayaran untuk Dikirimkan</span>
              </h3>

              {registeredTeams.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Pilih Dari Tim Terdaftar ({registeredTeams.length} Tim):
                  </label>
                  <select
                    value={selectedTeamIndex}
                    onChange={(e) => setSelectedTeamIndex(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {registeredTeams.map((team, idx) => (
                      <option key={team.id || idx} value={idx}>
                        [{team.game}] {team.name} — Kapten: {team.captainName || '-'} ({team.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                  Belum ada tim terdaftar. Anda dapat memasukkan data bukti transfer secara manual di bawah ini.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Pengirim / Tim</label>
                  <input
                    type="text"
                    value={customPayerName}
                    onChange={(e) => setCustomPayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nomor WhatsApp Pengirim</label>
                  <input
                    type="text"
                    value={customPayerPhone}
                    onChange={(e) => setCustomPayerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Jenis Transaksi</label>
                  <input
                    type="text"
                    value={customPaymentType}
                    onChange={(e) => setCustomPaymentType(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL / Gambar Bukti Transfer</label>
                <input
                  type="text"
                  value={paymentProofImage}
                  onChange={(e) => setPaymentProofImage(e.target.value)}
                  placeholder="https://... atau gambar bukti transfer"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-dispatch-payment-proof"
                  onClick={handleSendPaymentProof}
                  disabled={isDispatching || !targetUrl.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                  <span>{isDispatching ? 'Mengirimkan Bukti Pembayaran...' : 'Kirim Bukti Pembayaran ke Website Tujuan Secara Nyata'}</span>
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-neutral-400 mb-3 flex items-center justify-between">
                  <span>Pratinjau Bukti Pembayaran</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px]">PAYLOAD JSON + IMAGE</span>
                </div>

                <div className="aspect-video w-full rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center mb-4 relative">
                  {paymentProofImage ? (
                    <img src={paymentProofImage} alt="Bukti Transfer" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4 text-neutral-500 text-xs flex flex-col items-center gap-2">
                      <CreditCard className="w-8 h-8 opacity-40" />
                      <span>Belum ada gambar bukti transfer</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Pengirim:</span>
                    <span className="font-bold text-white">{registeredTeams[selectedTeamIndex]?.name || customPayerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Nominal:</span>
                    <span className="font-bold text-emerald-400">Rp {customAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Target Web:</span>
                    <span className="font-mono text-neutral-300 truncate max-w-[160px]">{targetUrl || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KIRIM FOTO & MEDIA */}
        {activeConsoleTab === 'foto' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Kirim Foto, Banner, atau Gambar Dokumentasi</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Judul / Keterangan Foto</label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Misal: Banner Resmi Turnamen Free Fire 2026"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL Gambar atau Unggah Berkas</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => { setPhotoUrl(e.target.value); setPhotoBase64(''); }}
                  placeholder="https://images.unsplash.com/... atau URL gambar"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:border-amber-500 font-mono mb-2"
                />

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-700 cursor-pointer flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilih Foto Dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {photoBase64 && (
                    <span className="text-xs text-emerald-400 font-semibold">✓ Foto berhasil dimuat dari lokal ({Math.round(photoBase64.length / 1024)} KB)</span>
                  )}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  id="btn-dispatch-photo"
                  onClick={handleSendPhoto}
                  disabled={isDispatching || !targetUrl.trim() || (!photoUrl && !photoBase64)}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                  <span>{isDispatching ? 'Mengirimkan Foto...' : 'Kirim Foto ke Website Tujuan Sekarang'}</span>
                </button>
              </div>
            </div>

            {/* Preview Foto */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-neutral-400 mb-3">Pratinjau Foto Media</div>
                <div className="aspect-video w-full rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center mb-3">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-neutral-500 text-xs flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span>Belum ada foto yang dipilih</span>
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-white truncate">{photoTitle}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KIRIM VIDEO */}
        {activeConsoleTab === 'video' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Kirim Video atau Cuplikan Rekaman Pertandingan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Judul Video / Match</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Misal: Highlight Grand Final MLBB Match 3"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL Video (YouTube / MP4 / Cloud Storage)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/kJQP7kiw5Fk atau https://.../match.mp4"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Catatan / Deskripsi Video</label>
                <textarea
                  value={videoNotes}
                  onChange={(e) => setVideoNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-dispatch-video"
                  onClick={handleSendVideo}
                  disabled={isDispatching || !targetUrl.trim() || !videoUrl.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                  <span>{isDispatching ? 'Mengirimkan Video...' : 'Kirim Video ke Website Tujuan Sekarang'}</span>
                </button>
              </div>
            </div>

            {/* Preview Video */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-neutral-400 mb-3">Informasi Payload Video</div>
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                  <div className="text-amber-400 font-bold text-sm">{videoTitle}</div>
                  <div className="text-neutral-400 truncate">{videoUrl}</div>
                  <div className="text-neutral-300 italic pt-2 border-t border-neutral-800">{videoNotes}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KIRIM FILE & DATABASE */}
        {activeConsoleTab === 'file' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Kirim Berkas JSON & Database Sistem</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Pilih Berkas Sistem:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFileType('TEAMS_JSON')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedFileType === 'TEAMS_JSON'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Daftar Tim Terdaftar</div>
                    <div className="text-[10px] opacity-75">{registeredTeams.length} Data Tim</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFileType('FULL_BACKUP')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedFileType === 'FULL_BACKUP'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Backup Database Full</div>
                    <div className="text-[10px] opacity-75">Seluruh Config & Tim</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFileType('CUSTOM_FILE')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedFileType === 'CUSTOM_FILE'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold">File Kustom</div>
                    <div className="text-[10px] opacity-75">Tulis / Upload File</div>
                  </button>
                </div>
              </div>

              {selectedFileType === 'CUSTOM_FILE' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama File</label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs font-mono mb-2"
                  />
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Isi Berkas / Konten</label>
                  <textarea
                    value={customFileContent}
                    onChange={(e) => setCustomFileContent(e.target.value)}
                    rows={4}
                    placeholder="Tulis isi file teks atau JSON..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs font-mono resize-none"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-dispatch-file"
                  onClick={handleSendFile}
                  disabled={isDispatching || !targetUrl.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                  <span>{isDispatching ? 'Mengirimkan Berkas...' : 'Kirim Berkas File ke Website Tujuan Sekarang'}</span>
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-neutral-400 mb-3">Ringkasan Payload Berkas</div>
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Tipe:</span>
                    <span className="font-bold text-white">{selectedFileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Ukuran Estimasi:</span>
                    <span className="font-mono text-amber-400">
                      {selectedFileType === 'TEAMS_JSON' 
                        ? `${Math.round(JSON.stringify(registeredTeams).length / 1024)} KB` 
                        : `${Math.round(JSON.stringify(siteConfig).length / 1024)} KB`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM JSON PAYLOAD */}
        {activeConsoleTab === 'custom' && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span>Editor Payload JSON Kustom</span>
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Format: application/json</span>
            </div>

            <textarea
              value={customJsonPayload}
              onChange={(e) => setCustomJsonPayload(e.target.value)}
              rows={8}
              className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
            />

            <button
              type="button"
              id="btn-dispatch-custom-json"
              onClick={handleSendCustomJson}
              disabled={isDispatching || !targetUrl.trim()}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
              <span>{isDispatching ? 'Mengirimkan Payload...' : 'Kirim Custom JSON ke Website Tujuan'}</span>
            </button>
          </div>
        )}
      </div>

      {/* --- TABEL LOG PENGIRIMAN & TRANSMISI REAL-TIME --- */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>RIWAYAT PENGIRIMAN & TRANSMISI REAL-TIME ({logs.length})</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Catatan riwayat status pengiriman data, latency respon HTTP, dan verifikasi endpoint target.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLogs}
              disabled={isLoadingLogs}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-xs font-bold text-rose-400 border border-neutral-700 hover:border-rose-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
            <Server className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <div className="text-sm font-bold text-neutral-400">Belum ada riwayat pengiriman</div>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Gunakan konsol pengiriman di atas atau aktifkan opsi Auto-Sync untuk mulai mengirim data secara nyata ke website tujuan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kategori / Item</th>
                  <th className="py-3 px-4">Target Website</th>
                  <th className="py-3 px-4">Status & Respon</th>
                  <th className="py-3 px-4">Latensi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {logs.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {item.type === 'BUKTI_PEMBAYARAN' && <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {item.type === 'FOTO_MEDIA' && <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        {item.type === 'VIDEO' && <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {item.type === 'FILE_DATA' && <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        {item.type === 'TEST_CONNECTION' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="truncate max-w-[200px]">{item.itemName}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{item.typeLabel}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300 text-[11px] max-w-[180px] truncate">
                      {item.targetUrl}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'BERHASIL'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status === 'BERHASIL' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{item.responseMessage || item.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {item.latencyMs !== undefined ? `${item.latencyMs} ms` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(item, null, 2), idx)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        title="Salin Data Log"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

    </div>
  );
};
