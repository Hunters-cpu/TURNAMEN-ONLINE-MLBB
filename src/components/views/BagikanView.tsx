import React, { useState, useEffect } from 'react';
import { 
  Share2, Copy, Check, MessageCircle, Globe, QrCode as QrIcon, 
  Sparkles, Send, ExternalLink, Edit3, Download, FileSpreadsheet, FileText, 
  ShieldAlert, Calendar, Swords, Trophy, Lock
} from 'lucide-react';
import QRCode from 'qrcode';
import { SiteConfig, TabType, RegisteredTeam, MatchSchedule, UserWallet } from '../../types';

interface BagikanViewProps {
  siteConfig: SiteConfig;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
  registeredTeams?: RegisteredTeam[];
  allWallets?: Record<string, UserWallet>;
}

export const BagikanView: React.FC<BagikanViewProps> = ({
  siteConfig,
  setActiveTab,
  isAdmin = false,
  registeredTeams = [],
  allWallets = {}
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSchedule, setCopiedSchedule] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Match Schedule & QR Code state
  const matchSchedules: MatchSchedule[] = siteConfig.matchSchedules || [];
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matchSchedules[0]?.id || 'match-demo');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const currentMatch = matchSchedules.find(m => m.id === selectedMatchId) || matchSchedules[0] || {
    id: 'demo-1',
    game: 'FF',
    phase: 'Babak Penyisihan',
    matchNumber: 1,
    day: 'Selasa',
    date: '2 September 2026',
    time: '13:00 WIB',
    teamA: 'Tim HUNTERS',
    teamB: 'Tim DEXZ',
    winner: 'Tim HUNTERS',
    roomCode: '001',
    roomPass: '8899',
    status: 'selesai'
  };

  // Sample or actual formatted schedule & result
  const formattedScheduleText = 
`⚔️ PERTANDINGAN — ${currentMatch.phase.toUpperCase()}
📅 ${currentMatch.day}, ${currentMatch.date}
⏰ ${currentMatch.time}
🏆 ${currentMatch.teamA || 'Tim A'} VS ${currentMatch.teamB || 'Tim B'}
📍 Ruang: ${currentMatch.roomCode || '001'} 🔑 Kode: ${currentMatch.roomCode || '123456'} 🔒 Sandi: ${currentMatch.roomPass || '8899'}`;

  const formattedResultText = 
