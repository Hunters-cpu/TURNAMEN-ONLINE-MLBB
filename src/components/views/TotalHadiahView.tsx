import React, { useState } from 'react';
import { 
  Trophy, 
  Calculator, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Swords, 
  ArrowRight, 
  Percent, 
  Info,
  DollarSign,
  Gift,
  HelpCircle,
  Lock,
  Unlock,
  Settings,
  Edit3
} from 'lucide-react';
import { TabType, TournamentInfo, PrizePoolConfig, SiteConfig } from '../../types';
import { QuickPrizeModal } from '../admin/QuickPrizeModal';

interface TotalHadiahViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  ffInfo?: TournamentInfo;
  mlbbInfo?: TournamentInfo;
  prizePoolConfig?: PrizePoolConfig;
  adminWa?: string;
  isAdmin?: boolean;
  siteConfig?: SiteConfig;
  setSiteConfig?: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const TotalHadiahView: React.FC<TotalHadiahViewProps> = ({
  setActiveTab,
  onOpenRegisterModal,
  ffInfo,
  mlbbInfo,
  prizePoolConfig,
  adminWa = '083148834663',
  isAdmin = false,
  siteConfig,
  setSiteConfig
}) => {
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [selectedGamePrize, setSelectedGamePrize] = useState<'FF' | 'MLBB'>('FF');

  const handleOpenPrizeEdit = (game: 'FF' | 'MLBB') => {
    setSelectedGamePrize(game);
    setShowPrizeModal(true);
  };

  // Defaults from config or fallback
  const defaultFee = prizePoolConfig?.feePerSlot || 50000;
  const defaultSlots = prizePoolConfig?.totalSlots || 32;
  const adminPercent = prizePoolConfig?.adminFeePercent ?? 10;
  const defaultAdminFee = prizePoolConfig?.adminFee ?? Math.round((defaultFee * defaultSlots * adminPercent) / 100);
  const j1Percent = prizePoolConfig?.juara1Percent || 50;
  const j2Percent = prizePoolConfig?.juara2Percent || 30;
  const j3Percent = prizePoolConfig?.juara3Percent || 20;

  // Interactive Calculator State
  const [calcFee, setCalcFee] = useState<number>(defaultFee);
  const [calcSlots, setCalcSlots] = useState<number>(defaultSlots);
  const [calcAdminFee, setCalcAdminFee] = useState<number>(defaultAdminFee);
  const [selectedGameTab, setSelectedGameTab] = useState<'FF' | 'MLBB' | 'KALKULATOR'>('FF');

  // Helper currency formatter
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper for FF tournament calculation
  const ffFeeNum = parseInt((ffInfo?.fee || 'Rp 50.000').replace(/[^0-9]/g, '')) || 50000;
  const ffSlots = ffInfo?.maxSlots || 32;
  const ffGross = ffFeeNum * ffSlots;
  const ffAdminFee = Math.round((ffGross * adminPercent) / 100);
  const ffNet = Math.max(0, ffGross - ffAdminFee);
  const ffJ1 = Math.round((ffNet * j1Percent) / 100);
  const ffJ2 = Math.round((ffNet * j2Percent) / 100);
  const ffJ3 = Math.round((ffNet * j3Percent) / 100);

  // Helper for MLBB tournament calculation
  const mlFeeNum = parseInt((mlbbInfo?.fee || 'Rp 50.000').replace(/[^0-9]/g, '')) || 50000;
  const mlSlots = mlbbInfo?.maxSlots || 32;
  const mlGross = mlFeeNum * mlSlots;
  const mlAdminFee = Math.round((mlGross * adminPercent) / 100);
  const mlNet = Math.max(0, mlGross - mlAdminFee);
  const mlJ1 = Math.round((mlNet * j1Percent) / 100);
  const mlJ2 = Math.round((mlNet * j2Percent) / 100);
  const mlJ3 = Math.round((mlNet * j3Percent) / 100);

  // Calculations for interactive calculator
  const calcGross = calcFee * calcSlots;
  const calcNetPrize = Math.max(0, calcGross - calcAdminFee);
  const calcJ1 = Math.round((calcNetPrize * j1Percent) / 100);
  const calcJ2 = Math.round((calcNetPrize * j2Percent) / 100);
  const calcJ3 = Math.round((calcNetPrize * j3Percent) / 100);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="uppercase tracking-wider">SKEMA TOTAL HADIAH TURNAMEN</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
            <span>RINCIAN & KALKULATOR TOTAL HADIAH</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Sistem kalkulasi total prize pool otomatis transparan dan akurat. Hadiah dihitung secara real-time berdasarkan <strong className="text-amber-400">jumlah slot yang dikalikan biaya pendaftaran</strong> dan dikurangi <strong className="text-orange-400">biaya admin operasional</strong>.
          </p>
        </div>
      </div>

      {/* GAME TABS SELECTOR */}
      <div className="flex items-center justify-center p-1.5 bg-[#0a0a0a] border border-neutral-800 rounded-2xl gap-2 max-w-md mx-auto shadow-lg">
        <button
          onClick={() => setSelectedGameTab('FF')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            selectedGameTab === 'FF'
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 scale-105'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Flame className="w-4 h-4 text-red-400" />
          <span>Free Fire</span>
        </button>

        <button
          onClick={() => setSelectedGameTab('MLBB')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            selectedGameTab === 'MLBB'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50 scale-105'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Swords className="w-4 h-4 text-cyan-300" />
          <span>Mobile Legends</span>
        </button>

        <button
          onClick={() => setSelectedGameTab('KALKULATOR')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            selectedGameTab === 'KALKULATOR'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 scale-105'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-300" />
          <span>Kalkulator</span>
        </button>
      </div>

      {/* DISPLAY BASED ON SELECTED TAB */}
      {selectedGameTab === 'FF' && (
        <div className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  PRIZE POOL FREE FIRE
                </h3>
                <p className="text-xs text-neutral-400">
                  {ffSlots} Slot Tim • Biaya {ffInfo?.fee || 'Rp 50.000'} / Slot
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
              <div className="text-right bg-neutral-950 px-4 py-3 rounded-2xl border border-amber-500/30 w-full sm:w-auto">
                <p className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider">TOTAL HADIAH RESMI</p>
                <p className="text-2xl font-black text-amber-300 tracking-tight">{ffInfo?.totalPrize || formatRupiah(ffNet)}</p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenPrizeEdit('FF')}
                  className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>⚡ Edit Hadiah FF Langsung</span>
                </button>
              )}
            </div>
          </div>

          {/* RUMUS SCHEME BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center">
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Kotor (Bruto)</span>
              <span className="text-sm font-black text-white">{formatRupiah(ffGross)}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">({ffSlots} Slot x {formatRupiah(ffFeeNum)})</span>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-red-400 uppercase font-bold block flex items-center justify-center gap-1">
                {isAdmin ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-red-400" />}
                <span>Potongan Admin ({adminPercent}%)</span>
              </span>
              {isAdmin ? (
                <>
                  <span className="text-sm font-black text-red-400">- {formatRupiah(ffAdminFee)}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">Biaya Operasional {adminPercent}%</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-black text-neutral-400">{adminPercent}% Terpotong Otomatis</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">🔒 Biaya Operasional</span>
                </>
              )}
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase font-extrabold block">Total Hadiah Bersih</span>
              <span className="text-sm font-black text-amber-400">{formatRupiah(ffNet)}</span>
              <span className="text-[10px] text-amber-300/70 block mt-0.5">(Siap Dibagikan)</span>
            </div>
          </div>

          {/* WINNERS PERCENTAGE BREAKDOWN */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>PEMBAGIAN HADIAH JUARA FREE FIRE:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* JUARA 1 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 p-5 rounded-2xl border-2 border-amber-500/60 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 1
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {j1Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-amber-300">{formatRupiah(ffJ1)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ Sertifikat / Trophy E-Sertifikat Resmi DEXZ STORE</p>
                </div>
              </div>

              {/* JUARA 2 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-slate-400/10 via-neutral-900 to-neutral-950 p-5 rounded-2xl border border-neutral-700 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-300 text-slate-950 font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 2
                  </span>
                  <span className="text-xs font-black text-slate-300 bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/30">
                    {j2Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-slate-200">{formatRupiah(ffJ2)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ E-Sertifikat Juara 2 Resmi Hunters Community</p>
                </div>
              </div>

              {/* JUARA 3 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-amber-900/20 via-neutral-900 to-neutral-950 p-5 rounded-2xl border border-amber-800/50 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-700 text-white font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 3
                  </span>
                  <span className="text-xs font-black text-amber-500 bg-amber-700/10 px-2 py-0.5 rounded border border-amber-700/30">
                    {j3Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-amber-500">{formatRupiah(ffJ3)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ E-Sertifikat Juara 3 Resmi Hunters Community</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <button
              onClick={() => onOpenRegisterModal('FF')}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Flame className="w-4 h-4" />
              <span>Daftar Turnamen Free Fire Now</span>
            </button>
            <button
              onClick={() => setActiveTab('ff')}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs px-5 py-3.5 rounded-xl border border-neutral-800 flex items-center justify-center gap-2"
            >
              <span>Lihat Info Lengkap FF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedGameTab === 'MLBB' && (
        <div className="bg-[#0f0f0f] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-300">
                <Swords className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  PRIZE POOL MOBILE LEGENDS
                </h3>
                <p className="text-xs text-neutral-400">
                  {mlSlots} Slot Tim • Biaya {mlbbInfo?.fee || 'Rp 50.000'} / Slot
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
              <div className="text-right bg-neutral-950 px-4 py-3 rounded-2xl border border-cyan-500/30 w-full sm:w-auto">
                <p className="text-[10px] text-cyan-400 uppercase font-extrabold tracking-wider">TOTAL HADIAH RESMI</p>
                <p className="text-2xl font-black text-cyan-300 tracking-tight">{mlbbInfo?.totalPrize || formatRupiah(mlNet)}</p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenPrizeEdit('MLBB')}
                  className="text-[11px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>⚡ Edit Hadiah MLBB Langsung</span>
                </button>
              )}
            </div>
          </div>

          {/* RUMUS SCHEME BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#050505] p-4 rounded-2xl border border-neutral-800 text-center">
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Kotor (Bruto)</span>
              <span className="text-sm font-black text-white">{formatRupiah(mlGross)}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">({mlSlots} Slot x {formatRupiah(mlFeeNum)})</span>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-red-400 uppercase font-bold block flex items-center justify-center gap-1">
                {isAdmin ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-red-400" />}
                <span>Potongan Admin ({adminPercent}%)</span>
              </span>
              {isAdmin ? (
                <>
                  <span className="text-sm font-black text-red-400">- {formatRupiah(mlAdminFee)}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">Biaya Operasional {adminPercent}%</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-black text-neutral-400">{adminPercent}% Terpotong Otomatis</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">🔒 Biaya Operasional</span>
                </>
              )}
            </div>

            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <span className="text-[10px] text-cyan-300 uppercase font-extrabold block">Total Hadiah Bersih</span>
              <span className="text-sm font-black text-cyan-300">{formatRupiah(mlNet)}</span>
              <span className="text-[10px] text-cyan-200/70 block mt-0.5">(Siap Dibagikan)</span>
            </div>
          </div>

          {/* WINNERS PERCENTAGE BREAKDOWN */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span>PEMBAGIAN HADIAH JUARA MOBILE LEGENDS:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* JUARA 1 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-cyan-500/20 via-neutral-900 to-neutral-950 p-5 rounded-2xl border-2 border-cyan-500/60 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 1
                  </span>
                  <span className="text-xs font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    {j1Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-cyan-300">{formatRupiah(mlJ1)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ E-Sertifikat Juara 1 Resmi DEXZ STORE</p>
                </div>
              </div>

              {/* JUARA 2 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-slate-400/10 via-neutral-900 to-neutral-950 p-5 rounded-2xl border border-neutral-700 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-300 text-slate-950 font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 2
                  </span>
                  <span className="text-xs font-black text-slate-300 bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/30">
                    {j2Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-slate-200">{formatRupiah(mlJ2)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ E-Sertifikat Juara 2 Resmi Hunters Community</p>
                </div>
              </div>

              {/* JUARA 3 */}
              <div className="relative overflow-hidden bg-gradient-to-b from-amber-900/20 via-neutral-900 to-neutral-950 p-5 rounded-2xl border border-amber-800/50 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-700 text-white font-black text-[11px] rounded-lg uppercase tracking-wider">
                    JUARA 3
                  </span>
                  <span className="text-xs font-black text-amber-500 bg-amber-700/10 px-2 py-0.5 rounded border border-amber-700/30">
                    {j3Percent}%
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-amber-500">{formatRupiah(mlJ3)}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">+ E-Sertifikat Juara 3 Resmi Hunters Community</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <button
              onClick={() => onOpenRegisterModal('MLBB')}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Swords className="w-4 h-4" />
              <span>Daftar Turnamen MLBB Now</span>
            </button>
            <button
              onClick={() => setActiveTab('mlbb')}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs px-5 py-3.5 rounded-xl border border-neutral-800 flex items-center justify-center gap-2"
            >
              <span>Lihat Info Lengkap MLBB</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE CALCULATOR TAB */}
      {selectedGameTab === 'KALKULATOR' && (
        <div className="bg-[#0f0f0f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                KALKULATOR OTOMATIS PRIZE POOL CUSTOM
              </h3>
              <p className="text-xs text-neutral-400">
                Ubah parameter di bawah untuk mensimulasikan total hadiah turnamen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* INPUT BIAYA SLOT */}
            <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Biaya Pendaftaran / Slot (Rp):
              </label>
              <input
                type="number"
                step={5000}
                min={0}
                value={calcFee}
                onChange={(e) => {
                  const newFee = Number(e.target.value);
                  setCalcFee(newFee);
                  setCalcAdminFee(Math.round((newFee * calcSlots * adminPercent) / 100));
                }}
                className="w-full bg-[#101010] border border-neutral-700 rounded-xl p-3 text-sm font-black text-amber-400 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-neutral-500">
                Format: {formatRupiah(calcFee)} / tim
              </p>
            </div>

            {/* INPUT JUMLAH SLOT */}
            <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                Jumlah Slot Tim:
              </label>
              <input
                type="number"
                min={2}
                max={128}
                value={calcSlots}
                onChange={(e) => {
                  const newSlots = Number(e.target.value);
                  setCalcSlots(newSlots);
                  setCalcAdminFee(Math.round((calcFee * newSlots * adminPercent) / 100));
                }}
                className="w-full bg-[#101010] border border-neutral-700 rounded-xl p-3 text-sm font-black text-white focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-neutral-500">
                Jumlah tim yang berpartisipasi
              </p>
            </div>

            {/* INPUT BIAYA ADMIN */}
            <div className="bg-[#050505] p-4 rounded-2xl border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Biaya Admin Operasional (10%):</span>
                {isAdmin ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Admin Mode
                  </span>
                ) : (
                  <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </label>
              <input
                type="number"
                step={5000}
                min={0}
                disabled={!isAdmin}
                value={calcAdminFee}
                onChange={(e) => setCalcAdminFee(Number(e.target.value))}
                className={`w-full border rounded-xl p-3 text-sm font-black font-mono focus:outline-none ${
                  isAdmin 
                    ? 'bg-[#101010] border-neutral-700 text-red-400 focus:border-amber-500' 
                    : 'bg-[#181818] border-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-neutral-500">
                {isAdmin 
                  ? `Potongan operasional (${adminPercent}% dari total kotor, dapat diubah admin)` 
                  : `🔒 Biaya operasional 10% (${formatRupiah(calcAdminFee)})`}
              </p>
            </div>
          </div>

          {/* CALCULATED RESULT CARD */}
          <div className="bg-gradient-to-r from-amber-950/40 via-[#050505] to-orange-950/40 border-2 border-amber-500/50 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                  HASIL PERHITUNGAN TOTAL HADIAH
                </span>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {formatRupiah(calcNetPrize)}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Formula: ({formatRupiah(calcFee)} x {calcSlots} Slot) - {formatRupiah(calcAdminFee)} Biaya Admin
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-mono">
                ✨ Auto-Calculated
              </div>
            </div>

            {/* BREAKDOWN PER PROPORTION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-800">
              <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase">JUARA 1 ({j1Percent}%)</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xl font-black text-white">{formatRupiah(calcJ1)}</p>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-neutral-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300 uppercase">JUARA 2 ({j2Percent}%)</span>
                  <Trophy className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xl font-black text-white">{formatRupiah(calcJ2)}</p>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-amber-800/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500 uppercase">JUARA 3 ({j3Percent}%)</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xl font-black text-white">{formatRupiah(calcJ3)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSPARENCY & ATO-CALCULATE RULES INFO */}
      <div className="p-6 bg-[#0a0a0a] border border-neutral-800 rounded-3xl space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>KETENTUAN SAKLEK & TRANSPARANSI TOTAL HADIAH:</span>
        </h4>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300 leading-relaxed">
          <li className="p-3 bg-[#050505] rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <span>Total Hadiah dipadukan secara transparan dari total biaya registrasi slot yang terkumpul dikurangi biaya admin/room master.</span>
          </li>

          <li className="p-3 bg-[#050505] rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <span>Proporsi hadiah tetap konsisten: <strong>Juara 1 (50%)</strong>, <strong>Juara 2 (30%)</strong>, dan <strong>Juara 3 (20%)</strong>.</span>
          </li>

          <li className="p-3 bg-[#050505] rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <span>Hadiah dikirimkan langsung maksimal 1x24 jam setelah Grand Final selesai via Transfer Bank / E-Wallet resmi panitia.</span>
          </li>

          <li className="p-3 bg-[#050505] rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
            <span>Semua bukti pencairan hadiah akan didokumentasikan & dipublikasikan pada menu Data & Laporan Resmi.</span>
          </li>
        </ul>
      </div>

      {/* QUICK PRIZE MODAL */}
      {siteConfig && setSiteConfig && (
        <QuickPrizeModal
          isOpen={showPrizeModal}
          onClose={() => setShowPrizeModal(false)}
          siteConfig={siteConfig}
          setSiteConfig={setSiteConfig}
          defaultGame={selectedGamePrize}
        />
      )}
    </div>
  );
};
