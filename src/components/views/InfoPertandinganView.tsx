import React, { useState } from 'react';
import { 
  BarChart3, Calendar, Clock, Trophy, Key, ShieldCheck, Flame, Swords, ExternalLink, Award, Copy, 
  Search, CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft, Sparkles, FileText, Camera, Bell, 
  UserCheck, ShieldAlert, Send, PlusCircle, HelpCircle, Eye, ThumbsUp, PieChart, Upload, Image as ImageIcon,
  Plus, Edit3, Trash2
} from 'lucide-react';
import { TournamentBracketTree } from '../TournamentBracketTree';
import { MATCH_SCHEDULES, PAST_WINNERS } from '../../data/initialData';
import { 
  MatchSchedule, PastWinner, SiteConfig, RegisteredTeam, AttendanceConfirmation, 
  MatchResultRecord, RegistrationChangeRequest, MatchDispute, FeaturedTeam, UpcomingTournament, TabType 
} from '../../types';
import { notifyAdminEvent, notifyScheduleSwapRequest } from '../../lib/notificationService';
import { QuickMatchScheduleModal } from '../admin/QuickMatchScheduleModal';
import { QuickTournamentModal } from '../admin/QuickTournamentModal';
import { QuickWinnerModal } from '../admin/QuickWinnerModal';

interface InfoPertandinganViewProps {
  schedules?: MatchSchedule[];
  pastWinners?: PastWinner[];
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams?: RegisteredTeam[];
  setActiveTab?: (tab: TabType) => void;
  initialSubTab?: string;
  isAdmin?: boolean;
}

