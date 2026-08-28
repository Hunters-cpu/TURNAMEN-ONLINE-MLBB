import React, { useState, useEffect } from 'react';
import { X, BookOpen, Flame, Swords, Save, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { RuleCategory, SiteConfig } from '../../types';

interface QuickRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: 'FF' | 'MLBB';
  ruleCategory?: RuleCategory | null;
  categoryIndex?: number;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const QuickRuleModal: React.FC<QuickRuleModalProps> = ({
  isOpen,
  onClose,
  game,
  ruleCategory,
  categoryIndex,
  siteConfig,
  setSiteConfig
}) => {
  const isEditing = categoryIndex !== undefined && categoryIndex >= 0;

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📜');
  const [rulesText, setRulesText] = useState('');

  useEffect(() => {
    if (ruleCategory) {
      setTitle(ruleCategory.title || '');
      setIcon(ruleCategory.icon || '📜');
      setRulesText(ruleCategory.rules ? ruleCategory.rules.join('\n') : '');
    } else {
      setTitle('');
      setIcon('📜');
      setRulesText('');
    }
  }, [ruleCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul kategori aturan wajib diisi!');
      return;
    }

    const rulesArray = rulesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const isFf = game === 'FF';
    const targetRules = isFf ? [...(siteConfig.ffRules || [])] : [...(siteConfig.mlbbRules || [])];

    const newCat: RuleCategory = {
      title: title.trim(),
      icon: icon.trim() || '📜',
      rules: rulesArray.length > 0 ? rulesArray : ['Poin peraturan resmi wajib ditaati.']
    };

    if (isEditing && categoryIndex !== undefined) {
      targetRules[categoryIndex] = newCat;
    } else {
      targetRules.push(newCat);
    }

    setSiteConfig({
      ...siteConfig,
      ...(isFf ? { ffRules: targetRules } : { mlbbRules: targetRules })
    });
    onClose();
  };

  const handleDelete = () => {
    if (!isEditing || categoryIndex === undefined) return;
    if (confirm(`Yakin ingin menghapus kategori aturan "${title}"?`)) {
      const isFf = game === 'FF';
      const targetRules = isFf ? [...(siteConfig.ffRules || [])] : [...(siteConfig.mlbbRules || [])];
      targetRules.splice(categoryIndex, 1);
      setSiteConfig({
        ...siteConfig,
        ...(isFf ? { ffRules: targetRules } : { mlbbRules: targetRules })
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-purple-500/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                ⚡ EDIT LANGSUNG ATURAN {game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isEditing ? `Edit Kategori: ${title}` : `Tambah Kategori Aturan ${game}`}
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
          {/* Title & Icon */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Ikon Emoji:</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📜"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3 py-2 text-center text-base text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="col-span-3 space-y-1">
              <label className="text-xs font-bold text-neutral-300">Nama / Judul Kategori Aturan:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: FORMAT MATCH & SISTEM POIN"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-bold"
                required
              />
            </div>
          </div>

          {/* Rules List (Multi-line) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">
              Daftar Butir Poin Peraturan (Satu baris per poin aturan):
            </label>
            <textarea
              rows={6}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              placeholder="Poin 1: Wajib hadir 10 menit sebelum jam tanding&#10;Poin 2: Dilarang menggunakan cheat/script&#10;Poin 3: Keputusan wasit mutlak"
              className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 leading-relaxed font-sans"
              required
            />
          </div>

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
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Aturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
