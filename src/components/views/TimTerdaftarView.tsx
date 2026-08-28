import React, { useState } from 'react';
import { Users, Search, Flame, Swords, CheckCircle2, UserPlus, Phone, Key, Copy } from 'lucide-react';
import { RegisteredTeam } from '../../types';

interface TimTerdaftarViewProps {
  teams: RegisteredTeam[];
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
}

export const TimTerdaftarView: React.FC<TimTerdaftarViewProps> = ({ teams, onOpenRegisterModal }) => {
  const [selectedGameFilter, setSelectedGameFilter] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Hanya tim berstatus SAH yang memiliki nomor slot aktif yang ditampilkan di Direktori Tim Terdaftar
  const sahTeams = teams.filter(t => t.status === 'Sah' && (t.slotNumber ?? 0) > 0);

  const filtered = sahTeams.filter((t) => {
    const matchesGame = selectedGameFilter === 'ALL' || t.game === selectedGameFilter || (selectedGameFilter === 'FF' ? t.game === 'Free Fire' : t.game === 'Mobile Legends');
    const matchesQuery = 
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captainName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGame && matchesQuery;
  });

  const ffCount = sahTeams.filter(t => t.game === 'FF' || (t.game as any) === 'Free Fire').length;
  const mlbbCount = sahTeams.filter(t => t.game === 'MLBB' || (t.game as any) === 'Mobile Legends').length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
          <Users className="w-4 h-4" />
          <span>DATABASE DIREKTORI PARTICIPANTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
          👥 DAFTAR TIM TERDAFTAR
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Tim-tim resmi berstatus <strong className="text-emerald-400 font-extrabold">SAH</strong> yang telah mengamankan slot resmi turnamen Free Fire & Mobile Legends Hunters Community x DEXZ STORE.
        </p>
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hanya pendaftaran yang berstatus <strong>SAH</strong> yang langsung ditampilkan secara publik di sini. Pendaftaran berstatus Pending/Gagal disembunyikan sampai diverifikasi.</span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setSelectedGameFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              selectedGameFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Tim ({teams.length})
          </button>

          <button
            onClick={() => setSelectedGameFilter('FF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              selectedGameFilter === 'FF'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>FF ({ffCount}/32)</span>
          </button>

          <button
            onClick={() => setSelectedGameFilter('MLBB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              selectedGameFilter === 'MLBB'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-cyan-200" />
            <span>MLBB ({mlbbCount}/32)</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama tim / kapten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TEAMS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div 
            key={t.id} 
            className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                  t.game === 'FF' ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                }`}>
                  #{t.slotNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white uppercase">{t.teamName}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.game === 'FF' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {t.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>Kapten:</span>
                    <strong className="text-amber-400">{t.captainName}</strong>
                    <span className="text-slate-600">({t.captainPhone})</span>
                  </p>
                </div>
              </div>

              <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.status}</span>
              </span>
            </div>

            {/* Roster detail */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Daftar Player / Roster:</span>
              <div className="flex flex-wrap gap-1.5">
                {t.roster.map((player, pIdx) => (
                  <span key={pIdx} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 font-medium">
                    {player}
                  </span>
                ))}
              </div>
            </div>

            {/* ROOM KODE & PASSWORD KAPTEN */}
            {(t.roomCode || t.roomPass) ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[11px]">
                  <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>🔑 KODE & PASS ROOM:</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-400 font-bold">
                    ID: {t.roomCode || '-'}
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-amber-300 font-bold">
                    PASS: {t.roomPass || '-'}
                  </span>
                  <button
                    onClick={() => {
                      const text = `ID Room: ${t.roomCode || '-'} | Pass: ${t.roomPass || '-'}`;
                      navigator.clipboard.writeText(text);
                      alert(`Kode Room & Password berhasil disalin!\n${text}`);
                    }}
                    className="p-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                    title="Salin Room Info"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[10px] text-slate-500 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-slate-600 shrink-0" />
                <span>Kode Room & Password: Belum dirilis admin (Menunggu match)</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500 text-right pt-1">
              Terdaftar pada: {t.registeredAt}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
            <Users className="w-12 h-12 text-amber-500/50 mx-auto animate-pulse" />
            <h3 className="text-base font-black text-white uppercase">KOSONG / BELUM ADA TIM TERDAFTAR</h3>
            <p className="text-sm font-bold text-amber-400">Menunggu admin menambahkan tim terdaftar baru.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tim-tim resmi berstatus SAH yang dikonfirmasi atau ditambahkan langsung oleh admin akan secara otomatis ditampilkan di halaman umum ini.
            </p>
            <button
              onClick={() => onOpenRegisterModal()}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Tim Baru</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
