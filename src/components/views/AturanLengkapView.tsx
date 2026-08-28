import React, { useState } from 'react';
import { BookOpen, ShieldAlert, Flame, Swords, FileCheck, CheckCircle2, Ban, AlertCircle, Plus, Edit3, Trash2 } from 'lucide-react';
import { FF_RULES, MLBB_RULES } from '../../data/initialData';
import { RuleCategory, SiteConfig } from '../../types';
import { QuickRuleModal } from '../admin/QuickRuleModal';

interface AturanLengkapViewProps {
  ffRules?: RuleCategory[];
  mlbbRules?: RuleCategory[];
  isAdmin?: boolean;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const AturanLengkapView: React.FC<AturanLengkapViewProps> = ({
  ffRules = FF_RULES,
  mlbbRules = MLBB_RULES,
  isAdmin = false,
  siteConfig,
  setSiteConfig
}) => {
  const [activeGameTab, setActiveGameTab] = useState<'pendaftaran' | 'ff' | 'mlbb'>('pendaftaran');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRuleGame, setSelectedRuleGame] = useState<'FF' | 'MLBB'>('FF');
  const [selectedRuleCat, setSelectedRuleCat] = useState<RuleCategory | null>(null);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | undefined>(undefined);

  const handleAddNewRule = (game: 'FF' | 'MLBB') => {
    setSelectedRuleGame(game);
    setSelectedRuleCat(null);
    setSelectedRuleIndex(undefined);
    setShowRuleModal(true);
  };

  const handleEditRule = (game: 'FF' | 'MLBB', cat: RuleCategory, index: number) => {
    setSelectedRuleGame(game);
    setSelectedRuleCat(cat);
    setSelectedRuleIndex(index);
    setShowRuleModal(true);
  };

  const handleDeleteRule = (game: 'FF' | 'MLBB', index: number, title: string) => {
    if (!siteConfig || !setSiteConfig) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kategori aturan "${title}"?`)) {
      const isFf = game === 'FF';
      const targetRules = isFf ? [...(siteConfig.ffRules || ffRules)] : [...(siteConfig.mlbbRules || mlbbRules)];
      targetRules.splice(index, 1);
      setSiteConfig({
        ...siteConfig,
        ...(isFf ? { ffRules: targetRules } : { mlbbRules: targetRules })
      });
    }
  };

  const currentFfRules = siteConfig?.ffRules || ffRules;
  const currentMlbbRules = siteConfig?.mlbbRules || mlbbRules;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <BookOpen className="w-4 h-4" />
            <span>REGULASI RESMI HUNTERS COMMUNITY</span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddNewRule(activeGameTab === 'mlbb' ? 'MLBB' : 'FF')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-950 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Aturan {activeGameTab === 'mlbb' ? 'MLBB' : 'FF'}</span>
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
          📜 ATURAN LENGKAP TURNAMEN
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Peraturan umum pendaftaran, teknis Free Fire & Mobile Legends dikelola secara tegas oleh DEXZ STORE. Keputusan panitia mutlak & tidak dapat diganggu gugat.
        </p>
      </div>

      {/* GAME SELECTOR TABS */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-2">
        <button
          onClick={() => setActiveGameTab('pendaftaran')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGameTab === 'pendaftaran'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Aturan Pendaftaran</span>
        </button>

        <button
          onClick={() => setActiveGameTab('ff')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGameTab === 'ff'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>Aturan Free Fire</span>
        </button>

        <button
          onClick={() => setActiveGameTab('mlbb')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGameTab === 'mlbb'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4 text-cyan-200" />
          <span>Aturan MLBB</span>
        </button>
      </div>

      {/* TAB CONTENT 1: ATURAN PENDAFTARAN */}
      {activeGameTab === 'pendaftaran' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-base border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5" />
              <span>ATURAN PENDAFTARAN & SLOT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validitas Data Tim</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Data yang diisikan dalam formulir pendaftaran harus benar, lengkap, dan dapat dipertanggungjawabkan oleh Kapten Tim. Nama tim & nama player tidak boleh mengandung unsur SARA/pornografi.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Pembayaran Sah</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Slot tim hanya dinyatakan SAH dan dikonfirmasi setelah bukti pembayaran diterima dan diverifikasi oleh Admin Official DEXZ STORE (+62 831 4883 4663).
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  <span>Kebijakan Pembatalan & Fund</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  <strong>Tidak ada pengembalian dana (non-refundable)</strong> jika tim membatalkan pendaftaran secara sepihak atau didiskualifikasi akibat pelanggaran aturan.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  <span>Larangan Plagiarisme & Kecurangan</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Dilarang keras menggunakan plagiat nama tim resmi esports profesional tanpa izin, atau mendaftar ganda untuk tujuan memanipulasi bracket/slot.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ATURAN FF */}
      {activeGameTab === 'ff' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl flex items-center justify-between text-xs text-red-300">
            <span className="font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span>REGULASI RESMI FREE FIRE TOURNAMENT</span>
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleAddNewRule('FF')}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori FF</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFfRules.map((cat, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-amber-400 uppercase flex items-center gap-1.5">
                    <span>{cat.icon || '📜'}</span>
                    <span>{cat.title}</span>
                  </h3>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRule('FF', cat, idx)}
                        className="p-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Edit kategori aturan ini"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule('FF', idx, cat.title)}
                        className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Hapus kategori aturan ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {cat.rules.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ATURAN MLBB */}
      {activeGameTab === 'mlbb' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl flex items-center justify-between text-xs text-cyan-300">
            <span className="font-bold flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              <span>REGULASI RESMI MOBILE LEGENDS BANG BANG</span>
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleAddNewRule('MLBB')}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori MLBB</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMlbbRules.map((cat, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-cyan-400 uppercase flex items-center gap-1.5">
                    <span>{cat.icon || '⚔️'}</span>
                    <span>{cat.title}</span>
                  </h3>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRule('MLBB', cat, idx)}
                        className="p-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Edit kategori aturan ini"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule('MLBB', idx, cat.title)}
                        className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Hapus kategori aturan ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {cat.rules.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK RULE MODAL */}
      {siteConfig && setSiteConfig && (
        <QuickRuleModal
          isOpen={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          game={selectedRuleGame}
          ruleCategory={selectedRuleCat}
          categoryIndex={selectedRuleIndex}
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
        />
      )}
    </div>
  );
};
