import React, { useState } from 'react';
import { X, Flame, Swords, CheckCircle2, QrCode, ArrowRight, ShieldAlert, Send, Building2, Smartphone, CreditCard, Copy, Check } from 'lucide-react';
import { RegisteredTeam } from '../types';
import { saveSingleTeamToFirestore } from '../lib/firebaseStore';
import { notifyAdminEvent } from '../lib/notificationService';
import { ADMIN_WA, ADMIN_WA_CLEAN, OFFICIAL_EWALLET_NUMBER, OFFICIAL_BANK_BCA } from '../data/initialData';
import { QrisDisplay } from './QrisDisplay';

interface RegistrationModalProps {
  isOpen: boolean;
  initialGame?: 'FF' | 'MLBB';
  onClose: () => void;
  onAddTeam: (team: RegisteredTeam) => void;
  qrisNmid?: string;
  qrisImageUrl?: string;
  adminWa?: string;
  adminWaClean?: string;
  ewalletNumber?: string;
  ewalletHolder?: string;
  bankBcaNumber?: string;
  bankBcaHolder?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  initialGame = 'FF',
  onClose,
  onAddTeam,
  qrisNmid,
  qrisImageUrl,
  adminWa = ADMIN_WA,
  adminWaClean = ADMIN_WA_CLEAN,
  ewalletNumber = OFFICIAL_EWALLET_NUMBER,
  ewalletHolder = 'DEXZ STORE / HUNTERS',
  bankBcaNumber = OFFICIAL_BANK_BCA,
  bankBcaHolder = 'HUNTERS / DEXZ STORE',
}) => {
  const [selectedGame, setSelectedGame] = useState<'FF' | 'MLBB'>(initialGame);
  
  // Auto-restore form draft from local storage
  const [teamName, setTeamName] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_teamName') || ''; } catch { return ''; }
  });
  const [captainName, setCaptainName] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_captainName') || ''; } catch { return ''; }
  });
  const [captainPhone, setCaptainPhone] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_captainPhone') || ''; } catch { return ''; }
  });
  const [player2, setPlayer2] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_player2') || ''; } catch { return ''; }
  });
  const [player3, setPlayer3] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_player3') || ''; } catch { return ''; }
  });
  const [player4, setPlayer4] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_player4') || ''; } catch { return ''; }
  });
  const [player5, setPlayer5] = useState(() => {
    try { return localStorage.getItem('hunters_reg_modal_player5') || ''; } catch { return ''; }
  });
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Transfer Bank' | 'E-Wallet'>('QRIS');
  const [copiedText, setCopiedText] = useState(false);
  const [submittedTeam, setSubmittedTeam] = useState<RegisteredTeam | null>(null);

  // Auto-save form draft on each keystroke
  React.useEffect(() => {
    try {
      localStorage.setItem('hunters_reg_modal_teamName', teamName);
      localStorage.setItem('hunters_reg_modal_captainName', captainName);
      localStorage.setItem('hunters_reg_modal_captainPhone', captainPhone);
      localStorage.setItem('hunters_reg_modal_player2', player2);
      localStorage.setItem('hunters_reg_modal_player3', player3);
      localStorage.setItem('hunters_reg_modal_player4', player4);
      localStorage.setItem('hunters_reg_modal_player5', player5);
    } catch (e) {}
  }, [teamName, captainName, captainPhone, player2, player3, player4, player5]);

  if (!isOpen) return null;

  const copyNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captainName || !captainPhone) {
      alert('Mohon lengkapi Nama Tim, Nama Kapten, dan Nomor WhatsApp!');
      return;
    }

    const rosterList = [
      `${captainName} (Kapten)`,
      player2 || 'Pemain 2',
      player3 || 'Pemain 3',
      player4 || 'Pemain 4',
    ];
    if (player5) rosterList.push(player5);

    const newTeam: RegisteredTeam = {
      id: `team-${Date.now()}`,
      slotNumber: 0, // Slot kosong sampai dikonfirmasi Sah oleh Admin
      game: selectedGame,
      teamName: teamName.toUpperCase(),
      captainName,
      captainPhone,
      roster: rosterList,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'Menunggu Pembayaran',
    };

    onAddTeam(newTeam);
    saveSingleTeamToFirestore(newTeam);
    notifyAdminEvent(
      'pendaftaran',
      'Pendaftaran Tim Baru (Modal)',
      `Tim "${newTeam.teamName}" (${newTeam.game === 'FF' ? 'Free Fire' : 'Mobile Legends'}) mendaftar (Status: Menunggu Pembayaran & Konfirmasi Admin). Kapten: ${newTeam.captainName} (${newTeam.captainPhone}).`,
      newTeam
    );
    setSubmittedTeam(newTeam);
  };

  const getWaMessage = () => {
    if (!submittedTeam) return '';
    return `Halo Admin DEXZ STORE Hunters Community, saya ingin mengonfirmasi pendaftaran tim turnamen:

*FORMULIR PENDAFTARAN TIM*
---------------------------------------
🎮 *Game:* ${submittedTeam.game === 'FF' ? 'FREE FIRE' : 'MOBILE LEGENDS'}
🛡️ *Nama Tim:* ${submittedTeam.teamName}
👤 *Kapten:* ${submittedTeam.captainName}
📱 *No. WhatsApp:* ${submittedTeam.captainPhone}
👥 *Roster:*
1. ${submittedTeam.captainName} (Kapten)
2. ${player2 || '-'}
3. ${player3 || '-'}
4. ${player4 || '-'}
${player5 ? `5. ${player5}` : ''}

💳 *Metode Bayar:* ${paymentMethod}
💰 *Biaya Slot Otomatis:* Rp50.000

*CATATAN BUKTI:*
NoReff, NoProtes = simpan bukti pembayaran, protes tanpa bukti tidak kami tanggapi.

Mohon konfirmasi slot sah tim kami! Terima kasih.`;
  };

  const handleOpenWhatsApp = () => {
    const message = getWaMessage();
    const cleanWa = adminWaClean.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const resetAndClose = () => {
    setSubmittedTeam(null);
    setTeamName('');
    setCaptainName('');
    setCaptainPhone('');
    setPlayer2('');
    setPlayer3('');
    setPlayer4('');
    setPlayer5('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center font-bold text-slate-950 text-sm">
              HC
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">FORMULIR PENDAFTARAN TIM</h3>
              <p className="text-[11px] text-amber-400">Dikelola oleh DEXZ STORE • Rp50.000/Tim via Bank BCA / E-Wallet</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {!submittedTeam ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Game Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Pilih Game Turnamen:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGame('FF')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      selectedGame === 'FF'
                        ? 'bg-red-950/60 border-red-500 text-white font-bold ring-1 ring-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-red-900/50'
                    }`}
                  >
                    <Flame className="w-5 h-5 text-red-500" />
                    <div className="text-left">
                      <span className="block text-xs">🔥 FREE FIRE</span>
                      <span className="text-[10px] text-amber-400 font-bold">Biaya: Rp50.000</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGame('MLBB')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      selectedGame === 'MLBB'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-900/50'
                    }`}
                  >
                    <Swords className="w-5 h-5 text-cyan-400" />
                    <div className="text-left">
                      <span className="block text-xs">⚔️ MOBILE LEGENDS</span>
                      <span className="text-[10px] text-amber-400 font-bold">Biaya: Rp50.000</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Team & Captain Details */}
              <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Informasi Utama Tim</h4>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Nama Tim *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: HUNTERS KING"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Nama Kapten *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Kapten"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">No. WhatsApp Kapten *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0831xxxxxxx"
                      value={captainPhone}
                      onChange={(e) => setCaptainPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Roster Details */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Anggota Tim (Roster)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Pemain 2</label>
                    <input
                      type="text"
                      placeholder="Nama/IGN Player 2"
                      value={player2}
                      onChange={(e) => setPlayer2(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Pemain 3</label>
                    <input
                      type="text"
                      placeholder="Nama/IGN Player 3"
                      value={player3}
                      onChange={(e) => setPlayer3(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Pemain 4</label>
                    <input
                      type="text"
                      placeholder="Nama/IGN Player 4"
                      value={player4}
                      onChange={(e) => setPlayer4(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Pemain 5 / Cadangan (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Nama/IGN Player 5"
                      value={player5}
                      onChange={(e) => setPlayer5(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-orange-400" />
                    <span>Metode Pembayaran</span>
                  </span>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                    Resmi DEXZ STORE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'QRIS'
                        ? 'bg-orange-600 text-white border-orange-400 ring-2 ring-orange-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QRIS (Barcode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transfer Bank')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'Transfer Bank'
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank BCA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('E-Wallet')}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'E-Wallet'
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>E-Wallet</span>
                  </button>
                </div>

                {paymentMethod === 'QRIS' && (
                  <QrisDisplay game={selectedGame} qrisNmid={qrisNmid} qrisImageUrl={qrisImageUrl} />
                )}

                {paymentMethod === 'Transfer Bank' && (
                  <div className="bg-slate-950 border-2 border-blue-500/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-white">Bank BCA (Central Asia)</span>
                      <span className="text-[10px] text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded">Rekening Utama</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-white text-sm">{bankBcaNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(bankBcaNumber)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-bold flex items-center gap-1"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Atas Nama: <strong className="text-white">{bankBcaHolder}</strong></p>
                  </div>
                )}

                {paymentMethod === 'E-Wallet' && (
                  <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-white">DANA / OVO / GoPay</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">Nomor HP Official</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-white text-sm">{ewalletNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(ewalletNumber)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-bold flex items-center gap-1"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Atas Nama: <strong className="text-white">{ewalletHolder}</strong></p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-red-600 to-amber-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all active:scale-95"
              >
                <span>Lanjut Konfirmasi & Chat Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">PENDAFTARAN TERSIMPAN!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tim <strong className="text-amber-400">{submittedTeam.teamName}</strong> telah berhasil dicatat ke sistem slot.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-left text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Game:</span>
                  <span className="font-bold text-amber-400">{submittedTeam.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Kapten:</span>
                  <span className="font-semibold text-white">{submittedTeam.captainName} ({submittedTeam.captainPhone})</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Biaya Slot Otomatis:</span>
                  <span className="font-bold text-emerald-400 font-mono">Rp50.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metode Bayar:</span>
                  <span className="font-bold text-amber-400">{paymentMethod}</span>
                </div>
              </div>

              {/* Show QRIS if payment method is QRIS */}
              {paymentMethod === 'QRIS' && (
                <QrisDisplay game={submittedTeam.game} qrisNmid={qrisNmid} qrisImageUrl={qrisImageUrl} />
              )}

              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-left space-y-1">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Terkirim Ke Panel Admin</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Data pendaftaran tim Anda telah berhasil dikirim ke <strong>Panel Admin</strong>. Panitia telah menerima notifikasi dan akan memverifikasi pendaftaran Anda secara langsung.
                </p>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 uppercase tracking-wider"
              >
                <span>Selesai & Tutup</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

