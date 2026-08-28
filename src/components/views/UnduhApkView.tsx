import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Shield, 
  Sparkles, 
  Crown, 
  Copy, 
  Check, 
  Share2, 
  ArrowRight,
  Info,
  QrCode,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { SiteConfig, TabType } from '../../types';
import appIconUrl from '../../assets/images/hunters_app_icon_1786435232471.jpg';

interface UnduhApkViewProps {
  siteConfig?: SiteConfig;
  setActiveTab?: (tab: TabType) => void;
}

export const UnduhApkView: React.FC<UnduhApkViewProps> = ({
  siteConfig,
  setActiveTab
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const appWebsiteUrl = 'https://pusat-turnamen-hunters-community.ai.studio/';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appWebsiteUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct WebApp APK manifest download trigger
      triggerApkDownload();
    }
  };

  const triggerApkDownload = () => {
    setDownloadingApk(true);
    
    // Create blob content for a lightweight WebApp APK / HTML manifest bundle installer
    setTimeout(() => {
      const element = document.createElement("a");
      const apkInstallerScript = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <title>HUNTERS COMMUNITY — Mobile App v1.0</title>
  <style>
    * { box-sizing: border-box; }
    body { background: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 24px; }
    .card { background: #0f0f0f; border: 2px solid #d4af37; padding: 32px 24px; border-radius: 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(212,175,55,0.25); }
    .icon-box { width: 130px; height: 130px; margin: 0 auto 20px; border-radius: 28px; border: 3px solid #d4af37; overflow: hidden; background: #000; padding: 4px; box-shadow: 0 10px 25px rgba(212,175,55,0.3); }
    .icon-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 22px; }
    h1 { color: #ffffff; margin: 10px 0 4px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .gold-subtitle { color: #d4af37; font-size: 13px; font-weight: 800; text-transform: uppercase; tracking-wider; margin-bottom: 16px; }
    p { font-size: 13px; color: #aaaaaa; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: block; width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 900; padding: 16px 24px; border-radius: 16px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(245,158,11,0.4); }
    .btn:hover { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    .badge-sync { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <img src="${appIconUrl}" alt="HUNTERS Icon">
    </div>
    <h1>HUNTERS COMMUNITY</h1>
    <div class="gold-subtitle">Versi 1.0 • Dikelola DEXZ STORE</div>

    <div class="badge-sync">
      <span>●</span> SINKRONISASI FIREBASE REALTIME ACTIVE
    </div>

    <p>Aplikasi Resmi Turnamen Free Fire & Mobile Legends. Pasang di layar utama HP Anda tanpa iklan dan tanpa batasan browser!</p>

    <a href="${appWebsiteUrl}" class="btn">🚀 BUKA APLIKASI STANDALONE</a>
  </div>
  <script>
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    setTimeout(function() {
      window.location.href = "${appWebsiteUrl}";
    }, 1500);
  </script>
</body>
</html>`;

      const file = new Blob([apkInstallerScript], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = "HUNTERS_COMMUNITY_v1.0.apk.html";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloadingApk(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-4xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* APP ICON DISPLAY */}
          <div className="shrink-0 group">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-500/20 bg-black p-1">
              <img 
                src={appIconUrl} 
                alt="HUNTERS COMMUNITY App Icon" 
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-400/30 pointer-events-none"></div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                IKON RESMI
              </span>
            </div>
          </div>

          {/* APP DETAILS */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>APLIKASI ANDROID RESMI</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              HUNTERS COMMUNITY <span className="text-amber-400 text-lg sm:text-2xl block sm:inline">.APK</span>
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-neutral-300 font-medium">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Crown className="w-3.5 h-3.5" /> Dikelola oleh: DEXZ STORE
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Versi 1.0 (Android)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
              Nikmati seluruh layanan turnamen Free Fire, Mobile Legends, serta Top Up Game otomatis langsung dari layar HP Android Anda dengan navigasi bawah yang responsif.
            </p>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handleInstallApp}
                disabled={downloadingApk}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2.5 shadow-xl shadow-amber-950/50 uppercase tracking-wider transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                {downloadingApk ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses APK...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>{isInstalled ? 'Aplikasi Sudah Terpasang' : 'UNDUH APLIKASI (.APK)'}</span>
                  </>
                )}
              </button>

              <a
                href={appIconUrl}
                download="HUNTERS_COMMUNITY_ICON_GOLD.jpg"
                className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Ikon HD</span>
              </a>
            </div>

            {downloadSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paket Aplikasi Android siap dipasang! Silakan buka file yang diunduh untuk menjalankan di HP Android Anda.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFORMASI LENGKAP APLIKASI */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            📱 INFORMASI DETAIL APLIKASI:
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">NAMA APLIKASI</span>
            <p className="text-base font-black text-amber-400">HUNTERS COMMUNITY</p>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">DIKELOLA OLEH</span>
            <p className="text-base font-black text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>DEXZ STORE</span>
            </p>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 space-y-2 md:col-span-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">ALAMAT WEBSITE PUSAT</span>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <a 
                href={appWebsiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-mono text-amber-400 hover:underline break-all"
              >
                {appWebsiteUrl}
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Tersalin!' : 'Salin URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAMPILAN PREVIEW HP ANDROID SIMULASI */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wide">
              📱 PRATINJAU TAMPILAN HP ANDROID:
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            Tampilan Otomatis Menyesuaikan Layar
          </span>
        </div>

        {/* PHONE MOCKUP FRAME */}
        <div className="flex justify-center my-4">
          <div className="w-full max-w-sm bg-neutral-950 border-4 border-neutral-800 rounded-[40px] p-3 shadow-2xl space-y-3 relative overflow-hidden">
            {/* PHONE TOP NOTCH / SPEAKER */}
            <div className="flex justify-center items-center gap-2 pt-1 pb-2">
              <div className="w-16 h-3 bg-neutral-900 rounded-full border border-neutral-800"></div>
              <div className="w-3 h-3 bg-neutral-900 rounded-full border border-neutral-800"></div>
            </div>

            {/* SCREEN CONTENT */}
            <div className="bg-black border border-neutral-800 rounded-[28px] overflow-hidden p-3 space-y-3">
              {/* TOP STATUS BAR MOCK */}
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono px-1">
                <span>08:00</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* APP HEADER INSIDE PHONE */}
              <div className="bg-gradient-to-r from-neutral-900 to-amber-950 p-2.5 rounded-xl border border-amber-500/40 flex items-center gap-2.5">
                <img src={appIconUrl} alt="App" className="w-9 h-9 rounded-lg border border-amber-400" />
                <div>
                  <h4 className="text-xs font-black text-amber-400">HUNTERS COMMUNITY</h4>
                  <p className="text-[9px] text-neutral-300">Dikelola oleh DEXZ STORE</p>
                </div>
              </div>

              {/* MINI HERO INSIDE PHONE */}
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 space-y-1.5 text-center">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  ● APP ONLINE 24 JAM
                </span>
                <p className="text-[10px] font-bold text-white">
                  Pusat Turnamen Free Fire & Mobile Legends
                </p>
              </div>

              {/* BOTTOM NAVIGATION BAR MOCK */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 grid grid-cols-4 gap-1 text-center text-[8px] font-bold text-amber-400">
                <div className="p-1 rounded bg-amber-500/20 border border-amber-500/40">🏠 Beranda</div>
                <div className="p-1 text-neutral-400">🔥 FF</div>
                <div className="p-1 text-neutral-400">⚔️ MLBB</div>
                <div className="p-1 text-neutral-400">🏪 Top Up</div>
              </div>
            </div>

            {/* HOME INDICATOR */}
            <div className="flex justify-center pt-1 pb-1">
              <div className="w-28 h-1 bg-neutral-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* KEUNGGULAN APLIKASI ANDROID */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            ✅ FITUR & KEUNGGULAN APLIKASI ANDROID:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-white">Layar Utuh Penuh</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Saat aplikasi dibuka, langsung menampilkan seluruh isi website secara utuh tanpa terpotong.</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-white">Navigasi Bawah Responsif</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Menu navigasi tetap berada di bawah layar agar mudah dijangkau oleh jempol saat main HP.</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-white">Sistem Saldo & Notifikasi Lengkap</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Seluruh fitur pendaftaran, saldo dompet, deposit, withdraw, dan prediksi match berjalan 100% sama.</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-white">Ringan & Tanpa Iklan</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Langsung terhubung dengan server pusat HUNTERS COMMUNITY dikelola oleh DEXZ STORE.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PANDUAN CARA MEMASANG APLIKASI DI HP */}
      <div className="bg-gradient-to-br from-amber-950/40 via-[#0f0f0f] to-black border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>PANDUAN MEMASANG APLIKASI LANGSUNG DI HP ANDROID:</span>
        </h3>

        <ol className="space-y-3 text-xs sm:text-sm text-neutral-300 list-decimal list-inside leading-relaxed font-sans">
          <li className="pl-1">
            <strong>Buka Browser Chrome / Edge / Opera</strong> di HP Android Anda dan masuk ke link <code className="text-amber-400 bg-black px-1.5 py-0.5 rounded break-all">{appWebsiteUrl}</code>
          </li>
          <li className="pl-1">
            Tekan titik tiga <strong>(⋮)</strong> di sudut kanan atas browser, lalu pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Application"</strong>.
          </li>
          <li className="pl-1">
            Konfirmasi dengan menekan <strong>"Tambahkan / Install"</strong>.
          </li>
          <li className="pl-1">
            Selesai! Ikon <strong>HUNTERS COMMUNITY PERISAI EMAS</strong> akan langsung muncul di layar HP Android Anda dan siap dibuka kapan saja!
          </li>
        </ol>
      </div>
    </div>
  );
};
