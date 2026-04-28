import React, { useState } from 'react';
import { Agenda } from './Agenda';
import { Estoque } from './Estoque';
import { Atendimento } from './Atendimento';
import { Relatorio } from './Relatorio';
import { CalendarDays, Package, Scissors, BarChart3, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TabType = 'agenda' | 'estoque' | 'atendimento' | 'relatorio';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('agenda');

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
    { id: 'relatorio', label: 'Relatório', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto md:max-w-4xl relative">
      <header className="mb-6 flex justify-between items-center z-10 sticky top-4 px-4 py-2">
        <div>
          <h1 className="text-[24px] font-[700] text-[#1a1a1a]">SueneNailDesigner</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#FFB6C1] text-sm">
            <span>👤</span> Hello, Designer!
          </div>
          <button onClick={handleLogout} className="p-2 text-[#555] hover:text-[#FF1493] hover:bg-white/50 rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-[#FFB6C1]">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Dynamic Tab Rendering */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'agenda' && <Agenda />}
          {activeTab === 'estoque' && <Estoque />}
          {activeTab === 'atendimento' && <Atendimento />}
          {activeTab === 'relatorio' && <Relatorio />}
        </div>
      </main>

      {/* Bottom Navigation for Mobile First approach */}
      <nav className="glass fixed bottom-0 w-full md:w-[calc(100%-2rem)] md:left-4 md:bottom-4 md:rounded-2xl pb-safe pt-2 px-2 flex justify-around items-center z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full py-2 mb-2 rounded-xl transition-all ${
                isActive ? 'bg-[#FF1493] text-white shadow-[0_4px_12px_rgba(255,20,147,0.2)]' : 'text-[#555] hover:bg-white/20'
              }`}
            >
              <Icon size={24} className={isActive ? "text-white" : ""} />
              <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
