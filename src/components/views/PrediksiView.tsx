import React, { useState } from 'react';
import { 
  Trophy, Swords, Flame, CheckCircle2, AlertCircle, Coins, Send, 
  Upload, Image as ImageIcon, QrCode, Clock, ShieldCheck, Check, Sparkles, HelpCircle, Bot 
} from 'lucide-react';
import { MatchSchedule, MatchPredictionBet, UserWallet, TabType, WalletTransaction } from '../../types';
import { QrisDisplay } from '../QrisDisplay';

interface PrediksiViewProps {
  schedules: MatchSchedule[];
  userWallet: UserWallet;
  setUserWallet: React.Dispatch<React.SetStateAction<UserWallet>>;
  bets: MatchPredictionBet[];
  setBets: React.Dispatch<React.SetStateAction<MatchPredictionBet[]>>;
  setActiveTab: (tab: TabType) => void;
  qrisNmid?: string;
  qrisImageUrl?: string;
  adminWa?: string;
  initialSubTab?: string;
}

export const PrediksiView: React.FC<PrediksiViewProps> = ({
  schedules,
  userWallet,
  setUserWallet,
  bets,
  setBets,
  setActiveTab,
  qrisNmid,
  qrisImageUrl,
  adminWa = '+62 831 4883 4663',
  initialSubTab,
}) => {
  const historyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialSubTab === 'riwayat' && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [initialSubTab]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSchedule | null>(null);
  const [pickedTeam, setPickedTeam] = useState<string>('');
  const [wantBet, setWantBet] = useState<'iya' | 'tidak' | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10000');
  const [paymentMethod, setPaymentMethod] = useState<'saldo' | 'qris'>('saldo');
  
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available active matches
  const availableMatches = schedules.filter(m => m.status !== 'selesai' && m.teamA && m.teamB);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti pembayaran maksimal 10MB!');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedMatch) {
      setErrorMessage('Silakan pilih pertandingan yang ingin diprediksi.');
      return;
    }

    if (!pickedTeam) {
      setErrorMessage('Silakan pilih tim jagoan Anda!');
      return;
    }

    if (!userName.trim() || !userPhone.trim()) {
      setErrorMessage('Silakan isi nama lengkap dan nomor WhatsApp aktif Anda.');
      return;
    }

    if (wantBet === 'iya') {
      const numericAmount = parseInt(betAmount.replace(/\D/g, ''), 10);
      if (isNaN(numericAmount) || numericAmount < 1000) {
        setErrorMessage('Minimal jumlah taruhan adalah Rp 1.000.');
        return;
      }

      const timestampStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      if (paymentMethod === 'saldo') {
        if (userWallet.balance < numericAmount) {
          setErrorMessage(`Saldo Anda tidak mencukupi (Saldo: Rp ${userWallet.balance.toLocaleString('id-ID')}). Silakan Top Up Saldo terlebih dahulu.`);
          return;
        }

        const newBalance = userWallet.balance - numericAmount;

        const newTx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          userName: userName.trim(),
          userPhone: userPhone.trim(),
          type: 'BET_PLACED',
          typeLabel: 'Taruhan Prediksi Match',
          amount: -numericAmount,
          balanceAfter: newBalance,
          status: 'Berhasil',
          note: `Match: ${selectedMatch.teamA} vs ${selectedMatch.teamB} (Pilih: ${pickedTeam})`,
          timestamp: timestampStr
        };

        // Deduct from wallet and append transaction log
        setUserWallet(prev => ({
          ...prev,
          balance: newBalance,
          transactions: [newTx, ...(prev.transactions || [])]
        }));
      } else if (paymentMethod === 'qris') {
        if (!proofImage) {
          setErrorMessage('Harap unggah bukti transfer QRIS terlebih dahulu.');
          return;
        }
      }

      const newBet: MatchPredictionBet = {
        id: `bet-${Date.now()}`,
        matchId: selectedMatch.id,
        matchTitle: `${selectedMatch.teamA} vs ${selectedMatch.teamB}`,
        game: selectedMatch.game,
        userName: userName.trim(),
        userPhone: userPhone.trim(),
        pickedTeam,
        betAmount: numericAmount,
        paymentMethod,
        paymentProofUrl: paymentMethod === 'qris' ? proofImage || undefined : undefined,
        status: paymentMethod === 'saldo' ? 'Dikonfirmasi' : 'Pending',
        placedAt: timestampStr,
        potentialPayout: numericAmount * 2, // 2x return on winning
      };

      setBets(prev => [newBet, ...prev]);

      // Kirim pesan otomatis ke Admin WhatsApp
      const waText = `Halo Admin DEXZ STORE,\nSaya telah mengirimkan Taruhan Prediksi Match!\n\n🎮 Game: ${selectedMatch.game}\n🏆 Match: ${selectedMatch.teamA} vs ${selectedMatch.teamB}\n🎯 Tim Jagoan: *${pickedTeam}*\n💰 Jumlah Taruhan: *Rp ${numericAmount.toLocaleString('id-ID')}*\n💳 Metode Pembayaran: *${paymentMethod === 'saldo' ? 'Potong Saldo Anda' : 'Scan QRIS'}*\n👤 Nama: ${userName}\n📱 WA: ${userPhone}\n\nMohon konfirmasi dan verifikasi taruhan ini. Terima kasih!`;
      const waUrl = `https://wa.me/${adminWa.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

      setSuccessMessage(`Taruhan berhasil dikirimkan! ${paymentMethod === 'saldo' ? 'Saldo Anda telah dipotong secara otomatis.' : 'Menunggu verifikasi admin via QRIS.'}`);
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);

      // Reset form fields
      setPickedTeam('');
      setWantBet(null);
      setProofImage(null);
      setProofFileName('');
    } else {
      // Hanya prediksi gratis tanpa taruhan
      setSuccessMessage(`Prediksi Anda untuk tim "${pickedTeam}" telah tercatat! Terima kasih telah berpartisipasi.`);
      setPickedTeam('');
      setWantBet(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-amber-950 p-6 sm:p-8 border border-blue-500/40 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>PILIH TIM & PREDIKSI PEMENANG</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span>🎯 MENU PREDIKSI & TARUHAN MATCH</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Pilih tim bertanding jagoan Anda, pasang taruhan, dan dapatkan kemenangan! Saldo dapat terpotong otomatis dari Saldo Anda atau dibayar melalui Scan QRIS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('saldo')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Cek Saldo Anda (Rp {userWallet.balance.toLocaleString('id-ID')})</span>
            </button>

            <button
              onClick={() => setActiveTab('gemini-ai')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-transform active:scale-95 cursor-pointer border border-purple-400/40"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Analisis Taktis & Prediksi AI (Gemini Pro)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MATCH SCHEDULE PICKER */}
      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase">1. PILIH PERTANDINGAN</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {availableMatches.length} Match Tersedia
          </span>
        </div>

        {availableMatches.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-neutral-800 space-y-2">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">Belum ada jadwal pertandingan aktif.</p>
            <p className="text-xs text-slate-500">Menunggu admin menambahkan jadwal pertandingan baru di Info Pertandingan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableMatches.map((m) => {
              const isSelected = selectedMatch?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMatch(m);
                    setPickedTeam('');
                  }}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.game === 'FF' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {m.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'} • {m.phase}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.day}, {m.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-extrabold text-white">
                    <span className="text-blue-300">{m.teamA}</span>
                    <span className="text-xs font-mono text-amber-400">VS</span>
                    <span className="text-rose-300">{m.teamB}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Tanggal: {m.date}</span>
                    {isSelected && <span className="text-blue-400 font-bold">✓ Terpilih</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORM PREDIKSI & TARUHAN */}
      {selectedMatch && (
        <form onSubmit={handlePlaceBet} className="bg-[#0f0f0f] border border-blue-500/30 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>2. PILIH TIM JAGOAN & OPSI BERTARUH</span>
              </h2>
              <p className="text-xs text-slate-400">Pertandingan: <strong className="text-white">{selectedMatch.teamA} vs {selectedMatch.teamB}</strong></p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              {selectedMatch.game}
            </span>
          </div>

          {/* DUA TOMBOL TIM */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-300 block">Pilih Tim Yang Anda Prediksikan Menang:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickedTeam(selectedMatch.teamA || '')}
                className={`p-4 rounded-xl border font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  pickedTeam === selectedMatch.teamA
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-[1.02]'
                    : 'bg-slate-950 border-neutral-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{selectedMatch.teamA}</span>
                {pickedTeam === selectedMatch.teamA && <Check className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setPickedTeam(selectedMatch.teamB || '')}
                className={`p-4 rounded-xl border font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  pickedTeam === selectedMatch.teamB
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/30 scale-[1.02]'
                    : 'bg-slate-950 border-neutral-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{selectedMatch.teamB}</span>
                {pickedTeam === selectedMatch.teamB && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* OPSI BERTARUH */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Ingin Bertaruh Uang Asli Pada Prediksi Ini?</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWantBet('iya')}
                className={`p-3 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  wantBet === 'iya'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
                    : 'bg-slate-900 border-neutral-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>IYA (Bertaruh)</span>
              </button>

              <button
                type="button"
                onClick={() => setWantBet('tidak')}
                className={`p-3 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  wantBet === 'tidak'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900 border-neutral-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>TIDAK (Gratis)</span>
              </button>
            </div>

            {/* DETAIL INPUT TARUHAN BILA IYA */}
            {wantBet === 'iya' && (
              <div className="space-y-4 pt-3 border-t border-neutral-800 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Jumlah Taruhan (Rp):</label>
                  <input
                    type="text"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Contoh: 10000"
                    className="w-full bg-slate-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['10000', '20000', '50000', '100000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBetAmount(preset)}
                        className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-mono text-slate-300 hover:border-amber-500/50"
                      >
                        Rp {parseInt(preset).toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* METODE PEMBAYARAN TARUHAN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Metode Pembayaran Taruhan:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('saldo')}
                      className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                        paymentMethod === 'saldo'
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-slate-900 border-neutral-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black text-amber-400">
                        <span>💳 Potong Saldo Anda</span>
                        <span className="text-[10px] font-mono text-emerald-400">Instant</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Saldo Anda: <strong>Rp {userWallet.balance.toLocaleString('id-ID')}</strong>
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                        paymentMethod === 'qris'
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-slate-900 border-neutral-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black text-blue-400">
                        <span>📱 Scan QRIS & Unggah Bukti</span>
                        <span className="text-[10px] font-mono text-amber-400">Manual</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Bayar via E-Wallet / Bank QRIS
                      </p>
                    </button>
                  </div>
                </div>

                {/* DISPLAY QRIS UNTUK QRIS METHOD */}
                {paymentMethod === 'qris' && (
                  <div className="space-y-3 pt-2">
                    <QrisDisplay 
                      game={selectedMatch.game}
                      qrisNmid={qrisNmid}
                      qrisImageUrl={qrisImageUrl}
                    />

                    <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-neutral-800">
                      <label className="text-xs font-bold text-slate-300 block">Unggah Bukti Pembayaran QRIS:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                      />
                      {proofFileName && (
                        <p className="text-[11px] text-emerald-400 font-mono">
                          ✓ File terpilih: {proofFileName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DUA INPUT IDENTITAS USER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nama Lengkap Anda:</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nomor WhatsApp Aktif:</label>
              <input
                type="tel"
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Contoh: 0831xxxx"
                className="w-full bg-slate-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* MESSAGES */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Taruhan ke Admin</span>
          </button>
        </form>
      )}

      {/* RIWAYAT TARUHAN SAYA */}
      <div ref={historyRef} className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase">RIWAYAT PREDIKSI & TARUHAN SAYA</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total: {bets.length}</span>
        </div>

        {bets.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-neutral-800">
            Belum ada riwayat prediksi atau taruhan.
          </div>
        ) : (
          <div className="space-y-2.5">
            {bets.map((b) => (
              <div key={b.id} className="p-3.5 bg-slate-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{b.matchTitle}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                      Jagoan: {b.pickedTeam}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Taruhan: <strong className="text-emerald-400 font-mono">Rp {b.betAmount.toLocaleString('id-ID')}</strong> ({b.paymentMethod === 'saldo' ? 'Saldo' : 'QRIS'}) • Tanggal: {b.placedAt}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    b.status === 'Menang'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : b.status === 'Kalah'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : b.status === 'Dikonfirmasi'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
