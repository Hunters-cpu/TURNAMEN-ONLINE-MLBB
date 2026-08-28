import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Swords, Calendar, Clock, DollarSign, Users, Image as ImageIcon, Save, Trash2, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { UpcomingTournament, SiteConfig } from '../../types';
import { MediaUploadField } from '../common/MediaUploadField';

interface QuickTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament?: UpcomingTournament | null;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  initialGame?: 'FF' | 'MLBB';
}

export const QuickTournamentModal: React.FC<QuickTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  siteConfig,
  setSiteConfig,
  initialGame = 'FF'
}) => {
  const isEditing = Boolean(tournament && tournament.id);

  const [title, setTitle] = useState('');
  const [game, setGame] = useState<'FF' | 'MLBB'>(initialGame);
  const [openDate, setOpenDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [prizePool, setPrizePool] = useState('Rp 1.440.000');
  const [slots, setSlots] = useState<number>(32);
  const [fee, setFee] = useState('Rp50.000/Tim');
  const [mode, setMode] = useState('SQUAD');
  const [status, setStatus] = useState<'Pendaftaran Dibuka' | 'Segera Dibuka' | 'Slot Hampir Penuh' | 'Pendaftaran Ditutup' | 'Sedang Berjalan'>('Pendaftaran Dibuka');
  const [bannerImage, setBannerImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (tournament) {
      setTitle(tournament.title || '');
      setGame(tournament.game || initialGame);
      setOpenDate(tournament.openDate || '20 Agustus 2026');
      setStartDate(tournament.startDate || '2 September 2026');
      setCloseDate(tournament.closeDate || '1 September 2026');
      setPrizePool(tournament.prizePool || 'Rp 1.440.000');
      setSlots(tournament.slots || 32);
      setFee(tournament.fee || 'Rp50.000/Tim');
      setMode(tournament.mode || (tournament.game === 'FF' ? 'SQUAD BR' : 'Custom 5v5'));
      setStatus((tournament.status as any) || 'Pendaftaran Dibuka');
      setBannerImage(tournament.bannerImage || '');
      setDescription(tournament.description || '');
    } else {
      setTitle(initialGame === 'FF' ? 'TURNAMEN FREE FIRE SEASON RESMI' : 'TURNAMEN MOBILE LEGENDS BANG BANG');
      setGame(initialGame);
      setOpenDate('20 Agustus 2026');
      setStartDate('2 September 2026');
      setCloseDate('1 September 2026');
      setPrizePool('Rp 1.440.000');
      setSlots(32);
      setFee('Rp50.000/Tim');
      setMode(initialGame === 'FF' ? 'SQUAD BATTLE ROYALE' : 'CUSTOM DRAFT PICK 5v5');
      setStatus('Pendaftaran Dibuka');
      setBannerImage(
        initialGame === 'FF'
          ? 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
      );
      setDescription(
        initialGame === 'FF'
          ? 'Battle Royale 6 Match • 3 Peta Berbeda (Bermuda, Purgatory, Kalahari) • Sistem Poin Standar'
          : 'Custom Draft Pick 5v5 • Single Elimination BO3 • Grand Final BO5 • Skin ON / Chat All OFF'
      );
    }
  }, [tournament, initialGame, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul turnamen wajib diisi!');
      return;
    }

    const currentList = siteConfig.upcomingTournaments || [];
    let updatedList: UpcomingTournament[];

    const isRegistrationOpenNow = status === 'Pendaftaran Dibuka' || status === 'Slot Hampir Penuh';

    if (isEditing && tournament) {
      updatedList = currentList.map(t => {
        if (t.id === tournament.id) {
          return {
            ...t,
            title: title.trim(),
            game,
            openDate,
            startDate,
            closeDate,
            prizePool,
            slots: Number(slots) || 32,
            fee,
            mode,
            status,
            isRegistrationOpen: isRegistrationOpenNow,
            bannerImage: bannerImage.trim(),
            description: description.trim()
          };
        }
        return t;
      });
    } else {
      const newTourney: UpcomingTournament = {
        id: `tourney-${Date.now()}`,
        title: title.trim(),
        game,
        openDate,
        startDate,
        closeDate,
        prizePool,
        slots: Number(slots) || 32,
        registeredCount: 0,
        fee,
        mode,
        status,
        isRegistrationOpen: isRegistrationOpenNow,
        bannerImage: bannerImage.trim(),
        description: description.trim()
      };
      updatedList = [newTourney, ...currentList];
    }

    // Sync siteConfig tournament info & active status
    const isFf = game === 'FF';
    const updatedConfig: SiteConfig = {
      ...siteConfig,
      upcomingTournaments: updatedList,
      ...(isFf ? {
        isFfTournamentActive: true,
        isFfRegistrationOpen: isRegistrationOpenNow,
        ffInfo: {
          ...siteConfig.ffInfo,
          title: title.trim(),
          matchDates: startDate,
          totalPrize: prizePool,
          maxSlots: Number(slots) || 32,
          fee: fee,
          deadline: closeDate,
          status: isRegistrationOpenNow ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup',
          bannerImage: bannerImage.trim() || siteConfig.ffInfo?.bannerImage
        }
      } : {
        isMlbbTournamentActive: true,
        isMlbbRegistrationOpen: isRegistrationOpenNow,
        mlbbInfo: {
          ...siteConfig.mlbbInfo,
          title: title.trim(),
          matchDates: startDate,
          totalPrize: prizePool,
          maxSlots: Number(slots) || 32,
          fee: fee,
          deadline: closeDate,
          status: isRegistrationOpenNow ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup',
          bannerImage: bannerImage.trim() || siteConfig.mlbbInfo?.bannerImage
        }
      })
    };

    setSiteConfig(updatedConfig);
    onClose();
  };

  const handleDelete = () => {
    if (!tournament) return;
    if (confirm(`Yakin ingin menghapus turnamen "${tournament.title}"?`)) {
      const currentList = siteConfig.upcomingTournaments || [];
      const updatedList = currentList.filter(t => t.id !== tournament.id);
      setSiteConfig({
        ...siteConfig,
        upcomingTournaments: updatedList
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ EDIT LANGSUNG TURNAMEN
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? 'Edit Turnamen' : 'Tambah Turnamen Baru'}
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
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-black text-xs uppercase ${
                game === 'FF'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-400 shadow-lg shadow-red-950/80 ring-2 ring-orange-400'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Free Fire</span>
            </button>

            <button
              type="button"
              onClick={() => setGame('MLBB')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-black text-xs uppercase ${
                game === 'MLBB'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-blue-950/80 ring-2 ring-cyan-400'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4 text-cyan-300" />
              <span>Mobile Legends</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Judul / Nama Turnamen:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: HUNTERS CHAMPIONSHIP SEASON 5"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-bold"
              required
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Buka Pendaftaran:</label>
              <input
                type="text"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                placeholder="20 Agustus 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Tanggal Tanding:</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="2 - 5 September 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Tutup Pendaftaran:</label>
              <input
                type="text"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                placeholder="1 September 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Prize, Slots, Fee, Mode */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Total Hadiah:</label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="Rp 1.440.000"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Kuota Slot:</label>
              <input
                type="number"
                value={slots}
                onChange={(e) => setSlots(parseInt(e.target.value, 10) || 32)}
                placeholder="32"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Biaya Slot:</label>
              <input
                type="text"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="Rp50.000/Tim"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Mode Match:</label>
              <input
                type="text"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                placeholder="SQUAD BR / 5v5"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Status Pendaftaran & Turnamen:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'Pendaftaran Dibuka', label: '🟢 BUKA DAFTAR', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
                { val: 'Slot Hampir Penuh', label: '🟡 HAMPIR PENUH', color: 'border-amber-500 text-amber-400 bg-amber-950/40' },
                { val: 'Sedang Berjalan', label: '🔵 SEDANG MATCH', color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40' },
                { val: 'Pendaftaran Ditutup', label: '🔴 TUTUP DAFTAR', color: 'border-red-500 text-red-400 bg-red-950/40' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setStatus(s.val as any)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    status === s.val
                      ? `${s.color} ring-2 ring-white/50 scale-[1.02]`
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Media Upload (Photo/Video) */}
          <MediaUploadField
            value={bannerImage}
            onChange={(val) => setBannerImage(val)}
            label="Upload Poster / Foto / Video Turnamen:"
            description="Pilih foto banner poster atau video teaser turnamen dari perangkat Anda (atau seret file ke sini)."
            mediaType="all"
          />

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Deskripsi / Format Aturan Singkat:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Format pertandingan, map, rules, dll..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
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
                <span>Hapus Turnamen</span>
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
                <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Turnamen'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
