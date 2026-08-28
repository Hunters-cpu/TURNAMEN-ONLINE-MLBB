import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  Calendar, 
  CreditCard, 
  Target, 
  Globe, 
  Settings, 
  LayoutDashboard, 
  Megaphone, 
  TrendingUp, 
  Flame, 
  Swords, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Shuffle, 
  GitMerge, 
  Edit3, 
  UserCheck, 
  Image, 
  QrCode, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  History, 
  FileSpreadsheet, 
  Clock, 
  Coins, 
  Link, 
  FileText, 
  Shield, 
  Music, 
  Palette, 
  Archive, 
  Scale, 
  Lightbulb, 
  Key, 
  Sliders, 
  Activity, 
  ChevronDown, 
  Layers, 
  X,
  Sparkle,
  Filter,
  Grid,
  Send,
  Lock,
  Award,
  Smartphone,
  RefreshCw,
  Bell,
  Trash2,
  Trophy,
  HelpCircle,
  ExternalLink,
  LayoutTemplate,
  Share2,
  Save,
  ShieldAlert,
  Database,
  FileClock,
  Cpu
} from 'lucide-react';
import { ADMIN_CATEGORIZED_MENUS, AdminMenuCategory, AdminMenuItem } from '../../data/categorizedMenus';
import { ADMIN_MENUS_40, getMenuColorStyle } from '../../data/menuList';
import { RegisteredTeam, UserWallet, MatchPredictionBet } from '../../types';

interface AdminCategorizedMenuNavProps {
  activeAdminTab: string | null;
  setActiveAdminTab: (tab: any) => void;
  registeredTeams?: RegisteredTeam[];
  userWallet?: UserWallet;
  bets?: MatchPredictionBet[];
  onSelectSubAction?: (subAction: string, filter?: any) => void;
}

