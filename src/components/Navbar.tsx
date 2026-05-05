import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { LogOut, RefreshCw, Settings, ShieldCheck, TrendingUp, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout, isPrivacyMode, togglePrivacyMode } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Mercados', path: '/markets', icon: <TrendingUp className="w-4 h-4" /> },
  ];
  if (user?.role === 'admin') {
    navLinks.unshift({ name: 'Panel Admin', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> });
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(26,92,255,0.4)] transition-all duration-300">
            N
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tighter text-white leading-none">NEXUS FA</h2>
            <p className="hidden md:block text-[10px] text-white/40 uppercase tracking-widest mt-1">Wealth Management</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(link => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-x-8">
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
          
          {/* Privacy Toggle */}
          <button 
            onClick={togglePrivacyMode}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-all text-gray-400 hover:text-white"
            title={isPrivacyMode ? "Desactivar Modo Privacidad" : "Activar Modo Privacidad"}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white tracking-tight">{user?.name}</p>
              <div className="flex items-center justify-end gap-1">
                 {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-primary" />}
                 <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium leading-none">{user?.role === 'admin' ? 'Admin' : 'Inversionista'}</p>
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
                
                {/* Mobile Links */}
                <div className="lg:hidden px-2 mb-2 space-y-1">
                  {navLinks.map(link => (
                    <Link 
                      key={link.path}
                      to={link.path}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs hover:bg-white/[0.05] text-white transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
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
