import React, { useState } from 'react';
import { FileText, Phone, CheckCircle2, QrCode, ArrowRight, ShieldCheck, Flame, Swords, Building2, Smartphone, CreditCard, Copy, Check, AlertTriangle } from 'lucide-react';
import { ADMIN_WA, ADMIN_WA_CLEAN, OFFICIAL_EWALLET_NUMBER, OFFICIAL_BANK_BCA } from '../../data/initialData';
import { QrisDisplay } from '../QrisDisplay';

interface CaraDaftarViewProps {
  onOpenRegisterModal: (game?: 'FF' | 'MLBB') => void;
  qrisNmid?: string;
  qrisImageUrl?: string;
  adminWa?: string;
  adminWaClean?: string;
  ewalletNumber?: string;
  ewalletHolder?: string;
  bankBcaNumber?: string;
  bankBcaHolder?: string;
}

export const CaraDaftarView: React.FC<CaraDaftarViewProps> = ({ 
  onOpenRegisterModal,
  qrisNmid,
  qrisImageUrl,
  adminWa = ADMIN_WA,
  adminWaClean = ADMIN_WA_CLEAN,
  ewalletNumber = OFFICIAL_EWALLET_NUMBER,
  ewalletHolder = 'DEXZ STORE / HUNTERS',
  bankBcaNumber = OFFICIAL_BANK_BCA,
  bankBcaHolder = 'HUNTERS / DEXZ STORE'
}) => {
  const [selectedGame, setSelectedGame] = useState<'FF' | 'MLBB'>('FF');
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bank' | 'ewallet'>('qris');

  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedEwallet, setCopiedEwallet] = useState(false);

  const copyText = (text: string, type: 'bank' | 'ewallet') => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedEwallet(true);
      setTimeout(() => setCopiedEwallet(false), 2000);
    }
  };

  const steps = [
    {
      num: '1',
      title: 'Isi lengkap data tim',
      desc: 'Klik tombol "Daftar Tim", pilih game (FF/MLBB), lalu lengkapi Nama Tim, Nama Kapten, No. WhatsApp & Roster pemain.',
    },
    {
      num: '2',
      title: 'Pilih Metode Pembayaran',
      desc: 'Lakukan pembayaran biaya pendaftaran via QRIS (Scan Barcode All Payment), Transfer Bank (BCA), atau E-Wallet (DANA/OVO/GoPay).',
    },
    {
      num: '3',
      title: 'Simpan & Kirim Bukti Transfer',
      desc: 'Wajib simpan resi / bukti pembayaran dan kirimkan tangkapan layar (screenshot) ke WhatsApp Admin DEXZ STORE.',
    },
    {
      num: '4',
      title: 'Masuk grup sesuai game',
      desc: 'Setelah pembayaran terkonfirmasi sah oleh Admin, Anda akan mendapatkan akses ke WhatsApp Grup Resmi Kapten.',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>PANDUAN RESMI DEXZ STORE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
          📝 CARA DAFTAR & METODE PEMBAYARAN
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300">
          Pembayaran pendaftaran turnamen Hunters Community bisa menggunakan <strong className="text-orange-400">QRIS (Scan All Barcode)</strong>, <strong className="text-blue-400">Transfer Bank</strong>, maupun <strong className="text-emerald-400">E-Wallet (DANA/OVO/GoPay)</strong>.
        </p>
      </div>

      {/* 4 STEPS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div key={step.num} className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 relative space-y-3 shadow-lg hover:border-orange-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
              {step.num}
            </div>
            <h3 className="font-extrabold text-sm text-white">{step.title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* OFFICIAL PAYMENT DETAILS */}
      <div className="bg-[#0f0f0f] border border-orange-500/30 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2 uppercase">
              <CreditCard className="w-6 h-6 text-orange-400" />
              <span>METODE PEMBAYARAN RESMI</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Pilih metode pembayaran sesuai kenyamanan Anda • Dikelola oleh DEXZ STORE
            </p>
          </div>

          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Admin Official: {adminWa}</span>
          </div>
        </div>

        {/* TOURNAMENT GAME SELECTOR FOR AUTOMATIC NOMINAL */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-300 block">
            1. Pilih Game Turnamen untuk Menampilkan Nominal Otomatis:
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setSelectedGame('FF')}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                selectedGame === 'FF'
                  ? 'bg-red-950/60 border-red-500 text-white font-bold ring-2 ring-red-500'
                  : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="text-xs font-black">Free Fire</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-orange-400">Rp50.000</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('MLBB')}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                selectedGame === 'MLBB'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold ring-2 ring-cyan-500'
                  : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-black">Mobile Legends</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-orange-400">Rp50.000</span>
            </button>
          </div>
        </div>

        {/* PAYMENT METHOD SELECTOR TABS */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-neutral-300 block">
            2. Pilih Metode Pembayaran Yang Diinginkan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod('qris')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all ${
                selectedMethod === 'qris'
                  ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/40 ring-2 ring-orange-400'
                  : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QRIS (Scan All Payment)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('bank')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all ${
                selectedMethod === 'bank'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40 ring-2 ring-blue-400'
                  : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Transfer Bank (BCA)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('ewallet')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-black text-xs transition-all ${
                selectedMethod === 'ewallet'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400'
                  : 'bg-[#050505] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>E-Wallet (DANA/OVO/GoPay)</span>
            </button>
          </div>
        </div>

        {/* PAYMENT METHOD CONTENT DISPLAY */}
        {selectedMethod === 'qris' && (
          <QrisDisplay game={selectedGame} qrisNmid={qrisNmid} qrisImageUrl={qrisImageUrl} />
        )}

        {selectedMethod === 'bank' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-[#050505] border-2 border-blue-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-black rounded">BCA</span>
                  <span className="text-xs text-white font-black uppercase">Bank Central Asia</span>
                </div>
                <span className="text-[10px] text-blue-400 font-extrabold uppercase bg-blue-950 px-2 py-0.5 rounded border border-blue-800">Transfer Bank</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Nomor Rekening BCA Resmi:</span>
                <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  <span className="text-lg font-mono font-black text-white tracking-widest">{bankBcaNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyText(bankBcaNumber, 'bank')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBank ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400">
                  <span>Atas Nama:</span>
                  <strong className="text-white">{bankBcaHolder}</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Nominal Transfer:</span>
                  <strong className="text-orange-400 font-mono">Rp50.000 / Tim</strong>
                </div>
              </div>
            </div>

            <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-4 space-y-2 shadow-xl text-left">
              <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider border-b border-red-800/80 pb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>⚠️ CATATAN PERINGATAN WAJIB!</span>
              </div>
              <p className="text-xs font-mono font-extrabold text-white leading-relaxed bg-black/40 p-2.5 rounded-lg border border-red-500/40">
                NoReff, NoProtes = simpan bukti pembayaran transfer bank, protes tanpa bukti tidak kami tanggapi.
              </p>
            </div>
          </div>
        )}

        {selectedMethod === 'ewallet' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-[#050505] border-2 border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded">DANA</span>
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded">OVO</span>
                  <span className="px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-black rounded">GoPay</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">E-Wallet</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-neutral-400 block font-bold uppercase">Nomor HP E-Wallet Official:</span>
                <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  <span className="text-lg font-mono font-black text-white tracking-widest">{ewalletNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyText(ewalletNumber, 'ewallet')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedEwallet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEwallet ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-neutral-400">
                  <span>Atas Nama E-Wallet:</span>
                  <strong className="text-white">{ewalletHolder}</strong>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Nominal Transfer:</span>
                  <strong className="text-orange-400 font-mono">Rp50.000 / Tim</strong>
                </div>
              </div>
            </div>

            <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-4 space-y-2 shadow-xl text-left">
              <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider border-b border-red-800/80 pb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>⚠️ CATATAN PERINGATAN WAJIB!</span>
              </div>
              <p className="text-xs font-mono font-extrabold text-white leading-relaxed bg-black/40 p-2.5 rounded-lg border border-red-500/40">
                NoReff, NoProtes = simpan bukti pembayaran e-wallet, protes tanpa bukti tidak kami tanggapi.
              </p>
            </div>
          </div>
        )}

        {/* CTA BUTTONS */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-neutral-800">
          <button
            onClick={() => onOpenRegisterModal(selectedGame)}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 active:scale-95 transition-all uppercase tracking-wider"
          >
            <span>DAFTAR SEKARANG ({selectedGame === 'FF' ? 'Free Fire' : 'Mobile Legends'})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenRegisterModal(selectedGame)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kirim Langsung Ke Panel Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};


