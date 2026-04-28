import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wallet, ArrowDownRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Relatorio() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGanhos: 0,
    totalCusto: 0,
    lucro: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

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
      
      const totalG = results.reduce((acc, curr) => acc + (curr.valor_cobrado || 0), 0);
      const totalC = results.reduce((acc, curr) => acc + (curr.custo_material || 0), 0);
      
      setStats({
        totalGanhos: totalG,
        totalCusto: totalC,
        lucro: totalG - totalC
      });

      // Group by day for the chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
          name: format(d, 'EEE', { locale: ptBR }),
          fullDate: format(d, 'yyyy-MM-dd'),
          ganhos: 0
        };
      });

      results.forEach(val => {
        const dateStr = format(new Date(val.data), 'yyyy-MM-dd');
        const dayMatch = last7Days.find(d => d.fullDate === dateStr);
        if (dayMatch) {
          dayMatch.ganhos += val.valor_cobrado || 0;
        }
      });

      setChartData(last7Days);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full opacity-50"></div>
           <Wallet className="text-emerald-500 mb-2 h-8 w-8 z-10" />
           <p className="text-[10px] text-gray-400 font-black z-10 uppercase tracking-[0.2em] text-center">Ganhos (30d)</p>
           <p className="text-xl font-bold text-slate-800 z-10">R$ {stats.totalGanhos.toFixed(2)}</p>
        </div>

        <div className="glass-card p-4 flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-bl-full opacity-50"></div>
           <TrendingUp className="text-pink-600 mb-2 h-8 w-8 z-10" />
           <p className="text-[10px] text-gray-400 font-black z-10 uppercase tracking-[0.2em] text-center">Lucro Líquido</p>
           <p className="text-xl font-bold text-pink-600 z-10">R$ {stats.lucro.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass-card p-5 flex items-center justify-between border-l-[6px] border-l-rose-500 bg-white/60">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Custo de Material Estimado</p>
          <p className="text-xl font-bold text-rose-500">R$ {stats.totalCusto.toFixed(2)}</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
          <ArrowDownRight size={24} />
        </div>
      </div>

      <div className="glass-card p-4 pt-6">
        <h3 className="font-bold text-slate-700 mb-6 text-center text-[10px] uppercase tracking-[0.3em]">Desempenho Semanal</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="ganhos" stroke="#f21b7f" strokeWidth={4} fillOpacity={1} fill="url(#colorGanhos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
