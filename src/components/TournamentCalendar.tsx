import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Swords, 
  Trophy, 
  Clock, 
  Users, 
  Coins, 
  Sparkles, 
  Info, 
  X, 
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { UpcomingTournament, MatchSchedule } from '../types';

interface TournamentCalendarProps {
  upcomingTournaments?: UpcomingTournament[];
  matchSchedules?: MatchSchedule[];
  onOpenRegisterModal?: (game?: 'FF' | 'MLBB') => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

// Indonesian month names
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/**
 * Flexible Date Parser supporting:
 * - "2026-08-20"
 * - "20/08/2026" or "20-08-2026"
 * - "20 Agustus 2026"
 * - "2 - 5 September 2026" (takes first date)
 */
function parseDateFlexible(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();
  if (!str) return null;

  // 1. Direct ISO parse (e.g. 2026-08-20)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY (e.g. 20/08/2026)
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  // 3. Indonesian text date (e.g. "20 Agustus 2026" or "2 - 5 September 2026")
  const idMonthMap: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agu: 7, ags: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11
  };

  const cleanLower = str.toLowerCase();
  for (const [mName, mIdx] of Object.entries(idMonthMap)) {
    if (cleanLower.includes(mName)) {
      // Find day and year
      const numbers = str.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const day = parseInt(numbers[0], 10);
        const year = parseInt(numbers[numbers.length - 1], 10);
        if (day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
          return new Date(year, mIdx, day);
        }
      }
    }
  }

  // Fallback native Date
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateToKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface EventDateEntry {
  tournament: UpcomingTournament;
  type: 'OPEN' | 'MATCH' | 'CLOSE';
  label: string;
}

