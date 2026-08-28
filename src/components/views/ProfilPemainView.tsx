import React, { useState, useRef, useMemo } from 'react';
import { 
  User, 
  Flame, 
  Swords, 
  Trophy, 
  ShieldCheck, 
  Edit3, 
  Camera, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Share2, 
  Sparkles, 
  Medal, 
  Award, 
  QrCode, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Crown, 
  Gamepad2, 
  Save, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  ArrowRight, 
  Lock, 
  LogIn, 
  UserPlus,
  Check,
  Zap,
  Target,
  Users,
  Shield,
  Layers,
  ChevronRight,
  Info,
  Key
} from 'lucide-react';
import { 
  TabType, 
  UserAccount, 
  RegisteredTeam, 
  SiteConfig, 
  PlayerTournamentRecord, 
  UserWallet 
} from '../../types';
import { MediaUploadField } from '../common/MediaUploadField';

interface ProfilPemainViewProps {
  currentUser: UserAccount | null;
  onUpdateUser: (updatedUser: UserAccount) => void;
  registeredTeams: RegisteredTeam[];
  userWallet?: UserWallet;
  siteConfig: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
  setActiveTab: (tab: TabType) => void;
  onOpenRegisterModal?: (game?: 'FF' | 'MLBB') => void;
  onSelectInfoMatchSubTab?: (subTab: string) => void;
}

// Preset Esport Avatar Collections
const PRESET_AVATARS = [
  {
    id: 'cyber-wolf',
    name: 'Cyber Wolf',
    game: 'FF / MLBB',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'shadow-ninja',
    name: 'Shadow Ninja',
    game: 'Free Fire',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'flame-dragon',
    name: 'Dragon Mage',
    game: 'MLBB',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cyber-assassin',
    name: 'Cyber Rusher',
    game: 'Free Fire',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'mythic-empress',
    name: 'Mythic Valkyrie',
    game: 'MLBB',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'golden-champion',
    name: 'Golden Champion',
    game: 'Universal',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  }
];

