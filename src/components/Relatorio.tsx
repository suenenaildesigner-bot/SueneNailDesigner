import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wallet, ArrowDownRight } from 'lucide-react';

export function Relatorio() {
  // Dummy data
  const data = [
    { name: 'Seg', ganhos: 150, despesas: 20 },
    { name: 'Ter', ganhos: 230, despesas: 0 },
    { name: 'Qua', ganhos: 340, despesas: 90 }, // Comprado gel
    { name: 'Qui', ganhos: 280, despesas: 10 },
    { name: 'Sex', ganhos: 410, despesas: 0 },
    { name: 'Sáb', ganhos: 550, despesas: 30 },
  ];

  const totalGanhos = data.reduce((acc, curr) => acc + curr.ganhos, 0);
  const totalDespesas = data.reduce((acc, curr) => acc + curr.despesas, 0);
  const lucroLiquido = totalGanhos - totalDespesas;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50"></div>
           <Wallet className="text-green-500 mb-2 h-8 w-8 z-10" />
           <p className="text-xs text-gray-500 font-semibold z-10 uppercase tracking-widest text-center">Ganhos</p>
           <p className="text-xl font-bold text-gray-800 z-10">R$ {totalGanhos.toFixed(2)}</p>
        </div>

        <div className="glass-card p-4 flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-pink-100 rounded-bl-full opacity-50"></div>
           <TrendingUp className="text-pink-600 mb-2 h-8 w-8 z-10" />
           <p className="text-xs text-gray-500 font-semibold z-10 uppercase tracking-widest text-center">Lucro</p>
           <p className="text-xl font-bold text-pink-600 z-10">R$ {lucroLiquido.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-4 flex items-center justify-between border-l-4 border-l-red-400">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Custo de Material</p>
          <p className="text-lg font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <ArrowDownRight className="text-red-400 opacity-50 h-8 w-8" />
      </div>

      <div className="glass-card p-4 pt-6">
        <h3 className="font-semibold text-gray-700 mb-6 text-center text-sm uppercase tracking-widest">Desempenho da Semana</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1493" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF1493" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                 itemStyle={{ color: '#FF1493', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="ganhos" stroke="#FF1493" strokeWidth={3} fillOpacity={1} fill="url(#colorGanhos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
