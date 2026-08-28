import React, { useState, useEffect } from 'react';
import { 
  AppNotification, 
  UserAccount, 
  TabType 
} from '../types';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Calendar, 
  RefreshCw, 
  Wallet, 
  Clock, 
  Trophy, 
  DollarSign, 
  Megaphone,
  Volume2,
  VolumeX,
  CheckCheck,
  ShieldAlert
} from 'lucide-react';
import { requestBrowserNotificationPermission } from '../utils/deviceDetector';
import { markNotificationReadInFirestore } from '../lib/firebaseStore';

interface NotificationCenterProps {
  notifications: AppNotification[];
  currentUser: UserAccount | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onSelectInfoMatchSubTab?: (subTab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  currentUser,
  activeTab,
  setActiveTab,
  onSelectInfoMatchSubTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MINE' | 'ADMIN'>('ALL');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Get stable reader identifier for marking read
  const readerId = currentUser?.phone || currentUser?.email || localStorage.getItem('hunters_device_id') || 'guest';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Request browser permission automatically on initial load if user is Admin
  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.isSuperAdmin) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        requestBrowserNotificationPermission().then(setPermissionStatus);
      }
    }
  }, [currentUser]);

  // Filter notifications based on targetRole, user phone, and team name
  const filteredNotifs = notifications.filter((n) => {
    // If filter is ADMIN, show only admin alerts
    if (filterCategory === 'ADMIN') {
      return n.category === 'ADMIN_ALERT';
    }

    // Role filtering
    if (n.targetRole === 'admin') {
      return currentUser?.role === 'admin' || currentUser?.isSuperAdmin;
    }

    if (n.targetRole === 'all') {
      return true;
    }

    if (n.targetRole === 'user') {
      // If notification has targetPhone or targetTeamName
      if (currentUser) {
        if (n.targetPhone && currentUser.phone) {
          const cleanTarget = n.targetPhone.replace(/[^0-9]/g, '');
          const cleanUser = currentUser.phone.replace(/[^0-9]/g, '');
          if (cleanTarget === cleanUser) return true;
        }
        if (n.targetTeamName && currentUser.teamName) {
          if (n.targetTeamName.toLowerCase() === currentUser.teamName.toLowerCase()) return true;
        }
      }
      // If user is guest/not matching, show if target is not restricted or matches filter MINE
      if (filterCategory === 'MINE') {
        return true;
      }
      return true;
    }

    return true;
  });

  // Calculate unread count
  const unreadNotifs = filteredNotifs.filter(
    (n) => !n.readBy || !n.readBy.includes(readerId)
  );
  const unreadCount = unreadNotifs.length;

  const handleNotificationClick = async (notif: AppNotification) => {
    // Mark as read in Firestore
    if (!notif.readBy || !notif.readBy.includes(readerId)) {
      await markNotificationReadInFirestore(notif.id, notif.readBy || [], readerId);
    }

    setIsOpen(false);

    // Navigate to action tab
    if (notif.actionTab) {
      if (notif.actionTab === 'info-match' && onSelectInfoMatchSubTab && notif.data?.subTab) {
        onSelectInfoMatchSubTab(notif.data.subTab);
      }
      setActiveTab(notif.actionTab);
    }
  };

  const handleMarkAllAsRead = async () => {
    for (const notif of unreadNotifs) {
      await markNotificationReadInFirestore(notif.id, notif.readBy || [], readerId);
    }
  };

  const handleRequestPermission = async () => {
    const status = await requestBrowserNotificationPermission();
    setPermissionStatus(status);
  };

  // Icon mapping per category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ADMIN_ALERT':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-5 h-5 text-amber-400" />;
      case 'MATCH_STARTING':
        return <Flame className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'CONFIRMATION_RESULT':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'SCHEDULE_CHANGED':
        return <Calendar className="w-5 h-5 text-cyan-400" />;
      case 'SCHEDULE_SWAP_REQUEST':
        return <RefreshCw className="w-5 h-5 text-purple-400" />;
      case 'BALANCE_ADDED':
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case 'REGISTRATION_CLOSING':
        return <Clock className="w-5 h-5 text-yellow-400 animate-bounce" />;
      case 'MATCH_RESULT':
        return <Trophy className="w-5 h-5 text-amber-300" />;
      case 'BET_RESULT':
        return <DollarSign className="w-5 h-5 text-emerald-300" />;
      default:
        return <Bell className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <>
      {/* FLOATING BROWSER NOTIFICATION REQUEST BANNER (IF NOT GRANTED) */}
      {permissionStatus === 'default' && (
        <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-orange-950 border-b border-orange-500/50 py-2 px-4 shadow-xl text-white text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-orange-500 text-slate-950 font-black animate-pulse">
                🔔 NOTIFIKASI HP OTOMATIS
              </span>
              <p className="text-[11px] text-neutral-200">
                Aktifkan izin notifikasi di HP Anda agar selalu mendapatkan info pendaftaran, pengumuman, jadwal match 30m, saldo & hasil taruhan!
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Aktifkan Notifikasi HP (1-Klik)</span>
            </button>
          </div>
        </div>
      )}

      {/* FIXED BELL TRIGGER BUTTON FOR HEADER */}
      <div className="relative inline-flex items-center shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-8.5 h-8.5 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center shrink-0 ${
            unreadCount > 0
              ? 'bg-orange-500/20 border-orange-500/80 text-orange-400 hover:bg-orange-500/30 ring-1 ring-orange-500/40 shadow-sm'
              : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
          }`}
          title="Buka Pusat Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-red-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-[#070210] shadow-md animate-pulse leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* SLIDE-OUT NOTIFICATION CENTER DRAWER PANEL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-[#0c0c0c] border-l border-neutral-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* DRAWER HEADER */}
            <div className="p-4 bg-[#050505] border-b border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    PUSAT NOTIFIKASI HP
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-orange-500 text-slate-950 font-black text-[10px] rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-neutral-400">Server Terpusat • Update Otomatis Realtime</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 text-xs text-neutral-400 hover:text-orange-400 bg-neutral-900 border border-neutral-800 rounded-lg cursor-pointer flex items-center gap-1 font-mono"
                    title="Tandai Semua Sudah Dibaca"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Dibaca</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* NOTIFICATION FILTER TABS */}
            <div className="px-4 py-2 bg-[#080808] border-b border-neutral-800 flex items-center justify-between gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterCategory === 'ALL'
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Semua ({notifications.length})
              </button>

              {(currentUser?.role === 'admin' || currentUser?.isSuperAdmin) && (
                <button
                  type="button"
                  onClick={() => setFilterCategory('ADMIN')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterCategory === 'ADMIN'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-neutral-900 text-red-400 hover:bg-red-950/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin ({notifications.filter(n => n.category === 'ADMIN_ALERT').length})</span>
                </button>
              )}

              {permissionStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-amber-500/30"
                >
                  🔔 Izin HP
                </button>
              )}
            </div>

            {/* NOTIFICATIONS LIST CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredNotifs.length === 0 ? (
                <div className="py-16 text-center space-y-3 text-neutral-500">
                  <Bell className="w-12 h-12 mx-auto text-neutral-700" />
                  <p className="text-xs font-bold uppercase tracking-wider">Belum Ada Notifikasi Terbaru</p>
                  <p className="text-[11px] text-neutral-600 max-w-xs mx-auto">
                    Notifikasi pendaftaran, hasil konfirmasi, pengumuman, jadwal match & saldo akan muncul di sini secara otomatis.
                  </p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const isRead = notif.readBy && notif.readBy.includes(readerId);
                  const formattedTime = new Date(notif.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        !isRead
                          ? 'bg-[#14100c] border-orange-500/60 shadow-lg ring-1 ring-orange-500/30'
                          : 'bg-[#080808] border-neutral-800 hover:border-neutral-700 opacity-80'
                      }`}
                    >
                      {!isRead && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-500" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-[#050505] border border-neutral-800 shrink-0 group-hover:scale-105 transition-transform">
                          {getCategoryIcon(notif.category)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-black text-xs text-white truncate leading-snug">
                              {notif.title}
                            </h4>
                            <span className="text-[9px] font-mono text-neutral-500 shrink-0">
                              {formattedTime}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-3">
                            {notif.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                            <span className="text-orange-400 font-bold group-hover:underline">
                              👉 Buka Detail Halaman
                            </span>

                            {!isRead ? (
                              <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                                BARU
                              </span>
                            ) : (
                              <span className="text-neutral-600">Dibaca</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DRAWER FOOTER */}
            <div className="p-3 bg-[#050505] border-t border-neutral-800 text-center text-[10px] font-mono text-neutral-500">
              ⚡ HUNTERS COMMUNITY NOTIFICATION SYSTEM • SERVER PUSAT
            </div>
          </div>
        </div>
      )}
    </>
  );
};
