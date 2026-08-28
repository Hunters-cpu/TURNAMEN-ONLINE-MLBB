import React, { useState } from 'react';
import { FolderLock, DollarSign, FileSpreadsheet, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FINANCIAL_TRANSACTIONS } from '../../data/initialData';

export const DataLaporanView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transaksi' | 'leaderboard' | 'syarat'>('transaksi');

  const totalFund = FINANCIAL_TRANSACTIONS.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
          <FolderLock className="w-4 h-4" />
          <span>TRANSPARANSI KEUANGAN & AUDIT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
          📂 DATA & LAPORAN AUNTENTIK
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Riwayat Dana • Catatan Transaksi • Papan Peringkat Tim • Syarat & Ketentuan Lengkap DEXZ STORE.
        </p>
      </div>

      {/* INTERNAL TABS */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'transaksi'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Riwayat Transaksi</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Papan Peringkat</span>
        </button>

        <button
          onClick={() => setActiveTab('syarat')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'syarat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Syarat & Ketentuan</span>
        </button>
      </div>

      {/* TAB 1: RIWAYAT TRANSAKSI & DANA */}
      {activeTab === 'transaksi' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary Audit Card */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs text-indigo-300 font-bold block">Total Rekapitulasi Dana Slot Terkonfirmasi:</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">
                Rp {totalFund.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Transparan 100% DEXZ STORE</span>
            </span>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-mono">
                <tr>
                  <th className="p-3">ID Transaksi</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Nama Tim</th>
                  <th className="p-3">Game</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Metode</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {FINANCIAL_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono text-indigo-400 font-bold">{tx.id}</td>
                    <td className="p-3 text-slate-400">{tx.date}</td>
                    <td className="p-3 font-bold text-white">{tx.teamName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.game === 'Free Fire' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-300'
                      }`}>
                        {tx.game}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">Rp {tx.amount.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-slate-400">{tx.method}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAPAN PERINGKAT */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>PAPAN PERINGKAT KLUB HUNTERS COMMUNITY</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { rank: 1, team: 'HUNTERS ESPORTS ALPHA', game: 'Free Fire', points: '1.250 Pts', titles: '3x Winner' },
                { rank: 2, team: 'DEXZ GLORY ESPORTS', game: 'Mobile Legends', points: '1.100 Pts', titles: '2x Winner' },
                { rank: 3, team: 'EVOS HYDRA CLAN', game: 'Free Fire', points: '980 Pts', titles: '1x Winner' },
                { rank: 4, team: 'MYTHIC LEGENDS ID', game: 'Mobile Legends', points: '850 Pts', titles: '1x Winner' },
              ].map((item) => (
                <div key={item.rank} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      item.rank === 1 ? 'bg-amber-500 text-slate-950' : item.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-800 text-white'
                    }`}>
                      #{item.rank}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-white">{item.team}</h4>
                      <span className="text-[10px] text-slate-400">{item.game}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-amber-400 block">{item.points}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{item.titles}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYARAT & KETENTUAN LENGKAP */}
      {activeTab === 'syarat' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs text-slate-300">
            <h3 className="font-black text-sm text-amber-400 uppercase border-b border-slate-800 pb-2">
              SYARAT & KETENTUAN LENGKAP ORGANIZER DEXZ STORE
            </h3>

            <div className="space-y-2 leading-relaxed">
              <p>
                <strong>1. Hak Penyelenggara:</strong> Panitia DEXZ STORE berhak membatalkan pendaftaran atau menghentikan keikutsertaan tim yang melanggar kode etik, berbuat curang, atau menggunakan aplikasi pihak ketiga.
              </p>
              <p>
                <strong>2. Pengawasan Match:</strong> Pertandingan diawasi langsung oleh panitia sebagai pengamat (spectator/referee). Keputusan hakim pertandingan mutlak.
              </p>
              <p>
                <strong>3. Penyerahan Hadiah:</strong> Hadiah pemenang akan ditransfer maksimal 1x24 jam setelah Grand Final selesai ke rekening/e-wallet Kapten Tim.
              </p>
              <p>
                <strong>4. Perubahan Jadwal:</strong> Apabila terjadi kendala teknis dari server game (maintenance/down), jadwal penyesuaian akan diumumkan melalui WhatsApp Grup Resmi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
