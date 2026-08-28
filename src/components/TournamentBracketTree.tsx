import React, { useState } from 'react';
import { Trophy, Flame, Swords, CheckCircle2, Clock, Crown, ShieldAlert } from 'lucide-react';
import { MatchSchedule } from '../types';

interface TournamentBracketTreeProps {
  schedules: MatchSchedule[];
  selectedGame: 'ALL' | 'FF' | 'MLBB';
  selectedPhase?: string;
  onSelectMatch?: (match: MatchSchedule) => void;
}

export const TournamentBracketTree: React.FC<TournamentBracketTreeProps> = ({
  schedules,
  selectedGame,
  selectedPhase = 'ALL',
  onSelectMatch,
}) => {
  const [activeGameTab, setActiveGameTab] = useState<'FF' | 'MLBB'>(
    selectedGame === 'MLBB' ? 'MLBB' : 'FF'
  );

  // Sync activeGameTab if selectedGame prop changes to FF or MLBB
  React.useEffect(() => {
    if (selectedGame !== 'ALL') {
      setActiveGameTab(selectedGame);
    }
  }, [selectedGame]);

  // Filter schedules for active game tab
  const gameSchedules = schedules.filter(
    (s) => s.game === activeGameTab || (activeGameTab === 'FF' && s.game === ('Free Fire' as any)) || (activeGameTab === 'MLBB' && s.game === ('Mobile Legends' as any))
  );

  // Group by phases
  const phases = [
    { name: 'Babak Penyisihan', count: 16, color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
    { name: 'Babak 16 Besar', count: 8, color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' },
    { name: 'Perempat Final', count: 4, color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
    { name: 'Semifinal', count: 2, color: 'border-purple-500/50 bg-purple-500/10 text-purple-400' },
    { name: 'Perebutan Juara 3', count: 1, color: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
    { name: 'Grand Final', count: 1, color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  ];

  return (
    <div className="bg-[#090314] border border-purple-900/60 rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xl">
      {/* HEADER TREE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/40 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>🌳 POHON BABAK SUSUNAN PERTANDINGAN (BAGAN GUGUR)</span>
          </h2>
          <p className="text-xs text-purple-300/80 mt-0.5">
            Skema bagan otomatis ter-update secara real-time dari Babak Penyisihan hingga Grand Final.
          </p>
        </div>

        {/* Game Switcher Tab */}
        <div className="flex items-center gap-2 bg-[#120626] p-1.5 rounded-xl border border-purple-900/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveGameTab('FF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGameTab === 'FF'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/60'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <span>🔥 FREE FIRE</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGameTab('MLBB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGameTab === 'MLBB'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <span>⚔️ MOBILE LEGENDS</span>
          </button>
        </div>
      </div>

      {/* TREE BRACKET SCROLL CONTAINER OR EMPTY STATE */}
      {gameSchedules.length === 0 ? (
        <div className="py-14 px-6 text-center space-y-3 bg-[#120626]/60 border border-purple-900/40 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Swords className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="text-base font-black text-white uppercase tracking-tight">
            ⚠️ BAGAN PERTANDINGAN BELUM DISUSUN
          </h3>
          <p className="text-xs text-purple-200/70 max-w-md mx-auto leading-relaxed">
            Panitia turnamen belum menyusun atau mengacak pasangan tim untuk game {activeGameTab === 'FF' ? 'Free Fire' : 'Mobile Legends'}. Bagan gugur pohon babak akan aktif secara otomatis setelah Admin mengacak / menyusun pasangan tim di Panel Admin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-6 pt-2 custom-scrollbar">
          <div className="flex items-start gap-6 min-w-[1300px] px-2">
            {phases.map((phase) => {
              const phaseMatches = gameSchedules.filter((m) => m.phase === phase.name);
              const isHighlightedPhase = selectedPhase === 'ALL' || selectedPhase === phase.name;

              return (
                <div
                  key={phase.name}
                  className={`flex-1 min-w-[220px] max-w-[260px] space-y-3 transition-all ${
                    isHighlightedPhase ? 'opacity-100 scale-100' : 'opacity-40 grayscale-[40%]'
                  }`}
                >
                  {/* Stage Column Header */}
                  <div className={`p-2.5 rounded-xl border text-center space-y-0.5 ${phase.color} shadow-lg`}>
                    <h3 className="text-xs font-black uppercase tracking-wider">{phase.name}</h3>
                    <span className="text-[10px] font-mono opacity-80 block">
                      {phaseMatches.length} Match
                    </span>
                  </div>

                  {/* Stage Matches Column */}
                  <div className="space-y-4 flex flex-col justify-around min-h-[500px]">
                    {phaseMatches.length === 0 ? (
                      <div className="p-4 bg-[#120626]/80 border border-purple-900/40 rounded-xl text-center text-xs text-purple-300/60">
                        Belum ada jadwal
                      </div>
                    ) : (
                      phaseMatches.map((match) => {
                        const isWinnerA = match.winner && match.teamA && match.winner.trim().toLowerCase() === match.teamA.trim().toLowerCase();
                        const isWinnerB = match.winner && match.teamB && match.winner.trim().toLowerCase() === match.teamB.trim().toLowerCase();
                        const hasFinished = match.status === 'selesai' || Boolean(match.winner);

                        return (
                          <div
                            key={match.id}
                            onClick={() => onSelectMatch && onSelectMatch(match)}
                            className={`p-3 bg-[#110524] border rounded-xl space-y-2 shadow-lg transition-all cursor-pointer relative group hover:border-purple-400 ${
                              hasFinished
                                ? 'border-emerald-500/50 bg-[#0d161d]'
                                : 'border-purple-900/60 hover:bg-[#180833]'
                            }`}
                          >
                            {/* Match Top Bar */}
                            <div className="flex items-center justify-between text-[10px] text-purple-300/70 border-b border-purple-900/40 pb-1.5 font-mono">
                              <span className="font-extrabold text-amber-400">Match #{match.matchNumber}</span>
                              <span>{match.time || '19:00 WIB'}</span>
                            </div>

                            {/* Team A */}
                            <div
                              className={`p-2 rounded-lg border flex items-center justify-between gap-1 transition-all ${
                                isWinnerA
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-black shadow-md shadow-emerald-950/50'
                                  : hasFinished && match.teamA && !isWinnerA
                                  ? 'bg-red-950/30 border-red-900/40 text-neutral-400 line-through'
                                  : 'bg-[#090214] border-purple-900/50 text-white'
                              }`}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-extrabold truncate">
                                  {match.teamA || 'Belum Ada'}
                                </span>
                                {match.phase === 'Grand Final' && isWinnerA && (
                                  <span className="text-[9px] font-black text-amber-400 tracking-wider">🥇 JUARA 1</span>
                                )}
                                {match.phase === 'Grand Final' && hasFinished && !isWinnerA && match.teamA && (
                                  <span className="text-[9px] font-black text-slate-300 tracking-wider">🥈 JUARA 2</span>
                                )}
                                {match.phase === 'Perebutan Juara 3' && isWinnerA && (
                                  <span className="text-[9px] font-black text-amber-500 tracking-wider">🥉 JUARA 3</span>
                                )}
                                {match.phase === 'Perebutan Juara 3' && hasFinished && !isWinnerA && match.teamA && (
                                  <span className="text-[9px] font-black text-neutral-400 tracking-wider">Peringkat 4</span>
                                )}
                              </div>
                              {isWinnerA && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />}
                              {hasFinished && match.teamA && !isWinnerA && (
                                <span className="text-[9px] text-red-400 font-bold px-1 bg-red-950 rounded border border-red-800 shrink-0">
                                  GUGUR
                                </span>
                              )}
                            </div>

                            {/* VS Divider */}
                            <div className="text-center text-[9px] font-black text-purple-400 uppercase tracking-widest my-0.5">
                              VS
                            </div>

                            {/* Team B */}
                            <div
                              className={`p-2 rounded-lg border flex items-center justify-between gap-1 transition-all ${
                                isWinnerB
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-black shadow-md shadow-emerald-950/50'
                                  : hasFinished && match.teamB && !isWinnerB
                                  ? 'bg-red-950/30 border-red-900/40 text-neutral-400 line-through'
                                  : 'bg-[#090214] border-purple-900/50 text-white'
                              }`}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-extrabold truncate">
                                  {match.teamB || 'Belum Ada'}
                                </span>
                                {match.phase === 'Grand Final' && isWinnerB && (
                                  <span className="text-[9px] font-black text-amber-400 tracking-wider">🥇 JUARA 1</span>
                                )}
                                {match.phase === 'Grand Final' && hasFinished && !isWinnerB && match.teamB && (
                                  <span className="text-[9px] font-black text-slate-300 tracking-wider">🥈 JUARA 2</span>
                                )}
                                {match.phase === 'Perebutan Juara 3' && isWinnerB && (
                                  <span className="text-[9px] font-black text-amber-500 tracking-wider">🥉 JUARA 3</span>
                                )}
                                {match.phase === 'Perebutan Juara 3' && hasFinished && !isWinnerB && match.teamB && (
                                  <span className="text-[9px] font-black text-neutral-400 tracking-wider">Peringkat 4</span>
                                )}
                              </div>
                              {isWinnerB && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />}
                              {hasFinished && match.teamB && !isWinnerB && (
                                <span className="text-[9px] text-red-400 font-bold px-1 bg-red-950 rounded border border-red-800 shrink-0">
                                  GUGUR
                                </span>
                              )}
                            </div>

                            {/* Winner Banner if Decided */}
                            {match.winner && (
                              <div className="mt-1 pt-1.5 border-t border-purple-900/40 text-center">
                                {match.phase === 'Grand Final' ? (
                                  <span className="text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 bg-amber-500/20 py-0.5 rounded border border-amber-500/40">
                                    👑 JUARA 1: {match.winner}
                                  </span>
                                ) : match.phase === 'Perebutan Juara 3' ? (
                                  <span className="text-[10px] font-black text-amber-400 flex items-center justify-center gap-1 bg-amber-950/40 py-0.5 rounded border border-amber-800/40">
                                    🥉 JUARA 3: {match.winner}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black text-emerald-400 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>WINNER: {match.winner}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