export const InfoPertandinganView: React.FC<InfoPertandinganViewProps> = ({
  schedules = MATCH_SCHEDULES,
  pastWinners = PAST_WINNERS,
  siteConfig,
  setSiteConfig,
  registeredTeams = [],
  setActiveTab,
  initialSubTab,
  isAdmin = false
}) => {
  const [activeTab, setActiveTabSub] = useState<
    'jadwal' | 'hasil' | 'bracket' | 'mendatang' | 'kalender' | 'unggulan' | 'prediksi' | 'statistik' | 'sengketa' | 'bukti' | 'ubah-data' | 'notifikasi' | 'juara'
  >((initialSubTab as any) || 'jadwal');

  // Modals for in-place admin editing
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatchToEdit, setSelectedMatchToEdit] = useState<MatchSchedule | null>(null);

  const [showTourneyModal, setShowTourneyModal] = useState(false);
  const [selectedTourneyToEdit, setSelectedTourneyToEdit] = useState<UpcomingTournament | null>(null);

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWinnerToEdit, setSelectedWinnerToEdit] = useState<PastWinner | null>(null);

  const handleAddNewSchedule = () => {
    setSelectedMatchToEdit(null);
    setShowMatchModal(true);
  };

  const handleEditSchedule = (match: MatchSchedule) => {
    setSelectedMatchToEdit(match);
    setShowMatchModal(true);
  };

  const handleDeleteSchedule = (matchId: string) => {
    if (!setSiteConfig || !siteConfig) return;
    if (confirm('Hapus jadwal pertandingan ini?')) {
      const currentList = siteConfig.matchSchedules || [];
      const updated = currentList.filter(m => m.id !== matchId);
      setSiteConfig({
        ...siteConfig,
        matchSchedules: updated
      });
    }
  };

  const handleAddNewTourney = () => {
    setSelectedTourneyToEdit(null);
    setShowTourneyModal(true);
  };

  const handleEditTourney = (tourney: UpcomingTournament) => {
    setSelectedTourneyToEdit(tourney);
    setShowTourneyModal(true);
  };

  const handleDeleteTourney = (tourneyId: string) => {
    if (!setSiteConfig || !siteConfig) return;
    if (confirm('Hapus turnamen mendatang ini?')) {
      const currentList = siteConfig.upcomingTournaments || [];
      const updated = currentList.filter(t => t.id !== tourneyId);
      setSiteConfig({
        ...siteConfig,
        upcomingTournaments: updated
      });
    }
  };

  const handleAddNewWinner = () => {
    setSelectedWinnerToEdit(null);
    setShowWinnerModal(true);
  };

  const handleEditWinner = (winner: PastWinner) => {
    setSelectedWinnerToEdit(winner);
    setShowWinnerModal(true);
  };

  const handleDeleteWinner = (season: string, game: 'FF' | 'MLBB') => {
    if (!setSiteConfig || !siteConfig) return;
    if (confirm(`Hapus data juara ${season} (${game})?`)) {
      const currentList = siteConfig.pastWinners || [];
      const updated = currentList.filter(w => !(w.season === season && w.game === game));
      setSiteConfig({
        ...siteConfig,
        pastWinners: updated
      });
    }
  };

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTabSub(initialSubTab as any);
    }
  }, [initialSubTab]);

  const [selectedGame, setSelectedGame] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [displayMode, setDisplayMode] = useState<'daftar' | 'pohon'>('daftar');
  const [searchTeamName, setSearchTeamName] = useState('');
  const [enteredCaptainPin, setEnteredCaptainPin] = useState('');
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  // Form states
  const [selectedMatchForAttendance, setSelectedMatchForAttendance] = useState<MatchSchedule | null>(null);
  const [attendanceTeamName, setAttendanceTeamName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'SIAP' | 'BELUM_SIAP'>('SIAP');
  const [attendanceReason, setAttendanceReason] = useState('');

  // Dispute form
  const [disputeMatchId, setDisputeMatchId] = useState('');
  const [disputeReporterTeam, setDisputeReporterTeam] = useState('');
  const [disputeOpponentTeam, setDisputeOpponentTeam] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeEvidenceUrl, setDisputeEvidenceUrl] = useState('');
  const [disputePhotoPreview, setDisputePhotoPreview] = useState('');
  const [disputePhotoName, setDisputePhotoName] = useState('');

  const handleDisputePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDisputePhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setDisputePhotoPreview(result);
        setDisputeEvidenceUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change request form
  const [changeTeamName, setChangeTeamName] = useState('');
  const [changeGame, setChangeGame] = useState<'FF' | 'MLBB'>('FF');
  const [changeCaptainPhone, setChangeCaptainPhone] = useState('');
  const [changeType, setChangeType] = useState<'NAMA_TIM' | 'SUSUNAN_PEMAIN' | 'KONTAK'>('SUSUNAN_PEMAIN');
  const [changeOldData, setChangeOldData] = useState('');
  const [changeNewData, setChangeNewData] = useState('');

  // Web Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('hunters_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      browserNotif: true,
      matchReminder: true,
      resultNotif: true,
      announcementNotif: true,
    };
  });

  const saveNotifPreferences = (updated: typeof notifPreferences) => {
    setNotifPreferences(updated);
    try {
      localStorage.setItem('hunters_notif_prefs', JSON.stringify(updated));
    } catch (e) {}
  };

  // Prediction vote helper
  const [votedPredictions, setVotedPredictions] = useState<Record<string, 'A' | 'B'>>({});

  const handleVotePrediction = (matchId: string, team: 'A' | 'B') => {
    if (votedPredictions[matchId]) {
      alert('Anda sudah memberikan prediksi untuk pertandingan ini!');
      return;
    }
    setVotedPredictions(prev => ({ ...prev, [matchId]: team }));
    alert(`Terima kasih! Prediksi Anda telah dicatat untuk Tim ${team}.`);
  };

  const allPhases = [
    'Babak Penyisihan',
    'Babak 16 Besar',
    'Perempat Final',
    'Semifinal',
    'Perebutan Juara 3',
    'Grand Final'
  ];

  const visiblePhases = selectedPhase === 'ALL' ? allPhases : [selectedPhase];

  const handleVerifyCaptain = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCaptainPin.trim().length >= 4) {
      setShowRoomDetails(true);
    } else {
      alert('Masukkan PIN / Nomor HP Kapten untuk verifikasi room!');
    }
  };

  // Save attendance confirmation
  const handleConfirmAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForAttendance || !attendanceTeamName.trim()) {
      alert('Silakan pilih match dan isi nama tim Anda!');
      return;
    }

    // Validate that attendance confirmation is ONLY for the relevant team playing in this match or registered in this game
    const matchTeamA = selectedMatchForAttendance.teamA?.toLowerCase().trim();
    const matchTeamB = selectedMatchForAttendance.teamB?.toLowerCase().trim();
    const inputTeam = attendanceTeamName.toLowerCase().trim();

    const isMatchParticipant = (matchTeamA && inputTeam === matchTeamA) || (matchTeamB && inputTeam === matchTeamB);
    const isRegisteredTeam = registeredTeams.some(
      t => t.game === selectedMatchForAttendance.game && t.teamName.toLowerCase().trim() === inputTeam
    );

    if (!isMatchParticipant && !isRegisteredTeam) {
      alert(`⚠️ KONFIRMASI KEHADIRAN DITOLAK!\n\nKonfirmasi kehadiran HANYA UNTUK TIM YANG BERSANGKUTAN pada match ini (${selectedMatchForAttendance.teamA || 'Tim A'} vs ${selectedMatchForAttendance.teamB || 'Tim B'}).\n\nNama tim "${attendanceTeamName}" tidak terdaftar dalam pertandingan ini.`);
      return;
    }

    const currentConfirmations = siteConfig?.attendanceConfirmations || [];
    const existing = currentConfirmations.find(
      c => c.matchId === selectedMatchForAttendance.id && c.teamName.toLowerCase() === attendanceTeamName.toLowerCase().trim()
    );

    if (existing && existing.hasChosen) {
      alert('⚠️ HANYA BISA 1 KALI MEMILIH! Tim Anda sudah melakukan konfirmasi kehadiran sebelumnya.');
      return;
    }

    // Determine swap request target
    const allMatchesInPhase = schedules.filter(s => s.phase === selectedMatchForAttendance.phase && s.game === selectedMatchForAttendance.game);
    const currentIndex = allMatchesInPhase.findIndex(s => s.id === selectedMatchForAttendance.id);
    const nextMatch = allMatchesInPhase[currentIndex + 1] || allMatchesInPhase[0];
    const nextTeamName = nextMatch ? (nextMatch.teamA || nextMatch.teamB || 'Tim Berikutnya') : 'Tim Berikutnya';

    let swapStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'PENDING';
    let alertMsg = '';

    if (attendanceStatus === 'SIAP') {
      alertMsg = `✅ Konfirmasi Kehadiran TERKIRIM: Tim "${attendanceTeamName}" TERKONFIRMASI SIAP!\n\nCatatan Penting: Apabila saat jam tanding tim tidak hadir / terlambat > 5 menit, maka tim akan Otomatis DISKUALIFIKASI.`;
    } else {
      // BELUM SIAP
      if (!attendanceReason.trim()) {
        alert('Mohon isi alasan kenapa tim belum siap!');
        return;
      }

      // Check if next team is already SIAP or BELUM SIAP
      const nextTeamConfirmation = currentConfirmations.find(
        c => c.matchId === nextMatch?.id && c.status === 'SIAP'
      );

      if (nextTeamConfirmation) {
        swapStatus = 'ACCEPTED';
        alertMsg = `🔄 OTOMATIS TUKAR JADWAL SUCCESS!\n\nTim berikutnya ("${nextTeamConfirmation.teamName}") telah memilih SIAP. Jadwal pertandingan antara match #${selectedMatchForAttendance.matchNumber} dan match #${nextMatch?.matchNumber} berhasil DITUKAR!`;
      } else {
        swapStatus = 'PENDING';
        alertMsg = `⚠️ Permintaan Penukaran Jadwal telah dikirimkan ke "${nextTeamName}".\n\nAturan Resmi: Menunggu konfirmasi tim berikutnya. Jika tim berikutnya memilih BELUM SIAP juga, maka Tim "${attendanceTeamName}" WAJIB SIAP di jadwal semula. Jika tidak hadir, maka DISKUALIFIKASI.`;
      }
    }

    const newConf: AttendanceConfirmation = {
      id: 'att-' + Date.now(),
      matchId: selectedMatchForAttendance.id,
      teamName: attendanceTeamName.trim(),
      status: attendanceStatus,
      reason: attendanceReason.trim() || undefined,
      swapRequestedWith: attendanceStatus === 'BELUM_SIAP' ? nextTeamName : undefined,
      swapStatus: attendanceStatus === 'BELUM_SIAP' ? swapStatus : undefined,
      hasChosen: true,
      createdAt: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    if (setSiteConfig && siteConfig) {
      const updated = [...(siteConfig.attendanceConfirmations || []), newConf];
      setSiteConfig({ ...siteConfig, attendanceConfirmations: updated });
    }

    if (attendanceStatus === 'BELUM_SIAP') {
      notifyScheduleSwapRequest(
        attendanceTeamName.trim(),
        nextTeamName,
        '',
        selectedMatchForAttendance.time,
        `${selectedMatchForAttendance.phase} (Match #${selectedMatchForAttendance.matchNumber})`
      );
      notifyAdminEvent(
        'laporan',
        'Permintaan Tukar Jadwal',
        `Tim "${attendanceTeamName.trim()}" mengajukan tukar jadwal dengan "${nextTeamName}". Alasan: ${attendanceReason.trim()}`,
        newConf
      );
    }

    alert(alertMsg);
    setSelectedMatchForAttendance(null);
    setAttendanceReason('');
  };

  // Submit dispute
  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReporterTeam.trim() || !disputeDescription.trim()) {
      alert('Isi nama tim pelapor dan penjelasan sengketa!');
      return;
    }

    const timeStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newDispute: MatchDispute = {
      id: 'disp-' + Date.now(),
      matchId: disputeMatchId || 'Umum',
      game: selectedGame === 'ALL' ? 'FF' : selectedGame,
      reporterTeam: disputeReporterTeam.trim(),
      opponentTeam: disputeOpponentTeam.trim() || 'Lawan',
      issueDescription: disputeDescription.trim(),
      evidenceUrl: disputeEvidenceUrl.trim() || undefined,
      status: 'DIPROSES',
      createdAt: timeStr
    };

    if (setSiteConfig && siteConfig) {
      const updated = [newDispute, ...(siteConfig.matchDisputes || [])];
      setSiteConfig({ ...siteConfig, matchDisputes: updated });
    }

    notifyAdminEvent(
      'laporan',
      'Laporan Sengketa / Protest Match Baru',
      `Laporan dari Tim "${disputeReporterTeam.trim()}" vs "${disputeOpponentTeam.trim() || 'Lawan'}": ${disputeDescription.trim()}`,
      newDispute
    );

    alert('⚖️ Laporan sengketa pertandingan berhasil dikirimkan! Panitia akan meninjau bukti foto tangkapan layar / rekaman dalam 15-30 menit.');
    setDisputeReporterTeam('');
    setDisputeOpponentTeam('');
    setDisputeDescription('');
    setDisputeEvidenceUrl('');
    setDisputePhotoPreview('');
    setDisputePhotoName('');
  };

  // Submit registration edit request
  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTeamName.trim() || !changeNewData.trim()) {
      alert('Isi nama tim dan data baru yang diajukan!');
      return;
    }

    const newReq: RegistrationChangeRequest = {
      id: 'req-' + Date.now(),
      teamName: changeTeamName.trim(),
      game: changeGame,
      captainPhone: changeCaptainPhone.trim(),
      changeType: changeType,
      oldData: changeOldData.trim() || '-',
      newData: changeNewData.trim(),
      status: 'PENDING',
      createdAt: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    if (setSiteConfig && siteConfig) {
      const updated = [newReq, ...(siteConfig.registrationChanges || [])];
      setSiteConfig({ ...siteConfig, registrationChanges: updated });
    }

    alert('📝 Permohonan perubahan data pendaftaran berhasil dikirim! Panitia akan memproses verifikasi sebelum pendaftaran ditutup.');
    setChangeTeamName('');
    setChangeCaptainPhone('');
    setChangeOldData('');
    setChangeNewData('');
  };

  // Filtered schedules by game, phase, and search term
  const filteredSchedules = schedules.filter(s => {
    const matchGame = selectedGame === 'ALL' || s.game === selectedGame;
    const matchPhase = selectedPhase === 'ALL' || s.phase === selectedPhase;
    const matchSearch = !searchTeamName.trim() || 
      (s.teamA && s.teamA.toLowerCase().includes(searchTeamName.toLowerCase().trim())) ||
      (s.teamB && s.teamB.toLowerCase().includes(searchTeamName.toLowerCase().trim())) ||
      (s.winner && s.winner.toLowerCase().includes(searchTeamName.toLowerCase().trim()));
    return matchGame && matchPhase && matchSearch;
  });

  const matchResultsList = siteConfig?.matchResults || [];
  const featuredTeamsList = siteConfig?.featuredTeams || [];
  const upcomingTournamentsList = siteConfig?.upcomingTournaments || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER */}
      <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="w-48 h-48 text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
          <BarChart3 className="w-4 h-4" />
          <span>MATCH & TOURNAMENT CENTER</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          📊 INFORMASI PERTANDINGAN & KONTROL TIM
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
          Pusat kontrol pertandingan lengkap: Cari jadwal tim, konfirmasi kehadiran & tukar jadwal, cek hasil (gugur/lolos), bracket bagan gugur, statistik hero, sengketa, hingga pengaturan notifikasi web.
        </p>
      </div>

      {/* MULTI-TAB GRID NAVIGATION BAR (Bukan Menu Geser, Setiap Menu Berdiri Sendiri) */}
      <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-amber-500/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              🎮 KONTROL & PILIHAN MENU PERTANDINGAN
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/40">
              13 Menu Mandiri
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Klik menu di bawah untuk membuka fiturnya secara instan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {/* 1. CEK JADWAL */}
          <button
            onClick={() => setActiveTabSub('jadwal')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'jadwal'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border-amber-400 ring-2 ring-amber-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Search className={`w-4 h-4 shrink-0 ${activeTab === 'jadwal' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="text-xs font-extrabold truncate">🔍 Cek Jadwal Tim</span>
          </button>

          {/* 2. HASIL PERTANDINGAN */}
          <button
            onClick={() => setActiveTabSub('hasil')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'hasil'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-emerald-500/40'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'hasil' ? 'text-slate-950' : 'text-emerald-400'}`} />
            <span className="text-xs font-extrabold truncate">🧾 Hasil Match</span>
          </button>

          {/* 3. BRACKET */}
          <button
            onClick={() => setActiveTabSub('bracket')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'bracket'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20 border-blue-400 ring-2 ring-blue-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-blue-500/40'
            }`}
          >
            <Trophy className={`w-4 h-4 shrink-0 ${activeTab === 'bracket' ? 'text-white' : 'text-blue-400'}`} />
            <span className="text-xs font-extrabold truncate">📂 Bracket Gugur</span>
          </button>

          {/* 4. TURNAMEN MENDATANG */}
          <button
            onClick={() => setActiveTabSub('mendatang')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'mendatang'
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/20 border-purple-400 ring-2 ring-purple-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-purple-500/40'
            }`}
          >
            <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'mendatang' ? 'text-white' : 'text-purple-400'}`} />
            <span className="text-xs font-extrabold truncate">📋 Turnamen Mendatang</span>
          </button>

          {/* 5. KALENDER EVENT */}
          <button
            onClick={() => setActiveTabSub('kalender')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'kalender'
                ? 'bg-amber-600 text-white font-black shadow-lg shadow-amber-600/20 border-amber-400 ring-2 ring-amber-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'kalender' ? 'text-white' : 'text-amber-400'}`} />
            <span className="text-xs font-extrabold truncate">📅 Kalender Pertandingan</span>
          </button>

          {/* 6. TIM UNGGULAN */}
          <button
            onClick={() => setActiveTabSub('unggulan')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'unggulan'
                ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20 border-orange-400 ring-2 ring-orange-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-orange-500/40'
            }`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'unggulan' ? 'text-slate-950' : 'text-orange-400'}`} />
            <span className="text-xs font-extrabold truncate">⭐ Tim Unggulan</span>
          </button>

          {/* 7. PREDIKSI MATCH */}
          <button
            onClick={() => setActiveTabSub('prediksi')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'prediksi'
                ? 'bg-red-500 text-white font-black shadow-lg shadow-red-500/20 border-red-400 ring-2 ring-red-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-red-500/40'
            }`}
          >
            <Flame className={`w-4 h-4 shrink-0 ${activeTab === 'prediksi' ? 'text-white' : 'text-red-400'}`} />
            <span className="text-xs font-extrabold truncate">🎯 Prediksi Match</span>
          </button>

          {/* 8. STATISTIK TURNAMEN */}
          <button
            onClick={() => setActiveTabSub('statistik')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'statistik'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-cyan-500/40'
            }`}
          >
            <PieChart className={`w-4 h-4 shrink-0 ${activeTab === 'statistik' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span className="text-xs font-extrabold truncate">📊 Statistik Hero & Tim</span>
          </button>

          {/* 9. BUKTI MATCH */}
          <button
            onClick={() => setActiveTabSub('bukti')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'bukti'
                ? 'bg-pink-600 text-white font-black shadow-lg shadow-pink-600/20 border-pink-400 ring-2 ring-pink-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-pink-500/40'
            }`}
          >
            <Camera className={`w-4 h-4 shrink-0 ${activeTab === 'bukti' ? 'text-white' : 'text-pink-400'}`} />
            <span className="text-xs font-extrabold truncate">📸 Galeri Bukti Match</span>
          </button>

          {/* 10. SENGKETA & BANDING */}
          <button
            onClick={() => setActiveTabSub('sengketa')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'sengketa'
                ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/20 border-red-400 ring-2 ring-red-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-red-500/40'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'sengketa' ? 'text-white' : 'text-red-400'}`} />
            <span className="text-xs font-extrabold truncate">⚖️ Sengketa & Banding</span>
          </button>

          {/* 11. UBAH DATA */}
          <button
            onClick={() => setActiveTabSub('ubah-data')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'ubah-data'
                ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20 border-indigo-400 ring-2 ring-indigo-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-indigo-500/40'
            }`}
          >
            <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'ubah-data' ? 'text-white' : 'text-indigo-400'}`} />
            <span className="text-xs font-extrabold truncate">📝 Ubah Data Tim</span>
          </button>

          {/* 12. NOTIFIKASI */}
          <button
            onClick={() => setActiveTabSub('notifikasi')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'notifikasi'
                ? 'bg-yellow-500 text-slate-950 font-black shadow-lg shadow-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-yellow-500/40'
            }`}
          >
            <Bell className={`w-4 h-4 shrink-0 ${activeTab === 'notifikasi' ? 'text-slate-950' : 'text-yellow-400'}`} />
            <span className="text-xs font-extrabold truncate">⚙️ Pengaturan Notifikasi</span>
          </button>

          {/* 13. JUARA */}
          <button
            onClick={() => setActiveTabSub('juara')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 col-span-2 sm:col-span-1 ${
              activeTab === 'juara'
                ? 'bg-amber-400 text-slate-950 font-black shadow-lg border-amber-300 ring-2 ring-amber-300 scale-[1.02]'
                : 'bg-[#050505] hover:bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-400/40'
            }`}
          >
            <Award className={`w-4 h-4 shrink-0 ${activeTab === 'juara' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="text-xs font-extrabold truncate">🏆 Papan Juara</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 🔍 CEK JADWAL TIM + KONFIRMASI KEHADIRAN & TUKAR JADWAL */}
      {/* ========================================================================= */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SEARCH BOX & GAME & PHASE & DISPLAY MODE SELECTORS */}
          <div className="bg-[#0b0318]/90 p-5 sm:p-6 rounded-2xl border border-purple-900/60 space-y-5 shadow-2xl">
            {/* 1. SEARCH INPUT BAR & ADMIN ADD BUTTON */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>🔍 CARI JADWAL PERTANDINGAN DENGAN NAMA TIM:</span>
                </label>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleAddNewSchedule}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Jadwal Baru</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik nama tim (contoh: EVOS, RRQ, Slot 1, ...)"
                  value={searchTeamName}
                  onChange={(e) => setSearchTeamName(e.target.value)}
                  className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-4 py-3 pl-11 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono shadow-inner"
                />
                <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                {searchTeamName && (
                  <button
                    type="button"
                    onClick={() => setSearchTeamName('')}
                    className="absolute right-3 top-2.5 text-xs bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 px-2 py-1 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* 2. PILIHAN BABAK (PHASE SELECTOR) */}
            <div className="space-y-2 border-t border-purple-900/40 pt-4">
              <label className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <span>📂 PILIHAN BABAK:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: '[Semua Babak]' },
                  { id: 'Babak Penyisihan', label: 'Babak Penyisihan' },
                  { id: 'Babak 16 Besar', label: 'Babak 16 Besar' },
                  { id: 'Perempat Final', label: 'Perempat Final' },
                  { id: 'Semifinal', label: 'Semifinal' },
                  { id: 'Perebutan Juara 3', label: 'Perebutan Juara 3' },
                  { id: 'Grand Final', label: 'Grand Final' },
                ].map((ph) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setSelectedPhase(ph.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      selectedPhase === ph.id
                        ? 'bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-950/80 ring-1 ring-purple-400 scale-[1.02]'
                        : 'bg-[#120626] border-purple-950 text-purple-300/80 hover:text-white hover:border-purple-600/50'
                    }`}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SUSUNAN TAMPILAN & 4. PILIH GAME & COUNTER BADGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-purple-900/40 pt-4 items-center">
              {/* 🗂️ SUSUNAN TAMPILAN */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider block">
                  🗂️ SUSUNAN TAMPILAN:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('daftar')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      displayMode === 'daftar'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-[#120626] border-purple-950 text-purple-300 hover:text-white'
                    }`}
                  >
                    <span>[Daftar Pertandingan]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode('pohon')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      displayMode === 'pohon'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 font-black shadow-md shadow-emerald-950/80 ring-1 ring-emerald-400'
                        : 'bg-[#120626] border-purple-950 text-purple-300 hover:text-white'
                    }`}
                  >
                    <span>🌳 POHON BABAK</span>
                  </button>
                </div>
              </div>

              {/* ⚔️ PILIH GAME */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider block">
                  ⚔️ PILIH GAME:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGame('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedGame === 'ALL'
                        ? 'bg-purple-600 text-white border-purple-400 font-black'
                        : 'bg-[#120626] border-purple-950 text-purple-300 hover:text-white'
                    }`}
                  >
                    [Semua]
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGame('FF')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedGame === 'FF'
                        ? 'bg-red-600 text-white border-red-400 font-black'
                        : 'bg-[#120626] border-purple-950 text-purple-300 hover:text-red-400'
                    }`}
                  >
                    🔥 Free Fire
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGame('MLBB')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedGame === 'MLBB'
                        ? 'bg-cyan-600 text-white border-cyan-400 font-black'
                        : 'bg-[#120626] border-purple-950 text-purple-300 hover:text-cyan-300'
                    }`}
                  >
                    ⚔️ Mobile Legends
                  </button>
                </div>
              </div>

              {/* COUNTER BADGE */}
              <div className="flex justify-start lg:justify-end items-center">
                <div className="bg-[#120626] border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-mono font-bold text-purple-200 shadow-md">
                  Ditemukan: <strong className="text-amber-400 text-sm">{filteredSchedules.length}</strong> Pertandingan
                </div>
              </div>
            </div>
          </div>

          {/* DISPLAY MODE CONDITIONAL RENDERING */}
          {displayMode === 'pohon' ? (
            <TournamentBracketTree
              schedules={schedules}
              selectedGame={selectedGame}
              selectedPhase={selectedPhase}
            />
          ) : filteredSchedules.length === 0 ? (
            <div className="bg-[#090909] border border-neutral-800 rounded-2xl p-10 text-center space-y-3 shadow-xl">
              <Calendar className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-base font-black text-white uppercase">Belum Ada Jadwal Pertandingan</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Jadwal pertandingan turnamen belum dibuat atau belum ada pertandingan yang cocok dengan filter pencarian. Silakan pantau pengumuman resmi dan grup WhatsApp turnamen.
              </p>
            </div>
          ) : (
            <>
              {/* SCHEDULE CARDS GRID */}
              {visiblePhases.map((phaseName) => {
              const phaseSchedules = filteredSchedules.filter(s => s.phase === phaseName);
              if (phaseSchedules.length === 0) return null;

              return (
              <div key={phaseName} className="bg-[#090909] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>{phaseName}</span>
                  </h2>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-full">
                    {phaseSchedules.length} Match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phaseSchedules.map((match) => {
                    const confirmations = siteConfig?.attendanceConfirmations?.filter(c => c.matchId === match.id) || [];
                    const teamAConf = confirmations.find(c => c.teamName.toLowerCase() === (match.teamA || '').toLowerCase());
                    const teamBConf = confirmations.find(c => c.teamName.toLowerCase() === (match.teamB || '').toLowerCase());

                    return (
                      <div key={match.id} className="bg-[#050505] border border-neutral-800 hover:border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg transition-all">
                        {/* Match Bar Header */}
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs flex items-center justify-center">
                              #{match.matchNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              match.game === 'FF' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {match.game}
                            </span>
                            <span className="text-xs font-bold text-neutral-300">
                              {match.day}, {match.date}
                            </span>
                          </div>

                          <span className="text-xs font-mono font-bold text-emerald-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            🕒 {match.time}
                          </span>
                        </div>

                        {/* Teams VS */}
                        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Team A */}
                            <div className="flex-1 text-center p-2 rounded bg-neutral-900 border border-neutral-800">
                              <p className="text-xs font-black text-white truncate">{match.teamA || 'Belum Ada'}</p>
                              {teamAConf && (
                                <span className={`text-[9px] font-bold block mt-1 px-1.5 py-0.5 rounded ${
                                  teamAConf.status === 'SIAP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                                }`}>
                                  {teamAConf.status === 'SIAP' ? '✅ SIAP' : '⚠️ BELUM SIAP'}
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-black text-amber-400 px-2 py-1 bg-amber-500/10 rounded border border-amber-500/30">
                              VS
                            </span>

                            {/* Team B */}
                            <div className="flex-1 text-center p-2 rounded bg-neutral-900 border border-neutral-800">
                              <p className="text-xs font-black text-white truncate">{match.teamB || 'Belum Ada'}</p>
                              {teamBConf && (
                                <span className={`text-[9px] font-bold block mt-1 px-1.5 py-0.5 rounded ${
                                  teamBConf.status === 'SIAP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                                }`}>
                                  {teamBConf.status === 'SIAP' ? '✅ SIAP' : '⚠️ BELUM SIAP'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Room Info */}
                        <div className="flex items-center justify-between text-xs bg-neutral-950 p-2 rounded border border-neutral-800 font-mono">
                          <span className="text-neutral-400 font-sans text-[11px]">Room Lobby:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400">ID: {match.roomCode || '-'}</span>
                            <span className="text-amber-300">PASS: {match.roomPass || '-'}</span>
                          </div>
                        </div>

                        {/* CONFIRMATION ATTENDANCE BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMatchForAttendance(match);
                            setAttendanceTeamName(match.teamA || match.teamB || '');
                          }}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✅ Konfirmasi Kehadiran / Tukar Jadwal</span>
                        </button>

                        {/* ADMIN DIRECT ACTIONS */}
                        {isAdmin && (
                          <div className="flex items-center gap-2 pt-2 border-t border-purple-900/40">
                            <button
                              type="button"
                              onClick={() => handleEditSchedule(match)}
                              className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Jadwal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(match.id)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </>
          )}

          {/* MODAL / FORM KONFIRMASI KEHADIRAN */}
          {selectedMatchForAttendance && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>KONFIRMASI KEHADIRAN & TUKAR JADWAL</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Match #{selectedMatchForAttendance.matchNumber} • {selectedMatchForAttendance.phase}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatchForAttendance(null)}
                    className="p-1 text-neutral-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleConfirmAttendance} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-bold">Pilih Nama Tim Anda:</label>
                    <select
                      value={attendanceTeamName}
                      onChange={(e) => setAttendanceTeamName(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pilih Tim --</option>
                      {selectedMatchForAttendance.teamA && <option value={selectedMatchForAttendance.teamA}>{selectedMatchForAttendance.teamA}</option>}
                      {selectedMatchForAttendance.teamB && <option value={selectedMatchForAttendance.teamB}>{selectedMatchForAttendance.teamB}</option>}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-neutral-300 font-bold block">Status Kehadiran Tim:</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* OPTION 1: SIAP */}
                      <button
                        type="button"
                        onClick={() => setAttendanceStatus('SIAP')}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                          attendanceStatus === 'SIAP'
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg'
                            : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-black">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>SIAP BERTANDING</span>
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          Terkonfirmasi otomatis. (Jika saat tanding tidak hadir = DISKUALIFIKASI)
                        </p>
                      </button>

                      {/* OPTION 2: BELUM SIAP */}
                      <button
                        type="button"
                        onClick={() => setAttendanceStatus('BELUM_SIAP')}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                          attendanceStatus === 'BELUM_SIAP'
                            ? 'bg-red-950/80 border-red-500 text-red-300 shadow-lg'
                            : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-black">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>BELUM SIAP</span>
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          Kirim permohonan penukaran jadwal ke tim berikutnya.
                        </p>
                      </button>
                    </div>
                  </div>

                  {attendanceStatus === 'BELUM_SIAP' && (
                    <div className="space-y-1.5 p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
                      <label className="text-red-300 font-bold block">Beri Alasan Belum Siap:</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Contoh: Kendala sinyal internet buruk / Mati listrik / Bentrok jam kerja..."
                        value={attendanceReason}
                        onChange={(e) => setAttendanceReason(e.target.value)}
                        className="w-full bg-[#050505] border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <p className="text-[10px] text-neutral-400 pt-1 leading-relaxed">
                        ⚠️ <strong>Aturan Penukaran:</strong> Otomatis mengirimkan permohonan ke tim berikutnya. Jika tim berikutnya SIAP, jadwal ditukar. Jika BELUM SIAP juga, tim Anda WAJIB SIAP jika tidak ingin DISKUALIFIKASI. (HANYA BISA 1 KALI MEMILIH)
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchForAttendance(null)}
                      className="flex-1 py-2.5 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 rounded-xl font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider cursor-pointer shadow-lg"
                    >
                      Kirim Konfirmasi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 🧾 HASIL PERTANDINGAN (LOLOS vs GUGUR DENGAN ALASAN) */}
      {/* ========================================================================= */}
      {activeTab === 'hasil' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 font-black text-xs uppercase mb-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HASIL RESMI PERTANDINGAN</span>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">🧾 HASIL PERTANDINGAN TURNAMEN</h2>
                <p className="text-xs text-neutral-400">
                  Daftar hasil pertandingan resmi: Tim yang LOLOS ke babak berikutnya & Tim yang GUGUR beserta alasan gugur (Kalah Bertanding, Diskualifikasi, Mengundurkan Diri).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl font-bold">
                  Total Hasil: {matchResultsList.length} Match
                </span>
              </div>
            </div>

            {matchResultsList.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 bg-[#050505] rounded-xl border border-neutral-800 space-y-2">
                <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-bold">Belum ada hasil pertandingan resmi yang dicatat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchResultsList.map((res) => (
                  <div key={res.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-xs font-black text-amber-400">{res.phase}</span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        {res.game} • {res.createdAt}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* WINNER: LOLOS */}
                      <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl space-y-1 text-center">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">🟢 STATUS: LOLOS</span>
                        <p className="text-sm font-black text-white truncate">{res.winningTeam}</p>
                        <span className="text-[10px] text-emerald-300 font-mono block">Skor: {res.score || 'Menang'}</span>
                      </div>

                      {/* LOSER: GUGUR */}
                      <div className="bg-red-950/40 border border-red-500/40 p-3 rounded-xl space-y-1 text-center">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">🔴 STATUS: GUGUR</span>
                        <p className="text-sm font-black text-white truncate">{res.losingTeam}</p>
                        
                        {/* ALASAN GUGUR BADGE */}
                        <div className="pt-1">
                          {res.eliminationReason === 'DISKUALIFIKASI' && (
                            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-black uppercase">
                              🚫 DISKUALIFIKASI
                            </span>
                          )}
                          {res.eliminationReason === 'KALAH_BERTANDING' && (
                            <span className="px-2 py-0.5 bg-neutral-800 text-red-300 border border-red-800 rounded text-[9px] font-bold uppercase">
                              ⚔️ KALAH BERTANDING
                            </span>
                          )}
                          {res.eliminationReason === 'MENGUNDURKAN_DIRI' && (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold uppercase">
                              🏳️ MENGUNDURKAN DIRI (WO)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {res.customReason && (
                      <p className="text-[11px] text-red-300/90 font-mono bg-red-950/20 p-2 rounded border border-red-900/40">
                        <strong>Catatan Panitia:</strong> {res.customReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 📂 BRACKET / BAGAN GUGUR + KODE ROOM */}
      {/* ========================================================================= */}
      {activeTab === 'bracket' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Captain Room Access Simulator */}
          <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm border-b border-neutral-800 pb-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>ROOM KODE & PASSWORD KAPTEN TIM</span>
            </div>

            {!showRoomDetails ? (
              <form onSubmit={handleVerifyCaptain} className="space-y-3 max-w-md">
                <p className="text-xs text-neutral-300">
                  Masukkan No. HP Kapten yang terdaftar untuk membuka info Room ID & Pass kustom pertandingan:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 083148834663"
                    value={enteredCaptainPin}
                    onChange={(e) => setEnteredCaptainPin(e.target.value)}
                    className="flex-1 bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cek Room
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-neutral-900 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AKSES TERVERIFIKASI KAPTEN</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">ROOM ID FF Group A:</span>
                    <strong className="text-sm font-mono text-amber-400">889 102 334</strong>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">PASSWORD:</span>
                    <strong className="text-sm font-mono text-amber-400">HC2026</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BRACKET VISUAL TREE */}
          <TournamentBracketTree
            schedules={schedules}
            selectedGame={selectedGame}
            selectedPhase={selectedPhase}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 📋 TURNAMEN MENDATANG */}
      {/* ========================================================================= */}
      {activeTab === 'mendatang' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-3">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span>📋 DAFTAR TURNAMEN MENDATANG</span>
                </h2>
                <p className="text-xs text-neutral-400">Jadwal resmi turnamen Free Fire & Mobile Legends yang akan datang.</p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleAddNewTourney}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Turnamen</span>
                </button>
              )}
            </div>

            {upcomingTournamentsList.length === 0 ? (
              <div className="bg-[#050505] border border-neutral-800 rounded-xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  BELUM ADA JADWAL TURNAMEN MENDATANG
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Panitia belum menambahkan daftar turnamen mendatang. Silakan nantikan pengumuman pembukaan musim berikutnya!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTournamentsList.map((up) => (
                  <div key={up.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        up.game === 'FF' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {up.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        {up.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white">{up.title}</h3>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Total Hadiah:</span>
                        <strong className="text-emerald-400">{up.prizePool}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Tanggal Tanding:</span>
                        <strong className="text-amber-300">{up.startDate}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab && setActiveTab('form-pendaftaran')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-950"
                    >
                      Daftar Sekarang
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-2 pt-2 border-t border-purple-900/40">
                        <button
                          type="button"
                          onClick={() => handleEditTourney(up)}
                          className="flex-1 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTourney(up.id)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 📅 KALENDER PERTANDINGAN */}
      {/* ========================================================================= */}
      {activeTab === 'kalender' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>📅 KALENDER EVENT TURNAMEN & JADWAL PERTANDINGAN (SEPTEMBER 2026)</span>
            </h3>

            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d} className="p-2 text-neutral-500 font-bold bg-neutral-900 rounded">{d}</div>
              ))}

              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const isMatchDay = day >= 2 && day <= 5;
                const isFFDay = day === 2 || day === 4;
                const isMLBBDay = day === 3 || day === 5;

                return (
                  <div
                    key={day}
                    className={`p-3 rounded-xl border text-left space-y-1 min-h-[70px] ${
                      isMatchDay
                        ? 'bg-neutral-900 border-amber-500/40 shadow-md'
                        : 'bg-[#050505] border-neutral-900 text-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-black text-neutral-300 block">{day}</span>
                    {isFFDay && (
                      <span className="text-[9px] bg-red-600 text-white px-1 py-0.5 rounded font-bold block truncate">
                        🔥 FF Match
                      </span>
                    )}
                    {isMLBBDay && (
                      <span className="text-[9px] bg-cyan-600 text-white px-1 py-0.5 rounded font-bold block truncate">
                        ⚔️ MLBB Match
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ⭐ TIM UNGGULAN */}
      {/* ========================================================================= */}
      {activeTab === 'unggulan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <span>⭐ DAFTAR TIM UNGGULAN TURNAMEN</span>
                </h2>
                <p className="text-xs text-neutral-400">Tim-tim kuat pilihan yang wajib diperhatikan di season ini.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredTeamsList.map((team) => (
                <div key={team.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{team.name}</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                      {team.predictedRank}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">{team.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Win Rate:</span>
                      <strong className="text-emerald-400">{team.winRate}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Total Kemenangan:</span>
                      <strong className="text-amber-300">{team.totalWins} Match</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-400">
                    <strong>Pemain Kunci:</strong> {team.keyPlayers.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: 🎯 PREDIKSI MATCH & ANALISIS STATISTIK */}
      {/* ========================================================================= */}
      {activeTab === 'prediksi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  <span>🎯 ANALISIS PREDIKSI KEMENANGAN MATCH</span>
                </h2>
                <p className="text-xs text-neutral-400">Persentase dan simulasi performa tim berdasarkan rekor pertandingan sebelumnya.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredTeamsList.map((team) => (
                <div key={team.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{team.name}</span>
                    <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase">
                      Prediksi: {team.predictedRank}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Peluang Menang (Win Rate):</span>
                      <strong className="text-emerald-400">{team.winRate}%</strong>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
                      <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${team.winRate}%` }}></div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 italic">"{team.description}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: 📊 STATISTIK TURNAMEN */}
      {/* ========================================================================= */}
      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <span>📊 STATISTIK TURNAMEN & HERO/KARAKTER TERPOPULER</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MLBB POPULAR HEROES */}
              <div className="bg-[#050505] border border-neutral-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-black text-cyan-400 uppercase">⚔️ Hero MLBB Terpopuler Season Ini</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>1. Nolan (Assassin)</span>
                    <span className="text-cyan-300 font-bold">Pick Rate 85%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>2. Fanny (Assassin)</span>
                    <span className="text-cyan-300 font-bold">Ban Rate 92%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>3. Cici (Fighter)</span>
                    <span className="text-emerald-400 font-bold">Win Rate 68%</span>
                  </div>
                </div>
              </div>

              {/* FF POPULAR CHARACTERS */}
              <div className="bg-[#050505] border border-neutral-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-black text-red-400 uppercase">🔥 Karakter Free Fire Meta Terpopuler</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>1. Tatsuya (Dash)</span>
                    <span className="text-red-400 font-bold">Pick Rate 90%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>2. Chrono (Shield)</span>
                    <span className="text-red-400 font-bold">Pick Rate 78%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>3. Homer (Drone)</span>
                    <span className="text-emerald-400 font-bold">Win Rate 72%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: 📸 GALERI & BUKTI PERTANDINGAN */}
      {/* ========================================================================= */}
      {activeTab === 'bukti' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-pink-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Camera className="w-5 h-5 text-pink-400" />
              <span>📸 GALERI & BUKTI HASIL PERTANDINGAN</span>
            </h2>

            <p className="text-xs text-neutral-400">
              Dokumentasi tangkapan layar (screenshot) skor akhir, momen Booyah / Victory, dan rekaman streaming match resmi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#050505] border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="h-36 bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-600 font-mono text-xs border border-neutral-800">
                  📷 Screenshot Victory MLBB
                </div>
                <p className="text-xs font-bold text-white">Grand Final MLBB Season 40</p>
                <span className="text-[10px] text-neutral-500 block">EVOS Hunters vs RRQ Kingdom</span>
              </div>

              <div className="bg-[#050505] border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="h-36 bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-600 font-mono text-xs border border-neutral-800">
                  📸 Screenshot Booyah FF
                </div>
                <p className="text-xs font-bold text-white">Booyah Match 3 Bermuda FF</p>
                <span className="text-[10px] text-neutral-500 block">Hunters Booyah Pro</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: ⚖️ SENGKETA & BANDING */}
      {/* ========================================================================= */}
      {activeTab === 'sengketa' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-red-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>⚖️ SENGKETA & BANDING HASIL PERTANDINGAN</span>
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Jika terjadi pelanggaran aturan oleh tim lawan (penggunaan bug, pelanggaran jam, tidak sopan, kecurangan), kapten tim dapat mengajukan keberatan resmi kepada panitia.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-3 bg-[#050505] p-4 rounded-xl border border-neutral-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Nama Tim Pelapor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: EVOS Hunters"
                    value={disputeReporterTeam}
                    onChange={(e) => setDisputeReporterTeam(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Nama Tim Lawan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RRQ Kingdom"
                    value={disputeOpponentTeam}
                    onChange={(e) => setDisputeOpponentTeam(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Deskripsi Masalah / Pelanggaran:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan secara rinci kendala atau kecurangan yang dilakukan lawan..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* UPLOAD FOTO BUKTI / SCREENSHOT */}
              <div className="space-y-2 border-t border-b border-neutral-800/80 py-3">
                <label className="text-neutral-200 font-black flex items-center gap-2 uppercase text-[11px] text-red-400">
                  <Upload className="w-4 h-4" />
                  <span>📸 UPLOAD FOTO BUKTI (SCREENSHOT / RECORD):</span>
                </label>
                <p className="text-[11px] text-neutral-400">
                  Unggah foto bukti tangkapan layar kecurangan/pelanggaran dari galeri HP atau laptop Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="flex items-center justify-center gap-2 bg-[#0a0a0a] hover:bg-neutral-900 border border-dashed border-red-500/60 rounded-xl p-3 cursor-pointer text-xs text-red-400 font-bold transition-all">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>{disputePhotoName ? 'Ganti Foto' : 'Pilih Foto Bukti (JPG/PNG)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDisputePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {disputePhotoName && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>File terpilih: {disputePhotoName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-neutral-400 font-bold block mb-1 text-[10px] uppercase">Atau Link URL Gambar Online (Opsional):</label>
                    <input
                      type="text"
                      placeholder="https://imgur.com/screenshot.png"
                      value={disputeEvidenceUrl}
                      onChange={(e) => {
                        setDisputeEvidenceUrl(e.target.value);
                        if (!e.target.value.startsWith('data:image')) {
                          setDisputePhotoPreview(e.target.value);
                        }
                      }}
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* PREVIEW IMAGE THUMBNAIL IF PRESENT */}
                {disputePhotoPreview && (
                  <div className="pt-2">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1 uppercase">Pratinjau Foto Bukti:</span>
                    <div className="relative inline-block border border-red-500/50 rounded-xl overflow-hidden max-w-xs bg-black">
                      <img
                        src={disputePhotoPreview}
                        alt="Bukti Sengketa"
                        className="max-h-48 w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDisputePhotoPreview('');
                          setDisputePhotoName('');
                          setDisputeEvidenceUrl('');
                        }}
                        className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 hover:bg-red-500 text-[10px] font-bold"
                      >
                        ✕ Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg shadow-red-950"
              >
                ⚖️ Ajukan Keberatan / Sengketa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: 📝 UBAH DATA PENDAFTARAN */}
      {/* ========================================================================= */}
      {activeTab === 'ubah-data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-indigo-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>📝 PERMOHONAN UBAH DATA PENDAFTARAN TIM</span>
            </h2>

            <p className="text-xs text-neutral-300">
              Ajukan perubahan nama tim atau susunan pemain (roster/sub) sebelum pendaftaran ditutup secara resmi.
            </p>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-3 bg-[#050505] p-4 rounded-xl border border-neutral-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Nama Tim Terdaftar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama tim pendaftaran"
                    value={changeTeamName}
                    onChange={(e) => setChangeTeamName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">No. WA Kapten:</label>
                  <input
                    type="text"
                    required
                    placeholder="08..."
                    value={changeCaptainPhone}
                    onChange={(e) => setChangeCaptainPhone(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Data Baru yang Diajukan:</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Roster Cadangan diganti dari 'PlayerA' menjadi 'PlayerB' ID: 1234567"
                  value={changeNewData}
                  onChange={(e) => setChangeNewData(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg"
              >
                📝 Ajukan Perubahan Data
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: ⚙️ PENGATURAN NOTIFIKASI WEB */}
      {/* ========================================================================= */}
      {activeTab === 'notifikasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-yellow-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span>⚙️ PENGATURAN NOTIFIKASI WEB & REMINDER</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#050505] rounded-xl border border-neutral-800">
                <div>
                  <strong className="text-white block">🔔 Notifikasi Browser & Pop-up</strong>
                  <span className="text-neutral-400 text-[11px]">Terima info langsung saat ada update jadwal</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.browserNotif}
                  onChange={(e) => saveNotifPreferences({ ...notifPreferences, browserNotif: e.target.checked })}
                  className="w-5 h-5 accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#050505] rounded-xl border border-neutral-800">
                <div>
                  <strong className="text-white block">⏰ Pengingat Jadwal Match (15 Menit Sebelum Tanding)</strong>
                  <span className="text-neutral-400 text-[11px]">Pengingat room ID dan jam tanding tim Anda</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.matchReminder}
                  onChange={(e) => saveNotifPreferences({ ...notifPreferences, matchReminder: e.target.checked })}
                  className="w-5 h-5 accent-yellow-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: 🏆 PAPAN JUARA SEBELUMNYA */}
      {/* ========================================================================= */}
      {activeTab === 'juara' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-black text-white uppercase">HALL OF FAME & JUARA SEBELUMNYA</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAddNewWinner}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Juara</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastWinners.map((winner, idx) => (
              <div key={idx} className="bg-[#0a0a0a] border border-amber-500/20 rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-black text-amber-400">{winner.season}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    winner.game === 'FF' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-300'
                  }`}>
                    {winner.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-amber-500/20 to-transparent rounded-lg border border-amber-500/30">
                    <span className="font-bold text-white flex items-center gap-1.5">🥇 Juara 1:</span>
                    <strong className="text-amber-300 uppercase">{winner.champion}</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-900 rounded-lg text-neutral-300">
                    <span>🥈 Juara 2:</span>
                    <strong className="text-neutral-200">{winner.runnerUp}</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-900 rounded-lg text-neutral-400">
                    <span>🥉 Juara 3:</span>
                    <span>{winner.thirdPlace}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-900/40">
                    <button
                      type="button"
                      onClick={() => handleEditWinner(winner)}
                      className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Juara</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWinner(winner.season, winner.game)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ADMIN MODALS */}
      {siteConfig && setSiteConfig && (
        <>
          <QuickMatchScheduleModal
            isOpen={showMatchModal}
            onClose={() => setShowMatchModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            scheduleToEdit={selectedMatchToEdit}
          />

          <QuickTournamentModal
            isOpen={showTourneyModal}
            onClose={() => setShowTourneyModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            tournamentToEdit={null}
            defaultGame="FF"
          />

          <QuickWinnerModal
            isOpen={showWinnerModal}
            onClose={() => setShowWinnerModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            winnerToEdit={selectedWinnerToEdit}
          />
        </>
      )}
    </div>
  );
};