export const TournamentCalendar: React.FC<TournamentCalendarProps> = ({
  upcomingTournaments = [],
  matchSchedules = [],
  onOpenRegisterModal,
  isAdmin = false,
  onOpenAdminPanel
}) => {
  // Calendar view mode: 'month' | 'week'
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Filter game: 'ALL' | 'FF' | 'MLBB'
  const [gameFilter, setGameFilter] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');

  // Current browsing date (defaulting to August 2026 or current date)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1)); // August 2026

  // Selected date for details popup
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Selected tournament modal detail
  const [selectedTournament, setSelectedTournament] = useState<UpcomingTournament | null>(null);

  // Today key
  const todayKey = useMemo(() => formatDateToKey(new Date()), []);

  // Normalize upcoming tournaments with parsed dates (openDate, startDate, closeDate)
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventDateEntry[]> = {};

    const addEntry = (dateObj: Date | null, tour: UpcomingTournament, type: 'OPEN' | 'MATCH' | 'CLOSE', label: string) => {
      if (!dateObj) return;
      const key = formatDateToKey(dateObj);
      if (!map[key]) map[key] = [];
      map[key].push({ tournament: tour, type, label });
    };

    upcomingTournaments.forEach((item) => {
      // Filter by game
      if (gameFilter !== 'ALL') {
        const isFF = item.game === 'FF' || (item.game as any) === 'Free Fire';
        if (gameFilter === 'FF' && !isFF) return;
        if (gameFilter === 'MLBB' && isFF) return;
      }

      // 1. Open date
      if (item.openDate) {
        const openD = parseDateFlexible(item.openDate);
        addEntry(openD, item, 'OPEN', 'Buka Pendaftaran');
      }

      // 2. Start / Match date
      if (item.startDate) {
        const startD = parseDateFlexible(item.startDate);
        addEntry(startD, item, 'MATCH', 'Jadwal Match');
      }

      // 3. Close date
      if (item.closeDate) {
        const closeD = parseDateFlexible(item.closeDate);
        addEntry(closeD, item, 'CLOSE', 'Pendaftaran Ditutup');
      }
    });

    return map;
  }, [upcomingTournaments, gameFilter]);

  // Quick Month Tabs (Agustus, September, Oktober 2026)
  const quickMonths = [
    { label: 'AGUSTUS', month: 7, year: 2026 },
    { label: 'SEPTEMBER', month: 8, year: 2026 },
    { label: 'OKTOBER', month: 9, year: 2026 }
  ];

  // Total count of scheduled events
  const totalEventsCount = useMemo(() => {
    return Object.values(eventsByDate).reduce((acc: number, list: EventDateEntry[]) => acc + (list?.length || 0), 0);
  }, [eventsByDate]);

  // Navigate month
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Navigate week
  const handlePrevWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateKey(todayKey);
  };

  // Generate Month Grid Days (Monday start)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateKey: formatDateToKey(d),
        dayNum: d.getDate(),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateKey: formatDateToKey(d),
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month filler days (fill up to multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateKey: formatDateToKey(d),
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Generate Week Days (Monday to Sunday around currentDate)
  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    let dayOfWeek = current.getDay() - 1; // 0 = Mon, 6 = Sun
    if (dayOfWeek === -1) dayOfWeek = 6;

    // Start on Monday
    const monday = new Date(current);
    monday.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        date: d,
        dateKey: formatDateToKey(d),
        dayNum: d.getDate(),
        dayName: DAY_NAMES_FULL[i],
        dayShort: DAY_NAMES[i],
        monthName: MONTH_NAMES[d.getMonth()]
      });
    }

    return days;
  }, [currentDate]);

  // Active events on currently selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDateKey) return [];
    return eventsByDate[selectedDateKey] || [];
  }, [selectedDateKey, eventsByDate]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION */}
      <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">
              <CalendarIcon className="w-3 h-3 text-amber-400" />
              <span>JADWAL RESMI KOMPETISI & EVENT ESPORTS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>KALENDER TURNAMEN</span>
            </h2>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Pantau jadwal pertandingan, pembukaan pendaftaran, dan tanggal match turnamen Free Fire &amp; Mobile Legends resmi DEXZ STORE secara terstruktur.
            </p>
          </div>

          {/* VIEW MODE TOGGLE & GAME FILTER */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Monthly / Weekly Toggle */}
            <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-neutral-800 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📅 Bulanan
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📆 Mingguan
              </button>
            </div>

            {/* Game Filter */}
            <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setGameFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  gameFilter === 'ALL' ? 'bg-neutral-800 text-white font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Semua Game
              </button>
              <button
                type="button"
                onClick={() => setGameFilter('FF')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  gameFilter === 'FF' ? 'bg-orange-600 text-white font-black' : 'text-orange-400 hover:text-orange-300'
                }`}
              >
                <Flame className="w-3 h-3" /> FF
              </button>
              <button
                type="button"
                onClick={() => setGameFilter('MLBB')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  gameFilter === 'MLBB' ? 'bg-blue-600 text-white font-black' : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                <Swords className="w-3 h-3" /> MLBB
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION BAR (Month/Week switcher + Today button) */}
        <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
          {/* Quick Month Selectors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickMonths.map((qm) => {
              const isSelectedMonth = currentDate.getMonth() === qm.month && currentDate.getFullYear() === qm.year;
              return (
                <button
                  key={qm.label}
                  type="button"
                  onClick={() => setCurrentDate(new Date(qm.year, qm.month, 1))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
                    isSelectedMonth
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                      : 'bg-[#050505] hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  [ {qm.label} ]
                </button>
              );
            })}
          </div>

          {/* Month/Week & Today Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
              className="p-2 bg-[#050505] hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition-colors cursor-pointer active:scale-95"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider min-w-[140px] text-center">
              {viewMode === 'month' ? (
                <span>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              ) : (
                <span>
                  {weekDays[0].dayNum} {weekDays[0].monthName} – {weekDays[6].dayNum} {weekDays[6].monthName} {weekDays[6].date.getFullYear()}
                </span>
              )}
            </h3>

            <button
              type="button"
              onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
              className="p-2 bg-[#050505] hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition-colors cursor-pointer active:scale-95"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        </div>

        {/* STATUS LEGEND BAR */}
        <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap text-[11px] font-bold bg-[#050505]/90 border border-neutral-800/80 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-neutral-400 text-[10px] uppercase font-mono">Status Jadwal:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> 🟢 Buka
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 🟡 Segera / Match
            </span>
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 🔴 Tutup
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-400">Total:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-[10px]">
              {totalEventsCount} Event Terdaftar
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 📅 1. MONTHLY CALENDAR VIEW */}
        {/* ======================================================================= */}
        {viewMode === 'month' && (
          <div className="relative z-10 space-y-2">
            {/* DAY HEADERS */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-black uppercase text-neutral-400 pb-1">
              {DAY_NAMES.map((d, i) => (
                <div key={d} className={`py-1.5 rounded-lg ${i >= 5 ? 'text-amber-400/80 bg-amber-500/5' : 'bg-neutral-900/40'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* MONTH DAYS GRID */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {monthDays.map((item) => {
                const events = eventsByDate[item.dateKey] || [];
                const hasEvents = events.length > 0;
                const isToday = item.dateKey === todayKey;
                const isSelected = item.dateKey === selectedDateKey;

                return (
                  <div
                    key={item.dateKey}
                    onClick={() => {
                      setSelectedDateKey(item.dateKey);
                      if (events.length === 1) {
                        setSelectedTournament(events[0]);
                      }
                    }}
                    className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40'
                        : isToday
                        ? 'bg-gradient-to-b from-[#1a1205] to-[#0a0a0a] border-amber-500/50 shadow-md'
                        : item.isCurrentMonth
                        ? 'bg-[#050505] hover:bg-[#121212] border-neutral-800 hover:border-neutral-700'
                        : 'bg-[#030303]/60 border-neutral-900/60 opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* DATE NUMBER & BADGES */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] sm:text-xs font-mono font-black ${
                        isToday 
                          ? 'px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950' 
                          : item.isCurrentMonth ? 'text-white' : 'text-neutral-500'
                      }`}>
                        {item.dayNum}
                      </span>

                      {hasEvents && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>

                    {/* EVENT PILLS */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {events.slice(0, 2).map((evEntry, idx) => {
                        const ev = evEntry.tournament;
                        const isFF = ev.game === 'FF' || (ev.game as any) === 'Free Fire';
                        const dotColor = evEntry.type === 'OPEN' ? '🟢' : evEntry.type === 'MATCH' ? '🟡' : '🔴';
                        return (
                          <div
                            key={`${ev.id}-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTournament(ev);
                            }}
                            className={`p-1 rounded-md text-[9px] font-bold truncate flex items-center gap-1 border transition-transform hover:scale-105 ${
                              isFF
                                ? 'bg-orange-950/80 text-orange-300 border-orange-800'
                                : 'bg-blue-950/80 text-blue-300 border-blue-800'
                            }`}
                            title={`${ev.title} (${evEntry.label})`}
                          >
                            <span>{dotColor}</span>
                            <span className="truncate">{ev.title}</span>
                          </div>
                        );
                      })}

                      {events.length > 2 && (
                        <div className="text-[9px] font-bold text-amber-400 font-mono text-center">
                          +{events.length - 2} lagi
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 📆 2. WEEKLY CALENDAR VIEW */}
        {/* ======================================================================= */}
        {viewMode === 'week' && (
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-7 gap-2.5">
            {weekDays.map((item) => {
              const events = eventsByDate[item.dateKey] || [];
              const isToday = item.dateKey === todayKey;
              const isSelected = item.dateKey === selectedDateKey;

              return (
                <div
                  key={item.dateKey}
                  onClick={() => {
                    setSelectedDateKey(item.dateKey);
                    if (events.length === 1) {
                      setSelectedTournament(events[0].tournament);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                      : isToday
                      ? 'bg-gradient-to-b from-[#1c1205] to-[#0a0a0a] border-amber-500/50 shadow-md'
                      : 'bg-[#050505] hover:bg-[#121212] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="border-b border-neutral-800 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                      {item.dayName}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-xl font-black font-mono ${isToday ? 'text-amber-400' : 'text-white'}`}>
                        {item.dayNum}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold">
                        {item.monthName}
                      </span>
                    </div>
                  </div>

                  {/* EVENTS LIST FOR THIS DAY */}
                  <div className="space-y-2 flex-1">
                    {events.length === 0 ? (
                      <div className="py-4 text-center text-[11px] text-neutral-600 font-mono">
                        Tidak ada match
                      </div>
                    ) : (
                      events.map((evEntry, idx) => {
                        const ev = evEntry.tournament;
                        const isFF = ev.game === 'FF' || (ev.game as any) === 'Free Fire';
                        const dotColor = evEntry.type === 'OPEN' ? '🟢 Buka' : evEntry.type === 'MATCH' ? '🟡 Match' : '🔴 Tutup';
                        return (
                          <div
                            key={`${ev.id}-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTournament(ev);
                            }}
                            className={`p-2.5 rounded-xl border space-y-1.5 transition-transform hover:scale-[1.02] ${
                              isFF
                                ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
                                : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                isFF ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {isFF ? '🔥 FF' : '⚔️ MLBB'}
                              </span>
                              <span className="text-[9px] text-amber-400 font-mono font-bold">
                                {dotColor}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {ev.title}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/5 font-mono">
                              <span>👥 {ev.slots || 32} Slot</span>
                              <span className="text-amber-300 font-bold">Detail →</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 📋 SELECTED DATE EVENTS DRAWER / EXPANDED VIEW */}
        {/* ======================================================================= */}
        {selectedDateKey && (
          <div className="relative z-10 bg-[#050505] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Event Pada Tanggal: <span className="text-amber-400">{selectedDateKey}</span>
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="text-neutral-500 hover:text-white p-1 transition-colors cursor-pointer"
                title="Tutup Detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 space-y-1.5">
                <p className="text-xs font-bold text-neutral-300">
                  Tidak ada event turnamen yang dijadwalkan pada tanggal ini ({selectedDateKey}).
                </p>
                <p className="text-[11px] text-neutral-500">
                  Pilih tanggal lain yang bertanda warna untuk melihat detail event.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDateEvents.map((evEntry, idx) => {
                  const ev = evEntry.tournament;
                  const isFF = ev.game === 'FF' || (ev.game as any) === 'Free Fire';
                  const typeBadge = evEntry.type === 'OPEN' 
                    ? '🟢 Buka Pendaftaran' 
                    : evEntry.type === 'MATCH' 
                    ? '🟡 Jadwal Match' 
                    : '🔴 Pendaftaran Ditutup';

                  return (
                    <div
                      key={`${ev.id}-${idx}`}
                      className="p-4 bg-[#0a0a0a] border border-neutral-800 hover:border-amber-500/40 rounded-xl space-y-2.5 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isFF ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {isFF ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                            {typeBadge}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-sm text-white">{ev.title}</h5>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                          <div>
                            <span className="text-[10px] text-neutral-500 block">Mulai Match:</span>
                            <strong className="text-amber-300">{ev.startDate}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">Total Hadiah:</span>
                            <strong className="text-emerald-400">{ev.prizePool}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTournament(ev)}
                          className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRegisterModal && onOpenRegisterModal(isFF ? 'FF' : 'MLBB')}
                          className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Daftar Tim
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 📭 EMPTY STATE IF NO TOURNAMENTS EXIST IN CONFIG */}
        {/* ======================================================================= */}
        {upcomingTournaments.length === 0 && (
          <div className="relative z-10 p-6 sm:p-8 bg-[#050505] border border-amber-500/20 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              BELUM ADA JADWAL TURNAMEN RESMI
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Jadwal turnamen belum ditambahkan oleh panitia. Jadwal pertandingan dan timeline pendaftaran akan otomatis tampil di kalender ini setelah admin menerbitkan turnamen di Panel Admin.
            </p>
            {isAdmin && onOpenAdminPanel && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jadwal di Panel Admin</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🔍 MODAL DETAIL TURNAMEN TERPILIH */}
      {/* ========================================================================= */}
      {selectedTournament && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* THUMBNAIL / HEADER */}
            <div className="relative h-44 bg-neutral-950 overflow-hidden">
              <img
                src={
                  selectedTournament.bannerImage ||
                  (selectedTournament.game === 'FF'
                    ? 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'
                    : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80')
                }
                alt={selectedTournament.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
              
              <button
                type="button"
                onClick={() => setSelectedTournament(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedTournament.game === 'FF' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {selectedTournament.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                    {selectedTournament.status || 'Segera Dibuka'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {selectedTournament.title}
                </h3>
              </div>
            </div>

            {/* DETAILS CONTENT */}
            <div className="p-5 pt-0 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Tanggal Match:</span>
                  <strong className="text-amber-300 text-sm">📅 {selectedTournament.startDate}</strong>
                </div>
                <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Buka Pendaftaran:</span>
                  <strong className="text-cyan-400 text-sm">⏰ {selectedTournament.openDate}</strong>
                </div>
                <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Prize Pool / Hadiah:</span>
                  <strong className="text-emerald-400 text-sm">🏆 {selectedTournament.prizePool}</strong>
                </div>
                <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Target Kuota:</span>
                  <strong className="text-white text-sm">👥 {selectedTournament.slots || 32} Slot</strong>
                </div>
              </div>

              {selectedTournament.fee && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-neutral-300 font-bold">Biaya Pendaftaran:</span>
                  <span className="text-emerald-400 font-mono font-black">{selectedTournament.fee}</span>
                </div>
              )}

              {selectedTournament.description && (
                <div className="p-3 bg-[#050505] border border-neutral-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold">Catatan / Format:</span>
                  <p className="text-neutral-300 leading-relaxed">{selectedTournament.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTournament(null)}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const game = selectedTournament.game === 'FF' ? 'FF' : 'MLBB';
                    setSelectedTournament(null);
                    if (onOpenRegisterModal) onOpenRegisterModal(game);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Daftar Turnamen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
