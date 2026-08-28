import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, AlertCircle, Search, ShieldCheck, Key, Copy, Send, Check,
  Upload, Image as ImageIcon, Camera, MessageSquare, X, FileCheck, Eye, Trash2, Smartphone
} from 'lucide-react';
import { RegisteredTeam, TabType } from '../../types';
import { notifyConfirmationResult, notifyAdminEvent } from '../../lib/notificationService';

interface StatusPembayaranViewProps {
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const StatusPembayaranView: React.FC<StatusPembayaranViewProps> = ({
  registeredTeams,
  setRegisteredTeams,
  setActiveTab,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGame, setFilterGame] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal & Upload States for Payment Proof
  const [selectedTeamForProof, setSelectedTeamForProof] = useState<RegisteredTeam | null>(null);
  const [viewingProofTeam, setViewingProofTeam] = useState<RegisteredTeam | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [amount, setAmount] = useState<string>('50.000');
  const [notes, setNotes] = useState<string>('');

  const adminWaClean = '6283148834663';

  const filtered = registeredTeams.filter(team => {
    // Public view only displays SAH verified teams
    if (!isAdmin && team.status !== 'Sah') return false;

    const matchGame = filterGame === 'ALL' || team.game === filterGame;
    const matchStatus = filterStatus === 'ALL' || team.status === filterStatus;
    const matchSearch = 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captainPhone.includes(searchTerm);
    return matchGame && matchStatus && matchSearch;
  });

  const countSah = registeredTeams.filter(t => t.status === 'Sah').length;
  const countPending = registeredTeams.filter(t => t.status === 'Menunggu Pembayaran').length;
  const countGagal = registeredTeams.filter(t => t.status === 'Gagal').length;

  const handleQuickStatusChange = (teamId: string, newStatus: 'Sah' | 'Menunggu Pembayaran' | 'Gagal') => {
    const nowIso = new Date().toISOString();
    const targetTeam = registeredTeams.find(t => t.id === teamId);

    setRegisteredTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          status: newStatus,
          failedAt: newStatus === 'Gagal' ? (t.failedAt || nowIso) : undefined
        };
      }
      return t;
    }));

    if (targetTeam) {
      if (newStatus === 'Sah') {
        notifyConfirmationResult(
          targetTeam.captainPhone,
          targetTeam.teamName,
          true,
          'pendaftaran',
          `Slot #${targetTeam.slotNumber} (${targetTeam.game}) telah TERVERIFIKASI SAH!`
        );
      } else if (newStatus === 'Gagal') {
        notifyConfirmationResult(
          targetTeam.captainPhone,
          targetTeam.teamName,
          false,
          'pendaftaran',
          '',
          'Pembayaran/Bukti transfer tidak dapat diverifikasi oleh Admin.'
        );
      }
    }
  };

  const formatWaNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSendRoomToCaptain = (team: RegisteredTeam) => {
    const phone = formatWaNumber(team.captainPhone);
    const roomText = `Halo Kapten *${team.captainName}* dari tim *${team.teamName}*,\n\nStatus pendaftaran tim Anda di *DEXZ STORE ESPORTS* telah *SAH (LUNAS)*! 🎉\n\n🔑 *DETAIL AKSES LOBBY MATCH*:\n• Game: *${team.game}*\n• Slot: *#${team.slotNumber}*\n• Kode Room ID: *${team.roomCode || '(Menunggu Rilis)'}*\n• Password Room: *${team.roomPass || '(Menunggu Rilis)'}*\n\nHarap bersiap dan pastikan seluruh anggota roster telah online 15 menit sebelum pertandingan dimulai. Good luck & Have Fun! 🏆`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(roomText)}`;
    window.open(url, '_blank');
  };

  const handleCopyRoomInfo = (team: RegisteredTeam) => {
    const text = `Tim: ${team.teamName} | Kode Room ID: ${team.roomCode || '-'} | Pass: ${team.roomPass || '-'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(team.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti pembayaran maksimal 10MB!');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenUploadModal = (team: RegisteredTeam) => {
    setSelectedTeamForProof(team);
    setProofImage(team.paymentProofUrl || null);
    setSenderName(team.paymentSenderName || team.captainName);
    setAmount(team.paymentAmount || '50.000');
    setNotes(team.paymentNotes || '');
  };

  const handleSendProofToWaAdmin = () => {
    if (!selectedTeamForProof) return;

    const updatedTeam: RegisteredTeam = {
      ...selectedTeamForProof,
      paymentProofUrl: proofImage || selectedTeamForProof.paymentProofUrl,
      paymentSenderName: senderName.trim() || selectedTeamForProof.captainName,
      paymentAmount: amount.trim() || '50.000',
      paymentNotes: notes.trim() || undefined,
      paymentSubmittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setRegisteredTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    notifyAdminEvent(
      'pendaftaran',
      'Unggah Bukti Pembayaran Baru',
      `Tim "${updatedTeam.teamName}" (Slot #${updatedTeam.slotNumber}) telah mengunggah bukti pembayaran di Panel Admin.`,
      updatedTeam
    );

    alert('✅ Bukti pembayaran berhasil disimpan & dikirim ke Panel Admin! Panitia telah menerima notifikasi dan akan memverifikasi pendaftaran Anda.');
    setSelectedTeamForProof(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-cyan-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CreditCard className="w-4 h-4" />
            <span className="uppercase tracking-wider">CEK VERIFIKASI PEMBAYARAN TIM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <span>💳 STATUS PEMBAYARAN REGISTRASI</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            {isAdmin ? (
              <span className="text-amber-300 font-bold bg-amber-950/60 border border-amber-700/60 px-3 py-1.5 rounded-xl inline-block mt-1">
                🛡️ MODE ADMIN: Anda memiliki hak akses untuk mengubah status (Sah/Pending/Gagal), menginput Kode Ruang & Password, serta mengirimkan data room langsung ke WA Kapten.
              </span>
            ) : (
              <span>
                Cek langsung status verifikasi pendaftaran tim Anda. Ketika pendaftaran berstatus <strong className="text-emerald-400 font-bold">SAH (LUNAS)</strong>, Kode Ruang & Password pertandingan akan <strong className="text-amber-300 font-bold">otomatis muncul</strong> di bawah data tim.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0f0f0f] border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">PEMBAYARAN SAH (LUNAS)</p>
            <p className="text-2xl font-black text-emerald-400">{countSah} Tim</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/80" />
        </div>

        <div className="bg-[#0f0f0f] border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">PENDING (MENUNGGU BAYAR)</p>
            <p className="text-2xl font-black text-amber-400">{countPending} Tim</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400/80" />
        </div>

        <div className="bg-[#0f0f0f] border border-red-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">BELUM BAYAR / GAGAL</p>
            <p className="text-2xl font-black text-red-400">{countGagal} Tim</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-400/80" />
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL */}
      <div className="p-4 bg-[#0a0a0a] border border-neutral-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama tim, kapten, atau nomor WA..."
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value as any)}
              className="bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Game</option>
              <option value="FF">Free Fire</option>
              <option value="MLBB">Mobile Legends</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Sah">Sah (Lunas)</option>
              <option value="Menunggu Pembayaran">Pending (Menunggu Pembayaran)</option>
              <option value="Gagal">Gagal</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST TEAMS PAYMENT STATUS */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#0a0a0a] border border-neutral-800 rounded-2xl text-neutral-400 space-y-3">
            <Clock className="w-10 h-10 text-amber-500/60 mx-auto animate-pulse" />
            <h3 className="text-base font-black text-white uppercase">KOSONG / BELUM ADA PEMBAYARAN SAH</h3>
            <p className="text-xs sm:text-sm font-bold text-amber-400">
              Menunggu admin memverifikasi SAH pendaftaran tim.
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Status pendaftaran tim yang berstatus SAH akan secara otomatis ditampilkan di halaman umum ini setelah dikonfirmasi atau disahkan oleh admin.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('form-pendaftaran')}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Daftar &amp; Bayar Pendaftaran</span>
            </button>
          </div>
        ) : (
          filtered.map((team) => (
            <div
              key={team.id}
              className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg hover:border-neutral-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* ANGGOTA BIASA VIEW: NAMA TIM, KAPTEN, KONTAK & STATUS */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Slot #{team.slotNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      team.game === 'FF' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {team.game}
                    </span>
                    <h3 className="text-base font-black text-white">{team.teamName}</h3>
                  </div>

                  <div className="text-xs text-neutral-300 space-y-0.5 font-sans">
                    <p>👤 <span className="text-neutral-400">Kapten:</span> <strong className="text-white font-bold">{team.captainName}</strong></p>
                    <p>📱 <span className="text-neutral-400">Kontak WA:</span> <strong className="text-emerald-400 font-mono font-bold">{team.captainPhone}</strong></p>
                  </div>

                  <p className="text-[10px] text-neutral-500 font-mono">
                    Terdaftar: {team.registeredAt}
                  </p>

                  {/* BUKTI PEMBAYARAN INFO & BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {team.paymentProofUrl ? (
                      <button
                        type="button"
                        onClick={() => setViewingProofTeam(team)}
                        className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>📸 Lihat Foto Bukti Bayar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        ⚠️ Foto Bukti Belum Ada
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(team)}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-500/50 text-neutral-200 hover:text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>💳 {team.paymentProofUrl ? 'Ganti / Kirim Ke WA Admin' : 'Unggah & Kirim Bukti ke WA Admin'}</span>
                    </button>
                  </div>
                </div>

                {/* STATUS BADGE & ADMIN CONTROLS */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* STATUS BADGE */}
                  <div>
                    {team.status === 'Sah' && (
                      <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>SAH (LUNAS)</span>
                      </span>
                    )}
                    {team.status === 'Menunggu Pembayaran' && (
                      <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>PENDING (MENUNGGU PEMBAYARAN)</span>
                      </span>
                    )}
                    {team.status === 'Gagal' && (
                      <span className="px-3.5 py-1.5 bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black rounded-xl inline-flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>BELUM BAYAR / GAGAL</span>
                      </span>
                    )}
                  </div>

                  {/* ADMIN ONLY: TOMBOL SAH / PENDING / GAGAL */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-[#050505] p-1.5 rounded-xl border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(team.id, 'Sah')}
                        className={`px-2.5 py-1 font-extrabold text-[11px] rounded-lg transition-all cursor-pointer ${
                          team.status === 'Sah'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-neutral-900 text-neutral-400 hover:text-emerald-400'
                        }`}
                        title="Ubah ke status Sah"
                      >
                        Sah
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(team.id, 'Menunggu Pembayaran')}
                        className={`px-2.5 py-1 font-extrabold text-[11px] rounded-lg transition-all cursor-pointer ${
                          team.status === 'Menunggu Pembayaran'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-neutral-900 text-neutral-400 hover:text-amber-400'
                        }`}
                        title="Ubah ke status Pending"
                      >
                        Pending
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(team.id, 'Gagal')}
                        className={`px-2.5 py-1 font-extrabold text-[11px] rounded-lg transition-all cursor-pointer ${
                          team.status === 'Gagal'
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-neutral-900 text-neutral-400 hover:text-red-400'
                        }`}
                        title="Ubah ke status Gagal"
                      >
                        Gagal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ROOM ID & PASSWORD SECTION */}
              {isAdmin ? (
                /* ADMIN VIEW: INPUT KODE RUANG & PASSWORD */
                <div className="pt-3 border-t border-neutral-800/80">
                  <div className="bg-[#050505] p-3.5 rounded-xl border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <Key className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                        🔑 INPUT KODE RUANG & PASSWORD (KHUSUS ADMIN):
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Kode Room ID"
                          value={team.roomCode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegisteredTeams(prev => prev.map(t => t.id === team.id ? { ...t, roomCode: val } : t));
                          }}
                          className="w-28 bg-[#0f0f0f] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                        />

                        <input
                          type="text"
                          placeholder="Pass Room"
                          value={team.roomPass || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegisteredTeams(prev => prev.map(t => t.id === team.id ? { ...t, roomPass: val } : t));
                          }}
                          className="w-24 bg-[#0f0f0f] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyRoomInfo(team)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Salin Info Room"
                        >
                          {copiedId === team.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendRoomToCaptain(team)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          title="Kirim Kode Ruang & Password ke WA Kapten"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim ke WA Kapten</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : team.status === 'Sah' ? (
                /* MEMBER VIEW: OTOMATIS MEMUNCULKAN KODE ROOM & PASS KETIKA SAH */
                <div className="pt-3 border-t border-neutral-800/80">
                  <div className="bg-[#050505] p-3.5 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <Key className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        🔑 KODE RUANG & PASS LOBBY MATCH:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <div className="bg-[#0f0f0f] px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-2 text-xs font-mono">
                        <span className="text-neutral-400 text-[11px]">ROOM ID:</span>
                        <strong className="text-emerald-400 font-extrabold">{team.roomCode || '(Belum Rilis)'}</strong>
                      </div>

                      <div className="bg-[#0f0f0f] px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2 text-xs font-mono">
                        <span className="text-neutral-400 text-[11px]">PASS:</span>
                        <strong className="text-amber-300 font-extrabold">{team.roomPass || '(Belum Rilis)'}</strong>
                      </div>

                      {(team.roomCode || team.roomPass) && (
                        <button
                          type="button"
                          onClick={() => handleCopyRoomInfo(team)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Salin Info Room"
                        >
                          {copiedId === team.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* CATATAN KETERANGAN ATAS DOKUMEN / REGISTRASI */}
      <div className="p-4 bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl text-neutral-300 text-xs leading-relaxed space-y-1">
        <p className="font-extrabold text-amber-400 flex items-center gap-1.5">
          <span>📌 Keterangan:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] sm:text-xs">
          <li><strong className="text-neutral-200">Konfirmasi Bukti Pembayaran:</strong> Anda dapat mengunggah screenshot/struk transfer kapan saja untuk dikirimkan langsung ke WhatsApp Admin (+6283148834663).</li>
          <li><strong className="text-neutral-200">Otomatisasi Room:</strong> Ketika status pembayaran disahkan (<span className="text-emerald-400 font-bold">SAH</span>), Kode Ruang &amp; Password otomatis dimunculkan.</li>
          <li><strong className="text-neutral-200">Akses Admin:</strong> Tombol pengubah status (Sah/Pending/Gagal) serta input Kode Ruang &amp; Password hanya dapat diakses oleh Admin.</li>
        </ul>
      </div>

      {/* MODAL: UNGGAH BUKTI PEMBAYARAN */}
      {selectedTeamForProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedTeamForProof(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-emerald-400">
              <Upload className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-black uppercase">UNGGAH BUKTI PEMBAYARAN</h3>
                <p className="text-xs text-neutral-400 font-mono">Tim: {selectedTeamForProof.teamName} (#{selectedTeamForProof.slotNumber})</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-300">
                Foto Struk / Screenshot Bukti Transfer:
              </label>

              {!proofImage ? (
                <label className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#050505] hover:bg-emerald-950/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black text-white uppercase">Klik untuk Pilih Foto Bukti Pembayaran</p>
                  <p className="text-[10px] text-neutral-400">Format: JPG, PNG, WEBP (Maks 10MB)</p>
                </label>
              ) : (
                <div className="bg-[#050505] border border-emerald-500/50 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>Foto Bukti Terpilih</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="text-red-400 text-[11px] font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black max-h-40 flex items-center justify-center">
                    <img src={proofImage} alt="Preview Bukti" className="max-h-36 object-contain" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Atas Nama Pengirim / Rekening:</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Budi Santoso / DANA"
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">Nominal Transfer (Rp):</label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50.000"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">Catatan / Ref:</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSendProofToWaAdmin}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Simpan & Kirim Ke Panel Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeamForProof(null)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs py-2 rounded-xl text-center"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT FOTO BUKTI PEMBAYARAN */}
      {viewingProofTeam && viewingProofTeam.paymentProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-emerald-500/40 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setViewingProofTeam(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full bg-neutral-900 border border-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400">
              <ImageIcon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-black uppercase">BUKTI PEMBAYARAN TIM</h3>
                <p className="text-xs text-neutral-300 font-mono">
                  {viewingProofTeam.teamName} (Slot #{viewingProofTeam.slotNumber}) - {viewingProofTeam.game}
                </p>
              </div>
            </div>

            <div className="bg-[#050505] p-3 rounded-2xl border border-neutral-800 space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-neutral-800 max-h-[60vh]">
                <img
                  src={viewingProofTeam.paymentProofUrl}
                  alt="Bukti Transfer Lunas"
                  className="max-h-[55vh] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300 pt-2 border-t border-neutral-800">
                <p>• <span className="text-neutral-400">Pengirim:</span> <strong className="text-white">{viewingProofTeam.paymentSenderName || viewingProofTeam.captainName}</strong></p>
                <p>• <span className="text-neutral-400">Nominal:</span> <strong className="text-emerald-400">Rp{viewingProofTeam.paymentAmount || '50.000'}</strong></p>
                <p>• <span className="text-neutral-400">Waktu:</span> <strong className="text-white">{viewingProofTeam.paymentSubmittedAt || viewingProofTeam.registeredAt}</strong></p>
                <p>• <span className="text-neutral-400">Status:</span> <strong className="text-amber-400">{viewingProofTeam.status}</strong></p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setViewingProofTeam(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Tersimpan Di Panel Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

