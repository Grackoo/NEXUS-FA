import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ShieldCheck, User as UserIcon } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified logic: identify user by email for demo
    if (email.includes('admin')) {
      login('admin-1');
    } else if (email.includes('aldo')) {
      login('client-2');
    } else {
      login('client-1'); // Default to Aketzali
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0B0B]">
      <div className="glass-card w-full max-w-md animate-fade-in text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">NEXUS FA</h1>
          <p className="text-gray-400 font-medium">Advanced Wealth Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Usuario / Email</label>
            <div className="relative">
              <input 
                type="email" 
                className="glass-input pl-10" 
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Contraseña</label>
            <div className="relative">
              <input 
                type="password" 
                className="glass-input pl-10" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <button type="submit" className="glass-button w-full flex items-center justify-center gap-2 mt-4 group">
            Ingresar al Portal
            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            Nexus FA (V2.0) - Acceso Seguro Multi-Nivel
          </p>
          <div className="flex justify-center gap-4">
            {/* Quick Login Buttons for Demo */}
            <button onClick={() => login('admin-1')} className="text-[10px] text-gray-600 hover:text-white transition-colors">Demo Admin</button>
            <button onClick={() => login('client-1')} className="text-[10px] text-gray-600 hover:text-white transition-colors">Demo Cliente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
