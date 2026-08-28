import React from 'react';
import { Archive, Trophy, Medal, Award, FileSpreadsheet, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { PastWinner, SiteConfig, TabType } from '../../types';

interface ArsipViewProps {
  siteConfig: SiteConfig;
  pastWinners?: PastWinner[];
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const ArsipView: React.FC<ArsipViewProps> = ({
  siteConfig,
  pastWinners = [],
  setActiveTab,
  isAdmin = false,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-neutral-900 to-amber-950 p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Archive className="w-4 h-4" />
            <span className="uppercase tracking-wider">ARSIP DOKUMENTASI LENGKAP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
            <span>📂 ARSIP CHAMPION & DOKUMEN HASIL</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Gudang arsip resmi seluruh juara season terdahulu, sertifikat penghargaan, serta dokumentasi bracket pertandingan yang tersimpan rapi dan permanen.
          </p>
        </div>
      </div>

      {/* ARCHIVE STATISTICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-2xl text-center space-y-1">
          <p className="text-2xl font-black text-amber-400">{pastWinners.length}</p>
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Total Season Terarsip</p>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-2xl text-center space-y-1">
          <p className="text-2xl font-black text-red-400">
            {pastWinners.filter(w => w.game === 'FF').length}
          </p>
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Arsip Free Fire</p>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-2xl text-center space-y-1">
          <p className="text-2xl font-black text-cyan-300">
            {pastWinners.filter(w => w.game === 'MLBB').length}
          </p>
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Arsip MLBB</p>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-800 p-4 rounded-2xl text-center space-y-1">
          <p className="text-2xl font-black text-emerald-400">100%</p>
          <p className="text-[10px] text-neutral-400 font-bold uppercase">Status Permanen</p>
        </div>
      </div>

      {/* DETAILED TOURNAMENT ARCHIVES SECTION */}
      {siteConfig.tournamentArchives && siteConfig.tournamentArchives.length > 0 && (
        <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="font-black text-amber-400 text-base uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>📂 RIWAYAT ARSIP TURNAMEN TERLAKSANA (PERMANEN)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Catatan sah seluruh turnamen yang telah selesai. Data disimpan permanen dan tidak dapat diubah oleh siapapun.
              </p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-300 font-mono font-bold px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
              {siteConfig.tournamentArchives.length} Turnamen Tersimpan
            </span>
          </div>

          <div className="space-y-6">
            {siteConfig.tournamentArchives.map((arch) => (
              <div key={arch.id} className="bg-[#050505] border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold mr-2 uppercase">
                      {arch.game}
                    </span>
                    <strong className="text-sm font-black text-white">{arch.tournamentName}</strong>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Selesai pada: {arch.archivedAt} | Total Tim: {arch.totalTeams}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      🥇 Juara 1: {arch.championJuara1 || '-'}
                    </span>
                    <span className="bg-slate-500/20 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-500/30">
                      🥈 Juara 2: {arch.runnerUpJuara2 || '-'}
                    </span>
                    <span className="bg-amber-700/20 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-700/30">
                      🥉 Juara 3: {arch.thirdPlaceJuara3 || '-'}
                    </span>
                    {arch.fourthPlaceRank4 && (
                      <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg border border-neutral-700">
                        🎖️ Rank 4: {arch.fourthPlaceRank4}
                      </span>
                    )}
                  </div>
                </div>

                {/* TEAMS LIST SNAPSHOT */}
                {arch.teamsList && arch.teamsList.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                      <span>Daftar Lengkap Tim Bertanding:</span>
                    </h4>
                    <div className="overflow-x-auto max-h-60 overflow-y-auto border border-neutral-800 rounded-xl bg-[#0a0a0a]">
                      <table className="w-full text-left text-[11px] text-neutral-300">
                        <thead className="bg-[#111] text-amber-400 uppercase font-black sticky top-0 border-b border-neutral-800">
                          <tr>
                            <th className="p-2">No</th>
                            <th className="p-2">Nama Tim</th>
                            <th className="p-2">Kapten</th>
                            <th className="p-2">Kontak WA</th>
                            <th className="p-2">Peringkat Akhir</th>
                            <th className="p-2">Babak Terselesaikan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 font-mono">
                          {arch.teamsList.map((tm, tIdx) => (
                            <tr key={tIdx} className="hover:bg-neutral-900/50 transition-all">
                              <td className="p-2 text-neutral-500 font-bold">{tIdx + 1}</td>
                              <td className="p-2 font-black text-white">{tm.teamName}</td>
                              <td className="p-2 text-neutral-300">{tm.captainName || '-'}</td>
                              <td className="p-2 text-emerald-400">{tm.captainPhone || '-'}</td>
                              <td className="p-2 font-bold text-amber-400">{tm.finalRank || 'Peserta'}</td>
                              <td className="p-2 text-cyan-400">{tm.phaseReached || 'Babak Penyisihan'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARCHIVE RECORDS LIST */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-black text-white text-sm uppercase flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            <span>Tabel Arsip Juara Turnamen (Resmi)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#050505] text-amber-400 uppercase font-black text-[10px] border-b border-neutral-800">
              <tr>
                <th className="p-3">Season & Waktu</th>
                <th className="p-3">Cabang Game</th>
                <th className="p-3">Juara 1 (Champion)</th>
                <th className="p-3">Juara 2 (Runner Up)</th>
                <th className="p-3">Juara 3</th>
                <th className="p-3">Prize Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {pastWinners.map((winner, idx) => (
                <tr key={idx} className="hover:bg-neutral-900/50 transition-all">
                  <td className="p-3 font-bold text-white">{winner.season}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      winner.game === 'FF' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {winner.game}
                    </span>
                  </td>
                  <td className="p-3 font-black text-amber-400">🏆 {winner.champion}</td>
                  <td className="p-3 text-slate-300">🥈 {winner.runnerUp}</td>
                  <td className="p-3 text-amber-600">🥉 {winner.thirdPlace}</td>
                  <td className="p-3 font-bold text-emerald-400">{winner.prizePool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <span className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mode Admin: Anda dapat menambah arsip season baru melalui Kelola Juara di Admin.</span>
          </span>
          <button
            onClick={() => setActiveTab('admin')}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px]"
          >
            Kelola Arsip
          </button>
        </div>
      )}
    </div>
  );
};
