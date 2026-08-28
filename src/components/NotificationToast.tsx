import React, { useEffect, useState } from 'react';
import { AnnouncementItem, UserAccount } from '../types';
import { Megaphone, X, Phone, Bell, CheckCircle2, ShieldAlert, Smartphone, Monitor } from 'lucide-react';
import { playNotificationSound, requestBrowserNotificationPermission } from '../utils/deviceDetector';

interface NotificationToastProps {
  announcement: AnnouncementItem | null;
  onClose: () => void;
  onViewAll: () => void;
  currentUser: UserAccount | null;
  adminWa?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  announcement,
  onClose,
  onViewAll,
  currentUser,
  adminWa = '6283148834663',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (announcement) {
      setIsVisible(true);
      playNotificationSound();

      // Send browser native notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`📢 ${announcement.title}`, {
            body: announcement.content.length > 120 ? announcement.content.substring(0, 120) + '...' : announcement.content,
            icon: '/favicon.ico',
            tag: announcement.id,
          });
        } catch (e) {
          console.log('Native push failed', e);
        }
      }
    }
  }, [announcement]);

  if (!announcement || !isVisible) return null;

  const isTargetForMe = () => {
    if (!announcement.targetAudience || announcement.targetAudience === 'Semua Kapten & Member') return true;
    if (!currentUser) return true; // show general to all
    if (announcement.targetCaptainPhone && currentUser.phone) {
      const cleanTarget = announcement.targetCaptainPhone.replace(/[^0-9]/g, '');
      const cleanUser = currentUser.phone.replace(/[^0-9]/g, '');
      if (cleanTarget === cleanUser) return true;
    }
    if (announcement.targetTeamName && currentUser.teamName) {
      if (announcement.targetTeamName.toLowerCase() === currentUser.teamName.toLowerCase()) return true;
    }
    return true;
  };

  const cleanAdminWa = adminWa.replace(/[^0-9]/g, '');
  const isUrgent = announcement.isImportant || announcement.category === 'Info Penting';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md relative overflow-hidden ${
        isUrgent
          ? 'bg-[#180a0a]/95 border-red-500/80 ring-4 ring-red-500/30'
          : 'bg-[#0f0f0f]/95 border-amber-500/80 ring-4 ring-amber-500/20'
      }`}>
        {/* TOP GLOW DECORATION */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isUrgent ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500'}`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
              isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                  isUrgent ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isUrgent ? '🚨 URGENT / INFO PENTING' : '🔔 NOTIFIKASI PENGUMUMAN BARU'}
                </span>

                {announcement.targetCaptainName && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    🎯 Khusus Kapten: {announcement.targetCaptainName}
                  </span>
                )}
              </div>

              <h4 className="font-black text-sm text-white mt-1 leading-snug">{announcement.title}</h4>
              <span className="text-[10px] text-neutral-400 font-mono block">Diterbitkan: {announcement.date}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800 transition-all cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT SUMMARY */}
        <div className="mt-3 p-3 bg-[#050505] border border-neutral-800/80 rounded-xl text-xs text-neutral-200 leading-relaxed font-sans max-h-36 overflow-y-auto no-scrollbar">
          {announcement.content}
        </div>

        {/* DEVICE TARGETING BADGE */}
        <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terkirim ke Perangkat Perangkat Kapten ({announcement.targetAudience || 'Semua Tim'})</span>
          </div>

          {permissionStatus !== 'granted' && (
            <button
              type="button"
              onClick={async () => {
                const res = await requestBrowserNotificationPermission();
                setPermissionStatus(res);
              }}
              className="text-[10px] text-amber-400 underline hover:text-amber-300 font-bold cursor-pointer"
            >
              🔔 Aktifkan Notif Web
            </button>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onViewAll();
            }}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            📋 Buka Papan Pengumuman
          </button>

          {cleanAdminWa && (
            <a
              href={`https://wa.me/${cleanAdminWa}?text=Halo%20Admin%20HUNTERS%20COMMUNITY%2C%20saya%20menerima%20notifikasi%20pengumuman%20"${encodeURIComponent(announcement.title)}"%20di%20perangkat%20saya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tanya WA</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
