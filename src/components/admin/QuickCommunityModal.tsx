import React, { useState, useEffect } from 'react';
import { X, MessageSquareCode, Save, Trash2, Plus, Users, Flame, Swords } from 'lucide-react';
import { CommunityGroup, SiteConfig } from '../../types';

interface QuickCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  groupToEdit?: CommunityGroup | null;
  groupIndex?: number;
}

export const QuickCommunityModal: React.FC<QuickCommunityModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig,
  groupToEdit,
  groupIndex
}) => {
  const isEditing = groupIndex !== undefined && groupIndex >= 0;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState<'FF' | 'MLBB' | 'Umum'>('FF');
  const [link, setLink] = useState('');
  const [memberCount, setMemberCount] = useState('250+');

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name || '');
      setDescription(groupToEdit.description || '');
      setGame(groupToEdit.game || 'FF');
      setLink(groupToEdit.link || '');
      setMemberCount(groupToEdit.memberCount || '250+');
    } else {
      setName('');
      setDescription('');
      setGame('FF');
      setLink('');
      setMemberCount('250+');
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) {
      alert('Nama grup dan link WhatsApp wajib diisi!');
      return;
    }

    const currentGroups = siteConfig.communityGroups ? [...siteConfig.communityGroups] : [];

    const newGroup: CommunityGroup = {
      id: groupToEdit?.id || `group-${Date.now()}`,
      title: name.trim(),
      name: name.trim(),
      description: description.trim() || 'Grup koordinasi resmi turnamen Hunters Community x DEXZ STORE',
      game,
      link: link.trim(),
      iconColor: game === 'FF' ? '#ef4444' : game === 'MLBB' ? '#06b6d4' : '#10b981',
      memberCount: memberCount.trim() || '250+'
    };

    if (isEditing && groupIndex !== undefined) {
      currentGroups[groupIndex] = newGroup;
    } else {
      currentGroups.push(newGroup);
    }

    setSiteConfig({
      ...siteConfig,
      communityGroups: currentGroups
    });

    onClose();
  };

  const handleDelete = () => {
    if (!isEditing || groupIndex === undefined) return;
    if (confirm(`Hapus grup WhatsApp "${name}"?`)) {
      const currentGroups = siteConfig.communityGroups ? [...siteConfig.communityGroups] : [];
      currentGroups.splice(groupIndex, 1);
      setSiteConfig({
        ...siteConfig,
        communityGroups: currentGroups
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ⚡ EDIT LANGSUNG GRUP WHATSAPP
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? `Edit Grup: ${name}` : 'Tambah Grup Komunitas Baru'}
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
          {/* Group Name & Game */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nama Grup WA:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: GRUP TURNAMEN FF S9"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Kategori Game:</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value as any)}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
              >
                <option value="FF">Free Fire</option>
                <option value="MLBB">MLBB</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Link URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Tautan Undangan WhatsApp (chat.whatsapp.com):</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/LSwfHMPmbbNIOsBUzNYwi4"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          {/* Member Count & Description */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Estimasi Member:</label>
              <input
                type="text"
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                placeholder="250+"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-neutral-300">Deskripsi / Peruntukan:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Grup Khusus Kapten & Peserta Turnamen"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-purple-900/60">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Grup</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Grup WA'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
