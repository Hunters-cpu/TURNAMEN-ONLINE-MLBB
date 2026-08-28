import React, { useState } from 'react';
import { MessageSquareCode, Flame, Swords, Users, ExternalLink, ShieldCheck, Copy, Check, Plus, Edit3, Trash2 } from 'lucide-react';
import { COMMUNITY_GROUPS, ADMIN_WA } from '../../data/initialData';
import { CommunityGroup, SiteConfig } from '../../types';
import { QuickCommunityModal } from '../admin/QuickCommunityModal';

interface GrupKomunitasViewProps {
  communityGroups?: CommunityGroup[];
  isAdmin?: boolean;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const GrupKomunitasView: React.FC<GrupKomunitasViewProps> = ({
  communityGroups = COMMUNITY_GROUPS,
  isAdmin = false,
  siteConfig,
  setSiteConfig
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

  const displayGroups = siteConfig?.communityGroups || communityGroups;

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNew = () => {
    setSelectedGroup(null);
    setSelectedIndex(undefined);
    setShowModal(true);
  };

  const handleEdit = (group: CommunityGroup, idx: number) => {
    setSelectedGroup(group);
    setSelectedIndex(idx);
    setShowModal(true);
  };

  const handleDelete = (idx: number, name: string) => {
    if (!siteConfig || !setSiteConfig) return;
    if (confirm(`Hapus grup WhatsApp "${name}"?`)) {
      const current = siteConfig.communityGroups ? [...siteConfig.communityGroups] : [...communityGroups];
      current.splice(idx, 1);
      setSiteConfig({
        ...siteConfig,
        communityGroups: current
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border border-green-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold">
            <MessageSquareCode className="w-4 h-4" />
            <span>PORTAL WHATSAPP RESMI</span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleAddNew}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Grup WhatsApp Baru</span>
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
          🔗 GRUP KOMUNITAS WHATSAPP
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Silakan bergabung ke grup WhatsApp resmi sesuai game yang kamu ikuti untuk mendapatkan update Room ID, Password, dan pengumuman jadwal dari Admin DEXZ STORE.
        </p>
      </div>

      {/* DYNAMIC LIST OF COMMUNITY GROUPS */}
      <div className="space-y-4">
        {displayGroups.map((group, idx) => {
          const isFf = group.game === 'FF';
          const isMlbb = group.game === 'MLBB';
          const borderColor = isFf ? 'border-red-500/40 hover:border-red-500/70' : isMlbb ? 'border-cyan-500/40 hover:border-cyan-500/70' : 'border-emerald-500/40 hover:border-emerald-500/70';
          const badgeColor = isFf ? 'bg-red-500/10 text-red-400 border-red-500/30' : isMlbb ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          const btnBg = isFf ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-500 hover:from-red-500 hover:to-amber-500 shadow-red-600/30' : isMlbb ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30';
          const icon = isFf ? <Flame className="w-7 h-7" /> : isMlbb ? <Swords className="w-7 h-7" /> : <Users className="w-7 h-7" />;
          const iconBg = isFf ? 'bg-gradient-to-br from-amber-500 to-red-600' : isMlbb ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600';

          return (
            <div key={group.id || idx} className={`bg-slate-950 border ${borderColor} rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl transition-all relative group`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-slate-950 shadow-md`}>
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase">
                      {group.name || group.title || 'Grup Komunitas'}
                    </h2>
                    <p className={`text-xs font-bold ${isFf ? 'text-red-400' : isMlbb ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      {group.description || 'Grup Khusus Komunitas Turnamen'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 ${badgeColor} border rounded-full text-xs font-extrabold`}>
                    {group.game || 'Resmi'}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(group, idx)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Edit grup WhatsApp ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(idx, group.name || group.title || 'Grup')}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Hapus grup WhatsApp ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <a
                  href={group.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 ${btnBg} text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all`}
                >
                  <span>GABUNG GRUP WHATSAPP RESMI</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleCopyLink(group.link, group.id || `group-${idx}`)}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedId === (group.id || `group-${idx}`) ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === (group.id || `group-${idx}`) ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK COMMUNITY MODAL */}
      {siteConfig && setSiteConfig && (
        <QuickCommunityModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
          groupToEdit={selectedGroup}
          groupIndex={selectedIndex}
        />
      )}
    </div>
  );
};
