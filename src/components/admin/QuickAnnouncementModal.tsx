import React, { useState, useEffect } from 'react';
import { X, Megaphone, Calendar, Tag, Save, Trash2, BellRing, Sparkles } from 'lucide-react';
import { AnnouncementItem, SiteConfig } from '../../types';
import { MediaUploadField } from '../common/MediaUploadField';

interface QuickAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: AnnouncementItem | null;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const QuickAnnouncementModal: React.FC<QuickAnnouncementModalProps> = ({
  isOpen,
  onClose,
  announcement,
  siteConfig,
  setSiteConfig
}) => {
  const isEditing = Boolean(announcement && announcement.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Info Penting');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setCategory(announcement.category || 'Info Penting');
      setDate(announcement.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      setContent(announcement.content || '');
      setIsUrgent(announcement.isUrgent || false);
      setMediaUrl(announcement.mediaUrl || '');
    } else {
      setTitle('');
      setCategory('Info Penting');
      setDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      setContent('');
      setIsUrgent(false);
      setMediaUrl('');
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Judul dan isi pengumuman wajib diisi!');
      return;
    }

    const currentList = siteConfig.announcements || [];
    let updatedList: AnnouncementItem[];

    if (isEditing && announcement) {
      updatedList = currentList.map(a => {
        if (a.id === announcement.id) {
          return {
            ...a,
            title: title.trim(),
            category,
            date,
            content: content.trim(),
            isUrgent,
            mediaUrl: mediaUrl.trim() || undefined
          };
        }
        return a;
      });
    } else {
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        category,
        date,
        content: content.trim(),
        isUrgent,
        mediaUrl: mediaUrl.trim() || undefined
      };
      updatedList = [newAnn, ...currentList];
    }

    setSiteConfig({
      ...siteConfig,
      announcements: updatedList,
      urgentAnnouncement: isUrgent ? `${title.trim()} — ${content.trim()}` : siteConfig.urgentAnnouncement
    });

    onClose();
  };

  const handleDelete = () => {
    if (!announcement) return;
    if (confirm(`Yakin ingin menghapus pengumuman "${announcement.title}"?`)) {
      const currentList = siteConfig.announcements || [];
      const updatedList = currentList.filter(a => a.id !== announcement.id);
      setSiteConfig({
        ...siteConfig,
        announcements: updatedList
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-fuchsia-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/30">
                ⚡ EDIT LANGSUNG PENGUMUMAN
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Judul Pengumuman:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pembagian Room ID & Password Match 1 Free Fire"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-fuchsia-400 font-bold"
              required
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Kategori:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400 font-bold"
              >
                <option value="Info Penting">🔴 Info Penting</option>
                <option value="Perubahan Jadwal">🟡 Perubahan Jadwal</option>
                <option value="Pengingat Match">🔵 Pengingat Match</option>
                <option value="Umum">⚪ Umum</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Tanggal Pengumuman:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="20 Agustus 2026"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400 font-mono"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Isi Pengumuman / Pesan:</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan detail pengumuman yang ingin disampaikan ke seluruh peserta..."
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400 leading-relaxed"
              required
            />
          </div>

          {/* Media Attachment (Photo / Video) */}
          <MediaUploadField
            value={mediaUrl}
            onChange={(val) => setMediaUrl(val)}
            label="Upload Foto / Video Lampiran Pengumuman (Opsional):"
            description="Pilih foto infografis, poster, atau video instruksi dari perangkat Anda."
            mediaType="all"
          />

          {/* Urgent checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-900/60 cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 bg-neutral-900 border-neutral-700"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">Tampilkan sebagai Banner Berjalan / Headline Utama</span>
              <span className="text-[11px] text-neutral-400">Pengumuman akan langsung disematkan di halaman beranda.</span>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-900/60">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Hapus</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-fuchsia-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Pengumuman' : 'Siarkan Pengumuman'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
