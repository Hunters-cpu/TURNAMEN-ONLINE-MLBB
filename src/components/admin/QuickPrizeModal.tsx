import React, { useState, useEffect } from 'react';
import { X, Trophy, DollarSign, Percent, Save, Sparkles, Coins, Gift, CheckCircle2 } from 'lucide-react';
import { SiteConfig, PrizePoolConfig } from '../../types';

interface QuickPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  defaultGame?: 'FF' | 'MLBB';
}

export const QuickPrizeModal: React.FC<QuickPrizeModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  setSiteConfig,
  defaultGame = 'FF'
}) => {
  const currentPrizeConfig = siteConfig.prizePoolConfig || {
    totalSlots: 32,
    feePerSlot: 50000,
    adminFee: 160000,
    adminFeePercent: 10,
    juara1Percent: 50,
    juara2Percent: 30,
    juara3Percent: 20
  };

  const [feePerSlot, setFeePerSlot] = useState(currentPrizeConfig.feePerSlot || 50000);
  const [totalSlots, setTotalSlots] = useState(currentPrizeConfig.totalSlots || 32);
  const [adminFeePercent, setAdminFeePercent] = useState(currentPrizeConfig.adminFeePercent || 10);
  const [juara1Percent, setJuara1Percent] = useState(currentPrizeConfig.juara1Percent || 50);
  const [juara2Percent, setJuara2Percent] = useState(currentPrizeConfig.juara2Percent || 30);
  const [juara3Percent, setJuara3Percent] = useState(currentPrizeConfig.juara3Percent || 20);

  // Direct manual overrides for displayed labels
  const [ffTotalPrizeText, setFfTotalPrizeText] = useState(siteConfig.ffInfo?.totalPrize || 'Rp 1.440.000');
  const [mlbbTotalPrizeText, setMlbbTotalPrizeText] = useState(siteConfig.mlbbInfo?.totalPrize || 'Rp 1.440.000');

  useEffect(() => {
    if (siteConfig.prizePoolConfig) {
      setFeePerSlot(siteConfig.prizePoolConfig.feePerSlot || 50000);
      setTotalSlots(siteConfig.prizePoolConfig.totalSlots || 32);
      setAdminFeePercent(siteConfig.prizePoolConfig.adminFeePercent || 10);
      setJuara1Percent(siteConfig.prizePoolConfig.juara1Percent || 50);
      setJuara2Percent(siteConfig.prizePoolConfig.juara2Percent || 30);
      setJuara3Percent(siteConfig.prizePoolConfig.juara3Percent || 20);
    }
    if (siteConfig.ffInfo) setFfTotalPrizeText(siteConfig.ffInfo.totalPrize || 'Rp 1.440.000');
    if (siteConfig.mlbbInfo) setMlbbTotalPrizeText(siteConfig.mlbbInfo.totalPrize || 'Rp 1.440.000');
  }, [siteConfig, isOpen]);

  if (!isOpen) return null;

  // Realtime calculated values
  const grossTotal = feePerSlot * totalSlots;
  const calculatedAdminFee = Math.round((grossTotal * adminFeePercent) / 100);
  const calculatedNetPrize = Math.max(0, grossTotal - calculatedAdminFee);
  const calculatedJ1 = Math.round((calculatedNetPrize * juara1Percent) / 100);
  const calculatedJ2 = Math.round((calculatedNetPrize * juara2Percent) / 100);
  const calculatedJ3 = Math.round((calculatedNetPrize * juara3Percent) / 100);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleApplyCalculatedToTexts = () => {
    const formattedNet = formatRupiah(calculatedNetPrize);
    setFfTotalPrizeText(formattedNet);
    setMlbbTotalPrizeText(formattedNet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPrizeConfig: PrizePoolConfig = {
      totalSlots: Number(totalSlots) || 32,
      feePerSlot: Number(feePerSlot) || 50000,
      adminFee: calculatedAdminFee,
      adminFeePercent: Number(adminFeePercent) || 10,
      juara1Percent: Number(juara1Percent) || 50,
      juara2Percent: Number(juara2Percent) || 30,
      juara3Percent: Number(juara3Percent) || 20
    };

    setSiteConfig({
      ...siteConfig,
      prizePoolConfig: updatedPrizeConfig,
      ffInfo: {
        ...siteConfig.ffInfo,
        fee: `Rp ${Number(feePerSlot).toLocaleString('id-ID')}`,
        maxSlots: Number(totalSlots) || 32,
        totalPrize: ffTotalPrizeText.trim() || formatRupiah(calculatedNetPrize)
      },
      mlbbInfo: {
        ...siteConfig.mlbbInfo,
        fee: `Rp ${Number(feePerSlot).toLocaleString('id-ID')}`,
        maxSlots: Number(totalSlots) || 32,
        totalPrize: mlbbTotalPrizeText.trim() || formatRupiah(calculatedNetPrize)
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0318] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ EDIT LANGSUNG HADIAH & BIAYA
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Kelola Skema Total Hadiah & Biaya Slot
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Fee per slot & Total Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Biaya Slot (Rp):</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={feePerSlot}
                onChange={(e) => setFeePerSlot(Number(e.target.value))}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Total Slot Maksimal:</label>
              <input
                type="number"
                min="2"
                max="128"
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Potongan Admin (%):</label>
              <input
                type="number"
                min="0"
                max="50"
                value={adminFeePercent}
                onChange={(e) => setAdminFeePercent(Number(e.target.value))}
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-red-300 font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Row 2: Winner Percentages */}
          <div className="space-y-2 bg-[#06020c] p-4 rounded-2xl border border-purple-900/60">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
              Persentase Pembagian Juara (Total harus 100%):
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-bold">Juara 1 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={juara1Percent}
                  onChange={(e) => setJuara1Percent(Number(e.target.value))}
                  className="w-full bg-[#0b0318] border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-black text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-bold">Juara 2 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={juara2Percent}
                  onChange={(e) => setJuara2Percent(Number(e.target.value))}
                  className="w-full bg-[#0b0318] border border-slate-500/40 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-black text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-bold">Juara 3 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={juara3Percent}
                  onChange={(e) => setJuara3Percent(Number(e.target.value))}
                  className="w-full bg-[#0b0318] border border-orange-500/40 rounded-xl px-3 py-1.5 text-xs text-orange-300 font-black text-center"
                />
              </div>
            </div>

            {/* Calculated Preview Pill */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-300 font-bold">
                J1: {formatRupiah(calculatedJ1)}
              </div>
              <div className="p-2 bg-slate-500/10 rounded-lg border border-slate-500/20 text-slate-300 font-bold">
                J2: {formatRupiah(calculatedJ2)}
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-300 font-bold">
                J3: {formatRupiah(calculatedJ3)}
              </div>
            </div>
          </div>

          {/* Row 3: Label Display overrides for Free Fire & Mobile Legends */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Teks Total Hadiah FF di Banner:</label>
              <input
                type="text"
                value={ffTotalPrizeText}
                onChange={(e) => setFfTotalPrizeText(e.target.value)}
                placeholder="Rp 1.440.000"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-red-300 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Teks Total Hadiah MLBB di Banner:</label>
              <input
                type="text"
                value={mlbbTotalPrizeText}
                onChange={(e) => setMlbbTotalPrizeText(e.target.value)}
                placeholder="Rp 1.440.000"
                className="w-full bg-[#06020c] border border-purple-900/80 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Helper button to auto-fill texts */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleApplyCalculatedToTexts}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
            >
              🔄 Salin Hadiah Bersih ({formatRupiah(calculatedNetPrize)}) ke Teks FF & MLBB
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/60 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Hadiah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
