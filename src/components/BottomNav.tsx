import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Trophy, 
  Flame, 
  Swords, 
  Users, 
  Wallet, 
  MoreHorizontal
} from 'lucide-react';
import { TabType, UserAccount } from '../types';
import { UserCategorizedMenuDrawer } from './navigation/UserCategorizedMenuDrawer';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onSelectInfoMatchSubTab?: (subTab: string) => void;
  currentUser?: UserAccount | null;
  onOpenRegisterModal?: (game?: 'FF' | 'MLBB') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSelectInfoMatchSubTab,
  currentUser,
  onOpenRegisterModal
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 5 Main Tabs matching exact user spec:
  // [1. 🏠 Beranda (#6366f1)] · [2. 🏆 Turnamen (#f59e0b)] · [3. 👥 Tim (#10b981)] · [4. 💰 Saldo (#ef4444)] · [5. ⚙️ Lainnya (#8b5cf6)]
  const getActiveIndex = (): number => {
    if (isMenuOpen) return 4;
    if (activeTab === 'beranda') return 0;
    if (
      activeTab === 'semua-turnamen' ||
      activeTab === 'ff' || 
      activeTab === 'mlbb' || 
      activeTab === 'info-match' || 
      activeTab === 'total-hadiah' || 
      activeTab === 'riwayat' || 
      activeTab === 'arsip' || 
      activeTab === 'form-pendaftaran'
    ) return 1;
    if (activeTab === 'tim' || activeTab === 'cara-daftar' || activeTab === 'aturan' || activeTab === 'status-pembayaran') return 2;
    if (activeTab === 'saldo' || activeTab === 'prediksi' || activeTab === 'donasi' || activeTab === 'topup-game') return 3;
    return 4; // 'lainnya' or other tabs
  };

  const activeIndex = getActiveIndex();

  const handleTabClick = (tab: TabType, subTab?: string) => {
    if (subTab && onSelectInfoMatchSubTab) {
      onSelectInfoMatchSubTab(subTab);
    }
    setActiveTab(tab);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { 
      key: 'beranda', 
      label: 'BERANDA', 
      icon: Home, 
      tab: 'beranda' as TabType,
      color: '#6366f1', // Ungu
      glow: 'rgba(99, 102, 241, 0.65)',
      activeBg: 'from-indigo-600 to-violet-600'
    },
    { 
      key: 'turnamen', 
      label: 'TURNAMEN', 
      icon: Trophy, 
      tab: 'semua-turnamen' as TabType, 
      color: '#f59e0b', // Oranye
      glow: 'rgba(245, 158, 11, 0.65)',
      activeBg: 'from-amber-500 to-orange-600'
    },
    { 
      key: 'tim', 
      label: 'TIM', 
      icon: Users, 
      tab: 'tim' as TabType,
      color: '#10b981', // Hijau
      glow: 'rgba(16, 185, 129, 0.65)',
      activeBg: 'from-emerald-500 to-teal-600'
    },
    { 
      key: 'saldo', 
      label: 'SALDO', 
      icon: Wallet, 
      tab: 'saldo' as TabType,
      color: '#ef4444', // Merah
      glow: 'rgba(239, 68, 68, 0.65)',
      activeBg: 'from-red-500 to-rose-600'
    },
    { 
      key: 'lainnya', 
      label: 'LAINNYA', 
      icon: MoreHorizontal, 
      isDrawer: true,
      color: '#8b5cf6', // Ungu Tua
      glow: 'rgba(139, 92, 246, 0.65)',
      activeBg: 'from-purple-600 to-violet-700'
    },
  ];

  const currentActiveItem = navItems[activeIndex] || navItems[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* 4 CATEGORIES USER MENU DRAWER OVERLAY (COLLAPSIBLE ACCORDION) */}
      {/* ========================================================================= */}
      <UserCategorizedMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectInfoMatchSubTab={onSelectInfoMatchSubTab}
        currentUser={currentUser}
        onOpenRegisterModal={onOpenRegisterModal}
      />

      {/* ========================================================================= */}
      {/* 🌊 NAVIGASI BAWAH CAIR (LIQUID FLUID BOTTOM NAVIGATION) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Navigasi Utama"
        className="fixed bottom-0 left-0 right-0 z-40 pb-4 px-3 pointer-events-none"
      >
        <div className="w-[92%] max-w-md sm:max-w-lg mx-auto relative pointer-events-auto">
          
          {/* LIQUID FLOATING CIRCULAR INDICATOR WITH DYNAMIC MENU COLOR & SPRING (0.4s) */}
          <motion.div
            className="absolute -top-6 z-30 w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#07080f] pointer-events-none shadow-2xl"
            style={{
              backgroundColor: currentActiveItem.color,
              boxShadow: `0 10px 28px ${currentActiveItem.glow}`,
            }}
            initial={false}
            animate={{
              left: `calc(${activeIndex * 20}% + 10% - 28px)`,
              scale: 1.1,
              y: -4,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 26,
              mass: 0.75,
            }}
          >
            {/* Active Crisp Icon inside Floating Circle */}
            {activeIndex === 0 && <Home className="w-6 h-6 text-white stroke-[2.5]" />}
            {activeIndex === 1 && <Trophy className="w-6 h-6 text-white stroke-[2.5]" />}
            {activeIndex === 2 && <Users className="w-6 h-6 text-white stroke-[2.5]" />}
            {activeIndex === 3 && <Wallet className="w-6 h-6 text-white stroke-[2.5]" />}
            {activeIndex === 4 && <MoreHorizontal className="w-6 h-6 text-white stroke-[2.5]" />}
          </motion.div>

          {/* LIQUID CUTOUT NOTCH CONTOUR (Moves synchronously) */}
          <motion.div
            className="absolute -top-3.5 z-10 w-20 h-5 pointer-events-none flex justify-center"
            initial={false}
            animate={{
              left: `calc(${activeIndex * 20}% + 10% - 40px)`,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 26,
              mass: 0.75,
            }}
          >
            {/* Smooth SVG dip cutout for liquid fluid curvature */}
            <svg viewBox="0 0 80 20" className="w-20 h-5 fill-[#07080f]">
              <path d="M0,20 Q20,20 25,6 Q32,-2 40,-2 Q48,-2 55,6 Q60,20 80,20 Z" />
            </svg>
          </motion.div>

          {/* MAIN DARK ELEGANT CONTAINER (Curved 26px, 75px height, No horizontal scroll) */}
          <div 
            className="bg-[#07080f]/95 backdrop-blur-2xl border border-neutral-800/80 rounded-[26px] h-[75px] px-2 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] flex items-center justify-around relative transition-colors duration-400"
            style={{
              borderColor: `${currentActiveItem.color}35`
            }}
          >
            {navItems.map((item, idx) => {
              const isActive = activeIndex === idx;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.isDrawer) {
                      setIsMenuOpen(!isMenuOpen);
                    } else if (item.tab) {
                      handleTabClick(item.tab);
                    }
                  }}
                  className="flex-1 h-full flex flex-col items-center justify-center relative z-20 cursor-pointer select-none group transition-all duration-300 active:scale-95"
                >
                  {/* ICON (Subtly hidden when active indicator is directly above) */}
                  <div className={`transition-all duration-300 flex items-center justify-center h-5 ${
                    isActive ? 'opacity-0 scale-50 -translate-y-2' : 'opacity-70 text-neutral-400 group-hover:opacity-100 group-hover:text-white'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* LABEL (Animated color, font weight, and glow) */}
                  <span 
                    className={`text-[10px] tracking-wider transition-all duration-300 uppercase ${
                      isActive 
                        ? 'font-black scale-105 mt-4 drop-shadow-[0_1px_6px_currentColor]' 
                        : 'font-semibold text-neutral-400 group-hover:text-neutral-200 mt-1'
                    }`}
                    style={{
                      color: isActive ? item.color : undefined
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

          </div>
        </div>
      </nav>
    </>
  );
};
