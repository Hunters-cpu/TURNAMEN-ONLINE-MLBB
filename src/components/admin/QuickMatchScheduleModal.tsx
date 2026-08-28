import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flame, Swords, Save, Trash2, Key, Trophy, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MatchSchedule, SiteConfig } from '../../types';

interface QuickMatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: MatchSchedule | null;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  initialGame?: 'FF' | 'MLBB';
}

export const QuickMatchScheduleModal: React.FC<QuickMatchScheduleModalProps> = ({
  isOpen,
  onClose,
  match,
  siteConfig,
  setSiteConfig,
  initialGame = 'FF'
}) => {
  const isEditing = Boolean(match && match.id);

  const [game, setGame] = useState<'FF' | 'MLBB'>(initialGame);
  const [phase, setPhase] = useState<string>('Babak Penyisihan');
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [day, setDay] = useState('Rabu');
  const [date, setDate] = useState('2 September 2026');
  const [time, setTime] = useState('19:00 WIB');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [status, setStatus] = useState<string>('mendatang');
  const [winner, setWinner] = useState<string>('');
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [youtubeStreamUrl, setYoutubeStreamUrl] = useState('');

  useEffect(() => {
    if (match) {
      setGame(match.game || initialGame);
      setPhase(match.phase || 'Babak Penyisihan');
      setMatchNumber(match.matchNumber || 1);
      setDay(match.day || 'Rabu');
      setDate(match.date || '2 September 2026');
      setTime(match.time || '19:00 WIB');
      setTeamA(match.teamA || '');
      setTeamB(match.teamB || '');
      setRoomCode(match.roomCode || match.roomId || '');
      setRoomPass(match.roomPass || match.roomPassword || '');
      setStatus(match.status || 'mendatang');
      setWinner(match.winner || '');
      setScoreA(match.scoreA || 0);
      setScoreB(match.scoreB || 0);
      setYoutubeStreamUrl(match.youtubeStreamUrl || '');
    } else {
      const currentMatches = siteConfig.matchSchedules || [];
      const nextMatchNum = currentMatches.length > 0 ? Math.max(...currentMatches.map(m => m.matchNumber || 0)) + 1 : 1;
      setGame(initialGame);
      setPhase('Babak Penyisihan');
      setMatchNumber(nextMatchNum);
      setDay('Rabu');
      setDate('2 September 2026');
      setTime('19:00 WIB');
      setTeamA('');
      setTeamB('');
      setRoomCode('');
      setRoomPass('');
      setStatus('mendatang');
      setWinner('');
      setScoreA(0);
      setScoreB(0);
      setYoutubeStreamUrl('');
    }
  }, [match, initialGame, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() && !teamB.trim() && game === 'MLBB') {
      alert('Isi minimal nama tim untuk pertandingan MLBB!');
      return;
    }

    const currentMatches = siteConfig.matchSchedules || [];
    let updatedList: MatchSchedule[];

    if (isEditing && match) {
      updatedList = currentMatches.map(m => {
        if (m.id === match.id) {
          return {
            ...m,
            game,
            phase,
            matchNumber: Number(matchNumber) || 1,
            day,
            date,
            time,
            teamA: teamA.trim(),
            teamB: teamB.trim(),
            roomCode: roomCode.trim(),
            roomPass: roomPass.trim(),
            roomId: roomCode.trim(),
            roomPassword: roomPass.trim(),
            status,
            winner: winner.trim() || undefined,
            scoreA: Number(scoreA) || 0,
            scoreB: Number(scoreB) || 0,
            youtubeStreamUrl: youtubeStreamUrl.trim() || undefined,
          };
        }
        return m;
      });
    } else {
      const newMatch: MatchSchedule = {
        id: `match-${Date.now()}`,
        game,
        phase,
        matchNumber: Number(matchNumber) || 1,
        day,
        date,
        time,
        teamA: teamA.trim() || (game === 'FF' ? 'Pot Match FF' : 'TBD Team A'),
        teamB: teamB.trim() || (game === 'FF' ? 'Lobby Squad' : 'TBD Team B'),
        roomCode: roomCode.trim(),
        roomPass: roomPass.trim(),
        roomId: roomCode.trim(),
        roomPassword: roomPass.trim(),
        status,
        winner: winner.trim() || undefined,
        scoreA: Number(scoreA) || 0,
        scoreB: Number(scoreB) || 0,
        youtubeStreamUrl: youtubeStreamUrl.trim() || undefined,
      };
      updatedList = [...currentMatches, newMatch];
    }

    setSiteConfig({
      ...siteConfig,
      matchSchedules: updatedList
    });
    onClose();
  };

  const handleDelete = () => {
    if (!match) return;
    if (confirm(`Yakin ingin menghapus jadwal Match #${match.matchNumber} (${match.teamA} vs ${match.teamB})?`)) {
      const currentMatches = siteConfig.matchSchedules || [];
      const updatedList = currentMatches.filter(m => m.id !== match.id);
      setSiteConfig({
        ...siteConfig,
        matchSchedules: updatedList
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                ⚡ EDIT LANGSUNG JADWAL MATCH
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? `Edit Jadwal Match #${matchNumber}` : 'Tambah Jadwal Pertandingan'}
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

          {/* Phase & Match Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Babak Pertandingan:</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold"
              >
                <option value="Babak Penyisihan">Babak Penyisihan</option>
                <option value="Babak 16 Besar">Babak 16 Besar</option>
                <option value="Perempat Final">Perempat Final</option>
                <option value="Semifinal">Semifinal</option>
                <option value="Perebutan Juara 3">Perebutan Juara 3</option>
                <option value="Grand Final">Grand Final</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nomor Match (#):</label>
              <input
                type="number"
                value={matchNumber}
                onChange={(e) => setMatchNumber(parseInt(e.target.value, 10) || 1)}
                placeholder="1"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Teams VS */}
          <div className="p-3.5 bg-neutral-950/80 border border-purple-900/60 rounded-2xl space-y-3">
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
              ⚔️ TIM YANG BERTANDING:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-bold">Tim A (Blue/Home):</label>
                <input
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Nama Tim A / Slot 1"
                  className="w-full bg-[#06020c] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-bold">Tim B (Red/Away):</label>
                <input
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Nama Tim B / Slot 2"
                  className="w-full bg-[#06020c] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Date, Day, Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Hari:</label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="Rabu"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Tanggal:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2 September 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Waktu (WIB):</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="19:00 WIB"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-indigo-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Room ID & Pass */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Room ID / Code Lobby:</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Contoh: 8829104"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-indigo-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Room Password:</label>
              <input
                type="text"
                value={roomPass}
                onChange={(e) => setRoomPass(e.target.value)}
                placeholder="Contoh: 1234"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-indigo-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Status & Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Status Match:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold"
              >
                <option value="mendatang">⏳ Mendatang</option>
                <option value="segera_dimulai">🟡 Segera Dimulai</option>
                <option value="berlangsung">🔴 LIVE Berlangsung</option>
                <option value="selesai">✅ Selesai</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Pemenang (Winner):</label>
              <input
                type="text"
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
                placeholder="Nama Tim Pemenang"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-indigo-400 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Skor (A - B):</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={scoreA}
                  onChange={(e) => setScoreA(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-2 py-2 text-xs text-white text-center font-mono font-bold"
                />
                <span className="text-neutral-500 font-bold">-</span>
                <input
                  type="number"
                  value={scoreB}
                  onChange={(e) => setScoreB(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-2 py-2 text-xs text-white text-center font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Stream URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">URL YouTube Live Stream (Opsional):</label>
            <input
              type="text"
              value={youtubeStreamUrl}
              onChange={(e) => setYoutubeStreamUrl(e.target.value)}
              placeholder="https://youtube.com/live/..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
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
                <span>Hapus Match</span>
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
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Match' : 'Tambahkan Match'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
