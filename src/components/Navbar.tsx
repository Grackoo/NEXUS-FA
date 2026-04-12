import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LogOut, RefreshCw, User, Settings, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4 group">
        <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(26,92,255,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          N
        </div>
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold tracking-tighter text-gradient leading-none">NEXUS FA</h2>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Wealth Management</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Currency Switcher */}
        <button 
          onClick={toggleCurrency}
          className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
        >
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}>
            USD
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currency === 'MXN' ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}>
            MXN
          </div>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold tracking-tight">{user?.name}</p>
            <div className="flex items-center justify-end gap-1">
               {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-primary" />}
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user?.role === 'admin' ? 'Administrador' : 'Inversionista'}</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-xs">
                {user?.name.substring(0, 1)}
              </div>
            </div>
            
            {/* Popover/Dropdown Menu */}
            <div className="absolute right-0 mt-3 w-56 py-3 glass-card opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform origin-top-right">
              <div className="px-5 py-2 border-b border-white/5 mb-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gestión de Cuenta</p>
              </div>
              <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-white/5 transition-colors group/item">
                <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-primary/20 transition-colors">
                  <Settings className="w-4 h-4 text-gray-400 group-hover/item:text-primary" />
                </div>
                Configuración
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-crimson hover:bg-crimson/10 transition-colors group/logout"
              >
                <div className="p-1.5 rounded-lg bg-crimson/5 group-hover/logout:bg-crimson/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
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
