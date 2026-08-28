import React from 'react';
import { HelpCircle, BookOpen, CheckCircle2, MessageSquare, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { HelpItem, SiteConfig, TabType } from '../../types';

interface BantuanViewProps {
  siteConfig: SiteConfig;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const BantuanView: React.FC<BantuanViewProps> = ({
  siteConfig,
  setActiveTab,
  isAdmin = false,
}) => {
  const helpItems: HelpItem[] = siteConfig.helpConfig || [
    {
      id: 'help-1',
      title: '1. Bagaimana Cara Mendaftar Turnamen?',
      content: 'Pilih menu "Formulir Pendaftaran" atau tombol "Daftar Tim", pilih game (Free Fire / Mobile Legends), isi nama tim, nama kapten, nomor WhatsApp aktif, dan daftar roster pemain. Tekan Kirim Pendaftaran.'
    },
    {
      id: 'help-2',
      title: '2. Ke Mana Harus Melakukan Pembayaran Biaya Slot?',
      content: 'Pembayaran dapat dilakukan melalui Scan QRIS Semua E-Wallet/Bank atau Transfer BCA / E-Wallet yang tertera di halaman pendaftaran & menu Pembayaran.'
    },
    {
      id: 'help-3',
      title: '3. Bagaimana Cara Mengetahui Status Pembayaran & Slot Tim?',
      content: 'Buka menu "Status Pembayaran" atau "Tim & Slot". Cari nama tim Anda. Jika berstatus "SAH", berarti slot tim Anda telah terkunci 100%.'
    },
    {
      id: 'help-4',
      title: '4. Di Mana Melihat Room ID & Password Match?',
      content: 'Room ID & Password akan dibagikan di menu "Info Pertandingan & Jadwal" serta di Broadcast Grup WhatsApp Resmi paling lambat 15 menit sebelum match.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-neutral-900 to-indigo-950 p-6 sm:p-8 border border-blue-500/30 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span className="uppercase tracking-wider">PANDUAN & BANTUAN ANGGOTA BARU</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400 shrink-0" />
            <span>❓ BANTUAN & CARA PAKAI</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Penjelasan singkat, petunjuk langkah demi langkah, dan jawaban pertanyaan umum (FAQ) bagi peserta atau anggota baru turnamen Hunters Community.
          </p>
        </div>
      </div>

      {/* HELP ITEMS ACCORDION / LIST */}
      <div className="space-y-3">
        {helpItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 space-y-2 shadow-lg hover:border-blue-500/40 transition-all"
          >
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{item.title}</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed pl-6">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* CONTACT CS ADMIN BOX */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
            <span>🤖 Masih Butuh Bantuan Pertanyaan Lain?</span>
          </h4>
          <p className="text-xs text-neutral-300">
            Tanya AI CS Admin DEXZ STORE — Dijawab Otomatis &amp; Instan tanpa menunggu balasan!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('kontak')}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya AI CS Admin</span>
          </button>

          <a
            href={`https://wa.me/${siteConfig.adminWaClean}?text=${encodeURIComponent('Halo Admin DEXZ STORE, saya butuh bantuan info turnamen.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center justify-center gap-2 border border-neutral-700 uppercase tracking-wider shrink-0"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Admin</span>
          </a>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <span className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mode Admin: Anda dapat mengedit item bantuan & FAQ ini di Admin Panel.</span>
          </span>
          <button
            onClick={() => setActiveTab('admin')}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl uppercase tracking-wider text-[11px]"
          >
            Kelola Bantuan
          </button>
        </div>
      )}
    </div>
  );
};
