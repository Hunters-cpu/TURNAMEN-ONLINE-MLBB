import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Swords, Save, Trash2, Award, Crown, Star } from 'lucide-react';
import { PastWinner, SiteConfig } from '../../types';

interface QuickWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner?: PastWinner | null;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  initialGame?: 'FF' | 'MLBB';
}

export const QuickWinnerModal: React.FC<QuickWinnerModalProps> = ({
  isOpen,
  onClose,
  winner,
  siteConfig,
  setSiteConfig,
  initialGame = 'FF'
}) => {
  const isEditing = Boolean(winner && winner.id);

  const [game, setGame] = useState<'FF' | 'MLBB'>(initialGame);
  const [season, setSeason] = useState('Season 1');
  const [date, setDate] = useState('Agustus 2026');
  const [firstPlace, setFirstPlace] = useState('');
  const [secondPlace, setSecondPlace] = useState('');
  const [thirdPlace, setThirdPlace] = useState('');
  const [mvp, setMvp] = useState('');
  const [prizeTotal, setPrizeTotal] = useState('Rp 1.440.000');

  useEffect(() => {
    if (winner) {
      setGame(winner.game === 'Free Fire' ? 'FF' : winner.game === 'Mobile Legends' ? 'MLBB' : (winner.game as any) || initialGame);
      setSeason(winner.season || 'Season 1');
      setDate(winner.date || 'Agustus 2026');
      setFirstPlace(winner.firstPlace || '');
      setSecondPlace(winner.secondPlace || '');
      setThirdPlace(winner.thirdPlace || '');
      setMvp(winner.mvp || '');
      setPrizeTotal(winner.prizeTotal || 'Rp 1.440.000');
    } else {
      const currentList = siteConfig.pastWinners || [];
      const nextSeason = `Season ${currentList.length + 1}`;
      setGame(initialGame);
      setSeason(nextSeason);
      setDate('Agustus 2026');
      setFirstPlace('');
      setSecondPlace('');
      setThirdPlace('');
      setMvp('');
      setPrizeTotal('Rp 1.440.000');
    }
  }, [winner, initialGame, isOpen, siteConfig.pastWinners]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstPlace.trim()) {
      alert('Nama Juara 1 wajib diisi!');
      return;
    }

    const currentList = siteConfig.pastWinners || [];
    let updatedList: PastWinner[];

    if (isEditing && winner) {
      updatedList = currentList.map(w => {
        if (w.id === winner.id) {
          return {
            ...w,
            game,
            season,
            date,
            firstPlace: firstPlace.trim(),
            secondPlace: secondPlace.trim() || undefined,
            thirdPlace: thirdPlace.trim() || undefined,
            mvp: mvp.trim() || undefined,
            prizeTotal: prizeTotal.trim() || undefined
          };
        }
        return w;
      });
    } else {
      const newWin: PastWinner = {
        id: `win-${Date.now()}`,
        game,
        season,
        date,
        firstPlace: firstPlace.trim(),
        secondPlace: secondPlace.trim() || undefined,
        thirdPlace: thirdPlace.trim() || undefined,
        mvp: mvp.trim() || undefined,
        prizeTotal: prizeTotal.trim() || undefined
      };
      updatedList = [newWin, ...currentList];
    }

    setSiteConfig({
      ...siteConfig,
      pastWinners: updatedList
    });
    onClose();
  };

  const handleDelete = () => {
    if (!winner) return;
    if (confirm(`Yakin ingin menghapus rekor juara "${winner.season}"?`)) {
      const currentList = siteConfig.pastWinners || [];
      const updatedList = currentList.filter(w => w.id !== winner.id);
      setSiteConfig({
        ...siteConfig,
        pastWinners: updatedList
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ EDIT LANGSUNG PAPAN JUARA
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? `Edit Rekor: ${winner?.season}` : 'Tambah Juara Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGame('FF')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-black text-xs uppercase ${
                game === 'FF'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-400 shadow-md ring-2 ring-orange-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Free Fire</span>
            </button>

            <button
              type="button"
              onClick={() => setGame('MLBB')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-black text-xs uppercase ${
                game === 'MLBB'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4 text-cyan-300" />
              <span>Mobile Legends</span>
            </button>
          </div>

          {/* Season & Date & Prize */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Season Turnamen:</label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Season 1"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Periode / Bulan:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Agustus 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Total Hadiah:</label>
              <input
                type="text"
                value={prizeTotal}
                onChange={(e) => setPrizeTotal(e.target.value)}
                placeholder="Rp 1.440.000"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Champions List */}
          <div className="p-3.5 bg-neutral-950/80 border border-purple-900/60 rounded-2xl space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>🥇 JUARA 1 (CHAMPION):</span>
              </label>
              <input
                type="text"
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                placeholder="Contoh: RRQ HOSHI / EVOS PHOENIX"
                className="w-full bg-[#06020c] border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-300" />
                  <span>🥈 Juara 2 (Runner-Up):</span>
                </label>
                <input
                  type="text"
                  value={secondPlace}
                  onChange={(e) => setSecondPlace(e.target.value)}
                  placeholder="Nama Tim Juara 2"
                  className="w-full bg-[#06020c] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>🥉 Juara 3:</span>
                </label>
                <input
                  type="text"
                  value={thirdPlace}
                  onChange={(e) => setThirdPlace(e.target.value)}
                  placeholder="Nama Tim Juara 3"
                  className="w-full bg-[#06020c] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-purple-400" />
                <span>🌟 Pemain Terbaik / MVP (Opsional):</span>
              </label>
              <input
                type="text"
                value={mvp}
                onChange={(e) => setMvp(e.target.value)}
                placeholder="Contoh: DEXZ REX (24 Kills)"
                className="w-full bg-[#06020c] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-900/60">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Hapus</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>Simpan Juara</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
