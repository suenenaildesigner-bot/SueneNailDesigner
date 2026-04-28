import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    name: string;
    whatsapp: string;
    service: string;
    date: string;
  } | null;
}

export function WhatsAppModal({ isOpen, onClose, data }: WhatsAppModalProps) {
  if (!data) return null;

  const handleSend = () => {
    const cleanNumber = data.whatsapp.replace(/\D/g, '');
    
    const dateObj = new Date(data.date);
    const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const message = `Olá, ${data.name}. É um prazer confirmar seu momento de cuidado e beleza conosco. Seu horário para ${data.service} está agendado para o dia ${day} às ${time}. Estamos ansiosos para recebê-la em nosso espaço. Até breve! ✨💅`;
    const encodedMessage = encodeURIComponent(message);
    
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-sm bg-white/80 backdrop-blur-3xl border-2 border-[#e5b182]/50 p-8 rounded-[48px] shadow-[0_40px_120px_rgba(229,177,130,0.3)] overflow-hidden"
          >
            {/* Ouro Rose Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#e5b182] via-[#f7d7bc] to-[#e5b182]" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-[#e5b182] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-28 h-28 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#e5b182]/20 blur-2xl rounded-full" />
                <img 
                  src="/logo2.png" 
                  alt="Logo Suene Nail" 
                  className="w-full h-full object-contain relative z-10 rounded-3xl drop-shadow-[0_0_20px_rgba(229,177,130,0.5)]"
                  onError={(e) => (e.currentTarget.src = 'https://api.iconify.design/lucide:sparkles.svg?color=%23e5b182')}
                />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl font-black text-slate-800 tracking-[0.1em] uppercase px-4">
                  CONFIRMAÇÃO <span className="text-[#e5b182]">DIGITAL</span>
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Deseja notificar a cliente <span className="text-slate-800 font-bold">{data.name}</span> sobre este atendimento exclusivo?
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  className="relative group w-full py-5 bg-[#50fa7b] text-slate-900 font-black rounded-2xl shadow-[0_10px_30px_rgba(80,250,123,0.3)] transition-all text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform" />
                  <MessageCircle size={18} className="fill-slate-900/10" />
                  ENVIAR PROTOCOLO
                </motion.button>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
