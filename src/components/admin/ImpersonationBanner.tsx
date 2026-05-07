import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ImpersonationBanner: React.FC = () => {
  const { isAdminImpersonating, stopImpersonating, user } = useAuth();
  const navigate = useNavigate();

  if (!isAdminImpersonating || !user) return null;

  const handleStop = () => {
    stopImpersonating();
    navigate('/admin');
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-crimson text-white px-4 py-2 flex items-center justify-between shadow-lg shadow-crimson/20 border-b border-crimson/50 animate-fade-in">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Modo Visualización de Cliente Activo: <span className="text-white/80">{user.name}</span>
        </p>
      </div>
      <button 
        onClick={handleStop}
        className="bg-black/20 hover:bg-black/40 transition-colors px-3 py-1.5 rounded-lg text-xs font-bold"
      >
        Salir y volver al Admin
      </button>
    </div>
  );
};

export default ImpersonationBanner;
