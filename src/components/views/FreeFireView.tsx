import React, { useState } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Smartphone, 
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
import { TOURNAMENT_FF_INFO, FF_RULES } from '../../data/initialData';
import { RegisteredTeam, TournamentInfo, RuleCategory } from '../../types';

interface FreeFireViewProps {
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  teams: RegisteredTeam[];
  ffInfo?: TournamentInfo;
  ffRules?: RuleCategory[];
}

export const FreeFireView: React.FC<FreeFireViewProps> = ({ 
  onOpenRegisterModal, 
  teams,
  ffInfo = TOURNAMENT_FF_INFO,
  ffRules = FF_RULES
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const ffTeams = teams.filter(t => (t.game === 'FF' || (t.game as any) === 'Free Fire') && t.status === 'Sah' && (t.slotNumber ?? 0) > 0);

  const filteredTeams = ffTeams.filter(t => 
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.captainName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER BANNER */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0f0f0f] border border-orange-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Halaman Khusus Free Fire</span>
              </div>
              {ffInfo.isLiveNow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>MATCH SEDANG LIVE</span>
                </div>
              )}
              {ffInfo.tournamentStage && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                  <span>Fase: {ffInfo.tournamentStage}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight italic">
              {ffInfo.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xl pt-1">
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Biaya Slot</span>
                <strong className="text-xs sm:text-sm text-orange-400 font-mono font-bold">{ffInfo.fee}</strong>
              </div>
              <div className="bg-[#050505] border border-amber-500/40 rounded-xl p-2.5 text-center bg-amber-500/5">
                <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-widest block">🏆 Total Hadiah</span>
                <strong className="text-xs sm:text-sm text-amber-300 font-mono font-black">{ffInfo.totalPrize || 'Rp 1.440.000'}</strong>
              </div>
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Kapasitas Slot</span>
                <strong className="text-xs sm:text-sm text-white font-mono font-bold">{ffInfo.maxSlots} Tim</strong>
              </div>
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest block">Batas Daftar</span>
                <strong className="text-xs sm:text-sm text-white font-mono font-bold">{ffInfo.deadline}</strong>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-center space-y-2">
            <button
              onClick={() => onOpenRegisterModal('FF')}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-sm sm:text-base px-8 py-4 rounded-xl shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
            >
              <Flame className="w-5 h-5 text-white" />
              <span>[ DAFTAR FREE FIRE ]</span>
            </button>
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest font-mono font-bold">Dikelola oleh DEXZ STORE</p>
          </div>
        </div>
      </div>

      {/* DETAIL TURNAMEN BERLANGSUNG & HADIAH */}
      {(ffInfo.matchDates || ffInfo.prize1st || ffInfo.liveStreamUrl || ffInfo.announcementNote || ffInfo.formatRules) && (
        <div className="bg-gradient-to-br from-[#0c0a09] to-[#14100c] border border-orange-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm sm:text-base text-white uppercase">
                Informasi & Jadwal Turnamen Free Fire
              </h3>
            </div>
            {ffInfo.liveStreamUrl && (
              <a 
                href={ffInfo.liveStreamUrl} 
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
            {ffInfo.matchDates && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>Jadwal Tanding</span>
                </span>
                <strong className="text-white text-sm">{ffInfo.matchDates}</strong>
              </div>
            )}
            {ffInfo.matchTime && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Waktu Pertandingan</span>
                </span>
                <strong className="text-white text-sm">{ffInfo.matchTime}</strong>
              </div>
            )}
            {ffInfo.status && (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Status Turnamen</span>
                </span>
                <strong className="text-amber-300 text-sm">{ffInfo.status}</strong>
              </div>
            )}
          </div>

          {ffInfo.formatRules && (
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 text-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block mb-1">
                Format Pertandingan:
              </span>
              <p className="text-neutral-200">{ffInfo.formatRules}</p>
            </div>
          )}

          {/* PRIZE BREAKDOWN */}
          {(ffInfo.prize1st || ffInfo.prize2nd || ffInfo.prize3rd || ffInfo.prizeMvp) && (
            <div className="space-y-2">
              <span className="text-[11px] text-amber-400 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Rincian Pembagian Hadiah (Prize Pool)</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {ffInfo.prize1st && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-400 font-black uppercase block">Juara 1</span>
                    <strong className="text-amber-200 text-xs font-mono">{ffInfo.prize1st}</strong>
                  </div>
                )}
                {ffInfo.prize2nd && (
                  <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Juara 2</span>
                    <strong className="text-slate-200 text-xs font-mono">{ffInfo.prize2nd}</strong>
                  </div>
                )}
                {ffInfo.prize3rd && (
                  <div className="bg-amber-700/10 border border-amber-700/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-500 font-black uppercase block">Juara 3</span>
                    <strong className="text-amber-400 text-xs font-mono">{ffInfo.prize3rd}</strong>
                  </div>
                )}
                {ffInfo.prizeMvp && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-400 font-black uppercase block">Top Predator / MVP</span>
                    <strong className="text-emerald-300 text-xs font-mono">{ffInfo.prizeMvp}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {ffInfo.announcementNote && (
            <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-orange-200">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-orange-300 block mb-0.5">Catatan Resmi Panitia:</strong>
                <span>{ffInfo.announcementNote}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ⚠️ ATURAN MAIN FREE FIRE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
          <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase">⚠️ ATURAN MAIN FREE FIRE</h2>
            <p className="text-xs text-slate-400">Wajib dibaca dan dipatuhi oleh seluruh kapten & peserta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ffRules.map((cat, idx) => {
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
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <h3 className={`font-black text-sm uppercase ${isNegative ? 'text-red-400' : 'text-amber-400'}`}>
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

      {/* 📋 DAFTAR TIM TERDAFTAR – FREE FIRE */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <span>📋 DAFTAR TIM TERDAFTAR – FREE FIRE</span>
            </h2>
            <p className="text-xs text-slate-400">
              Terdaftar & dikonfirmasi sah • Maksimal {TOURNAMENT_FF_INFO.maxSlots} slot
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari tim/kapten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
          <span className="font-bold">✅ Status: Pendaftaran Terbuka – Segera selesaikan pembayaran!</span>
          <span className="font-extrabold text-white">{ffTeams.length} / 32 Slot Terisi</span>
        </div>

        {/* Slots List Grid (Shows 32 Slots) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 32 }).map((_, i) => {
            const slotNum = i + 1;
            const team = ffTeams.find(t => t.slotNumber === slotNum);

            if (team && (searchTerm === '' || team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) || team.captainName.toLowerCase().includes(searchTerm.toLowerCase()))) {
              return (
                <div 
                  key={team.id ? `ff-team-${team.id}-${slotNum}` : `ff-slot-${slotNum}`}
                  className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 font-black text-xs flex items-center justify-center">
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
                  onClick={() => onOpenRegisterModal('FF')}
                  className="p-3.5 bg-slate-950/40 border border-dashed border-slate-800 hover:border-red-500/50 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:text-red-400">
                      #{slotNum}
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium">
                      [ Slot Kosong ]
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-red-500/80 group-hover:text-red-400 flex items-center gap-1">
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
