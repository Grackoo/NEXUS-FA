import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LogOut, RefreshCw, User, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <nav className="flex items-center justify-between px-8 py-6 sticky top-0 z-50 bg-[#0B0B0B]/50 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <div className="bg-primary-blue w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(26,92,255,0.5)]">
          N
        </div>
        <h2 className="text-xl font-bold tracking-tight hidden sm:block">NEXUS FA</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Currency Switcher */}
        <button 
          onClick={toggleCurrency}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currency === 'USD' ? 'bg-[#1A5CFF] text-white' : 'bg-transparent text-gray-400'}`}>
            USD
          </div>
          <RefreshCw className="w-3 h-3 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currency === 'MXN' ? 'bg-[#1A5CFF] text-white' : 'bg-transparent text-gray-400'}`}>
            MXN
          </div>
        </button>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Inversionista'}</p>
          </div>
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
              <User className="w-5 h-5" />
            </div>
            
            {/* Popover/Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 py-2 glass-card opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform scale-95 group-hover:scale-100 origin-top-right">
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <p className="text-xs text-gray-500">Mi Cuenta</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                <Settings className="w-4 h-4" /> Configuración
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-crimson hover:bg-crimson/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
