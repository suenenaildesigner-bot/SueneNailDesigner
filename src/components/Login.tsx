import React, { useState } from 'react';
import { supabase, checkSupabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSupabase()) {
      onLogin();
      return;
    }

    setLoading(true);
    setError('');
    
    const { error: authError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      onLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-[380px] bg-white/75 backdrop-blur-[20px] px-8 py-10 rounded-[40px] flex flex-col items-center text-center shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-white/40 animate-in fade-in zoom-in duration-500">
        
        <div className="w-40 h-40 flex items-center justify-center mb-4">
          <img 
            src="/logo2.png" 
            alt="Suene Nail Designer Logo" 
            className="w-full h-full object-contain filter drop-shadow-sm" 
            onError={(e) => (e.currentTarget.src = 'https://api.iconify.design/lucide:sparkles.svg?color=%23f21b7f')}
          />
        </div>

        <h1 className="text-[40px] font-bold text-[#e81977] leading-tight mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>Suene Nail</h1>
        <p className="text-slate-500 text-[10px] mb-8 font-black uppercase tracking-[0.4em] opacity-80">Designer</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-semibold animate-in shake duration-300">
              {error}
            </div>
          )}
          
          <div className="w-full">
            <input
              type="email"
              required
              className="input-glass"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="input-glass pr-12"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#f21b7f] hover:bg-[#d81570] text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-[0.98] mt-2 text-[18px] disabled:opacity-70"
          >
            {loading ? 'Acessando...' : 'Acessar Painel'}
          </button>
        </form>

        {!checkSupabase() && (
           <p className="mt-8 text-[11px] text-gray-400 uppercase tracking-widest font-bold">
             * Modo Demonstração Ativado
           </p>
        )}
      </div>
      
      <p className="fixed bottom-8 text-[11px] text-white/80 uppercase tracking-widest font-bold">
        V 2.1 • Sistema Verificado
      </p>
    </div>
  );
}
