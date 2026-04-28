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
        <button id="guide-back-button" onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Elite</h2>
      </header>

      <main className="p-8 space-y-12">
        {/* Banner de Logo Luxo - Sem Molduras */}
        <div className="flex flex-col items-center justify-center pt-16 pb-24 text-center text-slate-800">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-14 w-full flex justify-center relative"
          >
            {/* Background Glow for high impact */}
            <div className="absolute inset-0 bg-[#f21b7f]/10 blur-[120px] rounded-full -z-10" />
            
            <img 
              src="/logo2.png" 
              alt="Suene Nail Designer" 
              className="w-[260px] h-auto object-contain drop-shadow-[0_15px_45px_rgba(242,27,127,0.4)] transition-transform hover:scale-105 duration-700"
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-slate-900" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Guia da Empreendedora
          </h1>
          <p className="text-[12px] font-black text-[#f21b7f] uppercase tracking-[0.55em] mt-8 opacity-90 drop-shadow-sm">
            Sua Empresa, Seus Lucros, Seu Império
          </p>
        </div>

        <div className="grid gap-4">
          {guides.map((item, idx) => (
            <motion.div 
              key={idx}
              id={`guide-card-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 border-l-[6px] border-l-pink-500 bg-white/80 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 ${item.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                </div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{item.title}</h3>
              </div>
              <p className="text-slate-600 font-medium text-[13px] leading-relaxed italic opacity-80">
                "{item.content}"
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#f21b7f] to-pink-500 rounded-[30px] p-8 text-white shadow-[0_20px_40px_rgba(242,27,127,0.3)] flex items-center gap-5 mt-4"
        >
           <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
             <Wallet size={28} />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-pink-100 mb-1">Métricas de Sucesso</p>
             <p className="text-sm font-bold leading-tight">Mantenha sua lucratividade sempre acima de 60% por atendimento.</p>
           </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
