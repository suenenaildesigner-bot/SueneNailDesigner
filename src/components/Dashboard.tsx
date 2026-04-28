import React, { useState, useEffect } from 'react';
import { Agenda } from './Agenda';
import { Estoque } from './Estoque';
import { Atendimento } from './Atendimento';
import { Relatorio } from './Relatorio';
import { CalendarDays, Package, Scissors, BarChart3, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TabType = 'agenda' | 'estoque' | 'atendimento' | 'relatorio';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('agenda');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    onLogout();
  };

  const navItems = [
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'atendimento', label: 'Atendimento', icon: Scissors },
    { id: 'relatorio', label: 'Relatórios', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto relative pb-32">
      
      {/* Cabeçalho Pro */}
      <header className="p-6 pb-4 flex justify-between items-end sticky top-0 bg-white/80 backdrop-blur-2xl z-50 transition-all border-b border-pink-100/50">
        <div>
          <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">{currentDate}</p>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Dancing Script', cursive" }}>Suene Designer</h1>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-rose-500 active:scale-90 transition-transform shadow-sm border border-white/40"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'agenda' && <Agenda />}
          {activeTab === 'estoque' && <Estoque />}
          {activeTab === 'atendimento' && <Atendimento />}
          {activeTab === 'relatorio' && <Relatorio />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/75 backdrop-blur-[20px] rounded-[28px] border border-white/40 flex items-center justify-around px-2 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`tab-btn w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive 
                  ? 'bg-[#f21b7f] text-white shadow-lg shadow-pink-200 -translate-y-2' 
                  : 'text-slate-400 hover:text-pink-400'
              }`}
            >
              <Icon size={isActive ? 24 : 22} />
              {isActive && <span className="text-[8px] font-bold uppercase tracking-tighter">●</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
