import React, { useState, useEffect } from 'react';
import { X, Users, Flame, Swords, Save, Trash2, CheckCircle2, ShieldCheck, Phone, Key, Clock, XCircle } from 'lucide-react';
import { RegisteredTeam } from '../../types';

interface QuickTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: RegisteredTeam | null;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  initialGame?: 'FF' | 'MLBB';
}

export const QuickTeamModal: React.FC<QuickTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  registeredTeams,
  setRegisteredTeams,
  initialGame = 'FF'
}) => {
  const isEditing = Boolean(team && team.id);

  const [teamName, setTeamName] = useState('');
  const [game, setGame] = useState<'FF' | 'MLBB'>(initialGame);
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [slotNumber, setSlotNumber] = useState<number>(1);
  const [status, setStatus] = useState<'Sah' | 'Menunggu Verifikasi' | 'Gagal'>('Sah');
  const [customPassword, setCustomPassword] = useState('');
  const [membersStr, setMembersStr] = useState('');

  useEffect(() => {
    if (team) {
      setTeamName(team.teamName || '');
      setGame(team.game === 'Free Fire' ? 'FF' : team.game === 'Mobile Legends' ? 'MLBB' : (team.game as any) || initialGame);
      setCaptainName(team.captainName || '');
      setCaptainPhone(team.captainPhone || '');
      setSlotNumber(team.slotNumber || 1);
      setStatus(team.status || 'Sah');
      setCustomPassword(team.customPassword || team.captainPin || '');
      setMembersStr(team.members ? team.members.join(', ') : '');
    } else {
      const activeGameTeams = registeredTeams.filter(t => (t.game === initialGame || (initialGame === 'FF' ? t.game === 'Free Fire' : t.game === 'Mobile Legends')) && t.status === 'Sah');
      const nextSlot = activeGameTeams.length + 1;
      setTeamName('');
      setGame(initialGame);
      setCaptainName('');
      setCaptainPhone('');
      setSlotNumber(nextSlot);
      setStatus('Sah');
      setCustomPassword(Math.floor(1000 + Math.random() * 9000).toString());
      setMembersStr('');
    }
  }, [team, initialGame, isOpen, registeredTeams]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !captainName.trim()) {
      alert('Nama Tim dan Nama Kapten wajib diisi!');
      return;
    }

    const membersArray = membersStr
      .split(/,|\n/)
      .map(m => m.trim())
      .filter(Boolean);

    if (isEditing && team) {
      setRegisteredTeams(prev =>
        prev.map(t => {
          if (t.id === team.id) {
            return {
              ...t,
              teamName: teamName.trim(),
              game,
              captainName: captainName.trim(),
              captainPhone: captainPhone.trim(),
              slotNumber: Number(slotNumber) || 1,
              status,
              customPassword: customPassword.trim() || t.customPassword,
              captainPin: customPassword.trim() || t.captainPin,
              members: membersArray.length > 0 ? membersArray : t.members
            };
          }
          return t;
        })
      );
    } else {
      const newTeam: RegisteredTeam = {
        id: `team-${Date.now()}`,
        teamName: teamName.trim(),
        game,
        captainName: captainName.trim(),
        captainPhone: captainPhone.trim() || '08xxxxxxxxxx',
        slotNumber: Number(slotNumber) || 1,
        status,
        roster: membersArray,
        members: membersArray,
        registeredAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        customPassword: customPassword.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
        captainPin: customPassword.trim() || Math.floor(1000 + Math.random() * 9000).toString()
      };
      setRegisteredTeams(prev => [newTeam, ...prev]);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!team) return;
    if (confirm(`Yakin ingin menghapus tim "${team.teamName}"?`)) {
      setRegisteredTeams(prev => prev.filter(t => t.id !== team.id));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ⚡ EDIT LANGSUNG DATA TIM
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? `Ubah Data Tim: ${team?.teamName}` : 'Tambah Tim Baru'}
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

          {/* Team Name & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nama Tim / Squad:</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Contoh: ONIC ESPORTS"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nomor Slot (#):</label>
              <input
                type="number"
                value={slotNumber}
                onChange={(e) => setSlotNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Captain Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nama Kapten Tim:</label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Contoh: Rian / Captain"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nomor WhatsApp Kapten:</label>
              <input
                type="text"
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Status Validasi Tim:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Sah')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'Sah'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400 scale-[1.02]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>🟢 SAH</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Menunggu Verifikasi')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'Menunggu Verifikasi'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-400 scale-[1.02]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>🟡 PENDING</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Gagal')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'Gagal'
                    ? 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-400 scale-[1.02]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>🔴 GAGAL / TOLAK</span>
              </button>
            </div>
          </div>

          {/* Members / Lineup */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Susunan Anggota Pemain (Pisahkan dengan koma):</label>
            <textarea
              rows={2}
              value={membersStr}
              onChange={(e) => setMembersStr(e.target.value)}
              placeholder="Player 1, Player 2, Player 3, Player 4, Player 5 (Cadangan)"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
            />
          </div>

          {/* PIN / Room Access */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">PIN / Kata Sandi Akses Tim:</label>
            <input
              type="text"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              placeholder="Contoh: 1234"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-400 font-mono"
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
                <span>Hapus Tim</span>
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
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>{isEditing ? 'Simpan Perubahan Tim' : 'Tambahkan Tim'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
