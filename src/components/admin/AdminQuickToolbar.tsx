import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Trophy, 
  Calendar, 
  Megaphone, 
  Users, 
  Phone, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Swords, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink,
  BookOpen,
  DollarSign,
  MessageSquareCode,
  Headphones,
  Sun,
  Moon
} from 'lucide-react';
import { SiteConfig, RegisteredTeam } from '../../types';
import { QuickTournamentModal } from './QuickTournamentModal';
import { QuickMatchScheduleModal } from './QuickMatchScheduleModal';
import { QuickAnnouncementModal } from './QuickAnnouncementModal';
import { QuickTeamModal } from './QuickTeamModal';
import { QuickSocialsModal } from './QuickSocialsModal';
import { QuickRuleModal } from './QuickRuleModal';
import { QuickPrizeModal } from './QuickPrizeModal';
import { QuickCommunityModal } from './QuickCommunityModal';
import { QuickContactModal } from './QuickContactModal';
import { useTheme } from '../../context/ThemeContext';

interface AdminQuickToolbarProps {
  isAdmin: boolean;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  registeredTeams: RegisteredTeam[];
  setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>>;
  onNavigateToAdmin?: () => void;
}

export const AdminQuickToolbar: React.FC<AdminQuickToolbarProps> = ({
  isAdmin,
  siteConfig,
  setSiteConfig,
  registeredTeams,
  setRegisteredTeams,
  onNavigateToAdmin
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Modals state
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  if (!isAdmin) return null;

  const toggleFfRegistration = () => {
    const newState = !siteConfig.isFfRegistrationOpen;
    setSiteConfig({
      ...siteConfig,
      isFfRegistrationOpen: newState,
      ffInfo: {
        ...siteConfig.ffInfo,
        status: newState ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'
      }
    });
  };

  const toggleMlbbRegistration = () => {
    const newState = !siteConfig.isMlbbRegistrationOpen;
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
    <>
      {/* Floating Quick Dock */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Expanded Quick Actions Menu */}
        {isExpanded && (
          <div className="bg-[#0b0318]/95 backdrop-blur-md border-2 border-purple-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-purple-950/90 text-white w-80 sm:w-96 space-y-3.5 animate-in slide-in-from-bottom-5 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Header / Admin Mode Indicator */}
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>AKSI CEPAT ADMIN LANGSUNG</span>
                </span>
              </div>

              {/* Quick Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title={theme === 'dark' ? 'Ganti ke Tema "Professional Polish"' : 'Ganti ke Tema Esports Dark'}
              >
                {theme === 'dark' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                <span>{theme === 'dark' ? 'Polish' : 'Dark'}</span>
              </button>
            </div>

            {/* Quick Registration Toggles */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                Buka / Tutup Pendaftaran:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* FF Toggle */}
                <button
                  type="button"
                  onClick={toggleFfRegistration}
                  className={`p-2 rounded-xl border text-[11px] font-black uppercase tracking-wide flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    siteConfig.isFfRegistrationOpen
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-950/60'
                      : 'bg-red-950/80 border-red-500/80 text-red-300 shadow-md shadow-red-950/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Free Fire</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                    {siteConfig.isFfRegistrationOpen ? '🟢 BUKA' : '🔴 TUTUP'}
                  </span>
                </button>

                {/* MLBB Toggle */}
                <button
                  type="button"
                  onClick={toggleMlbbRegistration}
                  className={`p-2 rounded-xl border text-[11px] font-black uppercase tracking-wide flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    siteConfig.isMlbbRegistrationOpen
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-950/60'
                      : 'bg-red-950/80 border-red-500/80 text-red-300 shadow-md shadow-red-950/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5 text-cyan-300" />
                    <span>MLBB</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                    {siteConfig.isMlbbRegistrationOpen ? '🟢 BUKA' : '🔴 TUTUP'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                Kelola Semua Menu Langsung:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTournamentModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">+ Turnamen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMatchModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">+ Jadwal Match</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAnnounceModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <span className="truncate">+ Pengumuman</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTeamModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">+ Tambah Tim</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPrizeModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="truncate">⚡ Skema Hadiah</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRuleModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">📜 Kelola Aturan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCommunityModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquareCode className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate">💬 Grup WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowContactModal(true);
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">🎧 Kontak & Ticker</span>
                </button>
              </div>
            </div>

            {/* Quick Contacts & Full Admin shortcut */}
            <div className="pt-2 border-t border-purple-900/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSocialsModal(true);
                  setIsExpanded(false);
                }}
                className="flex-1 py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Sosmed & Banner</span>
              </button>

              {onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToAdmin();
                    setIsExpanded(false);
                  }}
                  className="py-2 px-3 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Buka Panel Admin Lengkap"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-300" />
                  <span>Panel</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-2xl shadow-amber-950/90 border-2 border-amber-300/80 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-purple-950/80"
        >
          <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-white drop-shadow-md">Aksi Admin</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-white" />
          ) : (
            <ChevronUp className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Reusable Modals */}
      <QuickTournamentModal
        isOpen={showTournamentModal}
        onClose={() => setShowTournamentModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickMatchScheduleModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickAnnouncementModal
        isOpen={showAnnounceModal}
        onClose={() => setShowAnnounceModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickTeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        registeredTeams={registeredTeams}
        setRegisteredTeams={setRegisteredTeams}
      />

      <QuickSocialsModal
        isOpen={showSocialsModal}
        onClose={() => setShowSocialsModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickRuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickPrizeModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickCommunityModal
        isOpen={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />

      <QuickContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
      />
    </>
  );
};
