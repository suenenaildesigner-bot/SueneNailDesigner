import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemText?: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, itemText }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Overlay - Glass blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/50 p-8 rounded-[36px] shadow-[0_24px_80px_rgba(242,27,127,0.25)] overflow-hidden"
          >
            {/* Background Gradient Accent */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner overflow-hidden relative">
                <img 
                  src="/logo2.png" 
                  alt="Rose Logo" 
                  className="w-14 h-14 object-contain opacity-80"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle text-pink-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Confirmar Exclusão</h2>
                <p className="text-gray-600 font-medium px-2">
                   Deseja realmente excluir {itemText ? <span className="text-pink-600 font-bold">"{itemText}"</span> : 'este item'}?
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-3 mt-4">
                <button
                  onClick={onConfirm}
                  className="w-full py-5 bg-[#f21b7f] text-white font-black rounded-2xl shadow-lg shadow-pink-200 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                >
                  CONFIRMAR EXCLUSÃO
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4.5 bg-white/50 text-slate-400 font-bold rounded-2xl border border-slate-100 hover:bg-white hover:text-slate-600 active:scale-95 transition-all text-lg uppercase tracking-wider"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
