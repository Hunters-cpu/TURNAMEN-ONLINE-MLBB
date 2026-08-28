import React, { useState, useMemo, useRef } from 'react';
import { 
  Trophy, 
  Flame, 
  Swords, 
  Calendar, 
  Clock, 
  Users, 
  Coins, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Crown,
  Share2,
  Gamepad2,
  Tv,
  Eye,
  Info
} from 'lucide-react';
import { SiteConfig, RegisteredTeam, TabType, MatchSchedule } from '../../types';
import { MATCH_SCHEDULES } from '../../data/initialData';

interface DaftarSemuaTurnamenViewProps {
  siteConfig: SiteConfig;
  registeredTeams: RegisteredTeam[];
  setActiveTab: (tab: TabType) => void;
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  onSelectInfoMatchSubTab?: (subTab: string) => void;
}

export const DaftarSemuaTurnamenView: React.FC<DaftarSemuaTurnamenViewProps> = ({
  siteConfig,
  registeredTeams = [],
  setActiveTab,
  onOpenRegisterModal,
  onSelectInfoMatchSubTab,
}) => {
  // State for reminder subscriptions
  const [remindedTournaments, setRemindedTournaments] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hunters_tourney_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // State for bracket visibility
  const [isBracketOpen, setIsBracketOpen] = useState(true);
  const [bracketGameFilter, setBracketGameFilter] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [bracketSearchQuery, setBracketSearchQuery] = useState('');
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<MatchSchedule | null>(null);

  const bracketSectionRef = useRef<HTMLDivElement>(null);

  // Extract registered team counts (Hanya tim berstatus SAH yang mengisi slot turnamen)
  const ffTeams = registeredTeams.filter(t => (t.game === 'Free Fire' || t.game === 'FF') && t.status === 'Sah' && (t.slotNumber ?? 0) > 0);
  const mlbbTeams = registeredTeams.filter(t => (t.game === 'Mobile Legends' || t.game === 'MLBB') && t.status === 'Sah' && (t.slotNumber ?? 0) > 0);
  
  const ffTeamsCount = ffTeams.length;
  const mlbbTeamsCount = mlbbTeams.length;

  const ffMaxSlots = siteConfig.prizePoolConfig?.totalSlots || 32;
  const mlbbMaxSlots = siteConfig.prizePoolConfig?.totalSlots || 32;

  const formatRupiah = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // ---------------------------------------------------------------------------
  // 🔴 1. TURNAMEN BERLANGSUNG (SEDANG DIBUKA / SEDANG BERJALAN)
  // ---------------------------------------------------------------------------
  const activeTournaments = useMemo(() => {
    const rawList = siteConfig.upcomingTournaments || [];
    // Only include tournaments that have been added by admin with open registration or active status
    const filtered = rawList.filter(item => item.status === 'Pendaftaran Dibuka' || item.status === 'Sedang Berjalan');

    return filtered.map((item) => {
      const isFF = item.game === 'FF' || (item.game as any) === 'Free Fire';
      const defaultBanner = isFF
        ? 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';

      const numericFee = typeof item.fee === 'string' ? parseInt(item.fee.replace(/\D/g, ''), 10) || 50000 : (item.fee || 50000);
      const isRunning = item.status === 'Sedang Berjalan';

      return {
        id: item.id,
        game: isFF ? ('FF' as const) : ('MLBB' as const),
        gameIcon: isFF ? '🔥' : '⚔️',
        gameName: isFF ? 'Free Fire' : 'Mobile Legends',
        title: item.title,
        date: item.startDate,
        dateRaw: new Date().getTime(),
        time: '19:00 WIB - Selesai',
        status: isRunning ? ('Sedang Berjalan' as const) : ('Pendaftaran Dibuka' as const),
        statusType: isRunning ? ('running' as const) : ('open' as const),
        quotaFilled: isFF ? ffTeamsCount : mlbbTeamsCount,
        quotaTotal: item.slots || 32,
        fee: numericFee,
        totalPrize: item.prizePool || 'Rp 1.440.000',
        bannerImage: item.bannerImage || defaultBanner,
        actionType: isRunning ? ('VIEW_SCHEDULE' as const) : ('REGISTER' as const),
        format: item.description || (item.mode ? `Mode ${item.mode} • Kuota ${item.slots || 32} Slot` : `Kuota ${item.slots || 32} Slot`),
        colorTheme: isFF ? 'from-orange-600 to-red-600' : 'from-cyan-600 to-blue-600',
        badgeBg: isRunning ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      };
    });
  }, [siteConfig.upcomingTournaments, ffTeamsCount, mlbbTeamsCount]);

  // ---------------------------------------------------------------------------
  // 🔵 2. TURNAMEN MENDATANG (URUTAN TANGGAL TERDEKAT DARI CONFIG)
  // ---------------------------------------------------------------------------
  const upcomingTournaments = useMemo(() => {
    const rawList = siteConfig.upcomingTournaments || [];
    // If tournament has specific upcoming/scheduled status or include all scheduled items
    return rawList.map((item) => {
      const isFF = item.game === 'FF' || (item.game as any) === 'Free Fire';
      const defaultBanner = isFF
        ? 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';
      
      return {
        id: item.id,
        game: isFF ? ('FF' as const) : ('MLBB' as const),
        gameIcon: isFF ? '🔥' : '⚔️',
        gameName: isFF ? 'Free Fire' : 'Mobile Legends',
        title: item.title,
        date: item.startDate,
        openRegistrationDate: item.openDate,
        estimatedFee: item.fee || 'Rp 50.000',
        estimatedPrize: item.prizePool,
        bannerImage: item.bannerImage || defaultBanner,
        format: item.description || (item.mode ? `Mode ${item.mode} • Kuota ${item.slots || 32} Slot` : `Kuota ${item.slots || 32} Slot`),
        slots: item.slots || 32,
        status: item.status || 'Segera Dibuka'
      };
    });
  }, [siteConfig.upcomingTournaments]);

  // Handle Toggle Reminder
  const handleToggleReminder = (id: string, title: string) => {
    const nextState = !remindedTournaments[id];
    const updated = { ...remindedTournaments, [id]: nextState };
    setRemindedTournaments(updated);
    try {
      localStorage.setItem('hunters_tourney_reminders', JSON.stringify(updated));
    } catch {}

    if (nextState) {
      setReminderToast(`🔔 Pengingat Berhasil Diaktifkan! Anda akan menerima notifikasi prioritas saat pendaftaran "${title}" dibuka.`);
    } else {
      setReminderToast(`🔕 Pengingat Dinonaktifkan untuk "${title}".`);
    }

    setTimeout(() => {
      setReminderToast(null);
    }, 4500);
  };

  // Scroll to bracket view helper
  const handleScrollToBracket = (gameTarget?: 'FF' | 'MLBB') => {
    setIsBracketOpen(true);
    if (gameTarget) {
      setBracketGameFilter(gameTarget);
    }
    setTimeout(() => {
      bracketSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // ---------------------------------------------------------------------------
  // 📊 3. JADWAL & BAGAN PERTANDINGAN (DATA FILTERING)
  // ---------------------------------------------------------------------------
  const defaultBracketSchedules: MatchSchedule[] = useMemo(() => {
    if (siteConfig.matchSchedules && siteConfig.matchSchedules.length > 0) {
      return siteConfig.matchSchedules;
    }
    return [];
  }, [siteConfig.matchSchedules]);

  const hasArrangedMatches = useMemo(() => {
    return Boolean(
      siteConfig.matchSchedules &&
      siteConfig.matchSchedules.length > 0 &&
      siteConfig.matchSchedules.some(s => (s.teamA && s.teamA.trim()) || (s.teamB && s.teamB.trim()))
    );
  }, [siteConfig.matchSchedules]);

  // Filtered schedules for bracket display
  const filteredBracketSchedules = useMemo(() => {
    return defaultBracketSchedules.filter((m) => {
      // Game filter
      if (bracketGameFilter === 'FF') {
        const isFF = m.game === 'FF' || m.game === ('Free Fire' as any);
        if (!isFF) return false;
      } else if (bracketGameFilter === 'MLBB') {
        const isMLBB = m.game === 'MLBB' || m.game === ('Mobile Legends' as any);
        if (!isMLBB) return false;
      }

      // Search query filter
      if (bracketSearchQuery.trim()) {
        const q = bracketSearchQuery.toLowerCase();
        const matchTeamA = m.teamA?.toLowerCase().includes(q);
        const matchTeamB = m.teamB?.toLowerCase().includes(q);
        const matchPhase = m.phase?.toLowerCase().includes(q);
        if (!matchTeamA && !matchTeamB && !matchPhase) return false;
      }

      return true;
    });
  }, [defaultBracketSchedules, bracketGameFilter, bracketSearchQuery]);

  const bracketStages = [
    { name: 'Babak Penyisihan', label: 'Penyisihan', icon: '1️⃣', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
    { name: 'Babak 16 Besar', label: '16 Besar', icon: '2️⃣', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' },
    { name: 'Perempat Final', label: 'Perempat Final', icon: '3️⃣', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
    { name: 'Semifinal', label: 'Semifinal', icon: '4️⃣', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
    { name: 'Perebutan Juara 3', label: 'Juara 3', icon: '🥉', color: 'border-orange-500/50 bg-orange-500/10 text-orange-300' },
    { name: 'Grand Final', label: 'Grand Final', icon: '🏆', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300 select-none">
      {/* ======================================================================= */}
      {/* TOAST NOTIFICATION ALERT */}
      {/* ======================================================================= */}
      {reminderToast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-[#120726] border-2 border-amber-500 text-white p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-300 uppercase tracking-wider">Pemberitahuan Sistem</p>
            <p className="text-neutral-200 mt-0.5 leading-relaxed">{reminderToast}</p>
          </div>
          <button 
            onClick={() => setReminderToast(null)}
            className="text-neutral-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 🏆 HEADER UTAMA: DAFTAR TURNAMEN */}
      {/* ======================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0314] via-[#100624] to-[#1a0836] border border-purple-900/60 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black tracking-wider uppercase">
              <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>OFFICIAL TOURNAMENT HUB • DEXZ STORE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              🏆 DAFTAR TURNAMEN
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Jadwal turnamen resmi Free Fire &amp; Mobile Legends Bang Bang. Pantau turnamen aktif yang sedang dibuka pendaftarannya, cek turnamen mendatang, dan akses bagan pohon babak secara langsung!
            </p>
          </div>

          {/* QUICK COUNTER BADGES */}
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
            <div className="p-3 bg-black/40 border border-purple-900/60 rounded-2xl text-center">
              <p className="text-[10px] text-purple-300/80 font-bold uppercase">Aktif</p>
              <p className="text-lg font-black text-emerald-400">{activeTournaments.length}</p>
            </div>
            <div className="p-3 bg-black/40 border border-purple-900/60 rounded-2xl text-center">
              <p className="text-[10px] text-purple-300/80 font-bold uppercase">Mendatang</p>
              <p className="text-lg font-black text-amber-400">{upcomingTournaments.length}</p>
            </div>
            <div className="p-3 bg-black/40 border border-purple-900/60 rounded-2xl text-center">
              <p className="text-[10px] text-purple-300/80 font-bold uppercase">Total Slot</p>
              <p className="text-lg font-black text-white">
                {activeTournaments.length > 0
                  ? `${ffTeamsCount + mlbbTeamsCount}/${activeTournaments.reduce((acc, t) => acc + t.quotaTotal, 0)}`
                  : '0 Slot'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 🔴 1. TURNAMEN BERLANGSUNG */}
      {/* ======================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-red-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>🔴 TURNAMEN BERLANGSUNG</span>
            </h2>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline-block">
            Urutan Otomatis: Tanggal Paling Awal
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          Daftar turnamen yang sedang dibuka pendaftarannya atau sedang berjalan. Klik <strong>DAFTAR SEKARANG</strong> untuk mendaftarkan squad Anda atau <strong>LIHAT JADWAL</strong> untuk memantau pertandingan.
        </p>

        {/* ACTIVE TOURNAMENT CARDS OR EMPTY STATE */}
        {activeTournaments.length === 0 ? (
          <div className="bg-[#0b0417] border border-purple-900/40 rounded-2xl p-8 sm:p-10 text-center space-y-3 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              BELUM ADA TURNAMEN BERLANGSUNG
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Saat ini belum ada turnamen yang dibuka pendaftarannya atau sedang berjalan. Turnamen akan otomatis tampil di sini setelah ditambahkan oleh Admin di Panel Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeTournaments.map((item) => {
              const slotPercentage = Math.min(100, Math.round((item.quotaFilled / item.quotaTotal) * 100));
              const remainingQuota = Math.max(0, item.quotaTotal - item.quotaFilled);

              return (
                <div 
                  key={item.id}
                  className="bg-[#0b0417] border-2 border-purple-900/60 hover:border-purple-600/70 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* BANNER & STATUS BADGE */}
                  <div className="relative h-44 sm:h-48 overflow-hidden">
                    <img 
                      src={item.bannerImage} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0417] via-[#0b0417]/60 to-transparent" />

                    {/* TOP HEADER OVERLAY */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider text-white border border-purple-500/40 shadow-lg flex items-center gap-1.5">
                        <span>{item.gameIcon}</span>
                        <span>{item.gameName}</span>
                      </div>

                      <div className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border ${item.badgeBg}`}>
                        {item.status === 'Pendaftaran Dibuka' ? '🟢 Pendaftaran Dibuka' : '🔵 Sedang Berjalan'}
                      </div>
                    </div>

                    {/* BOTTOM OVERLAY INFO */}
                    <div className="absolute bottom-3 left-3.5 right-3.5">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase drop-shadow-md">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* CARD BODY SPECS */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* METRIC GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-[#14082b] p-2.5 rounded-xl border border-purple-900/40">
                        <p className="text-[10px] font-bold text-purple-300/70 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>Tanggal Match</span>
                        </p>
                        <p className="font-extrabold text-white mt-0.5">{item.date}</p>
                      </div>

                      <div className="bg-[#14082b] p-2.5 rounded-xl border border-purple-900/40">
                        <p className="text-[10px] font-bold text-purple-300/70 uppercase flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-400" />
                          <span>Kuota Slot</span>
                        </p>
                        <p className="font-extrabold text-white mt-0.5">
                          <span className="text-amber-400">{item.quotaFilled}</span>/{item.quotaTotal} Tim
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 bg-[#14082b] p-2.5 rounded-xl border border-purple-900/40">
                        <p className="text-[10px] font-bold text-purple-300/70 uppercase flex items-center gap-1">
                          <Coins className="w-3 h-3 text-emerald-400" />
                          <span>Biaya Pendaftaran</span>
                        </p>
                        <p className="font-black text-emerald-400 mt-0.5">{formatRupiah(item.fee)}</p>
                      </div>
                    </div>

                    {/* QUOTA PROGRESS BAR */}
                    <div className="space-y-1.5 bg-[#120626] p-3 rounded-2xl border border-purple-900/40">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-purple-200">Keterisian Slot Turnamen</span>
                        <span className="text-amber-400">{slotPercentage}% ({remainingQuota} Slot Tersisa)</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-purple-950">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            slotPercentage >= 90 
                              ? 'bg-gradient-to-r from-red-600 to-rose-500' 
                              : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${slotPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="pt-2">
                      {item.actionType === 'REGISTER' ? (
                        <button
                          type="button"
                          onClick={() => onOpenRegisterModal(item.game)}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-xl shadow-emerald-950/60 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/40"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>DAFTAR SEKARANG ({formatRupiah(item.fee)})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleScrollToBracket(item.game)}
                          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-xl shadow-cyan-950/60 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/40"
                        >
                          <Eye className="w-4 h-4" />
                          <span>LIHAT JADWAL &amp; HASIL PERTANDINGAN</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 🔵 2. TURNAMEN MENDATANG */}
      {/* ======================================================================= */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between gap-3 border-b border-blue-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>🔵 TURNAMEN MENDATANG</span>
            </h2>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline-block">
            Urutan: Tanggal Terdekat
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          Daftar turnamen berikutnya yang akan segera hadir. Klik tombol <strong>INGATKAN SAYA</strong> agar Anda mendapatkan notifikasi langsung ketika pendaftaran dibuka!
        </p>

        {/* UPCOMING CARDS GRID OR EMPTY STATE */}
        {upcomingTournaments.length === 0 ? (
          <div className="bg-[#0b0417] border border-blue-900/40 rounded-2xl p-8 sm:p-10 text-center space-y-3 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              BELUM ADA TURNAMEN MENDATANG
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Jadwal turnamen mendatang belum ditambahkan oleh panitia. Jadwal turnamen akan ditampilkan di sini setelah admin menambahkannya di Panel Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {upcomingTournaments.map((tourney) => {
              const isSubscribed = remindedTournaments[tourney.id];

              return (
                <div 
                  key={tourney.id}
                  className="bg-[#0b0417] border border-blue-900/50 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
                >
                  <div>
                    {/* CARD HEADER & THUMBNAIL */}
                    <div className="relative h-36 overflow-hidden">
                      <img 
                        src={tourney.bannerImage} 
                        alt={tourney.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0417] via-[#0b0417]/60 to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-wider border border-blue-400/40">
                          {tourney.gameIcon} {tourney.gameName}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                          Akan Datang
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-3 right-3">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight line-clamp-2">
                          {tourney.title}
                        </h4>
                      </div>
                    </div>

                    {/* SPECS LIST */}
                    <div className="p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          Tanggal Match:
                        </span>
                        <span className="font-extrabold text-white">{tourney.date}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Buka Pendaftaran:
                        </span>
                        <span className="font-extrabold text-amber-300">{tourney.openRegistrationDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-emerald-400" />
                          Estimasi Biaya:
                        </span>
                        <span className="font-black text-emerald-400">{formatRupiah(tourney.estimatedFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* INGATKAN SAYA BUTTON */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(tourney.id, tourney.title)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-md active:scale-95 ${
                        isSubscribed
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40 shadow-emerald-950/40'
                          : 'bg-blue-600 hover:bg-blue-500 border-blue-400/50 text-white shadow-blue-950/50'
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>✅ PENGINGAT AKTIF</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-amber-300" />
                          <span>🔔 INGATKAN SAYA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 📊 3. JADWAL & BAGAN PERTANDINGAN */}
      {/* ======================================================================= */}
      <section ref={bracketSectionRef} className="space-y-4 pt-6">
        {/* BIG PROMINENT ACTION BUTTON */}
        <div className="bg-gradient-to-r from-purple-950/80 via-[#16062f] to-indigo-950/80 p-1.5 rounded-3xl border-2 border-amber-500/50 shadow-2xl shadow-purple-950/80">
          <button
            type="button"
            onClick={() => setIsBracketOpen(!isBracketOpen)}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl uppercase tracking-wider flex items-center justify-between shadow-xl cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-950 text-base sm:text-lg">
                  🏆 BUKA BAGAN PERTANDINGAN
                </span>
                <span className="text-[11px] font-bold text-slate-900/80 normal-case hidden sm:block">
                  Pohon Babak Lengkap: Penyisihan → 16 Besar → Perempat → Semifinal → Juara 3 → Grand Final
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl text-xs font-black">
              <span>{isBracketOpen ? 'TUTUP BAGAN' : 'TAMPILKAN POHON'}</span>
              {isBracketOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* COLLAPSIBLE BRACKET TREE CONTENT */}
        {isBracketOpen && (
          <div className="bg-[#090314] border-2 border-purple-900/60 rounded-3xl p-4 sm:p-6 space-y-6 shadow-2xl animate-in fade-in duration-300">
            {/* BRACKET CONTROLS: FILTER & SEARCH */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
              {/* GAME FILTERS: SEMUA / FREE FIRE / MOBILE LEGENDS */}
              <div className="flex items-center gap-1.5 p-1 bg-[#120626] rounded-xl border border-purple-900/60 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setBracketGameFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    bracketGameFilter === 'ALL'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Semua Game</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketGameFilter('FF')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    bracketGameFilter === 'FF'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-orange-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Free Fire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBracketGameFilter('MLBB')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    bracketGameFilter === 'MLBB'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-blue-400'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Mobile Legends</span>
                </button>
              </div>

              {/* SEARCH NAMA TIM */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama tim di bagan..."
                  value={bracketSearchQuery}
                  onChange={(e) => setBracketSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#120626] border border-purple-900/60 rounded-xl text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-amber-500/60"
                />
                {bracketSearchQuery && (
                  <button 
                    onClick={() => setBracketSearchQuery('')}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* BRACKET STAGES FLOW INDICATOR */}
            <div className="hidden lg:grid grid-cols-6 gap-2">
              {bracketStages.map((stage, idx) => (
                <div 
                  key={stage.name}
                  className={`p-2 rounded-xl border text-center text-xs font-black uppercase tracking-wider ${stage.color} shadow-sm`}
                >
                  <span>{stage.icon} {stage.label}</span>
                </div>
              ))}
            </div>

            {/* HORIZONTALLY SCROLLABLE BRACKET TREE COLUMNS OR EMPTY NOTIFICATION */}
            {filteredBracketSchedules.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-3 bg-[#120626]/60 border border-purple-900/40 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Swords className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  ⚠️ BAGAN PERTANDINGAN BELUM DISUSUN
                </h3>
                <p className="text-xs text-purple-200/70 max-w-lg mx-auto leading-relaxed">
                  Panitia turnamen belum menyusun atau mengacak pasangan pertandingan {bracketGameFilter === 'FF' ? 'Free Fire' : bracketGameFilter === 'MLBB' ? 'Mobile Legends' : ''}. Jadwal dan bagan pohon babak gugur akan tampil secara otomatis setelah Admin mengacak atau menyusun pasangan tim di Panel Admin.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 pt-1 custom-scrollbar">
                <div className="flex items-start gap-4 min-w-[1250px] px-1">
                  {bracketStages.map((stage) => {
                    const stageMatches = filteredBracketSchedules.filter((m) => m.phase === stage.name);

                    return (
                      <div 
                        key={stage.name} 
                        className="flex-1 min-w-[200px] max-w-[250px] space-y-3"
                      >
                        {/* COLUMN STAGE HEADER */}
                        <div className={`p-2.5 rounded-xl border text-center space-y-0.5 ${stage.color} shadow-md`}>
                          <p className="text-xs font-black uppercase tracking-wider">{stage.icon} {stage.label}</p>
                          <p className="text-[10px] opacity-80">{stageMatches.length} Pertandingan</p>
                        </div>

                        {/* MATCH CARDS IN THIS STAGE */}
                        <div className="space-y-2.5">
                          {stageMatches.length > 0 ? (
                            stageMatches.map((m) => {
                              const isHighlighted = bracketSearchQuery.trim() && (
                                m.teamA?.toLowerCase().includes(bracketSearchQuery.toLowerCase()) ||
                                m.teamB?.toLowerCase().includes(bracketSearchQuery.toLowerCase())
                              );

                              return (
                                <div
                                  key={m.id}
                                  onClick={() => setSelectedMatchDetail(m)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer select-none relative group ${
                                    isHighlighted 
                                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-500 shadow-xl' 
                                      : 'bg-[#130728] border-purple-900/60 hover:border-purple-500/70 hover:bg-[#1a0a38]'
                                  }`}
                                >
                                  {/* MATCH METADATA */}
                                  <div className="flex items-center justify-between text-[10px] text-purple-300/80 mb-2 border-b border-purple-900/40 pb-1.5 font-mono">
                                    <span className="font-bold text-amber-400">#{m.matchNumber || 1} • {m.game}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                      m.status === 'Selesai' 
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' 
                                        : m.status === 'Sedang Berlangsung' 
                                        ? 'bg-red-950 text-red-400 border border-red-700/50 animate-pulse' 
                                        : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                                    }`}>
                                      {m.status || 'Belum Mulai'}
                                    </span>
                                  </div>

                                  {/* TEAM A */}
                                  <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                                    m.winner && m.winner === m.teamA 
                                      ? 'bg-emerald-950/60 text-emerald-300 font-black border border-emerald-600/40' 
                                      : 'text-white'
                                  }`}>
                                    <span className="truncate max-w-[130px]">{m.teamA || 'Tim TBA'}</span>
                                    <span className="font-mono text-amber-400 shrink-0 ml-1">{m.scoreA ?? 0}</span>
                                  </div>

                                  {/* VERSUS DIVIDER */}
                                  <div className="text-[9px] font-mono text-center text-purple-400/60 py-0.5">VS</div>

                                  {/* TEAM B */}
                                  <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                                    m.winner && m.winner === m.teamB 
                                      ? 'bg-emerald-950/60 text-emerald-300 font-black border border-emerald-600/40' 
                                      : 'text-white'
                                  }`}>
                                    <span className="truncate max-w-[130px]">{m.teamB || 'Tim TBA'}</span>
                                    <span className="font-mono text-amber-400 shrink-0 ml-1">{m.scoreB ?? 0}</span>
                                  </div>

                                  {/* TIME & ACTION HINT */}
                                  <div className="mt-2 pt-1.5 border-t border-purple-900/40 flex items-center justify-between text-[9.5px] text-purple-300/70">
                                    <span className="truncate">{m.time || m.date || 'Jadwal Menyusul'}</span>
                                    <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                                      Detail <ChevronRight className="w-3 h-3" />
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 rounded-xl border border-dashed border-purple-900/40 text-center text-xs text-purple-400/60">
                              Belum ada jadwal
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* MATCH DETAIL MODAL */}
      {/* ======================================================================= */}
      {selectedMatchDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMatchDetail(null)}
        >
          <div 
            className="bg-[#100624] border-2 border-purple-600/70 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm text-white uppercase">{selectedMatchDetail.phase}</h3>
                  <p className="text-[10px] text-purple-300/80 font-mono">Match #{selectedMatchDetail.matchNumber} • {selectedMatchDetail.game}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMatchDetail(null)}
                className="w-7 h-7 rounded-full bg-purple-950 text-neutral-300 hover:text-white flex items-center justify-center text-xs font-bold border border-purple-800"
              >
                ✕
              </button>
            </div>

            {/* SCORE DISPLAY */}
            <div className="bg-[#090314] p-4 rounded-2xl border border-purple-900/60 text-center space-y-2">
              <div className="flex items-center justify-around">
                <div className="flex-1 text-center">
                  <p className="font-black text-sm text-white truncate">{selectedMatchDetail.teamA}</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{selectedMatchDetail.scoreA ?? 0}</p>
                </div>
                <div className="px-3 text-xs font-mono text-purple-400 font-black">VS</div>
                <div className="flex-1 text-center">
                  <p className="font-black text-sm text-white truncate">{selectedMatchDetail.teamB}</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{selectedMatchDetail.scoreB ?? 0}</p>
                </div>
              </div>

              {selectedMatchDetail.winner && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-full text-xs font-black text-emerald-400">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pemenang: {selectedMatchDetail.winner}</span>
                </div>
              )}
            </div>

            {/* MATCH DETAILS LIST */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-purple-950/30 rounded-xl border border-purple-900/30">
                <span className="text-neutral-400">Waktu &amp; Tanggal:</span>
                <span className="font-bold text-white">{selectedMatchDetail.date} • {selectedMatchDetail.time}</span>
              </div>

              {selectedMatchDetail.roomId && (
                <div className="flex items-center justify-between p-2 bg-purple-950/30 rounded-xl border border-purple-900/30">
                  <span className="text-neutral-400">Room ID:</span>
                  <span className="font-mono font-bold text-amber-300">{selectedMatchDetail.roomId}</span>
                </div>
              )}

              {selectedMatchDetail.roomPassword && (
                <div className="flex items-center justify-between p-2 bg-purple-950/30 rounded-xl border border-purple-900/30">
                  <span className="text-neutral-400">Password Room:</span>
                  <span className="font-mono font-bold text-amber-300">{selectedMatchDetail.roomPassword}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMatchDetail(null)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
