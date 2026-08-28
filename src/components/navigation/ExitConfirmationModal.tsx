import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirmExit,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-sm bg-[#0e0e14] border-2 border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 shadow-lg">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Konfirmasi Keluar
              </h3>
              <p className="text-[10px] text-neutral-400">
                HUNTERS COMMUNITY • DEXZ STORE
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              Yakin ingin keluar dari aplikasi Turnamen <strong className="text-white">Hunters Community</strong>?
            </p>
          </div>
          <p className="text-[10px] text-neutral-500 pl-6">
            Data form yang belum dikirim tetap tersimpan di memori lokal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/50 transition-all uppercase tracking-wider"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
