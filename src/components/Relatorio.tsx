import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Wallet, ArrowDownRight, Sparkles, PieChart, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Relatorio() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGanhos: 0,
    totalCusto: 0,
    lucro: 0,
    ticketMedio: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [servicoStats, setServicoStats] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch last 30 days of atendimentos
      const startDate = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .gte('data', startDate)
        .order('data', { ascending: true });

      if (error) throw error;

      const results = data || [];
      const TAXA_DESCARTAVEL = 5.00;
      
      const totalG = results.reduce((acc, curr) => acc + (curr.valor_cobrado || 0), 0);
      const materialC = results.reduce((acc, curr) => acc + (curr.custo_material || 0), 0);
      const totalTaxa = results.length * TAXA_DESCARTAVEL;
      const totalC = materialC + totalTaxa;
      
      setStats({
        totalGanhos: totalG,
        totalCusto: totalC,
        lucro: totalG - totalC,
        ticketMedio: results.length > 0 ? totalG / results.length : 0
      });

      // Group by day for the chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
          name: format(d, 'EEE', { locale: ptBR }),
          fullDate: format(d, 'yyyy-MM-dd'),
          lucro: 0
        };
      });

      // Stats by service
      const servicesMap: Record<string, { nome: string, lucro: number, count: number }> = {};

      results.forEach(val => {
        const dateStr = format(new Date(val.data), 'yyyy-MM-dd');
        const dayMatch = last7Days.find(d => d.fullDate === dateStr);
        
        const serviceName = val.tecnica || val.servico || 'Não Definido';
        const lucroAtendimento = (val.valor_cobrado || 0) - (val.custo_material || 0) - TAXA_DESCARTAVEL;
        const lucroFinal = Math.max(0, lucroAtendimento);

        if (dayMatch) {
          dayMatch.lucro += lucroFinal;
        }

        if (!servicesMap[serviceName]) {
          servicesMap[serviceName] = { nome: serviceName, lucro: 0, count: 0 };
        }
        servicesMap[serviceName].lucro += lucroFinal;
        servicesMap[serviceName].count += 1;
      });

      const sortedServices = Object.values(servicesMap)
        .sort((a, b) => b.lucro - a.lucro)
        .slice(0, 5);

      setChartData(last7Days);
      setServicoStats(sortedServices);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 flex flex-col items-center justify-center relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full opacity-50"></div>
           <Wallet className="text-emerald-500 mb-2 h-7 w-7 z-10" />
           <p className="text-[9px] text-slate-400 font-black z-10 uppercase tracking-[0.2em]">Faturamento Bruto</p>
           <p className="text-xl font-black text-slate-800 z-10">R$ {stats.totalGanhos.toFixed(2)}</p>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center relative overflow-hidden text-center bg-rose-50/10">
           <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-bl-full opacity-50"></div>
           <TrendingUp className="text-[#f21b7f] mb-2 h-7 w-7 z-10" />
           <p className="text-[9px] text-slate-400 font-black z-10 uppercase tracking-[0.2em]">Lucro Líquido Real</p>
           <p className="text-xl font-black text-[#f21b7f] z-10">R$ {stats.lucro.toFixed(2)}</p>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50"></div>
           <Sparkles className="text-blue-500 mb-2 h-7 w-7 z-10" />
           <p className="text-[9px] text-slate-400 font-black z-10 uppercase tracking-[0.2em]">Ticket Médio</p>
           <p className="text-xl font-black text-slate-800 z-10">R$ {stats.ticketMedio.toFixed(2)}</p>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full opacity-50"></div>
           <ArrowDownRight className="text-rose-500 mb-2 h-7 w-7 z-10" />
           <p className="text-[9px] text-slate-400 font-black z-10 uppercase tracking-[0.2em]">Custo Total</p>
           <p className="text-xl font-black text-rose-500 z-10">R$ {stats.totalCusto.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-black text-slate-800 mb-6 text-center text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <TrendingUp size={14} className="text-[#f21b7f]" />
          Desempenho Semanal (Lucro)
        </h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f21b7f]"></div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f21b7f" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f21b7f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fecdd3" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#f21b7f', fontSize: 10, fontWeight: 'bold'}} 
                  dy={10} 
                  style={{ textTransform: 'capitalize' }}
                />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(242, 27, 127, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                   itemStyle={{ color: '#f21b7f', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="lucro" stroke="#f21b7f" strokeWidth={4} fillOpacity={1} fill="url(#colorLucro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-black text-slate-800 mb-6 text-center text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <PieChart size={14} className="text-[#f21b7f]" />
          Carro-Chefe (Lucratividade)
        </h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f21b7f]"></div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={servicoStats}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{fill: '#64748b', fontSize: 9, fontWeight: 'bold'}}
                  width={80}
                />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="lucro" radius={[0, 10, 10, 0]} barSize={20}>
                  {servicoStats.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f21b7f' : '#fda4af'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