`✅ HASIL — TERKONFIRMASI
🏆 Pemenang: ${currentMatch.winner || currentMatch.teamA || 'Tim HUNTERS'} 💀 Gugur: ${currentMatch.winner === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA}
📅 ${currentMatch.date} 📸 Bukti diverifikasi Admin`;

  // Generate QR Code for the match
  useEffect(() => {
    const qrContent = 
`[JADWAL PERTANDINGAN HUNTERS COMMUNITY]
Game: ${currentMatch.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}
Babak: ${currentMatch.phase}
Waktu: ${currentMatch.day}, ${currentMatch.date} jam ${currentMatch.time}
Match: ${currentMatch.teamA} VS ${currentMatch.teamB}
No Ruang: ${currentMatch.roomCode || '001'} | Sandi: ${currentMatch.roomPass || '8899'}`;

    QRCode.toDataURL(qrContent, { margin: 2, width: 220 })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [currentMatch]);

  const handleCopyScheduleText = () => {
    navigator.clipboard.writeText(`${formattedScheduleText}\n\n${formattedResultText}`);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2500);
  };

  const handleCopyResultText = () => {
    navigator.clipboard.writeText(formattedResultText);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2500);
  };

  // EXCEL / CSV Export for Admin
  const handleExportExcel = () => {
    if (!registeredTeams || registeredTeams.length === 0) {
      alert('Belum ada data tim terdaftar untuk diunduh.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No,Nama Tim,Kapten,WhatsApp,Tanggal Daftar,Status,Saldo,Catatan\n';

    registeredTeams.forEach((team, idx) => {
      const cleanPhone = team.captainPhone.replace(/[^0-9]/g, '');
      const userKey = `phone_${cleanPhone}`;
      const userWallet = allWallets[userKey];
      const balance = userWallet ? userWallet.balance : 0;
      const notes = team.paymentNotes ? team.paymentNotes.replace(/,/g, ' ') : '-';

      csvContent += `${idx + 1},"${team.teamName}","${team.captainName}","${team.captainPhone}","${team.registeredAt}","${team.status}","Rp ${balance}","${notes}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Tim_Hunters_Community_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF / Print View Export for Admin
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = registeredTeams.map((team, idx) => {
      const cleanPhone = team.captainPhone.replace(/[^0-9]/g, '');
      const userKey = `phone_${cleanPhone}`;
      const userWallet = allWallets[userKey];
      const balance = userWallet ? userWallet.balance : 0;

      return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${team.teamName}</strong></td>
          <td>${team.captainName}</td>
          <td>${team.captainPhone}</td>
          <td>${team.registeredAt || '-'}</td>
          <td><span class="badge ${team.status === 'Sah' ? 'sah' : 'pending'}">${team.status}</span></td>
          <td>Rp ${balance.toLocaleString('id-ID')}</td>
          <td>${team.paymentNotes || '-'}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Arsip Daftar Tim — Hunters Community</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            h2 { color: #d97706; margin-bottom: 5px; }
            p { font-size: 12px; color: #555; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .badge { padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .sah { background-color: #d1fae5; color: #065f46; }
            .pending { background-color: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <h2>🏆 DAFTAR TIM TERDAFTAR — HUNTERS COMMUNITY x DEXZ STORE</h2>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Tim</th>
                <th>Kapten</th>
                <th>WhatsApp</th>
                <th>Tanggal Daftar</th>
                <th>Status</th>
                <th>Saldo</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-amber-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Share2 className="w-4 h-4" />
            <span className="uppercase tracking-wider">📤 BERBAGI INFORMASI & SIAP SALIN</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Share2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <span>BERBAGI JADWAL, HASIL & KODE QR</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Salin jadwal pertandingan, cetak/unduh daftar tim, atau pindai kode QR jadwal pertandingan langsung tanpa perlu tanya Admin!
          </p>
        </div>
      </div>

      {/* SECTION 1: SALIN JADWAL / HASIL PERTANDINGAN */}
      <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              🔹 1. SALIN JADWAL / HASIL PERTANDINGAN
            </h2>
          </div>

          <button
            onClick={handleCopyScheduleText}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/40 uppercase tracking-wider transition-all transform active:scale-95"
          >
            {copiedSchedule ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSchedule ? 'Tersalin!' : '📤 SALIN SIAP KIRIM'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-300 font-medium">
          Tekan tombol <strong className="text-amber-400">📤 SALIN SIAP KIRIM</strong> → teks jadwal atau hasil pertandingan langsung tersalin otomatis. Buka WhatsApp → tempel (paste) → langsung terkirim!
        </p>

        {/* SELECT MATCH */}
        {matchSchedules.length > 0 && (
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold text-neutral-400 uppercase">Pilih Pertandingan:</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full bg-[#181818] border border-neutral-700 text-white rounded-xl p-3 text-xs font-bold focus:border-amber-400 focus:outline-none"
            >
              {matchSchedules.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.game}] {m.phase} - {m.teamA} VS {m.teamB} ({m.date})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* FORMATTED DISPLAY */}
        <div className="bg-[#050505] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs text-amber-100/90 leading-relaxed">
          <div className="space-y-1">
            <p className="font-bold text-amber-400">⚔️ PERTANDINGAN — {currentMatch.phase.toUpperCase()}</p>
            <p>📅 {currentMatch.day}, {currentMatch.date}</p>
            <p>⏰ {currentMatch.time}</p>
            <p>🏆 {currentMatch.teamA || 'Tim HUNTERS'} VS {currentMatch.teamB || 'Tim DEXZ'}</p>
            <p>📍 Ruang: {currentMatch.roomCode || '001'} 🔑 Kode: {currentMatch.roomCode || '123456'} 🔒 Sandi: {currentMatch.roomPass || '8899'}</p>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 space-y-1">
            <p className="font-bold text-emerald-400">✅ HASIL — TERKONFIRMASI</p>
            <p>🏆 Pemenang: {currentMatch.winner || currentMatch.teamA || 'Tim HUNTERS'} 💀 Gugur: {currentMatch.winner === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA}</p>
            <p>📅 {currentMatch.date} 📸 Bukti diverifikasi Admin</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: UNDUH DAFTAR TIM — EXCEL / PDF (KHUSUS ADMIN) */}
      <div className="bg-[#0f0f0f] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              🔹 2. UNDUH DAFTAR TIM — EXCEL / PDF
            </h2>
          </div>
          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase rounded">
            ⚠️ HANYA UNTUK ADMIN
          </span>
        </div>

        <p className="text-xs text-neutral-300 font-medium">
          Tekan tombol di bawah → file otomatis terunduh → tersimpan sebagai arsip resmi.
        </p>

        <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-neutral-300">Isi Dokumen File:</p>
          <p className="text-xs font-mono text-cyan-400">
            No, Nama Tim, Kapten, WhatsApp, Tanggal Daftar, Status, Saldo, Catatan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Check className="w-4 h-4 shrink-0" />
              <span><strong>Excel (.CSV)</strong> → Bisa dibuka & diedit kapan saja</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Check className="w-4 h-4 shrink-0" />
              <span><strong>PDF / Print</strong> → Tampilan rapi, siap cetak & dibagikan</span>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportExcel}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 uppercase tracking-wider"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel (.CSV)</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/40 uppercase tracking-wider"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Fitur unduh daftar tim ini dikunci khusus untuk Admin Resmi. Silakan masuk sebagai Admin.</span>
          </div>
        )}
      </div>

      {/* SECTION 3: KODE QR JADWAL PERTANDINGAN */}
      <div className="bg-[#0f0f0f] border border-purple-500/30 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
          <QrIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
            🔹 3. KODE QR JADWAL PERTANDINGAN
          </h2>
        </div>

        <p className="text-xs text-neutral-300 font-medium">
          Pindai Kode QR di bawah ini dengan HP Anda untuk langsung melihat detail ruang pertandingan:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#121212] border border-neutral-800 rounded-2xl p-6">
          {/* QR CODE BOX */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Kode QR Pertandingan" className="w-44 h-44 object-contain" />
            ) : (
              <div className="w-44 h-44 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                Membuat Kode QR...
              </div>
            )}
            <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest mt-1">
              PINDAI JADWAL
            </span>
          </div>

          {/* DISPLAY DETAILS */}
          <div className="space-y-3 text-left w-full">
            <div className="inline-block px-3 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
              {currentMatch.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'} • {currentMatch.phase}
            </div>

            <h3 className="text-xl font-black text-white">
              {currentMatch.teamA} <span className="text-amber-400 font-mono">VS</span> {currentMatch.teamB}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300 bg-[#080808] p-3 rounded-xl border border-neutral-800">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Waktu Mulai</span>
                <strong>{currentMatch.day}, {currentMatch.date} ({currentMatch.time})</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Nomor Ruang</span>
                <strong>Ruang: {currentMatch.roomCode || '001'}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Kode Ruang</span>
                <strong>{currentMatch.roomCode || '123456'}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Sandi Ruang</span>
                <strong>{currentMatch.roomPass || '8899'}</strong>
              </div>
            </div>

            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
              <Check className="w-4 h-4" />
              <span>Cukup pindai sendiri → tidak perlu tanya Admin lagi.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