export const AdminCategorizedMenuNav: React.FC<AdminCategorizedMenuNavProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  registeredTeams = [],
  userWallet,
  bets = [],
  onSelectSubAction
}) => {
  // Navigation view modes: 'grid40' (40 Menu Panel Admin) or 'categorized' (7 Kategori)
  const [viewMode, setViewMode] = useState<'grid40' | 'categorized'>('grid40');

  // Filter category in 40-grid view
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Accordion state for categorized view
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'cat-admin-1': true,
    'cat-admin-2': true,
    'cat-admin-3': true,
    'cat-admin-4': true,
    'cat-admin-5': true,
    'cat-admin-6': true,
    'cat-admin-7': true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [singleOpenMode, setSingleOpenMode] = useState(false);

  // Live badge counts
  const pendingFfCount = registeredTeams.filter(t => t.game === 'FF' && t.status === 'Menunggu Pembayaran').length;
  const pendingMlbbCount = registeredTeams.filter(t => t.game === 'MLBB' && t.status === 'Menunggu Pembayaran').length;
  const totalPendingTeams = pendingFfCount + pendingMlbbCount;

  const pendingTopUpCount = (userWallet?.topUpHistory || []).filter(t => t.status === 'Pending').length;
  const pendingWithdrawalCount = (userWallet?.withdrawalHistory || []).filter(w => w.status === 'Pending').length;
  const totalPendingFinance = pendingTopUpCount + pendingWithdrawalCount;

  const pendingBetsCount = (bets || []).filter(b => b.status === 'pending' || b.status === 'waiting_verification').length;

  const toggleCategory = (catId: string) => {
    if (singleOpenMode) {
      setExpandedCats(prev => ({
        [catId]: !prev[catId]
      }));
    } else {
      setExpandedCats(prev => ({
        ...prev,
        [catId]: !prev[catId]
      }));
    }
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    ADMIN_CATEGORIZED_MENUS.forEach(c => { all[c.id] = true; });
    setExpandedCats(all);
  };

  const collapseAll = () => {
    setExpandedCats({});
  };

  const handleOpenTab = (adminTab: string, subAction?: string, filterParam?: any) => {
    if (subAction && onSelectSubAction) {
      onSelectSubAction(subAction, filterParam);
    }
    setActiveAdminTab(adminTab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to render icon by name
  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case 'BarChart2': return <BarChart2 className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Settings': return <Settings className={className} />;
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'Megaphone': return <Megaphone className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Swords': return <Swords className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'XCircle': return <XCircle className={className} />;
      case 'Search': return <Search className={className} />;
      case 'Shuffle': return <Shuffle className={className} />;
      case 'GitMerge': return <GitMerge className={className} />;
      case 'Edit3': return <Edit3 className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Image': return <Image className={className} />;
      case 'QrCode': return <QrCode className={className} />;
      case 'ArrowDownLeft': return <ArrowDownLeft className={className} />;
      case 'ArrowUpRight': return <ArrowUpRight className={className} />;
      case 'Wallet': return <Wallet className={className} />;
      case 'History': return <History className={className} />;
      case 'FileSpreadsheet': return <FileSpreadsheet className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Coins': return <Coins className={className} />;
      case 'Link': return <Link className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Music': return <Music className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Archive': return <Archive className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'Key': return <Key className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Send': return <Send className={className} />;
      case 'Lock': return <Lock className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'RefreshCw': return <RefreshCw className={className} />;
      case 'Bell': return <Bell className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'LayoutTemplate': return <LayoutTemplate className={className} />;
      case 'Share2': return <Share2 className={className} />;
      case 'Save': return <Save className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Database': return <Database className={className} />;
      case 'FileClock': return <FileClock className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      default: return <Sparkle className={className} />;
    }
  };

  // Helper to map menu ID to appropriate icon name
  const getIconForAdminMenu = (id: number): string => {
    switch (id) {
      case 1: return 'LayoutDashboard';
      case 2: return 'Users';
      case 3: return 'Calendar';
      case 4: return 'Megaphone';
      case 5: return 'UserCheck';
      case 6: return 'ArrowDownLeft';
      case 7: return 'ArrowUpRight';
      case 8: return 'Scale';
      case 9: return 'QrCode';
      case 10: return 'Sliders';
      case 11: return 'Archive';
      case 12: return 'Sparkles';
      case 13: return 'Send';
      case 14: return 'Coins';
      case 15: return 'Key';
      case 16: return 'FileText';
      case 17: return 'Image';
      case 18: return 'Link';
      case 19: return 'TrendingUp';
      case 20: return 'FileSpreadsheet';
      case 21: return 'Clock';
      case 22: return 'Shield';
      case 23: return 'Edit3';
      case 24: return 'History';
      case 25: return 'Target';
      case 26: return 'Activity';
      case 27: return 'Trophy';
      case 28: return 'Megaphone';
      case 29: return 'CreditCard';
      case 30: return 'Smartphone';
      case 31: return 'Archive';
      case 32: return 'RefreshCw';
      case 33: return 'Sparkles';
      case 34: return 'LayoutDashboard';
      case 35: return 'Lightbulb';
      case 36: return 'Bell';
      case 37: return 'Award';
      case 38: return 'Trash2';
      case 39: return 'Lock';
      case 40: return 'Sparkle';
      default: return 'Sparkle';
    }
  };

  // Helper to map menu ID to category tag
  const getCategoryTagForMenu = (id: number): string => {
    if ([1, 4, 19, 28, 34].includes(id)) return 'Utama';
    if ([2, 18, 20, 23, 27].includes(id)) return 'Tim';
    if ([3, 8, 16, 21, 25, 31, 37].includes(id)) return 'Match';
    if ([6, 7, 9, 14, 26, 29].includes(id)) return 'Keuangan';
    if ([5, 13, 15, 22, 39].includes(id)) return 'Pengguna';
    if ([12, 33, 36, 40].includes(id)) return 'Bot & AI';
    return 'Sistem';
  };

  const getCategoryTagBadgeStyle = (categoryTag: string) => {
    switch (categoryTag) {
      case 'Utama':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/70';
      case 'Tim':
        return 'bg-orange-950/80 text-orange-300 border-orange-600/70';
      case 'Match':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/70';
      case 'Keuangan':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70';
      case 'Pengguna':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-600/70';
      case 'Bot & AI':
        return 'bg-lime-950/80 text-lime-300 border-lime-600/70';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-600/70';
    }
  };

  // Live badge for individual 40-menu item
  const getMenuBadge = (id: number) => {
    switch (id) {
      case 2:
        if (totalPendingTeams > 0) {
          return (
            <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {totalPendingTeams} Pending
            </span>
          );
        }
        return <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-800/60">Tim Sah</span>;
      case 6:
        if (pendingTopUpCount > 0) {
          return (
            <span className="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {pendingTopUpCount} TopUp
            </span>
          );
        }
        return <span className="text-[9px] bg-teal-950 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-800/60">Top Up</span>;
      case 7:
        if (pendingWithdrawalCount > 0) {
          return (
            <span className="text-[9px] bg-amber-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {pendingWithdrawalCount} WD
            </span>
          );
        }
        return <span className="text-[9px] bg-orange-950 text-orange-300 font-bold px-1.5 py-0.5 rounded border border-orange-800/60">Tarik</span>;
      case 9:
        return <span className="text-[9px] bg-indigo-950 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-800/60">6 QRIS</span>;
      case 14:
        return <span className="text-[9px] bg-yellow-950 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-yellow-800/60">Saweria</span>;
      case 40:
        return <span className="text-[9px] bg-fuchsia-950 text-pink-300 font-bold px-1.5 py-0.5 rounded border border-pink-800/60">AI Text</span>;
      default:
        return null;
    }
  };

  // Helper for category live badge
  const getCategoryLiveBadge = (catId: string) => {
    switch (catId) {
      case 'cat-admin-2':
        if (totalPendingTeams > 0) {
          return (
            <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {totalPendingTeams} Tim Pending
            </span>
          );
        }
        break;
      case 'cat-admin-4':
        if (totalPendingFinance > 0) {
          return (
            <span className="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {totalPendingFinance} Transaksi
            </span>
          );
        }
        break;
      case 'cat-admin-5':
        if (pendingBetsCount > 0) {
          return (
            <span className="text-[9px] bg-amber-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {pendingBetsCount} Bet Baru
            </span>
          );
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Filter 40 menus
  const query = searchQuery.trim().toLowerCase();
  const filtered40Menus = ADMIN_MENUS_40.filter(m => {
    const matchesQuery = !query || 
      m.title.toLowerCase().includes(query) || 
      m.description.toLowerCase().includes(query) ||
      m.id.toString() === query ||
      m.adminTab.toLowerCase().includes(query);

    const categoryTag = getCategoryTagForMenu(m.id);
    const matchesCategory = selectedCategoryFilter === 'ALL' || categoryTag === selectedCategoryFilter;

    return matchesQuery && matchesCategory;
  });

  // Filter categorized menus
  const filteredCategories = ADMIN_CATEGORIZED_MENUS.map(category => {
    const matchingItems = category.items.filter(item => 
      !query || 
      item.title.toLowerCase().includes(query) || 
      item.subtitle.toLowerCase().includes(query) ||
      (item.subItems && item.subItems.some(s => s.toLowerCase().includes(query)))
    );
    return {
      ...category,
      items: matchingItems,
      hasMatches: matchingItems.length > 0
    };
  }).filter(cat => !query || cat.hasMatches);

  const categoryFilterTabs = [
    { key: 'ALL', label: '🌟 Semua (40 Menu)' },
    { key: 'Utama', label: '🏠 Utama' },
    { key: 'Tim', label: '👥 Tim & Peserta' },
    { key: 'Match', label: '⚔️ Pertandingan' },
    { key: 'Keuangan', label: '💰 Keuangan & QRIS' },
    { key: 'Pengguna', label: '👤 Pengguna' },
    { key: 'Bot & AI', label: '🤖 Bot & AI' },
    { key: 'Sistem', label: '⚙️ Sistem & Audit' },
  ];

  return (
    <div className="bg-[#0a0a0f] border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* HEADER & VIEW MODE SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Grid className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>40 MENU PANEL ADMIN (DEXZ STORE)</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-black px-2 py-0.5 rounded border border-red-500/40 uppercase">
                  LENGKAP #1 S/D #40
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Setiap menu independen &amp; memiliki halaman fungsi tersendiri • Klik untuk membuka
              </p>
            </div>
          </div>
        </div>

        {/* VIEW MODE TABS */}
        <div className="flex items-center gap-2 bg-[#050505] p-1.5 rounded-2xl border border-neutral-800 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid40')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'grid40'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/80'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>🔥 40 Menu Lengkap</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('categorized')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'categorized'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/80'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📂 7 Kategori</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR & CATEGORY QUICK FILTERS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input 
            type="text"
            placeholder="Cari dari 40 menu admin (contoh: QRIS, saldo, jadwal, pengguna, bot, sengketa, nomor #1-#40)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CATEGORY FILTER PILLS (FOR 40-GRID VIEW) */}
        {viewMode === 'grid40' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {categoryFilterTabs.map(tab => {
              const isSelected = selectedCategoryFilter === tab.key;
              const activeColorClass = 
                tab.key === 'Utama' ? 'bg-purple-600/30 text-purple-300 border-purple-500/70 shadow-sm shadow-purple-950' :
                tab.key === 'Tim' ? 'bg-orange-600/30 text-orange-300 border-orange-500/70 shadow-sm shadow-orange-950' :
                tab.key === 'Match' ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/70 shadow-sm shadow-cyan-950' :
                tab.key === 'Keuangan' ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/70 shadow-sm shadow-emerald-950' :
                tab.key === 'Pengguna' ? 'bg-yellow-600/30 text-yellow-300 border-yellow-500/70 shadow-sm shadow-yellow-950' :
                tab.key === 'Bot & AI' ? 'bg-lime-600/30 text-lime-300 border-lime-500/70 shadow-sm shadow-lime-950' :
                tab.key === 'Sistem' ? 'bg-rose-600/30 text-rose-300 border-rose-500/70 shadow-sm shadow-rose-950' :
                'bg-red-600/30 text-red-300 border-red-500/70 shadow-sm shadow-red-950';

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] cursor-pointer border ${
                    isSelected
                      ? activeColorClass
                      : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: 🔥 40 MENU PANEL ADMIN (DEXZ STORE) GRID LENGKAP */}
      {/* ========================================================================= */}
      {viewMode === 'grid40' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Menampilkan <strong className="text-white">{filtered40Menus.length}</strong> dari 40 Menu Panel Admin</span>
            {selectedCategoryFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className="text-red-400 hover:underline text-[11px]"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered40Menus.map((menu) => {
              const isTabActive = activeAdminTab === menu.adminTab;
              const colorStyle = getMenuColorStyle(menu.id);
              const iconName = getIconForAdminMenu(menu.id);
              const categoryTag = getCategoryTagForMenu(menu.id);
              const badgeElement = getMenuBadge(menu.id);
              const tagBadgeStyle = getCategoryTagBadgeStyle(categoryTag);

              return (
                <div
                  key={menu.id}
                  onClick={() => handleOpenTab(menu.adminTab)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 group cursor-pointer relative overflow-hidden active:scale-[0.98] select-none ${
                    isTabActive
                      ? `${colorStyle.bg} ${colorStyle.border} shadow-xl ${colorStyle.glow} ring-2 ring-white/30`
                      : `bg-[#0d0d16]/95 hover:bg-[#131422] ${colorStyle.border}/50 ${colorStyle.hoverBorder} hover:shadow-lg hover:${colorStyle.glow}`
                  }`}
                >
                  {/* TOP ROW: NUMBER BADGE, ICON, CATEGORY & LIVE BADGES */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border font-mono ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text} shadow-sm group-hover:scale-105 transition-transform`}>
                        #{menu.id}
                      </div>
                      <div className={`p-1.5 rounded-lg border shrink-0 ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`}>
                        {renderIcon(iconName, "w-4 h-4")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {badgeElement}
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${tagBadgeStyle}`}>
                        {categoryTag}
                      </span>
                    </div>
                  </div>

                  {/* TITLE & DESCRIPTION */}
                  <div className="space-y-1">
                    <h3 className={`text-xs font-black uppercase tracking-tight line-clamp-1 transition-colors flex items-center justify-between gap-1.5 ${
                      isTabActive ? colorStyle.text : `text-white group-hover:${colorStyle.text}`
                    }`}>
                      <span className="truncate">{menu.title}</span>
                      <span className={`text-neutral-500 group-hover:${colorStyle.text} group-hover:translate-x-0.5 transition-all text-xs font-mono shrink-0`}>→</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>

                  {/* BOTTOM INFO ROW: TAB ID & STATUS */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[10px]">
                    <span className="text-neutral-500 font-mono">
                      tab: {menu.adminTab}
                    </span>
                    <span className={`font-black uppercase text-[10px] flex items-center gap-1 ${
                      isTabActive ? colorStyle.text : `text-neutral-400 group-hover:${colorStyle.text}`
                    }`}>
                      <span>{isTabActive ? '● Sedang Dibuka' : 'Klik Buka'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered40Menus.length === 0 && (
            <div className="p-8 text-center bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-2">
              <Search className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-bold text-neutral-300">Tidak ada menu yang sesuai pencarian "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('ALL'); }}
                className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Tampilkan Semua 40 Menu
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 📂 7 KATEGORI MENU (ACCORDION VIEW) */}
      {/* ========================================================================= */}
      {viewMode === 'categorized' && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-neutral-400">Tampilan 7 Kategori Terkelompok</span>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg text-[10px] font-bold"
              >
                Buka Semua
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg text-[10px] font-bold"
              >
                Tutup Semua
              </button>
              <button
                onClick={() => setSingleOpenMode(!singleOpenMode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  singleOpenMode 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                {singleOpenMode ? 'Mode 1 Kategori' : 'Multi Kategori'}
              </button>
            </div>
          </div>

          {filteredCategories.map((category, catIndex) => {
            const isExpanded = query ? true : !!expandedCats[category.id];
            const liveBadge = getCategoryLiveBadge(category.id);

            return (
              <div 
                key={category.id}
                className="border border-neutral-800/90 rounded-2xl overflow-hidden bg-[#0d0d14]/90 transition-all"
              >
                {/* CATEGORY ACCORDION HEADER */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors text-left cursor-pointer select-none ${
                    isExpanded 
                      ? 'bg-neutral-850 border-b border-neutral-800' 
                      : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${category.themeColor.iconBg} ${category.themeColor.border} ${category.themeColor.iconText} shadow-sm shrink-0`}>
                      {renderIcon(category.iconName, "w-4 h-4")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-neutral-500 uppercase">
                          KATEGORI {category.categoryNumber}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded border ${category.themeColor.badgeBg} ${category.themeColor.badgeText} ${category.themeColor.border}`}>
                          {category.badge}
                        </span>
                        {liveBadge}
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                        {category.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-neutral-500 hidden xs:inline">
                      {isExpanded ? 'Tutup' : 'Buka'}
                    </span>
                    <div className={`w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-red-400 bg-neutral-800' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* CATEGORY MENU ITEMS */}
                {isExpanded && (
                  <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-[#08080c] animate-in fade-in slide-in-from-top-1 duration-200">
                    {category.items.map((item, itemIdx) => {
                      const isTabActive = activeAdminTab === item.adminTab;
                      const itemColorStyle = getMenuColorStyle((catIndex * 6) + itemIdx + 1);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenTab(item.adminTab, item.subAction, item.filterParam)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer active:scale-[0.98] select-none ${
                            isTabActive
                              ? `${itemColorStyle.bg} ${itemColorStyle.border} shadow-lg ${itemColorStyle.glow} ring-1 ring-white/30`
                              : `bg-neutral-900/80 hover:bg-neutral-850 ${itemColorStyle.border}/40 ${itemColorStyle.hoverBorder}`
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                              isTabActive 
                                ? `${itemColorStyle.bg} ${itemColorStyle.border} ${itemColorStyle.text}` 
                                : `${itemColorStyle.bg} ${itemColorStyle.border} ${itemColorStyle.text} group-hover:scale-105`
                            }`}>
                              {renderIcon(item.iconName, "w-4 h-4")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className={`text-xs font-black truncate flex items-center justify-between gap-1 w-full ${
                                  isTabActive ? itemColorStyle.text : `text-white group-hover:${itemColorStyle.text} transition-colors`
                                }`}>
                                  <span className="truncate">{item.title}</span>
                                  <span className="text-neutral-500 group-hover:text-white transition-colors text-xs shrink-0">→</span>
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* SUB-ITEMS / 6 QRIS PREVIEWS IF ANY */}
                          {item.subItems && (
                            <div className="p-2 bg-neutral-950/90 rounded-lg border border-neutral-800 space-y-1">
                              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
                                6 Opsi QRIS Terpisah:
                              </p>
                              <div className="grid grid-cols-1 gap-0.5 text-[9px] text-neutral-300">
                                {item.subItems.map((sub, idx) => (
                                  <div key={idx} className="flex items-center gap-1 truncate">
                                    <span className="text-neutral-500">•</span>
                                    <span className="truncate">{sub}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/60 text-[10px]">
                            {item.badge && (
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${itemColorStyle.bg} ${itemColorStyle.text} ${itemColorStyle.border}`}>
                                {item.badge}
                              </span>
                            )}
                            <span className={`ml-auto font-black uppercase text-[10px] ${
                              isTabActive ? itemColorStyle.text : `text-neutral-400 group-hover:${itemColorStyle.text}`
                            }`}>
                              {isTabActive ? '● Sedang Dibuka' : 'Buka'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
