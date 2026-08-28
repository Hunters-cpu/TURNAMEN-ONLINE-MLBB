import React, { useState } from 'react';
import { Trophy, History, Flame, Swords, Calendar, Award, Gift, ArrowRight } from 'lucide-react';
import { PastWinner, TabType } from '../../types';

interface RiwayatViewProps {
  pastWinners?: PastWinner[];
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  pastWinners = [],
  setActiveTab,
  isAdmin = false,
}) => {
  const [selectedGame, setSelectedGame] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');

  const filtered = pastWinners.filter(item => {
    if (selectedGame === 'ALL') return true;
    return item.game === selectedGame;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-neutral-900 to-yellow-950 p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <History className="w-4 h-4" />
            <span className="uppercase tracking-wider">HALL OF FAME & REKAP JUARA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
            <span>📊 RIWAYAT TURNAMEN LAMA</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Rekap piala bergilir, daftar para juara legendaris, dan riwayat hasil turnamen Free Fire & Mobile Legends dari season ke season.
          </p>
        </div>
      </div>

      {/* GAME TABS */}
      <div className="flex items-center justify-center p-1.5 bg-[#0a0a0a] border border-neutral-800 rounded-2xl gap-2 max-w-md mx-auto">
        <button
          onClick={() => setSelectedGame('ALL')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedGame === 'ALL'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Semua Game
        </button>
        <button
          onClick={() => setSelectedGame('FF')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            selectedGame === 'FF'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Free Fire</span>
        </button>
        <button
          onClick={() => setSelectedGame('MLBB')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            selectedGame === 'MLBB'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-cyan-300" />
          <span>Mobile Legends</span>
        </button>
      </div>

      {/* PAST WINNERS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((winner, idx) => (
          <div
            key={idx}
            className="bg-[#0f0f0f] border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl transition-all"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase">
                <Calendar className="w-4 h-4 text-amber-400" />
                {winner.season}
              </span>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                winner.game === 'FF' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {winner.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* JUARA 1 */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-neutral-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center">
                    🏆 1
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-400 font-bold uppercase">JUARA 1 (CHAMPION)</p>
                    <p className="text-sm font-black text-white">{winner.champion}</p>
                  </div>
                </div>
              </div>

              {/* JUARA 2 */}
              <div className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-slate-300 text-neutral-950 font-black text-[11px] flex items-center justify-center">
                    🥈 2
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">JUARA 2 (RUNNER UP)</p>
                    <p className="text-xs font-extrabold text-neutral-200">{winner.runnerUp}</p>
                  </div>
                </div>
              </div>

              {/* JUARA 3 */}
              <div className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-amber-800 text-amber-200 font-black text-[11px] flex items-center justify-center">
                    🥉 3
                  </div>
                  <div>
                    <p className="text-[9px] text-amber-500 font-bold uppercase">JUARA 3</p>
                    <p className="text-xs font-extrabold text-neutral-300">{winner.thirdPlace}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                {winner.prizePool}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
