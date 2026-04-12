import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Shield, Lock, ChevronRight, Globe, TrendingUp } from 'lucide-react';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(userId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020202] relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rotate-45 pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 group">
          <div className="w-20 h-20 rounded-[28px] bg-primary flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(26,92,255,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            <span className="text-4xl font-black">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-gradient leading-tight">NEXUS FA</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 font-medium">Digital Wealth Management</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 space-y-8 animate-fade-in shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold tracking-tight">Acceso Exclusivo</h2>
            <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
               <Shield className="w-3 h-3 text-primary" /> Sistema de Gestión de Activos
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between ml-1">
                Identificación de Cliente
                <Lock className="w-3 h-3 opacity-30" />
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  autoFocus
                  className="glass-input pl-12 text-center" 
                  placeholder="ID DE SOCIO" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <button type="submit" className="glass-button w-full shadow-[0_0_30px_rgba(26,92,255,0.3)] group h-14">
              INGRESAR A CARTERA
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-6 text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Markets</span>
                <span className="opacity-30">•</span>
                <span>Security</span>
                <span className="opacity-30">•</span>
                <span>Insight</span>
             </div>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-10 uppercase tracking-widest font-medium">© 2026 NEXUX Financial Architecture. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
