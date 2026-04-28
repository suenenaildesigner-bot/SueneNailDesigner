import React, { useState } from 'react';
import { supabase, checkSupabase } from '../lib/supabase';
import { Mail, Lock, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSupabase()) {
      // Allow bypass for demo / preview if no Supabase configured
      onLogin();
      return;
    }

    setLoading(true);
    setError('');
    
    // In actual implementation with Supabase:
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onLogin(); // Proceed to dashboard
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-[90%] max-w-[360px] bg-white/20 backdrop-blur-xl px-8 pt-10 pb-12 rounded-[32px] flex flex-col items-center shadow-[0_8px_32px_rgba(255,20,147,0.2)] border border-white/50 text-center">
        
        <h1 className="text-[38px] font-bold text-[#e81977] mb-10 leading-tight" style={{ fontFamily: "'Dancing Script', cursive" }}>SueneNailDesigner</h1>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {error && <div className="p-3 bg-red-100/80 backdrop-blur-md text-red-600 border border-red-200 rounded-xl text-sm">{error}</div>}
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-[20px] w-[20px] text-[#e81977] stroke-[1.5]" />
            </div>
            <input
              type="email"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-[16px] text-gray-900 placeholder-gray-600 focus:outline-none focus:border-[#f21b7f] focus:bg-white/60 focus:ring-1 focus:ring-[#f21b7f] transition-all text-[15px] shadow-sm"
              placeholder="Seu E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-[20px] w-[20px] text-[#e81977] stroke-[1.5]" />
            </div>
            <input
              type="password"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-[16px] text-gray-900 placeholder-gray-600 focus:outline-none focus:border-[#f21b7f] focus:bg-white/60 focus:ring-1 focus:ring-[#f21b7f] transition-all text-[15px] shadow-sm"
              placeholder="Sua Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#fa559f] to-[#e81977] hover:opacity-90 text-white font-semibold uppercase tracking-wide rounded-[16px] shadow-lg hover:shadow-xl transition-all mt-4 text-[15px]"
          >
            {loading ? 'Entrando...' : 'Acessar Sistema'}
          </button>
        </form>

        {!checkSupabase() && (
           <p className="mt-8 text-xs text-gray-600 text-center max-w-xs font-medium">
             * Supabase não configurado. O acesso está liberado sem banco de dados. Adicione suas credenciais no painel de Secrets.
           </p>
        )}
      </div>
    </div>
  );
}
