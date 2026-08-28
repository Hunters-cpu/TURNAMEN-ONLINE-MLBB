import React, { useState } from 'react';
import { 
  Home, 
  Trophy, 
  Calendar, 
  GitMerge, 
  Megaphone, 
  Image, 
  Users, 
  Flame, 
  Swords, 
  Sparkles, 
  UserCheck, 
  Coins, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  History, 
  Target, 
  Heart, 
  ShieldCheck, 
  User, 
  Lightbulb, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  X, 
  LogIn, 
  Sparkle,
  Layers,
  CheckCircle2,
  ExternalLink,
  Shield,
  Music,
  AlertTriangle
} from 'lucide-react';
import { TabType, UserAccount } from '../../types';
import { USER_CATEGORIZED_MENUS, UserMenuCategory, UserMenuItem } from '../../data/categorizedMenus';

interface UserCategorizedMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onSelectInfoMatchSubTab?: (subTab: string) => void;
  currentUser?: UserAccount | null;
  onOpenRegisterModal?: (game?: 'FF' | 'MLBB') => void;
}

export const UserCategorizedMenuDrawer: React.FC<UserCategorizedMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onSelectInfoMatchSubTab,
  currentUser,
  onOpenRegisterModal
}) => {
  // Accordion state: which categories are expanded. By default, Category 1 & 2 are open or single-mode
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'cat-user-1': true,
    'cat-user-2': false,
    'cat-user-3': false,
    'cat-user-4': false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [singleOpenMode, setSingleOpenMode] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

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

  const handleMenuItemClick = (item: UserMenuItem) => {
    if (item.action === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }

    if (item.action === 'register-ff' && onOpenRegisterModal) {
      onOpenRegisterModal('FF');
      onClose();
      return;
    }

    if (item.action === 'register-mlbb' && onOpenRegisterModal) {
      onOpenRegisterModal('MLBB');
      onClose();
      return;
    }

    if (item.subTab && onSelectInfoMatchSubTab) {
      onSelectInfoMatchSubTab(item.subTab);
    }

    setActiveTab(item.tab);
    onClose();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hunters_community_user');
      window.location.reload();
    }
  };

  // Helper to render icon by name
  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case 'Home': return <Home className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'GitMerge': return <GitMerge className={className} />;
      case 'Megaphone': return <Megaphone className={className} />;
      case 'Image': return <Image className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Swords': return <Swords className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Coins': return <Coins className={className} />;
      case 'Wallet': return <Wallet className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'ArrowUpRight': return <ArrowUpRight className={className} />;
      case 'History': return <History className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'User': return <User className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'HelpCircle': return <HelpCircle className={className} />;
      case 'Music': return <Music className={className} />;
      case 'Settings': return <Settings className={className} />;
      case 'LogOut': return <LogOut className={className} />;
      default: return <Sparkle className={className} />;
    }
  };

  // Filter categories and menu items by search query
  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = USER_CATEGORIZED_MENUS.map(category => {
    const matchingItems = category.items.filter(item => 
      !query || 
      item.title.toLowerCase().includes(query) || 
      item.subtitle.toLowerCase().includes(query) ||
      (item.badge && item.badge.toLowerCase().includes(query))
    );
    return {
      ...category,
      items: matchingItems,
      hasMatches: matchingItems.length > 0
    };
  }).filter(cat => !query || cat.hasMatches);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0f] border-t-2 border-amber-500/60 rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAWER TOP BAR / HEADER */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-purple-700 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg">
                HC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white tracking-tight">MENU UTAMA TERSUSUN</h2>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/30">
                    4 KATEGORI
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">Rapi • Bisa Buka/Tutup • Muat 1 Layar</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center border border-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search & Accordion Mode Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Cari menu (contoh: jadwal, saldo, turnamen)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setSingleOpenMode(!singleOpenMode)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors shrink-0 flex items-center gap-1.5 ${
                singleOpenMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
              title="Saat aktif: Hanya 1 kategori terbuka sekaligus"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{singleOpenMode ? '1 Kategori Aktif' : 'Buka Bebas'}</span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE CATEGORIES LIST */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
          {/* USER ACCOUNT BADGE / ADMIN QUICK LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${currentUser ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                  {currentUser ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {currentUser ? (currentUser.nickname || currentUser.name) : 'Tamu / Pengunjung'}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {currentUser ? `Status: ${currentUser.role === 'admin' ? 'ADMIN' : 'PEMAIN'}` : 'Belum Masuk Akun'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab(currentUser ? 'profil' : 'login');
                  onClose();
                }}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
              >
                {currentUser ? 'Profil' : 'Masuk'}
              </button>
            </div>

            {currentUser && (currentUser.role === 'admin' || currentUser.isSuperAdmin) && (
              <div className="p-3 bg-gradient-to-r from-red-950/80 via-neutral-900 to-purple-950/80 border border-red-500/40 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600 text-white font-black shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">PANEL PUSAT ADMIN</p>
                    <p className="text-[10px] text-red-300">7 Kategori &amp; 40+ Fitur Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Buka Admin
                </button>
              </div>
            )}
          </div>

          {/* 4 ACCORDION CATEGORIES */}
          {filteredCategories.map((category) => {
            const isExpanded = query ? true : !!expandedCats[category.id];

            return (
              <div 
                key={category.id}
                className="border border-neutral-800/90 rounded-2xl overflow-hidden bg-[#0d0d14]/90 transition-all duration-200"
              >
                {/* CATEGORY ACCORDION HEADER (CLICK TO OPEN/CLOSE) */}
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
                          {category.items.length} Menu
                        </span>
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
                      isExpanded ? 'rotate-180 text-amber-400 bg-neutral-800' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* CATEGORY CONTENT / MENU ITEMS */}
                {isExpanded && (
                  <div className="p-2 sm:p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#08080c] animate-in fade-in slide-in-from-top-1 duration-200">
                    {category.items.map((item) => {
                      const isActive = activeTab === item.tab;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMenuItemClick(item)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 group ${
                            isActive
                              ? `${category.themeColor.badgeBg} ${category.themeColor.border} shadow-md`
                              : `bg-neutral-900/60 hover:bg-neutral-850 border-neutral-800/80 hover:${category.themeColor.border}`
                          }`}
                        >
                          <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                            isActive 
                              ? `${category.themeColor.iconBg} ${category.themeColor.border} ${category.themeColor.iconText}` 
                              : `bg-neutral-800/80 border-neutral-700/60 text-neutral-400 group-hover:${category.themeColor.iconText} group-hover:${category.themeColor.border}`
                          }`}>
                            {renderIcon(item.iconName, "w-4 h-4")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-xs font-black truncate ${
                                isActive ? category.themeColor.iconText : `text-white group-hover:${category.themeColor.iconText} transition-colors`
                              }`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded shrink-0 border ${
                                  isActive ? `${category.themeColor.badgeBg} ${category.themeColor.badgeText} ${category.themeColor.border}` : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 group-hover:text-neutral-300">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-2">
              <Search className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs font-bold text-neutral-300">Tidak ada menu yang sesuai dengan "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 bg-neutral-800 text-amber-400 text-xs font-bold rounded-xl border border-neutral-700"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* FOOTER HELPDESK */}
          <div className="pt-2">
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-emerald-400">Pusat Bantuan DEXZ STORE</p>
                <p className="text-[10px] text-neutral-400">Hubungi panitia via WhatsApp resmi (+62 831-4883-4663)</p>
              </div>
              <a
                href="https://wa.me/6283148834663"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors shrink-0"
              >
                Chat WA Admin
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION POPUP MODAL */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0f0a14] border-2 border-red-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Yakin Ingin Keluar?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Sesi akun Anda akan diakhiri dengan aman. Anda dapat masuk kembali kapan saja dengan nomor WhatsApp atau akun terdaftar.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/60 transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
