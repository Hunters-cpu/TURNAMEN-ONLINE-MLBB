import React from 'react';
import { Settings, Clock, Calendar, Shield, Phone, Mail, QrCode, Globe, Edit3, Lock, Sparkles, Music } from 'lucide-react';
import { SiteConfig, TabType } from '../../types';
import { UserBackgroundMusicSettings } from '../user/UserBackgroundMusicSettings';

interface PengaturanUmumViewProps {
  siteConfig: SiteConfig;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const PengaturanUmumView: React.FC<PengaturanUmumViewProps> = ({
  siteConfig,
  setActiveTab,
  isAdmin = false,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* USER BACKGROUND MUSIC SECTION */}
      <UserBackgroundMusicSettings siteConfig={siteConfig} />

      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 p-6 sm:p-8 border border-neutral-700 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-bold">
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span className="uppercase tracking-wider">INFORMASI & KONFIGURASI SISTEM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span>⚙️ PENGATURAN UMUM TURNAMEN</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Informasi batas waktu pendaftaran, jam mulai match, slot maksimum, biaya pendaftaran, dan metode pembayaran resmi.
          </p>
        </div>
      </div>

      {/* GENERAL CONFIG DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FREE FIRE SETTINGS */}
        <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Pengaturan Turnamen Free Fire</span>
            </h3>
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              {siteConfig.ffInfo.status}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Batas Waktu Daftar:</span>
              <span className="font-extrabold text-amber-400">{siteConfig.ffInfo.deadline}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Jam Mulai Match:</span>
              <span className="font-extrabold text-white">19:30 WIB (Setiap Malam Match)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Maksimum Slot:</span>
              <span className="font-bold text-white">{siteConfig.ffInfo.maxSlots} Tim</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Biaya Slot:</span>
              <span className="font-bold text-emerald-400">{siteConfig.ffInfo.fee}</span>
            </div>
          </div>
        </div>

        {/* MOBILE LEGENDS SETTINGS */}
        <div className="bg-[#0f0f0f] border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-black text-white text-sm uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Pengaturan Turnamen Mobile Legends</span>
            </h3>
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              {siteConfig.mlbbInfo.status}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Batas Waktu Daftar:</span>
              <span className="font-extrabold text-amber-400">{siteConfig.mlbbInfo.deadline}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Jam Mulai Match:</span>
              <span className="font-extrabold text-white">19:30 WIB (Setiap Malam Match)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400">Maksimum Slot:</span>
              <span className="font-bold text-white">{siteConfig.mlbbInfo.maxSlots} Tim</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Biaya Slot:</span>
              <span className="font-bold text-emerald-400">{siteConfig.mlbbInfo.fee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM BROADCAST & ORGANIZER INFO */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-white text-sm uppercase border-b border-neutral-800 pb-2">
          Informasi Kontak & Penyelenggara DEXZ STORE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Admin WhatsApp</span>
            <span className="font-extrabold text-emerald-400">{siteConfig.adminWa}</span>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Official Email</span>
            <span className="font-extrabold text-white">{siteConfig.officialEmail}</span>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-xl">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">QRIS NMID</span>
            <span className="font-extrabold text-amber-400">{siteConfig.qrisNmid}</span>
          </div>
        </div>
      </div>

      {/* ADMIN EDIT NOTICE */}
      {isAdmin ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <span className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mode Admin Aktif: Anda dapat mengubah jam mulai, deadline, status turnamen, & running ticker di Admin.</span>
          </span>
          <button
            onClick={() => setActiveTab('admin')}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px]"
          >
            Ubah Pengaturan
          </button>
        </div>
      ) : (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-neutral-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-neutral-500" />
          <span>Hanya Admin terverifikasi yang dapat mengubah parameter pengaturan umum ini.</span>
        </div>
      )}
    </div>
  );
};