export const ProfilPemainView: React.FC<ProfilPemainViewProps> = ({
  currentUser,
  onUpdateUser,
  registeredTeams = [],
  userWallet,
  siteConfig,
  setSiteConfig,
  setActiveTab,
  onOpenRegisterModal,
  onSelectInfoMatchSubTab
}) => {
  // Main Tab Navigation inside Profile
  const [activeProfileTab, setActiveProfileTab] = useState<'ringkasan' | 'riwayat-turnamen' | 'pengaturan' | 'id-card'>('ringkasan');
  
  // Game Filter for tournament history
  const [historyGameFilter, setHistoryGameFilter] = useState<'ALL' | 'FF' | 'MLBB'>('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form Edit State
  const [editName, setEditName] = useState(currentUser?.name || 'Pemain Esports');
  const [editNickname, setEditNickname] = useState(currentUser?.nickname || currentUser?.username || 'HUNTER_PLAYER');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || 'Squad Player Hunters Community DEXZ STORE | Road to Champion! 🏆');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0].url);
  
  // Game IDs
  const [editFfId, setEditFfId] = useState(currentUser?.ffId || '');
  const [editFfNickname, setEditFfNickname] = useState(currentUser?.ffNickname || '');
  const [editMlbbId, setEditMlbbId] = useState(currentUser?.mlbbId || '');
  const [editMlbbServerId, setEditMlbbServerId] = useState(currentUser?.mlbbServerId || '');
  const [editMlbbNickname, setEditMlbbNickname] = useState(currentUser?.mlbbNickname || '');
  
  // Preferences
  const [editPrimaryGame, setEditPrimaryGame] = useState<'FF' | 'MLBB' | 'Semua'>(currentUser?.primaryGame || 'Semua');
  const [editPrimaryRole, setEditPrimaryRole] = useState(currentUser?.primaryRole || 'Rusher / Jungler');
  const [editCity, setEditCity] = useState(currentUser?.city || 'Indonesia');
  const [editInstagram, setEditInstagram] = useState(currentUser?.instagram || '');

  // Reset form with currentUser values whenever currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || 'Pemain Esports');
      setEditNickname(currentUser.nickname || currentUser.username || currentUser.name.split(' ')[0] || 'HUNTER_PRO');
      setEditPhone(currentUser.phone || '');
      setEditBio(currentUser.bio || 'Squad Player Hunters Community DEXZ STORE | Road to Champion! 🏆');
      setEditAvatarUrl(currentUser.avatarUrl || PRESET_AVATARS[0].url);
      setEditFfId(currentUser.ffId || '');
      setEditFfNickname(currentUser.ffNickname || '');
      setEditMlbbId(currentUser.mlbbId || '');
      setEditMlbbServerId(currentUser.mlbbServerId || '');
      setEditMlbbNickname(currentUser.mlbbNickname || '');
      setEditPrimaryGame(currentUser.primaryGame || 'Semua');
      setEditPrimaryRole(currentUser.primaryRole || 'Rusher / Jungler');
      setEditCity(currentUser.city || 'Indonesia');
      setEditInstagram(currentUser.instagram || '');
    }
  }, [currentUser]);

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  // Compile full tournament participation history for the current player
  const playerParticipations = useMemo(() => {
    if (!currentUser) return [];

    const userPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
    const userNameClean = (currentUser.name || '').toLowerCase().trim();
    const userNickClean = (currentUser.nickname || '').toLowerCase().trim();
    const userFfNickClean = (currentUser.ffNickname || '').toLowerCase().trim();
    const userMlbbNickClean = (currentUser.mlbbNickname || '').toLowerCase().trim();

    // 1. Matched teams from live registeredTeams list
    const matchedFromRegistered = registeredTeams.filter(team => {
      const captainPhoneClean = (team.captainPhone || '').replace(/\D/g, '');
      const captainNameClean = (team.captainName || '').toLowerCase().trim();

      // Check captain match
      const isCaptain = (userPhoneClean && captainPhoneClean && userPhoneClean === captainPhoneClean) ||
                        (captainNameClean && (captainNameClean === userNameClean || captainNameClean === userNickClean));

      // Check roster match
      const rosterList = (team.roster || team.members || []).map(r => r.toLowerCase().trim());
      const isInRoster = rosterList.some(r => 
        r.includes(userNameClean) || 
        (userNickClean && r.includes(userNickClean)) ||
        (userFfNickClean && r.includes(userFfNickClean)) ||
        (userMlbbNickClean && r.includes(userMlbbNickClean))
      );

      return isCaptain || isInRoster;
    }).map(team => {
      const isCaptain = (team.captainPhone && userPhoneClean && team.captainPhone.replace(/\D/g, '') === userPhoneClean) ||
                        (team.captainName.toLowerCase() === userNameClean);

      const record: PlayerTournamentRecord = {
        id: `reg-${team.id}`,
        tournamentTitle: team.game === 'FF' 
          ? (siteConfig.ffInfo?.title || 'Turnamen Free Fire Hunters Community') 
          : (siteConfig.mlbbInfo?.title || 'Turnamen MLBB Hunters Community'),
        game: team.game,
        teamName: team.teamName,
        roleInTeam: isCaptain ? '👑 Kapten Tim' : '⚔️ Anggota Squad',
        slotNumber: team.slotNumber,
        date: team.registeredAt ? new Date(team.registeredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Musim Ini',
        status: team.status as any,
        achievement: team.status === 'Sah' ? 'Slot Resmi SAH' : team.status === 'Menunggu Pembayaran' ? 'Menunggu Konfirmasi' : 'Gagal',
        notes: team.roomCode ? `Room: ${team.roomCode} | Pass: ${team.roomPass || 'TBA'}` : undefined
      };
      return record;
    });

    // 2. Explicit tournament history attached to user account
    const explicitHistory = currentUser.tournamentHistory || [];

    // Combine and remove duplicates
    const combined = [...matchedFromRegistered];
    explicitHistory.forEach(item => {
      if (!combined.some(c => c.id === item.id || (c.teamName === item.teamName && c.game === item.game))) {
        combined.push(item);
      }
    });

    // If user has 0 history (e.g. newly registered), provide welcoming default demo records so they see how the tournament card looks
    if (combined.length === 0) {
      return [
        {
          id: 'demo-ff-1',
          tournamentTitle: siteConfig.ffInfo?.title || 'Turnamen Free Fire Season Hunters Community DEXZ',
          game: 'FF' as const,
          teamName: currentUser.teamName || `${currentUser.nickname || 'Hunter'} Squad Pro`,
          roleInTeam: '👑 Kapten Tim',
          slotNumber: 7,
          date: 'Turnamen Musim Ini',
          status: 'Sah' as const,
          achievement: '🏆 Juara 1 (Booyah Master)',
          kills: 24,
          matchScore: '86 Poin',
          notes: 'Room ID: 882910 | Password diumumkan di grup WA'
        },
        {
          id: 'demo-mlbb-1',
          tournamentTitle: siteConfig.mlbbInfo?.title || 'Turnamen Mobile Legends: Bang Bang Dexz Cup',
          game: 'MLBB' as const,
          teamName: `${currentUser.nickname || 'Hunter'} Glory Esport`,
          roleInTeam: '⚔️ Midlaner / Jungler',
          slotNumber: 12,
          date: 'Turnamen Musim Ini',
          status: 'Sah' as const,
          achievement: '🥈 Runner Up (Top 2 Finalist)',
          kills: 18,
          matchScore: 'Skor Match: 2 - 1',
          notes: 'Custom Draft Pick 5v5'
        }
      ];
    }

    return combined;
  }, [currentUser, registeredTeams, siteConfig]);

  // Filtered Tournament History
  const filteredHistory = useMemo(() => {
    return playerParticipations.filter(item => {
      const matchGame = historyGameFilter === 'ALL' || item.game === historyGameFilter;
      const matchQuery = 
        item.tournamentTitle.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        item.teamName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        (item.achievement && item.achievement.toLowerCase().includes(historySearchQuery.toLowerCase()));
      return matchGame && matchQuery;
    });
  }, [playerParticipations, historyGameFilter, historySearchQuery]);

  // Statistics calculation
  const totalTournaments = playerParticipations.length;
  const ffTournaments = playerParticipations.filter(p => p.game === 'FF').length;
  const mlbbTournaments = playerParticipations.filter(p => p.game === 'MLBB').length;
  const sahCount = playerParticipations.filter(p => p.status === 'Sah' || p.status === 'Selesai').length;
  const winCount = playerParticipations.filter(p => p.achievement?.includes('Juara') || p.achievement?.includes('Booyah') || p.achievement?.includes('Top')).length;
  const winRate = totalTournaments > 0 ? Math.round((winCount / totalTournaments) * 100) : 0;

  // Save Profile Handler
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentUser) return;

    const updatedUserAccount: UserAccount = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      nickname: editNickname.trim() || editName.split(' ')[0] || 'HUNTER_PRO',
      username: editNickname.trim(),
      phone: editPhone.trim() || currentUser.phone,
      bio: editBio.trim(),
      avatarUrl: editAvatarUrl || currentUser.avatarUrl,
      ffId: editFfId.trim(),
      ffNickname: editFfNickname.trim(),
      mlbbId: editMlbbId.trim(),
      mlbbServerId: editMlbbServerId.trim(),
      mlbbNickname: editMlbbNickname.trim(),
      primaryGame: editPrimaryGame,
      primaryRole: editPrimaryRole.trim(),
      city: editCity.trim(),
      instagram: editInstagram.trim()
    };

    // 1. Update active user state in App
    onUpdateUser(updatedUserAccount);

    // 2. If user exists in siteConfig.memberAccounts, sync to siteConfig as well
    if (siteConfig && setSiteConfig) {
      const currentMembers = siteConfig.memberAccounts || [];
      const updatedMembers = currentMembers.map(m => {
        if (m.email.toLowerCase() === updatedUserAccount.email.toLowerCase() || (m.id && m.id === updatedUserAccount.id)) {
          return updatedUserAccount;
        }
        return m;
      });

      // If user wasn't in memberAccounts, add them
      if (!currentMembers.some(m => m.email.toLowerCase() === updatedUserAccount.email.toLowerCase())) {
        updatedMembers.push(updatedUserAccount);
      }

      setSiteConfig({
        ...siteConfig,
        memberAccounts: updatedMembers
      });
    }

    // 3. LocalStorage persistence
    try {
      localStorage.setItem('hunters_community_user', JSON.stringify(updatedUserAccount));
    } catch (err) {
      console.error('Failed to save user in localStorage', err);
    }

    setSaveSuccessMsg('Profil dan data pemain berhasil diperbarui secara instan!');
    setIsEditing(false);
    setShowAvatarPickerModal(false);

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Non-logged-in guest fallback
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="bg-slate-900 border border-purple-900/60 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-amber-500 p-1 shadow-lg shadow-purple-950/60">
            <div className="w-full h-full bg-[#070210] rounded-[22px] flex items-center justify-center">
              <User className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              PROFIL PEMAIN ESPORTS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Masuk atau buat akun pemain Hunters Community DEXZ STORE untuk mengelola ID Game Free Fire & MLBB, mengunggah foto profil, dan melihat riwayat partisipasi turnamen Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Ke Akun Pemain</span>
            </button>
            <button
              onClick={() => setActiveTab('semua-turnamen')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Lihat Turnamen Aktif</span>
            </button>
          </div>

          {/* Fitur Profil List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-6 border-t border-slate-800">
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Flame className="w-4 h-4" />
                <span>ID Game Terintegrasi</span>
              </div>
              <p className="text-[11px] text-slate-400">Simpan UID Free Fire & Server MLBB agar otomatis terisi saat daftar turnamen.</p>
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Medal className="w-4 h-4" />
                <span>Riwayat & Prestasi</span>
              </div>
              <p className="text-[11px] text-slate-400">Pantau seluruh slot turnamen, hasil Booyah, kemenangan babak & sertifikat.</p>
            </div>
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <QrCode className="w-4 h-4" />
                <span>Kartu ID Player Digital</span>
              </div>
              <p className="text-[11px] text-slate-400">Kartu identitas gamer resmi dengan QR Code verifikasi atlet esport.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userNickname = currentUser.nickname || currentUser.username || currentUser.name.split(' ')[0] || 'HUNTER_PRO';
  const playerRoleTitle = currentUser.role === 'admin' || currentUser.isSuperAdmin 
    ? '🛡️ Super Admin & Penyelenggara' 
    : (currentUser.primaryRole || '⭐ Atlet Esport Terverifikasi');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 🌟 TOAST NOTIFIKASI SUKSES */}
      {/* ========================================================================= */}
      {saveSuccessMsg && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎮 HEADER UTAMA PROFIL PEMAIN & BANNER ESPORT */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-purple-900/60 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner Cover Atas */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 relative overflow-hidden border-b border-purple-900/40">
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -bottom-10 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>HUNTERS MEMBER ID: #{currentUser.phone ? currentUser.phone.slice(-4) : '7789'}</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-4 sm:left-6 hidden sm:flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AKUN RESMI HUNTERS COMMUNITY × DEXZ STORE</span>
          </div>
        </div>

        {/* Konten Profil (Avatar, Nickname, Badges, Quick Stats) */}
        <div className="px-4 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar & Identitas */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left w-full md:w-auto">
              {/* Avatar Box with Quick Edit Badge */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-1 shadow-2xl shadow-purple-950">
                  <img
                    src={currentUser.avatarUrl || PRESET_AVATARS[0].url}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[20px] bg-slate-950"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPickerModal(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg border-2 border-slate-900 cursor-pointer transition-transform hover:scale-110"
                  title="Ganti Foto Profil / Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Player Name, Nickname & Badges */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-600/30 border border-purple-500/50 text-amber-300 text-xs font-black tracking-wide">
                    [{userNickname}]
                  </span>
                  {currentUser.isSuperAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                      SUPER ADMIN
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-purple-300 flex items-center justify-center sm:justify-start gap-1.5">
                  <span>{playerRoleTitle}</span>
                  <span>•</span>
                  <span className="text-slate-400">{currentUser.city || 'Indonesia'}</span>
                </p>

                <p className="text-xs text-slate-300 max-w-xl line-clamp-2 italic pt-0.5">
                  "{currentUser.bio || 'Squad Player Hunters Community DEXZ STORE | Siap bertanding & merebut Booyah!'}"
                </p>
              </div>
            </div>

            {/* Tombol Aksi Kanan */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setActiveProfileTab('pengaturan');
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEditing ? 'Tutup Edit' : 'Edit Profil'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProfileTab('id-card')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer transition-all hover:scale-105"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Kartu ID Pemain</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Turnamen</span>
              <span className="text-lg sm:text-xl font-black text-amber-400">{totalTournaments}</span>
              <span className="text-[9px] text-slate-500 block">Partisipasi Tim</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Slot Sah / Sukses</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{sahCount}</span>
              <span className="text-[9px] text-slate-500 block">Terverifikasi Panitia</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Prestasi / Juara</span>
              <span className="text-lg sm:text-xl font-black text-purple-400">{winCount}</span>
              <span className="text-[9px] text-slate-500 block">Win Rate {winRate}%</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Dompet</span>
              <span className="text-lg sm:text-xl font-black text-red-400">
                Rp {(userWallet?.balance || 0).toLocaleString('id-ID')}
              </span>
              <button 
                type="button"
                onClick={() => setActiveTab('saldo')}
                className="text-[9px] text-red-300 underline font-bold block mx-auto cursor-pointer hover:text-white"
              >
                Top Up / Tarik Saldo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧭 NAVIGASI SUB-TAB PROFIL (RINGKASAN, RIWAYAT, PENGATURAN, KARTU ID) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveProfileTab('ringkasan');
            setIsEditing(false);
          }}
          className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeProfileTab === 'ringkasan'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Ringkasan Profil</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveProfileTab('riwayat-turnamen');
            setIsEditing(false);
          }}
          className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeProfileTab === 'riwayat-turnamen'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Riwayat Turnamen ({totalTournaments})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveProfileTab('pengaturan');
            setIsEditing(true);
          }}
          className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeProfileTab === 'pengaturan'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Atur Nama & Foto</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveProfileTab('id-card');
            setIsEditing(false);
          }}
          className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeProfileTab === 'id-card'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>ID Card Esport</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📌 TAB 1: RINGKASAN PROFIL (INFORMASI DASAR + GAME ID FF & MLBB) */}
      {/* ========================================================================= */}
      {activeProfileTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* KARTU IDENTITAS GAME (FREE FIRE & MLBB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Fire ID Card */}
            <div className="bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950 border border-orange-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white uppercase">FREE FIRE PROFILE</h2>
                    <span className="text-[10px] text-orange-400 font-bold">Battle Royale Official</span>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-black uppercase">
                  {currentUser.ffId ? 'TERHUBUNG' : 'BELUM DIISI'}
                </span>
              </div>

              <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-orange-900/30 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">UID Akun Free Fire:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-mono text-xs">{currentUser.ffId || 'Belum diisi'}</strong>
                    {currentUser.ffId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(currentUser.ffId || '', 'UID Free Fire')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 cursor-pointer"
                        title="Salin UID"
                      >
                        {copiedText === 'UID Free Fire' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Nickname In-Game FF:</span>
                  <strong className="text-amber-300 font-bold">{currentUser.ffNickname || currentUser.nickname || '-'}</strong>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-semibold">Role Utama FF:</span>
                  <span className="px-2 py-0.5 rounded bg-orange-600/30 text-orange-300 font-bold text-[11px]">
                    {currentUser.primaryRole?.includes('Rusher') || currentUser.primaryRole?.includes('Sniper') ? currentUser.primaryRole : 'Rusher / Support'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProfileTab('pengaturan');
                    setIsEditing(true);
                  }}
                  className="w-full py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit ID Free Fire</span>
                </button>
                {onOpenRegisterModal && (
                  <button
                    type="button"
                    onClick={() => onOpenRegisterModal('FF')}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Daftar Turnamen FF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Legends ID Card */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white uppercase">MOBILE LEGENDS PROFILE</h2>
                    <span className="text-[10px] text-blue-400 font-bold">5v5 MOBA Official</span>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase">
                  {currentUser.mlbbId ? 'TERHUBUNG' : 'BELUM DIISI'}
                </span>
              </div>

              <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/30 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">User ID & Server MLBB:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-mono text-xs">
                      {currentUser.mlbbId ? `${currentUser.mlbbId} (${currentUser.mlbbServerId || 'Zone'})` : 'Belum diisi'}
                    </strong>
                    {currentUser.mlbbId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(`${currentUser.mlbbId} (${currentUser.mlbbServerId || ''})`, 'ID MLBB')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer"
                        title="Salin ID MLBB"
                      >
                        {copiedText === 'ID MLBB' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Nickname In-Game MLBB:</span>
                  <strong className="text-cyan-300 font-bold">{currentUser.mlbbNickname || currentUser.nickname || '-'}</strong>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-semibold">Role Utama MLBB:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold text-[11px]">
                    {currentUser.primaryRole?.includes('Jungler') || currentUser.primaryRole?.includes('Midlaner') ? currentUser.primaryRole : 'Jungler / Midlaner'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProfileTab('pengaturan');
                    setIsEditing(true);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit ID MLBB</span>
                </button>
                {onOpenRegisterModal && (
                  <button
                    type="button"
                    onClick={() => onOpenRegisterModal('MLBB')}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Daftar Turnamen MLBB</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* INFORMASI DETAIL AKUN & KONTAK */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Detail Akun & Kontak Pemain</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Nomor WhatsApp Terdaftar</span>
                </span>
                <strong className="text-white text-xs font-mono">{currentUser.phone || 'Belum diisi'}</strong>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Mail className="w-3 h-3 text-purple-400" />
                  <span>Email Akun</span>
                </span>
                <strong className="text-white text-xs truncate block">{currentUser.email}</strong>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>Domisili / Kota</span>
                </span>
                <strong className="text-white text-xs">{currentUser.city || 'Indonesia'}</strong>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Instagram className="w-3 h-3 text-pink-400" />
                  <span>Instagram</span>
                </span>
                <strong className="text-white text-xs">{currentUser.instagram ? `@${currentUser.instagram.replace('@', '')}` : 'Belum diisi'}</strong>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>Tim / Squad Utama</span>
                </span>
                <strong className="text-amber-400 text-xs">{currentUser.teamName || 'Belum terafiliasi squad'}</strong>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Tanggal Bergabung</span>
                </span>
                <strong className="text-slate-300 text-xs">
                  {currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Anggota Hunters'}
                </strong>
              </div>
            </div>
          </div>

          {/* PREVIEW 2 RIWAYAT TURNAMEN TERBARU */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Riwayat Turnamen Terbaru</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveProfileTab('riwayat-turnamen')}
                className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Lihat Semua ({totalTournaments})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playerParticipations.slice(0, 2).map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-amber-500/40 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        item.game === 'FF' ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40' : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                      }`}>
                        {item.game === 'FF' ? '🔥 Free Fire' : '⚔️ MLBB'}
                      </span>
                      {item.slotNumber && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Slot #{item.slotNumber}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Sah' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">{item.tournamentTitle}</h4>
                  
                  <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-2 rounded-xl">
                    <span>Squad: <strong className="text-amber-300">{item.teamName}</strong></span>
                    <span className="text-[11px] text-purple-300">{item.roleInTeam}</span>
                  </div>

                  {item.notes && (
                    <div className="text-[10px] text-cyan-300 font-mono bg-cyan-950/30 p-1.5 rounded-lg border border-cyan-500/20">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 TAB 2: RIWAYAT PARTISIPASI TURNAMEN LENGKAP (FF & MLBB) */}
      {/* ========================================================================= */}
      {activeProfileTab === 'riwayat-turnamen' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setHistoryGameFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  historyGameFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Game ({totalTournaments})
              </button>
              <button
                type="button"
                onClick={() => setHistoryGameFilter('FF')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  historyGameFilter === 'FF'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Free Fire ({ffTournaments})</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryGameFilter('MLBB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  historyGameFilter === 'MLBB'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-blue-400" />
                <span>Mobile Legends ({mlbbTournaments})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Cari turnamen / squad..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Riwayat Turnamen List */}
          {filteredHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-white uppercase">Tidak Ditemukan Riwayat Turnamen</h4>
                <p className="text-xs text-slate-400">Tidak ada turnamen yang cocok dengan filter atau kata kunci pencarian Anda.</p>
              </div>
              {onOpenRegisterModal && (
                <button
                  type="button"
                  onClick={() => onOpenRegisterModal('FF')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Daftarkan Squad Anda Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-purple-500/40 transition-all relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${
                          item.game === 'FF' 
                            ? 'bg-orange-600/20 text-orange-400 border border-orange-500/40' 
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                        }`}>
                          {item.game === 'FF' ? <Flame className="w-3 h-3" /> : <Swords className="w-3 h-3" />}
                          <span>{item.game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'}</span>
                        </span>
                        {item.slotNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-mono font-bold border border-slate-800">
                            Slot #{item.slotNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">{item.tournamentTitle}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                      item.status === 'Sah' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : item.status === 'Menunggu Pembayaran'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-red-950 text-red-300 border border-red-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Detail Squad & Posisi */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Nama Squad / Tim:</span>
                      <strong className="text-amber-300 font-bold">{item.teamName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Posisi Pemain:</span>
                      <span className="text-purple-300 font-bold text-xs">{item.roleInTeam || 'Roster'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tanggal Match / Daftar:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{item.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Pencapaian / Prestasi:</span>
                      <strong className="text-emerald-400 font-bold">{item.achievement || 'Partisipan'}</strong>
                    </div>
                  </div>

                  {/* Catatan Room / Password */}
                  {item.notes && (
                    <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-2.5 text-xs text-purple-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono text-[11px]">{item.notes}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.notes || '', 'Info Room')}
                        className="p-1 rounded bg-purple-900/40 hover:bg-purple-800/60 text-amber-300 cursor-pointer"
                        title="Salin Info Room"
                      >
                        {copiedText === 'Info Room' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {/* Tombol Aksi Turnamen */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectInfoMatchSubTab) onSelectInfoMatchSubTab('jadwal');
                        setActiveTab('info-match');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Lihat Jadwal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectInfoMatchSubTab) onSelectInfoMatchSubTab('bracket');
                        setActiveTab('info-match');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Bagan Babak</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ TAB 3: FORM PENGATURAN PROFIL, UPLOAD FOTO & NICKNAME */}
      {/* ========================================================================= */}
      {activeProfileTab === 'pengaturan' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-slate-900 border border-purple-900/60 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Pengaturan Profil Pemain & Game ID</span>
              </h3>
              <p className="text-xs text-slate-400 pt-1">
                Atur nama panggilan, foto avatar, dan identitas game Free Fire serta MLBB Anda agar otomatis tersinkronisasi di seluruh turnamen.
              </p>
            </div>

            {/* SEKSI 1: UPLOAD FOTO PROFIL & PILIH AVATAR */}
            <div className="space-y-4 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <label className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>1. Foto Profil Pemain (Avatar)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Current Avatar Preview */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 p-0.5 shrink-0 shadow-lg">
                  <img
                    src={editAvatarUrl}
                    alt="Preview Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[14px] bg-slate-950"
                  />
                </div>

                <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPickerModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-amber-300 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Pilih Avatar Esport Siap Pakai
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Atau unggah foto pribadi Anda langsung dari HP / Laptop di bawah ini:
                  </p>
                </div>
              </div>

              {/* Upload Field Component */}
              <MediaUploadField
                value={editAvatarUrl}
                onChange={(val) => setEditAvatarUrl(val)}
                label="Unggah Foto dari Perangkat:"
                description="Pilih foto JPG, PNG, atau WEBP dari galeri perangkat Anda."
                mediaType="image"
                maxSizeMB={10}
              />
            </div>

            {/* SEKSI 2: NAMA PANGGILAN & IDENTITAS UTAMA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nama Lengkap / Akun: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nama Panggilan (Nickname / In-Game Name): <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="Contoh: HunterZ, KingPro, Shadow"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nomor WhatsApp Aktif:
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Role / Posisi Andalan:
                </label>
                <select
                  value={editPrimaryRole}
                  onChange={(e) => setEditPrimaryRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-300 focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                >
                  <option value="👑 Kapten & IGL">👑 Kapten & IGL (In-Game Leader)</option>
                  <option value="⚡ Rusher / Flanker">⚡ Rusher / Flanker (Free Fire)</option>
                  <option value="🎯 Sniper / Support">🎯 Sniper / Support (Free Fire)</option>
                  <option value="⚔️ Jungler / Hyper">⚔️ Jungler / Hyper (MLBB)</option>
                  <option value="🛡️ Roamer / Tank">🛡️ Roamer / Tank (MLBB)</option>
                  <option value="🔮 Midlaner / Mage">🔮 Midlaner / Mage (MLBB)</option>
                  <option value="🏹 Goldlaner / Marksman">🏹 Goldlaner / Marksman (MLBB)</option>
                  <option value="🛡️ EXP Laner / Fighter">🛡️ EXP Laner / Fighter (MLBB)</option>
                  <option value="All Role / Flex Player">🎮 All Role / Flex Player</option>
                </select>
              </div>
            </div>

            {/* SEKSI 3: BIO & SOSIAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bio / Slogan Pemain:
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ceritakan motto atau squad Anda..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Kota / Domisili:
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Contoh: Jakarta, Surabaya, Bandung"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Instagram Username (Opsional):
                  </label>
                  <input
                    type="text"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-pink-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 4: DATA GAME FREE FIRE */}
            <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-orange-400 uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>Identitas Game Free Fire</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">UID Free Fire:</label>
                  <input
                    type="text"
                    value={editFfId}
                    onChange={(e) => setEditFfId(e.target.value)}
                    placeholder="Contoh: 129039120"
                    className="w-full bg-slate-950 border border-orange-900/40 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">In-Game Nickname FF:</label>
                  <input
                    type="text"
                    value={editFfNickname}
                    onChange={(e) => setEditFfNickname(e.target.value)}
                    placeholder="Contoh: HC・HunterZ"
                    className="w-full bg-slate-950 border border-orange-900/40 rounded-xl p-2 text-xs text-amber-300 focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 5: DATA GAME MOBILE LEGENDS */}
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-blue-400 uppercase flex items-center gap-1.5">
                <Swords className="w-4 h-4" />
                <span>Identitas Game Mobile Legends</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">User ID MLBB:</label>
                  <input
                    type="text"
                    value={editMlbbId}
                    onChange={(e) => setEditMlbbId(e.target.value)}
                    placeholder="Contoh: 29849201"
                    className="w-full bg-slate-950 border border-blue-900/40 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Zone / Server ID:</label>
                  <input
                    type="text"
                    value={editMlbbServerId}
                    onChange={(e) => setEditMlbbServerId(e.target.value)}
                    placeholder="Contoh: 2041"
                    className="w-full bg-slate-950 border border-blue-900/40 rounded-xl p-2 text-xs text-cyan-300 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Nickname MLBB:</label>
                  <input
                    type="text"
                    value={editMlbbNickname}
                    onChange={(e) => setEditMlbbNickname(e.target.value)}
                    placeholder="Contoh: DEXZ・Mage"
                    className="w-full bg-slate-950 border border-blue-900/40 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActiveProfileTab('ringkasan');
                }}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 🪪 TAB 4: KARTU IDENTITAS DIGITAL PEMAIN (DIGITAL ESPORT ID CARD) */}
      {/* ========================================================================= */}
      {activeProfileTab === 'id-card' && (
        <div className="space-y-6">
          <div className="text-center space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              KARTU IDENTITAS RESMI ATLET ESPORT
            </h3>
            <p className="text-xs text-slate-400">
              Kartu ID resmi Hunters Community DEXZ STORE untuk verifikasi kapten squad & peserta turnamen.
            </p>
          </div>

          {/* THE DIGITAL ID CARD BADGE */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-slate-950 via-[#10051e] to-slate-950 border-2 border-purple-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white space-y-5">
            {/* Hologram Gradient Lines */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Card Header */}
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#070210] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400 text-xs">
                    HC
                  </div>
                </div>
                <div>
                  <span className="font-black text-xs text-white uppercase tracking-wider block">HUNTERS COMMUNITY</span>
                  <span className="text-[9px] text-amber-400 font-bold">OFFICIAL PLAYER PASS</span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase">
                  VERIFIED PLAYER
                </span>
              </div>
            </div>

            {/* Avatar & Player Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-400 p-0.5 shrink-0 shadow-lg">
                <img
                  src={currentUser.avatarUrl || PRESET_AVATARS[0].url}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[14px] bg-slate-950"
                />
              </div>

              <div className="space-y-1 overflow-hidden">
                <h4 className="text-base font-black text-white truncate">{currentUser.name}</h4>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-purple-600/30 text-amber-300 text-xs font-black">
                    [{userNickname}]
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID #{currentUser.phone ? currentUser.phone.slice(-4) : '7789'}
                  </span>
                </div>
                <p className="text-[11px] text-purple-300 font-bold truncate">
                  {currentUser.primaryRole || 'Esport Athlete'}
                </p>
              </div>
            </div>

            {/* Game Stats & IDs */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-semibold">Free Fire UID:</span>
                <span className="text-orange-400 font-mono font-bold">{currentUser.ffId || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-semibold">MLBB User ID:</span>
                <span className="text-blue-400 font-mono font-bold">
                  {currentUser.mlbbId ? `${currentUser.mlbbId} (${currentUser.mlbbServerId || 'Zone'})` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400 font-semibold">Turnamen Diikuti:</span>
                <span className="text-amber-400 font-bold">{totalTournaments} Turnamen</span>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <span>HUNTERS COMMUNITY × DEXZ STORE</span>
              <span className="font-mono">VALID PERMANENT</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleCopy(`HUNTERS COMMUNITY PLAYER CARD:\nNama: ${currentUser.name}\nNickname: ${userNickname}\nFF UID: ${currentUser.ffId || '-'}\nMLBB ID: ${currentUser.mlbbId || '-'}\nTurnamen Diikuti: ${totalTournaments}`, 'Data Kartu ID')}
              className="flex-1 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText === 'Data Kartu ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText === 'Data Kartu ID' ? 'Tersalin!' : 'Salin Data ID Card'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProfileTab('pengaturan');
                setIsEditing(true);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Ganti Info / Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖼️ MODAL PILIH AVATAR ESPORT PRESET */}
      {/* ========================================================================= */}
      {showAvatarPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-900/60 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Pilih Avatar Esport Siap Pakai</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarPickerModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_AVATARS.map((av) => (
                <div
                  key={av.id}
                  onClick={() => {
                    setEditAvatarUrl(av.url);
                    setShowAvatarPickerModal(false);
                  }}
                  className={`p-2.5 rounded-2xl bg-slate-950 border cursor-pointer transition-all hover:scale-105 text-center space-y-2 ${
                    editAvatarUrl === av.url ? 'border-amber-400 shadow-md shadow-amber-950/60' : 'border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-slate-900">
                    <img src={av.url} alt={av.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <strong className="text-xs text-white block">{av.name}</strong>
                    <span className="text-[9px] text-slate-400 font-bold">{av.game}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarPickerModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
