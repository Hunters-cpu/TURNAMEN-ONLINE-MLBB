import React, { useState } from 'react';
import { 
  Swords, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  Trophy, 
  Users, 
  Search, 
  UserPlus,
  Radio,
  Tv,
  Calendar,
  Clock,
  ExternalLink,
  AlertCircle,
  Coins
} from 'lucide-react';
import { TOURNAMENT_MLBB_INFO, MLBB_RULES } from '../../data/initialData';
import { RegisteredTeam, TournamentInfo, RuleCategory } from '../../types';
import { MlbbDraftPickSection } from '../MlbbDraftPickSection';

interface MobileLegendsViewProps {
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  teams: RegisteredTeam[];
  mlbbInfo?: TournamentInfo;
  mlbbRules?: RuleCategory[];
}

export const MobileLegendsView: React.FC<MobileLegendsViewProps> = ({ 
  onOpenRegisterModal, 
  teams,
  mlbbInfo = TOURNAMENT_MLBB_INFO,
  mlbbRules = MLBB_RULES
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const mlbbTeams = teams.filter(t => (t.game === 'MLBB' || (t.game as any) === 'Mobile Legends') && t.status === 'Sah' && (t.slotNumber ?? 0) > 0);

  const filteredTeams = mlbbTeams.filter(t => 
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.captainName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER BANNER */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0f0f0f] border border-blue-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Swords className="w-4 h-4 text-blue-400" />
                <span>Halaman Khusus Mobile Legends</span>
              </div>
              {mlbbInfo.isLiveNow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>MATCH SEDANG LIVE</span>
                </div>
              )}
              {mlbbInfo.tournamentStage && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase">
                  <span>Fase: {mlbbInfo.tournamentStage}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight italic">
              {mlbbInfo.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xl pt-1">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Biaya Slot</span>
                <strong className="text-xs sm:text-sm text-blue-400 font-mono font-bold">{mlbbInfo.fee}</strong>
              </div>
              <div className="bg-[#050505] border border-cyan-500/40 rounded-xl p-2.5 text-center bg-cyan-500/5">
                <span className="text-[10px] text-cyan-400 uppercase font-extrabold tracking-widest block">🏆 Total Hadiah</span>
                <strong className="text-xs sm:text-sm text-cyan-300 font-mono font-black">{mlbbInfo.totalPrize || 'Rp 1.440.000'}</strong>
              </div>
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Kapasitas Slot</span>
                <strong className="text-xs sm:text-sm text-white font-mono font-bold">{mlbbInfo.maxSlots} Tim</strong>
              </div>
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Batas Daftar</span>
                <strong className="text-xs sm:text-sm text-white font-mono font-bold">{mlbbInfo.deadline}</strong>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-center space-y-2">
            <button
              onClick={() => onOpenRegisterModal('MLBB')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm sm:text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
            >
              <Swords className="w-5 h-5 text-white" />
              <span>[ DAFTAR MOBILE LEGENDS ]</span>
            </button>
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest font-mono font-bold">Dikelola oleh DEXZ STORE</p>
          </div>
        </div>
      </div>

      {/* DETAIL TURNAMEN BERLANGSUNG & HADIAH */}
      {(mlbbInfo.matchDates || mlbbInfo.prize1st || mlbbInfo.liveStreamUrl || mlbbInfo.announcementNote || mlbbInfo.formatRules) && (
        <div className="bg-gradient-to-br from-[#080d1a] to-[#0c1527] border border-blue-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-sm sm:text-base text-white uppercase">
                Informasi & Jadwal Turnamen Mobile Legends
              </h3>
            </div>
            {mlbbInfo.liveStreamUrl && (
              <a 
                href={mlbbInfo.liveStreamUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-red-950/50 w-fit"
              >
                <Tv className="w-4 h-4" />
                <span>Nonton Live Stream</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {mlbbInfo.matchDates && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jadwal Tanding</span>
                </span>
                <strong className="text-white text-sm">{mlbbInfo.matchDates}</strong>
              </div>
            )}
            {mlbbInfo.matchTime && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Waktu Pertandingan</span>
                </span>
                <strong className="text-white text-sm">{mlbbInfo.matchTime}</strong>
              </div>
            )}
            {mlbbInfo.status && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Status Turnamen</span>
                </span>
                <strong className="text-cyan-300 text-sm">{mlbbInfo.status}</strong>
              </div>
            )}
          </div>

          {mlbbInfo.formatRules && (
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block mb-1">
                Format Pertandingan:
              </span>
              <p className="text-neutral-200">{mlbbInfo.formatRules}</p>
            </div>
          )}

          {/* PRIZE BREAKDOWN */}
          {(mlbbInfo.prize1st || mlbbInfo.prize2nd || mlbbInfo.prize3rd || mlbbInfo.prizeMvp) && (
            <div className="space-y-2">
              <span className="text-[11px] text-cyan-400 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rincian Pembagian Hadiah (Prize Pool)</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {mlbbInfo.prize1st && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-cyan-400 font-black uppercase block">Juara 1</span>
                    <strong className="text-cyan-200 text-xs font-mono">{mlbbInfo.prize1st}</strong>
                  </div>
                )}
                {mlbbInfo.prize2nd && (
                  <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Juara 2</span>
                    <strong className="text-slate-200 text-xs font-mono">{mlbbInfo.prize2nd}</strong>
                  </div>
                )}
                {mlbbInfo.prize3rd && (
                  <div className="bg-amber-700/10 border border-amber-700/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-500 font-black uppercase block">Juara 3</span>
                    <strong className="text-amber-400 text-xs font-mono">{mlbbInfo.prize3rd}</strong>
                  </div>
                )}
                {mlbbInfo.prizeMvp && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-400 font-black uppercase block">MVP Final</span>
                    <strong className="text-emerald-300 text-xs font-mono">{mlbbInfo.prizeMvp}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {mlbbInfo.announcementNote && (
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-200">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-cyan-300 block mb-0.5">Catatan Resmi Panitia:</strong>
                <span>{mlbbInfo.announcementNote}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ⚠️ ATURAN MAIN MOBILE LEGENDS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
          <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase">⚠️ ATURAN MAIN MOBILE LEGENDS</h2>
            <p className="text-xs text-slate-400">Ketentuan resmi Land of Dawn kustom 5v5</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlbbRules.map((cat, idx) => {
            const isNegative = cat.type === 'negative';
            return (
              <div 
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isNegative 
                    ? 'bg-red-950/20 border-red-600/40' 
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {isNegative ? (
                    <Ban className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                  <h3 className={`font-black text-sm uppercase ${isNegative ? 'text-red-400' : 'text-cyan-300'}`}>
                    {cat.title}
                  </h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {cat.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-slate-500 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚔️ FITUR DRAFT PICK & COUNTER HERO MLBB */}
      <MlbbDraftPickSection onSelectHeroForRegistration={() => onOpenRegisterModal('MLBB')} />

      {/* 📋 DAFTAR TIM TERDAFTAR – MLBB */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>📋 DAFTAR TIM TERDAFTAR – MLBB</span>
            </h2>
            <p className="text-xs text-slate-400">
              Telah dikonfirmasi sah • Maksimal {TOURNAMENT_MLBB_INFO.maxSlots} slot
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari tim/kapten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-cyan-300">
          <span className="font-bold">✅ Status: Pendaftaran Terbuka – Segera konfirmasi pembayaran!</span>
          <span className="font-extrabold text-white">{mlbbTeams.length} / 32 Slot Terisi</span>
        </div>

        {/* Slots List Grid (Shows 32 Slots) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 32 }).map((_, i) => {
            const slotNum = i + 1;
            const team = mlbbTeams.find(t => t.slotNumber === slotNum);

            if (team && (searchTerm === '' || team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) || team.captainName.toLowerCase().includes(searchTerm.toLowerCase()))) {
              return (
                <div 
                  key={team.id ? `ml-team-${team.id}-${slotNum}` : `ml-slot-${slotNum}`}
                  className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-black text-xs flex items-center justify-center">
                      #{slotNum}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white uppercase">{team.teamName}</h4>
                      <p className="text-[11px] text-slate-400">
                        Kapten: <strong className="text-amber-400">{team.captainName}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                    {team.status}
                  </span>
                </div>
              );
            }

            if (!team && searchTerm === '') {
              return (
                <div 
                  key={`empty-${i}`}
                  onClick={() => onOpenRegisterModal('MLBB')}
                  className="p-3.5 bg-slate-950/40 border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:text-cyan-400">
                      #{slotNum}
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium">
                      [ Slot Kosong ]
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    <span>Daftar Slot #{slotNum}</span>
                  </span>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
