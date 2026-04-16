import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LogOut, RefreshCw, Settings, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 group">
          <div className="bg-primary w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(26,92,255,0.4)] transition-all duration-300">
            N
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tighter text-gradient leading-none">NEXUS FA</h2>
            <p className="hidden md:block text-[9px] text-gray-500 uppercase tracking-widest mt-1">Wealth Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          {/* Currency Switcher */}
          <button 
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.05] border border-white/[0.1] hover:border-white/[0.2] transition-all group"
          >
            <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-primary text-white' : 'text-gray-500'}`}>
              USD
            </div>
            <RefreshCw className="w-3 md:w-3.5 h-3 md:h-3.5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
            <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${currency === 'MXN' ? 'bg-primary text-white' : 'text-gray-500'}`}>
              MXN
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-bold tracking-tight">{user?.name}</p>
              <div className="flex items-center justify-end gap-1">
                 {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-primary" />}
                 <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest leading-none">{user?.role === 'admin' ? 'Admin' : 'Inversionista'}</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.[0] || '?'}
                </div>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-3 w-48 md:w-56 py-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform origin-top-right z-50">
                <div className="px-5 py-2 border-b border-white/5 mb-2 sm:hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">{user?.role === 'admin' ? 'Admin' : 'Inversionista'}</p>
                </div>
                <div className="px-5 py-2 mb-1">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cuenta</p>
                </div>
                <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs md:text-sm hover:bg-white/[0.05] transition-colors group/item">
                  <Settings className="w-4 h-4 text-gray-500 group-hover/item:text-primary" />
                  Configuración
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-xs md:text-sm text-crimson hover:bg-crimson/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
