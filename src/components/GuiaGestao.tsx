import React from 'react';
import { ChevronLeft, TrendingUp, Package, Scissors, Star, Info, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

export function GuiaGestao({ onBack }: { onBack: () => void }) {
  const guides = [
    {
      title: "Como Lucrar Mais",
      icon: <TrendingUp className="text-emerald-500" />,
      content: "Seu lucro não é apenas o que você cobra. O app calcula o Lucro Líquido subtraindo o material gasto e a taxa fixa do valor do serviço. Foque em técnicas com melhor margem!",
      color: "bg-emerald-50"
    },
    {
      title: "Cadastro no Estoque",
      icon: <Package className="text-blue-500" />,
      content: "Sempre cadastre o Preço Total do pote e o Peso Real (ex: R$ 90,00 e 30g). O App dividirá esses valores automaticamente para saber o custo Exato de cada grama usada.",
      color: "bg-blue-50"
    },
    {
      title: "Taxa de Materiais",
      icon: <Scissors className="text-pink-500" />,
      content: "Incluímos uma taxa fixa de R$ 5,00 em todo atendimento. Isso cobre lixas, luvas, algodão e preparadores, garantindo que você nunca esqueça esses pequenos custos.",
      color: "bg-pink-50"
    },
    {
      title: "Dica de Ouro",
      icon: <Star className="text-amber-500" />,
      content: "Revise seus Preços de Venda na tela de configurações sempre que o custo dos géis ou descartáveis aumentar. Proteja sua margem de lucro para crescer sempre!",
      color: "bg-amber-50"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-[#fff5f8] pb-10"
    >
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-pink-100/50">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Manual de Gestão</h2>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-2 border-pink-100">
             <img src="/logo2.png" alt="Logo" className="w-12 h-12 object-contain opacity-80" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Dancing Script', cursive" }}>Guia da Empreendedora</h1>
          <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] mt-2">Elite Management System</p>
        </div>

        <div className="grid gap-4">
          {guides.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 border-l-[6px] border-l-pink-500 bg-white/70"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 ${item.color} rounded-2xl`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{item.title}</h3>
              </div>
              <p className="text-slate-600 font-medium text-xs leading-relaxed italic">
                "{item.content}"
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#f21b7f] rounded-[30px] p-8 text-white shadow-xl flex items-center gap-4">
           <div className="p-4 bg-white/20 rounded-2xl">
             <Wallet size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-pink-100">Meta Diária</p>
             <p className="text-sm font-bold opacity-90">Sua meta é manter o lucro acima de 60% por serviço.</p>
           </div>
        </div>
      </main>
    </motion.div>
  );
}
