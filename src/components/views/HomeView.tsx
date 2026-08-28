import React, { useState } from 'react';
import { 
  Flame, 
  Swords, 
  Gamepad2, 
  Trophy, 
  Users, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Megaphone, 
  BellRing, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ShieldCheck, 
  RotateCcw, 
  Phone, 
  FileText, 
  CreditCard, 
  History, 
  LifeBuoy, 
  PlayCircle, 
  Radio,
  Clock,
  Lock,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Settings,
  Shield
} from 'lucide-react';
import { 
  TabType, 
  RegisteredTeam, 
  TournamentInfo, 
  CommunityGroup, 
  HomeConfig, 
  AnnouncementItem, 
  UserAccount, 
  UserWallet, 
  SiteConfig,
  UpcomingTournament
} from '../../types';
import { 
  TOURNAMENT_FF_INFO, 
  TOURNAMENT_MLBB_INFO, 
  COMMUNITY_GROUPS, 
  ADMIN_WA, 
  INITIAL_ANNOUNCEMENTS 
} from '../../data/initialData';
import { TournamentCalendar } from '../TournamentCalendar';
import { 
  isGameTournamentAdded, 
  isGameRegistrationOpen, 
  hasAnyTournamentAdded, 
  hasAnyOpenRegistration 
} from '../../utils/tournamentStatus';
import { QuickTournamentModal } from '../admin/QuickTournamentModal';
import { QuickMatchScheduleModal } from '../admin/QuickMatchScheduleModal';
import { QuickAnnouncementModal } from '../admin/QuickAnnouncementModal';
import { QuickSocialsModal } from '../admin/QuickSocialsModal';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  registeredTeams: RegisteredTeam[];
  ffInfo?: TournamentInfo;
  mlbbInfo?: TournamentInfo;
  communityGroups?: CommunityGroup[];
  adminWa?: string;
  homeConfig?: HomeConfig;
  announcements?: AnnouncementItem[];
  currentUser?: UserAccount | null;
  isAdmin?: boolean;
  userWallet?: UserWallet;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onOpenRegisterModal,
  registeredTeams = [],
  ffInfo = TOURNAMENT_FF_INFO,
  mlbbInfo = TOURNAMENT_MLBB_INFO,
  communityGroups = COMMUNITY_GROUPS,
  adminWa = ADMIN_WA,
  homeConfig,
  announcements = INITIAL_ANNOUNCEMENTS,
  currentUser,
  isAdmin = false,
  siteConfig,
  setSiteConfig
}) => {
  const isUserAdmin = Boolean(isAdmin || currentUser?.role === 'admin' || currentUser?.isSuperAdmin);

  // Modals for in-place admin editing
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<UpcomingTournament | null>(null);
  const [tournamentGame, setTournamentGame] = useState<'FF' | 'MLBB'>('FF');

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState<AnnouncementItem | null>(null);
  const [showSocialsModal, setShowSocialsModal] = useState(false);

  // Check tournament availability & open registration status
  const isFfAdded = isGameTournamentAdded(siteConfig, 'FF');
  const isMlbbAdded = isGameTournamentAdded(siteConfig, 'MLBB');
  const isFfOpen = isGameRegistrationOpen(siteConfig, 'FF');
  const isMlbbOpen = isGameRegistrationOpen(siteConfig, 'MLBB');
  const hasAnyTourney = isFfAdded || isMlbbAdded;
  const hasAnyOpen = isFfOpen || isMlbbOpen;

  // Check if any upcoming tournament or match schedule is available
  const upcomingTournamentsList = siteConfig?.upcomingTournaments || [];
  const matchSchedulesList = siteConfig?.matchSchedules || [];
  const hasTournamentsOrSchedules = upcomingTournamentsList.length > 0 || matchSchedulesList.length > 0;

  // Dynamic slot calculations
  const ffCount = registeredTeams.filter(t => t.game === 'FF' && t.status === 'Sah').length;
  const mlbbCount = registeredTeams.filter(t => t.game === 'MLBB' && t.status === 'Sah').length;
  const ffTotalSlots = ffInfo.maxSlots || 32;
  const mlbbTotalSlots = mlbbInfo.maxSlots || 32;

  // Social & Community URLs
  const cleanWaNumber = adminWa.replace(/[^0-9]/g, '');
  const waGroupUrl = communityGroups[0]?.link || `https://chat.whatsapp.com/invite/hunters-community`;
  const youtubeUrl = homeConfig?.youtubeUrl || 'https://youtube.com/@dexzstoreofficial';
  const tiktokUrl = homeConfig?.tiktokUrl || 'https://tiktok.com/@dexzstore.esports';
  const instagramUrl = homeConfig?.instagramUrl || 'https://instagram.com/hunters.community_official';

  // Foldable Accordion State for Section 6 (Informasi Penting)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  const handleEditFfTournament = () => {
    const existingTourney = upcomingTournamentsList.find(t => t.game === 'FF');
    if (existingTourney) {
      setSelectedTournament(existingTourney);
    } else {
      setSelectedTournament({
        id: 'ff-main',
        title: ffInfo.title || 'TURNAMEN FREE FIRE SEASON RESMI',
        game: 'FF',
        openDate: '20 Agustus 2026',
        startDate: ffInfo.matchDates || '2 September 2026',
        closeDate: ffInfo.deadline || '1 September 2026',
        prizePool: ffInfo.totalPrize || 'Rp 1.440.000',
        slots: ffInfo.maxSlots || 32,
        registeredCount: ffCount,
        fee: ffInfo.fee || 'Rp50.000/Tim',
        mode: 'SQUAD BR',
        status: isFfOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup',
        isRegistrationOpen: isFfOpen,
        bannerImage: ffInfo.bannerImage || '',
        description: 'Battle Royale 6 Match • 3 Peta Berbeda • Format Poin Standar'
      });
    }
    setTournamentGame('FF');
    setShowTournamentModal(true);
  };

  const handleEditMlbbTournament = () => {
    const existingTourney = upcomingTournamentsList.find(t => t.game === 'MLBB');
    if (existingTourney) {
      setSelectedTournament(existingTourney);
    } else {
      setSelectedTournament({
        id: 'mlbb-main',
        title: mlbbInfo.title || 'TURNAMEN MOBILE LEGENDS BANG BANG',
        game: 'MLBB',
        openDate: '20 Agustus 2026',
        startDate: mlbbInfo.matchDates || '2 September 2026',
        closeDate: mlbbInfo.deadline || '1 September 2026',
        prizePool: mlbbInfo.totalPrize || 'Rp 1.440.000',
        slots: mlbbInfo.maxSlots || 32,
        registeredCount: mlbbCount,
        fee: mlbbInfo.fee || 'Rp50.000/Tim',
        mode: 'Custom Draft Pick 5v5',
        status: isMlbbOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup',
        isRegistrationOpen: isMlbbOpen,
        bannerImage: mlbbInfo.bannerImage || '',
        description: 'Custom Draft Pick 5v5 • Single Elimination BO3 • Grand Final BO5'
      });
    }
    setTournamentGame('MLBB');
    setShowTournamentModal(true);
  };

  const handleAddNewTournament = () => {
    setSelectedTournament(null);
    setTournamentGame('FF');
    setShowTournamentModal(true);
  };

  const handleAddNewAnnouncement = () => {
    setSelectedAnnounce(null);
    setShowAnnounceModal(true);
  };

  const handleEditAnnouncement = (ann: AnnouncementItem) => {
    setSelectedAnnounce(ann);
    setShowAnnounceModal(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!setSiteConfig || !siteConfig) return;
    if (confirm('Hapus pengumuman ini?')) {
      const currentList = siteConfig.announcements || [];
      const updated = currentList.filter(a => a.id !== id);
      setSiteConfig({
        ...siteConfig,
        announcements: updated
      });
    }
  };

  const toggleFfQuick = () => {
    if (!setSiteConfig || !siteConfig) return;
    const newState = !isFfOpen;
    setSiteConfig({
      ...siteConfig,
      isFfRegistrationOpen: newState,
      ffInfo: {
        ...siteConfig.ffInfo,
        status: newState ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'
      }
    });
  };

  const toggleMlbbQuick = () => {
    if (!setSiteConfig || !siteConfig) return;
    const newState = !isMlbbOpen;
    setSiteConfig({
      ...siteConfig,
      isMlbbRegistrationOpen: newState,
      mlbbInfo: {
        ...siteConfig.mlbbInfo,
        status: newState ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-5xl mx-auto">
      {/* ======================================================================= */}
      {/* 🛡️ ADMIN DIRECT CONTROL BANNER (HANYA MUNCUL UNTUK ADMIN)               */}
      {/* ======================================================================= */}
      {isUserAdmin && (
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-[#180830] to-indigo-950/90 border-2 border-amber-500/70 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  ⚡ KONTROL LANGSUNG ADMIN AKTIF
                </span>
                <h3 className="text-sm font-black text-white">
                  Kelola Turnamen, Jadwal, & Pengumuman Tanpa Perlu ke Panel Admin
                </h3>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFfQuick}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isFfOpen
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>FF: {isFfOpen ? '🟢 BUKA' : '🔴 TUTUP'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMlbbQuick}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMlbbOpen
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-cyan-300" />
                <span>MLBB: {isMlbbOpen ? '🟢 BUKA' : '🔴 TUTUP'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddNewTournament}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950" />
              <span>+ Turnamen Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Jadwal Match</span>
            </button>

            <button
              type="button"
              onClick={handleAddNewAnnouncement}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Pengumuman</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSocialsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-purple-200 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-purple-400" />
              <span>Edit Kontak & Sosmed</span>
            </button>
          </div>
        </section>
      )}

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 1 — HEADER & UTAMA (PALING ATAS)                             */}
      {/* ======================================================================= */}
      <section 
        id="section-hero-header"
        className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#140827] via-[#0d041a] to-[#07020d] border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden text-center space-y-6"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-3">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-black text-amber-300 shadow-md">
            <span>⭐</span>
            <span>Resmi &amp; Terpercaya — Ribuan Peserta!</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
            🎮 HUNTERS COMMUNITY — PUSAT TURNAMEN ESPORTS
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-purple-200/90 max-w-2xl mx-auto leading-relaxed font-medium">
            Platform Turnamen Free Fire &amp; Mobile Legends: Bang Bang
          </p>
        </div>

        {/* Dynamic Registration Buttons depending on added tournaments & open status */}
        <div className="relative z-10 space-y-3 max-w-xl mx-auto pt-2">
          {/* 1. Jika TIDAK ADA turnamen yang ditambahkan */}
          {!hasAnyTourney ? (
            <div className="p-4 bg-[#07020d] border border-neutral-800 rounded-xl text-xs text-neutral-400 space-y-1">
              <p className="font-bold text-neutral-300 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Belum Ada Turnamen Aktif</span>
              </p>
              <p className="text-[11px] text-neutral-500">
                Tombol pendaftaran akan muncul otomatis setelah Admin menambahkan turnamen Free Fire atau Mobile Legends.
              </p>
            </div>
          ) : !hasAnyOpen ? (
            /* 2. Jika turnamen ada, tapi pendaftaran SEMUANYA DITUTUP */
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 space-y-1">
              <p className="font-black text-red-300 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span>PENDAFTARAN TURNAMEN SAAT INI DITUTUP</span>
              </p>
              <p className="text-[11px] text-red-300/80">
                Pendaftaran tim sedang ditutup oleh Panitia. Nantikan informasi pembukaan periode berikutnya!
              </p>
            </div>
          ) : (
            /* 3. Tampilkan tombol pendaftaran HANYA untuk game yang aktif & dibuka */
            <div className={`grid gap-3 ${isFfOpen && isMlbbOpen ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Tombol Free Fire (Hanya tampil jika ada turnamen FF dan pendaftaran BUKA) */}
              {isFfOpen && (
                <button
                  type="button"
                  id="btn-hero-daftar-ff"
                  onClick={() => onOpenRegisterModal('FF')}
                  className="py-3.5 px-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-orange-400/40"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>DAFTAR FREE FIRE</span>
                </button>
              )}

              {/* Tombol MLBB (Hanya tampil jika ada turnamen MLBB dan pendaftaran BUKA) */}
              {isMlbbOpen && (
                <button
                  type="button"
                  id="btn-hero-daftar-mlbb"
                  onClick={() => onOpenRegisterModal('MLBB')}
                  className="py-3.5 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-950/50 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/40"
                >
                  <Swords className="w-4 h-4 text-cyan-300" />
                  <span>DAFTAR MOBILE LEGENDS</span>
                </button>
              )}
            </div>
          )}

          {/* Tombol Sekunder: Cara Daftar & Bayar */}
          <button
            type="button"
            id="btn-hero-cara-daftar"
            onClick={() => setActiveTab('cara-daftar')}
            className="w-full py-2.5 px-4 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>📖</span>
            <span>CARA DAFTAR &amp; BAYAR</span>
          </button>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 2 — PENGUMUMAN PENTING (SELALU TAMPAK)                        */}
      {/* ======================================================================= */}
      <section 
        id="section-announcements"
        className="rounded-2xl bg-[#0e061a] border border-fuchsia-500/30 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              📢 PENGUMUMAN &amp; INFORMASI TERBARU
            </h2>
          </div>

          {isUserAdmin && (
            <button
              type="button"
              onClick={handleAddNewAnnouncement}
              className="px-3 py-1.5 rounded-lg bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Pengumuman</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Custom siteConfig Announcement if exists */}
          {siteConfig?.urgentAnnouncement && (
            <div className="p-3.5 bg-purple-950/50 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start justify-between gap-2">
              <p className="font-semibold">{siteConfig.urgentAnnouncement}</p>
            </div>
          )}

          {/* List of siteConfig announcements with direct edit / delete */}
          {siteConfig?.announcements && siteConfig.announcements.length > 0 && (
            <div className="space-y-2.5">
              {siteConfig.announcements.map((ann) => (
                <div 
                  key={ann.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    ann.isUrgent 
                      ? 'bg-gradient-to-r from-red-950/60 via-purple-950/50 to-neutral-950 border-red-500/40 text-red-200' 
                      : 'bg-[#07020d] border-purple-900/50 text-neutral-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        ann.category === 'Info Penting' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        ann.category === 'Perubahan Jadwal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {ann.category}
                      </span>
                      <strong className="text-white font-bold text-xs">{ann.title}</strong>
                      <span className="text-[10px] font-mono text-neutral-400">({ann.date})</span>
                    </div>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">{ann.content}</p>
                  </div>

                  {isUserAdmin && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditAnnouncement(ann)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-300 border border-purple-900 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Pengumuman"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-900 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback jika belum ada turnamen/jadwal terdaftar dan tidak ada pengumuman urgent */}
          {!hasTournamentsOrSchedules && !siteConfig?.urgentAnnouncement && (!siteConfig?.announcements || siteConfig.announcements.length === 0) && (
            <div className="p-4 bg-[#07020d] border border-neutral-800/80 rounded-xl text-center space-y-1.5 text-xs text-neutral-400">
              <p className="font-bold text-neutral-300">Belum ada jadwal turnamen aktif saat ini</p>
              <p className="text-[11px] text-neutral-500">
                Jadwal turnamen &amp; pengumuman pendaftaran akan otomatis ditampilkan setelah dibuka oleh Admin.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 3 — STATISTIK & SLOT TURNAMEN (RAPI 2 KOLOM)                  */}
      {/* ======================================================================= */}
      <section 
        id="section-tournament-slots"
        className="rounded-2xl bg-[#0e061a] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                📊 STATUS KETERSEDIAAN SLOT
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isUserAdmin && (
              <button
                type="button"
                onClick={handleAddNewTournament}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Turnamen</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('turnamen')}
              className="text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              Semua Turnamen →
            </button>
          </div>
        </div>

        {/* Dynamic Tournament Slot Grid (HANYA Free Fire & Mobile Legends) */}
        {!hasAnyTourney ? (
          <div className="p-8 text-center bg-[#07020d] border border-neutral-800 rounded-xl space-y-2">
            <p className="text-sm font-bold text-neutral-300">Belum Ada Turnamen yang Ditambahkan</p>
            <p className="text-xs text-neutral-500">
              Jadwal dan slot turnamen Free Fire / Mobile Legends akan otomatis tampil di sini saat admin mengaktifkannya.
            </p>
            {isUserAdmin && (
              <button
                type="button"
                onClick={handleAddNewTournament}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer"
              >
                + Tambah Turnamen Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-3.5 ${isFfAdded && isMlbbAdded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Card 1: Free Fire (Hanya jika turnamen FF ditambahkan oleh Admin) */}
            {isFfAdded && (
              <div className="p-4 bg-[#07020d] border border-orange-500/30 hover:border-orange-500/60 rounded-xl space-y-3 transition-all relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <h3 className="font-extrabold text-sm text-white">Free Fire</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isUserAdmin && (
                      <button
                        type="button"
                        onClick={handleEditFfTournament}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit Turnamen FF"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isFfOpen && ffCount < ffTotalSlots
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {isFfOpen && ffCount < ffTotalSlots ? '🟢 BUKA' : '🔴 TUTUP'}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-neutral-400">Ketersediaan Slot:</span>
                  <strong className="text-sm font-mono font-black text-amber-300">
                    {ffCount}/{ffTotalSlots} Slot
                  </strong>
                </div>

                {isFfOpen && ffCount < ffTotalSlots ? (
                  <button
                    type="button"
                    onClick={() => onOpenRegisterModal('FF')}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Daftar Free Fire</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-neutral-900 text-red-400/90 font-bold text-xs uppercase tracking-wider rounded-lg border border-red-500/30 text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pendaftaran Ditutup</span>
                  </div>
                )}
              </div>
            )}

            {/* Card 2: Mobile Legends (Hanya jika turnamen MLBB ditambahkan oleh Admin) */}
            {isMlbbAdded && (
              <div className="p-4 bg-[#07020d] border border-blue-500/30 hover:border-blue-500/60 rounded-xl space-y-3 transition-all relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚔️</span>
                    <h3 className="font-extrabold text-sm text-white">Mobile Legends</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isUserAdmin && (
                      <button
                        type="button"
                        onClick={handleEditMlbbTournament}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit Turnamen MLBB"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isMlbbOpen && mlbbCount < mlbbTotalSlots
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {isMlbbOpen && mlbbCount < mlbbTotalSlots ? '🟢 BUKA' : '🔴 TUTUP'}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-neutral-400">Ketersediaan Slot:</span>
                  <strong className="text-sm font-mono font-black text-blue-300">
                    {mlbbCount}/{mlbbTotalSlots} Slot
                  </strong>
                </div>

                {isMlbbOpen && mlbbCount < mlbbTotalSlots ? (
                  <button
                    type="button"
                    onClick={() => onOpenRegisterModal('MLBB')}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Daftar Mobile Legends</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-neutral-900 text-red-400/90 font-bold text-xs uppercase tracking-wider rounded-lg border border-red-500/30 text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pendaftaran Ditutup</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 4 — KALENDER TURNAMEN (RAPI & JELAS)                          */}
      {/* ======================================================================= */}
      <section id="section-calendar" className="space-y-3">
        <TournamentCalendar
          upcomingTournaments={siteConfig?.upcomingTournaments || []}
          matchSchedules={siteConfig?.matchSchedules || []}
          onOpenRegisterModal={onOpenRegisterModal}
          isAdmin={isUserAdmin}
          onOpenAdminPanel={() => setActiveTab('admin')}
        />
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 5 — LIVESTREAM & MEDIA SOSIAL                                 */}
      {/* ======================================================================= */}
      <section 
        id="section-livestream-media"
        className="rounded-2xl bg-[#0e061a] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              📺 LIPUTAN LANGSUNG &amp; MEDIA SOSIAL
            </h2>
          </div>

          {isUserAdmin && (
            <button
              type="button"
              onClick={() => setShowSocialsModal(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Link</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kolom 1: YouTube Live */}
          <div className="p-4 bg-[#07020d] border border-red-500/30 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs">
                <span>📺</span>
                <span>YOUTUBE LIVE</span>
              </div>
              <h3 className="font-extrabold text-sm text-white">
                Siaran Langsung Pertandingan
              </h3>
              <p className="text-xs text-neutral-400">
                Nonton siaran langsung turnamen, highlight match, dan grand final resmi!
              </p>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-red-950/50"
            >
              <span>BUKA CHANNEL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Kolom 2: TikTok Live */}
          <div className="p-4 bg-[#07020d] border border-pink-500/30 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-pink-400 font-extrabold text-xs">
                <span>📱</span>
                <span>TIKTOK LIVE</span>
              </div>
              <h3 className="font-extrabold text-sm text-white">
                Live Room &amp; Caster DEXZ
              </h3>
              <p className="text-xs text-neutral-400">
                Tonton streaming caster seru, giveaway diamond, dan gameplay seru turnamen!
              </p>
            </div>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-pink-950/50"
            >
              <span>BUKA AKUN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 6 — INFORMASI PENTING (DILIPAT / BISA DIBUKA)                  */}
      {/* ======================================================================= */}
      <section 
        id="section-info-accordion"
        className="rounded-2xl bg-[#0e061a] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                📚 INFORMASI LENGKAP
              </h2>
              <span className="text-[11px] text-purple-300/80">Klik menu untuk melihat detail informasi</span>
            </div>
          </div>
        </div>

        {/* Accordion Menu Items */}
        <div className="space-y-2 pt-1">
          {/* 1. Kembalian Dana & Refund */}
          <div className="rounded-xl border border-purple-900/50 bg-[#07020d] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('refund')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>Kembalian Dana &amp; Refund</span>
              </div>
              {openAccordion === 'refund' ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openAccordion === 'refund' && (
              <div className="p-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-purple-900/40 space-y-2 bg-purple-950/20">
                <p>
                  Jika turnamen dibatalkan oleh pihak penyelenggara atau kuota tim tidak mencapai batas minimum, biaya pendaftaran akan dikembalikan <strong>100% tanpa potongan</strong> dalam waktu 1x24 jam.
                </p>
                <p>
                  Untuk klaim pengembalian dana, hubungi WhatsApp resmi panitia dengan melampirkan bukti transfer dan nama tim.
                </p>
              </div>
            )}
          </div>

          {/* 2. Pertanyaan Umum (FAQ) */}
          <div className="rounded-xl border border-purple-900/50 bg-[#07020d] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('faq')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>❓</span>
                <span>Pertanyaan Umum (FAQ)</span>
              </div>
              {openAccordion === 'faq' ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openAccordion === 'faq' && (
              <div className="p-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-purple-900/40 space-y-2.5 bg-purple-950/20">
                <div>
                  <strong className="text-white block">Q: Bagaimana cara mendapatkan Room ID &amp; Password?</strong>
                  <p className="text-neutral-400">A: Room ID dan Password dibagikan di grup WhatsApp peserta 15 menit sebelum pertandingan dimulai.</p>
                </div>
                <div>
                  <strong className="text-white block">Q: Apakah pemain cadangan diperbolehkan?</strong>
                  <p className="text-neutral-400">A: Ya, setiap tim diperbolehkan mendaftarkan maksimal 1-2 pemain cadangan resmi.</p>
                </div>
                <div>
                  <strong className="text-white block">Q: Kapan hadiah turnamen dicairkan?</strong>
                  <p className="text-neutral-400">A: Hadiah uang tunai dan sertifikat dibagikan langsung maksimal 1 jam setelah Grand Final selesai.</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Cara Daftar & Aturan */}
          <div className="rounded-xl border border-purple-900/50 bg-[#07020d] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('rules')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span>Cara Daftar &amp; Aturan Pertandingan</span>
              </div>
              {openAccordion === 'rules' ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openAccordion === 'rules' && (
              <div className="p-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-purple-900/40 space-y-2 bg-purple-950/20">
                <ul className="list-disc pl-4 space-y-1 text-neutral-300">
                  <li>Pilih game yang ingin diikuti dan klik tombol daftar.</li>
                  <li>Isi nama tim, data kapten, dan nomor WhatsApp aktif.</li>
                  <li>Lakukan pembayaran slot via QRIS resmi DEXZ STORE jika turnamen berbayar.</li>
                  <li>Dilarang keras menggunakan cheat, mod, script, atau emulator ilegal (Diskualifikasi &amp; Blacklist Permanen).</li>
                  <li>Wajib hadir di room kustom 10 menit sebelum waktu pertandingan. Keterlambatan lebih dari 5 menit dinyatakan WO.</li>
                </ul>
              </div>
            )}
          </div>

          {/* 4. Tim & Kontak Admin */}
          <div className="rounded-xl border border-purple-900/50 bg-[#07020d] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('contact')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>Tim &amp; Kontak Admin</span>
              </div>
              {openAccordion === 'contact' ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openAccordion === 'contact' && (
              <div className="p-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-purple-900/40 space-y-2 bg-purple-950/20">
                <p>
                  Penyelenggara Resmi: <strong>DEXZ STORE ORGANIZER</strong>
                </p>
                <p>
                  Customer Support WhatsApp: <a href={`https://wa.me/${cleanWaNumber}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold underline font-mono">+{cleanWaNumber}</a> (Aktif 24/7)
                </p>
                <p className="text-neutral-400">
                  Hubungi kami untuk pertanyaan seputar pendaftaran, kerjasama sponsor, atau konfirmasi hasil pertandingan.
                </p>
              </div>
            )}
          </div>

          {/* 5. Pengumuman Lengkap */}
          <div className="rounded-xl border border-purple-900/50 bg-[#07020d] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('announcements_full')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>📢</span>
                <span>Pengumuman Lengkap</span>
              </div>
              {openAccordion === 'announcements_full' ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openAccordion === 'announcements_full' && (
              <div className="p-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-purple-900/40 space-y-2 bg-purple-950/20">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="p-2.5 bg-neutral-900/80 rounded-lg border border-neutral-800 space-y-1">
                    <strong className="text-amber-300 block">{ann.title}</strong>
                    <p className="text-neutral-300">{ann.content}</p>
                    <span className="text-[10px] text-neutral-500 font-mono block">{ann.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 7 — KOMUNITAS & TAUTAN PENTING                                */}
      {/* ======================================================================= */}
      <section 
        id="section-community-links"
        className="rounded-2xl bg-[#0e061a] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-purple-900/40 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            🔗 KOMUNITAS &amp; TAUTAN PENTING
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Link 1: WhatsApp Group */}
          <div className="p-3.5 bg-[#07020d] border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🟢</span>
              <div>
                <strong className="text-xs text-white block">Grup WhatsApp Resmi</strong>
                <span className="text-[11px] text-neutral-400">Diskusi &amp; info room</span>
              </div>
            </div>
            <a
              href={waGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded-lg transition-all"
            >
              [ BERGABUNG ]
            </a>
          </div>

          {/* Link 2: YouTube Channel */}
          <div className="p-3.5 bg-[#07020d] border border-red-500/30 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">📺</span>
              <div>
                <strong className="text-xs text-white block">Channel YouTube</strong>
                <span className="text-[11px] text-neutral-400">Live stream &amp; match</span>
              </div>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-lg transition-all"
            >
              [ LANGGANAN ]
            </a>
          </div>

          {/* Link 3: TikTok Account */}
          <div className="p-3.5 bg-[#07020d] border border-pink-500/30 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">📱</span>
              <div>
                <strong className="text-xs text-white block">Akun TikTok</strong>
                <span className="text-[11px] text-neutral-400">Video &amp; cuplikan seru</span>
              </div>
            </div>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase rounded-lg transition-all"
            >
              [ IKUTI ]
            </a>
          </div>

          {/* Link 4: Instagram Account */}
          <div className="p-3.5 bg-[#07020d] border border-fuchsia-500/30 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">📸</span>
              <div>
                <strong className="text-xs text-white block">Instagram</strong>
                <span className="text-[11px] text-neutral-400">Info grafis &amp; jadwal</span>
              </div>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xs uppercase rounded-lg transition-all"
            >
              [ IKUTI ]
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 BAGIAN 8 — MENU CEPAT (DI BAWAH, SEBELUM NAVIGASI)                   */}
      {/* ======================================================================= */}
      <section 
        id="section-quick-menu"
        className="rounded-2xl bg-[#0e061a] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-purple-900/40 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            ⚡ MENU CEPAT
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick 1: Daftar Turnamen */}
          <button
            type="button"
            id="btn-quick-turnamen"
            onClick={() => setActiveTab('turnamen')}
            className="p-3.5 bg-[#07020d] hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
            <span className="text-xs font-black text-white group-hover:text-amber-300">
              Daftar Turnamen
            </span>
          </button>

          {/* Quick 2: Top Up Saldo */}
          <button
            type="button"
            id="btn-quick-topup"
            onClick={() => setActiveTab('saldo')}
            className="p-3.5 bg-[#07020d] hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
            <span className="text-xs font-black text-white group-hover:text-emerald-300">
              Top Up Saldo
            </span>
          </button>

          {/* Quick 3: Riwayat Saya */}
          <button
            type="button"
            id="btn-quick-riwayat"
            onClick={() => setActiveTab('info-match')}
            className="p-3.5 bg-[#07020d] hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
            <span className="text-xs font-black text-white group-hover:text-blue-300">
              Riwayat Saya
            </span>
          </button>

          {/* Quick 4: Bantuan */}
          <button
            type="button"
            id="btn-quick-bantuan"
            onClick={() => setActiveTab('bantuan')}
            className="p-3.5 bg-[#07020d] hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">❓</span>
            <span className="text-xs font-black text-white group-hover:text-fuchsia-300">
              Bantuan
            </span>
          </button>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 🔹 MODAL ADMIN CEPAT (DIRECT EDIT MODALS)                              */}
      {/* ======================================================================= */}
      {siteConfig && setSiteConfig && (
        <>
          <QuickTournamentModal
            isOpen={showTournamentModal}
            onClose={() => setShowTournamentModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            tournamentToEdit={selectedTournament}
            defaultGame={tournamentGame}
          />

          <QuickMatchScheduleModal
            isOpen={showMatchModal}
            onClose={() => setShowMatchModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            scheduleToEdit={null}
          />

          <QuickAnnouncementModal
            isOpen={showAnnounceModal}
            onClose={() => setShowAnnounceModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            announcementToEdit={selectedAnnounce}
          />

          <QuickSocialsModal
            isOpen={showSocialsModal}
            onClose={() => setShowSocialsModal(false)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        </>
      )}
    </div>
  );
};
